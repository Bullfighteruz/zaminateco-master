import { Injectable, Logger } from '@nestjs/common';
import { ScanDto } from './dto/scan.dto';
import { ChatDto } from './dto/chat.dto';
import { PlannerDto } from './dto/planner.dto';
import { AiProviderFactory } from './providers/ai-provider.factory';
import { ScanResult, ChatResult, PlannerResult } from './interfaces/ai-provider.interface';
import { GEMINI_CHAT_MODEL, GEMINI_SCAN_MODEL, GEMINI_PLANNER_MODEL } from './providers/gemini.provider';
import { ScanGuard } from './utils/scan-guard';

export const AI_CHAT_MODEL = GEMINI_CHAT_MODEL;
export const AI_SCAN_MODEL = GEMINI_SCAN_MODEL;
export const AI_PLANNER_MODEL = GEMINI_PLANNER_MODEL;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerFactory: AiProviderFactory) {}

  async scanWaste(dto: ScanDto): Promise<ScanResult> {
    const provider = this.providerFactory.getProvider();
    const rawResult = await provider.scanWaste(dto);
    return ScanGuard.sanitize(rawResult, dto.lang || 'en');
  }

  async chatCoach(dto: ChatDto): Promise<ChatResult> {
    const provider = this.providerFactory.getProvider();
    return provider.chatCoach(dto);
  }

  async optimizePlanner(dto: PlannerDto): Promise<PlannerResult> {
    const provider = this.providerFactory.getProvider();
    return provider.optimizePlanner(dto);
  }
}
