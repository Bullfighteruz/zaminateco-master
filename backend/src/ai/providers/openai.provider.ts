import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiProvider, ScanResult, ChatResult, PlannerResult, DetectedItem, ChatSource } from '../interfaces/ai-provider.interface';
import { ScanDto } from '../dto/scan.dto';
import { ChatDto } from '../dto/chat.dto';
import { PlannerDto } from '../dto/planner.dto';
import { SearchRouter } from '../utils/search-router';
import { ScanGuard } from '../utils/scan-guard';
import { GroundingProcessor } from '../utils/grounding-processor';

// Default GPT-5.6 Generation Models with fallback configuration
export const OPENAI_DEFAULT_CHAT_MODEL = 'gpt-5.6-luna';
export const OPENAI_DEFAULT_SCAN_MODEL = 'gpt-5.6-terra';
export const OPENAI_DEFAULT_PLANNER_MODEL = 'gpt-5.6-luna';

const SCAN_SYSTEM_PROMPT = `You are ZAMINAT AI EcoScan — the visual secondary material intelligence gateway for the ZAMINAT Waste-to-Life platform in Uzbekistan.

==================================================
1. HIERARCHICAL VISUAL CLASSIFICATION FRAMEWORK
==================================================
Classify visible objects through a strict 3-level hierarchy:
LEVEL A — OBJECT FAMILY: Identify general object form (bottle, cap, flexible wrapper, container, box, can, rubber tube / ring, tire, etc.).
LEVEL B — MATERIAL FAMILY: Identify material class (PET/probable PET, rigid plastic, flexible composite/mixed plastic, rubber, paper/cardboard, glass, metal, unknown/mixed).
LEVEL C — EXACT SUBTYPE: Identify fine-grained subtype ONLY if visual proof is unambiguous.
CRITICAL MANDATE: Fine-grained subtype certainty must NEVER exceed visual evidence. If evidence is incomplete or ambiguous, you MUST express uncertainty in the item name (e.g. "Резиновая камера / кольцеобразный резиновый элемент") rather than assigning an unsupported high-confidence label.

==================================================
2. RUBBER TUBE VS AUTOMOBILE TIRE DISAMBIGUATION
==================================================
1. AUTOMOBILE TIRE indicators: visible tread grooves/blocks, thick reinforced sidewalls, wide heavy tire casing/carcass.
2. INNER TUBE / RUBBER TUBE indicators: smooth or matte tubular surface without tread, flexible circular hose-like geometry, thin hollow tubular cross-section.
3. If a black ring-shaped rubber object lacks visible tread blocks and thick tire carcass, DO NOT classify it as "Автомобильная шина" (automobile tire). Classify it as "Резиновая камера / резиновый трубчатый элемент" (rubber inner tube / tubular rubber element).

==================================================
3. OBJECT COUNTING & MULTILAYER PACKAGING
==================================================
1. Count only distinctly visible items. For small overlapping objects (e.g. bottle caps), provide the best realistic visual integer count.
2. Do NOT duplicate a single physical object into multiple items.
3. For flexible snack/food packages: do NOT assume single-layer recyclable plastic. Classify wasteType as "Mixed" or "Plastic" with instructions indicating multilayer composite packaging.

==================================================
4. PHYSICAL WEIGHT ESTIMATION SEQUENCE
==================================================
1. Detect all visible items and evaluate their physical scale.
2. Group items into mass categories (Lightweight: caps, wrappers, empty bottles [0.01-0.08 kg each]; Medium: rubber tubes, large canisters [0.2-0.8 kg each]; Heavy: full vehicle tires [5-12 kg each]).
3. Estimate total realistic mass range for the entire scene (e.g. "≈ 0.5 – 1.2 кг (визуальная оценка)").
4. NEVER assign heavy vehicle tire mass (e.g. 2.5-4.0 kg) to a lightweight scene containing only bottles, caps, wrappers, and a rubber tube.

==================================================
5. STATUS & COLLECTION INSTRUCTIONS
==================================================
1. Status enum meanings:
   - "Accepted": Material appears suitable for applicable secondary material streams (subject to local point rules).
   - "Needs sorting": Multiple attached or mixed components should be separated before submission.
   - "Needs cleaning": Visual residue or contents present requiring rinsing.
   - "Not accepted": Material class is outside standard secondary streams.
2. Instructions: Give safe general preparation advice (rinse, keep dry, separate caps if appropriate). ALWAYS include a reminder: "Проверьте правила выбранного пункта приёма." (or translated equivalent). DO NOT claim universal local acceptance.

==================================================
6. POSITIVE CIRCULAR-ECONOMY LANGUAGE & CLAIMS
==================================================
1. Use positive circular-economy terminology. Avoid words like "мусор", "отходы", "выбросить", "trash", "garbage".
   Use: "вторичные материалы", "перерабатываемые ресурсы", "пункт приёма", "повторное использование", "qayta ishlanadigan materiallar".
2. Impact ("moatImpact"): Educational, conservative, qualitative. NEVER invent exact unverified numbers (e.g. no fake "0.5 kg CO2 saved").
3. Suggested Product ("suggestedProduct"): Describe potential material processing pathways (e.g. "Возможное направление: переработка резины в крошку для будущих эластичных покрытий"), NOT guaranteed factory production.
4. Confidence ("confidence"): Calibrate honestly. If key objects have ambiguous subtypes (e.g. rubber ring), overall confidence must decrease (70-85%), never blindly defaulted to 90+.`;

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
   - If live data is unavailable, state clearly in 1 sentence that live monitoring data is unavailable. NEVER substitute generic model background.
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
4. REAL-TIME DATA HONESTY & WEB SOURCES
==================================================
1. NEVER fabricate or guess real-time figures (AQI, PM2.5, PM10, temperature, collection point live status).
2. If real-time monitoring data is not verified, state clearly in the user's latest message language that you do not currently have access to verified real-time data.
3. NEVER fabricate or hallucinate URLs.

==================================================
5. SCOPED PERSONALIZATION & SCOPE CONTROL
==================================================
1. User profile details (school, district, EcoCoins, level) should ONLY be mentioned if directly relevant to the user query (e.g. "How many EcoCoins do I have?").
2. DO NOT force ZAMINAT marketing into general environmental answers.
3. FOLLOW-UPS: Resolve references like "Что это значит?" or "Почему?" from immediate conversation context and answer directly.

==================================================
6. PRIVATE DATA BOUNDARY & FACTUALITY
==================================================
1. STRICT PRIVATE DATA BOUNDARY: You do NOT have access to ZAMINAT's private server logs, Cloud Run logs, internal analytics, production telemetry, module latency, Supabase records, private user analytics, internal business metrics, or infrastructure state.
2. NEVER claim to have retrieved, inspected, or measured private server metrics or logs unless that data was explicitly supplied in trusted application context for the current request.
3. If requested private metrics (e.g. server latency, internal logs) are unavailable, state clearly and concisely that you do not have access to ZAMINAT's private server/telemetry data from this chat.
4. PROJECT-STATE FACTUALITY: Never infer that a feature is live, completed, deployed, production-ready, measured, or connected unless explicitly supplied by trusted context.

==================================================
7. CORRECTION & CHALLENGE BEHAVIOR (NO META MONOLOGUES)
==================================================
1. If the user challenges an answer ("that's wrong", "where did you get that?", "you are lying", "это неправда", "откуда эта информация?"):
   - Acknowledge briefly (1 sentence).
   - Identify whether the previous claim was verified.
   - Correct it concisely.
   - STOP.
2. DO NOT produce long defensive explanations, apologies, or disclaimers. Keep correction response to 1-3 sentences maximum.
3. NO META-AI MONOLOGUES: Avoid phrases like "As an AI...", "My information is based on...", "I am here to assist...". Speak naturally and directly.

==================================================
8. CONVERSATIONAL CONTINUITY & ELLIPTICAL FOLLOW-UPS
==================================================
1. Treat short follow-ups, omitted nouns, and pronouns (e.g. "why?", "почему?", "nimaga?", "а зачем?", "а зачем это?", "а детям?", "what about children?", "and then?", "а что потом?", "как?", "а это безопасно?", "а если пластик?") as referring directly to the most recent relevant topic/subject when recent conversation history provides one clear referent (e.g. EcoScan, PET, recycling, EcoKids).
2. DO NOT ask the user to clarify or repeat the subject (e.g. NEVER ask "Что именно вы имеете в виду под «этим»?") when the subject is clearly recoverable from the immediate conversation history. Answer the question directly in relation to that topic.
3. Ask clarification ONLY when multiple materially different referents remain completely ambiguous after checking recent context.`;

const PLANNER_SYSTEM_INSTRUCTION = `You are ZAMINAT AI Production Planner — a logistics optimizer for the ZAMINAT.eco recycling factory in Uzbekistan.
Provide optimized scheduling recommendations for converting recycled materials (PET, Rubber, Paper) into products (benches, pavement tiles, playground tiles).
Base predictions on conversion rates: 1 Bench = 160 kg PET; 1 Pavement Tile (sq m) = 15 kg rubber/plastic.
Keep the tone professional, concise, and focused on operational logistics.`;

// Strict JSON Schema definition for EcoScan
const ECOSCAN_JSON_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      description: 'Detected waste items',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Item name translated to target language' },
          quantity: { type: 'integer', description: 'Quantity count' },
          wasteType: {
            type: 'string',
            enum: ['Plastic', 'Metal', 'Glass', 'Paper', 'Rubber', 'Organic', 'E-waste', 'Textile', 'Mixed', 'Unknown'],
          },
          status: {
            type: 'string',
            enum: ['Accepted', 'Needs sorting', 'Not accepted', 'Needs cleaning'],
          },
          instructions: { type: 'string', description: 'Actionable sorting instructions in target language' },
        },
        required: ['name', 'quantity', 'wasteType', 'status', 'instructions'],
        additionalProperties: false,
      },
    },
    totalEstimatedWeightKg: { type: 'string', description: 'Estimated weight range, e.g. 0.2 - 0.5 kg' },
    estimatedEcoCoins: { type: 'integer', description: 'Estimated reward coins' },
    moatImpact: { type: 'string', description: 'Impact metric description in target language' },
    suggestedProduct: { type: 'string', description: 'Upcycled product suggestion in target language' },
    confidence: { type: 'integer', description: 'Detection confidence percentage (0-100)' },
  },
  required: ['items', 'totalEstimatedWeightKg', 'estimatedEcoCoins', 'moatImpact', 'suggestedProduct', 'confidence'],
  additionalProperties: false,
};

@Injectable()
export class OpenAIProvider implements AiProvider {
  readonly providerName = 'openai';
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private getApiKey(): string {
    const key = this.configService.get<string>('OPENAI_API_KEY') || process.env.OPENAI_API_KEY;
    if (!key || key === 'your-openai-api-key-here' || key === 'your-api-key-here') {
      throw new HttpException('AI_PROVIDER_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return key;
  }

  private getClient(apiKey: string): OpenAI {
    return new OpenAI({ apiKey });
  }

  private logProviderError(operation: string, model: string, err: any) {
    const sanitized = {
      operation,
      provider: this.providerName,
      model,
      errorName: err?.name || 'Error',
      errorStatus: err?.status || err?.statusCode || 500,
      errorCode: err?.code || 'UNKNOWN_ERROR',
      errorMessage: err?.message
        ? String(err.message)
            .replace(/sk-[a-zA-Z0-9_\-\.]+/gi, 'sk-[REDACTED]')
            .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
        : 'No error message provided',
    };
    this.logger.error(`[AI_PROVIDER_ERROR] ${JSON.stringify(sanitized)}`);
  }

  async scanWaste(dto: ScanDto): Promise<ScanResult> {
    const apiKey = this.getApiKey();
    const model = this.configService.get<string>('OPENAI_SCAN_MODEL') || OPENAI_DEFAULT_SCAN_MODEL;

    const langNames: Record<string, string> = {
      uz: 'Uzbek (in Latin script)',
      ru: 'Russian',
      en: 'English',
    };
    const targetLang = langNames[(dto.lang || 'en').substring(0, 2)] || 'English';

    try {
      const openai = this.getClient(apiKey);
      const cleanBase64 = dto.imageBase64.includes(',') ? dto.imageBase64.split(',')[1] : dto.imageBase64;
      const mimeType = dto.mimeType || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${cleanBase64}`;

      // Modern OpenAI Responses API with multimodal image input, reasoning effort, and strict JSON Schema
      const response = await openai.responses.create({
        model: model as any,
        instructions: `${SCAN_SYSTEM_PROMPT}\n\nCRITICAL LANGUAGE MANDATE: You MUST write the "name", "instructions", "moatImpact", and "suggestedProduct" values strictly in ${targetLang}.`,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Analyze this image for recyclables and waste. Provide structured output in ${targetLang}.`,
              },
              {
                type: 'input_image',
                image_url: dataUrl,
                detail: 'high',
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'ecoscan_detection_result',
            schema: ECOSCAN_JSON_SCHEMA,
            strict: true,
          },
        },
        reasoning: { effort: 'low' },
        max_output_tokens: 1500,
      });

      const messageContent = response.output_text;
      if (!messageContent) {
        throw new SyntaxError('Empty model response output_text');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(messageContent);
      } catch (jsonErr) {
        this.logger.warn(`[AI_SCAN_OPENAI] Malformed JSON response from OpenAI Responses API: ${messageContent}`);
        throw new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY);
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY);
      }

      return ScanGuard.sanitize(parsed, dto.lang || 'ru');
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof SyntaxError) {
        this.logger.warn(`[AI_SCAN_OPENAI] Malformed JSON payload: ${err.message}`);
        throw new HttpException('INVALID_MODEL_OUTPUT', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      this.logProviderError('scanWaste', model, err);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }

  async chatCoach(dto: ChatDto): Promise<ChatResult> {
    const apiKey = this.getApiKey();
    const model = this.configService.get<string>('OPENAI_CHAT_MODEL') || OPENAI_DEFAULT_CHAT_MODEL;

    try {
      const openai = this.getClient(apiKey);
      let systemInstruction = COACH_SYSTEM_INSTRUCTION;

      systemInstruction += `\n\nFALLBACK_UI_LANG: ${dto.lang || 'uz'}`;

      if (dto.userInfo) {
        const { displayName, coins, points, level, location, school } = dto.userInfo;
        systemInstruction += `\n\nOPTIONAL USER CONTEXT (use ONLY if query directly asks about user profile/progress): Name: ${displayName || 'User'}, Coins: ${coins || 0}, Points: ${points || 0}, Level: ${level || 1}, Location: ${location || 'Uzbekistan'}, School: ${school || 'General'}`;
      }

      const currentMsgText = (dto.message || '').trim();
      const searchEvaluation = SearchRouter.evaluate(currentMsgText, dto.history, dto.userInfo);

      // Normalize conversation history
      let safeHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      if (Array.isArray(dto.history)) {
        for (const h of dto.history) {
          if (!h) continue;
          const role = h.role === 'user' ? 'user' : 'assistant';
          let text = '';
          if (Array.isArray(h.parts)) {
            text = h.parts
              .filter(p => p && typeof p.text === 'string')
              .map(p => p.text.trim())
              .join(' ');
          } else if (typeof (h as any).content === 'string') {
            text = (h as any).content.trim();
          }

          if (text.length > 0) {
            safeHistory.push({ role, content: text.slice(0, 2000) });
          }
        }
      }

      // Exclude duplicate of current message from history tail if present
      if (safeHistory.length > 0 && currentMsgText) {
        const lastTurn = safeHistory[safeHistory.length - 1];
        if (lastTurn.role === 'user' && lastTurn.content.trim() === currentMsgText) {
          safeHistory = safeHistory.slice(0, -1);
        }
      }

      // Bound history window to last 20 turns
      if (safeHistory.length > 20) {
        safeHistory = safeHistory.slice(-20);
      }

      const userTurnContent = searchEvaluation.shouldSearch && searchEvaluation.searchQuery && searchEvaluation.searchQuery.toLowerCase() !== currentMsgText.toLowerCase()
        ? `${currentMsgText}\n\n[Search Intent: ${searchEvaluation.searchQuery}]`
        : currentMsgText;

      const inputMessages = [
        ...safeHistory.map(h => ({
          role: h.role,
          content: h.content,
        })),
        { role: 'user' as const, content: userTurnContent.slice(0, 2000) },
      ];

      // Real Search Semantics: Only supply web_search_preview tool when search is needed
      const tools = searchEvaluation.shouldSearch
        ? [{ type: 'web_search_preview' as const }]
        : undefined;

      const include = searchEvaluation.shouldSearch
        ? (['web_search_call.action.sources'] as any)
        : undefined;

      // Modern OpenAI Responses API with GPT-5.6 reasoning effort (no unsupported sampling parameters)
      const response = await openai.responses.create({
        model: model as any,
        instructions: systemInstruction,
        input: inputMessages,
        ...(tools ? { tools } : {}),
        ...(include ? { include } : {}),
        reasoning: { effort: 'low' },
        max_output_tokens: 1000,
      });

      const rawResponse = response.output_text || '';
      let responseText = rawResponse.trim();
      responseText = responseText.replace(/^(?:zami\s*bot|zami_bot|zamibot|bot)\s*[:\-]\s*/i, '').trim();

      // Extract real search annotations using GroundingProcessor
      const { searchUsed, sources } = GroundingProcessor.processOpenAIGrounding(
        response.output as any[],
        searchEvaluation.shouldSearch,
        4,
      );

      // P0 FAIL-CLOSED ENFORCEMENT: If search was REQUIRED but no verified grounding occurred,
      // fail closed and return deterministic localized fallback instead of model-hallucinated figures.
      if (searchEvaluation.searchMode === 'REQUIRED' && !searchUsed) {
        const fallbackText = GroundingProcessor.getUnavailableDataFallback(dto.lang || 'ru');
        return {
          response: fallbackText,
          searchUsed: false,
          sources: [],
        };
      }

      return {
        response: responseText,
        searchUsed,
        sources,
      };
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logProviderError('chatCoach', model, err);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }

  async optimizePlanner(dto: PlannerDto): Promise<PlannerResult> {
    const apiKey = this.getApiKey();
    const model = this.configService.get<string>('OPENAI_PLANNER_MODEL') || OPENAI_DEFAULT_PLANNER_MODEL;

    try {
      const openai = this.getClient(apiKey);
      const prompt = `Current Stock: Plastic/PET: ${dto.currentStock.plastic || 0} kg, Rubber: ${dto.currentStock.rubber || 0} kg, Paper: ${dto.currentStock.paper || 0} kg. User Request: ${dto.query.slice(0, 1000)}`;

      const response = await openai.responses.create({
        model: model as any,
        instructions: PLANNER_SYSTEM_INSTRUCTION,
        input: prompt,
        reasoning: { effort: 'low' },
        max_output_tokens: 1000,
      });

      const text = response.output_text || '';
      return { response: text.trim() };
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logProviderError('optimizePlanner', model, err);
      throw new HttpException('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY);
    }
  }
}
