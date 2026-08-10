import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const INVENTORY_FILE = path.join(__dirname, 'image-inventory.json');
const REPORT_FILE = path.join(__dirname, 'conversion-report.json');

// Exception categories that must NOT be converted or deleted
const EXCEPTION_CATEGORIES = [
  'E. OPEN_GRAPH_SOCIAL', // Retain PNG fallback alongside AVIF
  'F. PWA_ICON',           // PWA manifest icons
  'H. APPLE_TOUCH_ICON',   // iOS apple touch icons
  'G. FAVICON',            // Favicons
  'L. THIRD_PARTY_REQUIRED'// QR codes
];

async function convertAssets() {
  if (!fs.existsSync(INVENTORY_FILE)) {
    console.error('❌ Inventory file not found. Run inventory-images.js first.');
    process.exit(1);
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
  console.log(`🚀 Starting safe AVIF migration for ${inventory.length} assets...\n`);

  const report = {
    totalAssets: inventory.length,
    convertedCount: 0,
    retainedCount: 0,
    failedCount: 0,
    totalOriginalBytes: 0,
    totalAvifBytes: 0,
    bytesSaved: 0,
    percentageSaved: '0%',
    convertedDetails: [],
    retainedDetails: []
  };

  for (const item of inventory) {
    const fullPath = path.join(ROOT_DIR, item.relPath);
    
    // Check if exception
    if (EXCEPTION_CATEGORIES.includes(item.category)) {
      report.retainedCount++;
      report.retainedDetails.push({
        relPath: item.relPath,
        category: item.category,
        reason: 'Required for platform/social/PWA compatibility'
      });
      console.log(`⏩ Skipping ${item.relPath} [${item.category}] — Compatibility Exception`);
      continue;
    }

    // Determine output path
    const parsed = path.parse(fullPath);
    const avifPath = path.join(parsed.dir, parsed.name + '.avif');
    const relAvifPath = path.relative(ROOT_DIR, avifPath).replace(/\\/g, '/');

    // Tailored conversion profile per category
    let quality = 80;
    let chromaSubsampling = '4:2:0';

    if (item.category === 'B. UI_IMAGE') {
      quality = 85;
      chromaSubsampling = '4:4:4'; // High text sharpness for UI screenshots
    } else if (item.category === 'D. LOGO_BRAND') {
      quality = 90;
      chromaSubsampling = '4:4:4';
    } else if (item.category === 'C. PRODUCT_IMAGE') {
      quality = 82;
      chromaSubsampling = '4:2:0';
    }

    try {
      const sharpInstance = sharp(fullPath);

      await sharpInstance
        .avif({ quality, chromaSubsampling, effort: 6 })
        .toFile(avifPath);

      const avifStat = fs.statSync(avifPath);

      // Verify output quality & size
      if (avifStat.size >= item.sizeBytes && item.sizeBytes < 10000) {
        // If AVIF is larger on very small icons, keep original
        fs.unlinkSync(avifPath);
        report.retainedCount++;
        report.retainedDetails.push({
          relPath: item.relPath,
          category: item.category,
          reason: 'AVIF size was larger than original'
        });
        console.log(`⏩ Skipped ${item.relPath} (AVIF size ${avifStat.size} >= orig ${item.sizeBytes})`);
      } else {
        const saved = item.sizeBytes - avifStat.size;
        const pct = ((saved / item.sizeBytes) * 100).toFixed(1);

        report.convertedCount++;
        report.totalOriginalBytes += item.sizeBytes;
        report.totalAvifBytes += avifStat.size;
        report.convertedDetails.push({
          relPath: item.relPath,
          relAvifPath,
          origSizeBytes: item.sizeBytes,
          avifSizeBytes: avifStat.size,
          bytesSaved: saved,
          percentageSaved: `${pct}%`,
          category: item.category
        });

        console.log(`✅ Converted ${item.relPath} → ${relAvifPath} | ${(item.sizeBytes/1024).toFixed(1)}KB → ${(avifStat.size/1024).toFixed(1)}KB (-${pct}%)`);
      }
    } catch (err) {
      report.failedCount++;
      console.error(`❌ Failed to convert ${item.relPath}: ${err.message}`);
    }
  }

  report.bytesSaved = report.totalOriginalBytes - report.totalAvifBytes;
  if (report.totalOriginalBytes > 0) {
    report.percentageSaved = `${((report.bytesSaved / report.totalOriginalBytes) * 100).toFixed(1)}%`;
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log('\n===============================================================');
  console.log('                AVIF CONVERSION SUMMARY REPORT                 ');
  console.log('===============================================================');
  console.log(`Converted: ${report.convertedCount} assets`);
  console.log(`Retained/Skipped: ${report.retainedCount} assets`);
  console.log(`Failed: ${report.failedCount} assets`);
  console.log(`Original Size (Converted Assets): ${(report.totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`AVIF Output Size: ${(report.totalAvifBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Bytes Saved: ${(report.bytesSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Overall Savings: ${report.percentageSaved}`);
  console.log('===============================================================\n');
}

convertAssets().catch(console.error);
