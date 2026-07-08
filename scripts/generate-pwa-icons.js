import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SOURCE_LOGO = path.resolve('public/logo.webp');
const PUBLIC_DIR = path.resolve('public');

console.log('Source Logo path:', SOURCE_LOGO);

if (!fs.existsSync(SOURCE_LOGO)) {
  console.error('Error: Source logo not found!');
  process.exit(1);
}

// All required PWA and Apple Touch Icon sizes
const icons = [
  { name: 'pwa-icon-192.png', size: 192 },
  { name: 'pwa-icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 }
];

async function generateIcons() {
  console.log('Generating transparent PWA and Apple touch icons...');
  for (const icon of icons) {
    const outputPath = path.join(PUBLIC_DIR, icon.name);
    await sharp(SOURCE_LOGO)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated: ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate the maskable icon (512x512 with safe-zone padding and emerald background)
  const maskablePath = path.join(PUBLIC_DIR, 'pwa-icon-512-maskable.png');
  const innerSize = Math.floor(512 * 0.7); // 70% size for safe-zone padding
  
  // Resize logo for placement inside the maskable canvas
  const innerLogoBuffer = await sharp(SOURCE_LOGO)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 5, g: 150, b: 105, alpha: 1 } // emerald-600 solid background
    }
  })
    .composite([{ input: innerLogoBuffer, blend: 'over' }])
    .png()
    .toFile(maskablePath);
  console.log('✓ Generated: pwa-icon-512-maskable.png');

  // Generate iOS splash screens
  const splashScreens = [
    { name: 'splash-1290x2796.png', w: 1290, h: 2796 },
    { name: 'splash-1179x2556.png', w: 1179, h: 2556 },
    { name: 'splash-1170x2532.png', w: 1170, h: 2532 },
    { name: 'splash-1125x2436.png', w: 1125, h: 2436 },
    { name: 'splash-1242x2688.png', w: 1242, h: 2688 },
    { name: 'splash-828x1792.png',  w: 828,  h: 1792 },
    { name: 'splash-750x1334.png',  w: 750,  h: 1334 },
    { name: 'splash-640x1136.png',  w: 640,  h: 1136 },
    { name: 'splash-2048x2732.png', w: 2048, h: 2732 },
    { name: 'splash-1668x2388.png', w: 1668, h: 2388 },
    { name: 'splash-1640x2360.png', w: 1640, h: 2360 },
    { name: 'splash-1536x2048.png', w: 1536, h: 2048 }
  ];

  console.log('\nGenerating iOS splash screens (white background, clean centered logo)...');
  for (const splash of splashScreens) {
    const splashPath = path.join(PUBLIC_DIR, splash.name);
    // Center logo at 25% of the screen width
    const logoSize = Math.floor(splash.w * 0.25);
    
    const resizedLogoBuffer = await sharp(SOURCE_LOGO)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: splash.w,
        height: splash.h,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // solid white background
      }
    })
      .composite([{ 
        input: resizedLogoBuffer, 
        gravity: 'centre',
        blend: 'over' 
      }])
      .png()
      .toFile(splashPath);
    console.log(`✓ Generated: ${splash.name} (${splash.w}x${splash.h})`);
  }

  console.log('\nAll PWA icons and splash screens generated successfully using sharp!');
}

generateIcons().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
