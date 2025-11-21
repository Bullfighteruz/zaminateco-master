/**
 * Image Helper Utilities
 * Helps with image loading, sizing, and debugging
 */

/**
 * Preload an image and check if it's valid
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Get image dimensions without loading into DOM
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  try {
    const img = await preloadImage(src);
    return { width: img.width, height: img.height };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
}

/**
 * Check if image is square (1:1 aspect ratio)
 */
export async function isSquareImage(src: string, tolerance: number = 0.05): Promise<boolean> {
  const { width, height } = await getImageDimensions(src);
  if (width === 0 || height === 0) return false;
  const aspectRatio = width / height;
  return Math.abs(aspectRatio - 1) < tolerance;
}

/**
 * Generate optimized image URL with proper encoding
 * Handles both encoded and non-encoded URLs
 */
export function getOptimizedImageUrl(src: string): string {
  // If already encoded, return as-is
  if (src.includes('%')) {
    return src;
  }
  
  // Ensure proper URL encoding for spaces and special characters
  try {
    // Split into path parts
    const parts = src.split('/');
    const fileName = parts[parts.length - 1];
    const directory = parts.slice(0, -1).join('/');
    
    // Decode first in case it's double-encoded, then encode properly
    let decodedFileName: string;
    try {
      decodedFileName = decodeURIComponent(fileName);
    } catch {
      decodedFileName = fileName;
    }
    
    // Encode filename but preserve forward slashes
    const encodedFileName = encodeURIComponent(decodedFileName);
    
    return `${directory}/${encodedFileName}`;
  } catch (error) {
    // Fallback to original if encoding fails
    return src;
  }
}

/**
 * Try multiple URL variations for an image path
 * Useful when dealing with spaces and special characters
 */
export function getImageUrlVariations(src: string): string[] {
  const variations: Set<string> = new Set([src]);
  
  try {
    // Split URL
    const parts = src.split('/');
    const fileName = parts[parts.length - 1];
    const directory = parts.slice(0, -1).join('/');
    
    // Helper to add variation
    const addVariation = (newFileName: string) => {
      if (newFileName && newFileName !== fileName) {
        variations.add(`${directory}/${newFileName}`);
      }
    };
    
    // 1. Try decoded version (if it's encoded)
    try {
      const decoded = decodeURIComponent(fileName);
      addVariation(decoded);
      
      // If decoded has spaces, try encoding it
      if (decoded.includes(' ')) {
        addVariation(encodeURIComponent(decoded));
      }
    } catch {}
    
    // 2. Try encoded version (if it has spaces)
    if (fileName.includes(' ') && !fileName.includes('%')) {
      addVariation(encodeURIComponent(fileName));
    }
    
    // 3. Try replacing %20 with space
    if (fileName.includes('%20')) {
      const withSpace = fileName.replace(/%20/g, ' ');
      addVariation(withSpace);
      // Also try re-encoding it
      addVariation(encodeURIComponent(withSpace));
    }
    
    // 4. Try replacing space with %20
    if (fileName.includes(' ') && !fileName.includes('%')) {
      const encoded = fileName.replace(/\s/g, '%20');
      addVariation(encoded);
    }
    
    // 5. Try using encodeURIComponent on the whole filename
    try {
      const decoded = decodeURIComponent(fileName);
      const properlyEncoded = encodeURIComponent(decoded);
      addVariation(properlyEncoded);
    } catch {}
    
    // 6. Try hyphen variations (sometimes files are renamed)
    if (fileName.includes('%20')) {
      const withHyphen = fileName.replace(/%20/g, '-');
      addVariation(withHyphen);
      const decoded = decodeURIComponent(fileName);
      const withHyphen2 = decoded.replace(/\s/g, '-');
      addVariation(withHyphen2);
    }
    
    if (fileName.includes(' ')) {
      const withHyphen = fileName.replace(/\s/g, '-');
      addVariation(withHyphen);
    }
    
    if (fileName.includes('-')) {
      const withSpace = fileName.replace(/-/g, ' ');
      addVariation(withSpace);
      addVariation(encodeURIComponent(withSpace));
    }
    
  } catch (error) {
    console.warn('Error generating URL variations:', error);
  }
  
  // Return as array, remove duplicates
  return Array.from(variations);
}

/**
 * Batch preload images
 */
export async function preloadImages(srcs: string[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>();
  const promises = srcs.map(async (src) => {
    try {
      const img = await preloadImage(src);
      imageMap.set(src, img);
    } catch (error) {
      console.warn(`Failed to preload image: ${src}`, error);
    }
  });
  
  await Promise.all(promises);
  return imageMap;
}

