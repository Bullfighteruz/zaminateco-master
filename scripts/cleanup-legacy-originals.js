import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const CONVERSION_REPORT_FILE = path.join(__dirname, 'conversion-report.json');

function runCleanup() {
  if (!fs.existsSync(CONVERSION_REPORT_FILE)) {
    console.error('❌ Conversion report not found.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(CONVERSION_REPORT_FILE, 'utf8'));
  const convertedItems = report.convertedDetails;

  console.log(`🧹 Starting safe cleanup of ${convertedItems.length} verified converted legacy original images...\n`);

  let deletedCount = 0;
  let deletedBytes = 0;

  for (const item of convertedItems) {
    const fullPath = path.join(ROOT_DIR, item.relPath);
    const avifFullPath = path.join(ROOT_DIR, item.relAvifPath);

    // Verify AVIF replacement exists before deleting original
    if (fs.existsSync(avifFullPath) && fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      fs.unlinkSync(fullPath);
      deletedCount++;
      deletedBytes += stat.size;
      console.log(`🗑️ Removed legacy original: ${item.relPath} (Saved ${(stat.size/1024).toFixed(1)} KB)`);
    } else {
      console.warn(`⚠️ Skipped removal for ${item.relPath} (AVIF replacement missing)`);
    }
  }

  console.log('\n===============================================================');
  console.log('                 SAFE CLEANUP SUMMARY REPORT                   ');
  console.log('===============================================================');
  console.log(`Original Files Removed: ${deletedCount}`);
  console.log(`Storage Freed: ${(deletedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('===============================================================\n');
}

runCleanup();
