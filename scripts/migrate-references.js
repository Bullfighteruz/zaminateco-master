import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const CONVERSION_REPORT_FILE = path.join(__dirname, 'conversion-report.json');

function scanTextFiles(dir, textFileList = []) {
  const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.gemini', 'brain', 'scripts'];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (IGNORE_DIRS.some(ignored => relPath === ignored || relPath.startsWith(ignored + '/'))) {
      continue;
    }

    if (entry.isDirectory()) {
      scanTextFiles(fullPath, textFileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss'].includes(ext)) {
        textFileList.push({ fullPath, relPath });
      }
    }
  }
  return textFileList;
}

function runMigration() {
  if (!fs.existsSync(CONVERSION_REPORT_FILE)) {
    console.error('❌ Conversion report not found. Run convert-to-avif.js first.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(CONVERSION_REPORT_FILE, 'utf8'));
  const convertedItems = report.convertedDetails;
  console.log(`🔄 Migrating code references for ${convertedItems.length} converted assets...\n`);

  const textFiles = scanTextFiles(ROOT_DIR);
  let totalReplacements = 0;
  const modifiedFiles = new Set();

  for (const tf of textFiles) {
    let content = fs.readFileSync(tf.fullPath, 'utf8');
    let originalContent = content;

    for (const item of convertedItems) {
      const origFileName = path.basename(item.relPath);
      const avifFileName = path.basename(item.relAvifPath);

      // Do NOT replace if reference is specifically in Open Graph fallback or PWA manifest or Apple touch icon
      if (tf.relPath === 'index.html' && (origFileName.includes('og-image') || origFileName.startsWith('apple-touch-icon') || origFileName.startsWith('pwa-icon') || origFileName.startsWith('splash-'))) {
        continue;
      }

      if (content.includes(origFileName)) {
        // Replace exact filename with .avif filename
        const regex = new RegExp(origFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, avifFileName);
        totalReplacements++;
        modifiedFiles.add(tf.relPath);
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(tf.fullPath, content);
      console.log(`✅ Updated references in: ${tf.relPath}`);
    }
  }

  console.log('\n===============================================================');
  console.log('              CODE REFERENCE MIGRATION SUMMARY                 ');
  console.log('===============================================================');
  console.log(`Files Modified: ${modifiedFiles.size}`);
  console.log(`Total References Updated: ${totalReplacements}`);
  console.log('===============================================================\n');
}

runMigration();
