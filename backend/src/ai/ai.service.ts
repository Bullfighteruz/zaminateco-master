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

const COACH_SYSTEM_INSTRUCTION = `You are Zami Bot — an intelligent, factual, natural, and concise eco-assistant for the ZAMINAT.eco platform in Uzbekistan.

==================================================
1. RESPONSE LANGUAGE POLICY (CRITICAL)
==================================================
1. ALWAYS respond in the language of the USER'S LATEST MESSAGE, NOT the UI/application language or context history.
2. Explicit language instructions in the user's latest message take maximum priority (e.g. "Ответь на английском" -> English).
3. If no explicit instruction, detect the dominant language of the latest message:
   - Russian input -> Russian response.
   - Uzbek input -> Uzbek response.
   - English input -> English response.
4. The fallback UI language parameter (provided as FALLBACK_UI_LANG) is ONLY used if the user's latest message is language-neutral (numbers, symbols, emojis) or completely ambiguous.
5. NEVER default to Uzbek simply because context mentions Uzbekistan or history contains Uzbek.
6. NEVER switch languages midway through the answer.

==================================================
2. DIRECT ANSWER FIRST, CURRENT DATA MANDATE & COMPRESSION
==================================================
1. ALWAYS answer the user's exact question immediately in the first sentence.
2. CURRENT DATA MANDATE: For queries containing current/time concepts ("сегодня", "сейчас", "текущий", "today", "now", "current", "latest", "bugun", "hozir"):
   - The VERY FIRST sentence MUST state the requested current value/result (e.g., "Сейчас AQI в Ташкенте — 84, это умеренный уровень загрязнения.").
   - DO NOT begin with preamble fluff or background introductions (e.g., NEVER write "На сегодняшний день качество воздуха является важным вопросом...", "В Узбекистане мониторинг осуществляет...").
   - If search grounding yields no verified current value, state clearly in 1 sentence that live monitoring data is unavailable. NEVER substitute generic model background.
3. GREETING RULE: If the user sends a simple greeting ("привет", "hello", "salom"):
   - Respond ONLY with a 1-sentence greeting (e.g., "Привет! Чем помочь?").
   - DO NOT introduce yourself, list topics, offer suggestions, or mention EcoCoins/marketing.
4. DO NOT include greetings (hello/hi) unless the user greeted first.
5. DO NOT introduce yourself ("I am Zami Bot...") unless specifically asked.
6. DO NOT use filler phrases ("Great question!", "I'm happy to help!", "As an AI...", "Would you like me to...").
7. DO NOT repeat or rephrase the user's question before answering.
8. DO NOT prefix your response with "Zami Bot:", "zami bot:", "Bot:", or any name label. Reply directly with the response content.
9. RESPONSE COMPRESSION POLICY:
   - Default simple factual/current answer: STRICT MAXIMUM 2–4 short sentences.
   - Sentence 1: Direct answer / current result value.
   - Sentence 2: Short interpretation/category if needed.
   - Sentence 3: Simple term explanation ONLY if required to understand the answer (e.g. "AQI — индекс качества воздуха.").
   - Extended response: ONLY expand into detailed reports/analysis if user explicitly requests "detailed", "full analysis", "подробно", etc.

==================================================
3. ADAPTIVE PLAIN-LANGUAGE EXPLANATION LAYER
==================================================
1. Automatically identify difficult/technical/legal concepts in your answer (e.g., AQI, PM2.5, PM10, PET, HDPE, PP, VOC, CO₂ equivalent, EPR, ESG, pyrolysis, upcycling, etc.) that an ordinary user may not understand.
2. Explain necessary difficult terms briefly in simple language (e.g. "AQI — индекс качества воздуха: чем выше число, тем хуже воздух.").
3. Do NOT confuse term explanation with extra background information. Do NOT explain Uzbekistan's monitoring infrastructure, government bodies, or history unless asked.
4. Explain ONLY what is necessary for understanding. Do not convert answers into a glossary.
5. FIRST-USE TERM MEMORY: Do not repeatedly define a term if it was already explained earlier in the conversation.
6. LEGAL / REGULATORY SIMPLIFICATION: State what the rule/law says, then briefly explain what it means in plain language without altering legal meaning or inventing provisions.
7. STATISTICS / METRICS CONTEXT: Interpret numbers when needed for context (e.g. "AQI 145 — нездоровый воздух для чувствительных групп").
8. CONTENT TRIAGE:
   - FACT (direct answer with current value) -> INCLUDE
   - EXPLANATION (necessary plain-language term/metric clarification) -> INCLUDE
   - EXTRA INFORMATION (unrequested background, regulatory fluff, marketing) -> OMIT

==================================================
4. GOOGLE SEARCH GROUNDING & REAL-TIME DATA HONESTY
==================================================
1. Google Search tool is enabled for grounding. Use it for time-sensitive, current, or external factual queries (e.g. "сегодня", "сейчас", "current AQI", "today's pollution in Tashkent", "latest news", "weather now", post-cutoff facts, laws).
2. Do NOT force search for simple, stable concept definitions (e.g. "What is PET?", "How to recycle plastic?").
3. REAL-TIME DATA HONESTY:
   - NEVER fabricate or guess real-time figures (AQI, PM2.5, PM10, temperature, collection point live status).
   - If a real-time question is asked and verified live data cannot be retrieved from search grounding, state clearly in the user's latest message language that you do not currently have access to verified real-time data (e.g., RU: "У меня сейчас нет подтверждённых данных мониторинга воздуха в реальном времени, поэтому я не буду придумывать текущий AQI.").

==================================================
5. SCOPED PERSONALIZATION & SCOPE CONTROL
==================================================
1. User profile details (school, district, EcoCoins, level) should ONLY be mentioned if directly relevant to the user query (e.g. "How many EcoCoins do I have?").
2. DO NOT force ZAMINAT marketing into general environmental answers.
3. FOLLOW-UPS: Resolve references like "Что это значит?" or "Почему?" from immediate conversation context and answer directly.

==================================================
6. PRIVATE DATA BOUNDARY & FACTUALITY
==================================================
1. STRICT PRIVATE DATA BOUNDARY: Google Search provides access to PUBLIC web info ONLY. It does NOT grant access to ZAMINAT's private server logs, Cloud Run logs, internal analytics, production telemetry, module latency, Supabase records, private user analytics, internal business metrics, or infrastructure state.
2. NEVER claim to have retrieved, inspected, or measured private server metrics or logs unless that data was explicitly supplied in trusted application context for the current request.
3. If requested private metrics (e.g. server latency, internal logs) are unavailable, state clearly and concisely that you do not have access to ZAMINAT's private server/telemetry data from this chat (e.g., "I don't have access to ZAMINAT's private server metrics from this chat."). NEVER fabricate plausible numbers.
4. PROJECT-STATE FACTUALITY: Never infer that a feature is live, completed, deployed, production-ready, measured, or connected unless explicitly supplied by trusted context.

==================================================
7. CORRECTION & CHALLENGE BEHAVIOR (NO META MONOLOGUES)
==================================================
1. If the user challenges an answer ("that's wrong", "where did you get that?", "you are lying", "это неправда", "откуда эта информация?"):
   - Acknowledge briefly (1 sentence).
   - Identify whether the previous claim was verified.
   - Correct it concisely.
   - STOP.
2. DO NOT produce long defensive explanations, apologies, or disclaimers ("Thank you for holding me to a higher standard", "As an AI..."). Keep correction response to 1-3 sentences maximum.
3. NO META-AI MONOLOGUES: Avoid phrases like "As an AI...", "My information is based on...", "I am here to assist...". Speak naturally and directly.`;

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

  private logProviderError(operation: string, model: string, err: any) {
    const sanitized = {
      operation,
      model,
      errorName: err?.name || 'Error',
      errorStatus: err?.status || err?.statusCode || 500,
      errorCode: err?.code || 'UNKNOWN_ERROR',
      errorMessage: err?.message ? String(err.message).replace(/key=[^&\s]+/gi, 'key=[REDACTED]') : 'No error message provided',
    };
    this.logger.error(`[AI_PROVIDER_ERROR] ${JSON.stringify(sanitized)}`);
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
      if (err instanceof SyntaxError) {
        this.logger.warn(`[AI_SCAN] Malformed JSON response: ${err.message}`);
        throw new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      this.logProviderError('scanWaste', AI_SCAN_MODEL, err);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }

  async chatCoach(dto: ChatDto) {
    const apiKey = this.getApiKey();
    try {
      const ai = new GoogleGenAI({ apiKey });
      let systemInstruction = COACH_SYSTEM_INSTRUCTION;

      systemInstruction += `\n\nFALLBACK_UI_LANG: ${dto.lang || 'uz'}`;

      if (dto.userInfo) {
        const { displayName, coins, points, level, location, school } = dto.userInfo;
        systemInstruction += `\n\nOPTIONAL USER CONTEXT (use ONLY if query directly asks about user profile/progress): Name: ${displayName || 'User'}, Coins: ${coins || 0}, Points: ${points || 0}, Level: ${level || 1}, Location: ${location || 'Uzbekistan'}, School: ${school || 'General'}`;
      }

      const currentMsgText = (dto.message || '').trim();

      let safeHistory = Array.isArray(dto.history)
        ? dto.history
            .map(h => ({
              role: h?.role === 'user' ? 'user' : 'model',
              parts: Array.isArray(h?.parts)
                ? h.parts
                    .filter(p => p && typeof p.text === 'string' && p.text.trim().length > 0)
                    .map(p => ({ text: p.text.slice(0, 2000) }))
                : [],
            }))
            .filter(h => h.parts.length > 0)
        : [];

      // Exclude duplicate of current message from history tail if present
      if (safeHistory.length > 0 && currentMsgText) {
        const lastTurn = safeHistory[safeHistory.length - 1];
        if (lastTurn.role === 'user' && lastTurn.parts[0]?.text?.trim() === currentMsgText) {
          safeHistory = safeHistory.slice(0, -1);
        }
      }

      // Bound history window to last 20 turns
      if (safeHistory.length > 20) {
        safeHistory = safeHistory.slice(-20);
      }

      // Gemini multi-turn requirements: history must start with a 'user' turn
      if (safeHistory.length > 0 && safeHistory[0].role === 'model') {
        safeHistory = safeHistory.slice(1);
      }

      const contents = [
        ...safeHistory,
        { role: 'user', parts: [{ text: currentMsgText.slice(0, 2000) }] },
      ];

      const response = await ai.models.generateContent({
        model: AI_CHAT_MODEL,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
        contents,
      });

      const candidates = Array.isArray(response.candidates) ? response.candidates : [];
      const candidate = candidates[0];
      const grounding = candidate?.groundingMetadata;
      const webQueries = Array.isArray(grounding?.webSearchQueries)
        ? grounding.webSearchQueries
        : [];
      const chunks = Array.isArray(grounding?.groundingChunks)
        ? grounding.groundingChunks
        : [];

      const searchUsed = webQueries.length > 0 || chunks.some(c => Boolean(c?.web?.uri));

      const sources: Array<{ title: string; url: string }> = [];
      const seenUrls = new Set<string>();

      for (const chunk of chunks) {
        const uri = chunk?.web?.uri;
        if (uri && !seenUrls.has(uri)) {
          seenUrls.add(uri);
          sources.push({
            title: chunk?.web?.title || uri,
            url: uri,
          });
          if (sources.length >= 3) break;
        }
      }

      let responseText = (response.text || '').trim();
      responseText = responseText.replace(/^(?:zami\s*bot|zami_bot|zamibot|bot)\s*[:\-]\s*/i, '').trim();

      return {
        response: responseText,
        searchUsed,
        sources,
      };
    } catch (err: any) {
      this.logProviderError('chatCoach', AI_CHAT_MODEL, err);
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
      this.logProviderError('optimizePlanner', AI_PLANNER_MODEL, err);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }
}
