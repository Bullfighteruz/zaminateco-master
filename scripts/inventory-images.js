import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const RASTER_EXTS = ['.png', '.jpg', '.jpeg'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.gemini', 'brain'];

function scanFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (IGNORE_DIRS.some(ignored => relPath === ignored || relPath.startsWith(ignored + '/'))) {
      continue;
    }

    if (entry.isDirectory()) {
      scanFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (RASTER_EXTS.includes(ext)) {
        fileList.push({ fullPath, relPath, fileName: entry.name, ext });
      }
    }
  }
  return fileList;
}

function getTextFiles(dir, textFileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (IGNORE_DIRS.some(ignored => relPath === ignored || relPath.startsWith(ignored + '/'))) {
      continue;
    }

    if (entry.isDirectory()) {
      getTextFiles(fullPath, textFileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss', '.md', '.txt', '.xml', '.webmanifest', '.htaccess', '_redirects'].includes(ext)) {
        textFileList.push({ fullPath, relPath });
      }
    }
  }
  return textFileList;
}

async function runInventory() {
  console.log('🔍 Scanning repository for raster image assets...');
  const imageFiles = scanFiles(ROOT_DIR);
  const textFiles = getTextFiles(ROOT_DIR);

  const textContents = textFiles.map(tf => ({
    relPath: tf.relPath,
    content: fs.readFileSync(tf.fullPath, 'utf8')
  }));

  const inventory = [];

  for (const img of imageFiles) {
    const stat = fs.statSync(img.fullPath);
    let meta = { width: null, height: null, hasAlpha: false };
    try {
      const sMeta = await sharp(img.fullPath).metadata();
      meta.width = sMeta.width;
      meta.height = sMeta.height;
      meta.hasAlpha = sMeta.hasAlpha || false;
    } catch (e) {
      console.warn(`⚠️ Warning: sharp metadata failed for ${img.relPath}: ${e.message}`);
    }

    const referencingFiles = [];
    for (const tf of textContents) {
      if (tf.content.includes(img.fileName) || tf.content.includes(img.relPath) || tf.content.includes('/' + img.fileName)) {
        referencingFiles.push(tf.relPath);
      }
    }

    let category = 'A. CONTENT_IMAGE';
    const p = img.relPath.toLowerCase();
    const fn = img.fileName.toLowerCase();

    if (fn.startsWith('apple-touch-icon')) {
      category = 'H. APPLE_TOUCH_ICON';
    } else if (fn.startsWith('pwa-icon') || fn.includes('maskable') || fn.startsWith('splash-')) {
      category = 'F. PWA_ICON';
    } else if (fn.startsWith('favicon')) {
      category = 'G. FAVICON';
    } else if (fn.includes('og-image') || fn.includes('social') || fn.includes('twitter-card')) {
      category = 'E. OPEN_GRAPH_SOCIAL';
    } else if (p.includes('qr') || fn.includes('qr')) {
      category = 'L. THIRD_PARTY_REQUIRED';
    } else if (p.includes('logo') || fn.includes('logo') || fn.includes('zaminat-brand')) {
      category = 'D. LOGO_BRAND';
    } else if (p.includes('/images/ai-screens/') || p.includes('/images/app-screens/') || fn.includes('anti-fraud') || fn.includes('eco-coach') || fn.includes('eco-scan') || fn.includes('ecokids-tutor') || fn.includes('impact-engine') || fn.includes('production-planner')) {
      category = 'B. UI_IMAGE';
    } else if (p.includes('svg/') && (fn.includes('rikhsiboev') || fn.includes('elchibekov') || fn.includes('alibekov') || fn.includes('normatov'))) {
      category = 'M. USER_GENERATED_OR_RUNTIME';
    } else if (p.includes('-page/') || p.includes('tiles') || p.includes('bench') || p.includes('brick') || p.includes('planter') || p.includes('busstop') || p.includes('furniture') || p.includes('cards') || p.includes('rack') || p.includes('bin')) {
      category = 'C. PRODUCT_IMAGE';
    } else if (p.startsWith('public/images/')) {
      category = 'A. CONTENT_IMAGE';
    }

    inventory.push({
      relPath: img.relPath,
      fileName: img.fileName,
      ext: img.ext,
      sizeBytes: stat.size,
      width: meta.width,
      height: meta.height,
      hasAlpha: meta.hasAlpha,
      referenceCount: referencingFiles.length,
      referencingFiles,
      category
    });
  }

  fs.writeFileSync(path.join(ROOT_DIR, 'scripts', 'image-inventory.json'), JSON.stringify(inventory, null, 2));

  console.log('===============================================================');
  console.log('               COMPREHENSIVE IMAGE INVENTORY REPORT            ');
  console.log('===============================================================');
  console.log(`Total Raster Assets: ${inventory.length}`);
  
  const byExt = {};
  const byCategory = {};
  let totalBytes = 0;

  inventory.forEach(item => {
    totalBytes += item.sizeBytes;
    byExt[item.ext] = (byExt[item.ext] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });

  console.log(`Total Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB (${totalBytes} bytes)\n`);

  console.log('BY EXTENSION:');
  Object.entries(byExt).forEach(([ext, count]) => {
    console.log(`  ${ext}: ${count} files`);
  });

  console.log('\nBY CATEGORY:');
  Object.entries(byCategory).sort().forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} files`);
  });

  console.log('===============================================================\n');
}

runInventory().catch(console.error);
