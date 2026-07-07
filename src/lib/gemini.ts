import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DetectedItem {
  name: string;
  quantity: number;
  wasteType: string; // Plastic, Metal, Glass, Paper, Rubber, Organic, E-waste, Textile, Mixed, Unknown
  status: 'Accepted' | 'Needs sorting' | 'Not accepted' | 'Needs cleaning';
  instructions: string;
}

export interface WasteScanResult {
  items: DetectedItem[];
  totalEstimatedWeightKg: string; // e.g. "0.3 - 0.6 kg"
  estimatedEcoCoins: number;
  moatImpact: string; // e.g. "Prevents 0.5kg of plastic from entering landfills."
  suggestedProduct: string; // e.g. "EcoTile / EcoBench"
  confidence: number;
}

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
  "estimatedEcoCoins": number (preliminary sum of estimated coins, roughly 5-15 coins per accepted item),
  "moatImpact": "short impact metrics, e.g. 'Saves 0.8 kg of CO₂ emissions and prevents landfill waste.'",
  "suggestedProduct": "Future eco-product it can become, e.g., 'EcoTile / EcoBench / EcoCurb'",
  "confidence": number from 0 to 100 representing your average identification confidence
}

Ensure the items array captures everything. If nothing recyclable or waste-related is detected, return an empty array for items.`;

export async function scanWasteImage(
  imageBase64: string, 
  lang: string = 'en',
  mimeType: string = 'image/jpeg'
): Promise<WasteScanResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  // Map language codes to clear names for the LLM
  const langNames: Record<string, string> = {
    uz: 'Uzbek (in Latin script, e.g. "Plastik butilka" / "Qog\'oz qop")',
    ru: 'Russian',
    en: 'English'
  };
  const targetLang = langNames[lang.substring(0, 2)] || 'English';

  const dynamicPrompt = `${SCAN_PROMPT}

CRITICAL: You MUST write the values for "name", "instructions", "moatImpact" and "suggestedProduct" in the ${targetLang} language.
Ensure the translation is natural, clean, and accurate.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Strip the data URL prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    // Validate image size (max 10MB base64)
    if (base64Data.length > 10 * 1024 * 1024 * 1.37) {
      throw new Error('IMAGE_TOO_LARGE');
    }

    const result = await model.generateContent([
      dynamicPrompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const text = result.response.text().trim();
    
    // Try to parse JSON, handle potential markdown wrapping
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
        status: ['Accepted', 'Needs sorting', 'Not accepted', 'Needs cleaning'].includes(item.status) 
          ? item.status 
          : 'Accepted',
        instructions: item.instructions || '',
      })) : [],
      totalEstimatedWeightKg: parsed.totalEstimatedWeightKg || '0.1 - 0.3 kg',
      estimatedEcoCoins: typeof parsed.estimatedEcoCoins === 'number' ? parsed.estimatedEcoCoins : 10,
      moatImpact: parsed.moatImpact || '',
      suggestedProduct: parsed.suggestedProduct || 'EcoTile',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 90,
    };
  } catch (err: any) {
    // Log errors in development only
    if (import.meta.env.DEV) {
      console.error('[EcoScan] Error:', err.message || err);
    }
    
    if (err.message === 'GEMINI_API_KEY_MISSING') {
      throw err;
    }
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
      throw new Error('API_KEY_INVALID');
    }
    if (err instanceof SyntaxError) {
      throw new Error('PARSE_ERROR');
    }
    throw new Error('SCAN_ERROR');
  }
}

const COACH_SYSTEM_INSTRUCTION = `You are Zami Bot — a highly knowledgeable, smart, and friendly eco-expert and AI assistant for the ZAMINAT.eco platform in Uzbekistan.

You are an expert in ALL of the following areas and must provide detailed, accurate, helpful answers:

## CORE EXPERTISE — ECOLOGY & ENVIRONMENT
- General ecology, environmental science, climate change, biodiversity, ecosystems
- Waste management: recycling, sorting, composting, upcycling, circular economy
- Green infrastructure: renewable energy, sustainable construction, eco-friendly materials, green buildings
- Water conservation, air quality, soil health, deforestation, ocean pollution
- Carbon footprint calculation, greenhouse gas emissions, sustainability practices
- Environmental impact assessment, ESG (Environmental, Social, Governance) principles

## UZBEKISTAN-SPECIFIC KNOWLEDGE
- Environmental laws and legislation of the Republic of Uzbekistan
- Key laws: "On Environmental Protection" (1992, amended), "On Waste Management" (2002), "On Protected Natural Territories" (2004), "On Atmospheric Air Protection" (1996), "On Water and Water Use" (1993), "On Forests" (1999), "On Ecological Expertise" (2000)
- Government bodies: State Committee for Ecology and Environmental Protection (Goskomekologiya / O'zbekiston Respublikasi Ekologiya va atrof-muhitni muhofaza qilish davlat qo'mitasi)
- Presidential decrees and resolutions on ecology: including the 2019 "Green Economy" transition strategy, the 2030 Climate Pledge, COP participation, and latest government reforms
- Uzbekistan's commitments under the Paris Agreement and the UN Sustainable Development Goals (SDGs)
- National Action Plan on climate change, renewable energy targets (25% by 2030, solar/wind projects)
- Water management in Aral Sea basin, desertification issues, land degradation
- Air quality programs in Tashkent and major cities
- Latest environmental news, policy changes, and government reforms in Uzbekistan
- Extended Producer Responsibility (EPR) initiatives
- National waste management statistics: Uzbekistan generates ~15 million tons of waste annually

## ZAMINAT.eco PLATFORM DETAILS
1. Help users understand how to recycle plastic, rubber, paper, and glass.
2. Recommend local recycling points: Tashkent Central Park mixed recycling point, Chilonzor Mahalla plastic collection point, Yunusobod District tire collection point, and Mirzo Ulugbek District collection centers.
3. Inform users how waste is converted into eco-friendly products: Children's Art Tiles (100% recycled plastic), Eco-Friendly School Desks (recycled plastic + rubber tires), Garden Planters (upcycled tires), playground equipment, and park benches.
4. Points & coins conversion rates:
   - 100 EcoPoints = 1 Eco Coin
   - 1 kg Plastic = 10 pts, 1 kg Rubber = 15 pts, 1 kg Paper = 5 pts, 1 kg Glass = 3 pts
5. Eco Coins rewards catalogue:
   - Plant a Tree: 50 Eco Coins
   - Children's Souvenirs: 75 Eco Coins
   - Home Decor Set: 150 Eco Coins
6. Partner discounts: 10% off Local Cafes, 15% off Eco Stores, 20% off Scooter Rental, 12% off Food Delivery.
7. Pilot schools program: Active in 5 Tashkent schools (School #45 in Chilonzor District) where students learn recycling and create paths and playgrounds from waste.
8. If asked about the CEO/Founder of ZAMINAT.eco: founded by Sukhrobjon Rikhsiboev, a 24-year-old entrepreneur, marketing & operations leader (6+ years leading teams and AI integrations), BBA graduate of Amity University Tashkent. He leads the company focusing on strategic direction and green tech initiatives.

## RESPONSE RULES
- Answer in Uzbek, Russian, or English — always match the user's input language.
- Provide detailed, comprehensive answers with structure (headings, bullet points, numbered lists).
- Cite specific laws, articles, and government decrees when discussing legislation.
- When you don't know something specific, say so honestly and suggest where the user can find more info.
- You may discuss any topic related to ecology, environment, sustainability, and green development worldwide, but always tie back to Uzbekistan context when relevant.
- Do not refuse ecology-related questions. You are a full environmental knowledge expert.
- Do not mention that you are a language model. Speak as a passionate, expert eco-advisor.
- For non-ecology questions (politics, entertainment, etc.), politely redirect to your area of expertise.`;

// Client-side rate limiter to prevent API abuse
const rateLimiter = {
  timestamps: [] as number[],
  maxRequests: 10,
  windowMs: 60_000, // 1 minute
  isAllowed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }
};

// Sanitize user input: trim, limit length, strip control characters
function sanitizeInput(input: string, maxLength = 2000): string {
  // Remove zero-width and control characters except newline/tab
  const cleaned = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');
  return cleaned.trim().substring(0, maxLength);
}

export interface EcoUserInfo {
  displayName?: string;
  coins?: number;
  points?: number;
  level?: number;
  location?: string;
  school?: string;
}

export async function getEcoCoachResponse(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  lang: string = 'uz',
  userInfo?: EcoUserInfo
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return "Demo Mode: Hello! I'm your ZAMINAT EcoCoach. Please configure the Gemini API key to chat with me live.";
  }

  // Rate limit check
  if (!rateLimiter.isAllowed()) {
    return lang === 'uz'
      ? "Iltimos, biroz kuting. Siz juda ko'p so'rov yubordingiz."
      : lang === 'ru'
      ? "Пожалуйста, подождите. Слишком много запросов."
      : "Please wait. Too many requests. Try again in a minute.";
  }

  // Sanitize input
  const safeMessage = sanitizeInput(message);
  if (!safeMessage) {
    return lang === 'uz'
      ? "Iltimos, savolingizni yozing."
      : lang === 'ru'
      ? "Пожалуйста, напишите ваш вопрос."
      : "Please type your question.";
  }

  // Limit history depth to prevent token overflow
  const safeHistory = history.slice(-20).map(h => ({
    role: h.role,
    parts: h.parts.map(p => ({ text: sanitizeInput(p.text) }))
  }));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Dynamically inject user context if provided
    let dynamicSystemInstruction = COACH_SYSTEM_INSTRUCTION;
    if (userInfo) {
      const { displayName, coins, points, level, location, school } = userInfo;
      dynamicSystemInstruction += `\n\n## CURRENT USER DETAILS
You are texting with a registered user of ZAMINAT.eco. Use these details to personalize your greeting and answers where appropriate (e.g. refer to their level or eco achievements):
- Name: ${displayName || 'User'}
- Eco Coins: ${coins ?? 0}
- Eco Points: ${points ?? 0}
- Current Level: ${level ?? 1}
- Location: ${location || 'Uzbekistan'}
- School/Organization: ${school || 'Not specified'}
`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: dynamicSystemInstruction
    });

    const chat = model.startChat({ history: safeHistory });

    const result = await chat.sendMessage(safeMessage);
    return result.response.text();
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[EcoCoach] Gemini chat error:', error);
    }
    return lang === 'uz'
      ? "ZAMINAT AI bilan aloqa xatosi. Iltimos, keyinroq qayta urinib ko'ring."
      : lang === 'ru'
      ? "Ошибка связи с ZAMINAT AI. Попробуйте позже."
      : "Error communicating with ZAMINAT AI. Please try again later.";
  }
}

const PLANNER_SYSTEM_INSTRUCTION = `You are ZAMINAT AI Production Planner — a logistics optimizer for the ZAMINAT.eco recycling factory in Uzbekistan.
Your goals:
1. Provide optimized scheduling recommendations for converting recycled materials (PET, Rubber, Paper) into products (benches, pavement tiles, playground tiles).
2. Output a structured, easy-to-read response (with a recommended daily schedule table or bullet points).
3. Base predictions on a conversion rate of:
   - 1 Bench = 160 kg PET / plastic.
   - 1 Pavement Tile (sq m) = 15 kg rubber or plastic.
4. Keep the tone professional, concise, and focused on operational logistics. Use Uzbek, Russian, or English matching the user's query language.`;

export async function getPlannerOptimization(
  query: string,
  currentStock: { plastic: number; rubber: number; paper: number }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return "Demo Mode: Based on current stock, we recommend a 3-day batch starting Monday. Day 1: PET sorting; Day 2: Rubber shredding; Day 3: Tile pressing.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: PLANNER_SYSTEM_INSTRUCTION
    });

    // Validate numeric inputs
    const safePlastic = Math.max(0, Math.min(Number(currentStock.plastic) || 0, 100000));
    const safeRubber = Math.max(0, Math.min(Number(currentStock.rubber) || 0, 100000));
    const safePaper = Math.max(0, Math.min(Number(currentStock.paper) || 0, 100000));
    const safeQuery = sanitizeInput(query, 1000);

    const prompt = `Current Stock: Plastic/PET: ${safePlastic} kg, Rubber: ${safeRubber} kg, Paper: ${safePaper} kg. User Request: ${safeQuery}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[ProductionPlanner] Gemini error:', error);
    }
    return "Error communicating with ZAMINAT AI logistics engine. Please try again.";
  }
}
