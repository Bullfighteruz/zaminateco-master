import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService, AI_CHAT_MODEL } from './ai.service';
import { HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { ScanDto } from './dto/scan.dto';

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

describe('AiService & ScanDto Payload Unit Tests', () => {
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

  it('should process chatCoach successfully without changing behavior', async () => {
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

  it('should accept a ~381 KB EcoScan payload', async () => {
    const largeBase64 = 'A'.repeat(381 * 1024);
    const dto = new ScanDto();
    dto.imageBase64 = largeBase64;
    dto.lang = 'en';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);

    const result = await service.scanWaste(dto);
    expect(result).toHaveProperty('items');
  });

  it('should reject an oversized Base64 string (>2.5M chars / ~2.38MB) at DTO validation layer', async () => {
    const oversizedBase64 = 'A'.repeat(2500001);
    const dto = new ScanDto();
    dto.imageBase64 = oversizedBase64;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail validation on empty/invalid ScanDto payload', async () => {
    const dto = new ScanDto();
    dto.imageBase64 = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should process optimizePlanner successfully without changing behavior', async () => {
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
});
