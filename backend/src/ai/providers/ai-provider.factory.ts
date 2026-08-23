import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { GoogleGeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';

@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly geminiProvider: GoogleGeminiProvider,
    private readonly openaiProvider: OpenAIProvider,
  ) {}

  getActiveProviderName(): string {
    const raw = this.configService.get<string>('AI_PROVIDER') || process.env.AI_PROVIDER || '';
    return raw.trim().toLowerCase();
  }

  getProvider(): AiProvider {
    const providerName = this.getActiveProviderName();

    switch (providerName) {
      case 'openai':
        return this.openaiProvider;
      case 'gemini':
      case 'google':
        return this.geminiProvider;
      default:
        this.logger.warn(`[AI_PROVIDER_FACTORY] Unconfigured or unsupported AI_PROVIDER='${providerName}'. Failing closed.`);
        throw new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
