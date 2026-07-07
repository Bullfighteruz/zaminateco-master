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
  
  console.log('[EcoScan] API key loaded:', apiKey ? `${apiKey.substring(0, 6)}...` : 'MISSING', 'Language:', lang);
  
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

    console.log('[EcoScan] Sending image to Gemini...', { mimeType, dataLength: base64Data.length });

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
    console.log('[EcoScan] Gemini response:', text.substring(0, 300));
    
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
    console.error('[EcoScan] Error:', err.message || err);
    console.error('[EcoScan] Full error:', err);
    
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
