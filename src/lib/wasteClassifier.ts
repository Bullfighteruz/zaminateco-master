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
  'spray can': 'Plastic', 'pill bottle': 'Plastic', 'hairbrush': 'Plastic',
  'comb': 'Plastic', 'toothbrush': 'Plastic', 'pen': 'Plastic', 'marker': 'Plastic',
  'toy': 'Plastic', 'lego': 'Plastic', 'plastic cup': 'Plastic', 'plastic plate': 'Plastic',
  'plastic straw': 'Plastic', 'straw': 'Plastic', 'funnel': 'Plastic', 'tub': 'Plastic',
  'cassette': 'Plastic', 'shampoo bottle': 'Plastic', 'cosmetic bottle': 'Plastic',
  'detergent bottle': 'Plastic', 'plastic container': 'Plastic', 'plastic spoon': 'Plastic',
  'plastic fork': 'Plastic', 'plastic knife': 'Plastic', 'plastic hanger': 'Plastic',
  
  // Metal items
  'can opener': 'Metal', 'beer glass': 'Metal', 'tin can': 'Metal',
  'saucepan': 'Metal', 'frying pan': 'Metal', 'wok': 'Metal',
  'iron': 'Metal', 'nail': 'Metal', 'screw': 'Metal',
  'chain': 'Metal', 'hook': 'Metal', 'safety pin': 'Metal',
  'wrench': 'Metal', 'hammer': 'Metal', 'screwdriver': 'Metal',
  'plunger': 'Metal', 'corkscrew': 'Metal', 'bottle opener': 'Metal',
  'thimble': 'Metal', 'combination lock': 'Metal', 'padlock': 'Metal',
  'key': 'Metal', 'whistle': 'Metal', 'bell': 'Metal', 'soda can': 'Metal',
  'aluminum can': 'Metal', 'beer can': 'Metal', 'tin foil': 'Metal', 'aluminum foil': 'Metal',
  'baking sheet': 'Metal', 'paperclip': 'Metal', 'staple': 'Metal', 'wire hanger': 'Metal',
  'copper wire': 'Metal', 'canned food': 'Metal', 'pot': 'Metal', 'pan': 'Metal',
  'kettle': 'Metal', 'colander': 'Metal', 'cutlery': 'Metal', 'metal spoon': 'Metal',
  'metal fork': 'Metal', 'metal knife': 'Metal', 'cork': 'Metal', 'crown cap': 'Metal',
  'scissors': 'Metal', 'zipper': 'Metal', 'hardware': 'Metal', 'pliers': 'Metal',
  
  // Glass items
  'wine bottle': 'Glass', 'beer bottle': 'Glass', 'vase': 'Glass',
  'wine glass': 'Glass', 'cocktail shaker': 'Glass', 'perfume': 'Glass',
  'jar': 'Glass', 'lamp': 'Glass', 'light bulb': 'Glass',
  'hourglass': 'Glass', 'magnifying glass': 'Glass', 'window': 'Glass',
  'mirror': 'Glass', 'glass bottle': 'Glass', 'milk bottle': 'Glass',
  'soda glass': 'Glass', 'tumbler': 'Glass', 'beaker': 'Glass', 'lens': 'Glass',
  'glass jar': 'Glass', 'decanter': 'Glass', 'flute': 'Glass', 'chalice': 'Glass',
  'mug': 'Glass', 'goblet glass': 'Glass',
  
  // Paper items
  'envelope': 'Paper', 'book': 'Paper', 'notebook': 'Paper',
  'newspaper': 'Paper', 'magazine': 'Paper', 'comic book': 'Paper',
  'cardboard': 'Paper', 'toilet tissue': 'Paper', 'paper towel': 'Paper',
  'packet': 'Paper', 'carton': 'Paper', 'binder': 'Paper',
  'folder': 'Paper', 'menu': 'Paper', 'receipt': 'Paper',
  'cardboard box': 'Paper', 'milk carton': 'Paper', 'juice box': 'Paper',
  'paper plate': 'Paper', 'paper cup': 'Paper', 'paper bag': 'Paper',
  'tissue': 'Paper', 'toilet paper': 'Paper', 'napkin': 'Paper',
  'card': 'Paper', 'postcard': 'Paper', 'wrapping paper': 'Paper',
  'box': 'Paper', 'shoe box': 'Paper', 'packaging': 'Paper', 'brochure': 'Paper',
  'flyer': 'Paper', 'poster': 'Paper', 'diary': 'Paper', 'calendar': 'Paper',
  
  // Rubber items
  'tire': 'Rubber', 'rubber eraser': 'Rubber', 'boot': 'Rubber',
  'sandal': 'Rubber', 'flip-flop': 'Rubber', 'running shoe': 'Rubber',
  'rubber band': 'Rubber', 'balloon': 'Rubber', 'glove': 'Rubber',
  'doormat': 'Rubber', 'tile': 'Rubber', 'conveyor belt': 'Rubber',
  'paving': 'Rubber', 'asphalt': 'Rubber', 'rubber boot': 'Rubber',
  'rain boot': 'Rubber', 'slipper': 'Rubber', 'rubber glove': 'Rubber',
  'latex glove': 'Rubber', 'yoga mat': 'Rubber', 'seal': 'Rubber',
  'gasket': 'Rubber', 'hose': 'Rubber', 'garden hose': 'Rubber',
  
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
  'banana peel': 'Organic', 'apple core': 'Organic', 'orange peel': 'Organic',
  'lemon peel': 'Organic', 'potato peel': 'Organic', 'eggshell': 'Organic',
  'bread': 'Organic', 'crust': 'Organic', 'coffee ground': 'Organic',
  'tea bag': 'Organic', 'nut shell': 'Organic', 'rice': 'Organic',
  'pasta': 'Organic', 'meat': 'Organic', 'bone': 'Organic',
  'chicken bone': 'Organic', 'fish bone': 'Organic', 'cabbage': 'Organic',
  'carrot': 'Organic', 'tomato': 'Organic', 'onion': 'Organic',
  'lettuce': 'Organic', 'spinach': 'Organic', 'garlic': 'Organic',
  'ginger': 'Organic', 'potato veg': 'Organic', 'fruit': 'Organic',
  'vegetable': 'Organic',
  
  // E-waste items
  'cellphone': 'E-waste', 'laptop': 'E-waste', 'desktop computer': 'E-waste',
  'monitor': 'E-waste', 'keyboard': 'E-waste', 'mouse': 'E-waste',
  'remote control': 'E-waste', 'television': 'E-waste', 'screen': 'E-waste',
  'printer': 'E-waste', 'modem': 'E-waste', 'iPod': 'E-waste',
  'hard disc': 'E-waste', 'CD player': 'E-waste', 'cassette player': 'E-waste',
  'speaker': 'E-waste', 'radio': 'E-waste', 'headphone': 'E-waste',
  'battery': 'E-waste', 'power plug': 'E-waste', 'switch': 'E-waste',
  'calculator': 'E-waste', 'digital clock': 'E-waste', 'digital watch': 'E-waste',
  'cell phone': 'E-waste', 'smartphone': 'E-waste', 'tablet': 'E-waste',
  'ipad': 'E-waste', 'charger': 'E-waste', 'charging cable': 'E-waste',
  'power bank': 'E-waste', 'aa battery': 'E-waste', 'aaa battery': 'E-waste',
  'lithium battery': 'E-waste', 'earbuds': 'E-waste', 'router': 'E-waste',
  'smartwatch': 'E-waste', 'video camera': 'E-waste', 'projector': 'E-waste',
  'microphone': 'E-waste', 'controller': 'E-waste', 'flash drive': 'E-waste',
  'usb drive': 'E-waste', 'sd card': 'E-waste', 'hair dryer': 'E-waste',
  'toaster': 'E-waste', 'microwave': 'E-waste', 'blender': 'E-waste',
  'coffee maker': 'E-waste', 'fan': 'E-waste',
  
  // Textile items
  'jean': 'Textile', 'sock': 'Textile', 'stocking': 'Textile',
  'T-shirt': 'Textile', 'suit': 'Textile', 'sweatshirt': 'Textile',
  'jersey': 'Textile', 'kimono': 'Textile', 'pajama': 'Textile',
  'bikini': 'Textile', 'brassiere': 'Textile', 'miniskirt': 'Textile',
  'swimming trunks': 'Textile', 'diaper': 'Textile', 'towel': 'Textile',
  'handkerchief': 'Textile', 'curtain': 'Textile', 'sleeping bag': 'Textile',
  'backpack': 'Textile', 'purse': 'Textile', 'wallet': 'Textile',
  'blanket': 'Textile', 'quilt': 'Textile', 'pillow': 'Textile',
  'shirt': 'Textile', 'pants': 'Textile', 'trousers': 'Textile',
  'shorts': 'Textile', 'skirt': 'Textile', 'dress': 'Textile',
  'jacket': 'Textile', 'coat': 'Textile', 'sweater': 'Textile',
  'hoodie': 'Textile', 'underwear': 'Textile', 'bra': 'Textile',
  'hat': 'Textile', 'cap': 'Textile', 'scarf': 'Textile',
  'belt': 'Textile', 'tie': 'Textile', 'bedsheet': 'Textile',
  'pillowcase': 'Textile', 'rug': 'Textile', 'carpet': 'Textile',
  'handbag': 'Textile', 'tote bag': 'Textile', 'canvas bag': 'Textile',
  'shoe': 'Textile', 'sneaker': 'Textile',
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
      const mobilenetModule = (mobilenet as any).default || mobilenet;
      mobilenetModel = await mobilenetModule.load({
        version: 2,
        alpha: 1.0, // Full-size model for better accuracy
      });
      
      console.log('[WasteClassifier] MobileNet v2 loaded successfully');
    } catch (error: any) {
      console.error('[WasteClassifier] Failed to load model:', error);
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
  } catch (error: any) {
    console.error('[WasteClassifier] Classification error:', error);
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
