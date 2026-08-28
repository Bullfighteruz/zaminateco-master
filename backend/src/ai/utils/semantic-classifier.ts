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
              : SearchReason.SEMANTIC_CLASSIFIER_NOT_NEEDED,
            originalMessage: raw,
            interpretedIntent: result.intent,
            normalizedMeaning: result.normalizedMeaning,
            searchQuery: result.searchQuery || raw,
            confidence: result.confidence || 0.9,
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

    const parsed = JSON.parse(text);
    if (
      parsed &&
      typeof parsed.requiresFreshExternalData === 'boolean' &&
      typeof parsed.searchMode === 'string'
    ) {
      const mode = Object.values(SearchMode).includes(parsed.searchMode as SearchMode)
        ? (parsed.searchMode as SearchMode)
        : parsed.requiresFreshExternalData
        ? SearchMode.REQUIRED
        : SearchMode.NOT_NEEDED;

      return {
        intent: parsed.intent || 'general_knowledge',
        searchMode: mode,
        requiresFreshExternalData: parsed.requiresFreshExternalData,
        normalizedMeaning: String(parsed.normalizedMeaning || message).slice(0, 200),
        searchQuery: String(parsed.searchQuery || message).slice(0, 200),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      };
    }

    return null;
  }

  /**
   * Robust local semantic heuristic analysis for unfamiliar phrases and semantic structures.
   */
  static classifyHeuristic(raw: string, historyContext?: string): SearchRouteResult {
    const lower = raw.toLowerCase().trim();

    // 1. Live Public Metrics & Rates (Crypto, Currencies, Stock, Commodities, Gas, Prices)
    const isLiveMarket =
      /\b(биток|биткоин|bitcoin|btc|dollar|доллар|доллара|евро|euro|gold|золото|золота|нефть|oil|kursi|narxi|price|цена|стоимость|курс)\b/i.test(lower) &&
      /\b(сколько|какой|какая|курс|цена|сейчас|сегодня|почем|скока|bugun|hozir|qancha|current|today|rn|rate|cost)\b/i.test(lower);

    if (isLiveMarket) {
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
    const isLeaderQuery =
      /\b(президент|глава|мэр|министр|директор|руководитель|ceo|president|leader|head|boshqaruvchi|prezident|rahbar)\b/i.test(lower) &&
      /\b(кто|сейчас|нынешний|текущий|who|current|now|kim|hozir|hozirgi)\b/i.test(lower);

    if (isLeaderQuery) {
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
    const isOperatingStatus =
      /\b(еще работает|ещё работает|все еще работает|закрылась|банкрот|still operating|still in business|is open today|ishlayaptimi|faoliyat yurityaptimi)\b/i.test(lower);

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
    const isScheduleOrSports =
      /\b(следующий матч|когда матч|кто выиграл|счет матча|рейсы в|расписание|next match|who won|match score|flight schedule|keyingi o'yin|kim yutdi|reyslar)\b/i.test(lower);

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
    const isRecentUpdate =
      /\b(что изменилось|что нового|свежая инфа|какие гранты|what changed|latest update|recent updates|open grants|nima o'zgardi|yangi grantlar)\b/i.test(lower);

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
