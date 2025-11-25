import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that resets scroll position on route changes.
 * Optimized for instant scroll reset without blocking navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame for smoother, non-blocking scroll reset
    requestAnimationFrame(() => {
      // Reset scroll position immediately when pathname changes
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      // Also reset documentElement for better browser compatibility
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}