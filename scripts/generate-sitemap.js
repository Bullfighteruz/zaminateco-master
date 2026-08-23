/**
 * Sitemap Generator v2 (Multilingual International Architecture)
 * Generates XML sitemap for all PUBLIC_INDEXABLE routes across EN, RU, UZ with reciprocal hreflang alternates
 * Run: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://zaminat.uz';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

const LANGUAGES = ['en', 'ru', 'uz'];
const DEFAULT_LANG = 'en';

// Public indexable base routes (without language prefix)
// Multilingual Founder URLs: /en/founder/sukhrobjon-rikhsiboev, /ru/founder/sukhrobjon-rikhsiboev, /uz/founder/sukhrobjon-rikhsiboev
const PUBLIC_INDEXABLE_PAGES = [
  { subpath: '', priority: '1.0', changefreq: 'weekly' },
  { subpath: '/about', priority: '0.8', changefreq: 'monthly' },
  { subpath: '/shop', priority: '0.9', changefreq: 'daily' },
  { subpath: '/vote', priority: '0.8', changefreq: 'weekly' },
  { subpath: '/actions', priority: '0.8', changefreq: 'weekly' },
  { subpath: '/stories', priority: '0.8', changefreq: 'weekly' },
  { subpath: '/partners', priority: '0.7', changefreq: 'monthly' },
  { subpath: '/team', priority: '0.7', changefreq: 'monthly' },
  { subpath: '/contacts', priority: '0.6', changefreq: 'monthly' },
  { subpath: '/founder/sukhrobjon-rikhsiboev', priority: '0.9', changefreq: 'monthly' },
];

// Product slugs
const PRODUCT_SLUGS = [
  'epdm-rubber-ecotiles',
  'epdm-free-tiles',
  'ecobrick',
  'waste-bin',
  'garden-planter',
  'eco-bench',
  'ecobike-rack',
  'ecobusstop',
  'playground-block-art-tiles',
  'ecostreet-furniture',
];

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Generate XML sitemap
function generateSitemap() {
  const currentDate = getCurrentDate();
  const urls = [];

  // Generate entries for public indexable pages
  PUBLIC_INDEXABLE_PAGES.forEach(page => {
    const alternates = LANGUAGES.map(lang => ({
      hreflang: lang,
      href: `${BASE_URL}/${lang}${page.subpath}`,
    }));
    alternates.push({
      hreflang: 'x-default',
      href: `${BASE_URL}/${DEFAULT_LANG}${page.subpath}`,
    });

    LANGUAGES.forEach(lang => {
      urls.push({
        loc: `${BASE_URL}/${lang}${page.subpath}`,
        lastmod: currentDate,
        changefreq: page.changefreq,
        priority: page.priority,
        alternates,
      });
    });
  });

  // Generate entries for product pages
  PRODUCT_SLUGS.forEach(slug => {
    const subpath = `/product/${slug}`;
    const alternates = LANGUAGES.map(lang => ({
      hreflang: lang,
      href: `${BASE_URL}/${lang}${subpath}`,
    }));
    alternates.push({
      hreflang: 'x-default',
      href: `${BASE_URL}/${DEFAULT_LANG}${subpath}`,
    });

    LANGUAGES.forEach(lang => {
      urls.push({
        loc: `${BASE_URL}/${lang}${subpath}`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.8',
        alternates,
      });
    });
  });

  // Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  urls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.alternates && url.alternates.length > 0) {
      url.alternates.forEach(alt => {
        xml += `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />\n`;
      });
    }
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return { xml, count: urls.length };
}

// Escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main execution
try {
  const { xml, count } = generateSitemap();
  
  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write sitemap
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
  console.log(`✅ Multilingual Sitemap v2 generated successfully: ${OUTPUT_FILE}`);
  console.log(`   Total Indexable Multilingual URLs: ${count}`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
