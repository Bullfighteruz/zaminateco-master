import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService, AI_CHAT_MODEL, AI_SCAN_MODEL } from './ai.service';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockImplementation(async (params: any) => {
            if (params.model === AI_CHAT_MODEL) {
              return { text: 'Sorting plastic bottles reduces landfill waste.' };
            }
            if (params.model === AI_SCAN_MODEL) {
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
            }
            return { text: 'Default response' };
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

  it('should process chatWithCoach successfully', async () => {
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
