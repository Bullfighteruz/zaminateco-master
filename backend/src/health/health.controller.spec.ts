import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';

describe('HealthController Unit Tests', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
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

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status with active AI provider', () => {
    const health = controller.getHealth();
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('service', 'zaminat-backend');
    expect(health).toHaveProperty('aiProvider', 'openai');
    expect(typeof health.uptimeSeconds).toBe('number');
    expect(health).toHaveProperty('timestamp');
  });
});
