import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'zaminat_scroll_positions';

/**
 * ScrollManager handles two behaviors:
 * 
 * 1. **Route changes (PUSH/REPLACE)**: Scrolls to top instantly.
 *    Back/forward (POP) is left to the browser's native restoration.
 * 
 * 2. **Page refresh**: Saves scroll position per pathname into sessionStorage
 *    on beforeunload, then restores it after the app mounts.
 *    This fixes the common SPA issue where React hydration + lazy content
 *    loading causes layout shifts that defeat the browser's native
 *    scroll restoration.
 */
export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const hasRestoredRef = useRef(false);

  // ── Save scroll position before page unload ──
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
        positions[location.pathname] = window.scrollY;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      } catch {
        // Silently fail if sessionStorage is full/unavailable
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  // ── Restore scroll position on initial load (page refresh) ──
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      const savedY = positions[location.pathname];

      if (savedY && savedY > 0) {
        // Disable browser's built-in scroll restoration so it doesn't fight us
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }

        // Wait for the initial render + images/layout to stabilize,
        // then restore scroll position
        const restore = () => {
          window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
        };

        // Try immediately, then again after a short delay to handle
        // lazy-loaded components that shift layout
        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 100);
          setTimeout(restore, 300);
        });
      }
    } catch {
      // Silently fail
    }
  }, []);

  // ── Scroll to top on route PUSH/REPLACE ──
  useEffect(() => {
    if (navigationType === 'POP') {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    });
  }, [location.pathname, navigationType]);

  return null;
}
