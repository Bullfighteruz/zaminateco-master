import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHealth() {
    const activeProvider = (this.configService.get<string>('AI_PROVIDER') || 'unconfigured').toLowerCase();

    return {
      status: 'ok',
      service: 'zaminat-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      aiProvider: activeProvider,
    };
  }
}
