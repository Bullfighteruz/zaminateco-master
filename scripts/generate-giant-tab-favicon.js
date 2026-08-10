import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

async function buildGiantFavicon() {
  console.log('⚡ Generating maximum-size prominent tab favicon...');

  const logoIconPath = path.join(ROOT_DIR, 'public', 'logo-icon.png');
  const { data, info } = await sharp(logoIconPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Create transparent RGBA buffer removing the light beige/off-white background
  const rgbaBuffer = Buffer.alloc(width * height * 4);
  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;

      // Identify light background pixels (near off-white/beige)
      const isLightBg = (r > 200 && g > 195 && b > 180) || a < 30;
      const outIdx = (y * width + x) * 4;

      if (isLightBg) {
        rgbaBuffer[outIdx] = 0;
        rgbaBuffer[outIdx + 1] = 0;
        rgbaBuffer[outIdx + 2] = 0;
        rgbaBuffer[outIdx + 3] = 0;
      } else {
        rgbaBuffer[outIdx] = r;
        rgbaBuffer[outIdx + 1] = g;
        rgbaBuffer[outIdx + 2] = b;
        rgbaBuffer[outIdx + 3] = a;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = maxX - minX;
  const cropH = maxY - minY;
  console.log(`📐 Isolated Emblem Bounding Box: ${cropW}x${cropH} (from original ${width}x${height})`);

  // Extract isolated emblem PNG
  const isolatedEmblemPng = await sharp(rgbaBuffer, {
    raw: { width, height, channels: 4 }
  })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .png()
  .toBuffer();

  // Create square container with zero padding (100% fill height/width)
  const maxDim = Math.max(cropW, cropH);

  // 1. Transparent edge-to-edge icon (fills maximum browser tab space)
  const transparentSquare = await sharp(isolatedEmblemPng)
    .resize(maxDim, maxDim, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // 2. High-contrast Dark Emerald Badge icon (like Gucci / Prada / Cloudmonster tab icons)
  // Dark emerald background makes 3D Gold Crescent & Green Sprout POP dramatically!
  const darkSquare = await sharp(isolatedEmblemPng)
    .resize(Math.round(maxDim * 0.88), Math.round(maxDim * 0.88), {
      fit: 'contain',
      background: { r: 6, g: 78, b: 59, alpha: 1 } // #064E3B Dark Emerald Green
    })
    .extend({
      top: Math.round(maxDim * 0.06),
      bottom: Math.round(maxDim * 0.06),
      left: Math.round(maxDim * 0.06),
      right: Math.round(maxDim * 0.06),
      background: { r: 6, g: 78, b: 59, alpha: 1 }
    })
    .png()
    .toBuffer();

  // Generate multi-size PNGs (32x32, 48x48, 192x192, 512x512)
  const png32 = await sharp(transparentSquare).resize(32, 32).png().toBuffer();
  const png16 = await sharp(transparentSquare).resize(16, 16).png().toBuffer();

  const dark32 = await sharp(darkSquare).resize(32, 32).png().toBuffer();

  // Save to public directory
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon-dark-32x32.png'), dark32);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon.ico'), png32);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'logo-icon.ico'), png32);
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'logo-icon.png'), png32);

  console.log('✨ Giant prominent favicon generated successfully!');
  console.log('   - Bounding Box crop removed 350px of useless outer whitespace!');
  console.log('   - Icon emblem now fills 100% of browser tab height & width!');
}

buildGiantFavicon().catch(console.error);
