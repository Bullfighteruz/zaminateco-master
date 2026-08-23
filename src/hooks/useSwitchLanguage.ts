import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  replaceLanguageInPath,
  normalizeLanguage,
  extractLanguageFromPath,
  isSupportedLanguage,
  type SupportedLanguage,
} from '@/lib/i18nRouting';
import { captureScrollSnapshot } from '@/lib/scrollRestoration';

export interface UseSwitchLanguageReturn {
  currentLang: SupportedLanguage;
  switchLanguage: (targetLang: string, options?: { replace?: boolean }) => void;
}

/**
 * Authoritative hook for language switching across all ZAMINAT.eco surfaces.
 * Ensures URL language prefix is the single source of truth while preserving
 * pathnames, query strings, and hash anchors.
 */
export function useSwitchLanguage(): UseSwitchLanguageReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang: urlLangParam } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();

  // Authoritative language: derived from URL parameter or pathname prefix first, fallback to i18n
  const pathLang = extractLanguageFromPath(location.pathname).lang;
  const currentLang = useMemo<SupportedLanguage>(() => {
    if (urlLangParam && isSupportedLanguage(urlLangParam)) {
      return normalizeLanguage(urlLangParam);
    }
    if (pathLang) {
      return pathLang;
    }
    return normalizeLanguage(i18n.language);
  }, [urlLangParam, pathLang, i18n.language]);

  const switchLanguage = useCallback(
    (targetLang: string, options?: { replace?: boolean }) => {
      const cleanLang = normalizeLanguage(targetLang);
      const currentFull = location.pathname + location.search + location.hash;
      const newPath = replaceLanguageInPath(currentFull, cleanLang);

      // 1. Immediately update html document lang attribute
      document.documentElement.lang = cleanLang;

      // 2. Persist in storage for client UI preference
      try {
        localStorage.setItem('i18nextLng', cleanLang);
      } catch {
        // Ignore storage access errors
      }

      // 3. Synchronously align i18n runtime instance
      if (i18n.language !== cleanLang) {
        i18n.changeLanguage(cleanLang);
      }

      // 4. Capture semantic scroll snapshot before navigating to target localized route
      captureScrollSnapshot(location.pathname);

      // 5. Authoritative navigation to the localized URL route
      navigate(newPath, { replace: options?.replace ?? true });
    },
    [location.pathname, location.search, location.hash, i18n, navigate]
  );

  return {
    currentLang,
    switchLanguage,
  };
}
