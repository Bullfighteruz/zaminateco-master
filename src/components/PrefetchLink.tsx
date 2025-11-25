/**
 * Enhanced Link component with automatic route prefetching
 * Prefetches route code on hover/focus/touch for faster navigation
 */
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetchRoute } from '@/hooks/usePrefetchRoute';
import { useCallback, useRef, useEffect } from 'react';

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
}

export default function PrefetchLink({ to, children, ...props }: PrefetchLinkProps) {
  const { handleMouseEnter, handleTouchStart, handleFocus } = usePrefetchRoute();
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const path = typeof to === 'string' ? to : to.pathname || '';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const onMouseEnter = useCallback(() => {
    if (path) {
      // Cleanup previous timeout if exists
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = handleMouseEnter(path);
    }
  }, [path, handleMouseEnter]);

  const onTouchStart = useCallback(() => {
    if (path) {
      handleTouchStart(path);
    }
  }, [path, handleTouchStart]);

  const onFocus = useCallback(() => {
    if (path) {
      handleFocus(path);
    }
  }, [path, handleFocus]);

  return (
    <Link
      to={to}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onFocus={onFocus}
      {...props}
    >
      {children}
    </Link>
  );
}

