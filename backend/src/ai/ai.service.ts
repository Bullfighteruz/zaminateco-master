import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ChatDto } from './dto/chat.dto';
import { ScanDto } from './dto/scan.dto';
import { PlannerDto } from './dto/planner.dto';

export const AI_CHAT_MODEL = 'gemini-3.5-flash-lite';
export const AI_SCAN_MODEL = 'gemini-3.6-flash';
export const AI_PLANNER_MODEL = 'gemini-3.6-flash';

const SCAN_PROMPT = `You are ZAMINAT AI EcoScan — the intelligence gateway for the ZAMINAT Waste-to-Life platform in Uzbekistan.

Your job is to analyze the image, detect ALL waste/recyclable items present, and return structured details about what can be recycled, how to sort it, and its potential output in our production cycle.

You MUST identify multiple items if they are present in the image (e.g. bottles, caps, bags, paper).

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "items": [
    {
      "name": "Specific item description, e.g. 'PET Plastic Bottle', 'Aluminum Can', 'Cardboard Box'",
      "quantity": 1,
      "wasteType": "one of: Plastic, Metal, Glass, Paper, Rubber, Organic, E-waste, Textile, Mixed, Unknown",
      "status": "one of: Accepted, Needs sorting, Not accepted, Needs cleaning",
      "instructions": "actionable instruction, e.g., 'Rinse container and squash', 'Remove PP caps separately'"
    }
  ],
  "totalEstimatedWeightKg": "estimated weight range, e.g. '0.2 - 0.5 kg'",
  "estimatedEcoCoins": 10,
  "moatImpact": "short impact metrics, e.g. 'Saves 0.8 kg of CO₂ emissions and prevents landfill waste.'",
  "suggestedProduct": "Future eco-product it can become, e.g., 'EcoTile / EcoBench / EcoCurb'",
  "confidence": 92
}

Ensure the items array captures everything. If nothing recyclable or waste-related is detected, return an empty array for items.`;

const COACH_SYSTEM_INSTRUCTION = `You are Zami Bot — a highly knowledgeable, smart, and friendly eco-expert and AI assistant for the ZAMINAT.eco platform in Uzbekistan.
Answer in Uzbek, Russian, or English — always match the user's input language.
Provide detailed, structured answers when explaining complex topics. Keep short messages conversational and direct.
Discuss any topic related to ecology, environment, sustainability, and green development worldwide, tying back to Uzbekistan context.`;

const PLANNER_SYSTEM_INSTRUCTION = `You are ZAMINAT AI Production Planner — a logistics optimizer for the ZAMINAT.eco recycling factory in Uzbekistan.
Provide optimized scheduling recommendations for converting recycled materials (PET, Rubber, Paper) into products (benches, pavement tiles, playground tiles).
Base predictions on conversion rates: 1 Bench = 160 kg PET; 1 Pavement Tile (sq m) = 15 kg rubber/plastic.
Keep the tone professional, concise, and focused on operational logistics.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  private getApiKey(): string {
    const key = this.configService.get<string>('GEMINI_API_KEY') || process.env.GEMINI_API_KEY;
    if (!key || key === 'your-api-key-here') {
      throw new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return key;
  }

  async scanWaste(dto: ScanDto) {
    const apiKey = this.getApiKey();
    const langNames: Record<string, string> = {
      uz: 'Uzbek (in Latin script)',
      ru: 'Russian',
      en: 'English',
    };
    const targetLang = langNames[(dto.lang || 'en').substring(0, 2)] || 'English';
    const dynamicPrompt = `${SCAN_PROMPT}\n\nCRITICAL: You MUST write "name", "instructions", "moatImpact" and "suggestedProduct" in ${targetLang}.`;

    try {
      const ai = new GoogleGenAI({ apiKey });

      const base64Data = dto.imageBase64.includes(',') ? dto.imageBase64.split(',')[1] : dto.imageBase64;
      const mimeType = dto.mimeType || 'image/jpeg';

      const response = await ai.models.generateContent({
        model: AI_SCAN_MODEL,
        contents: [
          dynamicPrompt,
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      });

      const text = (response.text || '').trim();
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      return {
        items: Array.isArray(parsed.items) ? parsed.items.map((item: any) => ({
          name: item.name || 'Unidentified item',
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          wasteType: item.wasteType || 'Unknown',
          status: ['Accepted', 'Needs sorting', 'Not accepted', 'Needs cleaning'].includes(item.status) ? item.status : 'Accepted',
          instructions: item.instructions || '',
        })) : [],
        totalEstimatedWeightKg: parsed.totalEstimatedWeightKg || '0.1 - 0.3 kg',
        estimatedEcoCoins: typeof parsed.estimatedEcoCoins === 'number' ? parsed.estimatedEcoCoins : 10,
        moatImpact: parsed.moatImpact || '',
        suggestedProduct: parsed.suggestedProduct || 'EcoTile',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 90,
      };
    } catch (err: any) {
      this.logger.error('scanWaste error:', err.message);
      if (err instanceof SyntaxError) {
        throw new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }

  async chatCoach(dto: ChatDto) {
    const apiKey = this.getApiKey();
    try {
      const ai = new GoogleGenAI({ apiKey });
      let systemInstruction = COACH_SYSTEM_INSTRUCTION;

      if (dto.userInfo) {
        const { displayName, coins, points, level, location, school } = dto.userInfo;
        systemInstruction += `\n\nUSER CONTEXT: Name: ${displayName || 'User'}, Coins: ${coins || 0}, Points: ${points || 0}, Level: ${level || 1}, Location: ${location || 'Uzbekistan'}, School: ${school || 'General'}`;
      }

      const safeHistory = (dto.history || []).slice(-20).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts.map(p => ({ text: p.text.slice(0, 2000) })),
      }));

      const contents = [
        ...safeHistory,
        { role: 'user', parts: [{ text: dto.message.slice(0, 2000) }] },
      ];

      const response = await ai.models.generateContent({
        model: AI_CHAT_MODEL,
        config: {
          systemInstruction,
        },
        contents,
      });

      return { response: response.text || '' };
    } catch (err: any) {
      this.logger.error('chatCoach error:', err.message);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }

  async optimizePlanner(dto: PlannerDto) {
    const apiKey = this.getApiKey();
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Current Stock: Plastic/PET: ${dto.currentStock.plastic || 0} kg, Rubber: ${dto.currentStock.rubber || 0} kg, Paper: ${dto.currentStock.paper || 0} kg. User Request: ${dto.query.slice(0, 1000)}`;

      const response = await ai.models.generateContent({
        model: AI_PLANNER_MODEL,
        config: {
          systemInstruction: PLANNER_SYSTEM_INSTRUCTION,
        },
        contents: prompt,
      });

      return { response: response.text || '' };
    } catch (err: any) {
      this.logger.error('optimizePlanner error:', err.message);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }
}
