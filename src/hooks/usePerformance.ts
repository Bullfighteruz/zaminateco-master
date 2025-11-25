/**
 * Performance optimization hooks
 * Helps prevent unnecessary re-renders and optimize React performance
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook to debounce function calls
 * Useful for search, resize, scroll handlers
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook to throttle function calls
 * Useful for scroll, resize, mousemove handlers
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook to check if component should update based on props
 * Useful for React.memo comparison functions
 */
export function usePropsComparison<T extends Record<string, any>>(
  props: T,
  keysToCompare: (keyof T)[]
): boolean {
  const prevPropsRef = useRef<T | null>(null);

  if (prevPropsRef.current === null) {
    prevPropsRef.current = props;
    return true;
  }

  const shouldUpdate = keysToCompare.some(
    (key) => prevPropsRef.current![key] !== props[key]
  );

  if (shouldUpdate) {
    prevPropsRef.current = props;
  }

  return shouldUpdate;
}

