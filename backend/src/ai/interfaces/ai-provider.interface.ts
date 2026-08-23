import { ScanDto } from '../dto/scan.dto';
import { ChatDto } from '../dto/chat.dto';
import { PlannerDto } from '../dto/planner.dto';

export type WasteStatus = 'Accepted' | 'Needs sorting' | 'Not accepted' | 'Needs cleaning';

export interface DetectedItem {
  name: string;
  quantity: number;
  wasteType: string;
  status: WasteStatus;
  instructions: string;
}

export interface ScanResult {
  items: DetectedItem[];
  totalEstimatedWeightKg: string;
  estimatedEcoCoins: number;
  moatImpact: string;
  suggestedProduct: string;
  confidence: number;
}

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatResult {
  response: string;
  searchUsed: boolean;
  sources: ChatSource[];
}

export interface PlannerResult {
  response: string;
}

export interface AiProvider {
  readonly providerName: string;
  scanWaste(dto: ScanDto): Promise<ScanResult>;
  chatCoach(dto: ChatDto): Promise<ChatResult>;
  optimizePlanner(dto: PlannerDto): Promise<PlannerResult>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';
