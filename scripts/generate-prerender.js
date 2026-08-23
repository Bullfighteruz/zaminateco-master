/**
 * Build-Time Prerender Generator for Founder Entity Pages
 * Injects fully localized semantic HTML, metadata, and JSON-LD Knowledge Graph
 * into dist/{lang}/founder/sukhrobjon-rikhsiboev/index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

const enTranslations = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/founder-translations.json'), 'utf8'));
const ruTranslations = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/founder-translations.json'), 'utf8'));
const uzTranslations = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/founder-translations.json'), 'utf8'));

const translationsMap = {
  en: enTranslations.founder,
  ru: ruTranslations.founder,
  uz: uzTranslations.founder,
};

const BASE_URL = 'https://zaminat.uz';
const PERSON_ID = `${BASE_URL}/en/founder/sukhrobjon-rikhsiboev#person`;
const ORG_ID = `${BASE_URL}/#organization`;

function generateFounderHtml(lang) {
  const f = translationsMap[lang];
  const canonicalUrl = `${BASE_URL}/${lang}/founder/sukhrobjon-rikhsiboev`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": canonicalUrl,
        "url": canonicalUrl,
        "name": f.meta.title,
        "description": f.meta.description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          "url": BASE_URL,
          "name": "ZAMINAT.eco"
        },
        "mainEntity": {
          "@id": PERSON_ID
        },
        "inLanguage": lang,
        "dateModified": "2026-08-23"
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": "Sukhrobjon Rikhsiboev",
        "alternateName": [
          "Suxrobjon Rixsiboyev",
          "Sukhrobjon Rixsiboyev",
          "Suxrobjon Rikhsiboev",
          "Suhrobjon Rixsiboyev",
          "Сухробжон Рихсибоев",
          "Сухробжон Риксибоев"
        ],
        "description": f.meta.description,
        "image": `${BASE_URL}/images/sukhrobjon-rikhsiboev-founder-zaminat.avif`,
        "jobTitle": "Founder & Chief Executive Officer",
        "url": canonicalUrl,
        "worksFor": {
          "@type": "Organization",
          "@id": ORG_ID,
          "name": "ZAMINAT.eco",
          "url": BASE_URL
        },
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Amity University Tashkent",
          "url": "https://amity.uz"
        },
        "knowsAbout": [
          "ClimateTech",
          "Circular Economy",
          "Artificial Intelligence",
          "AI Automation",
          "Environmental Technology",
          "Sustainability",
          "Digital Strategy",
          "Search Engine Optimization (SEO)",
          "Business Analytics",
          "Operations Management",
          "Startup Development",
          "Eco Education"
        ],
        "sameAs": [
          "https://uz.linkedin.com/in/sukhrobjon-rikhsiboev-5b9878386"
        ],
        "subjectOf": [
          {
            "@type": "CreativeWork",
            "name": "Entrepreneurial Leadership and Digital Strategy",
            "url": "https://my.visme.co/view/6vzqerpg-entrepreneurial-leadership-and-digital-strategy"
          }
        ]
      }
    ]
  };

  const semanticBody = `
  <article class="min-h-screen pb-20 pt-4 bg-gradient-to-b from-slate-50 via-white to-emerald-50/20">
    <div class="container mx-auto px-4 max-w-5xl space-y-10">
      <header class="p-8 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <img src="/images/sukhrobjon-rikhsiboev-founder-zaminat.avif" alt="${escapeHtml(f.meta.title)}" width="220" height="220" class="w-44 h-44 rounded-2xl object-cover border-4 border-emerald-400" />
          <div class="space-y-2 text-center md:text-left">
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300">ZAMINAT.eco</span>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white">${escapeHtml(f.hero.name)}</h1>
            <p class="text-lg text-emerald-300 font-semibold">${escapeHtml(f.hero.title)}</p>
            <p class="text-xs text-slate-300">${escapeHtml(f.hero.tagline)}</p>
            <p class="text-xs text-slate-400 italic">${escapeHtml(f.hero.altNames)}</p>
            <div class="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <a href="https://uz.linkedin.com/in/sukhrobjon-rikhsiboev-5b9878386" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white text-xs font-bold">LinkedIn</a>
              <a href="https://my.visme.co/view/6vzqerpg-entrepreneurial-leadership-and-digital-strategy" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold">Strategy Presentation</a>
            </div>
          </div>
        </div>
      </header>

      <section class="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
        <h2 class="text-xl font-bold text-gray-900">${escapeHtml(f.quickFacts.title)}</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.role)}</dt><dd class="font-bold text-gray-900">${escapeHtml(f.quickFacts.roleValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.organization)}</dt><dd class="font-bold text-gray-900">${escapeHtml(f.quickFacts.organizationValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.location)}</dt><dd class="font-bold text-gray-900">${escapeHtml(f.quickFacts.locationValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.status)}</dt><dd class="font-bold text-emerald-800">${escapeHtml(f.quickFacts.statusValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.education)}</dt><dd class="font-semibold text-gray-900">${escapeHtml(f.quickFacts.educationValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.experience)}</dt><dd class="font-semibold text-gray-900">${escapeHtml(f.quickFacts.experienceValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.workingMVPs)}</dt><dd class="font-semibold text-emerald-700">${escapeHtml(f.quickFacts.workingMVPsValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.architectures)}</dt><dd class="font-semibold text-indigo-700">${escapeHtml(f.quickFacts.architecturesValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.legal)}</dt><dd class="font-semibold text-gray-900">${escapeHtml(f.quickFacts.legalValue)}</dd></div>
          <div><dt class="text-gray-500">${escapeHtml(f.quickFacts.accelerator)}</dt><dd class="font-semibold text-gray-900">${escapeHtml(f.quickFacts.acceleratorValue)}</dd></div>
        </dl>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold text-gray-900">${escapeHtml(f.about.title)}</h2>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(f.about.p1)}</p>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(f.about.p2)}</p>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(f.about.p3)}</p>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold text-gray-900">${escapeHtml(f.building.title)}</h2>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(f.building.p1)}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <h3 class="font-bold text-emerald-950 text-sm">${escapeHtml(f.building.digitalMvpTitle)}</h3>
            <p class="text-xs text-emerald-900 mt-1">${escapeHtml(f.building.ecoscan)}</p>
            <p class="text-xs text-emerald-900 mt-1">${escapeHtml(f.building.zami)}</p>
          </div>
          <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <h3 class="font-bold text-indigo-950 text-sm">${escapeHtml(f.building.architecturesTitle)}</h3>
            <p class="text-xs text-indigo-900 mt-1">${escapeHtml(f.building.architecturesDesc)}</p>
          </div>
        </div>
        <p class="text-xs p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">${escapeHtml(f.building.physicalRoadmapNote)}</p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-900">${escapeHtml(f.milestones.title)}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${f.milestones.items.map(m => `
            <div class="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-1">
              <h3 class="text-sm font-bold text-gray-900">${escapeHtml(m.title)}</h3>
              <p class="text-xs text-gray-600">${escapeHtml(m.desc)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <h2 class="text-lg font-bold text-gray-900">${escapeHtml(f.background.title)}</h2>
          <p class="text-xs text-gray-700 leading-relaxed">${escapeHtml(f.background.p1)}</p>
          <p class="text-xs text-gray-700 leading-relaxed">${escapeHtml(f.background.p2)}</p>
          <p class="text-xs text-gray-700 leading-relaxed">${escapeHtml(f.background.p3)}</p>
        </div>
        <div class="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <h2 class="text-lg font-bold text-gray-900">${escapeHtml(f.education.title)}</h2>
          <div class="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <h3 class="font-bold text-indigo-950 text-sm">${escapeHtml(f.education.degree)}</h3>
            <p class="text-xs text-indigo-800">${escapeHtml(f.education.institution)} • ${escapeHtml(f.education.year)}</p>
          </div>
          <p class="text-xs text-gray-700 leading-relaxed">${escapeHtml(f.education.desc)}</p>
        </div>
      </section>

      <section class="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-3 shadow-lg">
        <h2 class="text-xl font-bold">${escapeHtml(f.mission.title)}</h2>
        <p class="text-sm text-slate-200 leading-relaxed">${escapeHtml(f.mission.p1)}</p>
        <p class="text-sm text-slate-200 leading-relaxed">${escapeHtml(f.mission.p2)}</p>
        <blockquote class="p-3 rounded-xl bg-white/10 border-l-4 border-emerald-400 italic text-xs text-emerald-100">"${escapeHtml(f.mission.quote)}"</blockquote>
      </section>

      <section class="space-y-2">
        <h2 class="text-xl font-bold text-gray-900">${escapeHtml(f.expertise.title)}</h2>
        <div class="flex flex-wrap gap-2">
          ${f.expertise.skills.map(s => `<span class="px-3 py-1 bg-white border border-gray-300 text-xs rounded-lg font-medium">${escapeHtml(s)}</span>`).join('')}
        </div>
      </section>

      <footer class="pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
        <p>${escapeHtml(f.lastUpdated)}</p>
        <p>© 2026 ZAMINAT.eco • Zaminat LLC. Republic of Uzbekistan.</p>
      </footer>
    </div>
  </article>
  `;

  return {
    title: f.meta.title,
    description: f.meta.description,
    canonicalUrl,
    jsonLd,
    semanticBody
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function prerenderFounderPages() {
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('⚠️ dist/index.html not found yet. Skipping prerender generation.');
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  ['en', 'ru', 'uz'].forEach(lang => {
    const { title, description, canonicalUrl, jsonLd, semanticBody } = generateFounderHtml(lang);

    let html = baseHtml;

    // Update <html lang="...">
    html = html.replace(/<html[^>]*>/i, `<html lang="${lang}">`);

    // Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

    // Replace Meta Description
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);

    // Replace or add Canonical Link
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
    }

    // Replace OpenGraph & Twitter tags
    html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

    html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
    html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);

    // Inject JSON-LD Schema
    const scriptJsonLd = `  <script id="founder-jsonld-schema" type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n`;
    html = html.replace('</head>', `${scriptJsonLd}</head>`);

    // Inject Pre-rendered Body into #root for immediate server-visible crawlability
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticBody}</div>`);

    // Output Directory
    const targetDir = path.join(distDir, lang, 'founder', 'sukhrobjon-rikhsiboev');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf8');
    console.log(`✅ Prerendered static HTML created: ${targetFile}`);
  });
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prerenderFounderPages();
}
