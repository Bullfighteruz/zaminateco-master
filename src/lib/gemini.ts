import { GoogleGenerativeAI } from '@google/generative-ai';

export interface WasteScanResult {
  wasteType: string;
  material: string;
  recyclable: boolean;
  recyclabilityScore: number;
  ecoCoins: number;
  suggestion: string;
  confidence: number;
}

const SCAN_PROMPT = `You are ZAMINAT AI EcoScan — a waste material identification system.

Analyze this image and identify the waste material(s) visible.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "wasteType": "one of: Plastic, Metal, Glass, Paper, Rubber, Organic, E-waste, Textile, Mixed, Unknown",
  "material": "specific material description, e.g. 'PET Plastic Bottle', 'Aluminum Can', 'Cardboard Box'",
  "recyclable": true or false,
  "recyclabilityScore": number from 0 to 100,
  "ecoCoins": estimated reward in Eco Coins (1-50 range based on material value),
  "suggestion": "short actionable suggestion on how to properly recycle or dispose of this item (1-2 sentences)",
  "confidence": number from 0 to 100 representing how confident you are in the identification
}

If the image does not contain waste or recyclable materials, set wasteType to "Unknown" and confidence to 0.
Be specific in the material field — don't just say "plastic", say what kind.`;

export async function scanWasteImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<WasteScanResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('[EcoScan] API key loaded:', apiKey ? `${apiKey.substring(0, 6)}...` : 'MISSING');
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Strip the data URL prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    console.log('[EcoScan] Sending image to Gemini...', { mimeType, dataLength: base64Data.length });

    const result = await model.generateContent([
      SCAN_PROMPT,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const text = result.response.text().trim();
    console.log('[EcoScan] Gemini response:', text.substring(0, 200));
    
    // Try to parse JSON, handle potential markdown wrapping
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    return {
      wasteType: parsed.wasteType || 'Unknown',
      material: parsed.material || 'Unidentified material',
      recyclable: parsed.recyclable ?? false,
      recyclabilityScore: Math.min(100, Math.max(0, parsed.recyclabilityScore || 0)),
      ecoCoins: Math.min(50, Math.max(0, parsed.ecoCoins || 0)),
      suggestion: parsed.suggestion || 'Please consult your local recycling guidelines.',
      confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
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
