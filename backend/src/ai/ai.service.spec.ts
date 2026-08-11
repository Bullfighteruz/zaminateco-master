import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService, AI_CHAT_MODEL } from './ai.service';
import { HttpException } from '@nestjs/common';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockImplementation(async (params: any) => {
            const paramStr = JSON.stringify(params);
            
            if (paramStr.includes('PROVIDER_ERROR_TEST')) {
              throw new Error('Google Generative AI API Error');
            }

            if (paramStr.includes('MALFORMED_JSON_TEST')) {
              return { text: 'This is not valid JSON' };
            }

            if (params.model === AI_CHAT_MODEL) {
              return { text: 'Sorting plastic bottles reduces landfill waste.' };
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
      };
    }),
  };
});

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-dummy-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process chatCoach successfully', async () => {
    const result = await service.chatCoach({ message: 'How to sort plastic bottles?', lang: 'en' });
    expect(result).toHaveProperty('response');
    expect(result.response).toContain('Sorting plastic bottles');
  });

  it('should process scanWaste successfully', async () => {
    const result = await service.scanWaste({ imageBase64: 'data:image/jpeg;base64,dummy', lang: 'en' });
    expect(result).toHaveProperty('items');
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('PET Plastic Bottle');
  });

  it('should process optimizePlanner successfully', async () => {
    const result = await service.optimizePlanner({ currentStock: { plastic: 100, rubber: 50, paper: 20 }, query: 'Optimize schedule' });
    expect(result).toHaveProperty('response');
    expect(result.response).toContain('Production schedule optimized');
  });

  it('should handle malformed model response gracefully with HTTP 422', async () => {
    await expect(service.scanWaste({ imageBase64: 'MALFORMED_JSON_TEST', lang: 'en' }))
      .rejects.toThrow(HttpException);
  });

  it('should handle provider errors with normalized HTTP 502', async () => {
    await expect(service.scanWaste({ imageBase64: 'PROVIDER_ERROR_TEST', lang: 'en' }))
      .rejects.toThrow(HttpException);
  });

  it('should handle unavailable API key gracefully', async () => {
    const noKeyModule: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    const noKeyService = noKeyModule.get<AiService>(AiService);
    delete process.env.GEMINI_API_KEY;

    await expect(noKeyService.chatCoach({ message: 'Hi' })).rejects.toThrow(HttpException);
  });
});
