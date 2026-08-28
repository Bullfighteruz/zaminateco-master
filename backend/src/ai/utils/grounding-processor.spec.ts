import { GroundingProcessor } from './grounding-processor';
import { SourceAuthorityTier } from './search-types';

describe('GroundingProcessor Unit Tests', () => {
  describe('Gemini Grounding Extraction & Authority Ranking', () => {
    it('should extract valid sources and sort by Authority Tier (Tier A > Tier B > Tier C)', () => {
      const mockGrounding = {
        webSearchQueries: ['Tashkent air quality AQI'],
        groundingChunks: [
          { web: { title: 'Random Blogspot', uri: 'https://random-eco-blog.com/aqi' } },
          { web: { title: 'Kun.uz News', uri: 'https://kun.uz/news/2026/aqi-tashkent' } },
          { web: { title: 'IQAir Tashkent Air Quality', uri: 'https://www.iqair.com/uzbekistan/tashkent' } },
          { web: { title: 'IQAir Tashkent Air Quality Duplicate', uri: 'https://www.iqair.com/uzbekistan/tashkent/' } },
          { web: { title: 'Lex.uz Law', uri: 'https://lex.uz/docs/12345' } },
        ],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, true, 4);
      expect(result.searchUsed).toBe(true);
      expect(result.sources.length).toBe(4);

      // Verify that Tier A sources (lex.uz, iqair.com) are placed ahead of Tier B (kun.uz) and Tier C (random-eco-blog.com)
      const topDomains = result.sources.map(s => new URL(s.url).hostname.replace(/^www\./, ''));
      expect(['lex.uz', 'iqair.com']).toContain(topDomains[0]);
      expect(['lex.uz', 'iqair.com']).toContain(topDomains[1]);
      expect(topDomains[2]).toBe('kun.uz');
      expect(topDomains[3]).toBe('random-eco-blog.com');

      expect(result.rankedSources).toBeDefined();
      expect(result.rankedSources![0].tier).toBe(SourceAuthorityTier.TIER_A_OFFICIAL);
    });

    it('should ignore javascript: and data: URLs', () => {
      const mockGrounding = {
        webSearchQueries: ['Tashkent AQI'],
        groundingChunks: [
          { web: { title: 'XSS Attempt', uri: 'javascript:alert(1)' } },
          { web: { title: 'Valid Source', uri: 'https://iqair.com/tashkent' } },
        ],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, true);
      expect(result.sources.length).toBe(1);
      expect(result.sources[0].url).toBe('https://iqair.com/tashkent');
    });

    it('should return empty sources and searchUsed=false when search was not requested', () => {
      const mockGrounding = {
        webSearchQueries: ['test'],
        groundingChunks: [{ web: { title: 'Test', uri: 'https://example.com' } }],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, false);
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);
    });
  });

  describe('OpenAI Grounding Extraction', () => {
    it('should extract url_citation annotations from output content', () => {
      const mockOutput = [
        { type: 'web_search_call' },
        {
          type: 'message',
          content: [
            {
              type: 'text',
              annotations: [
                { type: 'url_citation', title: 'IQAir Tashkent', url: 'https://iqair.com/tashkent' },
              ],
            },
          ],
        },
      ];

      const result = GroundingProcessor.processOpenAIGrounding(mockOutput, true);
      expect(result.searchUsed).toBe(true);
      expect(result.sources).toEqual([{ title: 'IQAir Tashkent', url: 'https://iqair.com/tashkent' }]);
    });
  });

  describe('Localized Fallback for Failed REQUIRED Search', () => {
    it('should return Russian fallback message for lang=ru', () => {
      const fb = GroundingProcessor.getUnavailableDataFallback('ru');
      expect(fb).toContain('Не удалось получить подтверждённые актуальные данные');
    });

    it('should return Uzbek fallback message for lang=uz', () => {
      const fb = GroundingProcessor.getUnavailableDataFallback('uz');
      expect(fb).toContain("tasdiqlangan dolzarb ma'lumotlarni olish imkoni bo'lmadi");
    });

    it('should return English fallback message for lang=en', () => {
      const fb = GroundingProcessor.getUnavailableDataFallback('en');
      expect(fb).toContain('Unable to retrieve verified current real-time data');
    });
  });
});
