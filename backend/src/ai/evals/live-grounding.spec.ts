import { GoogleGeminiProvider } from '../providers/gemini.provider';
import { ConfigService } from '@nestjs/config';

const apiKey = process.env.GEMINI_API_KEY;
const hasRealKey = typeof apiKey === 'string' &&
  apiKey.length > 20 &&
  apiKey !== 'your-gemini-api-key-here' &&
  apiKey !== 'test-dummy-gemini-key';

const describeSuite = hasRealKey ? describe : describe.skip;

describeSuite('Live Google Search Grounding Integration Harness', () => {
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
    try {
      const result = await provider.chatCoach({
        message: 'Какой сегодня уровень воздуха AQI в Ташкенте?',
        lang: 'ru',
      });

      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(10);
      expect(result.searchUsed).toBe(true);
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources[0].url).toMatch(/^https?:\/\//);
      // eslint-disable-next-line no-console
      console.log('LIVE_GROUNDING=PASS');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('LIVE_GROUNDING=FAIL');
      throw err;
    }
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

// If skipped, log explicit status
if (!hasRealKey) {
  describe('Live Grounding Status Notification', () => {
    it.skip('skips live harness without real API key', () => {
      // Skipped by design
    });
  });
}
