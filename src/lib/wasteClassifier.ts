/**
 * ZAMINAT.eco — TensorFlow.js Waste Classifier
 * 
 * Runs entirely in the browser using MobileNet transfer learning.
 * Classifies waste images into recyclable categories (plastic, metal, glass, etc.)
 * Works offline after initial model download.
 */

import * as tf from '@tensorflow/tfjs';

// ============================================
// Types
// ============================================

export interface WasteClassification {
  category: string;         // e.g. "Plastic", "Metal", "Glass"
  confidence: number;       // 0–100
  sortingBin: string;       // e.g. "Blue Bin", "Green Bin"
  binColor: string;         // CSS color
  instructions: string;     // How to prepare this waste
  ecoCoinsEstimate: number; // Estimated reward per kg
  icon: string;             // Emoji icon
}

export interface ClassifierResult {
  predictions: WasteClassification[];
  topPrediction: WasteClassification;
  processingTimeMs: number;
  isOffline: boolean;
  modelReady: boolean;
}

// ============================================
// Waste Category Mapping
// ============================================

// Map common ImageNet/MobileNet labels to waste categories
const LABEL_TO_WASTE: Record<string, string> = {
  // Plastic items
  'water bottle': 'Plastic', 'plastic bag': 'Plastic', 'pop bottle': 'Plastic',
  'soda bottle': 'Plastic', 'bottle cap': 'Plastic', 'container': 'Plastic',
  'jug': 'Plastic', 'bucket': 'Plastic', 'crate': 'Plastic',
  'cup': 'Plastic', 'goblet': 'Plastic', 'pitcher': 'Plastic',
  'measuring cup': 'Plastic', 'mixing bowl': 'Plastic', 'strainer': 'Plastic',
  'ladle': 'Plastic', 'spatula': 'Plastic', 'soap dispenser': 'Plastic',
  'lotion': 'Plastic', 'sunscreen': 'Plastic', 'shampoo': 'Plastic',
  'spray can': 'Plastic', 'pill bottle': 'Plastic',
  
  // Metal items
  'can opener': 'Metal', 'beer glass': 'Metal', 'tin can': 'Metal',
  'saucepan': 'Metal', 'frying pan': 'Metal', 'wok': 'Metal',
  'iron': 'Metal', 'nail': 'Metal', 'screw': 'Metal',
  'chain': 'Metal', 'hook': 'Metal', 'safety pin': 'Metal',
  'wrench': 'Metal', 'hammer': 'Metal', 'screwdriver': 'Metal',
  'plunger': 'Metal', 'corkscrew': 'Metal', 'bottle opener': 'Metal',
  'thimble': 'Metal', 'combination lock': 'Metal', 'padlock': 'Metal',
  'key': 'Metal', 'whistle': 'Metal', 'bell': 'Metal',
  
  // Glass items
  'wine bottle': 'Glass', 'beer bottle': 'Glass', 'vase': 'Glass',
  'wine glass': 'Glass', 'cocktail shaker': 'Glass', 'perfume': 'Glass',
  'jar': 'Glass', 'lamp': 'Glass', 'light bulb': 'Glass',
  'hourglass': 'Glass', 'magnifying glass': 'Glass', 'window': 'Glass',
  'mirror': 'Glass',
  
  // Paper items
  'envelope': 'Paper', 'book': 'Paper', 'notebook': 'Paper',
  'newspaper': 'Paper', 'magazine': 'Paper', 'comic book': 'Paper',
  'cardboard': 'Paper', 'toilet tissue': 'Paper', 'paper towel': 'Paper',
  'packet': 'Paper', 'carton': 'Paper', 'binder': 'Paper',
  'folder': 'Paper', 'menu': 'Paper', 'receipt': 'Paper',
  
  // Rubber items
  'tire': 'Rubber', 'rubber eraser': 'Rubber', 'boot': 'Rubber',
  'sandal': 'Rubber', 'flip-flop': 'Rubber', 'running shoe': 'Rubber',
  'rubber band': 'Rubber', 'balloon': 'Rubber', 'glove': 'Rubber',
  
  // Organic items
  'banana': 'Organic', 'apple': 'Organic', 'orange': 'Organic',
  'lemon': 'Organic', 'strawberry': 'Organic', 'pineapple': 'Organic',
  'broccoli': 'Organic', 'cauliflower': 'Organic', 'mushroom': 'Organic',
  'corn': 'Organic', 'cucumber': 'Organic', 'head cabbage': 'Organic',
  'bell pepper': 'Organic', 'zucchini': 'Organic', 'artichoke': 'Organic',
  'meat loaf': 'Organic', 'pizza': 'Organic', 'burrito': 'Organic',
  'potpie': 'Organic', 'pretzel': 'Organic', 'bagel': 'Organic',
  'french loaf': 'Organic', 'ice cream': 'Organic', 'chocolate': 'Organic',
  'dough': 'Organic', 'espresso': 'Organic', 'eggnog': 'Organic',
  'leaf': 'Organic', 'flower': 'Organic', 'tree': 'Organic',
  
  // E-waste items
  'cellphone': 'E-waste', 'laptop': 'E-waste', 'desktop computer': 'E-waste',
  'monitor': 'E-waste', 'keyboard': 'E-waste', 'mouse': 'E-waste',
  'remote control': 'E-waste', 'television': 'E-waste', 'screen': 'E-waste',
  'printer': 'E-waste', 'modem': 'E-waste', 'iPod': 'E-waste',
  'hard disc': 'E-waste', 'CD player': 'E-waste', 'cassette player': 'E-waste',
  'speaker': 'E-waste', 'radio': 'E-waste', 'headphone': 'E-waste',
  'battery': 'E-waste', 'power plug': 'E-waste', 'switch': 'E-waste',
  'calculator': 'E-waste', 'digital clock': 'E-waste', 'digital watch': 'E-waste',
  
  // Textile items
  'jean': 'Textile', 'sock': 'Textile', 'stocking': 'Textile',
  'T-shirt': 'Textile', 'suit': 'Textile', 'sweatshirt': 'Textile',
  'jersey': 'Textile', 'kimono': 'Textile', 'pajama': 'Textile',
  'bikini': 'Textile', 'brassiere': 'Textile', 'miniskirt': 'Textile',
  'swimming trunks': 'Textile', 'diaper': 'Textile', 'towel': 'Textile',
  'handkerchief': 'Textile', 'curtain': 'Textile', 'sleeping bag': 'Textile',
  'backpack': 'Textile', 'purse': 'Textile', 'wallet': 'Textile',
  'blanket': 'Textile', 'quilt': 'Textile', 'pillow': 'Textile',
};

// Category details
const WASTE_CATEGORIES: Record<string, Omit<WasteClassification, 'confidence'>> = {
  Plastic: {
    category: 'Plastic',
    sortingBin: 'Blue Bin',
    binColor: '#3b82f6',
    instructions: 'Rinse containers, remove caps, flatten bottles. Remove labels if possible.',
    ecoCoinsEstimate: 10,
    icon: '♻️',
  },
  Metal: {
    category: 'Metal',
    sortingBin: 'Silver Bin',
    binColor: '#94a3b8',
    instructions: 'Rinse cans, remove labels. Flatten aluminum cans. Separate ferrous and non-ferrous.',
    ecoCoinsEstimate: 12,
    icon: '🔩',
  },
  Glass: {
    category: 'Glass',
    sortingBin: 'Green Bin',
    binColor: '#22c55e',
    instructions: 'Rinse thoroughly. Separate by color (clear, green, brown). Remove lids and caps.',
    ecoCoinsEstimate: 3,
    icon: '🫙',
  },
  Paper: {
    category: 'Paper',
    sortingBin: 'Yellow Bin',
    binColor: '#eab308',
    instructions: 'Keep dry and clean. Flatten cardboard boxes. Remove plastic windows from envelopes.',
    ecoCoinsEstimate: 5,
    icon: '📄',
  },
  Rubber: {
    category: 'Rubber',
    sortingBin: 'Black Bin',
    binColor: '#78716c',
    instructions: 'Separate tires from rims. Clean rubber items. Remove non-rubber parts.',
    ecoCoinsEstimate: 15,
    icon: '🛞',
  },
  Organic: {
    category: 'Organic',
    sortingBin: 'Brown Bin',
    binColor: '#a16207',
    instructions: 'Compostable waste only. Remove packaging. Cut large pieces for faster decomposition.',
    ecoCoinsEstimate: 2,
    icon: '🌿',
  },
  'E-waste': {
    category: 'E-waste',
    sortingBin: 'Red Bin',
    binColor: '#ef4444',
    instructions: 'Remove batteries separately. Do not break screens. Bring to designated e-waste points.',
    ecoCoinsEstimate: 20,
    icon: '🔋',
  },
  Textile: {
    category: 'Textile',
    sortingBin: 'Purple Bin',
    binColor: '#a855f7',
    instructions: 'Wash and dry items. Separate wearable from non-wearable. Bundle with string.',
    ecoCoinsEstimate: 8,
    icon: '👕',
  },
  Mixed: {
    category: 'Mixed',
    sortingBin: 'Gray Bin',
    binColor: '#6b7280',
    instructions: 'Needs manual sorting. Separate different material types before recycling.',
    ecoCoinsEstimate: 5,
    icon: '🗑️',
  },
  Unknown: {
    category: 'Unknown',
    sortingBin: 'Check with staff',
    binColor: '#9ca3af',
    instructions: 'Cannot identify material. Please bring to an EcoPoint for manual assessment.',
    ecoCoinsEstimate: 0,
    icon: '❓',
  },
};

// ============================================
// Classifier Engine
// ============================================

let mobilenetModel: any = null;
let _isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

/**
 * Load the MobileNet model. Only loads once, cached after first call.
 */
export async function loadClassifierModel(): Promise<boolean> {
  if (mobilenetModel) return true;
  
  if (modelLoadPromise) {
    await modelLoadPromise;
    return !!mobilenetModel;
  }
  
  _isModelLoading = true;
  
  modelLoadPromise = (async () => {
    try {
      // Set backend — prefer WebGL, fallback to WASM, then CPU
      await tf.ready();
      
      const mobilenet = await import('@tensorflow-models/mobilenet');
      mobilenetModel = await mobilenet.load({
        version: 2,
        alpha: 1.0, // Full-size model for better accuracy
      });
      
      if (import.meta.env.DEV) {
        console.log('[WasteClassifier] MobileNet v2 loaded successfully');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[WasteClassifier] Failed to load model:', error);
      }
      mobilenetModel = null;
    } finally {
      _isModelLoading = false;
    }
  })();
  
  await modelLoadPromise;
  return !!mobilenetModel;
}

/**
 * Check if the model is currently loaded and ready.
 */
export function isModelReady(): boolean {
  return !!mobilenetModel;
}

/**
 * Check if the model is currently loading.
 */
export function isModelLoading(): boolean {
  return _isModelLoading;
}

/**
 * Classify a waste image using the loaded MobileNet model.
 * Returns up to 5 predictions mapped to waste categories.
 */
export async function classifyWasteImage(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<ClassifierResult> {
  const startTime = performance.now();
  
  if (!mobilenetModel) {
    const loaded = await loadClassifierModel();
    if (!loaded) {
      return createFallbackResult(startTime);
    }
  }
  
  try {
    // Get MobileNet predictions (top 10 for better waste mapping)
    const predictions = await mobilenetModel.classify(imageElement, 10);
    
    // Map MobileNet labels to waste categories
    const wasteScores: Record<string, number> = {};
    
    for (const pred of predictions) {
      const label = pred.className.toLowerCase();
      let wasteCategory = 'Unknown';
      
      // Check direct mapping
      for (const [keyword, category] of Object.entries(LABEL_TO_WASTE)) {
        if (label.includes(keyword.toLowerCase())) {
          wasteCategory = category;
          break;
        }
      }
      
      // Accumulate scores per waste category
      const score = pred.probability * 100;
      wasteScores[wasteCategory] = (wasteScores[wasteCategory] || 0) + score;
    }
    
    // Sort by score descending
    const sortedCategories = Object.entries(wasteScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    // Build classification results
    const classifications: WasteClassification[] = sortedCategories.map(
      ([category, score]) => ({
        ...WASTE_CATEGORIES[category] || WASTE_CATEGORIES['Unknown'],
        confidence: Math.min(Math.round(score), 100),
      })
    );
    
    // Ensure we have at least one result
    if (classifications.length === 0) {
      classifications.push({
        ...WASTE_CATEGORIES['Unknown'],
        confidence: 0,
      });
    }
    
    const processingTimeMs = Math.round(performance.now() - startTime);
    
    return {
      predictions: classifications,
      topPrediction: classifications[0],
      processingTimeMs,
      isOffline: true,
      modelReady: true,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[WasteClassifier] Classification error:', error);
    }
    return createFallbackResult(startTime);
  }
}

/**
 * Classify from a base64 image string (e.g. from canvas capture).
 */
export async function classifyWasteFromBase64(base64: string): Promise<ClassifierResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const result = await classifyWasteImage(img);
      resolve(result);
    };
    img.onerror = () => {
      resolve(createFallbackResult(performance.now()));
    };
    img.src = base64;
  });
}

/**
 * Get waste category info without classification (for UI displays).
 */
export function getWasteCategoryInfo(category: string): WasteClassification {
  return {
    ...WASTE_CATEGORIES[category] || WASTE_CATEGORIES['Unknown'],
    confidence: 100,
  };
}

/**
 * Get all available waste categories.
 */
export function getAllWasteCategories(): string[] {
  return Object.keys(WASTE_CATEGORIES);
}

// ============================================
// Helpers
// ============================================

function createFallbackResult(startTime: number): ClassifierResult {
  return {
    predictions: [{
      ...WASTE_CATEGORIES['Unknown'],
      confidence: 0,
    }],
    topPrediction: {
      ...WASTE_CATEGORIES['Unknown'],
      confidence: 0,
    },
    processingTimeMs: Math.round(performance.now() - startTime),
    isOffline: true,
    modelReady: false,
  };
}

/**
 * Cleanup: dispose of the model to free memory.
 */
export function disposeClassifier(): void {
  if (mobilenetModel) {
    mobilenetModel = null;
  }
  modelLoadPromise = null;
}
