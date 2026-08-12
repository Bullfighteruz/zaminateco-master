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

export interface EcoUserInfo {
  displayName?: string;
  coins?: number;
  points?: number;
  level?: number;
  location?: string;
  school?: string;
}

// Hard client-side Base64 string maximum length: 2,097,152 chars (~1.5 MB binary image)
export const MAX_ALLOWED_BASE64_LENGTH = 2097152;

/**
 * Resolves API Base URL safely.
 * - In DEV mode: Allows fallback to 'http://localhost:3000/api/v1' if VITE_API_URL is omitted.
 * - In PROD mode: Requires VITE_API_URL. If absent, throws CONFIGURATION_ERROR (fails closed).
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api/v1';
  }
  throw new Error('API_CONFIG_MISSING');
}

// Sanitize user input: trim, limit length, strip control characters
function sanitizeInput(input: string, maxLength = 2000): string {
  const cleaned = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');
  return cleaned.trim().substring(0, maxLength);
}

/**
 * Progressive client-side image compression helper for EcoScan photos.
 * - Enforces strict maximum target: <= 2,097,152 Base64 chars (~1.5 MB binary image)
 * - Multi-pass reduction: systematically scales dimensions (1600 -> 1200 -> 800 -> 600)
 *   and quality steps (0.8 -> 0.6 -> 0.4 -> 0.2) until payload is within limit
 * - Preserves aspect ratio at all times
 * - Throws IMAGE_TOO_LARGE if image cannot be compressed below MAX_ALLOWED_BASE64_LENGTH
 */
export function compressImage(
  dataUrl: string,
  initialMaxDimension = 1600,
  initialQuality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) {
      const cleanLen = dataUrl.includes(',') ? dataUrl.split(',')[1].length : dataUrl.length;
      if (cleanLen > MAX_ALLOWED_BASE64_LENGTH) {
        return reject(new Error('IMAGE_TOO_LARGE'));
      }
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      const origWidth = img.width;
      const origHeight = img.height;

      const dimensionSteps = [initialMaxDimension, 1200, 800, 600];
      const qualitySteps = [initialQuality, 0.6, 0.4, 0.2];

      let bestOutput = '';

      for (const maxDim of dimensionSteps) {
        let width = origWidth;
        let height = origHeight;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.drawImage(img, 0, 0, width, height);

        for (const q of qualitySteps) {
          const encoded = canvas.toDataURL('image/jpeg', q);
          const rawBase64 = encoded.includes(',') ? encoded.split(',')[1] : encoded;

          if (rawBase64.length <= MAX_ALLOWED_BASE64_LENGTH) {
            return resolve(encoded);
          }

          if (!bestOutput || rawBase64.length < bestOutput.length) {
            bestOutput = encoded;
          }
        }
      }

      // If even aggressive multi-pass compression cannot reduce image below limit
      const finalRaw = bestOutput.includes(',') ? bestOutput.split(',')[1] : bestOutput;
      if (finalRaw.length > MAX_ALLOWED_BASE64_LENGTH) {
        return reject(new Error('IMAGE_TOO_LARGE'));
      }

      resolve(bestOutput);
    };

    img.onerror = () => reject(new Error('IMAGE_PROCESSING_FAILED'));
    img.src = dataUrl;
  });
}

/**
 * AI EcoScan — Calls ZAMINAT Backend AI Scanner Endpoint
 */
export async function scanWasteImage(
  imageBase64: string, 
  lang: string = 'en',
  mimeType: string = 'image/jpeg'
): Promise<WasteScanResult> {
  let formattedDataUrl = imageBase64;
  if (!formattedDataUrl.startsWith('data:image')) {
    formattedDataUrl = `data:${mimeType};base64,${imageBase64}`;
  }

  let compressedDataUrl = formattedDataUrl;
  try {
    compressedDataUrl = await compressImage(formattedDataUrl, 1600, 0.8);
  } catch (err: any) {
    if (err.message === 'IMAGE_TOO_LARGE') {
      throw err;
    }
  }

  const cleanBase64 = compressedDataUrl.includes(',') ? compressedDataUrl.split(',')[1] : compressedDataUrl;
  
  if (cleanBase64.length > MAX_ALLOWED_BASE64_LENGTH) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  const baseUrl = getApiBaseUrl();
  const endpointUrl = `${baseUrl}/ai/scan`;

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: cleanBase64,
      lang,
      mimeType: 'image/jpeg'
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    if (res.status === 503 || errJson.message === 'AI_PROVIDER_UNAVAILABLE') {
      throw new Error('GEMINI_API_KEY_MISSING');
    }
    if (res.status === 404) {
      throw new Error('SCAN_ENDPOINT_NOT_FOUND');
    }
    throw new Error(errJson.message || 'SCAN_ERROR');
  }

  const data = await res.json();
  return {
    items: Array.isArray(data.items) ? data.items.map((item: any) => ({
      name: item.name || 'Unidentified item',
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      wasteType: item.wasteType || 'Unknown',
      status: ['Accepted', 'Needs sorting', 'Not accepted', 'Needs cleaning'].includes(item.status)
        ? item.status 
        : 'Accepted',
      instructions: item.instructions || '',
    })) : [],
    totalEstimatedWeightKg: data.totalEstimatedWeightKg || '0.2 - 0.5 kg',
    estimatedEcoCoins: typeof data.estimatedEcoCoins === 'number' ? data.estimatedEcoCoins : 10,
    moatImpact: data.moatImpact || 'Prevents landfill waste and reduces carbon footprint.',
    suggestedProduct: data.suggestedProduct || 'EcoTile / EcoBench',
    confidence: typeof data.confidence === 'number' ? data.confidence : 92,
  };
}

export interface EcoCoachResponse {
  text: string;
  searchUsed: boolean;
  sources: Array<{ title: string; url: string }>;
}

/**
 * AI EcoCoach / Zami Bot Chat — Calls ZAMINAT Backend AI Chat Endpoint
 */
export async function getEcoCoachResponse(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  lang: string = 'uz',
  userInfo?: EcoUserInfo
): Promise<EcoCoachResponse> {
  const safeMessage = sanitizeInput(message);
  if (!safeMessage) {
    const text = lang === 'uz'
      ? "Iltimos, savolingizni yozing."
      : lang === 'ru'
      ? "Пожалуйста, напишите ваш вопрос."
      : "Please type your question.";
    return { text, searchUsed: false, sources: [] };
  }

  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: safeMessage,
      history: history.slice(-20),
      lang,
      userInfo
    })
  });

  if (!res.ok) {
    throw new Error('CHAT_ERROR');
  }

  const data = await res.json();
  const rawText = typeof data?.response === 'string'
    ? data.response
    : typeof data?.message === 'string'
    ? data.message
    : 'Response generated.';

  let text = rawText.trim();
  text = text.replace(/^(?:zami\s*bot|zami_bot|zamibot|bot)\s*[:\-]\s*/i, '').trim();

  const safeSources = Array.isArray(data?.sources)
    ? data.sources
        .filter((s: any): s is { title: string; url: string } => Boolean(s && typeof s.title === 'string' && typeof s.url === 'string'))
        .map((s: any) => ({ title: String(s.title), url: String(s.url) }))
    : [];

  return {
    text: text || 'Response generated.',
    searchUsed: Boolean(data?.searchUsed),
    sources: safeSources,
  };
}

/**
 * AI Production Planner — Calls ZAMINAT Backend Logistics Optimizer Endpoint
 */
export async function getPlannerOptimization(
  query: string,
  currentStock: { plastic: number; rubber: number; paper: number }
): Promise<string> {
  const safeQuery = sanitizeInput(query);
  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}/ai/planner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: safeQuery,
      currentStock
    })
  });

  if (!res.ok) {
    throw new Error('PLANNER_ERROR');
  }

  const data = await res.json();
  return data.response || data.message || "Production plan generated.";
}
