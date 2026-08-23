/**
 * IndexNow URL Submission Script
 * Submits updated canonical URLs to IndexNow search engines (Bing, Yandex, Naver, Seznam)
 * Run: node scripts/submit-indexnow.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'zaminat.uz';
const KEY = 'b4e6d2b45f1b4d0891d4e0e5a98d3c12';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Target changed canonical URLs for founder entity & main pages
const URL_LIST = [
  `https://${HOST}/en/founder/sukhrobjon-rikhsiboev`,
  `https://${HOST}/ru/founder/sukhrobjon-rikhsiboev`,
  `https://${HOST}/uz/founder/sukhrobjon-rikhsiboev`,
  `https://${HOST}/team`,
  `https://${HOST}/`
];

async function submitIndexNow() {
  console.log('🚀 Preparing IndexNow submission for ZAMINAT.eco...');
  console.log(`🔑 Host: ${HOST}`);
  console.log(`📄 Key Location: ${KEY_LOCATION}`);
  console.log(`🔗 Submitting ${URL_LIST.length} canonical URLs:`);
  URL_LIST.forEach(u => console.log(`   - ${u}`));

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Submitting to ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      console.log(`   Response status: ${response.status} ${response.statusText}`);
      if (response.status === 200 || response.status === 202) {
        console.log(`   ✅ Successfully submitted to ${endpoint}`);
      } else {
        const text = await response.text();
        console.log(`   ℹ️ Response: ${text}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Could not connect to ${endpoint}: ${err.message}`);
    }
  }

  console.log('\n✨ IndexNow submission process completed.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  submitIndexNow();
}
