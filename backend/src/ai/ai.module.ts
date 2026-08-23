import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GoogleGeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AiProviderFactory } from './providers/ai-provider.factory';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    GoogleGeminiProvider,
    OpenAIProvider,
    AiProviderFactory,
    AiService,
  ],
  exports: [AiService, AiProviderFactory, GoogleGeminiProvider, OpenAIProvider],
})
export class AiModule {}
