/**
 * ZAMINAT.eco - AI Coach Search Router & Semantic Intent Types
 * Defines the SearchMode, SearchReason, and SearchRouteResult interfaces.
 */

export enum SearchMode {
  REQUIRED = 'REQUIRED',
  PREFERRED = 'PREFERRED',
  NOT_NEEDED = 'NOT_NEEDED',
  INTERNAL_ONLY = 'INTERNAL_ONLY',
}

export enum SearchReason {
  CURRENT_AIR_QUALITY = 'CURRENT_AIR_QUALITY',
  CURRENT_WEATHER = 'CURRENT_WEATHER',
  TIME_SENSITIVE_FACTS = 'TIME_SENSITIVE_FACTS',
  EXPLICIT_SEARCH_REQUEST = 'EXPLICIT_SEARCH_REQUEST',
  SOURCE_CHALLENGE = 'SOURCE_CHALLENGE',
  RECENT_REGULATION_NEWS = 'RECENT_REGULATION_NEWS',
  RESEARCH_EVIDENCE = 'RESEARCH_EVIDENCE',
  CONTEXTUAL_FOLLOW_UP = 'CONTEXTUAL_FOLLOW_UP',
  STATIC_EDUCATIONAL_CONCEPT = 'STATIC_EDUCATIONAL_CONCEPT',
  CONVERSATIONAL_GREETING = 'CONVERSATIONAL_GREETING',
  INTERNAL_USER_PROFILE = 'INTERNAL_USER_PROFILE',
  ZAMINAT_PLATFORM_CONCEPT = 'ZAMINAT_PLATFORM_CONCEPT',
  PRIVATE_SYSTEM_QUERY = 'PRIVATE_SYSTEM_QUERY',
  GENERAL_NO_SEARCH = 'GENERAL_NO_SEARCH',
}

export interface InterpretedMessage {
  raw: string;
  normalized: string;
  language: 'ru' | 'uz' | 'en';
  isGreeting: boolean;
  isStaticDefinition: boolean;
  isProfileQuery: boolean;
  isPlatformConcept: boolean;
  isPrivateSystemQuery: boolean;
  isExplicitSearch: boolean;
  isSourceChallenge: boolean;
  isAirQualityQuery: boolean;
  isWeatherQuery: boolean;
  isNewsOrRegulationQuery: boolean;
  isResearchQuery: boolean;
  hasTimeTrigger: boolean;
  location?: string;
  cleanTopic?: string;
}

export interface SearchRouteResult {
  /**
   * Backwards compatible boolean flag: true if search is REQUIRED or PREFERRED
   */
  shouldSearch: boolean;
  searchMode: SearchMode;
  reason: SearchReason | string;
  originalMessage: string;
  interpretedIntent?: string;
  normalizedMeaning?: string;
  searchQuery?: string;
  confidence: number;
}
