import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  ExternalLink,
  Linkedin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  FileText,
  MapPin,
  Building2,
  Compass,
  ArrowRight,
  Recycle,
  Scan,
  ShoppingBag,
  BookOpen,
  Users
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useHreflang } from '@/hooks/useHreflang';
import sukhrobjonPortrait from '../../svg/Sukhrobjon Rikhsiboev.avif';

const SUPPORTED_LANGS = ['en', 'ru', 'uz'] as const;
type SupportedLang = typeof SUPPORTED_LANGS[number];

export default function Founder() {
  const { lang } = useParams<{ lang?: string }>();
  const { t, i18n } = useTranslation(['founder', 'translation', 'common']);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Determine active language from URL parameter or fallback
  const activeLang: SupportedLang = (
    lang && SUPPORTED_LANGUAGES_SET.has(lang as SupportedLang)
      ? (lang as SupportedLang)
      : (i18n.language && SUPPORTED_LANGUAGES_SET.has(i18n.language as SupportedLang)
          ? (i18n.language as SupportedLang)
          : 'en')
  );

  // Sync i18n language when URL param changes
  useEffect(() => {
    if (lang && SUPPORTED_LANGUAGES_SET.has(lang as SupportedLang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Hook for hreflang tags
  useHreflang();

  const baseUrl = 'https://zaminat.uz';
  const canonicalUrl = `${baseUrl}/${activeLang}/founder/sukhrobjon-rikhsiboev`;
  const personEntityId = 'https://zaminat.uz/en/founder/sukhrobjon-rikhsiboev#person';
  const organizationEntityId = 'https://zaminat.uz/#organization';

  const pageTitle = t('founder.meta.title', { defaultValue: 'Sukhrobjon Rikhsiboev | Founder & CEO of ZAMINAT.eco' });
  const pageDescription = t('founder.meta.description', {
    defaultValue: 'Sukhrobjon Rikhsiboev is the Founder & CEO of ZAMINAT.eco, an early-stage ClimateTech and circular economy startup based in Tashkent, Uzbekistan.'
  });

  // Dynamic document head management
  useEffect(() => {
    document.title = pageTitle;

    const setMeta = (attr: 'name' | 'property', key: string, val: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    setMeta('name', 'description', pageDescription);
    setMeta('name', 'robots', 'index, follow');
    setMeta('name', 'author', 'Sukhrobjon Rikhsiboev');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:type', 'profile');
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', `${baseUrl}/images/sukhrobjon-rikhsiboev-founder-zaminat.avif`);
    setMeta('property', 'og:image:alt', 'Sukhrobjon Rikhsiboev, Founder and CEO of ZAMINAT.eco');
    setMeta('property', 'og:site_name', 'ZAMINAT.eco');
    setMeta('property', 'og:locale', activeLang === 'ru' ? 'ru_RU' : activeLang === 'uz' ? 'uz_UZ' : 'en_US');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDescription);
    setMeta('name', 'twitter:image', `${baseUrl}/images/sukhrobjon-rikhsiboev-founder-zaminat.avif`);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // ProfilePage + Person JSON-LD Schema
    const schemaId = 'founder-jsonld-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfilePage",
          "@id": canonicalUrl,
          "url": canonicalUrl,
          "name": pageTitle,
          "description": pageDescription,
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://zaminat.uz/#website",
            "url": "https://zaminat.uz",
            "name": "ZAMINAT.eco"
          },
          "mainEntity": {
            "@id": personEntityId
          },
          "inLanguage": activeLang,
          "dateModified": "2026-08-23"
        },
        {
          "@type": "Person",
          "@id": personEntityId,
          "name": "Sukhrobjon Rikhsiboev",
          "alternateName": [
            "Suxrobjon Rixsiboyev",
            "Sukhrobjon Rixsiboyev",
            "Suxrobjon Rikhsiboev",
            "Suhrobjon Rixsiboyev",
            "Сухробжон Рихсибоев",
            "Сухробжон Риксибоев"
          ],
          "description": "Founder & CEO of ZAMINAT.eco, an early-stage ClimateTech and circular economy startup based in Tashkent, Uzbekistan.",
          "image": "https://zaminat.uz/images/sukhrobjon-rikhsiboev-founder-zaminat.avif",
          "jobTitle": "Founder & Chief Executive Officer",
          "url": canonicalUrl,
          "worksFor": {
            "@type": "Organization",
            "@id": organizationEntityId,
            "name": "ZAMINAT.eco",
            "url": "https://zaminat.uz"
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

    scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);
  }, [activeLang, pageTitle, pageDescription, canonicalUrl]);

  // Language switch handler
  const handleLangChange = (targetLang: SupportedLang) => {
    navigate(`/${targetLang}/founder/sukhrobjon-rikhsiboev`);
  };

  const milestones = [
    {
      title: t('founder.milestones.items.0.title', { defaultValue: 'Zaminat LLC Registered' }),
      desc: t('founder.milestones.items.0.desc', { defaultValue: 'Formally registered as a legal corporate entity in Tashkent, Republic of Uzbekistan.' }),
      icon: Building2,
      badge: 'Legal Entity'
    },
    {
      title: t('founder.milestones.items.1.title', { defaultValue: 'ZAMINAT Trademark Registered' }),
      desc: t('founder.milestones.items.1.desc', { defaultValue: 'Official intellectual property and trademark protection secured for the ZAMINAT brand.' }),
      icon: ShieldCheck,
      badge: 'Intellectual Property'
    },
    {
      title: t('founder.milestones.items.2.title', { defaultValue: 'U-Enter Green Tech Accelerator Completed' }),
      desc: t('founder.milestones.items.2.desc', { defaultValue: 'Successfully completed the competitive Green Tech acceleration program at U-Enter (Tashkent).' }),
      icon: Award,
      badge: 'Acceleration'
    },
    {
      title: t('founder.milestones.items.3.title', { defaultValue: 'AI EcoScan MVP Launched' }),
      desc: t('founder.milestones.items.3.desc', { defaultValue: 'Developed and deployed a functional browser-based computer vision model for material classification.' }),
      icon: Scan,
      badge: 'Live MVP'
    },
    {
      title: t('founder.milestones.items.4.title', { defaultValue: 'Zami AI Eco-Agent Deployed' }),
      desc: t('founder.milestones.items.4.desc', { defaultValue: 'Integrated intelligent conversational AI for instant citizen recycling guidance and ecological support.' }),
      icon: Cpu,
      badge: 'Live AI MVP'
    },
    {
      title: t('founder.milestones.items.5.title', { defaultValue: 'EcoApp & EcoKids Blueprints Completed' }),
      desc: t('founder.milestones.items.5.desc', { defaultValue: 'Designed end-to-end product specifications for gamified citizen engagement and youth eco-education.' }),
      icon: Layers,
      badge: 'Architecture'
    }
  ];

  const expertiseList: string[] = [
    t('founder.expertise.skills.0', { defaultValue: 'ClimateTech & Circular Economy' }),
    t('founder.expertise.skills.1', { defaultValue: 'Artificial Intelligence & Machine Vision' }),
    t('founder.expertise.skills.2', { defaultValue: 'AI Automation & Process Engineering' }),
    t('founder.expertise.skills.3', { defaultValue: 'Search Engine Optimization (SEO)' }),
    t('founder.expertise.skills.4', { defaultValue: 'Digital Strategy & Brand Growth' }),
    t('founder.expertise.skills.5', { defaultValue: 'Business Analytics & Performance Metrics' }),
    t('founder.expertise.skills.6', { defaultValue: 'Startup Development & Product Architecture' }),
    t('founder.expertise.skills.7', { defaultValue: 'IT Infrastructure & Systems Integration' }),
    t('founder.expertise.skills.8', { defaultValue: 'Eco-Education & Community Engagement' })
  ];

  return (
    <Layout title={pageTitle}>
      <article className="min-h-screen pb-20 pt-4 bg-gradient-to-b from-slate-50 via-white to-emerald-50/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-10">

          {/* Language Switcher Bar & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1.5">
              <Link to="/" className="hover:text-emerald-700 transition-colors">ZAMINAT.eco</Link>
              <span>/</span>
              <Link to="/team" className="hover:text-emerald-700 transition-colors">
                {t('team.title', { ns: 'team', defaultValue: 'Team' })}
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-900">Sukhrobjon Rikhsiboev</span>
            </nav>

            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-[11px] text-gray-500 font-medium px-2 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Lang:
              </span>
              {(['en', 'ru', 'uz'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
                    activeLang === l
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Hero Section */}
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-700/50">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Portrait Image */}
              <div className="flex-shrink-0 text-center">
                <div className="relative inline-block">
                  <img
                    src={sukhrobjonPortrait}
                    alt={t('founder.meta.title', { defaultValue: 'Sukhrobjon Rikhsiboev, Founder and CEO of ZAMINAT.eco' })}
                    width={220}
                    height={220}
                    loading="eager"
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover border-4 border-emerald-400/40 shadow-2xl ring-4 ring-emerald-500/20"
                  />
                  <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 border border-emerald-400/40 shadow-lg whitespace-nowrap">
                    Founder & CEO
                  </Badge>
                </div>
              </div>

              {/* Identity & Core Details */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-semibold">
                      ZAMINAT.eco
                    </Badge>
                    <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                      Pre-Seed ClimateTech
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {t('founder.hero.name', { defaultValue: 'Sukhrobjon Rikhsiboev' })}
                  </h1>
                  <p className="text-base sm:text-lg text-emerald-300 font-medium">
                    {t('founder.hero.title', { defaultValue: 'Founder & CEO of ZAMINAT.eco' })}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 font-normal">
                    {t('founder.hero.tagline', { defaultValue: 'ClimateTech • Artificial Intelligence • Circular Economy • Uzbekistan' })}
                  </p>
                </div>

                {/* Alternate Spellings Machine/Human Signal */}
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs">
                  <span className="text-slate-300 font-semibold">{t('founder.hero.altNames', { defaultValue: 'Also written as: Suxrobjon Rixsiboyev / Сухробжон Рихсибоев' })}</span>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <a
                    href="https://uz.linkedin.com/in/sukhrobjon-rikhsiboev-5b9878386"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold shadow-md hover:bg-[#084e96] transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                  <a
                    href="https://my.visme.co/view/6vzqerpg-entrepreneurial-leadership-and-digital-strategy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-600 text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Leadership Strategy Presentation
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Section 2: Facts at a Glance (Extractable Table for Search/AI) */}
          <section aria-labelledby="quick-facts-heading">
            <Card className="border shadow-lg bg-white/90 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <CardTitle id="quick-facts-heading" className="text-base sm:text-lg font-bold text-gray-900">
                    {t('founder.quickFacts.title', { defaultValue: 'Facts at a Glance' })}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs sm:text-sm">
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.role', { defaultValue: 'Role' })}</dt>
                    <dd className="font-bold text-gray-900 mt-0.5">{t('founder.quickFacts.roleValue', { defaultValue: 'Founder & Chief Executive Officer' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.organization', { defaultValue: 'Organization' })}</dt>
                    <dd className="font-bold text-gray-900 mt-0.5">{t('founder.quickFacts.organizationValue', { defaultValue: 'ZAMINAT.eco (Zaminat LLC)' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.location', { defaultValue: 'Location' })}</dt>
                    <dd className="font-bold text-gray-900 mt-0.5">{t('founder.quickFacts.locationValue', { defaultValue: 'Tashkent, Uzbekistan' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.status', { defaultValue: 'Venture Stage' })}</dt>
                    <dd className="font-bold text-emerald-800 mt-0.5">{t('founder.quickFacts.statusValue', { defaultValue: 'Early-Stage / Pre-Seed ClimateTech Startup' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.education', { defaultValue: 'Education' })}</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{t('founder.quickFacts.educationValue', { defaultValue: 'Bachelor of Business Administration (BBA), Amity University Tashkent (2024)' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.experience', { defaultValue: 'Industry Background' })}</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{t('founder.quickFacts.experienceValue', { defaultValue: '~6 Years in U.S.-Based Automotive Dealership Operations & Digital Strategy' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.workingMVPs', { defaultValue: 'Live Digital MVPs' })}</dt>
                    <dd className="font-semibold text-emerald-700 mt-0.5">{t('founder.quickFacts.workingMVPsValue', { defaultValue: 'AI EcoScan Material Classifier & Zami AI Eco-Agent' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.architectures', { defaultValue: 'Developed Architectures' })}</dt>
                    <dd className="font-semibold text-indigo-700 mt-0.5">{t('founder.quickFacts.architecturesValue', { defaultValue: 'EcoApp Citizen Gamification & EcoKids Educational Curriculum' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.legal', { defaultValue: 'Legal & IP Status' })}</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{t('founder.quickFacts.legalValue', { defaultValue: 'Registered LLC in Uzbekistan & Registered ZAMINAT Trademark' })}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">{t('founder.quickFacts.accelerator', { defaultValue: 'Acceleration' })}</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{t('founder.quickFacts.acceleratorValue', { defaultValue: 'Graduate, U-Enter Green Tech Accelerator' })}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Entity Bio Overview */}
          <section aria-labelledby="about-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                <Compass className="h-4 w-4" />
              </div>
              <h2 id="about-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('founder.about.title', { defaultValue: 'Who is Sukhrobjon Rikhsiboev?' })}
              </h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-gray-700 space-y-3.5">
              <p>{t('founder.about.p1')}</p>
              <p>{t('founder.about.p2')}</p>
              <p>{t('founder.about.p3')}</p>
            </div>
          </section>

          {/* Section 4: Building ZAMINAT.eco (Vision & Architecture) */}
          <section aria-labelledby="building-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Recycle className="h-4 w-4" />
              </div>
              <div>
                <h2 id="building-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t('founder.building.title', { defaultValue: 'Building ZAMINAT.eco' })}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {t('founder.building.subtitle', { defaultValue: 'AI-Powered Waste-to-Life Vision & Circular Architecture' })}
                </p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-gray-700 space-y-3">
              <p>{t('founder.building.p1')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-sm font-bold text-emerald-950">
                      {t('founder.building.digitalMvpTitle', { defaultValue: 'Working Digital Prototypes (Live MVPs)' })}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-emerald-900 space-y-2">
                  <p>{t('founder.building.ecoscan')}</p>
                  <p>{t('founder.building.zami')}</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 bg-indigo-50/40 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-sm font-bold text-indigo-950">
                      {t('founder.building.architecturesTitle', { defaultValue: 'System Architectures' })}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-indigo-900 space-y-2">
                  <p>{t('founder.building.architecturesDesc')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Factual Disclaimer Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 text-xs leading-relaxed">
              <p className="font-semibold text-amber-900">
                {t('founder.building.physicalRoadmapNote')}
              </p>
            </div>
          </section>

          {/* Section 5: Verified Milestones */}
          <section aria-labelledby="milestones-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h2 id="milestones-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t('founder.milestones.title', { defaultValue: 'Verified ZAMINAT Milestones' })}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {t('founder.milestones.subtitle', { defaultValue: 'Documented progress and early-stage achievements' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map((m, idx) => {
                const IconComponent = m.icon;
                return (
                  <Card key={idx} className="border shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">
                          {m.badge}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 leading-tight">
                        {m.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {m.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Section 6: Professional Background & Education */}
          <section aria-labelledby="background-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Background */}
            <Card className="border shadow-md bg-white">
              <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <CardTitle id="background-heading" className="text-base sm:text-lg font-bold text-gray-900">
                    {t('founder.background.title', { defaultValue: 'Professional Background' })}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 text-xs sm:text-sm text-gray-700 space-y-3 leading-relaxed">
                <p>{t('founder.background.p1')}</p>
                <p>{t('founder.background.p2')}</p>
                <p>{t('founder.background.p3')}</p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border shadow-md bg-white">
              <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                    {t('founder.education.title', { defaultValue: 'Education & Academic Foundation' })}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 text-xs sm:text-sm text-gray-700 space-y-3.5 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <h3 className="font-bold text-indigo-950 text-sm sm:text-base">
                    {t('founder.education.degree', { defaultValue: 'Bachelor of Business Administration (BBA)' })}
                  </h3>
                  <p className="text-indigo-800 font-semibold text-xs mt-0.5">
                    {t('founder.education.institution', { defaultValue: 'Amity University Tashkent' })} • {t('founder.education.year', { defaultValue: 'Class of 2024' })}
                  </p>
                </div>
                <p>{t('founder.education.desc')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 7: Mission for Uzbekistan */}
          <section aria-labelledby="mission-heading">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white overflow-hidden">
              <CardContent className="p-6 sm:p-10 space-y-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <MapPin className="h-5 w-5" />
                  <h2 id="mission-heading" className="text-lg sm:text-xl font-bold">
                    {t('founder.mission.title', { defaultValue: 'Mission for Uzbekistan' })}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {t('founder.mission.p1')}
                </p>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {t('founder.mission.p2')}
                </p>
                <blockquote className="p-4 rounded-2xl bg-white/10 border-l-4 border-emerald-400 italic text-xs sm:text-sm text-emerald-100 mt-4">
                  "{t('founder.mission.quote')}"
                </blockquote>
              </CardContent>
            </Card>
          </section>

          {/* Section 8: Areas of Expertise */}
          <section aria-labelledby="expertise-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 id="expertise-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('founder.expertise.title', { defaultValue: 'Areas of Expertise' })}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {expertiseList.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-white hover:bg-emerald-50 text-gray-800 border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors shadow-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          {/* Section 9: Explore ZAMINAT Ecosystem */}
          <section aria-labelledby="ecosystem-heading" className="space-y-4">
            <div>
              <h2 id="ecosystem-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('founder.currentWork.title', { defaultValue: 'Explore ZAMINAT Ecosystem' })}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('founder.currentWork.subtitle', { defaultValue: 'Discover the modules and tools built under Sukhrobjon’s leadership' })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                to="/scanner"
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <Scan className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    {t('founder.currentWork.links.scanner', { defaultValue: 'AI EcoScan Material Classifier' })}
                  </h3>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-emerald-600 mt-3 group-hover:translate-x-1 transition-transform">
                  Try AI Scanner <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Link>

              <Link
                to="/actions"
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <MapPin className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    {t('founder.currentWork.links.actions', { defaultValue: 'EcoActions & Network Development Map' })}
                  </h3>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-emerald-600 mt-3 group-hover:translate-x-1 transition-transform">
                  View Map <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Link>

              <Link
                to="/shop"
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <ShoppingBag className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    {t('founder.currentWork.links.shop', { defaultValue: 'Social Mission EcoShop Catalog' })}
                  </h3>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-emerald-600 mt-3 group-hover:translate-x-1 transition-transform">
                  Browse Catalog <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Link>

              <Link
                to="/stories"
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <BookOpen className="h-5 w-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    {t('founder.currentWork.links.stories', { defaultValue: 'Community Impact & Ecological Stories' })}
                  </h3>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-emerald-600 mt-3 group-hover:translate-x-1 transition-transform">
                  Read Stories <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Link>
            </div>
          </section>

          {/* Section 10: Official Profiles & Verified Sources */}
          <section aria-labelledby="sources-heading" className="space-y-4">
            <div>
              <h2 id="sources-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('founder.externalProfiles.title', { defaultValue: 'Verified Profiles & Official Sources' })}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('founder.externalProfiles.subtitle', { defaultValue: 'Official public references and professional identity links' })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://uz.linkedin.com/in/sukhrobjon-rikhsiboev-5b9878386"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-blue-50 text-[#0A66C2]">
                  <Linkedin className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    {t('founder.externalProfiles.linkedinTitle')}
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t('founder.externalProfiles.linkedinDesc')}
                  </p>
                </div>
              </a>

              <a
                href="https://my.visme.co/view/6vzqerpg-entrepreneurial-leadership-and-digital-strategy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    {t('founder.externalProfiles.vismeTitle')}
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t('founder.externalProfiles.vismeDesc')}
                  </p>
                </div>
              </a>
            </div>
          </section>

          {/* Verification & Metadata Footer */}
          <footer className="pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
            <p>{t('founder.lastUpdated', { defaultValue: 'Last verified & updated: August 2026' })}</p>
            <p>© {new Date().getFullYear()} ZAMINAT.eco • Zaminat LLC. Republic of Uzbekistan.</p>
          </footer>

        </div>
      </article>
    </Layout>
  );
}

const SUPPORTED_LANGUAGES_SET = new Set<SupportedLang>(SUPPORTED_LANGS);
