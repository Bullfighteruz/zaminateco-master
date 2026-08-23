/**
 * useSEO Hook
 * Manages dynamic SEO meta tags, Open Graph, Twitter Cards, canonical URLs, and html lang
 * Updates document title, meta description, OG tags, og:locale, and canonical URL per page
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, buildLocalizedUrl, LANGUAGE_NAMES } from '@/lib/i18nRouting';

export interface SEOParams {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  noindex?: boolean;
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(attribute: 'name' | 'property', value: string, content: string) {
  let meta = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, value);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Update canonical URL
 */
function updateCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

/**
 * SEO Hook - Updates all SEO-related meta tags dynamically
 */
export function useSEO({
  title,
  description,
  image = '/og-image.jpeg',
  url,
  type = 'website',
  keywords,
  noindex = false,
}: SEOParams) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.language);
  const baseUrl = 'https://zaminat.uz';
  const fullTitle = `${title} | ZAMINAT.eco`;
  const canonicalUrl = url || buildLocalizedUrl(location.pathname + location.search, currentLang, baseUrl);
  const ogLocale = LANGUAGE_NAMES[currentLang]?.locale || 'en_US';

  useEffect(() => {
    // Update document title and html lang
    document.title = fullTitle;
    document.documentElement.lang = currentLang;

    // Update meta description
    updateMetaTag('name', 'description', description);

    // Update keywords if provided
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // Update robots
    updateMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:image', image.startsWith('http') ? image : `${baseUrl}${image}`);
    updateMetaTag('property', 'og:image:alt', title);
    updateMetaTag('property', 'og:site_name', 'ZAMINAT.eco');
    updateMetaTag('property', 'og:locale', ogLocale);

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image.startsWith('http') ? image : `${baseUrl}${image}`);
    updateMetaTag('name', 'twitter:image:alt', title);

    // Update canonical URL
    updateCanonical(canonicalUrl);
  }, [title, description, image, canonicalUrl, type, keywords, noindex, fullTitle, baseUrl, currentLang, ogLocale]);
}
