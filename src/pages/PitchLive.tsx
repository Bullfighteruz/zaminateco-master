import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, RotateCcw, Maximize, Recycle, Target,
  Globe, TrendingUp, Package, Smartphone, Heart, CheckCircle2,
  Landmark, Building2, Sparkles, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { contactHelpers } from '@/utils/mailto';
import sukhrobjonPhoto from '../../svg/Sukhrobjon Rikhsiboev.jpg';

/* ────────────────── Constants ────────────────── */
const TOTAL_SLIDES = 6;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

/* ────────────────── Language Switcher (minimal) ────────────────── */
function PitchLangSwitcher() {
  const { i18n } = useTranslation();
  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'uz', label: 'UZ' },
  ];
  return (
    <div className="flex gap-1">
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          className={cn(
            "px-2 py-1 rounded text-xs font-bold transition-all",
            i18n.language === l.code
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white/80"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/* ────────────────── Slide Components ────────────────── */

function Slide1Hero({ t, lang }: { t: any; lang: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <img src="/logo.webp" alt="ZAMINAT.eco" className="h-16 w-16 rounded-2xl shadow-2xl" />
        <span className="text-4xl font-black tracking-tight">ZAMINAT.eco</span>
      </div>
      <h1 className="text-6xl lg:text-7xl font-black leading-tight mb-6">
        {t('pitch.hero.title').split('\n').map((line: string, idx: number) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {idx > 0 ? <span className="text-yellow-300">{line}</span> : line}
          </React.Fragment>
        ))}
      </h1>
      <p className="text-xl lg:text-2xl opacity-90 max-w-3xl leading-relaxed mb-8">
        {t('pitch.hero.subtitle')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {[t('pitch.hero.location'), t('pitch.hero.stage'), t('pitch.hero.established')].map(tag => (
          <span key={tag} className="bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
            {tag}
          </span>
        ))}
      </div>
      {/* Founder quote */}
      <div className="bg-white/10 border border-white/15 rounded-2xl backdrop-blur-sm p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-yellow-300" />
          <span className="text-sm font-bold uppercase tracking-wider text-yellow-300">{t('pitch.hero.founderMission')}</span>
        </div>
        <p className="text-lg text-white/90 leading-relaxed italic">
          "{t('pitch.hero.founderMissionText')}"
        </p>
        <div className="flex items-center gap-3 mt-4">
          <img src={sukhrobjonPhoto} alt="Founder" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
          <span className="text-sm font-semibold text-white/80">Sukhrobjon Rikhsiboev — Founder & CEO</span>
        </div>
      </div>
    </div>
  );
}

function Slide2Problem({ t, lang }: { t: any; lang: string }) {
  const stats = [
    { value: lang === 'ru' ? '15,1 млн+' : lang === 'uz' ? '15.1 mln+' : '15.1M+', unit: t('pitch.stats.tonsYear'), label: t('pitch.stats.wasteUz'), icon: Recycle },
    { value: lang === 'ru' ? '1,5–2,2 млн' : lang === 'uz' ? '1.5–2.2 mln' : '1.5–2.2M', unit: t('pitch.stats.tons'), label: t('pitch.stats.plasticStream'), icon: Target },
    { value: '11.2% / 17%', unit: t('pitch.stats.recycling'), label: t('pitch.stats.recyclingRate'), icon: Globe },
    { value: lang === 'ru' ? '1 трлн' : lang === 'uz' ? '1 trln' : '1T', unit: t('pitch.stats.uzs'), label: t('pitch.stats.unrealizedValue'), icon: TrendingUp },
  ];
  const titleParts = t('pitch.problem.title').split('. ');
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
      <span className="bg-red-500/20 text-red-200 border border-red-400/30 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
        {t('pitch.problem.tag')}
      </span>
      <h2 className="text-4xl lg:text-5xl font-black text-center leading-tight mb-10 max-w-4xl">
        {titleParts[0]}.
        {titleParts[1] && <><br /><span className="text-emerald-400">{titleParts[1]}</span></>}
      </h2>
      <div className="grid grid-cols-4 gap-6 w-full max-w-4xl">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <stat.icon className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
            <div className="text-3xl lg:text-4xl font-black text-emerald-400">{stat.value}</div>
            {stat.unit && <div className="text-sm font-semibold text-emerald-300/80 mt-1">{stat.unit}</div>}
            <div className="text-xs text-white/60 mt-2 leading-relaxed">{stat.label}</div>
          </div>
        ))}
      </div>
      <p className="text-white/40 text-xs mt-6 italic">{t('pitch.problem.sourceNote')}</p>
    </div>
  );
}

function Slide3Products({ t, lang }: { t: any; lang: string }) {
  const phase1 = [
    { name: 'EPDM-free Tiles', image: '/images/EPDM-free Tiles.webp', label: t('pitch.catalog.status.pilotSku') },
    { name: 'EPDM Rubber Tiles', image: '/images/EPDM Tiles.webp', label: t('pitch.catalog.status.pilotSku') },
    { name: 'EcoBrick', image: '/images/EcoBrick.webp', label: t('pitch.catalog.status.pilotReady') },
    { name: 'Eco Bench', image: '/images/Eco Bench.webp', label: t('pitch.catalog.status.pilotReady') },
  ];
  const pillars = [
    { title: t('pitch.solution.pillars.physical.title'), subtitle: t('pitch.solution.pillars.physical.subtitle'), icon: Package, color: 'text-emerald-400' },
    { title: t('pitch.solution.pillars.digital.title'), subtitle: t('pitch.solution.pillars.digital.subtitle'), icon: Smartphone, color: 'text-teal-400' },
    { title: t('pitch.solution.pillars.education.title'), subtitle: t('pitch.solution.pillars.education.subtitle'), icon: Heart, color: 'text-green-400' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-6xl mx-auto">
      <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
        {t('pitch.solution.tag')} + {t('pitch.catalog.tag')}
      </span>
      <h2 className="text-4xl lg:text-5xl font-black text-center mb-8">
        {t('pitch.solution.title')}
      </h2>
      {/* Three pillars row */}
      <div className="grid grid-cols-3 gap-4 w-full mb-8">
        {pillars.map((p, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p.icon className={cn("mx-auto mb-2 h-7 w-7", p.color)} />
            <div className="font-bold text-base">{p.title}</div>
            <div className={cn("text-xs mt-1", p.color)}>{p.subtitle}</div>
          </div>
        ))}
      </div>
      {/* Phase 1 products */}
      <h3 className="text-lg font-bold text-emerald-300 mb-4">{t('pitch.catalog.phase1Title')}</h3>
      <div className="grid grid-cols-4 gap-4 w-full">
        {phase1.map((p, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="font-bold text-sm">{p.name}</div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded mt-1 inline-block">{p.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide4Digital({ t, lang }: { t: any; lang: string }) {
  const ecoappFlow = (() => {
    const val = t('pitch.ecoapp.flow', { returnObjects: true });
    return Array.isArray(val) ? val : ['Collect', 'Participate', 'Earn', 'Vote', 'Track Impact'];
  })();
  const modules = [
    { name: t('pitch.ecoapp.modules.ecomap.name'), desc: t('pitch.ecoapp.modules.ecomap.desc'), icon: Globe },
    { name: t('pitch.ecoapp.modules.ecoactions.name'), desc: t('pitch.ecoapp.modules.ecoactions.desc'), icon: Heart },
    { name: t('pitch.ecoapp.modules.ecowallet.name'), desc: t('pitch.ecoapp.modules.ecowallet.desc'), icon: Sparkles },
    { name: t('pitch.ecoapp.modules.ecovote.name'), desc: t('pitch.ecoapp.modules.ecovote.desc'), icon: Landmark },
    { name: t('pitch.ecoapp.modules.dashboard.name'), desc: t('pitch.ecoapp.modules.dashboard.desc'), icon: TrendingUp },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
      <span className="bg-teal-500/20 text-teal-200 border border-teal-400/30 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
        {t('pitch.ecoapp.tag')} + EcoKids
      </span>
      <h2 className="text-4xl lg:text-5xl font-black text-center mb-8">
        {t('pitch.ecoapp.title')}
      </h2>
      {/* Flow */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {ecoappFlow.map((step: string, i: number) => (
          <React.Fragment key={step}>
            <span className="px-4 py-2 bg-teal-500/15 border border-teal-400/30 rounded-lg text-sm font-bold text-teal-300">
              {step}
            </span>
            {i < ecoappFlow.length - 1 && <ChevronRight className="h-5 w-5 text-teal-400/50" />}
          </React.Fragment>
        ))}
      </div>
      {/* Modules Grid */}
      <div className="grid grid-cols-5 gap-4 w-full mb-8">
        {modules.map((mod, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <mod.icon className="mx-auto mb-2 h-7 w-7 text-teal-400" />
            <div className="font-bold text-sm mb-1">{mod.name}</div>
            <div className="text-[11px] text-white/60 leading-relaxed">{mod.desc}</div>
          </div>
        ))}
      </div>
      {/* EcoKids highlight */}
      <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-6 text-center max-w-3xl">
        <Heart className="mx-auto mb-3 h-8 w-8 text-green-400" />
        <h3 className="text-xl font-bold mb-2">{t('pitch.solution.pillars.education.title')}</h3>
        <p className="text-sm text-white/80 leading-relaxed">{t('pitch.solution.pillars.education.desc')}</p>
      </div>
    </div>
  );
}

function Slide5Traction({ t, lang }: { t: any; lang: string }) {
  const getArray = (key: string, def: string[]): string[] => {
    const val = t(key, { returnObjects: true });
    return Array.isArray(val) ? val : def;
  };
  const tractionCards = [
    { title: t('pitch.traction.pillars.legal.title'), items: getArray('pitch.traction.pillars.legal.items', []) },
    { title: t('pitch.traction.pillars.accelerator.title'), items: getArray('pitch.traction.pillars.accelerator.items', []) },
    { title: t('pitch.traction.pillars.product.title'), items: getArray('pitch.traction.pillars.product.items', []) },
    { title: t('pitch.traction.pillars.sourcing.title'), items: getArray('pitch.traction.pillars.sourcing.items', []) },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-6xl mx-auto">
      <span className="bg-green-500/20 text-green-200 border border-green-400/30 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
        {t('pitch.traction.tag')}
      </span>
      <h2 className="text-4xl lg:text-5xl font-black text-center mb-4">
        {t('pitch.traction.title')}
      </h2>
      <p className="text-base text-white/70 text-center max-w-3xl mb-8 leading-relaxed">
        {t('pitch.traction.subtitle')}
      </p>
      <div className="grid grid-cols-2 gap-5 w-full">
        {tractionCards.map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="font-bold text-sm text-emerald-300 mb-3 border-b border-white/10 pb-2">{card.title}</h4>
            <ul className="space-y-2">
              {card.items.slice(0, 4).map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide6Ask({ t, lang }: { t: any; lang: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
      <span className="bg-white/15 text-white border border-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
        {t('pitch.ask.tag')}
      </span>
      <h2 className="text-4xl lg:text-5xl font-black text-center mb-10 max-w-3xl">
        {t('pitch.ask.seekingTitle')}
      </h2>
      {/* Scenarios */}
      <div className="grid grid-cols-3 gap-5 w-full mb-10">
        {/* A */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <Landmark className="h-6 w-6 text-emerald-400 mb-3" />
          <h4 className="font-bold text-base mb-2">{t('pitch.ask.scenarioA.title').split(' — ')[1] || t('pitch.ask.scenarioA.title')}</h4>
          <p className="text-lg font-extrabold text-white/95">{t('pitch.ask.scenarioA.details')}</p>
          <p className="text-xs text-white/50 mt-3 border-t border-white/5 pt-2">{t('pitch.ask.scenarioA.note')}</p>
        </div>
        {/* B */}
        <div className="bg-emerald-500/10 border-2 border-emerald-400/30 rounded-2xl p-5 relative">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
            {t('pitch.ask.scenarioB.badge', { defaultValue: 'Strategic Option' })}
          </div>
          <Building2 className="h-6 w-6 text-emerald-400 mb-3" />
          <h4 className="font-bold text-base mb-2">{t('pitch.ask.scenarioB.title').split(' — ')[1] || t('pitch.ask.scenarioB.title')}</h4>
          <p className="text-lg font-extrabold text-white/95">{t('pitch.ask.scenarioB.details')}</p>
          <p className="text-xs text-white/60 mt-3 border-t border-white/10 pt-2">{t('pitch.ask.scenarioB.note')}</p>
        </div>
        {/* C */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <Globe className="h-6 w-6 text-emerald-400 mb-3" />
          <h4 className="font-bold text-base mb-2">{t('pitch.ask.scenarioC.title').split(' — ')[1] || t('pitch.ask.scenarioC.title')}</h4>
          <p className="text-lg font-extrabold text-white/95">{t('pitch.ask.scenarioC.details')}</p>
          <p className="text-xs text-white/50 mt-3 border-t border-white/5 pt-2">{t('pitch.ask.scenarioC.note')}</p>
        </div>
      </div>
      {/* CTA + QR */}
      <div className="text-center">
        <p className="text-xl font-bold text-white/95 mb-1">{t('pitch.ask.cta1')}</p>
        <p className="text-3xl font-black text-yellow-300 uppercase tracking-wider mb-8">{t('pitch.ask.cta2')}</p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-3 rounded-xl shadow-2xl w-32 h-32 flex items-center justify-center">
              <img src="/images/pitch-qr.png" alt="QR" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs text-white/60 font-semibold">{t('pitch.ask.qrLabel')}</span>
          </div>
          <button
            onClick={() => contactHelpers.generalInquiry('Investment Inquiry — ZAMINAT.eco', 'I viewed the ZAMINAT.eco live pitch and would like to discuss investment opportunities.')}
            className="bg-white text-emerald-700 hover:bg-gray-100 font-bold shadow-xl rounded-xl px-8 py-4 text-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Mail className="h-5 w-5" />
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── Main Component ────────────────── */

export default function PitchLive() {
  const { t, i18n } = useTranslation(['translation', 'shop', 'team']);
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setSlide(([s]) => [Math.min(s + 1, TOTAL_SLIDES - 1), 1]);
  }, []);

  const goPrev = useCallback(() => {
    setSlide(([s]) => [Math.max(s - 1, 0), -1]);
  }, []);

  const goReset = useCallback(() => {
    setSlide([0, -1]);
  }, []);

  const goFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'r' || e.key === 'R') { goReset(); }
      if (e.key === 'f' || e.key === 'F') { goFullscreen(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, goReset, goFullscreen]);

  const slides = [
    <Slide1Hero t={t} lang={i18n.language} />,
    <Slide2Problem t={t} lang={i18n.language} />,
    <Slide3Products t={t} lang={i18n.language} />,
    <Slide4Digital t={t} lang={i18n.language} />,
    <Slide5Traction t={t} lang={i18n.language} />,
    <Slide6Ask t={t} lang={i18n.language} />,
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 text-white select-none"
    >
      {/* Subtle background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-600/6 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="ZAMINAT.eco" className="h-8 w-8 rounded-lg opacity-80" />
          <span className="text-sm font-bold opacity-60">ZAMINAT.eco Pitch</span>
        </div>
        <div className="flex items-center gap-4">
          <PitchLangSwitcher />
          <span className="text-sm font-mono text-white/50">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>
        </div>
      </div>

      {/* Slide Area */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {slides[currentSlide]}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-3 py-5">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
            currentSlide === 0
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          )}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={goReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
          title="Reset (R)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={goFullscreen}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
          title="Fullscreen (F)"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button
          onClick={goNext}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
            currentSlide === TOTAL_SLIDES - 1
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          )}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-40">
        <motion.div
          className="h-full bg-emerald-400"
          initial={false}
          animate={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
