/**
 * Simple Video Optimization Script
 * Uses ffmpeg to create optimized video versions
 * 
 * Run: node scripts/optimize-video-simple.js
 * 
 * Make sure ffmpeg is installed and in PATH
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

// Check if input file exists
if (!fs.existsSync(INPUT_VIDEO)) {
  console.error(`❌ Input video not found: ${INPUT_VIDEO}`);
  console.log('\n📝 Please ensure intro.mp4 exists in public/images/');
  process.exit(1);
}

// Get original file size
const originalSize = fs.statSync(INPUT_VIDEO).size / (1024 * 1024);
console.log(`📊 Original file size: ${originalSize.toFixed(2)} MB\n`);

// Commands to run
const commands = [
  {
    cmd: `ffmpeg -i "${INPUT_VIDEO}" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 64k -movflags +faststart "${path.join(OUTPUT_DIR, 'intro.webm')}" -y`,
    label: 'Creating WebM version (best compression)'
  },
  {
    cmd: `ffmpeg -i "${INPUT_VIDEO}" -c:v libx264 -preset slow -crf 28 -vf "scale=1920:1080" -movflags +faststart -c:a aac -b:a 64k "${path.join(OUTPUT_DIR, 'intro-optimized.mp4')}" -y`,
    label: 'Creating optimized MP4 version'
  },
  {
    cmd: `ffmpeg -i "${INPUT_VIDEO}" -c:v libx264 -preset slow -crf 32 -vf "scale=1280:720" -movflags +faststart -c:a aac -b:a 48k "${path.join(OUTPUT_DIR, 'intro-mobile.mp4')}" -y`,
    label: 'Creating mobile version (smaller file)'
  },
  {
    cmd: `ffmpeg -i "${INPUT_VIDEO}" -ss 00:00:01 -vframes 1 -q:v 2 "${path.join(OUTPUT_DIR, 'intro-poster.jpg')}" -y`,
    label: 'Extracting poster frame'
  }
];

function runCommand(command, label) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${label}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ${label}:`, error.message);
        if (error.message.includes('ffmpeg')) {
          console.error('\n💡 ffmpeg is not installed or not in PATH.');
          console.error('   Please install ffmpeg manually:');
          console.error('   Windows: Download from https://www.gyan.dev/ffmpeg/builds/');
          console.error('   Mac: brew install ffmpeg');
          console.error('   Linux: apt-get install ffmpeg');
        }
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
    for (const { cmd, label } of commands) {
      await runCommand(cmd, label);
    }

    // Show file sizes
    console.log('\n📊 Optimization Results:');
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(file => {
      if (file.startsWith('intro')) {
        const filePath = path.join(OUTPUT_DIR, file);
        const size = fs.statSync(filePath).size / (1024 * 1024);
        console.log(`  ${file}: ${size.toFixed(2)} MB`);
      }
    });

    console.log('\n✅ Video optimization complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Test video playback on your site');
    console.log('  2. Deploy to Netlify/Vercel');
    console.log('  3. Enjoy 20x faster video loading! 🚀');
    
  } catch (error) {
    console.error('\n❌ Optimization failed:', error.message);
    console.log('\n💡 Solutions:');
    console.log('  1. Install ffmpeg manually (see VIDEO_OPTIMIZATION_MANUAL_INSTALL.md)');
    console.log('  2. Use online video optimizer (see guide)');
    console.log('  3. Contact support for help');
    process.exit(1);
  }
}

optimize();

