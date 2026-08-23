/**
 * useHreflang Hook
 * Manages hreflang tags for multilingual SEO
 * Updates hreflang tags dynamically based on current route and language
 * 
 * Industry standard: Required for international SEO
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = ['en', 'ru', 'uz'] as const;
const BASE_URL = 'https://zaminat.uz';

/**
 * Generate hreflang URL based on routing structure
 * Your site uses query params or pathname-based routing
 */
function getHreflangUrl(pathname: string, search: string, lang: string): string {
  // Check if pathname has a language prefix (e.g., /en/founder/... or /ru/...)
  const langPrefixMatch = pathname.match(/^\/(en|ru|uz)(\/.*)?$/);
  if (langPrefixMatch) {
    const subPath = langPrefixMatch[2] || '';
    const cleanSearch = search ? search : '';
    return `${BASE_URL}/${lang}${subPath}${cleanSearch}`;
  }

  // If language is already in URL params, replace it
  const urlParams = new URLSearchParams(search);
  urlParams.set('lang', lang);
  
  return `${BASE_URL}${pathname}?${urlParams.toString()}`;
}

/**
 * useHreflang Hook - Manages hreflang tags for multilingual SEO
 * 
 * @example
 * ```tsx
 * useHreflang(); // Automatically manages hreflang tags
 * ```
 */
export function useHreflang() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  useEffect(() => {
    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

    // Add hreflang for each supported language
    SUPPORTED_LANGUAGES.forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', getHreflangUrl(location.pathname, location.search, lang));
      document.head.appendChild(link);
    });

    // Add x-default (points to English as default)
    const defaultLink = document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', getHreflangUrl(location.pathname, location.search, 'en'));
    document.head.appendChild(defaultLink);

    // Cleanup
    return () => {
      // Keep hreflang tags - they should persist
    };
  }, [location.pathname, location.search, currentLang]);
}

