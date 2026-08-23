import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGeminiProvider, GEMINI_CHAT_MODEL } from './gemini.provider';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockImplementation(async (params: any) => {
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

  it('should optimize planner successfully', async () => {
    const result = await provider.optimizePlanner({
      query: 'Plan production',
      currentStock: { plastic: 100, rubber: 50, paper: 20 },
    });
    expect(result.response).toContain('Production schedule optimized');
  });
});
