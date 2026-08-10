import https from 'https';
import crypto from 'crypto';
import fs from 'fs';

async function checkLiveExposure() {
  let localKey = '';
  if (fs.existsSync('.env')) {
    const envText = fs.readFileSync('.env', 'utf8');
    const match = envText.match(/VITE_GEMINI_API_KEY=([^\s\r\n]+)/);
    if (match) localKey = match[1].trim();
  }

  const localHash = localKey ? crypto.createHash('sha256').update(localKey).digest('hex') : null;
  console.log('Local key present:', !!localKey, 'Hash computed in memory.');

  // Fetch production index.html
  https.get('https://zaminat.uz/', (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', async () => {
      const scriptMatches = [...html.matchAll(/src="(\/assets\/js\/[^"]+)"/g)].map(m => m[1]);
      console.log('Found production script bundles:', scriptMatches.length);

      let foundExposure = false;

      for (const scriptPath of scriptMatches) {
        const scriptUrl = 'https://zaminat.uz' + scriptPath;
        await new Promise(resolve => {
          https.get(scriptUrl, (sRes) => {
            let code = '';
            sRes.on('data', c => code += c);
            sRes.on('end', () => {
              if (code.includes('VITE_GEMINI_API_KEY')) {
                console.log('MATCH: VITE_GEMINI_API_KEY text found in', scriptPath);
                foundExposure = true;
              }

              // Scan candidate strings
              const keyCandidates = code.match(/AQ\.[A-Za-z0-9_-]{30,}|AIzaSy[A-Za-z0-9_-]{33}/g) || [];
              for (const cand of keyCandidates) {
                const candHash = crypto.createHash('sha256').update(cand).digest('hex');
                if (localHash && candHash === localHash) {
                  console.log('MATCH: Exact local Gemini secret key SHA256 match found in', scriptPath);
                  foundExposure = true;
                } else {
                  console.log('MATCH: Candidate API key pattern found in', scriptPath);
                  foundExposure = true;
                }
              }
              resolve(null);
            });
          }).on('error', resolve);
        });
      }

      console.log('==================================================');
      console.log('PRODUCTION_GEMINI_SECRET_EXPOSURE:', foundExposure ? 'YES' : 'NO');
      if (foundExposure) {
        console.log('ROTATION_REQUIRED: YES');
      } else {
        console.log('ROTATION_REQUIRED: NO');
      }
      console.log('==================================================');
    });
  }).on('error', console.error);
}

checkLiveExposure().catch(console.error);
