import { GroundingExtractionResult, RankedSource, SourceAuthorityTier } from './search-types';

export class GroundingProcessor {
  /**
   * Official government, international institutions & primary product documentation (Tier 1 - Official Primary)
   */
  private static readonly OFFICIAL_PRIMARY_PATTERNS = [
    // Governments & legislation (Official Primary)
    /\.gov(?:\.[a-z]{2})?$/i,
    /lex\.uz$/i,
    /stat\.uz$/i,
    /gov\.uz$/i,
    /president\.uz$/i,
    /mineconomy\.uz$/i,

    // International intergovernmental bodies
    /who\.int$/i,
    /un\.org$/i,
    /unep\.org$/i,
    /worldbank\.org$/i,
    /unece\.org$/i,

    // Primary Developer & Official Software Docs
    /supabase\.com$/i,
    /postgresql\.org$/i,
    /nodejs\.org$/i,
    /apple\.com$/i,
    /google\.com$/i,
    /openai\.com$/i,
    /microsoft\.com$/i,
  ];

  /**
   * Academic journals & primary scientific publishers
   */
  private static readonly ACADEMIC_PRIMARY_PATTERNS = [
    /\.edu(?:\.[a-z]{2})?$/i,
    /\.ac\.[a-z]{2}$/i,
    /sciencedirect\.com$/i,
    /nature\.com$/i,
    /springer\.com$/i,
    /arxiv\.org$/i,
    /nih\.gov$/i,
    /ncbi\.nlm\.nih\.gov$/i,
  ];

  /**
   * Specialist real-time monitoring providers
   */
  private static readonly SPECIALIST_DATA_PATTERNS = [
    /iqair\.com$/i,
    /airnow\.gov$/i,
    /meteo\.uz$/i,
    /weather\.com$/i,
    /accuweather\.com$/i,
  ];

  /**
   * Established professional journalism & media
   */
  private static readonly ESTABLISHED_NEWS_PATTERNS = [
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
      return { searchExecuted: false, groundingVerified: false, searchUsed: false, sources: [] };
    }

    const webQueries = Array.isArray(groundingMetadata?.webSearchQueries)
      ? groundingMetadata.webSearchQueries.filter((q: any) => typeof q === 'string' && q.trim().length > 0)
      : [];

    const chunks = Array.isArray(groundingMetadata?.groundingChunks)
      ? groundingMetadata.groundingChunks
      : [];

    const searchExecuted = webQueries.length > 0 || chunks.length > 0;

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
      const score = this.getTierScore(tier);

      extracted.push({
        title: sanitizedTitle,
        url: validUrl,
        tier,
        domain: this.extractDomain(validUrl),
        score,
      });
    }

    // Sort by authority score descending (Official Primary > Academic > Specialist > News > General)
    extracted.sort((a, b) => (b.score || 0) - (a.score || 0));

    const finalRanked = extracted.slice(0, maxSources);
    const finalSources = finalRanked.map(s => ({ title: s.title, url: s.url }));
    const groundingVerified = finalSources.length > 0;
    const searchUsed = routerIndicatesSearch && groundingVerified;

    return {
      searchExecuted,
      groundingVerified,
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
      return { searchExecuted: false, groundingVerified: false, searchUsed: false, sources: [] };
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
                const score = this.getTierScore(tier);

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
    const finalSources = finalRanked.map(s => ({ title: s.title, url: s.url }));
    const groundingVerified = finalSources.length > 0;
    const searchUsed = routerIndicatesSearch && groundingVerified;

    return {
      searchExecuted: searchToolExecuted || finalSources.length > 0,
      groundingVerified,
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
    if (!domain) return SourceAuthorityTier.GENERAL_WEB;

    // Explicit exclusions from Official Primary
    if (domain === 'norma.uz' || domain.endsWith('.norma.uz')) {
      return SourceAuthorityTier.GENERAL_WEB;
    }
    if (domain === 'researchgate.net' || domain.endsWith('.researchgate.net')) {
      return SourceAuthorityTier.GENERAL_WEB;
    }
    if (domain === 'github.com') {
      return SourceAuthorityTier.GENERAL_WEB;
    }

    for (const pattern of this.OFFICIAL_PRIMARY_PATTERNS) {
      if (pattern.test(domain)) {
        return SourceAuthorityTier.OFFICIAL_PRIMARY;
      }
    }

    for (const pattern of this.ACADEMIC_PRIMARY_PATTERNS) {
      if (pattern.test(domain)) {
        return SourceAuthorityTier.ACADEMIC_PRIMARY_OR_PUBLISHER;
      }
    }

    for (const pattern of this.SPECIALIST_DATA_PATTERNS) {
      if (pattern.test(domain)) {
        return SourceAuthorityTier.SPECIALIST_DATA_PROVIDER;
      }
    }

    for (const pattern of this.ESTABLISHED_NEWS_PATTERNS) {
      if (pattern.test(domain)) {
        return SourceAuthorityTier.ESTABLISHED_NEWS;
      }
    }

    return SourceAuthorityTier.GENERAL_WEB;
  }

  private static getTierScore(tier: SourceAuthorityTier): number {
    switch (tier) {
      case SourceAuthorityTier.OFFICIAL_PRIMARY:
        return 5;
      case SourceAuthorityTier.ACADEMIC_PRIMARY_OR_PUBLISHER:
        return 4;
      case SourceAuthorityTier.SPECIALIST_DATA_PROVIDER:
        return 3;
      case SourceAuthorityTier.ESTABLISHED_NEWS:
        return 2;
      case SourceAuthorityTier.GENERAL_WEB:
      default:
        return 1;
    }
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
    const cleaned = rawTitle.replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ').trim();
    if (cleaned.length > 120) {
      return cleaned.slice(0, 117) + '...';
    }
    return cleaned;
  }
}
