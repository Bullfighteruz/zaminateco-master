import { ChatSource } from '../interfaces/ai-provider.interface';

export class GroundingProcessor {
  /**
   * Processes and extracts genuine, deduplicated, verified web sources from Google Gemini groundingMetadata.
   */
  static processGeminiGrounding(
    groundingMetadata: any,
    searchRequested: boolean,
    maxSources = 4,
  ): { searchUsed: boolean; sources: ChatSource[] } {
    if (!searchRequested || !groundingMetadata) {
      return { searchUsed: false, sources: [] };
    }

    const webQueries = Array.isArray(groundingMetadata.webSearchQueries) ? groundingMetadata.webSearchQueries : [];
    const chunks = Array.isArray(groundingMetadata.groundingChunks) ? groundingMetadata.groundingChunks : [];

    const hasQueries = webQueries.length > 0;
    const hasWebChunks = chunks.some(c => Boolean(c?.web?.uri));

    const searchUsed = hasQueries || hasWebChunks;
    if (!searchUsed) {
      return { searchUsed: false, sources: [] };
    }

    const sources: ChatSource[] = [];
    const seenUrls = new Set<string>();

    for (const chunk of chunks) {
      const uri = typeof chunk?.web?.uri === 'string' ? chunk.web.uri.trim() : '';
      if (!uri || !this.isValidHttpUrl(uri)) {
        continue;
      }

      const normalizedUrl = this.normalizeUrl(uri);
      if (seenUrls.has(normalizedUrl)) {
        continue;
      }

      seenUrls.add(normalizedUrl);
      const rawTitle = typeof chunk?.web?.title === 'string' ? chunk.web.title.trim() : '';
      const title = this.sanitizeTitle(rawTitle, uri);

      sources.push({ title, url: uri });
      if (sources.length >= maxSources) {
        break;
      }
    }

    return {
      searchUsed: searchUsed && sources.length > 0,
      sources,
    };
  }

  /**
   * Processes and extracts genuine web sources from OpenAI response output annotations.
   */
  static processOpenAIGrounding(
    outputItems: any[],
    searchRequested: boolean,
    maxSources = 4,
  ): { searchUsed: boolean; sources: ChatSource[] } {
    if (!searchRequested || !Array.isArray(outputItems)) {
      return { searchUsed: false, sources: [] };
    }

    let searchExecuted = false;
    const sources: ChatSource[] = [];
    const seenUrls = new Set<string>();

    for (const item of outputItems) {
      if (item?.type === 'web_search_call' || item?.type === 'web_search') {
        searchExecuted = true;
      }

      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const piece of item.content) {
          if (piece?.type === 'text' && Array.isArray(piece.annotations)) {
            for (const ann of piece.annotations) {
              if (ann?.type === 'url_citation' && typeof ann.url === 'string') {
                searchExecuted = true;
                const uri = ann.url.trim();
                if (this.isValidHttpUrl(uri)) {
                  const normalizedUrl = this.normalizeUrl(uri);
                  if (!seenUrls.has(normalizedUrl)) {
                    seenUrls.add(normalizedUrl);
                    const title = this.sanitizeTitle(ann.title || '', uri);
                    sources.push({ title, url: uri });
                  }
                }
              }
            }
          }
        }
      }
    }

    return {
      searchUsed: searchExecuted && sources.length > 0,
      sources: sources.slice(0, maxSources),
    };
  }

  private static isValidHttpUrl(urlStr: string): boolean {
    if (!urlStr || urlStr.startsWith('javascript:') || urlStr.startsWith('data:')) {
      return false;
    }
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private static normalizeUrl(urlStr: string): string {
    try {
      const u = new URL(urlStr);
      return `${u.protocol}//${u.hostname}${u.pathname}`.toLowerCase().replace(/\/$/, '');
    } catch {
      return urlStr.toLowerCase();
    }
  }

  private static sanitizeTitle(rawTitle: string, uri: string): string {
    if (!rawTitle || rawTitle.trim().length === 0) {
      try {
        const u = new URL(uri);
        return u.hostname.replace(/^www\./i, '');
      } catch {
        return uri;
      }
    }
    return rawTitle
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[<>[\]]/g, '')
      .trim()
      .slice(0, 100);
  }
}
