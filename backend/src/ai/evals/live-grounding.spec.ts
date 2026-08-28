import { GoogleGeminiProvider } from '../providers/gemini.provider';
import { ConfigService } from '@nestjs/config';

describe('Live Google Search Grounding Integration Harness', () => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isRealApiKey = apiKey && apiKey.length > 20 && apiKey !== 'your-gemini-api-key-here' && apiKey !== 'test-dummy-gemini-key';

  if (!isRealApiKey) {
    it('skips live search grounding when no real GEMINI_API_KEY is configured', () => {
      // eslint-disable-next-line no-console
      console.log('LIVE_GROUNDING_SUITE=SKIPPED (Set GEMINI_API_KEY to execute live web search tests)');
      expect(true).toBe(true);
    });
    return;
  }

  let provider: GoogleGeminiProvider;

  beforeAll(() => {
    const configService = {
      get: (key: string) => {
        if (key === 'GEMINI_API_KEY') return apiKey;
        return undefined;
      },
    } as unknown as ConfigService;

    provider = new GoogleGeminiProvider(configService);
  });

  it('should execute live search grounding for Tashkent air quality and return real sources', async () => {
    const result = await provider.chatCoach({
      message: 'Какой сегодня уровень воздуха AQI в Ташкенте?',
      lang: 'ru',
    });

    expect(result.response).toBeDefined();
    expect(result.response.length).toBeGreaterThan(10);
    // Real search execution returns searchUsed=true with valid sources
    expect(result.searchUsed).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0].url).toMatch(/^https?:\/\//);
  }, 25000);

  it('should not search for pure greetings on live model', async () => {
    const result = await provider.chatCoach({
      message: 'Привет, как дела?',
      lang: 'ru',
    });

    expect(result.response).toBeDefined();
    expect(result.searchUsed).toBe(false);
    expect(result.sources).toEqual([]);
  }, 25000);
});
