/**
 * Automated 1200x630 Open Graph Preview Card Generator
 * Uses headless Chrome to render modern, luxury ClimateTech UI cards
 * and saves crisp, optimized JPEGs and PNGs to public/ and public/images/
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Ensure founder portrait exists in JPG, PNG, and true WebP
async function ensureFounderAssets() {
  console.log('🔄 Ensuring founder portrait formats (JPEG, PNG, WebP, AVIF)...');
  const avifPath = path.join(IMAGES_DIR, 'sukhrobjon-rikhsiboev-founder-zaminat.avif');
  const jpegPath = path.join(IMAGES_DIR, 'sukhrobjon-rikhsiboev-founder-zaminat.jpeg');
  const pngPath = path.join(IMAGES_DIR, 'sukhrobjon-rikhsiboev-founder-zaminat.png');
  const webpPath = path.join(IMAGES_DIR, 'sukhrobjon-rikhsiboev-founder-zaminat.webp');

  if (fs.existsSync(avifPath)) {
    // Generate true JPEG (1000x1000)
    await sharp(avifPath)
      .resize(1000, 1000, { fit: 'cover' })
      .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
      .toFile(jpegPath);

    // Generate true PNG (1000x1000)
    await sharp(avifPath)
      .resize(1000, 1000, { fit: 'cover' })
      .png({ compressionLevel: 8 })
      .toFile(pngPath);

    // Overwrite with true WebP (previously was heif/avif disguised)
    await sharp(avifPath)
      .resize(1000, 1000, { fit: 'cover' })
      .webp({ quality: 95 })
      .toFile(webpPath);

    console.log('✅ Founder portraits ready: JPEG, PNG, true WebP, AVIF');
  }
}

// Convert an image file to base64 data URI for reliable offline Chrome rendering
function fileToDataUri(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml'
  };
  const mime = mimeMap[ext] || 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

const CARDS = [
  {
    id: 'master',
    outputJpeg: path.join(PUBLIC_DIR, 'og-image.jpeg'),
    outputPng: path.join(PUBLIC_DIR, 'og-image.png'),
    badge: 'AI CLIMATETECH ECOSYSTEM',
    badgeColor: '#10b981',
    title: 'ZAMINAT.eco — Smart Ecology. Visible Impact.',
    subtitle: 'Digital ClimateTech & Circular Economy Infrastructure in Uzbekistan',
    description: 'Empowering urban communities and industrial partners with AI EcoScan polymer classification, secondary-material collection hubs, and certified recycled eco-products.',
    pills: ['AI EcoScan', 'EcoMap Hubs', 'Recycled EPDM Tiles', 'Circular Economy', 'Tashkent, UZ'],
    iconType: 'leaf'
  },
  {
    id: 'founder',
    outputJpeg: path.join(IMAGES_DIR, 'og-founder.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-founder.png'),
    isFounderCard: true,
    badge: 'FOUNDER & CEO PROFILE',
    badgeColor: '#10b981',
    title: 'Sukhrobjon Rikhsiboev',
    role: 'Founder & Chief Executive Officer | ZAMINAT.eco',
    subtitle: 'ClimateTech & Circular Economy Innovator | Tashkent, Uzbekistan',
    description: 'Leading ZAMINAT.eco to build Uzbekistan\'s first AI-driven circular economy platform, integrating deep-tech waste classification and sustainable secondary material supply chains.',
    pills: ['Amity Univ. Tashkent Alum', 'U-Enter Accelerator', 'Pre-Seed Stage', 'ClimateTech Innovator', 'Tashkent, UZ'],
    iconType: 'user'
  },
  {
    id: 'pitch',
    outputJpeg: path.join(IMAGES_DIR, 'og-pitch.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-pitch.png'),
    badge: 'INVESTOR PITCH DECK 2026',
    badgeColor: '#3b82f6',
    title: 'ZAMINAT.eco — Executive Pitch Deck',
    subtitle: 'Scaling AI-Powered Circular Economy & Polymer Upcycling in Central Asia',
    description: 'Transforming waste streams into high-value urban infrastructure and certified circular products with high-margin unit economics and measurable ESG impact.',
    pills: ['Pre-Seed Round', 'Closed-Loop Upcycling', 'AI Material Vision', 'Central Asia TAM', 'ESG Compliant'],
    iconType: 'chart'
  },
  {
    id: 'coach',
    outputJpeg: path.join(IMAGES_DIR, 'og-coach.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-coach.png'),
    badge: 'ZAMI BOT INTELLIGENCE 2.0',
    badgeColor: '#06b6d4',
    title: 'Zami AI EcoCoach — Environmental Intelligence',
    subtitle: 'Conversational ClimateTech AI & Sustainability Companion',
    description: 'Ask anything about recycling rules in Uzbekistan, live air quality benchmarks, ecological practices, and circular economy methodologies in English, Uzbek, or Russian.',
    pills: ['Gemini Grounding', 'Multilingual (UZ/RU/EN)', 'Circular Knowledge', 'Tashkent Air Quality'],
    iconType: 'bot'
  },
  {
    id: 'scanner',
    outputJpeg: path.join(IMAGES_DIR, 'og-scanner.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-scanner.png'),
    badge: 'AI COMPUTER VISION',
    badgeColor: '#8b5cf6',
    title: 'AI EcoScan — Instant Polymer & Waste Classifier',
    subtitle: 'Neural Network Classification of Secondary Materials & Plastics',
    description: 'Identify plastic resins, recyclability tiers, and nearest collection points in seconds using on-device and cloud neural vision.',
    pills: ['Polymer Detection', 'Recyclability Score', 'Instant Routing', 'EcoPoints Reward'],
    iconType: 'scan'
  },
  {
    id: 'shop',
    outputJpeg: path.join(IMAGES_DIR, 'og-shop.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-shop.png'),
    badge: 'CIRCULAR PRODUCTS CATALOG',
    badgeColor: '#10b981',
    title: 'Recycled Eco-Products & Circular Materials',
    subtitle: 'Certified Rubber Tiles, Urban Furniture & Construction Materials',
    description: 'Manufactured in Uzbekistan from 100% recycled polymers and crumb rubber: durable EPDM tiles, eco-benches, planters, and architectural solutions.',
    pills: ['100% Recycled', 'Certified Safety', 'Urban Furniture', 'Commercial Wholesale', 'Tashkent Delivery'],
    iconType: 'shop'
  },
  {
    id: 'actions',
    outputJpeg: path.join(IMAGES_DIR, 'og-actions.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-actions.png'),
    badge: 'COLLECTION NETWORK & ECOACTIONS',
    badgeColor: '#10b981',
    title: 'EcoActions & Secondary Material Hubs',
    subtitle: 'Interactive Collection Network & Community Cleanups in Tashkent',
    description: 'Find verified collection points for plastics and tires, track community cleanups, earn EcoPoints, and participate in direct circular action.',
    pills: ['Tashkent Network', 'Verified Drop-Offs', 'Community Cleanups', 'Tracked Impact'],
    iconType: 'map'
  },
  {
    id: 'vote',
    outputJpeg: path.join(IMAGES_DIR, 'og-vote.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-vote.png'),
    badge: 'COMMUNITY GOVERNANCE',
    badgeColor: '#f59e0b',
    title: 'EcoVote — Community Environmental Voting',
    subtitle: 'Decide Where Recycled Playgrounds & Eco-Parks Get Built',
    description: 'Participate in civic ecological democracy: vote for mahallas and schools to receive playgrounds and urban furniture funded by recycling initiatives.',
    pills: ['Grassroots Democracy', 'Mahalla Projects', 'Transparent Voting', 'Direct Resource Allocation'],
    iconType: 'vote'
  },
  {
    id: 'stories',
    outputJpeg: path.join(IMAGES_DIR, 'og-stories.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-stories.png'),
    badge: 'KNOWLEDGE & CASE STUDIES',
    badgeColor: '#059669',
    title: 'EcoStories — Circular Economy Knowledge Hub',
    subtitle: 'Case Studies, Recycling Science & Environmental Insights',
    description: 'Explore research-backed educational guides, practical waste reduction methods, and success stories transforming Central Asia\'s sustainability landscape.',
    pills: ['Educational Science', 'Case Studies', 'Polymer Insights', 'Sustainable Living'],
    iconType: 'book'
  },
  {
    id: 'about',
    outputJpeg: path.join(IMAGES_DIR, 'og-about.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-about.png'),
    badge: 'MISSION & INFRASTRUCTURE',
    badgeColor: '#10b981',
    title: 'About ZAMINAT.eco — The Circular Future',
    subtitle: 'Building Uzbekistan\'s Sustainable ClimateTech Ecosystem',
    description: 'Discover our mission, industrial recycling infrastructure, proprietary software platforms, and roadmap toward a zero-landfill Uzbekistan.',
    pills: ['Circular Economy', 'ESG Alignment', 'Urban Infrastructure', 'Climate Resilience'],
    iconType: 'leaf'
  },
  {
    id: 'team',
    outputJpeg: path.join(IMAGES_DIR, 'og-team.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-team.png'),
    badge: 'LEADERSHIP & EXPERTISE',
    badgeColor: '#10b981',
    title: 'Leadership & Team | ZAMINAT.eco',
    subtitle: 'Engineers, Ecologists & Circular Economy Visionaries',
    description: 'Meet the executive leadership and technical team driving artificial intelligence, recycling engineering, and environmental stewardship across Uzbekistan.',
    pills: ['Executive Leadership', 'Software Engineering', 'Ecology Specialists', 'Tashkent, Uzbekistan'],
    iconType: 'team'
  },
  {
    id: 'partners',
    outputJpeg: path.join(IMAGES_DIR, 'og-partners.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-partners.png'),
    badge: 'CORPORATE ESG COLLABORATION',
    badgeColor: '#3b82f6',
    title: 'Partners & Corporate ESG Collaboration',
    subtitle: 'Sustainable Procurement, EPR Compliance & Industrial Supply',
    description: 'Partner with ZAMINAT.eco to achieve verifiable ESG credentials, offset industrial polymer footprints, and procure certified green building materials.',
    pills: ['Corporate ESG', 'EPR Verification', 'Closed-Loop Supply', 'Green Procurement'],
    iconType: 'handshake'
  },
  {
    id: 'contacts',
    outputJpeg: path.join(IMAGES_DIR, 'og-contacts.jpeg'),
    outputPng: path.join(IMAGES_DIR, 'og-contacts.png'),
    badge: 'HEADQUARTERS & INQUIRIES',
    badgeColor: '#10b981',
    title: 'Contact ZAMINAT.eco',
    subtitle: 'Headquarters in Tashkent, Uzbekistan — Connect With Us',
    description: 'Direct inquiries for commercial orders, investor relations, corporate partnerships, media engagements, and community ecological initiatives.',
    pills: ['Tashkent Office', 'Direct Telegram', 'B2B Procurement', 'Investor Relations'],
    iconType: 'contact'
  }
];

function generateHtmlCard(card, founderDataUri, logoDataUri) {
  const isFounder = card.isFounderCard;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #021a12;
      color: #ffffff;
      position: relative;
    }
    .background {
      position: absolute;
      inset: 0;
      background: radial-gradient(1000px circle at 80% 20%, rgba(16, 185, 129, 0.22), transparent 60%),
                  radial-gradient(800px circle at 15% 85%, rgba(5, 150, 105, 0.18), transparent 50%),
                  linear-gradient(135deg, #021a12 0%, #063124 50%, #031e15 100%);
    }
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .ambient-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      right: -100px;
      top: -100px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
      filter: blur(60px);
    }
    .container {
      position: relative;
      z-index: 10;
      width: 1200px;
      height: 630px;
      padding: 56px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .brand-name {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .brand-dot {
      color: #34d399;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: ${card.badgeColor || '#34d399'};
      backdrop-filter: blur(8px);
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${card.badgeColor || '#34d399'};
      box-shadow: 0 0 10px ${card.badgeColor || '#34d399'};
    }
    .content-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 48px;
      flex: 1;
      margin-top: 24px;
    }
    .text-column {
      flex: 1;
      max-width: ${isFounder ? '700px' : '980px'};
    }
    .title {
      font-size: ${isFounder ? '44px' : '42px'};
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 12px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .role-title {
      font-size: 20px;
      font-weight: 700;
      color: #34d399;
      margin-bottom: 8px;
      letter-spacing: -0.2px;
    }
    .subtitle {
      font-size: 18px;
      font-weight: 600;
      color: #a7f3d0;
      margin-bottom: 14px;
      line-height: 1.4;
    }
    .description {
      font-size: 16px;
      color: #cbd5e1;
      line-height: 1.55;
      margin-bottom: 24px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .founder-image-box {
      width: 330px;
      height: 330px;
      flex-shrink: 0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .founder-glow-ring {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(245, 158, 11, 0.3));
      filter: blur(14px);
    }
    .founder-img {
      position: relative;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #10b981;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
    }
    .verified-pill {
      position: absolute;
      bottom: 8px;
      right: 20px;
      padding: 6px 14px;
      background: #064e3b;
      border: 1.5px solid #34d399;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
    }
    .pills-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .pill-item {
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      letter-spacing: 0.2px;
    }
    .canonical-tag {
      font-size: 13px;
      font-weight: 600;
      color: #34d399;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="background"></div>
  <div class="grid-overlay"></div>
  <div class="ambient-glow"></div>

  <div class="container">
    <div class="top-bar">
      <div class="brand">
        ${logoDataUri ? `<img src="${logoDataUri}" class="brand-logo" alt="ZAMINAT logo" />` : ''}
        <div class="brand-name">ZAMINAT<span class="brand-dot">.eco</span></div>
      </div>
      <div class="badge">
        <div class="badge-dot"></div>
        <span>${card.badge}</span>
      </div>
    </div>

    <div class="content-area">
      <div class="text-column">
        ${isFounder && card.role ? `<div class="role-title">${card.role}</div>` : ''}
        <h1 class="title">${card.title}</h1>
        ${card.subtitle ? `<div class="subtitle">${card.subtitle}</div>` : ''}
        <p class="description">${card.description}</p>
      </div>

      ${isFounder && founderDataUri ? `
        <div class="founder-image-box">
          <div class="founder-glow-ring"></div>
          <img src="${founderDataUri}" class="founder-img" alt="Sukhrobjon Rikhsiboev" />
          <div class="verified-pill">✓ Founder & CEO</div>
        </div>
      ` : ''}
    </div>

    <div class="bottom-bar">
      <div class="pills-list">
        ${(card.pills || []).map(pill => `<div class="pill-item">${pill}</div>`).join('')}
      </div>
      <div class="canonical-tag">
        <span>🌐 zaminat.uz</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function renderCard(card, founderDataUri, logoDataUri) {
  console.log(`🎨 Rendering 1200x630 card: ${card.id}...`);

  const htmlContent = generateHtmlCard(card, founderDataUri, logoDataUri);
  const tempHtml = path.join(ROOT_DIR, `temp-og-${card.id}.html`);
  const tempPng = path.join(ROOT_DIR, `temp-og-${card.id}.png`);

  fs.writeFileSync(tempHtml, htmlContent, 'utf8');

  const fileUrl = 'file:///' + tempHtml.replace(/\\/g, '/');
  const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=1200,630 --screenshot="${tempPng}" "${fileUrl}"`;

  try {
    execSync(cmd, { timeout: 20000 });
  } catch (err) {
    console.error(`❌ Chrome render error for ${card.id}:`, err.message);
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
    return false;
  }

  if (!fs.existsSync(tempPng)) {
    console.error(`❌ Failed to capture screenshot for ${card.id}`);
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
    return false;
  }

  // Ensure target directories exist
  const jpegDir = path.dirname(card.outputJpeg);
  if (!fs.existsSync(jpegDir)) fs.mkdirSync(jpegDir, { recursive: true });

  // Save optimal JPEG (quality: 95, 4:4:4 chroma subsampling for crisp text)
  await sharp(tempPng)
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4', progressive: true })
    .toFile(card.outputJpeg);

  // If outputPng specified, save optimized PNG
  if (card.outputPng) {
    const pngDir = path.dirname(card.outputPng);
    if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir, { recursive: true });

    await sharp(tempPng)
      .resize(1200, 630, { fit: 'cover' })
      .png({ compressionLevel: 8 })
      .toFile(card.outputPng);
  }

  // Cleanup temps
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng);

  const stat = fs.statSync(card.outputJpeg);
  console.log(`✅ Saved ${card.id}: ${(stat.size / 1024).toFixed(1)} KB at ${path.basename(card.outputJpeg)}`);
  return true;
}

export async function generateAllOgCards() {
  console.log('============================================================');
  console.log(' ZAMINAT.eco — 1200x630 OPEN GRAPH PREVIEW CARD GENERATION');
  console.log('============================================================\n');

  await ensureFounderAssets();

  const founderDataUri = fileToDataUri(path.join(IMAGES_DIR, 'sukhrobjon-rikhsiboev-founder-zaminat.jpeg'));
  const logoDataUri = fileToDataUri(path.join(PUBLIC_DIR, 'logo.webp'));

  let count = 0;
  for (const card of CARDS) {
    const ok = await renderCard(card, founderDataUri, logoDataUri);
    if (ok) count++;
  }

  console.log(`\n🎉 Successfully generated ${count} / ${CARDS.length} Open Graph social preview cards!`);
}

// Run if called directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  generateAllOgCards().catch(console.error);
}
