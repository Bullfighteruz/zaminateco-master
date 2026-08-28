/**
 * ZAMINAT.eco - AI Coach Search Router & Semantic Intent Types
 * Defines SearchMode, SearchReason, Authority Tiers, and Route Result interfaces.
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
  CURRENT_PUBLIC_FACT = 'CURRENT_PUBLIC_FACT',
  PUBLIC_DOCUMENTATION = 'PUBLIC_DOCUMENTATION',
  TIME_SENSITIVE_FACTS = 'TIME_SENSITIVE_FACTS',
  EXPLICIT_SEARCH_REQUEST = 'EXPLICIT_SEARCH_REQUEST',
  SOURCE_CHALLENGE = 'SOURCE_CHALLENGE',
  ACCOUNT_PROVENANCE = 'ACCOUNT_PROVENANCE',
  PLATFORM_PROVENANCE = 'PLATFORM_PROVENANCE',
  RECENT_REGULATION_NEWS = 'RECENT_REGULATION_NEWS',
  RESEARCH_EVIDENCE = 'RESEARCH_EVIDENCE',
  CONTEXTUAL_FOLLOW_UP = 'CONTEXTUAL_FOLLOW_UP',
  STATIC_EDUCATIONAL_CONCEPT = 'STATIC_EDUCATIONAL_CONCEPT',
  CONVERSATIONAL_GREETING = 'CONVERSATIONAL_GREETING',
  INTERNAL_USER_PROFILE = 'INTERNAL_USER_PROFILE',
  ZAMINAT_PLATFORM_CONCEPT = 'ZAMINAT_PLATFORM_CONCEPT',
  PRIVATE_SYSTEM_QUERY = 'PRIVATE_SYSTEM_QUERY',
  SEMANTIC_CLASSIFIER_REQUIRED = 'SEMANTIC_CLASSIFIER_REQUIRED',
  SEMANTIC_CLASSIFIER_PREFERRED = 'SEMANTIC_CLASSIFIER_PREFERRED',
  SEMANTIC_CLASSIFIER_NOT_NEEDED = 'SEMANTIC_CLASSIFIER_NOT_NEEDED',
  GENERAL_NO_SEARCH = 'GENERAL_NO_SEARCH',
}

export enum SourceAuthorityTier {
  TIER_A_OFFICIAL = 'TIER_A_OFFICIAL',
  TIER_B_NEWS = 'TIER_B_NEWS',
  TIER_C_GENERAL = 'TIER_C_GENERAL',
}

export interface RankedSource {
  title: string;
  url: string;
  tier?: SourceAuthorityTier;
  domain?: string;
  score?: number;
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
  isPublicDocQuery: boolean;
  isExplicitSearch: boolean;
  isSourceChallenge: boolean;
  isAirQualityQuery: boolean;
  isWeatherQuery: boolean;
  isNewsOrRegulationQuery: boolean;
  isResearchQuery: boolean;
  isCurrentFactQuery: boolean;
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
  isUncertain?: boolean;
  layer?: 'layer1_fast' | 'layer2_semantic' | 'deterministic_fallback';
}
