/**
 * Video Optimization Script for ZAMINAT.eco
 * Optimizes hero video for web performance
 * 
 * Requirements: Install ffmpeg
 * Windows: choco install ffmpeg
 * Mac: brew install ffmpeg
 * Linux: apt-get install ffmpeg
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const INPUT_VIDEO = path.join(__dirname, '../public/images/intro.mp4');
const OUTPUT_DIR = path.join(__dirname, '../public/videos');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎬 Starting video optimization...\n');

// 1. WebM version (best compression, modern browsers)
const webmCommand = `ffmpeg -i "${INPUT_VIDEO}" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 64k -movflags +faststart "${path.join(OUTPUT_DIR, 'intro.webm')}" -y`;

// 2. Optimized MP4 (fallback for older browsers)
const mp4Command = `ffmpeg -i "${INPUT_VIDEO}" -c:v libx264 -preset slow -crf 28 -vf "scale=1920:1080" -movflags +faststart -c:a aac -b:a 64k "${path.join(OUTPUT_DIR, 'intro-optimized.mp4')}" -y`;

// 3. Mobile version (smaller, lower quality)
const mobileCommand = `ffmpeg -i "${INPUT_VIDEO}" -c:v libx264 -preset slow -crf 32 -vf "scale=1280:720" -movflags +faststart -c:a aac -b:a 48k "${path.join(OUTPUT_DIR, 'intro-mobile.mp4')}" -y`;

// 4. Extract poster frame
const posterCommand = `ffmpeg -i "${INPUT_VIDEO}" -ss 00:00:01 -vframes 1 -q:v 2 "${path.join(OUTPUT_DIR, 'intro-poster.jpg')}" -y`;

async function runCommand(command, label) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${label}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ${label}:`, error.message);
        reject(error);
        return;
      }
      console.log(`✅ ${label} completed!`);
      resolve();
    });
  });
}

async function optimize() {
  try {
    // Check if input file exists
    if (!fs.existsSync(INPUT_VIDEO)) {
      console.error(`❌ Input video not found: ${INPUT_VIDEO}`);
      console.log('\n📝 Please ensure intro.mp4 exists in public/images/');
      process.exit(1);
    }

    // Get original file size
    const originalSize = fs.statSync(INPUT_VIDEO).size / (1024 * 1024);
    console.log(`📊 Original file size: ${originalSize.toFixed(2)} MB\n`);

    // Optimize videos
    await runCommand(webmCommand, 'Creating WebM version');
    await runCommand(mp4Command, 'Creating optimized MP4 version');
    await runCommand(mobileCommand, 'Creating mobile version');
    await runCommand(posterCommand, 'Extracting poster frame');

    // Show file sizes
    console.log('\n📊 Optimization Results:');
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      const size = fs.statSync(filePath).size / (1024 * 1024);
      console.log(`  ${file}: ${size.toFixed(2)} MB`);
    });

    console.log('\n✅ Video optimization complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Update HeroVideo component to use optimized videos');
    console.log('  2. Update video paths in Shop.tsx');
    console.log('  3. Test on mobile devices');
    
  } catch (error) {
    console.error('\n❌ Optimization failed:', error.message);
    console.log('\n💡 Make sure ffmpeg is installed:');
    console.log('   Windows: choco install ffmpeg');
    console.log('   Mac: brew install ffmpeg');
    console.log('   Linux: apt-get install ffmpeg');
    process.exit(1);
  }
}

optimize();

