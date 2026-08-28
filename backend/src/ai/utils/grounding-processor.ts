import { RankedSource, SourceAuthorityTier } from './search-types';

export interface GroundingExtractionResult {
  searchUsed: boolean;
  sources: Array<{ title: string; url: string }>;
  rankedSources?: RankedSource[];
}

export class GroundingProcessor {
  /**
   * Official authority domains (Tier A)
   */
  private static readonly TIER_A_PATTERNS = [
    // Governments & legislation
    /\.gov(?:\.[a-z]{2})?$/i,
    /lex\.uz$/i,
    /norma\.uz$/i,
    /stat\.uz$/i,
    /gov\.uz$/i,
    /president\.uz$/i,
    /mineconomy\.uz$/i,

    // International bodies & monitoring
    /who\.int$/i,
    /un\.org$/i,
    /unep\.org$/i,
    /worldbank\.org$/i,
    /iqair\.com$/i,
    /airnow\.gov$/i,
    /meteo\.uz$/i,
    /weather\.com$/i,
    /accuweather\.com$/i,

    // Academic & Research
    /\.edu(?:\.[a-z]{2})?$/i,
    /\.ac\.[a-z]{2}$/i,
    /sciencedirect\.com$/i,
    /nature\.com$/i,
    /springer\.com$/i,
    /arxiv\.org$/i,
    /researchgate\.net$/i,
    /nih\.gov$/i,
    /ncbi\.nlm\.nih\.gov$/i,

    // Official Tech & Product Docs
    /supabase\.com$/i,
    /postgresql\.org$/i,
    /github\.com$/i,
    /apple\.com$/i,
    /google\.com$/i,
    /openai\.com$/i,
    /microsoft\.com$/i,
    /nodejs\.org$/i,
  ];

  /**
   * Established news & professional media (Tier B)
   */
  private static readonly TIER_B_PATTERNS = [
    /reuters\.com$/i,
    /bbc\.com$/i,
    /bloomberg\.com$/i,
    /apnews\.com$/i,
    /gazeta\.uz$/i,
    /kun\.uz$/i,
    /daryo\.uz$/i,
    /spot\.uz$/i,
    /forbes\.com$/i,
    /techcrunch\.com$/i,
    /theverge\.com$/i,
  ];

  /**
   * Processes Google Gemini Grounding Metadata and ranks extracted sources.
   */
  static processGeminiGrounding(
    groundingMetadata: any,
    routerIndicatesSearch: boolean,
    maxSources = 4,
  ): GroundingExtractionResult {
    if (!routerIndicatesSearch || !groundingMetadata) {
      return { searchUsed: false, sources: [] };
    }

    const webQueries = Array.isArray(groundingMetadata?.webSearchQueries)
      ? groundingMetadata.webSearchQueries
      : [];

    const chunks = Array.isArray(groundingMetadata?.groundingChunks)
      ? groundingMetadata.groundingChunks
      : [];

    const extracted: RankedSource[] = [];
    const seenCanonicalUrls = new Set<string>();

    for (const chunk of chunks) {
      const uri = chunk?.web?.uri;
      if (!uri || typeof uri !== 'string') continue;

      const validUrl = this.validateAndNormalizeUrl(uri);
      if (!validUrl) continue;

      const canonical = this.getCanonicalUrl(validUrl);
      if (seenCanonicalUrls.has(canonical)) continue;
      seenCanonicalUrls.add(canonical);

      const rawTitle = typeof chunk?.web?.title === 'string' ? chunk.web.title : '';
      const sanitizedTitle = this.sanitizeTitle(rawTitle, validUrl);
      const tier = this.classifySourceTier(validUrl);
      const score = tier === SourceAuthorityTier.TIER_A_OFFICIAL ? 3 : tier === SourceAuthorityTier.TIER_B_NEWS ? 2 : 1;

      extracted.push({
        title: sanitizedTitle,
        url: validUrl,
        tier,
        domain: this.extractDomain(validUrl),
        score,
      });
    }

    // Sort by authority score descending (Tier A > Tier B > Tier C)
    extracted.sort((a, b) => (b.score || 0) - (a.score || 0));

    const searchUsed = (webQueries.length > 0 || extracted.length > 0) && routerIndicatesSearch;
    const finalRanked = extracted.slice(0, maxSources);
    const finalSources = finalRanked.map(s => ({ title: s.title, url: s.url }));

    return {
      searchUsed,
      sources: finalSources,
      rankedSources: finalRanked,
    };
  }

  /**
   * Processes OpenAI Responses API output items for citations.
   */
  static processOpenAIGrounding(
    outputItems: any[],
    routerIndicatesSearch: boolean,
    maxSources = 4,
  ): GroundingExtractionResult {
    if (!routerIndicatesSearch || !Array.isArray(outputItems)) {
      return { searchUsed: false, sources: [] };
    }

    let searchToolExecuted = false;
    const extracted: RankedSource[] = [];
    const seenCanonicalUrls = new Set<string>();

    for (const item of outputItems) {
      if (!item) continue;

      if (item.type === 'web_search_call' || item.type === 'web_search') {
        searchToolExecuted = true;
      }

      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const contentPiece of item.content) {
          if (contentPiece?.type === 'text' && Array.isArray(contentPiece.annotations)) {
            for (const annotation of contentPiece.annotations) {
              if (annotation?.type === 'url_citation' && annotation.url) {
                searchToolExecuted = true;
                const validUrl = this.validateAndNormalizeUrl(annotation.url);
                if (!validUrl) continue;

                const canonical = this.getCanonicalUrl(validUrl);
                if (seenCanonicalUrls.has(canonical)) continue;
                seenCanonicalUrls.add(canonical);

                const sanitizedTitle = this.sanitizeTitle(annotation.title, validUrl);
                const tier = this.classifySourceTier(validUrl);
                const score = tier === SourceAuthorityTier.TIER_A_OFFICIAL ? 3 : tier === SourceAuthorityTier.TIER_B_NEWS ? 2 : 1;

                extracted.push({
                  title: sanitizedTitle,
                  url: validUrl,
                  tier,
                  domain: this.extractDomain(validUrl),
                  score,
                });
              }
            }
          }
        }
      }
    }

    extracted.sort((a, b) => (b.score || 0) - (a.score || 0));

    const finalRanked = extracted.slice(0, maxSources);
    const searchUsed = routerIndicatesSearch && (searchToolExecuted || finalRanked.length > 0);
    const finalSources = finalRanked.map(s => ({ title: s.title, url: s.url }));

    return {
      searchUsed,
      sources: finalSources,
      rankedSources: finalRanked,
    };
  }

  /**
   * Deterministic localized fallback message when a REQUIRED search produces no verified grounding.
   */
  static getUnavailableDataFallback(lang = 'ru'): string {
    const cleanLang = (lang || 'ru').toLowerCase().slice(0, 2);
    switch (cleanLang) {
      case 'uz':
        return "Hozirda tasdiqlangan dolzarb ma'lumotlarni olish imkoni bo'lmadi. Iltimos, birozdan so'ng qayta urinib ko'ring yoki rasmiy manbalarga murojaat qiling.";
      case 'en':
        return "Unable to retrieve verified current real-time data right now. Please try again in a moment or consult official sources.";
      case 'ru':
      default:
        return "Не удалось получить подтверждённые актуальные данные прямо сейчас. Пожалуйста, повторите запрос позже или обратитесь к официальным источникам.";
    }
  }

  private static classifySourceTier(url: string): SourceAuthorityTier {
    const domain = this.extractDomain(url).toLowerCase();
    if (!domain) return SourceAuthorityTier.TIER_C_GENERAL;

    for (const pattern of this.TIER_A_PATTERNS) {
      if (pattern.test(domain)) {
        return SourceAuthorityTier.TIER_A_OFFICIAL;
      }
    }

    for (const pattern of this.TIER_B_PATTERNS) {
      if (pattern.test(domain)) {
        return SourceAuthorityTier.TIER_B_NEWS;
      }
    }

    return SourceAuthorityTier.TIER_C_GENERAL;
  }

  private static extractDomain(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      return '';
    }
  }

  private static validateAndNormalizeUrl(urlStr: string): string | null {
    try {
      const parsed = new URL(urlStr);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  private static getCanonicalUrl(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/+$/, '')}`;
    } catch {
      return urlStr.toLowerCase();
    }
  }

  private static sanitizeTitle(rawTitle: string | undefined, fallbackUrl: string): string {
    if (!rawTitle || typeof rawTitle !== 'string') {
      try {
        const parsed = new URL(fallbackUrl);
        return parsed.hostname;
      } catch {
        return fallbackUrl;
      }
    }
    const cleaned = rawTitle.replace(/[\r\n\t]+/g, ' ').trim();
    if (cleaned.length > 120) {
      return cleaned.slice(0, 117) + '...';
    }
    return cleaned;
  }
}
