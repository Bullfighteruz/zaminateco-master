/**
 * useVirtualScroll Hook
 * Implements virtual scrolling for large lists (like YouTube, Instagram)
 * Only renders visible items + buffer for smooth scrolling
 * 
 * Industry standard: Used by YouTube, Instagram, Twitter
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside viewport
  enabled?: boolean; // Enable/disable virtual scrolling
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5, enabled = true } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!enabled || items.length === 0) {
      return { start: 0, end: items.length };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length, enabled]);

  // Get visible items
  const visibleItems = useMemo(() => {
    if (!enabled) {
      return items.map((item, index) => ({
        item,
        index,
        start: index * itemHeight,
        end: (index + 1) * itemHeight,
        size: itemHeight,
      }));
    }

    return items.slice(visibleRange.start, visibleRange.end).map((item, relativeIndex) => {
      const index = visibleRange.start + relativeIndex;
      return {
        item,
        index,
        start: index * itemHeight,
        end: (index + 1) * itemHeight,
        size: itemHeight,
      };
    });
  }, [items, visibleRange, itemHeight, enabled]);

  // Total height of all items
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }
  }, [itemHeight]);

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    handleScroll,
    scrollToItem,
    containerRef,
    startIndex: visibleRange.start,
    endIndex: visibleRange.end,
  };
}

