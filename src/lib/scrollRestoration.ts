import { stripLanguagePrefix } from './i18nRouting';

export interface ScrollSnapshot {
  sourceLogicalPath: string;
  anchorId: string | null;
  anchorOffset: number;
  relativeProgress: number;
  timestamp: number;
}

let pendingSnapshot: ScrollSnapshot | null = null;

/**
 * Capture current viewport position and nearest semantic anchor before language switch.
 */
export function captureScrollSnapshot(pathname: string): void {
  if (typeof window === 'undefined') return;

  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const relativeProgress = Math.max(0, Math.min(scrollY / scrollableHeight, 1));
  const logicalPath = stripLanguagePrefix(pathname);

  // If at the very top, no scroll restoration needed
  if (scrollY < 20) {
    pendingSnapshot = null;
    return;
  }

  // 1. Search candidate elements with id or data-scroll-anchor within the content area
  let bestAnchorId: string | null = null;
  let bestAnchorOffset = 0;

  try {
    const candidates = document.querySelectorAll<HTMLElement>(
      'main [id], main [data-scroll-anchor], section[id], article[id], div[id], [data-scroll-anchor]'
    );

    let closestDistance = Infinity;

    candidates.forEach((el) => {
      const id = el.getAttribute('data-scroll-anchor') || el.id;
      // Filter out framework/dialog/tooltip/fixed UI elements
      if (
        !id ||
        id.startsWith('radix-') ||
        id.startsWith('layout-') ||
        id.startsWith('floating-') ||
        id.includes('tooltip') ||
        id.includes('modal')
      ) {
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.height > 20 && rect.width > 20) {
        const distFromTop = Math.abs(rect.top);
        if (rect.top <= 200 && rect.bottom >= 0 && distFromTop < closestDistance) {
          closestDistance = distFromTop;
          bestAnchorId = id;
          bestAnchorOffset = -rect.top; // How many pixels scrolled past this anchor's top
        }
      }
    });
  } catch {
    // If DOM query fails, fallback gracefully to relative progress
  }

  pendingSnapshot = {
    sourceLogicalPath: logicalPath,
    anchorId: bestAnchorId,
    anchorOffset: bestAnchorOffset,
    relativeProgress,
    timestamp: Date.now(),
  };
}

/**
 * Retrieve the pending snapshot if valid for the current logical route.
 */
export function getPendingScrollSnapshot(currentPathname: string): ScrollSnapshot | null {
  if (!pendingSnapshot) return null;

  const currentLogicalPath = stripLanguagePrefix(currentPathname);
  const isExpired = Date.now() - pendingSnapshot.timestamp > 3500;
  const isSamePage = pendingSnapshot.sourceLogicalPath === currentLogicalPath;

  if (isExpired || !isSamePage) {
    pendingSnapshot = null;
    return null;
  }

  return pendingSnapshot;
}

/**
 * Clear the pending snapshot after restoration is complete.
 */
export function clearPendingScrollSnapshot(): void {
  pendingSnapshot = null;
}
