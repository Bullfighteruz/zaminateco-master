import { SearchMode, SearchReason, SearchRouteResult } from './search-types';
import { UserMessageInterpreter } from './user-message-interpreter';
import { SearchQueryBuilder } from './search-query-builder';
import { SemanticClassifier } from './semantic-classifier';
import { ChatHistoryItemDto } from '../dto/chat.dto';

export * from './search-types';

export class SearchRouter {
  /**
   * Evaluates whether a user message requires external web search grounding.
   * Employs hybrid Layer 1 (deterministic fast routing) + Layer 2 (semantic intent classification).
   */
  static evaluate(
    message: string,
    history?: ChatHistoryItemDto[],
    userInfo?: Record<string, any>,
  ): SearchRouteResult {
    const fastResult = this.evaluateFast(message, history, userInfo);
    if (!fastResult.isUncertain) {
      return fastResult;
    }

    // Layer 2: Fast local semantic heuristic classification for unseen structures
    const historyContext = this.extractHistoryContext(history);
    return SemanticClassifier.classifyHeuristic(message, historyContext);
  }

  /**
   * Asynchronous evaluation that leverages structured LLM classification when Layer 1 is uncertain.
   */
  static async evaluateSemantic(
    message: string,
    history?: ChatHistoryItemDto[],
    userInfo?: Record<string, any>,
    apiKey?: string,
  ): Promise<SearchRouteResult> {
    const fastResult = this.evaluateFast(message, history, userInfo);
    if (!fastResult.isUncertain) {
      return fastResult;
    }

    const historyContext = this.extractHistoryContext(history);
    return SemanticClassifier.classify(message, historyContext, apiKey);
  }

  /**
   * Layer 1: Fast deterministic intent evaluation for obvious and unambiguous cases.
   */
  static evaluateFast(
    message: string,
    history?: ChatHistoryItemDto[],
    userInfo?: Record<string, any>,
  ): SearchRouteResult {
    const raw = (message || '').trim();
    if (!raw) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.GENERAL_NO_SEARCH,
        originalMessage: '',
        confidence: 1.0,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // Build immediate conversation context string from the last turns
    const historyContext = this.extractHistoryContext(history);
    const userLocation = typeof userInfo?.location === 'string' ? userInfo.location : undefined;

    // 1. Semantic Input Interpretation (tolerant to typos, informal language, mixed scripts)
    const interpreted = UserMessageInterpreter.interpret(raw, historyContext);

    // 2. High-Confidence Negative Guard: Greetings & Conversational Pleasantries
    if (interpreted.isGreeting) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.CONVERSATIONAL_GREETING,
        originalMessage: raw,
        interpretedIntent: 'greeting',
        confidence: 1.0,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 3. High-Confidence Negative Guard: Actual Private System / Infrastructure Access Intent
    if (interpreted.isPrivateSystemQuery) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.INTERNAL_ONLY,
        reason: SearchReason.PRIVATE_SYSTEM_QUERY,
        originalMessage: raw,
        interpretedIntent: 'private_system_query',
        confidence: 1.0,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 4. User Profile & Internal EcoCoins / Progress Queries
    if (interpreted.isProfileQuery) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.INTERNAL_ONLY,
        reason: SearchReason.INTERNAL_USER_PROFILE,
        originalMessage: raw,
        interpretedIntent: 'user_profile_progress',
        confidence: 0.98,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 5. Source Challenge with Provenance Awareness ("откуда эта информация?", "где пруфы", "where did you get that?")
    if (interpreted.isSourceChallenge) {
      // Check provenance in historyContext
      const provenance = this.resolveSourceProvenance(historyContext);
      if (provenance === 'account') {
        return {
          shouldSearch: false,
          searchMode: SearchMode.INTERNAL_ONLY,
          reason: SearchReason.ACCOUNT_PROVENANCE,
          originalMessage: raw,
          interpretedIntent: 'account_profile_provenance',
          confidence: 0.95,
          isUncertain: false,
          layer: 'layer1_fast',
        };
      }
      if (provenance === 'platform') {
        return {
          shouldSearch: false,
          searchMode: SearchMode.INTERNAL_ONLY,
          reason: SearchReason.PLATFORM_PROVENANCE,
          originalMessage: raw,
          interpretedIntent: 'platform_guidelines_provenance',
          confidence: 0.95,
          isUncertain: false,
          layer: 'layer1_fast',
        };
      }

      // External factual claim -> Web search grounding is REQUIRED
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.SOURCE_CHALLENGE,
        originalMessage: raw,
        interpretedIntent: 'source_challenge_verification',
        searchQuery: query,
        confidence: 0.95,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 6. Public Software & Technical Documentation Inquiries (e.g. "найди документацию Supabase по RLS")
    if (interpreted.isPublicDocQuery) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.PUBLIC_DOCUMENTATION,
        originalMessage: raw,
        interpretedIntent: 'public_software_documentation',
        searchQuery: query,
        confidence: 0.96,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 7. Explicit Web Search Request (User asks "найди в интернете...", "поищи исследования...", "find online...")
    if (interpreted.isExplicitSearch) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.EXPLICIT_SEARCH_REQUEST,
        originalMessage: raw,
        interpretedIntent: 'explicit_web_search',
        searchQuery: query,
        confidence: 0.99,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 8. Static Educational Definitions WITHOUT time triggers (e.g. "Что такое PET?", "объясни что такое AQI", "What is circular economy?")
    if (interpreted.isStaticDefinition) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.STATIC_EDUCATIONAL_CONCEPT,
        originalMessage: raw,
        interpretedIntent: 'static_educational_concept',
        confidence: 0.95,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 9. Real-Time / Current Air Quality & AQI & Pollution
    if (interpreted.isAirQualityQuery) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_AIR_QUALITY,
        originalMessage: raw,
        interpretedIntent: 'current_air_quality_aqi',
        searchQuery: query,
        confidence: 0.98,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 10. Real-Time / Current Weather
    if (interpreted.isWeatherQuery) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_WEATHER,
        originalMessage: raw,
        interpretedIntent: 'current_weather_forecast',
        searchQuery: query,
        confidence: 0.98,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 11. Recent Legislation, Decrees, Environmental Regulations & Breaking News
    if (interpreted.isNewsOrRegulationQuery) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.RECENT_REGULATION_NEWS,
        originalMessage: raw,
        interpretedIntent: 'environmental_regulation_news',
        searchQuery: query,
        confidence: 0.95,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 12. General Current Public Facts (leaders, market prices, sports, company status, travel, grants)
    if (interpreted.isCurrentFactQuery) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CURRENT_PUBLIC_FACT,
        originalMessage: raw,
        interpretedIntent: 'current_public_fact',
        searchQuery: query,
        confidence: 0.94,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 13. Research & Scientific / Technical Evidence
    if (interpreted.isResearchQuery) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.PREFERRED,
        reason: SearchReason.RESEARCH_EVIDENCE,
        originalMessage: raw,
        interpretedIntent: 'scientific_technical_research',
        searchQuery: query,
        confidence: 0.90,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // 14. Contextual Follow-Up Resolution using History
    if (historyContext && this.isContextualFollowUp(interpreted.normalized)) {
      const contextualInterpretation = this.resolveFollowUpWithHistory(interpreted.normalized, historyContext, userLocation);
      if (contextualInterpretation.shouldSearch) {
        return {
          ...contextualInterpretation,
          isUncertain: false,
          layer: 'layer1_fast',
        };
      }
    }

    // 15. Static ZAMINAT Platform Concepts (without real-time markers)
    if (interpreted.isPlatformConcept) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.ZAMINAT_PLATFORM_CONCEPT,
        originalMessage: raw,
        interpretedIntent: 'zaminat_platform_concept',
        confidence: 0.98,
        isUncertain: false,
        layer: 'layer1_fast',
      };
    }

    // Layer 1 is uncertain — flag for Layer 2 semantic intent classification
    return {
      shouldSearch: false,
      searchMode: SearchMode.NOT_NEEDED,
      reason: SearchReason.GENERAL_NO_SEARCH,
      originalMessage: raw,
      confidence: 0.5,
      isUncertain: true,
      layer: 'layer1_fast',
    };
  }

  private static resolveSourceProvenance(historyContext?: string): 'account' | 'platform' | 'external' {
    if (!historyContext) return 'external';
    const lower = historyContext.toLowerCase();

    if (
      lower.includes('ecocoin') ||
      lower.includes('экокоин') ||
      lower.includes('tangalar') ||
      lower.includes('балл') ||
      lower.includes('ball') ||
      lower.includes('очк') ||
      lower.includes('level') ||
      lower.includes('уровень') ||
      lower.includes('daraja') ||
      lower.includes('darajam') ||
      lower.includes('profile') ||
      lower.includes('профиль') ||
      lower.includes('profil')
    ) {
      return 'account';
    }
    if (lower.includes('ecoscan') || lower.includes('ecomap') || lower.includes('ecovote') || lower.includes('ecotile')) {
      return 'platform';
    }
    return 'external';
  }

  private static extractHistoryContext(history?: ChatHistoryItemDto[]): string | undefined {
    if (!Array.isArray(history) || history.length === 0) {
      return undefined;
    }
    const recent = history.slice(-4);
    const parts: string[] = [];
    for (const item of recent) {
      if (!item) continue;
      const role = item.role || 'user';
      let txt = '';
      if (Array.isArray(item.parts)) {
        txt = item.parts.map(p => p?.text || '').join(' ').trim();
      } else if (typeof (item as any).content === 'string') {
        txt = (item as any).content.trim();
      }
      if (txt) {
        parts.push(`${role}: ${txt}`);
      }
    }
    return parts.length > 0 ? parts.join('\n') : undefined;
  }

  private static isContextualFollowUp(normalized: string): boolean {
    const followUpTriggers = [
      'а завтра', 'а вчера', 'а сейчас', 'а в самарканде', 'а в ташкенте', 'а в бухаре',
      'ertaga chi', 'ertagachi', 'ertaga', 'samarqandda chi', 'toshkentda chi', 'what about tomorrow',
      'what about samarkand', 'what about tashkent', 'найди еще', 'найди ещё',
      'покажи еще', 'покажи ещё', 'покажи официальный источник', 'дай больше инфы',
      'а где его принимают', 'куда сдать сегодня', 'это опасно детям',
    ];
    return followUpTriggers.some(t => normalized.includes(t)) ||
      /^(а\s+|what\s+about\s+|va\s+|ertaga)/i.test(normalized) ||
      /\bchi$/i.test(normalized);
  }

  private static resolveFollowUpWithHistory(
    normalized: string,
    historyContext: string,
    userLocation?: string,
  ): SearchRouteResult {
    const lowerHist = historyContext.toLowerCase();

    // Prior context about Air Quality / AQI
    if (lowerHist.includes('aqi') || lowerHist.includes('воздух') || lowerHist.includes('havo') || lowerHist.includes('air quality')) {
      let targetLoc = userLocation || 'Tashkent';
      if (normalized.includes('самарканд') || normalized.includes('samarkand') || normalized.includes('samarqand')) targetLoc = 'Samarkand';
      if (normalized.includes('бухар') || normalized.includes('bukhara')) targetLoc = 'Bukhara';
      if (normalized.includes('ташкент') || normalized.includes('tashkent') || normalized.includes('toshkent')) targetLoc = 'Tashkent';

      const isTomorrow = normalized.includes('завтра') || normalized.includes('tomorrow') || normalized.includes('ertaga');
      const timeStr = isTomorrow ? 'forecast tomorrow' : 'today current';

      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CONTEXTUAL_FOLLOW_UP,
        originalMessage: normalized,
        interpretedIntent: 'contextual_air_quality_follow_up',
        searchQuery: `${targetLoc} air quality AQI ${timeStr}`,
        confidence: 0.92,
      };
    }

    // Prior context about a Regulation / Law
    if (lowerHist.includes('закон') || lowerHist.includes('указ') || lowerHist.includes('qonun') || lowerHist.includes('regulation') || lowerHist.includes('legislation')) {
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.CONTEXTUAL_FOLLOW_UP,
        originalMessage: normalized,
        interpretedIntent: 'contextual_regulation_follow_up',
        searchQuery: `Uzbekistan environmental legislation official source`,
        confidence: 0.90,
      };
    }

    return {
      shouldSearch: false,
      searchMode: SearchMode.NOT_NEEDED,
      reason: SearchReason.GENERAL_NO_SEARCH,
      originalMessage: normalized,
      confidence: 0.70,
    };
  }
}
