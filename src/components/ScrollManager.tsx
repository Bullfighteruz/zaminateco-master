import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'zaminat_scroll_positions';

/**
 * ScrollManager handles two behaviors:
 * 
 * 1. **Route changes (PUSH/REPLACE)**: Scrolls to top instantly.
 * 2. **Browser Back/Forward (POP)**: Manually restores scroll position across
 *    multiple frames to handle dynamic SPA content load and layout hydration shifts.
 */
export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // ── 1. Save scroll position on scroll ──
  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      // Debounce saving to sessionStorage to avoid performance overhead during scrolling
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        try {
          const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
          positions[location.pathname + location.search] = window.scrollY;
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
        } catch (e) {
          // Ignore storage errors
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [location.pathname, location.search]);

  // ── 2. Handle scroll restoration on route changes ──
  useEffect(() => {
    // Disable browser's built-in scroll restoration to prevent fighting
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const currentKey = location.pathname + location.search;

    if (navigationType === 'POP') {
      // Going BACK or FORWARD: restore previous position
      try {
        const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
        const savedY = positions[currentKey];

        if (savedY !== undefined && savedY > 0) {
          const restore = () => {
            window.scrollTo({ top: savedY, left: 0, behavior: 'instant' as any });
          };

          // Restore scroll across multiple frames to accommodate lazy-loaded images/content
          requestAnimationFrame(() => {
            restore();
            setTimeout(restore, 50);
            setTimeout(restore, 150);
            setTimeout(restore, 350);
            setTimeout(restore, 600); // final catch-all for heavy layout adjustments
          });
          return;
        }
      } catch (e) {
        // Fallback to top
      }
    }

    // Default: scroll to top for PUSH or if no saved position exists
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    });
  }, [location.pathname, location.search, navigationType]);

  return null;
}
