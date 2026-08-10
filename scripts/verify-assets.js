import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const SEARCH_EXTS = ['.avif', '.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.gemini', 'brain', 'scripts'];

function scanTextFiles(dir, textFileList = []) {
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
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss', '.webmanifest'].includes(ext)) {
        textFileList.push({ fullPath, relPath });
      }
    }
  }
  return textFileList;
}

async function runVerification() {
  console.log('🔍 Running strict broken reference verification...\n');

  const textFiles = scanTextFiles(ROOT_DIR);
  const brokenReferences = [];
  let auditedCount = 0;

  for (const tf of textFiles) {
    const lines = fs.readFileSync(tf.fullPath, 'utf8').split('\n');

    lines.forEach((lineText, idx) => {
      // Ignore comment lines
      const trimmed = lineText.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      const matches = lineText.match(/['"](\/[^'"]+\.(avif|webp|png|jpg|jpeg|svg|ico))['"]/gi);
      if (!matches) return;

      matches.forEach(m => {
        let cleanRef = m.replace(/['"]/g, '');
        auditedCount++;

        // Skip http/https or dynamic placeholders
        if (cleanRef.startsWith('http://') || cleanRef.startsWith('https://') || cleanRef.includes('${')) return;

        // Decode URL encoding (e.g. %20 -> space)
        try { cleanRef = decodeURIComponent(cleanRef); } catch(e){}

        // Resolve absolute public path
        const publicPath = path.join(ROOT_DIR, 'public', cleanRef);
        const rootPath = path.join(ROOT_DIR, cleanRef.substring(1));

        if (!fs.existsSync(publicPath) && !fs.existsSync(rootPath)) {
          brokenReferences.push({
            file: tf.relPath,
            line: idx + 1,
            ref: cleanRef
          });
          console.warn(`⚠️ Broken reference: [${tf.relPath}:${idx + 1}] → ${cleanRef}`);
        }
      });
    });
  }

  console.log('===============================================================');
  console.log('            BROKEN ASSET REFERENCE AUDIT SUMMARY               ');
  console.log('===============================================================');
  console.log(`Total App Image References Audited: ${auditedCount}`);
  console.log(`Broken Local Image References: ${brokenReferences.length}`);
  console.log('===============================================================\n');

  return brokenReferences.length;
}

runVerification().catch(console.error);
