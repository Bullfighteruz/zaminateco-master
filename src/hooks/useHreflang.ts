/**
 * useHreflang Hook
 * Manages hreflang tags for multilingual SEO across EN, RU, UZ, and x-default
 * Updates reciprocal hreflang alternate tags dynamically based on current route
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, buildLocalizedUrl, normalizeLanguage, DEFAULT_LANGUAGE } from '@/lib/i18nRouting';

const BASE_URL = 'https://zaminat.uz';

/**
 * useHreflang Hook - Manages hreflang tags for multilingual SEO
 */
export function useHreflang() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.language);

  useEffect(() => {
    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

    const currentFullPath = location.pathname + location.search;

    // Add reciprocal hreflang for each supported language
    SUPPORTED_LANGUAGES.forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', buildLocalizedUrl(currentFullPath, lang, BASE_URL));
      document.head.appendChild(link);
    });

    // Add x-default (points to default language or root)
    const defaultLink = document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', buildLocalizedUrl(currentFullPath, DEFAULT_LANGUAGE, BASE_URL));
    document.head.appendChild(defaultLink);
  }, [location.pathname, location.search, currentLang]);
}
