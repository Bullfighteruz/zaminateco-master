/**
 * Hook for prefetching route chunks on hover/focus
 * This significantly improves perceived navigation speed
 */
import { useCallback } from 'react';

// Map of routes to their lazy-loaded components
const routeMap: Record<string, () => Promise<any>> = {
  '/': () => import('../pages/Index'),
  '/about': () => import('../pages/About'),
  '/vote': () => import('../pages/EcoVote'),
  '/actions': () => import('../pages/EcoActions'),
  '/shop': () => import('../pages/Shop'),
  '/shop-legacy': () => import('../pages/SocialMissionShop'),
  '/stories': () => import('../pages/EcoStories'),
  '/profile': () => import('../pages/Profile'),
  '/partners': () => import('../pages/Partners'),
  '/team': () => import('../pages/Team'),
  '/contacts': () => import('../pages/Contacts'),
  '/product/:id': () => import('../pages/ProductDetail'),
};

// Cache for prefetched routes
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's code chunk
 */
export function prefetchRoute(path: string): void {
  // Normalize path (remove query params, hash)
  const normalizedPath = path.split('?')[0].split('#')[0];
  
  // Check if already prefetched
  if (prefetchedRoutes.has(normalizedPath)) {
    return;
  }

  // Find matching route
  const routeKey = Object.keys(routeMap).find(key => {
    if (key === normalizedPath) return true;
    // Handle dynamic routes like /product/:id
    if (key.includes(':')) {
      const pattern = key.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(normalizedPath);
    }
    return false;
  });

  if (routeKey && routeMap[routeKey]) {
    // Prefetch the route
    routeMap[routeKey]()
      .then(() => {
        prefetchedRoutes.add(normalizedPath);
      })
      .catch(() => {
        // Silently fail - prefetching is optional
      });
  }
}

/**
 * Hook to prefetch routes on hover/focus
 */
export function usePrefetchRoute() {
  const handleMouseEnter = useCallback((path: string) => {
    // Prefetch on hover with a small delay to avoid unnecessary prefetching
    const timeoutId = setTimeout(() => {
      prefetchRoute(path);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleTouchStart = useCallback((path: string) => {
    // Prefetch on touch start for mobile
    prefetchRoute(path);
  }, []);

  const handleFocus = useCallback((path: string) => {
    // Prefetch on focus for keyboard navigation
    prefetchRoute(path);
  }, []);

  return {
    prefetchRoute,
    handleMouseEnter,
    handleTouchStart,
    handleFocus,
  };
}

