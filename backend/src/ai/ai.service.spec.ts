import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { AiService } from './ai.service';
import { AiProviderFactory } from './providers/ai-provider.factory';
import { GoogleGeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { ScanDto } from './dto/scan.dto';
import { ChatDto } from './dto/chat.dto';
import { PlannerDto } from './dto/planner.dto';

describe('AiService & Provider Selection Unit Tests', () => {
  let service: AiService;
  let factory: AiProviderFactory;
  let mockGeminiProvider: Partial<GoogleGeminiProvider>;
  let mockOpenAIProvider: Partial<OpenAIProvider>;
  let configService: ConfigService;

  beforeEach(async () => {
    mockGeminiProvider = {
      providerName: 'gemini',
      scanWaste: jest.fn().mockResolvedValue({
        items: [{ name: 'Gemini Bottle', quantity: 1, wasteType: 'Plastic', status: 'Accepted', instructions: 'Rinse' }],
        totalEstimatedWeightKg: '0.1 kg',
        estimatedEcoCoins: 10,
        moatImpact: 'Gemini Impact',
        suggestedProduct: 'EcoTile',
        confidence: 90,
      }),
      chatCoach: jest.fn().mockResolvedValue({
        response: 'Gemini response',
        searchUsed: false,
        sources: [],
      }),
      optimizePlanner: jest.fn().mockResolvedValue({
        response: 'Gemini planner response',
      }),
    };

    mockOpenAIProvider = {
      providerName: 'openai',
      scanWaste: jest.fn().mockResolvedValue({
        items: [{ name: 'OpenAI Bottle', quantity: 1, wasteType: 'Plastic', status: 'Accepted', instructions: 'Rinse' }],
        totalEstimatedWeightKg: '0.1 kg',
        estimatedEcoCoins: 10,
        moatImpact: 'OpenAI Impact',
        suggestedProduct: 'EcoTile',
        confidence: 95,
      }),
      chatCoach: jest.fn().mockResolvedValue({
        response: 'OpenAI response',
        searchUsed: false,
        sources: [],
      }),
      optimizePlanner: jest.fn().mockResolvedValue({
        response: 'OpenAI planner response',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        AiProviderFactory,
        {
          provide: GoogleGeminiProvider,
          useValue: mockGeminiProvider,
        },
        {
          provide: OpenAIProvider,
          useValue: mockOpenAIProvider,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AI_PROVIDER') return 'openai';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    factory = module.get<AiProviderFactory>(AiProviderFactory);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Provider Selection & Fail-Closed Behavior', () => {
    it('should select OpenAIProvider when AI_PROVIDER=openai', async () => {
      const provider = factory.getProvider();
      expect(provider.providerName).toBe('openai');

      const result = await service.chatCoach({ message: 'Hello', lang: 'en' });
      expect(result.response).toBe('OpenAI response');
      expect(mockOpenAIProvider.chatCoach).toHaveBeenCalled();
      expect(mockGeminiProvider.chatCoach).not.toHaveBeenCalled();
    });

    it('should select GoogleGeminiProvider when AI_PROVIDER=gemini', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'AI_PROVIDER') return 'gemini';
        return undefined;
      });

      const provider = factory.getProvider();
      expect(provider.providerName).toBe('gemini');

      const result = await service.chatCoach({ message: 'Hello', lang: 'en' });
      expect(result.response).toBe('Gemini response');
      expect(mockGeminiProvider.chatCoach).toHaveBeenCalled();
    });

    it('should fail-closed with 503 AI_PROVIDER_UNAVAILABLE when AI_PROVIDER is missing or unsupported', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'AI_PROVIDER') return 'unsupported-provider';
        return undefined;
      });
      delete process.env.AI_PROVIDER;

      expect(() => factory.getProvider()).toThrow(
        new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE),
      );

      await expect(service.chatCoach({ message: 'Hello', lang: 'en' })).rejects.toThrow(
        new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE),
      );
    });
  });

  describe('Delegation & Contract Integrity', () => {
    it('should delegate scanWaste to active provider', async () => {
      const result = await service.scanWaste({ imageBase64: 'dGVzdA==', lang: 'uz' });
      expect(result.items[0].name).toBe('OpenAI Bottle');
      expect(mockOpenAIProvider.scanWaste).toHaveBeenCalled();
    });

    it('should delegate optimizePlanner to active provider', async () => {
      const result = await service.optimizePlanner({
        query: 'Plan',
        currentStock: { plastic: 100, rubber: 50, paper: 10 },
      });
      expect(result.response).toBe('OpenAI planner response');
      expect(mockOpenAIProvider.optimizePlanner).toHaveBeenCalled();
    });
  });

  describe('DTO Validation Layer', () => {
    it('should accept a ~381 KB EcoScan payload', async () => {
      const largeBase64 = 'A'.repeat(381 * 1024);
      const dto = new ScanDto();
      dto.imageBase64 = largeBase64;
      dto.lang = 'en';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject an oversized Base64 string (>2.5M chars / ~2.38MB) at DTO validation layer', async () => {
      const oversizedBase64 = 'A'.repeat(2500001);
      const dto = new ScanDto();
      dto.imageBase64 = oversizedBase64;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation on empty ScanDto payload', async () => {
      const dto = new ScanDto();
      dto.imageBase64 = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
