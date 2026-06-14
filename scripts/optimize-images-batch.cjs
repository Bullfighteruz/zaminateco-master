/**
 * ZAMINAT.eco Image Optimization Script
 * 
 * Converts all JPG/PNG/JPEG images in /public/images/ to optimized WebP.
 * Creates WebP versions alongside originals (doesn't delete originals).
 * 
 * Usage: node scripts/optimize-images-batch.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const QUALITY = 78; // WebP quality (0-100)
const MAX_WIDTH = 1200; // Max width for standard images
const THUMBNAIL_MAX = 400; // Max width for small icons/thumbnails

// Track stats
let totalOriginalSize = 0;
let totalOptimizedSize = 0;
let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

/**
 * Get all image files recursively
 */
function getImageFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip _originals backup dir
      if (item === '_originals') continue;
      results.push(...getImageFiles(fullPath));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

/**
 * Determine if image is a small icon/thumbnail
 */
function isSmallImage(filePath) {
  const name = path.basename(filePath).toLowerCase();
  const size = fs.statSync(filePath).size;
  // Icons and small images are typically under 100KB and have icon-like names
  return size < 100 * 1024 || 
    name.includes('icon') || 
    name.includes('logo') ||
    name.includes('flag') ||
    name.includes('avatar');
}

/**
 * Optimize a single image
 */
async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // Skip if WebP already exists and is newer
  if (fs.existsSync(webpPath)) {
    const origStat = fs.statSync(filePath);
    const webpStat = fs.statSync(webpPath);
    if (webpStat.mtimeMs > origStat.mtimeMs) {
      skippedCount++;
      return;
    }
  }
  
  const originalSize = fs.statSync(filePath).size;
  totalOriginalSize += originalSize;
  
  try {
    const maxW = isSmallImage(filePath) ? THUMBNAIL_MAX : MAX_WIDTH;
    
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Only resize if larger than max width
    const resizeOptions = metadata.width > maxW ? { width: maxW, withoutEnlargement: true } : {};
    
    await image
      .resize(resizeOptions)
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(webpPath);
    
    const optimizedSize = fs.statSync(webpPath).size;
    totalOptimizedSize += optimizedSize;
    
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    const origKB = (originalSize / 1024).toFixed(0);
    const optKB = (optimizedSize / 1024).toFixed(0);
    
    console.log(`  ✓ ${path.relative(IMAGES_DIR, filePath)}: ${origKB}KB → ${optKB}KB (${savings}% saved)`);
    processedCount++;
  } catch (err) {
    console.error(`  ✗ ${path.relative(IMAGES_DIR, filePath)}: ${err.message}`);
    errorCount++;
  }
}

/**
 * Main
 */
async function main() {
  console.log('🖼️  ZAMINAT.eco Image Optimization');
  console.log('=' .repeat(50));
  console.log(`Source: ${IMAGES_DIR}`);
  console.log(`Quality: ${QUALITY}%, Max width: ${MAX_WIDTH}px`);
  console.log('');
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found!');
    process.exit(1);
  }
  
  const files = getImageFiles(IMAGES_DIR);
  console.log(`Found ${files.length} images to optimize\n`);
  
  // Process in batches of 5 to avoid memory issues
  const BATCH_SIZE = 5;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(f => optimizeImage(f)));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Results:');
  console.log(`  Processed: ${processedCount} images`);
  console.log(`  Skipped: ${skippedCount} (already optimized)`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Original total: ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Optimized total: ${(totalOptimizedSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Total saved: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(1)} MB (${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
