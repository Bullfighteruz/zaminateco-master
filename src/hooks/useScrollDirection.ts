import { useState, useEffect, useRef } from 'react';

/**
 * Hook that tracks scroll direction with hysteresis to prevent jitter.
 *
 * Uses:
 *  - requestAnimationFrame coalescing (1 update per paint frame)
 *  - A scroll-delta threshold so tiny thumb wobbles are ignored
 *  - GPU-friendly: callers drive CSS transform transitions, not layout props
 *
 * @param threshold  Minimum px of net scroll before toggling (default 8)
 * @returns `true` when the navbar/buttons should be visible
 */
export function useScrollDirection(threshold = 8): boolean {
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const scrollDeltaRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current !== null) return; // already queued
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollYRef.current;
        lastScrollYRef.current = currentScrollY;

        // Always visible near the top of the page
        if (currentScrollY < 10) {
          scrollDeltaRef.current = 0;
          setVisible(true);
          return;
        }

        // Accumulate delta; reset accumulator when direction flips
        if (
          (scrollDeltaRef.current > 0 && delta < 0) ||
          (scrollDeltaRef.current < 0 && delta > 0)
        ) {
          scrollDeltaRef.current = delta;
        } else {
          scrollDeltaRef.current += delta;
        }

        if (scrollDeltaRef.current > threshold) {
          setVisible(false);
          scrollDeltaRef.current = 0;
        } else if (scrollDeltaRef.current < -threshold) {
          setVisible(true);
          scrollDeltaRef.current = 0;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [threshold]);

  return visible;
}
