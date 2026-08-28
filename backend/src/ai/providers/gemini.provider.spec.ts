import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGeminiProvider, GEMINI_CHAT_MODEL } from './gemini.provider';

let lastGenerateContentCall: any = null;

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockImplementation(async (params: any) => {
          lastGenerateContentCall = params;
          const paramStr = JSON.stringify(params);

          if (paramStr.includes('PROVIDER_ERROR_TEST')) {
            throw new Error('Google Generative AI API Error');
          }

          if (paramStr.includes('MALFORMED_JSON_TEST')) {
            return { text: 'This is not valid JSON' };
          }

          if (params.model === GEMINI_CHAT_MODEL) {
            if (paramStr.includes('GROUNDING_TEST')) {
              return {
                text: 'Hozirgi AQI darajasi yaxshi.',
                candidates: [
                  {
                    groundingMetadata: {
                      webSearchQueries: ['air pollution Tashkent today'],
                      groundingChunks: [
                        { web: { title: 'Air Quality Tashkent', uri: 'https://iqair.com/uzbekistan/tashkent' } },
                      ],
                    },
                  },
                ],
              };
            }

            // Simulating a model response for a query where search is REQUIRED but grounding returned nothing
            if (paramStr.includes('UNGROUNDED_REQUIRED_TEST')) {
              return {
                text: 'Hallucinated AQI value is 185 PM2.5 in Tashkent.',
                candidates: [{ groundingMetadata: undefined }],
              };
            }

            return {
              text: 'Sorting plastic bottles reduces landfill waste.',
              candidates: [{ groundingMetadata: undefined }],
            };
          }

          if (paramStr.includes('Current Stock:')) {
            return { text: 'Production schedule optimized: 5 Benches, 20 EcoTiles.' };
          }

          return {
            text: JSON.stringify({
              items: [{ name: 'PET Plastic Bottle', quantity: 2, wasteType: 'Plastic', status: 'Accepted', instructions: 'Rinse' }],
              totalEstimatedWeightKg: '0.2 - 0.5 kg',
              estimatedEcoCoins: 10,
              moatImpact: 'Saves 0.8 kg CO2',
              suggestedProduct: 'EcoTile',
              confidence: 95,
            }),
          };
        }),
      },
    })),
  };
});

describe('GoogleGeminiProvider Unit Tests', () => {
  let provider: GoogleGeminiProvider;
  let configService: ConfigService;

  beforeEach(async () => {
    lastGenerateContentCall = null;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleGeminiProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-dummy-gemini-key';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<GoogleGeminiProvider>(GoogleGeminiProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should throw 503 AI_PROVIDER_UNAVAILABLE when GEMINI_API_KEY is missing or placeholder', async () => {
    jest.spyOn(configService, 'get').mockReturnValue('your-gemini-api-key-here');
    delete process.env.GEMINI_API_KEY;

    await expect(provider.chatCoach({ message: 'Hello', lang: 'en' })).rejects.toThrow(
      new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE),
    );
  });

  it('should scan waste successfully and parse response', async () => {
    const result = await provider.scanWaste({ imageBase64: 'dGVzdA==', lang: 'en' });
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('PET Plastic Bottle');
  });

  it('should throw 422 INVALID_MODEL_OUTPUT on malformed JSON response', async () => {
    await expect(provider.scanWaste({ imageBase64: 'MALFORMED_JSON_TEST', lang: 'en' })).rejects.toThrow(
      new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY),
    );
  });

  it('should process chatCoach and extract search sources when search is triggered', async () => {
    const result = await provider.chatCoach({
      message: 'Bugun Toshkentda AQI qanday? GROUNDING_TEST',
      lang: 'uz',
    });

    expect(result.response).toBe('Hozirgi AQI darajasi yaxshi.');
    expect(result.searchUsed).toBe(true);
    expect(result.sources).toEqual([
      { title: 'Air Quality Tashkent', url: 'https://iqair.com/uzbekistan/tashkent' },
    ]);
  });

  it('P0 Search Query Builder Integration: should pass search intent hint and active search query to Gemini request', async () => {
    await provider.chatCoach({
      message: 'биток севодня скока GROUNDING_TEST',
      lang: 'ru',
    });

    expect(lastGenerateContentCall).toBeDefined();
    const systemInstruction = lastGenerateContentCall.config.systemInstruction;
    const contents = lastGenerateContentCall.contents;

    // Verify systemInstruction contains ACTIVE SEARCH QUERY
    expect(systemInstruction).toContain('ACTIVE SEARCH QUERY:');
    // Verify contents contains [Search Intent: ...]
    const lastUserTurn = contents[contents.length - 1].parts[0].text;
    expect(lastUserTurn).toContain('[Search Intent:');
  });

  it('P0 Fail-Closed Enforcement: should block hallucinations and return localized fallback when REQUIRED search has no grounding', async () => {
    const result = await provider.chatCoach({
      message: 'какой сейчас AQI в Ташкенте UNGROUNDED_REQUIRED_TEST',
      lang: 'ru',
    });

    // Must NOT return hallucinated response "Hallucinated AQI value is 185..."
    expect(result.response).not.toContain('Hallucinated');
    expect(result.response).toContain('Не удалось получить подтверждённые актуальные данные прямо сейчас');
    expect(result.searchUsed).toBe(false);
    expect(result.sources).toEqual([]);
  });

  it('should optimize planner successfully', async () => {
    const result = await provider.optimizePlanner({
      query: 'Plan production',
      currentStock: { plastic: 100, rubber: 50, paper: 20 },
    });
    expect(result.response).toContain('Production schedule optimized');
  });
});
