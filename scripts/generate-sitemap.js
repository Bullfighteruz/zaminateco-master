/**
 * Sitemap Generator
 * Generates XML sitemap for all pages and products
 * Run: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://zaminat.eco';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/vote', priority: '0.8', changefreq: 'weekly' },
  { path: '/actions', priority: '0.8', changefreq: 'weekly' },
  { path: '/stories', priority: '0.8', changefreq: 'weekly' },
  { path: '/partners', priority: '0.7', changefreq: 'monthly' },
  { path: '/team', priority: '0.7', changefreq: 'monthly' },
  { path: '/contacts', priority: '0.6', changefreq: 'monthly' },
];

// Product slugs (from productData.ts)
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
  const urls = [];

  // Add static pages
  STATIC_PAGES.forEach(page => {
    urls.push({
      loc: `${BASE_URL}${page.path}`,
      lastmod: getCurrentDate(),
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Add product pages
  PRODUCT_SLUGS.forEach(slug => {
    urls.push({
      loc: `${BASE_URL}/product/${slug}`,
      lastmod: getCurrentDate(),
      changefreq: 'monthly',
      priority: '0.8',
    });
  });

  // Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return xml;
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
  const sitemap = generateSitemap();
  
  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write sitemap
  fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf8');
  console.log(`✅ Sitemap generated successfully: ${OUTPUT_FILE}`);
  console.log(`   Total URLs: ${STATIC_PAGES.length + PRODUCT_SLUGS.length}`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}

