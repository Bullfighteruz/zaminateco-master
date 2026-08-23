import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OpenAIProvider } from './openai.provider';
import OpenAI from 'openai';

jest.mock('openai');

describe('OpenAIProvider Multi-Turn Context & GPT-5.6 Responses API Unit Tests', () => {
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

  describe('Multi-Turn Context Preservation & Elliptical Follow-Ups (Phase 2 & Phase 7 Matrix)', () => {
    it('Case A (Live Failure Reproduction): History=EcoScan, Follow-up="А зачем это нужно детям?" preserves 3 turns with user/assistant/user roles', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_1',
        output_text: 'EcoScan помогает детям учиться сортировке мусора в игровой форме.',
        output: [],
      });

      const result = await provider.chatCoach({
        message: 'А зачем это нужно детям?',
        history: [
          {
            role: 'user',
            parts: [{ text: 'Что такое EcoScan в экосистеме ZAMINAT.eco?' }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'EcoScan — это функция ZAMINAT.eco для распознавания типа вторичных материалов по фотографии.',
              },
            ],
          },
        ],
        lang: 'ru',
      });

      expect(result.response).toContain('EcoScan');
      expect(result.searchUsed).toBe(false);
      expect(result.sources).toEqual([]);

      // Verify exact input messages shape passed to client.responses.create
      expect(mockResponsesCreate).toHaveBeenCalledTimes(1);
      const callParams = mockResponsesCreate.mock.calls[0][0];

      // DTO_HISTORY_RECEIVED = 2, FINAL_INPUT_MESSAGE_COUNT = 3
      expect(callParams.input.length).toBe(3);
      expect(callParams.input[0]).toEqual({
        role: 'user',
        content: 'Что такое EcoScan в экосистеме ZAMINAT.eco?',
      });
      expect(callParams.input[1]).toEqual({
        role: 'assistant',
        content: 'EcoScan — это функция ZAMINAT.eco для распознавания типа вторичных материалов по фотографии.',
      });
      expect(callParams.input[2]).toEqual({
        role: 'user',
        content: 'А зачем это нужно детям?',
      });

      // Assert MODEL_TO_ASSISTANT_MAPPING
      const roles = callParams.input.map((i: any) => i.role).join(',');
      expect(roles).toBe('user,assistant,user');

      // Assert system continuity rule is present in instructions
      expect(callParams.instructions).toContain('CONVERSATIONAL CONTINUITY & ELLIPTICAL FOLLOW-UPS');

      // Assert no search tool
      expect(callParams.tools).toBeUndefined();
    });

    it('Case B: History=PET, Follow-up="А почему его сортируют отдельно?" correctly maintains PET context without search', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_2',
        output_text: 'PET сортируют отдельно, так как его перерабатывают в гранулы для производства эко-скамеек.',
        output: [],
      });

      const result = await provider.chatCoach({
        message: 'А почему его сортируют отдельно?',
        history: [
          { role: 'user', parts: [{ text: 'Что такое пластик PET?' }] },
          { role: 'model', parts: [{ text: 'PET (полиэтилентерефталат) — это термопластик для бутылок.' }] },
        ],
        lang: 'ru',
      });

      expect(result.response).toContain('PET');
      expect(result.searchUsed).toBe(false);

      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.input.length).toBe(3);
      expect(callParams.input[1].role).toBe('assistant');
      expect(callParams.tools).toBeUndefined();
    });

    it('Case C: History=rubber, Follow-up="А что из него можно сделать?" correctly maintains rubber context', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_3',
        output_text: 'Из переработанной резины на ZAMINAT.eco производят тротуарную и детскую плитку.',
        output: [],
      });

      const result = await provider.chatCoach({
        message: 'А что из него можно сделать?',
        history: [
          { role: 'user', parts: [{ text: 'Как ZAMINAT перерабатывает резину?' }] },
          { role: 'model', parts: [{ text: 'Мы измельчаем старые шины в резиновую крошку.' }] },
        ],
        lang: 'ru',
      });

      expect(result.response).toContain('плитку');
      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.input.length).toBe(3);
      expect(callParams.input[1].role).toBe('assistant');
    });

    it('Case D: History=EcoKids, Follow-up="Почему это полезно ребенку?" maintains EcoKids context', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_4',
        output_text: 'EcoKids прививает полезные эко-привычки с раннего возраста.',
        output: [],
      });

      await provider.chatCoach({
        message: 'Почему это полезно ребенку?',
        history: [
          { role: 'user', parts: [{ text: 'Что такое программа EcoKids?' }] },
          { role: 'model', parts: [{ text: 'EcoKids — это образовательное направление ZAMINAT для школьников.' }] },
        ],
        lang: 'ru',
      });

      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.input.length).toBe(3);
      expect(callParams.input[0].content).toContain('EcoKids');
    });

    it('Case E (English): History=EcoScan, Follow-up="What about children?" preserves context in English', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_5',
        output_text: 'EcoScan helps children learn waste sorting visually.',
        output: [],
      });

      await provider.chatCoach({
        message: 'What about children?',
        history: [
          { role: 'user', parts: [{ text: 'What is EcoScan?' }] },
          { role: 'model', parts: [{ text: 'EcoScan is an AI camera feature to identify recyclables.' }] },
        ],
        lang: 'en',
      });

      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.input.length).toBe(3);
      expect(callParams.input[2].content).toBe('What about children?');
    });

    it('Case F (Uzbek): History=EcoScan, Follow-up="Bu bolalarga nima uchun kerak?" preserves context in Uzbek', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_6',
        output_text: "EcoScan bolalarga chiqindilarni to'g'ri saralashni o'rgatadi.",
        output: [],
      });

      await provider.chatCoach({
        message: 'Bu bolalarga nima uchun kerak?',
        history: [
          { role: 'user', parts: [{ text: 'EcoScan nima?' }] },
          { role: 'model', parts: [{ text: 'EcoScan bu suratlardan chiqindilarni aniqlovchi AI vositasi.' }] },
        ],
        lang: 'uz',
      });

      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.input.length).toBe(3);
      expect(callParams.input[2].content).toBe('Bu bolalarga nima uchun kerak?');
    });

    it('Case G: Ambiguous context with multiple distinct subjects receives history normally', async () => {
      mockResponsesCreate.mockResolvedValue({
        id: 'resp_multi_7',
        output_text: 'Уточните, речь идет о стекле или батарейках?',
        output: [],
      });

      const result = await provider.chatCoach({
        message: 'А это безопасно?',
        history: [
          { role: 'user', parts: [{ text: 'Расскажите про переработку стекла и утилизацию ртутных батареек.' }] },
          { role: 'model', parts: [{ text: 'Стекло переплавляется, а батарейки требуют нейтрализации опасных солей.' }] },
        ],
        lang: 'ru',
      });

      expect(result.response).toBeDefined();
      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.input.length).toBe(3);
    });
  });

  describe('EcoScan (scanWaste) with GPT-5.6-Terra and Reasoning Effort', () => {
    it('should call Responses API with model=gpt-5.6-terra, input_image, structured JSON schema, reasoning.effort=low, and NO temperature/top_p', async () => {
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

      // Verify GPT-5.6 parameter compatibility
      expect(mockResponsesCreate).toHaveBeenCalledTimes(1);
      const callParams = mockResponsesCreate.mock.calls[0][0];

      expect(callParams.model).toBe('gpt-5.6-terra');
      expect(callParams.reasoning).toEqual({ effort: 'low' });
      expect(callParams.temperature).toBeUndefined();
      expect(callParams.top_p).toBeUndefined();

      // Verify input_image multimodal structure
      const inputContent = callParams.input[0].content;
      const imageItem = inputContent.find((c: any) => c.type === 'input_image');
      expect(imageItem).toBeDefined();
      expect(imageItem.image_url).toBe('data:image/jpeg;base64,dGVzdA==');

      // Verify strict structured output
      expect(callParams.text.format).toEqual(
        expect.objectContaining({
          type: 'json_schema',
          name: 'ecoscan_detection_result',
          strict: true,
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

      const callParams = mockResponsesCreate.mock.calls[0][0];
      expect(callParams.model).toBe('gpt-5.6-luna');
      expect(callParams.reasoning).toEqual({ effort: 'low' });
      expect(callParams.temperature).toBeUndefined();
      expect(callParams.top_p).toBeUndefined();
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
      expect(callParams.model).toBe('gpt-5.6-luna');
      expect(callParams.reasoning).toEqual({ effort: 'low' });
      expect(callParams.temperature).toBeUndefined();
      expect(callParams.tools).toEqual([{ type: 'web_search_preview' }]);
      expect(callParams.include).toEqual(['web_search_call.action.sources']);
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
      expect(callParams.input.length).toBe(21);
      expect(callParams.input[callParams.input.length - 1].content).toBe('Current question');
      expect(callParams.reasoning).toEqual({ effort: 'low' });
      expect(callParams.temperature).toBeUndefined();
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

  describe('Production Planner (optimizePlanner) with GPT-5.6-Luna and Reasoning Effort', () => {
    it('should call Responses API with model=gpt-5.6-luna, reasoning.effort=low, NO temperature, and NO top_p', async () => {
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
      expect(mockResponsesCreate).toHaveBeenCalledTimes(1);
      const callParams = mockResponsesCreate.mock.calls[0][0];

      expect(callParams.model).toBe('gpt-5.6-luna');
      expect(callParams.reasoning).toEqual({ effort: 'low' });
      expect(callParams.temperature).toBeUndefined();
      expect(callParams.top_p).toBeUndefined();
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
