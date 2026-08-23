/**
 * Centralized International SEO & i18n Routing Library
 * Authoritative utility for language normalization, localized path generation,
 * prefix stripping, and URL language replacement for ZAMINAT.eco
 */

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'uz'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const LANGUAGE_NAMES: Record<SupportedLanguage, { name: string; nativeName: string; locale: string }> = {
  en: { name: 'English', nativeName: 'English', locale: 'en_US' },
  ru: { name: 'Russian', nativeName: 'Русский', locale: 'ru_RU' },
  uz: { name: 'Uzbek', nativeName: 'O‘zbekcha', locale: 'uz_UZ' },
};

/**
 * Type guard to check if a language string is supported
 */
export function isSupportedLanguage(lang?: string | null): lang is SupportedLanguage {
  if (!lang) return false;
  const clean = lang.toLowerCase().trim().split('-')[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(clean);
}

/**
 * Normalizes any language input to a valid SupportedLanguage
 */
export function normalizeLanguage(lang?: string | null): SupportedLanguage {
  if (!lang) return DEFAULT_LANGUAGE;
  const clean = lang.toLowerCase().trim().split('-')[0];
  if (isSupportedLanguage(clean)) {
    return clean as SupportedLanguage;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Extracts language and sub-path from a pathname
 */
export function extractLanguageFromPath(pathname: string): {
  lang: SupportedLanguage | null;
  pathWithoutLang: string;
  hasLangPrefix: boolean;
} {
  if (!pathname || pathname === '/') {
    return { lang: null, pathWithoutLang: '/', hasLangPrefix: false };
  }

  const match = pathname.match(/^\/(en|ru|uz)(\/.*)?$/i);
  if (match) {
    const lang = normalizeLanguage(match[1]);
    const pathWithoutLang = match[2] || '/';
    return {
      lang,
      pathWithoutLang: pathWithoutLang.startsWith('/') ? pathWithoutLang : `/${pathWithoutLang}`,
      hasLangPrefix: true,
    };
  }

  return {
    lang: null,
    pathWithoutLang: pathname.startsWith('/') ? pathname : `/${pathname}`,
    hasLangPrefix: false,
  };
}

/**
 * Strips language prefix from a pathname
 */
export function stripLanguagePrefix(pathname: string): string {
  const { pathWithoutLang } = extractLanguageFromPath(pathname);
  return pathWithoutLang;
}

/**
 * Returns localized pathname with target language prefix
 */
export function getLocalizedPath(path: string, targetLang?: string | null): string {
  if (!path) return `/${DEFAULT_LANGUAGE}`;
  
  // External or mailto or tel links remain untouched
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('#')) {
    return path;
  }

  const lang = normalizeLanguage(targetLang);
  
  // Split search / hash if present in string
  const hashIndex = path.indexOf('#');
  let hash = '';
  let cleanPath = path;
  if (hashIndex !== -1) {
    hash = path.substring(hashIndex);
    cleanPath = path.substring(0, hashIndex);
  }

  const queryIndex = cleanPath.indexOf('?');
  let query = '';
  if (queryIndex !== -1) {
    query = cleanPath.substring(queryIndex);
    cleanPath = cleanPath.substring(0, queryIndex);
  }

  const { pathWithoutLang } = extractLanguageFromPath(cleanPath);

  let result = `/${lang}`;
  if (pathWithoutLang !== '/') {
    result += pathWithoutLang.startsWith('/') ? pathWithoutLang : `/${pathWithoutLang}`;
  }

  return `${result}${query}${hash}`;
}

/**
 * Replaces language in full URL/path while preserving query string and hash
 */
export function replaceLanguageInPath(fullPath: string, targetLang: string): string {
  const lang = normalizeLanguage(targetLang);
  return getLocalizedPath(fullPath, lang);
}

/**
 * Builds absolute canonical URL for a given path and language
 */
export function buildLocalizedUrl(path: string, lang?: string, baseUrl: string = 'https://zaminat.uz'): string {
  const localizedPath = getLocalizedPath(path, lang);
  return `${baseUrl}${localizedPath}`;
}
