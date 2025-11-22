/**
 * Slug Utility Functions
 * Converts product names to SEO-friendly URLs
 * 
 * Examples:
 * "EPDM Rubber Ecotiles" -> "epdm-rubber-ecotiles"
 * "Ecostreet Furniture" -> "ecostreet-furniture"
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A clean, lowercase, hyphenated slug
 */
export function createSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Converts a slug back to a readable format (for display)
 * @param slug - The slug to convert
 * @returns A readable string with proper capitalization
 */
export function slugToReadable(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Creates a slug from a product name, handling special cases
 * @param productName - The product name
 * @returns A clean slug
 */
export function productNameToSlug(productName: string): string {
  if (!productName) return '';
  
  // Handle special cases
  const specialCases: Record<string, string> = {
    'EPDM Rubber Ecotiles': 'epdm-rubber-ecotiles',
    'EPDM-free Tiles': 'epdm-free-tiles',
    'Ecostreet Furniture': 'ecostreet-furniture',
    'Eco Bench': 'eco-bench',
    'Garden Planter': 'garden-planter',
    'Waste Bin': 'waste-bin',
    'EcoBrick': 'ecobrick',
    'ECOBIKE RACK': 'ecobike-rack',
    'ECOBUSSTOP': 'ecobusstop',
    'Playground Block (Art Tiles)': 'playground-block-art-tiles',
  };
  
  // Check if there's a special case
  if (specialCases[productName]) {
    return specialCases[productName];
  }
  
  // Otherwise, create slug normally
  return createSlug(productName);
}

/**
 * Finds a product by slug (reverse lookup)
 * @param slug - The slug to search for
 * @param productNames - Array of product names to search
 * @returns The matching product name or null
 */
export function findProductBySlug(slug: string, productNames: string[]): string | null {
  if (!slug || !productNames) return null;
  
  // Try exact match first
  for (const name of productNames) {
    if (productNameToSlug(name) === slug) {
      return name;
    }
  }
  
  // Try case-insensitive match
  const lowerSlug = slug.toLowerCase();
  for (const name of productNames) {
    if (productNameToSlug(name).toLowerCase() === lowerSlug) {
      return name;
    }
  }
  
  return null;
}

