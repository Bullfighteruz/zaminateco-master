import { SearchMode, SearchReason, SearchRouteResult } from './search-types';
import { UserMessageInterpreter } from './user-message-interpreter';
import { SearchQueryBuilder } from './search-query-builder';
import { ChatHistoryItemDto } from '../dto/chat.dto';

export * from './search-types';

export class SearchRouter {
  /**
   * Evaluates whether a user message requires external web search grounding.
   * Employs semantic intent interpretation, typo/malformed query tolerance,
   * multi-turn conversational context resolution, and structured search routing.
   */
  static evaluate(
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
      };
    }

    // 3. High-Confidence Negative Guard: Private System / Infrastructure (never web search)
    if (interpreted.isPrivateSystemQuery) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.INTERNAL_ONLY,
        reason: SearchReason.PRIVATE_SYSTEM_QUERY,
        originalMessage: raw,
        interpretedIntent: 'private_system_query',
        confidence: 1.0,
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
      };
    }

    // 5. Source Challenge (User asks "откуда эта информация?", "где пруфы", "where did you get that?", "manbasi nima")
    // MUST trigger web grounding to verify / retrieve authoritative source references.
    if (interpreted.isSourceChallenge) {
      const query = SearchQueryBuilder.build(interpreted, userLocation, historyContext);
      return {
        shouldSearch: true,
        searchMode: SearchMode.REQUIRED,
        reason: SearchReason.SOURCE_CHALLENGE,
        originalMessage: raw,
        interpretedIntent: 'source_challenge_verification',
        searchQuery: query,
        confidence: 0.95,
      };
    }

    // 6. Explicit Web Search Request (User asks "найди в интернете...", "поищи исследования...", "find online...")
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
      };
    }

    // 7. Static Educational Definitions WITHOUT time triggers (e.g. "Что такое PET?", "объясни что такое AQI", "What is circular economy?")
    if (interpreted.isStaticDefinition) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.STATIC_EDUCATIONAL_CONCEPT,
        originalMessage: raw,
        interpretedIntent: 'static_educational_concept',
        confidence: 0.95,
      };
    }

    // 8. Real-Time / Current Air Quality & AQI & Pollution
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
      };
    }

    // 9. Real-Time / Current Weather
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
      };
    }

    // 10. Recent Legislation, Decrees, Environmental Regulations & Breaking News
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
      };
    }

    // 11. Research & Scientific / Technical Evidence
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
      };
    }

    // 11. Contextual Follow-Up Resolution using History
    // (e.g. "а завтра?", "а в Самарканде?", "а где его принимают сегодня?", "найди ещё")
    if (historyContext && this.isContextualFollowUp(interpreted.normalized)) {
      const contextualInterpretation = this.resolveFollowUpWithHistory(interpreted.normalized, historyContext, userLocation);
      if (contextualInterpretation.shouldSearch) {
        return contextualInterpretation;
      }
    }

    // 12. Static ZAMINAT Platform Concepts (without real-time markers)
    if (interpreted.isPlatformConcept) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.ZAMINAT_PLATFORM_CONCEPT,
        originalMessage: raw,
        interpretedIntent: 'zaminat_platform_concept',
        confidence: 0.98,
      };
    }

    // 13. Static Educational Definitions (e.g. "What is PET plastic?", "Как сортировать стекло?")
    if (interpreted.isStaticDefinition) {
      return {
        shouldSearch: false,
        searchMode: SearchMode.NOT_NEEDED,
        reason: SearchReason.STATIC_EDUCATIONAL_CONCEPT,
        originalMessage: raw,
        interpretedIntent: 'static_educational_definition',
        confidence: 0.95,
      };
    }

    // Default policy: Conservative, no search needed for general dialogue
    return {
      shouldSearch: false,
      searchMode: SearchMode.NOT_NEEDED,
      reason: SearchReason.GENERAL_NO_SEARCH,
      originalMessage: raw,
      confidence: 0.85,
    };
  }

  private static extractHistoryContext(history?: ChatHistoryItemDto[]): string | undefined {
    if (!Array.isArray(history) || history.length === 0) {
      return undefined;
    }
    // Take the last 4 turns for context resolution
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

    // Was prior context about Air Quality / AQI?
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

    // Was prior context about a Regulation / Law?
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
