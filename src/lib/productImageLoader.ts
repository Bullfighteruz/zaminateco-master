/**
 * Product Image Loader Utility
 * Dynamically loads all images from product folders
 * Uses the auto-generated productImages.ts file for consistency
 */

import { getProductFolderName } from './productData';
import { getProductImages as getImagesFromFolder } from './productImages';

/**
 * Get all images for a product by English name
 * This function maps English names to folder names and retrieves images
 */
export function getProductImages(englishName: string): string[] {
  const folderName = getProductFolderName(englishName);
  if (!folderName) return [];
  
  // Use the auto-generated image list from productImages.ts
  const images = getImagesFromFolder(folderName);
  
  // If no images found, try to construct a basic path
  if (images.length === 0) {
    // Fallback: construct image path from folder name
    const basePath = `/images/${folderName}`;
    // Try common image names
    const fallbackImages = [
      `${basePath}/${folderName.split('-')[0]}.jpg`,
      `${basePath}/main.jpg`,
      `${basePath}/hero.jpg`,
    ];
    return fallbackImages;
  }
  
  return images;
}

/**
 * Get hero image (first horizontal image, or first image if none found)
 */
export function getHeroImage(englishName: string): string {
  const images = getProductImages(englishName);
  if (images.length === 0) return '';
  
  // Prefer images with "environment", "collage", or main product name
  const heroCandidates = images.filter(img => 
    img.includes('environment') || 
    img.includes('collage') || 
    img.includes('hero') ||
    !img.includes('detail')
  );
  
  return heroCandidates[0] || images[0];
}

/**
 * Get gallery images (all images except hero)
 */
export function getGalleryImages(englishName: string): string[] {
  const images = getProductImages(englishName);
  const heroImage = getHeroImage(englishName);
  
  if (images.length <= 1) return [];
  
  // Return all images except the hero
  return images.filter(img => img !== heroImage);
}

/**
 * Preload images for better performance
 */
export function preloadProductImages(images: string[]): void {
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

