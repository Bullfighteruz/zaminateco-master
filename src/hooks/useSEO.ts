/**
 * useSEO Hook
 * Manages dynamic SEO meta tags, Open Graph, Twitter Cards, and canonical URLs
 * Updates document title, meta description, OG tags, and canonical URL per page
 * 
 * Industry standard: Used by all major websites for proper SEO
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
 * Remove meta tags by selector
 */
function removeMetaTags(selector: string) {
  document.querySelectorAll(selector).forEach(tag => tag.remove());
}

/**
 * SEO Hook - Updates all SEO-related meta tags dynamically
 * 
 * @example
 * ```tsx
 * useSEO({
 *   title: 'Shop - Eco Products',
 *   description: 'Browse our eco-friendly products',
 *   image: '/images/shop-preview.jpg',
 *   type: 'website'
 * });
 * ```
 */
export function useSEO({
  title,
  description,
  image = '/og-image.png',
  url,
  type = 'website',
  keywords,
  noindex = false,
}: SEOParams) {
  const location = useLocation();
  const baseUrl = 'https://zaminat.uz';
  const fullTitle = `${title} | ZAMINAT.eco`;
  const canonicalUrl = url || `${baseUrl}${location.pathname}${location.search}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

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
    updateMetaTag('property', 'og:locale', 'en_US');

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image.startsWith('http') ? image : `${baseUrl}${image}`);
    updateMetaTag('name', 'twitter:image:alt', title);

    // Update canonical URL
    updateCanonical(canonicalUrl);

    // Cleanup function (optional, but good practice)
    return () => {
      // Don't remove meta tags on unmount - they should persist
      // Only remove if you want to reset to defaults
    };
  }, [title, description, image, canonicalUrl, type, keywords, noindex, fullTitle, baseUrl]);
}

