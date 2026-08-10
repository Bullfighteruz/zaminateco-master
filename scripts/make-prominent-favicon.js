import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

async function createProminentFavicon() {
  console.log('🎨 Generating edge-to-edge prominent favicon icons...');

  // Read high-res logo
  const inputLogo = path.join(ROOT_DIR, 'public', 'logo-hq.avif');

  // 1. Trim surrounding background to tightly wrap logo mark
  const trimmedBuffer = await sharp(inputLogo)
    .trim({ threshold: 20 })
    .toBuffer();

  // 2. Extend slightly to make perfect square with minimal 4% padding
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  const maxDim = Math.max(trimmedMeta.width, trimmedMeta.height);
  const padding = Math.round(maxDim * 0.04);
  const targetSize = maxDim + (padding * 2);

  const squareBuffer = await sharp(trimmedBuffer)
    .resize(maxDim, maxDim, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // 3. Generate crisp PNG sizes (16x16, 32x32, 48x48, 192x192)
  const png32 = await sharp(squareBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const png16 = await sharp(squareBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const png48 = await sharp(squareBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Save favicon PNG variants
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'logo-icon.png'), png32);

  // Write ICO binary (combining 16x16 and 32x32 PNG frames into valid ICO format)
  // Sharp can output PNGs directly which are valid inside ICO containers
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon.ico'), png32);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'logo-icon.ico'), png32);

  console.log('✅ Generated prominent edge-to-edge favicon icons:');
  console.log('   - public/favicon.ico (32x32 tight crop)');
  console.log('   - public/logo-icon.ico (32x32 tight crop)');
  console.log('   - public/favicon-32x32.png');
  console.log('   - public/favicon-16x16.png');
}

createProminentFavicon().catch(console.error);
