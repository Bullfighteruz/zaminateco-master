import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPendingScrollSnapshot, clearPendingScrollSnapshot } from '@/lib/scrollRestoration';

/**
 * ScrollToTop & Centralized Language-Switch Scroll Position Coordinator.
 *
 * Behaviors:
 * 1. **Explicit Hash Anchor Navigation** (#collection-map, #about-section, etc.):
 *    Prioritizes scrolling directly to the targeted element.
 * 2. **Same-Page Language Switching** (/en/about -> /ru/about):
 *    Restores the exact semantic anchor or relative scroll progress across hydration/layout shifts.
 * 3. **Normal Cross-Page Navigation** (/en/team -> /en/actions):
 *    Instantly resets viewport scroll to top (0, 0).
 */
export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // ── 1. Priority: Explicit Hash Anchor Navigation ──
    if (location.hash) {
      clearPendingScrollSnapshot();
      const rawHash = location.hash;
      const targetId = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;

      const scrollToHash = () => {
        const targetElement = document.getElementById(targetId) || document.querySelector(rawHash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      };

      requestAnimationFrame(scrollToHash);
      const h1 = setTimeout(scrollToHash, 50);
      const h2 = setTimeout(scrollToHash, 150);
      const h3 = setTimeout(scrollToHash, 350);

      return () => {
        clearTimeout(h1);
        clearTimeout(h2);
        clearTimeout(h3);
      };
    }

    // ── 2. Same-Page Language Switch Scroll Restoration ──
    const snapshot = getPendingScrollSnapshot(location.pathname);
    if (snapshot) {
      const restoreScroll = () => {
        let targetY = 0;

        if (snapshot.anchorId) {
          const anchorEl =
            document.getElementById(snapshot.anchorId) ||
            document.querySelector(`[data-scroll-anchor="${snapshot.anchorId}"]`);

          if (anchorEl) {
            const anchorTop = anchorEl.getBoundingClientRect().top + window.scrollY;
            targetY = anchorTop + snapshot.anchorOffset;
          } else {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            targetY = snapshot.relativeProgress * scrollable;
          }
        } else {
          const scrollable = document.documentElement.scrollHeight - window.innerHeight;
          targetY = snapshot.relativeProgress * scrollable;
        }

        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const clampedY = Math.max(0, Math.min(targetY, maxScroll));

        window.scrollTo({
          top: clampedY,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        });
        document.documentElement.scrollTop = clampedY;
        document.body.scrollTop = clampedY;
      };

      // Multi-frame synchronization to accommodate lazy-loaded images, prerender hydration & layout shifts
      requestAnimationFrame(restoreScroll);
      const t1 = setTimeout(restoreScroll, 50);
      const t2 = setTimeout(restoreScroll, 150);
      const t3 = setTimeout(restoreScroll, 300);
      const t4 = setTimeout(() => {
        restoreScroll();
        clearPendingScrollSnapshot();
      }, 500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }

    // ── 3. Normal Cross-Page Navigation: Reset to Top ──
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [location.pathname, location.hash]);

  return null;
}