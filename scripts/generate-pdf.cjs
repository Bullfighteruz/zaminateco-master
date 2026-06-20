/**
 * Native PDF Generator Script for ZAMINAT.eco Pitch Deck (CommonJS extension)
 * Launches headless Microsoft Edge, connects via CDP (Chrome DevTools Protocol),
 * waits for React animations/charts to load, and prints to PDF using landscape A4.
 * No external npm dependencies required.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:4173/pitch';
const OUTPUT_FILE = 'ZAMINAT.ECO_Pitch_Deck.pdf';

console.log('🚀 Starting PDF generation flow...');

// Step 1: Start Edge in Headless Debugging Mode
const edgeProcess = spawn(EDGE_PATH, [
  '--headless',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  '--remote-allow-origins=*',
  '--no-sandbox',
  '--disable-extensions',
  TARGET_URL
]);

edgeProcess.on('error', (err) => {
  console.error('❌ Failed to start Microsoft Edge process:', err.message);
  process.exit(1);
});

// Step 2: Poll Edge's debugging endpoint to find the active WebSocket URL
async function getWebSocketUrl() {
  const url = `http://127.0.0.1:${PORT}/json/list`;
  console.log(`🔍 Querying target list from ${url}...`);

  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(url, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });

      const target = data.find(t => t.url.includes('/pitch') || t.type === 'page');
      if (target && target.webSocketDebuggerUrl) {
        console.log(`✅ Found target page! WebSocket URL: ${target.webSocketDebuggerUrl}`);
        return target.webSocketDebuggerUrl;
      }
    } catch (e) {
      // Ignore and wait
    }
    console.log(`⏳ Waiting for Edge debugging endpoint to respond (attempt ${attempt}/10)...`);
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Timeout waiting for browser debugging endpoint.');
}

async function run() {
  try {
    const wsUrl = await getWebSocketUrl();
    console.log('🔌 Connecting WebSocket client...');
    
    // Node.js v22 has built-in global WebSocket client
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Connected to Edge DevTools Protocol!');
      console.log('🕒 Waiting 5 seconds for React components, animations, and charts to fully render...');
      
      // Enable Page domain
      ws.send(JSON.stringify({
        id: 1,
        method: 'Page.enable'
      }));

      // Set timeout to wait for animations to complete before drawing PDF
      setTimeout(() => {
        console.log('🖨️  Triggering Page.printToPDF...');
        ws.send(JSON.stringify({
          id: 2,
          method: 'Page.printToPDF',
          params: {
            landscape: true,
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            scale: 1.0,
            paperWidth: 11.69, // A4 landscape width in inches
            paperHeight: 8.27  // A4 landscape height in inches
          }
        }));
      }, 5000);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.id === 2) {
        if (response.error) {
          console.error('❌ printToPdf returned an error:', response.error);
          cleanup(1);
          return;
        }

        const base64Data = response.result.data;
        console.log(`💾 Received PDF data (${Math.round(base64Data.length / 1.33 / 1024)} KB). Writing to file: ${OUTPUT_FILE}...`);
        
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(OUTPUT_FILE, buffer);
        console.log(`🎉 Success! PDF version of Pitch page generated and saved to: ${OUTPUT_FILE}`);
        cleanup(0);
      }
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      cleanup(1);
    };

    function cleanup(code) {
      console.log('🧹 Cleaning up processes...');
      try {
        ws.close();
      } catch (e) {}
      edgeProcess.kill();
      process.exit(code);
    }

  } catch (err) {
    console.error('❌ Execution error:', err.message);
    edgeProcess.kill();
    process.exit(1);
  }
}

run();
