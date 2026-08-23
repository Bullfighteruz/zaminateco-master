import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OpenAIProvider } from './openai.provider';
import OpenAI from 'openai';

jest.mock('openai');

describe('OpenAIProvider Responses API Unit Tests', () => {
  let provider: OpenAIProvider;
  let configService: ConfigService;
  let mockResponsesCreate: jest.Mock;

  beforeEach(async () => {
    mockResponsesCreate = jest.fn();
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: {
        create: mockResponsesCreate,
      },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              if (key === 'OPENAI_API_KEY') return 'test-dummy-openai-key';
              if (key === 'OPENAI_CHAT_MODEL') return 'gpt-5.6-luna';
              if (key === 'OPENAI_SCAN_MODEL') return 'gpt-5.6-terra';
              if (key === 'OPENAI_PLANNER_MODEL') return 'gpt-5.6-luna';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<OpenAIProvider>(OpenAIProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Credentials & Fail-Closed Behavior', () => {
    it('should throw AI_PROVIDER_UNAVAILABLE (503) when OPENAI_API_KEY is missing', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('');
      delete process.env.OPENAI_API_KEY;

      await expect(
        provider.chatCoach({ message: 'Hello', lang: 'en' }),
      ).rejects.toThrow(
        new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE),
      );
    });

    it('should throw AI_PROVIDER_UNAVAILABLE (503) when OPENAI_API_KEY is placeholder value', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('your-openai-api-key-here');

      await expect(
        provider.chatCoach({ message: 'Hello', lang: 'en' }),
      ).rejects.toThrow(
        new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE),
      );
    });
  });

  describe('EcoScan (scanWaste) with Responses API', () => {
    it('should successfully parse valid structured JSON output from Responses API', async () => {
      const mockResult = {
        items: [
          {
            name: 'PET Plastic Bottle',
            quantity: 2,
            wasteType: 'Plastic',
            status: 'Accepted',
            instructions: 'Rinse and crush container',
          },
        ],
        totalEstimatedWeightKg: '0.2 - 0.4 kg',
        estimatedEcoCoins: 20,
        moatImpact: 'Saves 0.5 kg CO2',
        suggestedProduct: 'EcoTile',
        confidence: 95,
      };

      mockResponsesCreate.mockResolvedValue({
        id: 'resp_123',
        output_text: JSON.stringify(mockResult),
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: JSON.stringify(mockResult) }],
          },
        ],
      });

      const result = await provider.scanWaste({
        imageBase64: 'data:image/jpeg;base64,dGVzdA==',
        lang: 'uz',
        mimeType: 'image/jpeg',
      });

      expect(result).toBeDefined();
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe('PET Plastic Bottle');
      expect(result.items[0].wasteType).toBe('Plastic');
      expect(result.items[0].status).toBe('Accepted');
      expect(result.estimatedEcoCoins).toBe(20);
      expect(result.confidence).toBe(95);

      // Verify Responses API parameter structure (model, multimodal input, text format)
      expect(mockResponsesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5.6-terra',
          text: expect.objectContaining({
            format: expect.objectContaining({
              type: 'json_schema',
              name: 'ecoscan_detection_result',
              strict: true,
            }),
          }),
        }),
      );
    });

    it('should throw 422 INVALID_MODEL_OUTPUT on malformed or non-JSON output', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_123',
        output_text: 'Not valid JSON',
      });

      await expect(
        provider.scanWaste({
          imageBase64: 'dGVzdA==',
          lang: 'en',
        }),
      ).rejects.toThrow(
        new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY),
      );
    });

    it('should throw 422 INVALID_MODEL_OUTPUT when Responses API returns empty output_text', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_123',
        output_text: null,
      });

      await expect(
        provider.scanWaste({
          imageBase64: 'dGVzdA==',
          lang: 'en',
        }),
      ).rejects.toThrow(
        new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY),
      );
    });
  });

  describe('Zami Bot (chatCoach) & Real Search Semantics with Responses API', () => {
    it('should NOT invoke web_search tool when shouldSearch is false (greeting/definition/followup)', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_chat_1',
        output_text: 'Plastik idishlarni saralash kerak.',
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: 'Plastik idishlarni saralash kerak.' }],
          },
        ],
      });

      const result = await provider.chatCoach({
        message: 'What is EcoScan?',
        lang: 'en',
      });

      expect(result.response).toBe('Plastik idishlarni saralash kerak.');
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);

      // Verify no web search tool was supplied in tools
      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.tools).toBeUndefined();
    });

    it('should invoke web_search tool and extract citations when search query is executed', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_chat_2',
        output_text: 'Bugun Toshkentda AQI 42, havo sifati toza.',
        output: [
          {
            type: 'web_search_call',
            id: 'call_123',
          },
          {
            type: 'message',
            role: 'assistant',
            content: [
              {
                type: 'text',
                text: 'Bugun Toshkentda AQI 42, havo sifati toza.',
                annotations: [
                  {
                    type: 'url_citation',
                    title: 'IQAir Tashkent Air Quality',
                    url: 'https://iqair.com/uzbekistan/tashkent',
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = await provider.chatCoach({
        message: 'AQI in Tashkent right now',
        lang: 'en',
      });

      expect(result.response).toBe('Bugun Toshkentda AQI 42, havo sifati toza.');
      expect(result.searchUsed).toBe(true);
      expect(result.sources).toEqual([
        {
          title: 'IQAir Tashkent Air Quality',
          url: 'https://iqair.com/uzbekistan/tashkent',
        },
      ]);

      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.tools).toEqual([{ type: 'web_search_preview' }]);
      expect(callParams.include).toEqual(['web_search_call.action.sources']);
    });

    it('should return searchUsed=false if search tool was requested but provider returned no citations/search calls', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_chat_3',
        output_text: 'Hozirgi vaqtda monitoring ma\'lumotlari mavjud emas.',
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [
              {
                type: 'text',
                text: 'Hozirgi vaqtda monitoring ma\'lumotlari mavjud emas.',
                annotations: [],
              },
            ],
          },
        ],
      });

      const result = await provider.chatCoach({
        message: 'Latest environmental news today in Uzbekistan',
        lang: 'uz',
      });

      expect(result.response).toBe("Hozirgi vaqtda monitoring ma'lumotlari mavjud emas.");
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);
    });

    it('should normalize conversation history and cap at 20 turns', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_chat_4',
        output_text: 'History acknowledged.',
        output: [],
      });

      const largeHistory = Array.from({ length: 30 }, (_, i) => ({
        role: (i % 2 === 0 ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: `Turn message ${i}` }],
      }));

      await provider.chatCoach({
        message: 'Current question',
        history: largeHistory,
        lang: 'ru',
      });

      const callParams = mockResponsesCreate.mock.calls[0][0];
      // 20 historical turns + 1 current message = 21 input items
      expect(callParams.input.length).toBe(21);
      expect(callParams.input[callParams.input.length - 1].content).toBe('Current question');
    });

    it('should deduplicate current message from history tail', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_chat_5',
        output_text: 'No duplicate.',
        output: [],
      });

      await provider.chatCoach({
        message: 'Repeated question',
        history: [
          { role: 'user', parts: [{ text: 'Old question' }] },
          { role: 'user', parts: [{ text: 'Repeated question' }] },
        ],
        lang: 'en',
      });

      const callParams = mockResponsesCreate.mock.calls[0][0];
      // 1 old question + 1 current question = 2 input items
      expect(callParams.input.length).toBe(2);
    });

    it('should support RU, UZ, and EN paths cleanly', async () => {
      for (const lang of ['uz', 'ru', 'en']) {
        mockResponsesCreate.mockResolvedValue({
          id: `resp_${lang}`,
          output_text: `Response in ${lang}`,
          output: [],
        });

        const res = await provider.chatCoach({
          message: `Question in ${lang}`,
          lang,
        });

        expect(res.response).toBe(`Response in ${lang}`);
      }
    });

    it('should sanitize bot name prefixes like "Zami Bot:" from output', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_prefix',
        output_text: 'Zami Bot: Havo sifati me\'yorda.',
        output: [],
      });

      const result = await provider.chatCoach({
        message: 'Havo qanday?',
        lang: 'uz',
      });

      expect(result.response).toBe("Havo sifati me'yorda.");
    });
  });

  describe('Production Planner (optimizePlanner) with Responses API', () => {
    it('should optimize schedule based on stock and query', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_planner',
        output_text: 'Tavsiya: 10 ta EcoBench va 50 m² EcoTile ishlab chiqarish rejalashtirildi.',
        output: [],
      });

      const result = await provider.optimizePlanner({
        query: 'Reja tuzing',
        currentStock: { plastic: 1600, rubber: 500, paper: 100 },
      });

      expect(result.response).toContain('EcoBench');
      expect(mockResponsesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5.6-luna',
        }),
      );
    });
  });

  describe('Error Sanitization', () => {
    it('should throw normalized 502 AI_PROVIDER_ERROR on upstream error without leaking secrets', async () => {
      mockResponsesCreate.mockRejectedValue(
        new Error('Unauthorized: mock-error-token-for-test was rejected'),
      );

      await expect(
        provider.chatCoach({ message: 'Test error', lang: 'en' }),
      ).rejects.toThrow(
        new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY),
      );
    });
  });
});
