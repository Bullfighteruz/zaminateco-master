/**
 * Build-Time Prerender Generator for Multilingual Public Indexable Pages
 * Injects fully localized semantic HTML, metadata, canonicals, hreflang alternates,
 * and JSON-LD Knowledge Graph into dist/{lang}/{route}/index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

const enFounder = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/founder-translations.json'), 'utf8'));
const ruFounder = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/founder-translations.json'), 'utf8'));
const uzFounder = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/founder-translations.json'), 'utf8'));

const enCommon = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/common.json'), 'utf8'));
const ruCommon = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/common.json'), 'utf8'));
const uzCommon = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/common.json'), 'utf8'));

const enTeam = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/team-translations.json'), 'utf8'));
const ruTeam = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/team-translations.json'), 'utf8'));
const uzTeam = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/team-translations.json'), 'utf8'));

const enShop = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/shop-translations.json'), 'utf8'));
const ruShop = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/shop-translations.json'), 'utf8'));
const uzShop = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/shop-translations.json'), 'utf8'));

const enActions = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/actions-translations.json'), 'utf8'));
const ruActions = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/actions-translations.json'), 'utf8'));
const uzActions = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/actions-translations.json'), 'utf8'));

const enStories = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/stories-translations.json'), 'utf8'));
const ruStories = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/stories-translations.json'), 'utf8'));
const uzStories = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/stories-translations.json'), 'utf8'));

const enTranslation = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/translation.json'), 'utf8'));
const ruTranslation = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/translation.json'), 'utf8'));
const uzTranslation = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/translation.json'), 'utf8'));

const BASE_URL = 'https://zaminat.uz';
const PERSON_ID = `${BASE_URL}/en/founder/sukhrobjon-rikhsiboev#person`;
const ORG_ID = `${BASE_URL}/#organization`;

const LANGUAGES = ['en', 'ru', 'uz'];
const DEFAULT_LANG = 'en';

const LOCALE_MAP = {
  en: 'en_US',
  ru: 'ru_RU',
  uz: 'uz_UZ',
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const PAGE_DATA = {
  home: {
    subpath: '',
    data: {
      en: {
        title: 'ZAMINAT.eco — Smart Ecology. Visible Impact. | AI ClimateTech Ecosystem',
        description: 'AI-driven circular economy platform in Uzbekistan: sustainable infrastructure, recycled materials, EcoApp gamification, and secondary-raw material network.',
        h1: 'ZAMINAT.eco — Smart Ecology. Visible Impact.',
        intro: 'Digital ClimateTech ecosystem integrating artificial intelligence, environmental education, and circular economy infrastructure in Uzbekistan.'
      },
      ru: {
        title: 'ZAMINAT.eco — Умная экология. Видимый результат. | Экосистема ClimateTech',
        description: 'Цифровая экосистема ИИ и циркулярной экономики в Узбекистане: устойчивая инфраструктура, эко-продукция из вторсырья, EcoApp и сбор полимеров.',
        h1: 'ZAMINAT.eco — Умная экология. Видимый результат.',
        intro: 'Цифровая экосистема на стыке искусственного интеллекта, экологического образования и циклической переработки вторсырья в Узбекистане.'
      },
      uz: {
        title: "ZAMINAT.eco — Aqlli ekologiya. Ko'rinadigan natija. | AI ClimateTech Ekotizimi",
        description: "O'zbekistonda AI, ta'lim va aylanma iqtisodiyotni birlashtirgan raqamli ekotizim: barqaror infratuzilma, qayta ishlangan mahsulotlar va EcoApp.",
        h1: "ZAMINAT.eco — Aqlli ekologiya. Ko'rinadigan natija.",
        intro: "O'zbekistonda sun'iy intellekt, ekologik ta'lim va aylanma iqtisodiyot infratuzilmasini birlashtirgan raqamli ekotizim."
      }
    }
  },
  about: {
    subpath: '/about',
    data: {
      en: {
        title: 'About Us | ZAMINAT.eco',
        description: 'Learn about the mission, technological infrastructure, and circular economy roadmap of ZAMINAT in Uzbekistan.',
        h1: 'About ZAMINAT.eco',
        intro: 'Transforming waste into valuable resources through AI, community action, and sustainable circular infrastructure.'
      },
      ru: {
        title: 'О нас | ZAMINAT.eco',
        description: 'Узнайте о миссии, технологической инфраструктуре и дорожной карте циркулярной экономики ZAMINAT в Узбекистане.',
        h1: 'О компании ZAMINAT.eco',
        intro: 'Превращаем вторсырье в ценные ресурсы с помощью ИИ, экологических действий и устойчивой инфраструктуры.'
      },
      uz: {
        title: 'Biz haqimizda | ZAMINAT.eco',
        description: "O'zbekistonda ZAMINAT missiyasi, texnologik infratuzilmasi va aylanma iqtisodiyot yo'l xaritasi haqida bilib oling.",
        h1: 'ZAMINAT.eco haqida',
        intro: "AI, jamoatchilik harakati va barqaror aylanma infratuzilma orqali chiqindilarni qimmatli resurslarga aylantirish."
      }
    }
  },
  team: {
    subpath: '/team',
    data: {
      en: {
        title: 'Our Team | ZAMINAT.eco',
        description: 'Meet the executive leadership, engineering, and sustainability professionals building ZAMINAT.',
        h1: 'ZAMINAT Team & Leadership',
        intro: 'Passionate professionals dedicated to building a sustainable circular future for Uzbekistan.'
      },
      ru: {
        title: 'Наша команда | ZAMINAT.eco',
        description: 'Познакомьтесь с руководством, инженерами и экспертами по устойчивому развитию ZAMINAT.',
        h1: 'Команда и руководство ZAMINAT',
        intro: 'Профессионалы, создающие устойчивое циркулярное будущее для Узбекистана.'
      },
      uz: {
        title: 'Bizning jamoa | ZAMINAT.eco',
        description: "ZAMINAT rahbariyati, muhandislari va barqaror rivojlanish mutaxassislari bilan tanishing.",
        h1: 'ZAMINAT jamoasi va rahbariyati',
        intro: "O'zbekiston uchun barqaror aylanma kelajakni barpo etuvchi fidoyi mutaxassislar."
      }
    }
  },
  shop: {
    subpath: '/shop',
    data: {
      en: {
        title: 'Recycled Eco-Products Catalog | ZAMINAT.eco',
        description: 'Certified rubber tiles, urban furniture, planters, and construction materials made from 100% recycled polymers and tires in Uzbekistan.',
        h1: 'Eco-Products & Circular Materials',
        intro: 'High-quality recycled EPDM tiles, eco-street furniture, and sustainable materials manufactured in Uzbekistan.'
      },
      ru: {
        title: 'Каталог эко-продукции из вторсырья | ZAMINAT.eco',
        description: 'Сертифицированная резиновая плитка, уличная мебель, кашпо и стройматериалы из 100% переработанных полимеров и шин в Узбекистане.',
        h1: 'Эко-продукция и циркулярные материалы',
        intro: 'Высококачественная резиновая плитка, уличная мебель и экологические материалы, произведенные в Узбекистане.'
      },
      uz: {
        title: 'Qayta ishlangan eko-mahsulotlar katalogi | ZAMINAT.eco',
        description: "O'zbekistonda 100% qayta ishlangan polimer va shinalardan tayyorlangan sertifikatlangan rezina plitkalar, ko'cha mebellari va materiallar.",
        h1: 'Eko-mahsulotlar va aylanma materiallar',
        intro: "O'zbekistonda ishlab chiqarilgan yuqori sifatli EPDM plitkalari, ko'cha mebellari va barqaror mahsulotlar."
      }
    }
  },
  actions: {
    subpath: '/actions',
    data: {
      en: {
        title: 'EcoActions & Collection Network Map | ZAMINAT.eco',
        description: 'Interactive map of secondary material collection points, network development areas, and community cleanup actions in Tashkent.',
        h1: 'Collection Points & EcoActions',
        intro: 'Explore secondary-material collection points, join ecological events, and make a tangible environmental impact.'
      },
      ru: {
        title: 'ЭкоДействия и карта пунктов приёма | ZAMINAT.eco',
        description: 'Интерактивная карта пунктов приёма вторсырья, зон развития сети и экологических акций в Ташкенте.',
        h1: 'Пункты приёма и ЭкоДействия',
        intro: 'Интерактивная карта пунктов сбора вторичного сырья, зон развития сети и экологических акций в Ташкенте.'
      },
      uz: {
        title: "EkoHarakatlar va yig'ish nuqtalari xaritasi | ZAMINAT.eco",
        description: "Toshkentdagi ikkilamchi xomashyo yig'ish nuqtalari, rivojlanish zonalari va ekologik aksiyalar interaktiv xaritasi.",
        h1: "Yig'ish nuqtalari va EkoHarakatlar",
        intro: "Ikkilamchi xomashyo yig'ish nuqtalari, rivojlanish zonalari va ekologik aksiyalar interaktiv xaritasi."
      }
    }
  },
  vote: {
    subpath: '/vote',
    data: {
      en: {
        title: 'EcoVote — Community Environmental Voting | ZAMINAT.eco',
        description: 'Vote for environmental initiatives and allocate community resources for impactful ecological projects in Uzbekistan.',
        h1: 'EcoVote Community Platform',
        intro: 'Vote for environmental initiatives and allocate community resources for impactful ecological projects.'
      },
      ru: {
        title: 'ЭкоГолосование — Экологические инициативы | ZAMINAT.eco',
        description: 'Голосуйте за экологические проекты и распределяйте ресурсы сообщества на важные инициативы в Узбекистане.',
        h1: 'Платформа ЭкоГолосования',
        intro: 'Голосуйте за экологические инициативы и поддерживайте важные проекты сообщества.'
      },
      uz: {
        title: "EkoOvoz — Jamoatchilik ekologik ovoz berishi | ZAMINAT.eco",
        description: "Ekologik loyihalar uchun ovoz bering va O'zbekistonda muhim tashabbuslarni birgalikda amalga oshiring.",
        h1: 'EkoOvoz platformasi',
        intro: "Ekologik loyihalar uchun ovoz bering va jamoatchilik resurslarini muhim ekologik loyihalarga yo'naltiring."
      }
    }
  },
  stories: {
    subpath: '/stories',
    data: {
      en: {
        title: 'EcoStories & Knowledge Hub | ZAMINAT.eco',
        description: 'Educational articles, case studies, and insights on circular economy, recycling technology, and environmental action in Central Asia.',
        h1: 'EcoStories & Environmental Knowledge',
        intro: 'Discover educational stories, environmental insights, and practical guides on sustainability and circular economy.'
      },
      ru: {
        title: 'ЭкоИстории и База знаний | ZAMINAT.eco',
        description: 'Образовательные статьи, кейсы и новости о циркулярной экономике, технологиях переработки и эко-инициативах в Центральной Азии.',
        h1: 'ЭкоИстории и экологические знания',
        intro: 'Читайте образовательные статьи, новости и практические руководства по устойчивому развитию и переработке.'
      },
      uz: {
        title: 'EkoHikoyalar va bilimlar markazi | ZAMINAT.eco',
        description: "Markaziy Osiyoda aylanma iqtisodiyot, qayta ishlash texnologiyalari va ekologik harakatlar bo'yicha maqolalar va yangiliklar.",
        h1: 'EkoHikoyalar va ekologik bilimlar',
        intro: "Barqarorlik va aylanma iqtisodiyot bo'yicha ta'limiy maqolalar, yangiliklar va amaliy qo'llanmalar."
      }
    }
  },
  partners: {
    subpath: '/partners',
    data: {
      en: {
        title: 'Partners & Corporate Collaboration | ZAMINAT.eco',
        description: 'Partner with ZAMINAT.eco for corporate ESG compliance, sustainable procurement, and circular supply chain integration.',
        h1: 'Partners & Collaboration',
        intro: 'Collaborate with ZAMINAT.eco to build sustainable industrial supply chains and circular economy partnerships.'
      },
      ru: {
        title: 'Партнёры и корпоративное сотрудничество | ZAMINAT.eco',
        description: 'Партнёрство с ZAMINAT.eco для корпоративного ESG, экологических закупок и интеграции циркулярных цепочек поставок.',
        h1: 'Партнёры и сотрудничество',
        intro: 'Сотрудничайте с ZAMINAT.eco для построения устойчивых производственных цепочек и циклической экономики.'
      },
      uz: {
        title: 'Hamkorlar va korporativ hamkorlik | ZAMINAT.eco',
        description: "ZAMINAT.eco bilan korporativ ESG, barqaror xaridlar va aylanma ta'minot zanjirlari bo'yicha hamkorlik qiling.",
        h1: 'Hamkorlar va hamkorlik',
        intro: "ZAMINAT.eco bilan barqaror ishlab chiqarish zanjirlarini va aylanma iqtisodiyot hamkorligini yo'lga qo'ying."
      }
    }
  },
  contacts: {
    subpath: '/contacts',
    data: {
      en: {
        title: 'Contact Us | ZAMINAT.eco',
        description: 'Get in touch with the ZAMINAT team in Tashkent, Uzbekistan. Direct email, telephone, and social channels.',
        h1: 'Contact ZAMINAT.eco',
        intro: 'Get in touch with our team in Tashkent, Uzbekistan for inquiries, partnerships, and product orders.'
      },
      ru: {
        title: 'Контакты | ZAMINAT.eco',
        description: 'Свяжитесь с командой ZAMINAT в Ташкенте, Узбекистан. Прямой email, телефон и социальные каналы связи.',
        h1: 'Контакты ZAMINAT.eco',
        intro: 'Свяжитесь с нашей командой в Ташкенте для вопросов, партнёрства и заказа экологической продукции.'
      },
      uz: {
        title: "Bog'lanish | ZAMINAT.eco",
        description: "Toshkentdagi ZAMINAT jamoasi bilan bog'laning. To'g'ridan-to'g'ri elektron pochta, telefon va ijtimoiy tarmoqlar.",
        h1: "ZAMINAT.eco bilan bog'lanish",
        intro: "Savollar, hamkorlik va mahsulot buyurtmalari uchun Toshkentdagi jamoamiz bilan bog'laning."
      }
    }
  }
};

function prerenderAllPages() {
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Please run vite build first.');
    process.exit(1);
  }

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ dist/index.html not found.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  let generatedCount = 0;

  // 1. Prerender Standard Public Indexable Pages
  Object.values(PAGE_DATA).forEach(page => {
    LANGUAGES.forEach(lang => {
      const p = page.data[lang];
      const canonicalUrl = `${BASE_URL}/${lang}${page.subpath}`;
      const ogLocale = LOCALE_MAP[lang] || 'en_US';

      let html = baseHtml;

      // Update <html lang="...">
      html = html.replace(/<html[^>]*>/i, `<html lang="${lang}">`);

      // Replace Title
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(p.title)}</title>`);

      // Replace Meta Description
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(p.description)}" />`);

      // Replace or add Canonical Link
      if (html.includes('<link rel="canonical"')) {
        html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
      } else {
        html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
      }

      // Replace OpenGraph & Twitter tags
      html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(p.title)}" />`);
      html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(p.description)}" />`);
      html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      html = html.replace(/<meta\s+property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="${ogLocale}" />`);

      html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(p.title)}" />`);
      html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(p.description)}" />`);

      // Add reciprocal hreflang links
      const hreflangTags = LANGUAGES.map(l => `  <link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}${page.subpath}" />`).join('\n') +
        `\n  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/${DEFAULT_LANG}${page.subpath}" />\n`;

      // Remove old hreflang in html if present, inject new
      html = html.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*>/gi, '');
      html = html.replace('</head>', `${hreflangTags}</head>`);

      // Inject Semantic Body for Crawlers into #root
      const semanticBody = `
        <div class="sr-prerender-content" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
          <header>
            <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">${escapeHtml(p.h1)}</h1>
            <p style="font-size: 1.125rem; color: #475569; margin-bottom: 1.5rem;">${escapeHtml(p.intro)}</p>
          </header>
          <nav aria-label="Breadcrumb" style="margin-bottom: 1rem; font-size: 0.875rem;">
            <a href="/${lang}">ZAMINAT.eco</a> ${page.subpath ? `&gt; <span>${escapeHtml(p.h1)}</span>` : ''}
          </nav>
        </div>
      `;
      html = html.replace('<div id="root"></div>', `<div id="root">${semanticBody}</div>`);

      // Output Directory
      const targetDir = page.subpath
        ? path.join(distDir, lang, ...page.subpath.split('/').filter(Boolean))
        : path.join(distDir, lang);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetFile = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFile, html, 'utf8');
      generatedCount++;
    });
  });

  // 2. Prerender Founder Entity Pages
  LANGUAGES.forEach(lang => {
    const founderMap = { en: enFounder.founder, ru: ruFounder.founder, uz: uzFounder.founder };
    const f = founderMap[lang];
    const canonicalUrl = `${BASE_URL}/${lang}/founder/sukhrobjon-rikhsiboev`;
    const ogLocale = LOCALE_MAP[lang] || 'en_US';

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
          ]
        }
      ]
    };

    let html = baseHtml;
    html = html.replace(/<html[^>]*>/i, `<html lang="${lang}">`);
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(f.meta.title)}</title>`);
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(f.meta.description)}" />`);

    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
    }

    html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(f.meta.title)}" />`);
    html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(f.meta.description)}" />`);
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
    html = html.replace(/<meta\s+property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="${ogLocale}" />`);

    html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(f.meta.title)}" />`);
    html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(f.meta.description)}" />`);

    const hreflangTags = LANGUAGES.map(l => `  <link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/founder/sukhrobjon-rikhsiboev" />`).join('\n') +
      `\n  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/${DEFAULT_LANG}/founder/sukhrobjon-rikhsiboev" />\n`;

    html = html.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*>/gi, '');
    html = html.replace('</head>', `${hreflangTags}</head>`);

    const scriptJsonLd = `  <script id="founder-jsonld-schema" type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n`;
    html = html.replace('</head>', `${scriptJsonLd}</head>`);

    const semanticFounderBody = `
      <main class="founder-entity-page" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
        <header>
          <span style="display: inline-block; padding: 0.25rem 0.75rem; background: #ecfdf5; color: #047857; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem;">Founder Profile</span>
          <h1 style="font-size: 2.25rem; font-weight: bold; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.hero.name)}</h1>
          <p style="font-size: 1.25rem; color: #059669; font-weight: 600; margin-bottom: 1.5rem;">${escapeHtml(f.hero.title)}</p>
          <p style="font-size: 1.125rem; color: #334155; line-height: 1.75; margin-bottom: 2rem;">${escapeHtml(f.hero.tagline)}</p>
        </header>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">${escapeHtml(f.about.title)}</h2>
          <p style="color: #334155; line-height: 1.75;">${escapeHtml(f.about.p1)}</p>
          <p style="color: #334155; line-height: 1.75; margin-top: 1rem;">${escapeHtml(f.about.p2)}</p>
        </section>
      </main>
    `;
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticFounderBody}</div>`);

    const targetDir = path.join(distDir, lang, 'founder', 'sukhrobjon-rikhsiboev');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf8');
    generatedCount++;
  });

  console.log(`✅ Prerender complete: ${generatedCount} static HTML pages generated across EN, RU, UZ.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prerenderAllPages();
}

export { prerenderAllPages };
