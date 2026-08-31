import { GroundingProcessor } from './grounding-processor';
import { SourceAuthorityTier } from './search-types';

describe('GroundingProcessor Unit Tests', () => {
  describe('Gemini Grounding Extraction & Authority Ranking', () => {
    it('should extract valid sources and sort by refined Authority Tier (Official Primary > Academic > Specialist > News > General)', () => {
      const mockGrounding = {
        webSearchQueries: ['Tashkent air quality AQI'],
        groundingChunks: [
          { web: { title: 'Random GitHub repo', uri: 'https://github.com/someuser/aqi-repo' } },
          { web: { title: 'Kun.uz News', uri: 'https://kun.uz/news/2026/aqi-tashkent' } },
          { web: { title: 'IQAir Tashkent Air Quality', uri: 'https://www.iqair.com/uzbekistan/tashkent' } },
          { web: { title: 'Nature Climate Study', uri: 'https://nature.com/articles/s41558-026-0001' } },
          { web: { title: 'Lex.uz Law', uri: 'https://lex.uz/docs/12345' } },
          { web: { title: 'Norma.uz Portal', uri: 'https://norma.uz/novosti/123' } },
        ],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, true, 5);
      expect(result.searchExecuted).toBe(true);
      expect(result.groundingVerified).toBe(true);
      expect(result.searchUsed).toBe(true);
      expect(result.sources.length).toBe(5);

      // Order should be: Lex.uz (Official Primary - 5) > Nature (Academic - 4) > IQAir (Specialist - 3) > Kun.uz (News - 2) > GitHub / Norma (General - 1)
      expect(result.rankedSources![0].tier).toBe(SourceAuthorityTier.OFFICIAL_PRIMARY);
      expect(result.rankedSources![0].url).toContain('lex.uz');

      expect(result.rankedSources![1].tier).toBe(SourceAuthorityTier.ACADEMIC_PRIMARY_OR_PUBLISHER);
      expect(result.rankedSources![1].url).toContain('nature.com');

      expect(result.rankedSources![2].tier).toBe(SourceAuthorityTier.SPECIALIST_DATA_PROVIDER);
      expect(result.rankedSources![2].url).toContain('iqair.com');

      expect(result.rankedSources![3].tier).toBe(SourceAuthorityTier.ESTABLISHED_NEWS);
      expect(result.rankedSources![3].url).toContain('kun.uz');

      expect(result.rankedSources![4].tier).toBe(SourceAuthorityTier.GENERAL_WEB);
    });

    it('P0 Fail-Closed: webSearchQueries exists but chunks is empty -> searchExecuted=true, groundingVerified=false, searchUsed=false', () => {
      const mockGrounding = {
        webSearchQueries: ['Tashkent AQI today'],
        groundingChunks: [],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, true);
      expect(result.searchExecuted).toBe(true);
      expect(result.groundingVerified).toBe(false);
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);
    });

    it('P0 Fail-Closed: chunks contain only invalid/non-http URLs -> groundingVerified=false, searchUsed=false', () => {
      const mockGrounding = {
        webSearchQueries: ['Tashkent AQI'],
        groundingChunks: [
          { web: { title: 'XSS Attempt', uri: 'javascript:alert(1)' } },
          { web: { title: 'Data URL', uri: 'data:text/html,test' } },
        ],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, true);
      expect(result.searchExecuted).toBe(true);
      expect(result.groundingVerified).toBe(false);
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);
    });

    it('should return searchUsed=false when search was not requested by router', () => {
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
    it('should extract url_citation annotations and verify grounding', () => {
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
      expect(result.searchExecuted).toBe(true);
      expect(result.groundingVerified).toBe(true);
      expect(result.searchUsed).toBe(true);
      expect(result.sources).toEqual([{ title: 'IQAir Tashkent', url: 'https://iqair.com/tashkent' }]);
    });

    it('P0 Fail-Closed: web_search_call without annotations -> groundingVerified=false, searchUsed=false', () => {
      const mockOutput = [
        { type: 'web_search_call' },
        {
          type: 'message',
          content: [{ type: 'text', text: 'Some text without citations' }],
        },
      ];

      const result = GroundingProcessor.processOpenAIGrounding(mockOutput, true);
      expect(result.searchExecuted).toBe(true);
      expect(result.groundingVerified).toBe(false);
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);
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
