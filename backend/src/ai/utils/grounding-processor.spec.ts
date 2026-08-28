import { GroundingProcessor } from './grounding-processor';

describe('GroundingProcessor Unit Tests', () => {
  describe('Gemini Grounding Extraction', () => {
    it('should extract valid sources and deduplicate URLs', () => {
      const mockGrounding = {
        webSearchQueries: ['Tashkent air quality AQI'],
        groundingChunks: [
          { web: { title: 'IQAir Tashkent Air Quality', uri: 'https://www.iqair.com/uzbekistan/tashkent' } },
          { web: { title: 'IQAir Tashkent Air Quality Duplicate', uri: 'https://www.iqair.com/uzbekistan/tashkent/' } },
          { web: { title: 'AirNow Global', uri: 'https://airnow.gov/international/tashkent' } },
        ],
      };

      const result = GroundingProcessor.processGeminiGrounding(mockGrounding, true, 3);
      expect(result.searchUsed).toBe(true);
      expect(result.sources.length).toBe(2);
      expect(result.sources[0].url).toBe('https://www.iqair.com/uzbekistan/tashkent');
      expect(result.sources[1].url).toBe('https://airnow.gov/international/tashkent');
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
});
