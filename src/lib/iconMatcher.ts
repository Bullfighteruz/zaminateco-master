/**
 * Icon Matcher Utility
 * Automatically matches product/category names to icon files based on keywords
 */

// List of available icon files (case-insensitive matching)
const availableIcons = [
  'Active Points.webp',
  'art-tiles.webp',
  'badges.webp',
  'balanced_3590523.webp',
  'Bobur.webp',
  'book_649180.webp',
  'bus-stop_7646037.webp',
  'Children\'s Souvenirs.webp',
  'Chilonzor Mahalla.webp',
  'Climate Warrior.webp',
  'Community Impact.webp',
  'community_16119903.webp',
  'compost_13285420.webp',
  'construction.webp',
  'contact-us.webp',
  'delivery.webp',
  'Earth Guardian.webp',
  'Eco Bench.webp',
  'eco coins.webp',
  'Eco Education Kit.webp',
  'Eco Farmer.webp',
  'Eco Star.webp',
  'eco_points_7986841.webp',
  'eco-bag_10158203.webp',
  'eco-bag.webp',
  'eco-points.webp',
  'ECOBIKE RACK.webp',
  'EcoBrick.webp',
  'ECOBUSSTOP.webp',
  'ecologist_15371685.webp',
  'Energy Saver.webp',
  'EPDM Tiles.webp',
  'EPDM-free Tiles.webp',
  'event.webp',
  'forest_10089053.webp',
  'Furniture.webp',
  'Future of Plastic.webp',
  'Future Visionary.webp',
  'gaming.webp',
  'Garden Planter.webp',
  'Green Sprout.webp',
  'green-city_5994274.webp',
  'green-sprout_3340168.webp',
  'Home Decor Set.webp',
  'Infrastructure.webp',
  'kindergarden.webp',
  'Leaf Guardian.webp',
  'level-up_9443850.webp',
  'level.webp',
  'location_5174778.webp',
  'Malika.webp',
  'Meet Like-minded People.webp',
  'meet-the-team_15916616.webp',
  'meeting_10618037.webp',
  'Nature Lover.webp',
  'New Playground for School.webp',
  'online-gaming_3098878.webp',
  'park.webp',
  'partners_7967044.webp',
  'plant-a-tree_6675353.webp',
  'Plastic Recycling.webp',
  'Plastic.webp',
  'playground.webp',
  'real-estate_4171873.webp',
  'recreation.webp',
  'Recycling Hero.webp',
  'River Cleanup.webp',
  'school.webp',
  'Solar Champion.webp',
  'sustainable-future_2293652.webp',
  'Tree Protector.webp',
  'vote_15269306.webp',
  'warehouse_10753075.webp',
  'Waste Bin.webp',
  'Waste Collected.webp',
  'Water Saver.webp',
  'Yunusobod District.webp',
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
  const iconNormalized = normalizeText(iconFile.replace('.webp', ''));
  
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
  if (!name) return fallback || '/images/art-tiles.webp';
  
  const normalizedName = normalizeText(name);
  let bestMatch: { file: string; score: number } | null = null;
  
  // Try exact match first (case-insensitive)
  const exactMatch = availableIcons.find(icon => 
    normalizeText(icon.replace('.webp', '')) === normalizedName
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
  return fallback || '/images/art-tiles.webp';
}

/**
 * Special mappings for known products/categories
 * These are exact matches based on product/category names
 */
const specialMappings: Record<string, string> = {
  // Products - exact name matches
  'epdm-free tiles': '/images/EPDM-free Tiles.webp',
  'epdm rubber ecotiles': '/images/EPDM Tiles.webp',
  'epdm tiles': '/images/EPDM Tiles.webp',
  'ecobrick': '/images/EcoBrick.webp',
  'eco brick': '/images/EcoBrick.webp',
  'waste bin': '/images/Waste Bin.webp',
  'garden planter': '/images/Garden Planter.webp',
  'eco bench': '/images/Eco Bench.webp',
  'ecobike rack': '/images/ECOBIKE RACK.webp',
  'ecobusstop': '/images/ECOBUSSTOP.webp',
  'eco bus stop': '/images/ECOBUSSTOP.webp',
  'playground block': '/images/art-tiles.webp',
  'art tiles': '/images/art-tiles.webp',
  'ecostreet furniture': '/images/green-city_5994274.webp',
  'eco-friendly business cards': '/images/Eco-friendly Business Cards.webp',
  'eco friendly business cards': '/images/Eco-friendly Business Cards.webp',
  'business cards': '/images/Eco-friendly Business Cards.webp',
  
  // Voting Projects - exact name matches
  'new playground for school': '/images/New Playground for School.webp',
  'new playground for school #45': '/images/New Playground for School.webp',
  'playground for school 45': '/images/New Playground for School.webp',
  'playground': '/images/playground.webp',
  'school': '/images/school.webp',
  'eco park benches': '/images/park.webp',
  'eco-park benches': '/images/park.webp',
  'eco park benches from recycled tires': '/images/park.webp',
  'eco park benches from recycled plastic and tires': '/images/park.webp',
  'park benches': '/images/park.webp',
  'park': '/images/park.webp',
  'kindergarten garden path': '/images/kindergarden.webp',
  'kindergarten': '/images/kindergarden.webp',
  'garden path': '/images/plant-a-tree_6675353.webp',
  
  // Collection Points - exact name matches
  'tashkent central park': '/images/park.webp',
  'central park': '/images/park.webp',
  'chilonzor mahalla': '/images/Chilonzor Mahalla.webp',
  'chilonzor': '/images/Chilonzor Mahalla.webp',
  'yunusobod district': '/images/Yunusobod District.webp',
  'yunusobod': '/images/Yunusobod District.webp',
  
  // Collection Point Types
  'mixed': '/images/park.webp',
  'plastic': '/images/compost_13285420.webp',
  'tires': '/images/ECOBUSSTOP.webp',
  
  // Eco Actions Event Categories
  'cleanup': '/images/forest_10089053.webp',
  'planting': '/images/plant-a-tree_6675353.webp',
  'education': '/images/book_649180.webp',
  'recycling': '/images/Plastic Recycling.webp',
  'awareness': '/images/community_16119903.webp',
  
  // Eco Actions Event Types (by title keywords)
  'school workshop': '/images/book_649180.webp',
  'tree planting': '/images/plant-a-tree_6675353.webp',
  'river cleanup': '/images/River Cleanup.webp',
  'chirchiq river cleanup': '/images/River Cleanup.webp',
  'chirchiq river cleanup campaign': '/images/River Cleanup.webp',
  'awareness walk': '/images/community_16119903.webp',
  'waste audit': '/images/eco-points.webp',
  'community impact': '/images/community_16119903.webp',
  'sustainable future': '/images/sustainable-future_2293652.webp',
  'eco points': '/images/eco-points.webp',
  'earn eco points': '/images/eco-points.webp',
  'earn ecopoints': '/images/eco-points.webp',
  'meet like-minded people': '/images/Meet Like-minded People.webp',
  
  // Stories - exact name matches
  'zaminat.eco launches pilot program': '/images/community_16119903.webp',
  'pilot program': '/images/community_16119903.webp',
  'launches pilot program': '/images/community_16119903.webp',
  'future of plastic and rubber recycling': '/images/Future of Plastic.webp',
  'future of plastic': '/images/Future of Plastic.webp',
  'plastic and rubber recycling': '/images/Plastic.webp',
  'plastic recycling': '/images/Plastic.webp',
  'future recycling': '/images/Future of Plastic.webp',
  'educational programs': '/images/book_649180.webp',
  'teaching the next generation': '/images/book_649180.webp',
  'from landfill to playground': '/images/New Playground for School.webp',
  'mahalla transformation': '/images/Bobur.webp',
  'landfill to playground': '/images/New Playground for School.webp',
  'transformation': '/images/Bobur.webp',
  'bobur rahimov': '/images/Bobur.webp',
  'bobur': '/images/Bobur.webp',
  'teaching kids': '/images/Malika.webp',
  'teaching kids about plastic and rubber recycling': '/images/Malika.webp',
  'malika tursunova': '/images/Malika.webp',
  'malika': '/images/Malika.webp',
  
  // Categories - exact name matches (using actual file names from images folder)
  'construction': '/images/construction.webp',
  'recreation': '/images/recreation.webp',
  'furniture': '/images/Furniture.webp',
  'infrastructure': '/images/Infrastructure.webp',
  
  // Category translations (Russian, Uzbek)
  'строительство': '/images/construction.webp', // Russian: Construction
  'qurilish': '/images/construction.webp', // Uzbek: Construction
  'отдых': '/images/recreation.webp', // Russian: Recreation
  'dam olish': '/images/recreation.webp', // Uzbek: Recreation
  'мебель': '/images/Furniture.webp', // Russian: Furniture
  'mebel': '/images/Furniture.webp', // Uzbek: Furniture
  'инфраструктура': '/images/Infrastructure.webp', // Russian: Infrastructure
  'infratuzilma': '/images/Infrastructure.webp', // Uzbek: Infrastructure
};

/**
 * Enhanced icon finder with special mappings
 */
export function getIconForProductOrCategory(name: string, fallback?: string): string {
  if (!name) return fallback || '/images/art-tiles.webp';
  
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

