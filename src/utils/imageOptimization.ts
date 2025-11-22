/**
 * Image Optimization Utilities
 * Professional image optimization helpers for mobile performance
 */

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimized image URL with WebP support
 */
export async function getOptimizedImageUrl(src: string): Promise<string> {
  const webPSupported = await supportsWebP();
  
  // If WebP is supported and image is not already WebP, try WebP version
  if (webPSupported && !src.includes('.webp') && !src.startsWith('http')) {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpSrc;
  }
  
  return src;
}

/**
 * Generate responsive srcset for different screen sizes
 */
export function generateSrcSet(baseSrc: string, sizes: number[] = [400, 800, 1200]): string {
  // For now, return single source
  // In production, you could generate multiple sizes using image CDN or build-time optimization
  return baseSrc;
}

/**
 * Get appropriate image size based on viewport
 */
export function getImageSizeForViewport(isMobile: boolean, containerWidth?: number): number {
  if (containerWidth) {
    return Math.ceil(containerWidth * (isMobile ? 2 : 1.5)); // Retina support
  }
  
  return isMobile ? 800 : 1200;
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(srcs: string[]): void {
  srcs.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with Intersection Observer
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  rootMargin: string = '100px'
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin,
      threshold: 0.01,
    }
  );
}

