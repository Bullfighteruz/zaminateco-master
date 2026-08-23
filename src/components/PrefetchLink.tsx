/**
 * Enhanced Link component with automatic route prefetching and localized URL resolution
 * Prefetches route code on hover/focus/touch for faster navigation
 * Automatically resolves localized target path according to active language
 */
import React, { useCallback, useRef, useEffect } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetchRoute } from '@/hooks/usePrefetchRoute';
import { useTranslation } from 'react-i18next';
import { getLocalizedPath, normalizeLanguage } from '@/lib/i18nRouting';

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
}

export default function PrefetchLink({ to, children, ...props }: PrefetchLinkProps) {
  const { handleMouseEnter, handleTouchStart, handleFocus } = usePrefetchRoute();
  const cleanupRef = useRef<(() => void) | null>(null);
  const { i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.language);
  
  const localizedTo = typeof to === 'string'
    ? getLocalizedPath(to, currentLang)
    : {
        ...to,
        pathname: getLocalizedPath(to.pathname || '', currentLang),
      };

  const path = typeof localizedTo === 'string' ? localizedTo : localizedTo.pathname || '';

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
      to={localizedTo}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onFocus={onFocus}
      {...props}
    >
      {children}
    </Link>
  );
}
