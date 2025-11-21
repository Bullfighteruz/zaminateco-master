/**
 * Icon Matcher Utility
 * Automatically matches product/category names to icon files based on keywords
 */

// List of available icon files (case-insensitive matching)
const availableIcons = [
  'Active Points.png',
  'art-tiles.png',
  'badges.png',
  'balanced_3590523.png',
  'Bobur.png',
  'book_649180.png',
  'bus-stop_7646037.png',
  'Children\'s Souvenirs.png',
  'Chilonzor Mahalla.png',
  'Climate Warrior.png',
  'Community Impact.png',
  'community_16119903.png',
  'compost_13285420.png',
  'construction.png',
  'contact-us.png',
  'delivery.png',
  'Earth Guardian.png',
  'Eco Bench.png',
  'eco coins.png',
  'Eco Education Kit.png',
  'Eco Farmer.png',
  'Eco Star.png',
  'eco_points_7986841.png',
  'eco-bag_10158203.png',
  'eco-bag.png',
  'eco-points.png',
  'ECOBIKE RACK.png',
  'EcoBrick.png',
  'ECOBUSSTOP.png',
  'ecologist_15371685.png',
  'Energy Saver.png',
  'EPDM Tiles.png',
  'EPDM-free Tiles.png',
  'event.png',
  'forest_10089053.png',
  'Furniture.png',
  'Future of Plastic.png',
  'Future Visionary.png',
  'gaming.png',
  'Garden Planter.png',
  'Green Sprout.png',
  'green-city_5994274.png',
  'green-sprout_3340168.png',
  'Home Decor Set.png',
  'Infrastructure.png',
  'kindergarden.png',
  'Leaf Guardian.png',
  'level-up_9443850.png',
  'level.png',
  'location_5174778.png',
  'Malika.png',
  'Meet Like-minded People.png',
  'meet-the-team_15916616.png',
  'meeting_10618037.png',
  'Nature Lover.png',
  'New Playground for School.png',
  'online-gaming_3098878.png',
  'park.png',
  'partners_7967044.png',
  'plant-a-tree_6675353.png',
  'Plastic Recycling.png',
  'Plastic.png',
  'playground.png',
  'real-estate_4171873.png',
  'recreation.png',
  'Recycling Hero.png',
  'River Cleanup.png',
  'school.png',
  'Solar Champion.png',
  'sustainable-future_2293652.png',
  'Tree Protector.png',
  'vote_15269306.png',
  'warehouse_10753075.png',
  'Waste Bin.png',
  'Waste Collected.png',
  'Water Saver.png',
  'Yunusobod District.png',
];

/**
 * Normalizes text for matching (removes special chars, converts to lowercase)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Extracts keywords from a product/category name
 */
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);
  
  // Filter out common words that don't help with matching
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'];
  const keywords = words.filter(word => word.length > 2 && !stopWords.includes(word));
  
  return keywords;
}

/**
 * Calculates similarity score between text and icon filename
 */
function calculateSimilarity(text: string, iconFile: string): number {
  const textNormalized = normalizeText(text);
  const iconNormalized = normalizeText(iconFile.replace('.png', ''));
  
  // Exact match
  if (textNormalized === iconNormalized) return 100;
  
  // Check if all keywords are in the icon filename
  const keywords = extractKeywords(text);
  const iconWords = iconNormalized.split(/\s+/);
  
  let matchCount = 0;
  let totalScore = 0;
  
  keywords.forEach(keyword => {
    // Check for exact word match
    if (iconWords.includes(keyword)) {
      matchCount++;
      totalScore += 10;
    } else {
      // Check for partial match (substring)
      iconWords.forEach(iconWord => {
        if (iconWord.includes(keyword) || keyword.includes(iconWord)) {
          totalScore += 5;
        }
      });
    }
  });
  
  // Bonus for matching first word
  if (keywords.length > 0 && iconWords[0]?.includes(keywords[0])) {
    totalScore += 5;
  }
  
  return totalScore;
}

/**
 * Finds the best matching icon file for a given product/category name
 */
export function findIconForName(name: string, fallback?: string): string {
  if (!name) return fallback || '/images/art-tiles.png';
  
  const normalizedName = normalizeText(name);
  let bestMatch: { file: string; score: number } | null = null;
  
  // Try exact match first (case-insensitive)
  const exactMatch = availableIcons.find(icon => 
    normalizeText(icon.replace('.png', '')) === normalizedName
  );
  
  if (exactMatch) {
    return `/images/${exactMatch}`;
  }
  
  // Try partial matches
  availableIcons.forEach(icon => {
    const score = calculateSimilarity(name, icon);
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { file: icon, score };
    }
  });
  
  // Return best match if score is good enough (threshold: 5)
  if (bestMatch && bestMatch.score >= 5) {
    return `/images/${bestMatch.file}`;
  }
  
  // Fallback to provided fallback or default
  return fallback || '/images/art-tiles.png';
}

/**
 * Special mappings for known products/categories
 * These are exact matches based on product/category names
 */
const specialMappings: Record<string, string> = {
  // Products - exact name matches
  'epdm-free tiles': '/images/EPDM-free Tiles.png',
  'epdm rubber ecotiles': '/images/EPDM Tiles.png',
  'epdm tiles': '/images/EPDM Tiles.png',
  'ecobrick': '/images/EcoBrick.png',
  'eco brick': '/images/EcoBrick.png',
  'waste bin': '/images/Waste Bin.png',
  'garden planter': '/images/Garden Planter.png',
  'eco bench': '/images/Eco Bench.png',
  'ecobike rack': '/images/ECOBIKE RACK.png',
  'ecobusstop': '/images/ECOBUSSTOP.png',
  'eco bus stop': '/images/ECOBUSSTOP.png',
  'playground block': '/images/art-tiles.png',
  'art tiles': '/images/art-tiles.png',
  'ecostreet furniture': '/images/green-city_5994274.png',
  
  // Voting Projects - exact name matches
  'new playground for school': '/images/New Playground for School.png',
  'new playground for school #45': '/images/New Playground for School.png',
  'playground for school 45': '/images/New Playground for School.png',
  'playground': '/images/playground.png',
  'school': '/images/school.png',
  'eco park benches': '/images/park.png',
  'eco-park benches': '/images/park.png',
  'eco park benches from recycled tires': '/images/park.png',
  'park benches': '/images/park.png',
  'park': '/images/park.png',
  'kindergarten garden path': '/images/kindergarden.png',
  'kindergarten': '/images/kindergarden.png',
  'garden path': '/images/plant-a-tree_6675353.png',
  
  // Collection Points - exact name matches
  'tashkent central park': '/images/park.png',
  'central park': '/images/park.png',
  'chilonzor mahalla': '/images/Chilonzor Mahalla.png',
  'chilonzor': '/images/Chilonzor Mahalla.png',
  'yunusobod district': '/images/Yunusobod District.png',
  'yunusobod': '/images/Yunusobod District.png',
  
  // Collection Point Types
  'mixed': '/images/park.png',
  'plastic': '/images/compost_13285420.png',
  'tires': '/images/ECOBUSSTOP.png',
  
  // Eco Actions Event Categories
  'cleanup': '/images/forest_10089053.png',
  'planting': '/images/plant-a-tree_6675353.png',
  'education': '/images/book_649180.png',
  'recycling': '/images/Plastic Recycling.png',
  'awareness': '/images/community_16119903.png',
  
  // Eco Actions Event Types (by title keywords)
  'school workshop': '/images/book_649180.png',
  'tree planting': '/images/plant-a-tree_6675353.png',
  'river cleanup': '/images/River Cleanup.png',
  'chirchiq river cleanup': '/images/River Cleanup.png',
  'chirchiq river cleanup campaign': '/images/River Cleanup.png',
  'awareness walk': '/images/community_16119903.png',
  'waste audit': '/images/eco-points.png',
  'community impact': '/images/community_16119903.png',
  'sustainable future': '/images/sustainable-future_2293652.png',
  'eco points': '/images/eco-points.png',
  'earn eco points': '/images/eco-points.png',
  'earn ecopoints': '/images/eco-points.png',
  'meet like-minded people': '/images/Meet Like-minded People.png',
  
  // Stories - exact name matches
  'zaminat.eco launches pilot program': '/images/community_16119903.png',
  'pilot program': '/images/community_16119903.png',
  'launches pilot program': '/images/community_16119903.png',
  'future of plastic and rubber recycling': '/images/Future of Plastic.png',
  'future of plastic': '/images/Future of Plastic.png',
  'plastic and rubber recycling': '/images/Plastic.png',
  'plastic recycling': '/images/Plastic.png',
  'future recycling': '/images/Future of Plastic.png',
  'educational programs': '/images/book_649180.png',
  'teaching the next generation': '/images/book_649180.png',
  'from landfill to playground': '/images/New Playground for School.png',
  'mahalla transformation': '/images/Bobur.png',
  'landfill to playground': '/images/New Playground for School.png',
  'transformation': '/images/Bobur.png',
  'bobur rahimov': '/images/Bobur.png',
  'bobur': '/images/Bobur.png',
  'teaching kids': '/images/Malika.png',
  'teaching kids about plastic and rubber recycling': '/images/Malika.png',
  'malika tursunova': '/images/Malika.png',
  'malika': '/images/Malika.png',
  
  // Categories - exact name matches (using actual file names from images folder)
  'construction': '/images/construction.png',
  'recreation': '/images/recreation.png',
  'furniture': '/images/Furniture.png',
  'infrastructure': '/images/Infrastructure.png',
  
  // Category translations (Russian, Uzbek)
  'строительство': '/images/construction.png', // Russian: Construction
  'qurilish': '/images/construction.png', // Uzbek: Construction
  'отдых': '/images/recreation.png', // Russian: Recreation
  'dam olish': '/images/recreation.png', // Uzbek: Recreation
  'мебель': '/images/Furniture.png', // Russian: Furniture
  'mebel': '/images/Furniture.png', // Uzbek: Furniture
  'инфраструктура': '/images/Infrastructure.png', // Russian: Infrastructure
  'infratuzilma': '/images/Infrastructure.png', // Uzbek: Infrastructure
};

/**
 * Enhanced icon finder with special mappings
 */
export function getIconForProductOrCategory(name: string, fallback?: string): string {
  if (!name) return fallback || '/images/art-tiles.png';
  
  const normalized = normalizeText(name);
  
  // Check special mappings first (exact match)
  if (specialMappings[normalized]) {
    return specialMappings[normalized];
  }
  
  // Try to find partial match in special mappings (check if key is contained in name or vice versa)
  // Sort by key length (longest first) to prioritize more specific matches
  const sortedMappings = Object.entries(specialMappings).sort((a, b) => b[0].length - a[0].length);
  
  for (const [key, value] of sortedMappings) {
    // Check if the key is a substring of the normalized name
    if (normalized.includes(key)) {
      return value;
    }
    // Check if the normalized name is a substring of the key (for shorter names)
    if (key.includes(normalized) && normalized.length > 3) {
      return value;
    }
  }
  
  // Use smart matching as fallback
  return findIconForName(name, fallback);
}

