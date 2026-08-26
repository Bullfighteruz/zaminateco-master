import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Target, Globe, TrendingUp, Sparkles, Recycle,
  ChevronRight, CheckCircle2, Building2, Landmark, Package, Heart,
  Smartphone, Mail, Briefcase, Menu, X, ArrowUp, Check,
  Camera, MessageSquare, Cpu, ShieldCheck, Smile, Factory
} from 'lucide-react';
import Layout from '@/components/Layout';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { contactHelpers } from '@/utils/mailto';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FloatingPhoneShowcase from '@/components/pitch/FloatingPhoneShowcase';
import AIWorkflowDiagram from '@/components/ai/AIWorkflowDiagram';
import AIEcosystemTabs from '@/components/ai/AIEcosystemTabs';
import sukhrobjonPhoto from '../../svg/Sukhrobjon Rikhsiboev.avif';
import azamatPhoto from '../../svg/Azamat Elchibekov.avif';
import khondamirPhoto from '../../svg/Khondamir Alibekov.avif';
import jahongirPhoto from '../../svg/JAHONGIR NORMATOV.avif';

/* ────────────────────────────── Data ────────────────────────────── */

const PRODUCTS_PHASE1 = [
  { name: 'EPDM-free Tiles', image: '/images/EPDM-free Tiles.webp', material: 'Recycled Rubber', price: '219,000 UZS/m²', status: 'pilotSku', rawName: 'EPDM-free Tiles' },
  { name: 'EPDM Rubber Tiles', image: '/images/EPDM Tiles.webp', material: 'EPDM + Rubber', price: '539,000 UZS/m²', status: 'pilotSku', rawName: 'EPDM Rubber Tiles' },
  { name: 'EcoBrick', image: '/images/EcoBrick.webp', material: 'Recycled Plastic', price: '99,000 UZS/pc', status: 'pilotReady', rawName: 'EcoBrick' },
  { name: 'Eco Bench', image: '/images/Eco Bench.webp', material: 'Recycled Plastic', price: '790,000 UZS/pc', status: 'pilotReady', rawName: 'Eco Bench' },
  { name: 'Garden Planter', image: '/images/Garden Planter.webp', material: 'Recycled Plastic', price: '149,000 UZS/pc', status: 'pilotReady', rawName: 'Garden Planter' },
  { name: 'ECOBIKE RACK', image: '/images/ECOBIKE RACK.webp', material: 'Recycled Plastic', price: '490,000 UZS/pc', status: 'pilotReady', rawName: 'ECOBIKE RACK' },
  { name: 'Waste Bin', image: '/images/Waste Bin.webp', material: 'Recycled Plastic', price: '79,000 UZS/pc', status: 'pilotReady', rawName: 'Waste Bin' },
  { name: 'Eco-friendly Business Cards', image: '/images/Eco-friendly Business Cards.webp', material: 'Recycled Plastic', price: '10,900 UZS/pc', status: 'pilotReady', rawName: 'Eco-friendly Business Cards' },
];

const PRODUCTS_PHASE2 = [
  { name: 'ECOBUSSTOP', image: '/images/ECOBUSSTOP.webp', material: 'Recycled Materials', price: '8,590,000 UZS', status: 'demo', rawName: 'ECOBUSSTOP' },
  { name: 'Art Tiles', image: '/images/art-tiles.webp', material: 'Recycled Rubber', price: '49,000 UZS/pc', status: 'roadmap', rawName: 'Art Tiles' },
  { name: 'Ecostreet Furniture', image: '/images/green-city_5994274.webp', material: 'Recycled Materials', price: 'Custom', status: 'roadmap', rawName: 'Ecostreet Furniture' },
];

/* ────────────────────────────── Animations ────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/* ────────────────────────────── Pitch Nav Bar ────────────────────────────── */

const NAV_SECTIONS = [
  { id: 'pitch-hero', labelKey: 'pitch.nav.hero' },
  { id: 'pitch-team', labelKey: 'pitch.nav.team' },
  { id: 'pitch-opportunity', labelKey: 'pitch.nav.opportunity' },
  { id: 'pitch-solution', labelKey: 'pitch.nav.solution' },
  { id: 'pitch-ai', labelKey: 'pitch.nav.ai' },
  { id: 'pitch-products', labelKey: 'pitch.nav.products' },
  { id: 'pitch-business', labelKey: 'pitch.nav.business' },
  { id: 'pitch-roadmap', labelKey: 'pitch.nav.roadmap' },
  { id: 'pitch-traction', labelKey: 'pitch.nav.traction' },
  { id: 'pitch-ask', labelKey: 'pitch.nav.invest' },
];

function PitchNavBar({ isMobile, t }: { isMobile: boolean; t: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('pitch-hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTargetRef = useRef<string | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  // Dynamic state to check if screen width requires compact hamburger nav (width < 1200px)
  const [isNavCompact, setIsNavCompact] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsNavCompact(window.innerWidth < 1200);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Dynamic coordinates retrieval for sections
  const getSectionPositions = useCallback(() => {
    const offset = isNavCompact ? 60 : 80;
    return NAV_SECTIONS.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      return { id: s.id, top };
    }).filter((s): s is { id: string; top: number } => s !== null);
  }, [isNavCompact]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Force active section to be the last section if scrolled to absolute bottom
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom && NAV_SECTIONS.length > 0) {
        setActiveSection(NAV_SECTIONS[NAV_SECTIONS.length - 1].id);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver, aligning rootMargin dynamically
  useEffect(() => {
    const margin = isNavCompact ? '-60px 0px -50% 0px' : '-80px 0px -50% 0px';
    const observer = new IntersectionObserver(
      (entries) => {
        // If at the absolute bottom of the page, stick to the last section
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
        if (isAtBottom && NAV_SECTIONS.length > 0) {
          setActiveSection(NAV_SECTIONS[NAV_SECTIONS.length - 1].id);
          return;
        }

        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: margin, threshold: 0 }
    );
    NAV_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isNavCompact]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = isNavCompact ? 60 : 80;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      scrollTargetRef.current = id;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  }, [isNavCompact]);

  const scrollToTop = useCallback(() => {
    scrollTargetRef.current = NAV_SECTIONS[0].id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clear target scrolling section on manual user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      scrollTargetRef.current = null;
    };
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });
    window.addEventListener('mousedown', handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      window.removeEventListener('mousedown', handleUserInteraction);
    };
  }, []);

  // Go to previous section
  const goToPrevSection = useCallback(() => {
    const positions = getSectionPositions();
    if (positions.length === 0) return;

    let refY = window.scrollY;
    if (scrollTargetRef.current) {
      const targetPos = positions.find(p => p.id === scrollTargetRef.current);
      if (targetPos) {
        refY = targetPos.top;
      }
    }

    const sorted = [...positions].sort((a, b) => a.top - b.top);
    const prev = [...sorted].reverse().find(p => p.top < refY - 10);

    if (prev) {
      scrollTo(prev.id);
    } else {
      scrollToTop();
    }
  }, [getSectionPositions, scrollTo, scrollToTop]);

  // Go to next section
  const goToNextSection = useCallback(() => {
    const positions = getSectionPositions();
    if (positions.length === 0) return;

    let refY = window.scrollY;
    if (scrollTargetRef.current) {
      const targetPos = positions.find(p => p.id === scrollTargetRef.current);
      if (targetPos) {
        refY = targetPos.top;
      }
    }

    const sorted = [...positions].sort((a, b) => a.top - b.top);
    const next = sorted.find(p => p.top > refY + 10);

    if (next) {
      scrollTo(next.id);
    }
  }, [getSectionPositions, scrollTo]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        activeEl?.hasAttribute('contenteditable') ||
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
        return;
      }

      // Throttle keypresses to 250ms
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 250) {
        e.preventDefault();
        return;
      }
      lastScrollTimeRef.current = now;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextSection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevSection, goToNextSection]);

  return (
    <>
      {/* ── Fixed Top-Right Floating Action Pill (Visible when NOT scrolled) ── */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 flex items-center gap-2",
              isMobile ? "top-3 right-3" : "top-4 right-4 sm:top-5 sm:right-6"
            )}
          >
            {/* EcoApp MVP Button (Desktop & Tablet) */}
            {!isMobile && (
              <button
                onClick={() => navigate('/')}
                className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-3 h-8 rounded-lg text-[11px] font-bold transition-all shadow-lg hover:shadow-emerald-500/20 backdrop-blur-md border border-emerald-400/30 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95"
              >
                <Smartphone className="h-3.5 w-3.5" />
                EcoApp MVP
              </button>
            )}

            {/* Dedicated Dark Mode Language Switcher */}
            <LanguageSwitcher darkMode={true} compact={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky Top Navigation Bar (Visible when Scrolled) ── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: isScrolled ? 0 : -80 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="bg-gray-950/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className={cn("max-w-7xl mx-auto flex items-center justify-between", isNavCompact ? "px-3 py-2" : "px-5 py-2.5")}>
            {/* Logo */}
            <button onClick={scrollToTop} className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
              <img src="/logo.webp" alt="ZAMINAT.eco" className="h-7 w-7 rounded-lg shadow-sm" />
              <span className={cn("font-bold text-white/90 tracking-tight", isNavCompact ? "text-sm" : "text-base")}>ZAMINAT.eco</span>
            </button>

            {/* Desktop Section Links */}
            {!isNavCompact && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
                  {NAV_SECTIONS.map(s => {
                    const isActive = activeSection === s.id;
                    const displayLabel = t(s.labelKey);
                    return (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap",
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}
                </div>

                {/* EcoApp MVP Button */}
                <button
                  onClick={() => navigate('/')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 h-8 rounded-lg text-[11px] font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  EcoApp MVP
                </button>

                {/* Language Switcher inside sticky nav */}
                <div className="flex-shrink-0">
                  <LanguageSwitcher darkMode={true} compact={true} />
                </div>
              </div>
            )}

            {/* Mobile/Compact Actions (Language Switcher + Hamburger) */}
            {isNavCompact && (
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <LanguageSwitcher darkMode={true} compact={true} />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            )}
          </div>

          {/* Mobile/Compact Dropdown Menu */}
          {isNavCompact && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 bg-gray-950/95 backdrop-blur-xl"
            >
              <div className="px-3 py-2 grid grid-cols-2 gap-1">
                {NAV_SECTIONS.map(s => {
                  const isActive = activeSection === s.id;
                  const displayLabel = t(s.labelKey);
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {displayLabel}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Smartphone className="h-4 w-4" />
                  EcoApp MVP
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Scroll-to-top FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isScrolled ? 1 : 0, scale: isScrolled ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        className={cn(
          "fixed z-40 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all",
          isMobile ? "bottom-4 right-4 p-2.5" : "bottom-6 right-6 p-3"
        )}
        style={{ pointerEvents: isScrolled ? 'auto' : 'none' }}
      >
        <ArrowUp className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
      </motion.button>
    </>
  );
}

/* ────────────────────────────── Main Component ────────────────────────────── */

export default function Pitch() {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation(['translation', 'shop', 'team']);
  const navigate = useNavigate();
  const phoneZoneRef = useRef<HTMLDivElement>(null);
  const slideStartRef = useRef<HTMLDivElement>(null);
  const slideEndRef = useRef<HTMLDivElement>(null);

  // Helper to get array translations safely
  const getArray = (key: string, defaultVal: string[]): string[] => {
    const val = t(key, { returnObjects: true });
    return Array.isArray(val) ? (val as string[]) : defaultVal;
  };

  // Helper to format price based on language
  const formatPrice = (price: string, lang: string) => {
    if (price === 'Custom') {
      if (lang === 'ru') return 'Индивидуально';
      if (lang === 'uz') return 'Buyurtma asosida';
      return 'Custom';
    }
    const matches = price.replace(/,/g, '').match(/^(\d+)\s*UZS\s*\/?(.*)$/);
    if (matches) {
      const num = parseInt(matches[1], 10);
      const unit = matches[2];
      
      let formattedNum = num.toLocaleString('en-US');
      if (lang === 'ru' || lang === 'uz') {
        formattedNum = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }
      
      let formattedUnit = '';
      if (unit === 'm²') {
        formattedUnit = lang === 'ru' ? 'сум/м²' : lang === 'uz' ? "so'm/m²" : 'UZS/m²';
      } else if (unit === 'pc') {
        formattedUnit = lang === 'ru' ? 'сум/шт' : lang === 'uz' ? "so'm/dona" : 'UZS/pc';
      } else {
        formattedUnit = lang === 'ru' ? 'сум' : lang === 'uz' ? "so'm" : 'UZS';
      }
      
      return `${formattedNum} ${formattedUnit}`;
    }
    return price;
  };

  const getProductSlug = (name: string): string => {
    const map: Record<string, string> = {
      'EPDM-free Tiles': 'epdm-free-tiles',
      'EPDM Rubber Tiles': 'epdm-rubber-ecotiles',
      'EcoBrick': 'ecobrick',
      'Eco Bench': 'eco-bench',
      'Garden Planter': 'garden-planter',
      'ECOBIKE RACK': 'ecobike-rack',
      'Waste Bin': 'waste-bin',
      'Eco-friendly Business Cards': 'eco-friendly-business-cards',
      'ECOBUSSTOP': 'ecobusstop',
      'Art Tiles': 'playground-block-art-tiles',
      'Ecostreet Furniture': 'ecostreet-furniture',
    };
    return map[name] || name.toLowerCase().replace(/\s+/g, '-');
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pilotSku': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pilotReady': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'demo': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'roadmap': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusKeys: Record<string, string> = {
      'pilotSku': 'pitch.catalog.status.pilotSku',
      'pilotReady': 'pitch.catalog.status.pilotReady',
      'demo': 'pitch.catalog.status.demo',
      'roadmap': 'pitch.catalog.status.roadmap',
    };
    const key = statusKeys[status];
    return key ? t(key) : status;
  };

  const stats = useMemo(() => [
    { 
      value: i18n.language === 'ru' ? '15,1 млн+' : i18n.language === 'uz' ? '15.1 mln+' : '15.1M+', 
      unit: t('pitch.stats.tonsYear'), 
      label: t('pitch.stats.wasteUz'), 
      icon: Recycle 
    },
    { 
      value: i18n.language === 'ru' ? '1,5–2,2 млн' : i18n.language === 'uz' ? '1.5–2.2 mln' : '1.5–2.2M', 
      unit: t('pitch.stats.tons'), 
      label: t('pitch.stats.plasticStream'), 
      icon: Target 
    },
    { 
      value: '11.2% / 17%', 
      unit: t('pitch.stats.recycling'), 
      label: t('pitch.stats.recyclingRate'), 
      icon: Globe 
    },
    { 
      value: i18n.language === 'ru' ? '$83 млн' : i18n.language === 'uz' ? '$83 mln' : '$83M', 
      unit: t('pitch.stats.uzs'), 
      label: t('pitch.stats.unrealizedValue'), 
      icon: TrendingUp 
    },
  ], [t, i18n.language]);

  const pillars = useMemo(() => [
    { title: t('pitch.solution.pillars.physical.title'), subtitle: t('pitch.solution.pillars.physical.subtitle'), desc: t('pitch.solution.pillars.physical.desc'), icon: Package, color: 'emerald' },
    { title: t('pitch.solution.pillars.digital.title'), subtitle: t('pitch.solution.pillars.digital.subtitle'), desc: t('pitch.solution.pillars.digital.desc'), icon: Smartphone, color: 'teal' },
    { title: t('pitch.solution.pillars.education.title'), subtitle: t('pitch.solution.pillars.education.subtitle'), desc: t('pitch.solution.pillars.education.desc'), icon: Heart, color: 'green' },
  ], [t, i18n.language]);

  const translateProduct = (p: { name: string; image: string; material: string; price: string; status: string; rawName: string }) => {
    const productKeys: Record<string, string> = {
      'EPDM-free Tiles': 'products.epdmFreeTiles.name',
      'EPDM Rubber Tiles': 'products.epdmRubberEcotiles.name',
      'EcoBrick': 'products.ecoBrick.name',
      'Eco Bench': 'products.ecoBench.name',
      'Garden Planter': 'products.gardenPlanter.name',
      'ECOBIKE RACK': 'products.ecobikeRack.name',
      'Waste Bin': 'products.wasteBin.name',
      'ECOBUSSTOP': 'products.ecobusStop.name',
      'Art Tiles': 'products.playgroundBlock.name',
      'Ecostreet Furniture': 'products.ecostreetFurniture.name',
      'Eco-friendly Business Cards': 'products.businessCards.name',
    };
    const materialKeys: Record<string, string> = {
      'Recycled Rubber': 'pitch.catalog.materials.rubber',
      'EPDM + Rubber': 'pitch.catalog.materials.epdm',
      'Recycled Plastic': 'pitch.catalog.materials.plastic',
      'Recycled Materials': 'pitch.catalog.materials.composite',
    };
    const nameKey = productKeys[p.rawName];
    const name = nameKey ? t(nameKey, { ns: 'shop' }) : p.name;
    const matKey = materialKeys[p.material];
    const material = matKey ? t(matKey) : p.material;
    const price = formatPrice(p.price, i18n.language);
    const statusLabel = getStatusLabel(p.status);
    return { ...p, name, material, price, statusLabel };
  };

  const phase1Products = useMemo(() => PRODUCTS_PHASE1.map(translateProduct), [t, i18n.language]);
  const phase2Products = useMemo(() => PRODUCTS_PHASE2.map(translateProduct), [t, i18n.language]);

  const revenueChannels = useMemo(() => [
    { name: t('pitch.business.channels.b2g.name'), desc: t('pitch.business.channels.b2g.desc'), icon: Landmark },
    { name: t('pitch.business.channels.b2b.name'), desc: t('pitch.business.channels.b2b.desc'), icon: Building2 },
    { name: t('pitch.business.channels.b2c.name'), desc: t('pitch.business.channels.b2c.desc'), icon: Package },
    { name: t('pitch.business.channels.corporate.name'), desc: t('pitch.business.channels.corporate.desc'), icon: Briefcase },
    { name: t('pitch.business.channels.social.name'), desc: t('pitch.business.channels.social.desc'), icon: Heart },
    { name: t('pitch.business.channels.franchise.name'), desc: t('pitch.business.channels.franchise.desc'), icon: Globe },
  ], [t, i18n.language]);

  const marketDetails = useMemo(() => [
    { label: t('pitch.business.market.tam.label'), value: t('pitch.business.market.tam.value'), desc: t('pitch.business.market.tam.desc') },
    { label: t('pitch.business.market.sam.label'), value: t('pitch.business.market.sam.value'), desc: t('pitch.business.market.sam.desc') },
    { label: t('pitch.business.market.launchSom.label'), value: t('pitch.business.market.launchSom.value'), desc: t('pitch.business.market.launchSom.desc') },
    { label: t('pitch.business.market.pilotSom.label'), value: t('pitch.business.market.pilotSom.value'), desc: t('pitch.business.market.pilotSom.desc') },
  ], [t, i18n.language]);

  const businessMetrics = useMemo(() => [
    { label: t('pitch.business.metrics.grossMargin'), value: '45%+' },
    { label: t('pitch.business.metrics.breakeven'), value: '2028' },
    { label: t('pitch.business.metrics.roi'), value: '124–152%' },
  ], [t, i18n.language]);

  const roadmap = useMemo(() => [
    { year: '2026', title: t('pitch.roadmap.y2026.title'), items: getArray('pitch.roadmap.y2026.items', ['First pilot production line', 'Target: 10 pilot customers', 'EcoApp MVP launch', 'Target: 3 EcoKids pilot schools']) },
    { year: '2027', title: t('pitch.roadmap.y2027.title'), items: getArray('pitch.roadmap.y2027.items', ['Target: 500 t/year production', 'Tashkent pilot city contracts', 'Target: 5,000 EcoApp users', 'Target: 10 schools enrolled']) },
    { year: '2028', title: t('pitch.roadmap.y2028.title'), items: getArray('pitch.roadmap.y2028.items', ['Target: 2,000 t/year capacity', 'Target: break-even achieved', 'Regional expansion pilot', 'National partnerships']) },
    { year: '2029', title: t('pitch.roadmap.y2029.title'), items: getArray('pitch.roadmap.y2029.items', ['Multi-city operations', 'Central Asia market entry', 'Platform licensing', 'Target net profit scenario: $183K/year']) },
  ], [t, i18n.language]);

  const tractionStage = useMemo(() => ({
    title: t('pitch.traction.stage.title'),
    desc: t('pitch.traction.stage.desc'),
  }), [t, i18n.language]);

  const tractionPillars = useMemo(() => [
    {
      title: t('pitch.traction.pillars.legal.title'),
      items: getArray('pitch.traction.pillars.legal.items', [
        "MChJ officially registered",
        "Trademark application filed",
        "Brand identity and positioning developed",
        "Official communication channels launched",
        "Founder-led setup with lean project support team"
      ])
    },
    {
      title: t('pitch.traction.pillars.accelerator.title'),
      items: getArray('pitch.traction.pillars.accelerator.items', [
        "Green-tech acceleration completed at U-ENTER",
        "Investor pitch strategy prepared",
        "Website-based pitch format prepared",
        "QR investor access prepared",
        "Business model clarified: production + digital transparency + education + public impact"
      ])
    },
    {
      title: t('pitch.traction.pillars.product.title'),
      items: getArray('pitch.traction.pillars.product.items', [
        "Product categories defined: EcoTiles, safety tiles, EcoCurbs, EcoFurniture, Art Tiles",
        "Product formulas prepared",
        "SKU structure prepared",
        "SKU calculator and unit economics prepared",
        "Target product indicators prepared for pilot validation",
        "Priority SKUs identified for pilot production"
      ]),
      note: t('pitch.traction.pillars.product.note')
    },
    {
      title: t('pitch.traction.pillars.sourcing.title'),
      items: getArray('pitch.traction.pillars.sourcing.items', [
        "Industry consultations completed",
        "Field visits completed",
        "Practical recommendations received",
        "Preliminary rubber-waste supply discussions started with small enterprises",
        "Tire and plastic sourcing logic prepared for pilot launch"
      ])
    },
    {
      title: t('pitch.traction.pillars.facility.title'),
      items: getArray('pitch.traction.pillars.facility.items', [
        "Lean pilot production workshop strategy prepared",
        "Facility partnership model prepared",
        "Site requirements identified: electricity, ventilation, truck access, storage and equipment space",
        "Strategy avoids building a factory from scratch in phase one",
        "Production launch roadmap prepared"
      ])
    },
    {
      title: t('pitch.traction.pillars.digital.title'),
      items: getArray('pitch.traction.pillars.digital.items', [
        "Web MVP and investor pitch-demo route prepared",
        "EcoApp concept prepared",
        "EcoKids concept prepared",
        "EcoMap, EcoVote, EcoActions, EcoWallet and Impact Dashboard logic prepared",
        "Digital transparency and education model developed"
      ])
    },
    {
      title: t('pitch.traction.pillars.investment.title'),
      items: getArray('pitch.traction.pillars.investment.items', [
        "$400K pre-seed ask structured",
        "Base offer prepared: $400K for 20% equity",
        "Strategic launch partner model prepared: cash + facility access up to 25%",
        "Facility-only partner model prepared: 3–5% equity or revenue-share",
        "Use of funds updated for equipment, facility adaptation, raw materials, testing, digital platform and demo projects"
      ])
    }
  ], [t, i18n.language]);

  const nextMilestone = useMemo(() => ({
    title: t('pitch.traction.nextMilestone.title'),
    subtitle: t('pitch.traction.nextMilestone.subtitle'),
    items: getArray('pitch.traction.nextMilestone.items', [
      "Secure industrial facility or site partner",
      "Finalize equipment suppliers",
      "Formalize raw material supply agreements",
      "Launch pilot production",
      "Begin testing and certification roadmap",
      "Produce first demo objects",
      "Start first B2B/B2G sales conversations"
    ])
  }), [t, i18n.language]);

  const team = useMemo(() => [
    { 
      name: t('team.members.sukhrobjon.name', { ns: 'team' }), 
      role: t('team.members.sukhrobjon.position', { ns: 'team' }), 
      focus: t('team.members.sukhrobjon.description', { ns: 'team' }), 
      photo: sukhrobjonPhoto 
    },
    { 
      name: t('team.members.azamat.name', { ns: 'team' }), 
      role: t('team.members.azamat.position', { ns: 'team' }), 
      focus: t('team.members.azamat.description', { ns: 'team' }), 
      photo: azamatPhoto 
    },
    { 
      name: t('team.members.khondamir.name', { ns: 'team' }), 
      role: t('team.members.khondamir.position', { ns: 'team' }), 
      focus: t('team.members.khondamir.description', { ns: 'team' }), 
      photo: khondamirPhoto 
    },
    { 
      name: t('team.members.islombek.name', { ns: 'team' }), 
      role: t('team.members.islombek.position', { ns: 'team' }), 
      focus: t('team.members.islombek.description', { ns: 'team' }), 
      photo: jahongirPhoto 
    },
  ], [t, i18n.language]);

  const solutionTitleParts = t('pitch.solution.title').split('. ');
  const catalogTitleParts = t('pitch.catalog.title').split('. ');
  const businessTitleParts = t('pitch.business.title').split('. ');
  const problemTitleParts = t('pitch.problem.title').split('. ');
  const teamTitleParts = t('pitch.team.title').split('. ');

  const renderProductCard = (p: ReturnType<typeof translateProduct>, i: number) => (
    <motion.div key={i} variants={fadeUp}>
      <Card 
        onClick={() => navigate(`/product/${getProductSlug(p.rawName)}`)}
        className="h-full overflow-hidden border-gray-200/60 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-emerald-300 bg-white"
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
        <CardContent className={cn("text-center", isMobile ? "p-2" : "p-3.5")}>
          <h4 className={cn("font-bold text-gray-900 leading-tight transition-colors group-hover:text-emerald-600", isMobile ? "text-[11px]" : "text-xs")}>
            {p.name}
          </h4>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Layout title={t('pitch.title')} hideBottomNav hideLanguageSwitcher>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/10">

        {/* ═══════ PITCH NAVIGATION BAR ═══════ */}
        <PitchNavBar isMobile={isMobile} t={t} />

        {/* ═══════ SECTION 1: Hero ═══════ */}
        <section
          id="pitch-hero"
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat text-white"
          style={{ backgroundImage: "url('/images/pitch-hero-bg.avif')" }}
        >
          <div className="absolute inset-0 bg-emerald-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className={cn("relative z-10 max-w-5xl mx-auto text-center", isMobile ? "px-4 py-12" : "px-6 py-20")}
          >
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
              <img src="/logo.webp" alt="ZAMINAT.eco" className="h-11 w-11 rounded-xl shadow-lg" />
              <span className="text-2xl font-black tracking-tight">ZAMINAT.eco</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className={cn("font-black leading-tight", isMobile ? "text-3xl" : "text-5xl lg:text-6xl")}>
              {t('pitch.hero.title').split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <br />}
                  {idx > 0 ? <span className="text-yellow-300">{line}</span> : line}
                </React.Fragment>
              ))}
            </motion.h1>

            <motion.p variants={fadeUp} className={cn("mx-auto mt-4 opacity-90 leading-relaxed", isMobile ? "text-sm max-w-md" : "text-lg max-w-2xl")}>
              {t('pitch.hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[t('pitch.hero.location'), t('pitch.hero.stage'), t('pitch.hero.established'), t('pitch.hero.aiPowered')].map(tag => (
                <Badge key={tag} className="bg-white/15 text-white border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                  {tag}
                </Badge>
              ))}
            </motion.div>

            {/* Transformation Chain */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-1 mt-8">
              {[
                t('pitch.chain.waste'),
                t('pitch.chain.material'),
                t('pitch.chain.ai'),
                t('pitch.chain.product'),
                t('pitch.chain.revenue'),
                t('pitch.chain.impact')
              ].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs font-bold">
                    {step}
                  </span>
                  {i < 5 && <ChevronRight className="h-4 w-4 opacity-40" />}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Founder-Led Mission Card */}
            <motion.div variants={fadeUp} className="mt-8 max-w-2xl mx-auto">
              <div className="bg-white/10 border border-white/15 rounded-2xl backdrop-blur-sm p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">{t('pitch.hero.founderMission')}</span>
                </div>
                <p className={cn("text-white/90 leading-relaxed italic", isMobile ? "text-xs" : "text-sm")}>
                  "{t('pitch.hero.founderMissionText')}"
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ FOUNDING TEAM — Placed right after Hero ═══════ */}
        <div className={cn("max-w-6xl mx-auto", isMobile ? "px-3 py-8" : "px-6 py-14")}>
          <motion.section id="pitch-team" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.team.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {teamTitleParts[0]}
                </span>
                {teamTitleParts[1] && (
                  <>
                    .<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 font-extrabold">
                      {teamTitleParts[1]}
                    </span>
                  </>
                )}
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4")}>
              {team.map((member, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full text-center border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                      <img
                        src={member.photo}
                        alt={member.name}
                        className={cn("mx-auto rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-gray-100", isMobile ? "w-24 h-24 mb-3" : "w-32 h-32 mb-4")}
                        loading="lazy"
                      />
                      <h4 className={cn("font-bold text-gray-900", isMobile ? "text-sm" : "text-base")}>{member.name}</h4>
                      <div className={cn("text-emerald-600 font-semibold mt-0.5", isMobile ? "text-xs" : "text-sm")}>{member.role}</div>
                      <div className={cn("text-gray-500 mt-1", isMobile ? "text-[10px]" : "text-xs")}>{member.focus}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className={cn("max-w-6xl mx-auto", isMobile ? "px-3 space-y-10 py-8" : "px-6 space-y-16 py-14")}>

          {/* ═══════ SECTION 2: The Problem / Opportunity ═══════ */}
          <motion.section id="pitch-opportunity" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.problem.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {problemTitleParts[0]}
                </span>
                {problemTitleParts[1] && (
                  <>
                    .<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500 font-extrabold">
                      {problemTitleParts[1]}
                    </span>
                  </>
                )}
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-4")}>
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="text-center h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn(isMobile ? "p-3" : "p-5")}>
                      <stat.icon className={cn("mx-auto mb-2 text-emerald-500", isMobile ? "h-5 w-5" : "h-7 w-7")} />
                      <div className={cn("font-black text-emerald-600", isMobile ? "text-xl" : "text-2xl")}>{stat.value}</div>
                      {stat.unit && <div className="text-xs font-semibold text-emerald-500 mt-0.5">{stat.unit}</div>}
                      <div className={cn("text-gray-500 mt-1", isMobile ? "text-[10px]" : "text-xs")}>{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Source note */}
            <motion.p variants={fadeUp} className="text-center text-gray-400 text-[10px] mt-3 italic max-w-2xl mx-auto">
              {t('pitch.problem.sourceNote')}
            </motion.p>

            {/* Policy Tailwind */}
            <motion.div variants={fadeUp} className="mt-6 max-w-4xl mx-auto">
              <Card className="border-emerald-200/60 shadow-md bg-gradient-to-r from-emerald-50/80 to-teal-50/60 overflow-hidden">
                <CardContent className={cn("flex flex-col md:flex-row gap-4 items-start", isMobile ? "p-4" : "p-6")}>
                  <div className="space-y-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                      {t('pitch.problem.policyTailwind.tag')}
                    </Badge>
                    <h3 className={cn("font-bold text-gray-900 leading-snug", isMobile ? "text-sm" : "text-base")}>
                      {t('pitch.problem.policyTailwind.title')}
                    </h3>
                    <p className={cn("text-gray-600 leading-relaxed", isMobile ? "text-xs" : "text-sm")}>
                      {t('pitch.problem.policyTailwind.description')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Adjacent Infrastructure Signal */}
            <motion.div variants={fadeUp} className="mt-4 max-w-4xl mx-auto">
              <div className={cn(
                "bg-amber-50/60 border border-amber-200/50 rounded-xl flex items-start gap-3",
                isMobile ? "p-3" : "p-4"
              )}>
                <div>
                  <span className={cn("font-bold text-amber-800", isMobile ? "text-xs" : "text-sm")}>
                    {t('pitch.problem.adjacentSignal.title')}:
                  </span>{' '}
                  <span className={cn("text-amber-700 leading-relaxed", isMobile ? "text-xs" : "text-sm")}>
                    {t('pitch.problem.adjacentSignal.description')}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* ═══════ PHONE SHOWCASE ZONE — Sections 3–8 with sticky phone ═══════ */}
          <div ref={phoneZoneRef} className="relative">
            <div className={cn(isMobile ? "" : "flex gap-8 items-start")}>
              {/* Left column: content sections */}
              <div className={cn(isMobile ? "w-full" : "flex-1 min-w-0", isMobile ? "space-y-10" : "space-y-16")}>

          {/* Marker: slideshow tracking starts here (Solution top) */}
          <div ref={slideStartRef} />

          {/* ═══════ SECTION 3: Our Solution ═══════ */}
          <motion.section id="pitch-solution" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.solution.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {solutionTitleParts[0]}
                </span>
                {solutionTitleParts[1] && (
                  <>
                    .{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 font-extrabold">
                      {solutionTitleParts[1]}
                    </span>
                  </>
                )}
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
              {pillars.map((pillar, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className={cn("h-full border-gray-200/60 shadow-sm hover:shadow-lg transition-all group", isMobile ? "" : "hover:-translate-y-1")}>
                    <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                      <div className={cn(
                        "p-2.5 rounded-xl w-fit mb-3",
                        pillar.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                        pillar.color === 'teal' && "bg-teal-50 text-teal-600",
                        pillar.color === 'green' && "bg-green-50 text-green-600",
                        "group-hover:scale-105 transition-transform"
                      )}>
                        <pillar.icon className="h-6 w-6" />
                      </div>
                      <h3 className={cn("font-bold text-gray-900 mb-1", isMobile ? "text-base" : "text-lg")}>{pillar.title}</h3>
                      <div className={cn("text-emerald-600 font-semibold mb-2", isMobile ? "text-[11px]" : "text-xs")}>{pillar.subtitle}</div>
                      <p className={cn("text-gray-600 leading-relaxed", isMobile ? "text-xs" : "text-sm")}>{pillar.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ AI-POWERED INFRASTRUCTURE SECTION ═══════ */}
          <motion.section 
            id="pitch-ai" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-80px" }} 
            variants={stagger}
            className="scroll-mt-20 space-y-8"
          >
            <motion.div variants={fadeUp} className="text-center mb-6">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                {t('ai.tag')}
              </Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {t('ai.pitchTitle')}
                </span>
              </h2>
              <p className={cn("mx-auto mt-3 text-gray-600 leading-relaxed max-w-3xl", isMobile ? "text-xs px-2" : "text-sm")}>
                {t('ai.pitchSubtitle')}
              </p>
            </motion.div>

            {/* ─── AI Technology Stack Overview (Investor View) ─── */}
            <motion.div variants={fadeUp} className="bg-white/50 border border-slate-200/40 rounded-3xl p-5 sm:p-8 shadow-lg backdrop-blur-md space-y-6">
              
              {/* Key Metrics Bar */}
              <div className={cn("grid gap-3 text-center", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {[
                  { value: '2 Live + 4', labelKey: 'ai.metrics.modules', subKey: 'ai.metrics.modulesSub' },
                  { value: '3', labelKey: 'ai.metrics.languages', subKey: 'ai.metrics.languagesSub' },
                  { value: 'Gemini 3.1', labelKey: 'ai.metrics.processing', subKey: 'ai.metrics.processingSub' },
                  { value: '95%+', labelKey: 'ai.metrics.accuracy', subKey: 'ai.metrics.accuracySub' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-100/50 rounded-2xl p-3 sm:p-4">
                    <div className="text-lg sm:text-xl font-black text-emerald-700">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-800 mt-0.5">{t(stat.labelKey)}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{t(stat.subKey)}</div>
                  </div>
                ))}
              </div>

              {/* 6 AI Modules Grid — investor-style tech cards */}
              <div>
                <h3 className={cn("font-extrabold text-gray-900 mb-4", isMobile ? "text-base" : "text-lg")}>
                  {t('ai.modulesTitle')}
                </h3>
                <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                  {[
                    { icon: Camera, titleKey: 'ai.features.ecoscan.title', descKey: 'ai.pitchModules.ecoscan.desc', status: 'Live', color: 'green' },
                    { icon: MessageSquare, titleKey: 'ai.features.ecocoach.title', descKey: 'ai.pitchModules.ecocoach.desc', status: 'Live', color: 'green' },
                    { icon: Cpu, titleKey: 'ai.features.impact.title', descKey: 'ai.pitchModules.impact.desc', status: 'Prototype', color: 'emerald' },
                    { icon: ShieldCheck, titleKey: 'ai.features.fraud.title', descKey: 'ai.pitchModules.fraud.desc', status: 'Upcoming', color: 'amber' },
                    { icon: Smile, titleKey: 'ai.features.kids.title', descKey: 'ai.pitchModules.kids.desc', status: 'Design', color: 'violet' },
                    { icon: Factory, titleKey: 'ai.features.planner.title', descKey: 'ai.pitchModules.planner.desc', status: 'Planned', color: 'slate' },
                  ].map((module, idx) => {
                    const statusColors: Record<string, string> = {
                      'Live': 'bg-green-600',
                      'Prototype': 'bg-emerald-500',
                      'Concept': 'bg-blue-500',
                      'Upcoming': 'bg-amber-500',
                      'Design': 'bg-violet-500',
                      'Planned': 'bg-slate-400',
                    };
                    return (
                    <div 
                      key={idx} 
                      className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      {/* Decorative top accent line */}
                      <div className={cn("absolute top-0 left-0 right-0 h-[2px]", statusColors[module.status] || 'bg-slate-300')} />
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                            <module.icon className="h-5 w-5 stroke-[2]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-gray-900 leading-tight">{t(module.titleKey)}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("h-1.5 w-1.5 rounded-full", statusColors[module.status] || 'bg-slate-300')} />
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{module.status}</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-500 leading-relaxed">{t(module.descKey)}</p>
                    </div>
                  )})}
                </div>
              </div>

              {/* Competitive Moat */}
              <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-4 sm:p-6 text-white">
                <h4 className={cn("font-extrabold mb-3", isMobile ? "text-sm" : "text-base")}>{t('ai.moat.title')}</h4>
                <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                  {[
                    { titleKey: 'ai.moat.data', descKey: 'ai.moat.dataDesc' },
                    { titleKey: 'ai.moat.local', descKey: 'ai.moat.localDesc' },
                    { titleKey: 'ai.moat.network', descKey: 'ai.moat.networkDesc' },
                    { titleKey: 'ai.moat.lockin', descKey: 'ai.moat.lockinDesc' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-white/90">{t(item.titleKey)}</span>
                        <p className="text-[11px] text-white/60 leading-snug mt-0.5">{t(item.descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 3-Column Investor Layer Explanation via interactive Tabs */}
            <motion.div variants={fadeUp}>
              <AIEcosystemTabs />
            </motion.div>

            {/* Workflow Diagram */}
            <motion.div variants={fadeUp} className="bg-white/40 border border-slate-200/40 rounded-3xl p-4 sm:p-6 shadow-lg backdrop-blur-md">
              <div className="text-center mb-4">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block">{t('ai.workflow.lifecycleTitle')}</span>
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900">{t('ai.workflow.lifecycleSubtitle')}</h4>
              </div>
              <AIWorkflowDiagram />
            </motion.div>
          </motion.section>

          {/* Mobile: Phone carousel after Solution/AI */}
          {isMobile && <FloatingPhoneShowcase scrollRef={phoneZoneRef} slideStartRef={slideStartRef} slideEndRef={slideEndRef} />}

          {/* ═══════ SECTION 4: Product Portfolio ═══════ */}
          <motion.section id="pitch-products" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.catalog.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {catalogTitleParts[0]}
                </span>
                {catalogTitleParts[1] && (
                  <>
                    .{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500 font-extrabold">
                      {catalogTitleParts[1]}
                    </span>
                  </>
                )}
              </h2>
            </motion.div>

            {/* Phase 1 */}
            <div className="mb-6">
              <h3 className={cn("font-bold text-gray-800 border-l-4 border-emerald-500 pl-3 mb-4", isMobile ? "text-sm" : "text-base")}>
                {t('pitch.catalog.phase1Title')}
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {phase1Products.map((p, i) => renderProductCard(p, i))}
              </div>
            </div>

            {/* Phase 2 */}
            <div>
              <h3 className={cn("font-bold text-gray-800 border-l-4 border-sky-500 pl-3 mb-4", isMobile ? "text-sm" : "text-base")}>
                {t('pitch.catalog.phase2Title')}
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {phase2Products.map((p, i) => renderProductCard(p, i + phase1Products.length))}
              </div>
            </div>
          </motion.section>


          {/* ═══════ SECTION 5: Business Model ═══════ */}
          <motion.section id="pitch-business" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.business.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {businessTitleParts[0]}
                </span>
                {businessTitleParts[1] && (
                  <>
                    .{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 font-extrabold">
                      {businessTitleParts[1]}
                    </span>
                  </>
                )}
              </h2>
            </motion.div>

            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              {revenueChannels.map((ch, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn("flex items-start gap-3", isMobile ? "p-3" : "p-4")}>
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                        <ch.icon className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-gray-900", isMobile ? "text-xs" : "text-sm")}>{ch.name}</h4>
                        <p className={cn("text-gray-500 leading-relaxed mt-0.5", isMobile ? "text-[10px]" : "text-xs")}>{ch.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Market Size Section */}
            <div id="pitch-business-market" className="mt-8 space-y-4">
              <h3 className={cn("font-bold text-gray-900 border-l-4 border-emerald-500 pl-3", isMobile ? "text-base" : "text-lg")}>
                {t('pitch.business.market.title')}
              </h3>
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                {marketDetails.map((item, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/5">
                      <CardContent className={cn("flex flex-col justify-between h-full", isMobile ? "p-4" : "p-5")}>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                            {item.label}
                          </span>
                          <div className={cn("font-black text-gray-900 tracking-tight whitespace-nowrap", isMobile ? "text-xl" : "text-2xl md:text-3xl")}>
                            {item.value}
                          </div>
                        </div>
                        <p className={cn("text-gray-500 mt-2 leading-relaxed border-t border-gray-100 pt-3 break-words", isMobile ? "text-[11px]" : "text-xs")}>
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {/* Market note */}
              <p className="text-center text-gray-400 text-[10px] italic max-w-2xl mx-auto">
                {t('pitch.business.market.note')}
              </p>
            </div>

            {/* Key Financial Metrics */}
            <div className="mt-8 space-y-4">
              <h3 className={cn("font-bold text-gray-900 border-l-4 border-emerald-500 pl-3", isMobile ? "text-base" : "text-lg")}>
                {t('pitch.business.tag')} — {t('pitch.business.keyMetricsLabel', { defaultValue: 'Key Metrics' })}
              </h3>
              <motion.div variants={fadeUp} className={cn("grid gap-4", isMobile ? "grid-cols-3" : "grid-cols-3 max-w-2xl")}>
                {businessMetrics.map((m, i) => (
                  <Card key={i} className="text-center border-gray-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50">
                    <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                      <div className={cn("font-black text-emerald-600", isMobile ? "text-base" : "text-xl")}>{m.value}</div>
                      <div className={cn("text-gray-500 mt-1 font-semibold", isMobile ? "text-[9px]" : "text-xs")}>{m.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </motion.section>


          {/* ═══════ SECTION 6: Roadmap ═══════ */}
          <motion.section id="pitch-roadmap" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.roadmap.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {t('pitch.roadmap.title')}
                </span>
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-2")}>
              {roadmap.map((yr, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm">
                    <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                      <div className={cn("font-black text-emerald-600 mb-1", isMobile ? "text-xl" : "text-2xl")}>{yr.year}</div>
                      <div className={cn("font-bold text-gray-900 mb-2", isMobile ? "text-xs" : "text-sm")}>{yr.title}</div>
                      <ul className="space-y-1">
                        {yr.items.map((item, j) => (
                          <li key={j} className={cn("flex items-start gap-1.5 text-gray-600 break-words", isMobile ? "text-[10px]" : "text-xs")}>
                            <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>



          {/* ═══════ SECTION 7: Traction ═══════ */}
          <motion.section id="pitch-traction" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 mb-3 tracking-widest uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{t('pitch.traction.tag')}</Badge>
              <h2 className={cn("font-black tracking-tight leading-tight text-gray-900", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 via-slate-800 to-gray-900">
                  {t('pitch.traction.title')}
                </span>
              </h2>
              {t('pitch.traction.subtitle') && (
                <p className={cn("mx-auto mt-3 text-gray-600 leading-relaxed max-w-3xl", isMobile ? "text-xs px-2" : "text-sm")}>
                  {t('pitch.traction.subtitle')}
                </p>
              )}
              
              {/* Stage Banner */}
              <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-emerald-800 text-left max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex-shrink-0">
                  {t('pitch.hero.stage')}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-gray-900">{tractionStage.title}</h4>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    {tractionStage.desc}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Structured Pillars Grid */}
            <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-2")}>
              {tractionPillars.map((pillar, idx) => {
                const isInvestment = idx === 6;
                const cleanTitle = pillar.title.replace(/^\d+\.\s*/, '');
                return (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    className={cn(isInvestment ? "md:col-span-2" : "")}
                  >
                    <Card
                      className={cn(
                        "h-full border-gray-200/60 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between group",
                        isInvestment
                          ? "bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/20 text-white shadow-md hover:shadow-xl hover:border-emerald-500/40"
                          : "bg-white hover:shadow-md hover:border-emerald-200/80"
                      )}
                    >
                      {/* Top Accent line */}
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-[3px]",
                        isInvestment ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" : "bg-emerald-500/20 group-hover:bg-emerald-500/60 transition-colors duration-300"
                      )} />

                      {/* Subtly colored watermark number in background */}
                      <div className={cn(
                        "absolute right-4 top-4 text-7xl font-black select-none pointer-events-none transition-transform duration-500 group-hover:scale-105",
                        isInvestment ? "text-emerald-400/5" : "text-gray-900/5 group-hover:text-emerald-500/5"
                      )}>
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <CardContent className={cn("flex flex-col justify-between h-full relative z-10", isMobile ? "p-4" : "p-6")}>
                        <div>
                          {/* Card Header with custom index pill badge */}
                          <div className={cn(
                            "flex items-center gap-3 border-b pb-3.5 mb-4",
                            isInvestment ? "border-white/10" : "border-gray-100"
                          )}>
                            <span className={cn(
                              "flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black shadow-sm shrink-0",
                              isInvestment
                                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/20"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            )}>
                              {idx + 1}
                            </span>
                            <h4 className={cn(
                              "font-black tracking-tight text-sm md:text-base leading-tight",
                              isInvestment ? "text-white" : "text-gray-900"
                            )}>
                              {cleanTitle}
                            </h4>
                          </div>

                          <ul className={cn(
                            "space-y-3",
                            isInvestment ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 space-y-0" : ""
                          )}>
                            {pillar.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-2.5">
                                <div className={cn(
                                  "rounded-full p-0.5 shrink-0 mt-0.5",
                                  isInvestment ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                                )}>
                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </div>
                                <span className={cn(
                                  "break-words font-medium",
                                  isMobile ? "text-[11px]" : "text-xs leading-relaxed",
                                  isInvestment ? "text-gray-200" : "text-gray-700"
                                )}>
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {pillar.note && (
                          <p className={cn(
                            "mt-4 pt-3 border-t italic",
                            isMobile ? "text-[9px]" : "text-[10px] leading-relaxed",
                            isInvestment ? "border-white/10 text-emerald-300/70" : "border-gray-100 text-gray-400"
                          )}>
                            {pillar.note}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Next Execution Milestone */}
            <motion.div variants={fadeUp} className="mt-8">
              <Card className="border border-emerald-500/20 shadow-lg bg-gradient-to-br from-white to-emerald-50/10 overflow-hidden">
                <CardContent className={cn("p-6 md:p-8")}>
                  <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                    <div className="space-y-2 max-w-md">
                      <div className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider w-fit">
                        {nextMilestone.title}
                      </div>
                      <h3 className={cn("font-black text-gray-900 leading-tight", isMobile ? "text-lg" : "text-xl")}>
                        {nextMilestone.subtitle}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {t('pitch.traction.nextMilestone.description', { defaultValue: "Operational roadmap for pilot launching and scaling. These milestones unlock key growth phases, product validation, and initial revenue generation." })}
                      </p>
                    </div>
                    <div className="w-full lg:max-w-2xl">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {nextMilestone.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-gray-700">
                            <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className={cn(isMobile ? "text-[11px]" : "text-xs leading-relaxed font-medium")}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
            {/* Marker: slideshow tracking ends here (Traction bottom) */}
            <div ref={slideEndRef} />

              </div>{/* End left content column */}

              {/* Right column: Desktop sticky phone */}
              {!isMobile && (
                <FloatingPhoneShowcase scrollRef={phoneZoneRef} slideStartRef={slideStartRef} slideEndRef={slideEndRef} />
              )}
            </div>{/* End flex row */}
          </div>{/* End phone showcase zone */}

          {/* ═══════ SECTION 9: Investment Ask ═══════ */}
          <motion.section id="pitch-ask" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Card 
                className="border-0 shadow-2xl text-white overflow-hidden relative bg-cover bg-center bg-no-repeat rounded-3xl"
                style={{ backgroundImage: "url('/images/pitch-ask-bg.avif')" }}
              >
                <div className="absolute inset-0 bg-emerald-950/85" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <CardContent className={cn("relative z-10 text-left", isMobile ? "p-5 pb-8" : "p-8 pb-8")}>
                  
                  {/* Badge & Title */}
                  <div className="text-center mb-5">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/15 mb-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">{t('pitch.ask.tag')}</Badge>
                    <h3 className={cn("font-black tracking-tight leading-snug max-w-2xl mx-auto text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300", isMobile ? "text-lg" : "text-xl md:text-2xl")}>
                      {t('pitch.ask.seekingTitle')}
                    </h3>
                  </div>

                  {/* Scenarios Grid */}
                  <div className={cn("grid gap-4 mb-6", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                    {/* Scenario A */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col justify-between hover:bg-white/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Landmark className="h-4 w-4 text-emerald-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{t('pitch.ask.scenarioA.title').split(' — ')[0]}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{t('pitch.ask.scenarioA.title').split(' — ')[1] || t('pitch.ask.scenarioA.title')}</h4>
                        <p className="text-xs font-extrabold text-white/95">{t('pitch.ask.scenarioA.details')}</p>
                      </div>
                      <div className="text-[10px] text-white/50 mt-3 border-t border-white/5 pt-2">
                        {t('pitch.ask.scenarioA.note')}
                      </div>
                    </div>

                    {/* Scenario B */}
                    <div className="bg-emerald-500/10 border-2 border-emerald-400/30 rounded-2xl p-4 backdrop-blur-sm flex flex-col justify-between hover:bg-emerald-500/15 transition-colors relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                        {t('pitch.ask.scenarioB.badge', { defaultValue: 'Strategic Option' })}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Building2 className="h-4 w-4 text-emerald-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{t('pitch.ask.scenarioB.title').split(' — ')[0]}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{t('pitch.ask.scenarioB.title').split(' — ')[1] || t('pitch.ask.scenarioB.title')}</h4>
                        <p className="text-xs font-extrabold text-white/95">{t('pitch.ask.scenarioB.details')}</p>
                      </div>
                      <div className="text-[10px] text-white/70 mt-3 border-t border-white/10 pt-2 leading-relaxed">
                        {t('pitch.ask.scenarioB.note')}
                      </div>
                    </div>

                    {/* Scenario C */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col justify-between hover:bg-white/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Globe className="h-4 w-4 text-emerald-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{t('pitch.ask.scenarioC.title').split(' — ')[0] || "Scenario C"}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{t('pitch.ask.scenarioC.title').split(' — ')[1] || t('pitch.ask.scenarioC.title')}</h4>
                        <p className="text-xs font-extrabold text-white/95">{t('pitch.ask.scenarioC.details')}</p>
                      </div>
                      <div className="text-[10px] text-white/50 mt-3 border-t border-white/5 pt-2 leading-relaxed">
                        {t('pitch.ask.scenarioC.note')}
                      </div>
                    </div>
                  </div>

                  {/* Mid Section: Use of Funds & Strategy & Contact */}
                  <div className={cn("grid border-t border-white/10 pt-6 gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-12")}>
                    {/* Column 1: Use of Funds (Span 5) */}
                    <div className={cn("space-y-3", isMobile ? "" : "col-span-5")}>
                      <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="h-4 w-4" />
                        {t('pitch.ask.fundsTitle')}
                      </h4>
                      {/* Visual budget split bar */}
                      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-white/10 p-0.5">
                        <div className="bg-emerald-400 rounded-full" style={{ width: '67%' }} title="Equipment (67%)" />
                        <div className="bg-teal-400 rounded-full" style={{ width: '17%' }} title="Facility Adaptation (17%)" />
                        <div className="bg-indigo-400 rounded-full" style={{ width: '9%' }} title="Digital & Marketing (9%)" />
                        <div className="bg-amber-400 rounded-full" style={{ width: '4%' }} title="Raw Materials (4%)" />
                        <div className="bg-sky-400 rounded-full" style={{ width: '3%' }} title="Certification (3%)" />
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-[11px] text-white/80">
                        {[
                          { color: 'bg-emerald-400', text: t('pitch.ask.fund1') },
                          { color: 'bg-teal-400', text: t('pitch.ask.fund2') },
                          { color: 'bg-indigo-400', text: t('pitch.ask.fund5') },
                          { color: 'bg-amber-400', text: t('pitch.ask.fund3') },
                          { color: 'bg-sky-400', text: t('pitch.ask.fund4') },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded flex-shrink-0", item.color)} />
                            <span className="font-medium truncate" title={item.text}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Facility Strategy & Partner Advantage (Span 4) */}
                    <div className={cn("space-y-3.5", isMobile ? "" : "col-span-4 border-l border-white/5 pl-6")}>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[10px] text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                          <Building2 className="h-3.5 w-3.5" />
                          {t('pitch.ask.facilityTitle')}
                        </h4>
                        <p className="text-[10px] text-white/85 leading-relaxed">
                          {t('pitch.ask.facilityDesc')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[10px] text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5" />
                          {t('pitch.ask.partnerTitle')}
                        </h4>
                        <p className="text-[10px] text-white/85 leading-relaxed">
                          {t('pitch.ask.partnerDesc')}
                        </p>
                      </div>
                    </div>

                    {/* Column 3: CTA & QR & Contact Button (Span 3) */}
                    <div className={cn("flex flex-col items-center justify-between gap-3 text-center", isMobile ? "" : "col-span-3 border-l border-white/5 pl-6")}>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest block">
                          {t('pitch.ask.ctaTitle', { defaultValue: 'ZAMINAT.eco Platform' })}
                        </span>
                        <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                          {t('pitch.ask.cta2')}
                        </h4>
                      </div>

                      {/* QR Code */}
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-xl shadow-md w-24 h-24 flex items-center justify-center flex-shrink-0 group hover:scale-105 transition-transform duration-300">
                          <img src="/images/pitch-qr.png" alt="Scan to open Pitch Deck" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left space-y-1">
                          <div className="text-[10px] text-white font-bold leading-tight">
                            {t('pitch.ask.qrLabel')}
                          </div>
                          <div className="text-[9px] text-white/50 leading-tight">
                            {t('pitch.ask.qrSublabel')}
                          </div>
                        </div>
                      </div>

                      {/* Button */}
                      <Button
                        onClick={() => contactHelpers.generalInquiry('Investment Inquiry — ZAMINAT.eco Pitch Deck', 'I viewed the ZAMINAT.eco pitch deck and would like to discuss investment opportunities.')}
                        className="bg-white text-emerald-700 hover:bg-gray-100 font-bold shadow-md rounded-lg w-full text-[11px] h-8 flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {t('buttons.contactUs', { ns: 'shop' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>

        </div>
      </div>
    </Layout>
  );
}
