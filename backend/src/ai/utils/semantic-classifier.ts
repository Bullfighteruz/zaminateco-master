import { SearchMode, SearchReason, SearchRouteResult } from './search-types';
import { GoogleGenAI } from '@google/genai';

export interface SemanticClassifierOutput {
  intent: 'current_public_fact' | 'general_knowledge' | 'opinion_or_creative' | 'private_system';
  searchMode: SearchMode;
  requiresFreshExternalData: boolean;
  normalizedMeaning: string;
  searchQuery: string;
  confidence: number;
}

export class SemanticClassifier {
  private static readonly CLASSIFIER_SYSTEM_PROMPT = `You are a Search Intent Classifier for an intelligent assistant.
Your task is to classify whether a user query requires fresh external web search grounding (e.g. current real-time metrics, live market prices, current public figures/leaders, live company status, match schedules/results, breaking news, fresh software updates) OR if it is general knowledge / static conversation.

Return ONLY strict valid JSON without code fences or formatting:
{
  "intent": "current_public_fact" | "general_knowledge" | "opinion_or_creative" | "private_system",
  "searchMode": "REQUIRED" | "PREFERRED" | "NOT_NEEDED" | "INTERNAL_ONLY",
  "requiresFreshExternalData": boolean,
  "normalizedMeaning": "concise description of query meaning",
  "searchQuery": "concise clean search query for web search",
  "confidence": 0.95
}`;

  private static readonly ALLOWED_INTENTS = new Set([
    'current_public_fact',
    'general_knowledge',
    'opinion_or_creative',
    'private_system',
  ]);

  /**
   * Performs semantic classification using Gemini when available, or falls back to robust local semantic heuristics.
   */
  static async classify(
    rawMessage: string,
    historyContext?: string,
    apiKey?: string,
  ): Promise<SearchRouteResult> {
    const raw = (rawMessage || '').trim();

    // If API key is available, attempt structured LLM classification
    if (apiKey && apiKey !== 'your-gemini-api-key-here' && apiKey !== 'test-dummy-gemini-key') {
      try {
        const result = await this.classifyWithModel(raw, historyContext, apiKey);
        if (result) {
          return {
            shouldSearch: result.searchMode === SearchMode.REQUIRED || result.searchMode === SearchMode.PREFERRED,
            searchMode: result.searchMode,
            reason: result.searchMode === SearchMode.REQUIRED
              ? SearchReason.SEMANTIC_CLASSIFIER_REQUIRED
              : result.searchMode === SearchMode.PREFERRED
              ? SearchReason.SEMANTIC_CLASSIFIER_PREFERRED
              : result.searchMode === SearchMode.INTERNAL_ONLY
              ? SearchReason.PRIVATE_SYSTEM_QUERY
              : SearchReason.SEMANTIC_CLASSIFIER_NOT_NEEDED,
            originalMessage: raw,
            interpretedIntent: result.intent,
            normalizedMeaning: result.normalizedMeaning,
            searchQuery: result.searchQuery || raw,
            confidence: result.confidence,
            layer: 'layer2_semantic',
          };
        }
      } catch {
        // Fallback to local heuristic classifier on network/API failure
      }
    }

    // Fast deterministic semantic heuristic fallback
    return this.classifyHeuristic(raw, historyContext);
  }

  /**
   * Lightweight structured Gemini call for semantic intent classification.
   */
  private static async classifyWithModel(
    message: string,
    historyContext?: string,
    apiKey?: string,
  ): Promise<SemanticClassifierOutput | null> {
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Classify user query: "${message}"${historyContext ? `\nRecent Context: "${historyContext}"` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      config: {
        systemInstruction: this.CLASSIFIER_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        maxOutputTokens: 250,
      },
      contents: [prompt],
    });

    const text = (response.text || '').trim();
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      return this.validateOutput(parsed, message);
    } catch {
      return null;
    }
  }

  /**
   * Strict runtime validation for semantic classifier output.
   */
  static validateOutput(parsed: any, originalMessage: string): SemanticClassifierOutput | null {
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    // 1. Validate intent
    const rawIntent = typeof parsed.intent === 'string' ? parsed.intent.trim().toLowerCase() : '';
    if (!this.ALLOWED_INTENTS.has(rawIntent)) {
      return null;
    }
    const intent = rawIntent as SemanticClassifierOutput['intent'];

    // 2. Validate requiresFreshExternalData
    if (typeof parsed.requiresFreshExternalData !== 'boolean') {
      return null;
    }
    const requiresFreshExternalData = parsed.requiresFreshExternalData;

    // 3. Validate searchMode enum value
    const rawMode = typeof parsed.searchMode === 'string' ? parsed.searchMode.trim().toUpperCase() : '';
    if (!Object.values(SearchMode).includes(rawMode as SearchMode)) {
      return null;
    }
    let searchMode = rawMode as SearchMode;

    // 4. Consistency checks
    // If requiresFreshExternalData is true, mode must NOT be NOT_NEEDED
    if (requiresFreshExternalData && searchMode === SearchMode.NOT_NEEDED) {
      searchMode = SearchMode.REQUIRED;
    }

    // INTERNAL_ONLY is only accepted when intent is private_system
    if (searchMode === SearchMode.INTERNAL_ONLY && intent !== 'private_system') {
      searchMode = requiresFreshExternalData ? SearchMode.REQUIRED : SearchMode.NOT_NEEDED;
    }

    // If intent is private_system, mode should be INTERNAL_ONLY
    if (intent === 'private_system') {
      searchMode = SearchMode.INTERNAL_ONLY;
    }

    // 5. Validate confidence
    let confidence = typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
      ? parsed.confidence
      : 0.9;
    confidence = Math.max(0.0, Math.min(1.0, confidence));

    // 6. Sanitize strings (strip control characters and length bound to 200)
    const rawMeaning = typeof parsed.normalizedMeaning === 'string' ? parsed.normalizedMeaning : originalMessage;
    const normalizedMeaning = rawMeaning
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    const rawQuery = typeof parsed.searchQuery === 'string' ? parsed.searchQuery : originalMessage;
    const searchQuery = rawQuery
      .replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    return {
      intent,
      searchMode,
      requiresFreshExternalData,
      normalizedMeaning: normalizedMeaning || originalMessage.slice(0, 200),
      searchQuery: searchQuery || originalMessage.slice(0, 200),
      confidence,
    };
  }

  /**
   * Robust local semantic heuristic analysis for unfamiliar phrases and semantic structures.
   */
  static classifyHeuristic(raw: string, historyContext?: string): SearchRouteResult {
    const lower = raw.toLowerCase().trim();

    // 1. Live Public Metrics & Rates (Crypto, Currencies, Stock, Commodities, Gas, Prices)
    const hasMarketAsset = /(?:биток|биткоин|биткоины|bitcoin|bitcon|btc|dollar|доллар|доллара|евро|euro|gold|золото|золота|нефть|oil|нефти|барель|баррель|серебро|серебра|silver|kursi|narxi|price|prize|цена|стоимость|курс)/i.test(lower);
    const hasMarketPriceTrigger = /(?:сколько|какой|какая|курс|цена|сейчас|сичас|сегодня|сиводня|севодня|почем|почём|скока|bugun|hozir|qancha|current|curent|today|rn|rate|cost|wot|what|нынче)/i.test(lower);

    if (hasMarketAsset && hasMarketPriceTrigger) {
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_PUBLIC_FACT,
        originalMessage: raw,
        interpretedIntent: 'live_market_price_query',
        normalizedMeaning: 'Current market rate or commodity price',
        searchQuery: `${raw} current price live`,
        confidence: 0.94,
        layer: 'layer2_semantic',
      };
    }

    // 2. Current Leadership, Management, Office Holders
    const hasLeaderNoun = /(?:президент|призидент|глава|мэр|министр|директор|руководитель|рулит|ceo|president|prezident|leader|head|boshqaruvchi|rahbar|руководство)/i.test(lower);
    const hasLeaderTimeTrigger = /(?:кто|сейчас|сичас|нынешний|текущий|who|current|curent|now|rn|kim|hozir|hozirgi|нынче|поменялось)/i.test(lower);

    if (hasLeaderNoun && hasLeaderTimeTrigger) {
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_PUBLIC_FACT,
        originalMessage: raw,
        interpretedIntent: 'current_leadership_query',
        normalizedMeaning: 'Current leader or public office holder',
        searchQuery: `${raw} current official`,
        confidence: 0.95,
        layer: 'layer2_semantic',
      };
    }

    // 3. Live Business Status / Operating Condition
    const isOperatingStatus = /(?:еще работает|ещё работает|все еще работает|закрылась|банкрот|still operating|still in business|is open today|ishlayaptimi|ishlayabdimi|faoliyat yurityaptimi|что там теперь с)/i.test(lower);

    if (isOperatingStatus) {
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_PUBLIC_FACT,
        originalMessage: raw,
        interpretedIntent: 'company_operating_status',
        normalizedMeaning: 'Company current operational status',
        searchQuery: `${raw} status official`,
        confidence: 0.92,
        layer: 'layer2_semantic',
      };
    }

    // 4. Live Sports, Events, Flights, Schedules
    const isScheduleOrSports = /(?:следующий матч|когда матч|кто выиграл|счет матча|рейсы в|расписание|next match|who won|match score|flight schedule|keyingi o'yin|kim yutdi|reyslar|кто в итоге вчера победил|улететь)/i.test(lower);

    if (isScheduleOrSports) {
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_PUBLIC_FACT,
        originalMessage: raw,
        interpretedIntent: 'live_sports_travel_schedule',
        normalizedMeaning: 'Sports match result or live travel schedule',
        searchQuery: `${raw} latest schedule results`,
        confidence: 0.93,
        layer: 'layer2_semantic',
      };
    }

    // 5. Recent Changes, Releases, Tech Updates, Grants
    const isRecentUpdate = /(?:что изменилось|что нового|свежая инфа|какие гранты|what changed|latest update|recent updates|open grants|nima o'zgardi|yangi grantlar|уже вышла или|программа заявок)/i.test(lower);

    if (isRecentUpdate) {
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_PUBLIC_FACT,
        originalMessage: raw,
        interpretedIntent: 'recent_update_grant_opportunity',
        normalizedMeaning: 'Recent changes, releases, or active grants',
        searchQuery: `${raw} latest updates`,
        confidence: 0.91,
        layer: 'layer2_semantic',
      };
    }

    // Default safe fallback when semantic heuristic detects general conversation
    return {
      shouldSearch: false,
      searchMode: SearchMode.NOT_NEEDED,
      reason: SearchReason.GENERAL_NO_SEARCH,
      originalMessage: raw,
      interpretedIntent: 'general_dialogue',
      confidence: 0.85,
      layer: 'deterministic_fallback',
    };
  }
}
