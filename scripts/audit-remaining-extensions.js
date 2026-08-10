import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const SEARCH_EXTS = ['.png', '.jpg', '.jpeg'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.gemini', 'brain', 'scripts'];

function scanTextFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (IGNORE_DIRS.some(ignored => relPath === ignored || relPath.startsWith(ignored + '/'))) {
      continue;
    }

    if (entry.isDirectory()) {
      scanTextFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss', '.webmanifest'].includes(ext)) {
        fileList.push({ fullPath, relPath });
      }
    }
  }
  return fileList;
}

function getReason(assetName) {
  const fn = assetName.toLowerCase();
  if (fn.startsWith('apple-touch-icon')) return 'APPLE_TOUCH_ICON (iOS web app specification)';
  if (fn.startsWith('pwa-icon') || fn.startsWith('splash-')) return 'PWA_ICON / SPLASH (Web App Manifest specification)';
  if (fn.startsWith('favicon')) return 'FAVICON (Browser tab specification)';
  if (fn.includes('og-image')) return 'OPEN_GRAPH_SOCIAL (Social crawler JPEG/PNG compatibility)';
  if (fn.includes('qr')) return 'THIRD_PARTY_REQUIRED (QR code scanner accuracy)';
  if (fn.endsWith('.jpg') || fn.endsWith('.png') || fn.endsWith('.jpeg')) return 'EXPLICIT_FALLBACK / SYSTEM_SPEC';
  return 'SYSTEM_SPECIFICATION';
}

function auditRemaining() {
  const textFiles = scanTextFiles(ROOT_DIR);
  const occurrences = [];

  for (const tf of textFiles) {
    const lines = fs.readFileSync(tf.fullPath, 'utf8').split('\n');
    lines.forEach((lineText, idx) => {
      SEARCH_EXTS.forEach(ext => {
        if (lineText.toLowerCase().includes(ext)) {
          // Extract matching string snippet
          const match = lineText.match(/['"]?([^'"]+\.(png|jpg|jpeg))['"]?/i);
          const assetName = match ? match[1] : ext;
          occurrences.push({
            file: tf.relPath,
            line: idx + 1,
            referencedAsset: assetName,
            lineText: lineText.trim(),
            reason: getReason(assetName)
          });
        }
      });
    });
  }

  console.log(`📋 Total remaining legacy references found: ${occurrences.length}`);
  fs.writeFileSync(path.join(__dirname, 'remaining-references-audit.json'), JSON.stringify(occurrences, null, 2));

  occurrences.forEach((occ, idx) => {
    console.log(`${idx + 1}. [${occ.file}:${occ.line}] ${occ.referencedAsset} → Reason: ${occ.reason}`);
  });

  return occurrences;
}

auditRemaining();
