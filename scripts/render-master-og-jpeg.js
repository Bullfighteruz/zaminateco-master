import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function renderMasterOgJpeg() {
  console.log('🎨 Rendering master 1200x630 Open Graph banner from og-card.html...');

  const htmlPath = path.join(ROOT_DIR, 'public', 'og-card.html').replace(/\\/g, '/');
  const tempPng = path.join(ROOT_DIR, 'public', 'temp-og-render.png');

  // Command for headless Chrome screenshot directly from file URL
  const chromeCmd = `"${CHROME_PATH}" --headless=new --disable-gpu --no-sandbox --window-size=1200,630 --screenshot="${tempPng}" "file:///${htmlPath}"`;

  console.log('Executing Chrome headless screenshot command...');
  try {
    execSync(chromeCmd, { timeout: 20000 });
    console.log('📸 Captured 1200x630 headless Chrome screenshot!');
  } catch (err) {
    console.error('❌ Chrome screenshot error:', err.message);
  }

  if (!fs.existsSync(tempPng)) {
    console.error('❌ Failed to capture screenshot.');
    process.exit(1);
  }

  // Convert captured screenshot to high-quality sRGB JPEG at 1200x630
  const finalJpeg = path.join(ROOT_DIR, 'public', 'og-image.jpeg');
  
  await sharp(tempPng)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4', progressive: true })
    .toFile(finalJpeg);

  // Remove temp PNG
  fs.unlinkSync(tempPng);

  const meta = await sharp(finalJpeg).metadata();
  const stat = fs.statSync(finalJpeg);

  console.log('✅ Final Approved Master og-image.jpeg generated:');
  console.log(`   - Format: ${meta.format.toUpperCase()}`);
  console.log(`   - Dimensions: ${meta.width}x${meta.height}`);
  console.log(`   - File Size: ${(stat.size / 1024).toFixed(1)} KB`);
  console.log(`   - Aspect Ratio: ${(meta.width / meta.height).toFixed(2)} (Target 1.91:1)`);
}

renderMasterOgJpeg().catch(console.error);
