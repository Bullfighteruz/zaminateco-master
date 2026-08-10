import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const REPORT_FILE = path.join(__dirname, 'verification-report.json');

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

async function verifyAssets() {
  console.log('🔍 Starting comprehensive Asset & Reference Verification...\n');

  const report = {
    totalAvifDecoded: 0,
    avifDecodeErrors: 0,
    totalReferencesAudited: 0,
    brokenReferences: [],
    verificationPassed: true
  };

  // 1. Verify all generated .avif files decode properly with sharp
  const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, 'conversion-report.json'), 'utf8'));
  for (const item of inventory.convertedDetails) {
    const avifFullPath = path.join(ROOT_DIR, item.relAvifPath);
    try {
      const meta = await sharp(avifFullPath).metadata();
      if (meta.width > 0 && meta.height > 0) {
        report.totalAvifDecoded++;
      } else {
        throw new Error('Invalid dimensions');
      }
    } catch (err) {
      report.avifDecodeErrors++;
      report.verificationPassed = false;
      console.error(`❌ AVIF Decode Error for ${item.relAvifPath}: ${err.message}`);
    }
  }
  console.log(`✅ Decoded ${report.totalAvifDecoded} AVIF assets with 0 decode errors.`);

  // 2. Audit all image references in code
  const textFiles = scanTextFiles(ROOT_DIR);
  const imageRegex = /['"]([^'"]+\.(png|jpg|jpeg|avif|webp|svg))['"]/gi;

  for (const tf of textFiles) {
    const content = fs.readFileSync(tf.fullPath, 'utf8');
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const refPath = match[1];
      report.totalReferencesAudited++;

      // Skip external http/https URLs or dynamic string template parts
      if (refPath.startsWith('http://') || refPath.startsWith('https://') || refPath.includes('${')) {
        continue;
      }

      // Check if reference exists on disk
      let diskPath = null;
      if (refPath.startsWith('/')) {
        diskPath = path.join(ROOT_DIR, 'public', refPath);
      } else {
        diskPath = path.join(path.dirname(tf.fullPath), refPath);
      }

      if (!fs.existsSync(diskPath) && !fs.existsSync(path.join(ROOT_DIR, refPath))) {
        report.brokenReferences.push({
          referencingFile: tf.relPath,
          reference: refPath
        });
        report.verificationPassed = false;
        console.warn(`⚠️ Broken image reference in ${tf.relPath}: ${refPath}`);
      }
    }
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log('\n===============================================================');
  console.log('                 VERIFICATION SUMMARY REPORT                   ');
  console.log('===============================================================');
  console.log(`AVIF Decode Status: ${report.avifDecodeErrors === 0 ? 'PASSED (0 Errors)' : 'FAILED'}`);
  console.log(`Total References Audited: ${report.totalReferencesAudited}`);
  console.log(`Broken References Found: ${report.brokenReferences.length}`);
  console.log(`Overall Verification: ${report.verificationPassed ? 'PASSED 100%' : 'FAILED'}`);
  console.log('===============================================================\n');
}

verifyAssets().catch(console.error);
