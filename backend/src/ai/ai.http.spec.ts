import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiScan HTTP Body-Parser Integration Test (E2E)', () => {
  let app: INestApplication;
  let mockAiService: Partial<AiService>;

  beforeAll(async () => {
    mockAiService = {
      scanWaste: jest.fn().mockResolvedValue({
        items: [{ name: 'PET Bottle', quantity: 1, wasteType: 'Plastic', status: 'Accepted', instructions: 'Rinse' }],
        totalEstimatedWeightKg: '0.1 kg',
        estimatedEcoCoins: 10,
        moatImpact: 'Saves CO2',
        suggestedProduct: 'EcoTile',
        confidence: 95,
      }),
      chatCoach: jest.fn().mockResolvedValue({ response: 'Chat response' }),
      optimizePlanner: jest.fn().mockResolvedValue({ response: 'Planner response' }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();

    // Production-identical HTTP body-parser configuration (3MB limit)
    (app as NestExpressApplication).useBodyParser('json', { limit: '3mb' });
    (app as NestExpressApplication).useBodyParser('urlencoded', { limit: '3mb', extended: true });

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('A) PROOF: ~381 KB production JSON request passes HTTP body-parser (NOT 413) and reaches controller boundary', async () => {
    // 381 KB Base64 string payload
    const payload381KB = 'A'.repeat(381 * 1024);

    const response = await request(app.getHttpServer())
      .post('/api/v1/ai/scan')
      .send({
        imageBase64: payload381KB,
        lang: 'en',
        mimeType: 'image/jpeg',
      });

    expect(response.status).not.toBe(413);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(mockAiService.scanWaste).toHaveBeenCalled();
  });

  it('B) PROOF: Intentionally oversized JSON payload (>3.2 MB) is rejected cleanly with HTTP 413 Payload Too Large', async () => {
    // 3.5 MB Base64 string payload (exceeds 3MB HTTP JSON limit)
    const payloadOversized = 'A'.repeat(Math.floor(3.5 * 1024 * 1024));

    const response = await request(app.getHttpServer())
      .post('/api/v1/ai/scan')
      .send({
        imageBase64: payloadOversized,
        lang: 'en',
        mimeType: 'image/jpeg',
      });

    expect(response.status).toBe(413);
  });

  it('C) PROOF: Empty image payload returns HTTP 400 Bad Request validation error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/ai/scan')
      .send({
        imageBase64: '',
        lang: 'en',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
