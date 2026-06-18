import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, Globe, Award, TrendingUp, Sparkles, Recycle,
  ChevronRight, CheckCircle2, Building2, Landmark, Package, Heart,
  Smartphone, Mail, Briefcase, Menu, X, ArrowUp
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { contactHelpers } from '@/utils/mailto';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import sukhrobjonPhoto from '../../svg/Sukhrobjon Rikhsiboev.jpg';
import azamatPhoto from '../../svg/Azamat Elchibekov.jpg';
import khondamirPhoto from '../../svg/Khondamir Alibekov.jpg';

/* ────────────────────────────── Data ────────────────────────────── */

const PRODUCTS_PHASE1 = [
  { name: 'EPDM-free Tiles', image: '/images/EPDM-free Tiles.webp', material: 'Recycled Rubber', price: '219,000 UZS/m²', status: 'pilotSku', rawName: 'EPDM-free Tiles' },
  { name: 'EPDM Rubber Tiles', image: '/images/EPDM Tiles.webp', material: 'EPDM + Rubber', price: '539,000 UZS/m²', status: 'pilotSku', rawName: 'EPDM Rubber Tiles' },
  { name: 'EcoBrick', image: '/images/EcoBrick.webp', material: 'Recycled Plastic', price: '99,000 UZS/pc', status: 'pilotReady', rawName: 'EcoBrick' },
  { name: 'Eco Bench', image: '/images/Eco Bench.webp', material: 'Recycled Plastic', price: '790,000 UZS/pc', status: 'pilotReady', rawName: 'Eco Bench' },
];

const PRODUCTS_PHASE2 = [
  { name: 'Garden Planter', image: '/images/Garden Planter.webp', material: 'Recycled Plastic', price: '149,000 UZS/pc', status: 'pilotReady', rawName: 'Garden Planter' },
  { name: 'ECOBIKE RACK', image: '/images/ECOBIKE RACK.webp', material: 'Recycled Plastic', price: '490,000 UZS/pc', status: 'pilotReady', rawName: 'ECOBIKE RACK' },
  { name: 'Waste Bin', image: '/images/Waste Bin.webp', material: 'Recycled Plastic', price: '79,000 UZS/pc', status: 'pilotReady', rawName: 'Waste Bin' },
  { name: 'ECOBUSSTOP', image: '/images/ECOBUSSTOP.webp', material: 'Recycled Materials', price: '8,590,000 UZS', status: 'demo', rawName: 'ECOBUSSTOP' },
];

const PRODUCTS_ROADMAP = [
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
  { id: 'pitch-hero', labelKey: 'pitch.hero.title', shortLabel: 'Hero' },
  { id: 'pitch-opportunity', labelKey: 'pitch.problem.tag', shortLabel: 'Opportunity' },
  { id: 'pitch-solution', labelKey: 'pitch.solution.tag', shortLabel: 'Solution' },
  { id: 'pitch-products', labelKey: 'pitch.catalog.tag', shortLabel: 'Products' },
  { id: 'pitch-ecoapp', labelKey: 'pitch.ecoapp.tag', shortLabel: 'EcoApp' },
  { id: 'pitch-business', labelKey: 'pitch.business.tag', shortLabel: 'Business' },
  { id: 'pitch-roadmap', labelKey: 'pitch.roadmap.tag', shortLabel: 'Roadmap' },
  { id: 'pitch-traction', labelKey: 'pitch.traction.tag', shortLabel: 'Traction' },
  { id: 'pitch-team', labelKey: 'pitch.team.tag', shortLabel: 'Team' },
  { id: 'pitch-ask', labelKey: 'pitch.ask.tag', shortLabel: 'Invest' },
];

function PitchNavBar({ isMobile, t }: { isMobile: boolean; t: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('pitch-hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -50% 0px', threshold: 0 }
    );
    NAV_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 70;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Sticky Top Nav */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: isScrolled ? 0 : -80 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="bg-gray-950/85 backdrop-blur-xl border-b border-white/5 shadow-xl">
          <div className={cn("max-w-7xl mx-auto flex items-center justify-between", isMobile ? "px-3 py-2" : "px-5 py-2.5")}>
            {/* Logo */}
            <button onClick={scrollToTop} className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
              <img src="/logo.webp" alt="ZAMINAT.eco" className="h-7 w-7 rounded-lg" />
              <span className={cn("font-bold text-white/90 tracking-tight", isMobile ? "text-sm" : "text-base")}>ZAMINAT.eco</span>
            </button>

            {/* Desktop Section Links */}
            {!isMobile && (
              <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
                {NAV_SECTIONS.map(s => {
                  const isActive = activeSection === s.id;
                  const label = t(s.labelKey, { defaultValue: s.shortLabel });
                  // Use short labels to keep navbar compact
                  const displayLabel = label.length > 14 ? s.shortLabel : label;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                    >
                      {displayLabel}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 bg-gray-950/95 backdrop-blur-xl"
            >
              <div className="px-3 py-2 grid grid-cols-2 gap-1">
                {NAV_SECTIONS.map(s => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                    >
                      {s.shortLabel}
                    </button>
                  );
                })}
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

  // Helper to get array translations safely
  const getArray = (key: string, defaultVal: string[]): string[] => {
    const val = t(key, { returnObjects: true });
    return Array.isArray(val) ? val : defaultVal;
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
      value: i18n.language === 'ru' ? '1 трлн' : i18n.language === 'uz' ? '1 trln' : '1T', 
      unit: t('pitch.stats.uzs'), 
      label: t('pitch.stats.unrealizedValue'), 
      icon: TrendingUp 
    },
  ], [t, i18n.language]);

  const pillars = useMemo(() => [
    { title: t('pitch.solution.pillars.physical.title'), subtitle: t('pitch.solution.pillars.physical.subtitle'), desc: t('pitch.solution.pillars.physical.desc'), icon: Package, color: 'emerald' },
    { title: t('pitch.solution.pillars.digital.title'), subtitle: t('pitch.solution.pillars.digital.subtitle'), desc: t('pitch.solution.pillars.digital.desc'), icon: Smartphone, color: 'teal' },
    { title: t('pitch.solution.pillars.education.title'), subtitle: t('pitch.solution.pillars.education.subtitle'), desc: t('pitch.solution.pillars.education.desc'), icon: Heart, color: 'green' },
  ], [t]);

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
  const roadmapProducts = useMemo(() => PRODUCTS_ROADMAP.map(translateProduct), [t, i18n.language]);

  const ecoappModules = useMemo(() => [
    { name: t('pitch.ecoapp.modules.ecomap.name'), desc: t('pitch.ecoapp.modules.ecomap.desc'), icon: Globe },
    { name: t('pitch.ecoapp.modules.ecoactions.name'), desc: t('pitch.ecoapp.modules.ecoactions.desc'), icon: Users },
    { name: t('pitch.ecoapp.modules.ecowallet.name'), desc: t('pitch.ecoapp.modules.ecowallet.desc'), icon: Sparkles },
    { name: t('pitch.ecoapp.modules.ecostories.name'), desc: t('pitch.ecoapp.modules.ecostories.desc'), icon: Heart },
    { name: t('pitch.ecoapp.modules.ecovote.name'), desc: t('pitch.ecoapp.modules.ecovote.desc'), icon: Landmark },
    { name: t('pitch.ecoapp.modules.dashboard.name'), desc: t('pitch.ecoapp.modules.dashboard.desc'), icon: TrendingUp },
  ], [t]);

  const revenueChannels = useMemo(() => [
    { name: t('pitch.business.channels.b2g.name'), desc: t('pitch.business.channels.b2g.desc'), icon: Landmark },
    { name: t('pitch.business.channels.b2b.name'), desc: t('pitch.business.channels.b2b.desc'), icon: Building2 },
    { name: t('pitch.business.channels.b2c.name'), desc: t('pitch.business.channels.b2c.desc'), icon: Package },
    { name: t('pitch.business.channels.corporate.name'), desc: t('pitch.business.channels.corporate.desc'), icon: Briefcase },
    { name: t('pitch.business.channels.social.name'), desc: t('pitch.business.channels.social.desc'), icon: Heart },
    { name: t('pitch.business.channels.franchise.name'), desc: t('pitch.business.channels.franchise.desc'), icon: Globe },
  ], [t]);

  const marketDetails = useMemo(() => [
    { label: t('pitch.business.market.tam.label'), value: t('pitch.business.market.tam.value'), desc: t('pitch.business.market.tam.desc') },
    { label: t('pitch.business.market.sam.label'), value: t('pitch.business.market.sam.value'), desc: t('pitch.business.market.sam.desc') },
    { label: t('pitch.business.market.launchSom.label'), value: t('pitch.business.market.launchSom.value'), desc: t('pitch.business.market.launchSom.desc') },
    { label: t('pitch.business.market.pilotSom.label'), value: t('pitch.business.market.pilotSom.value'), desc: t('pitch.business.market.pilotSom.desc') },
  ], [t]);

  const businessMetrics = useMemo(() => [
    { label: t('pitch.business.metrics.grossMargin'), value: '45%+' },
    { label: t('pitch.business.metrics.breakeven'), value: '2028' },
    { label: t('pitch.business.metrics.roi'), value: '124–152%' },
  ], [t]);

  const roadmap = useMemo(() => [
    { year: '2026', title: t('pitch.roadmap.y2026.title'), items: getArray('pitch.roadmap.y2026.items', ['First pilot production line', 'Target: 10 pilot customers', 'EcoApp MVP launch', 'Target: 3 EcoKids pilot schools']) },
    { year: '2027', title: t('pitch.roadmap.y2027.title'), items: getArray('pitch.roadmap.y2027.items', ['Target: 500 t/year production', 'Tashkent pilot city contracts', 'Target: 5,000 EcoApp users', 'Target: 10 schools enrolled']) },
    { year: '2028', title: t('pitch.roadmap.y2028.title'), items: getArray('pitch.roadmap.y2028.items', ['Target: 2,000 t/year capacity', 'Target: break-even achieved', 'Regional expansion pilot', 'National partnerships']) },
    { year: '2029', title: t('pitch.roadmap.y2029.title'), items: getArray('pitch.roadmap.y2029.items', ['Multi-city operations', 'Central Asia market entry', 'Platform licensing', 'Target net profit scenario: $183K/year']) },
  ], [t]);

  const tractionStage = useMemo(() => ({
    title: t('pitch.traction.stage.title'),
    desc: t('pitch.traction.stage.desc'),
  }), [t]);

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
  ], [t]);

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
  }), [t]);

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
  ], [t]);

  const ecoappFlow = useMemo(() => {
    const val = t('pitch.ecoapp.flow', { returnObjects: true });
    return Array.isArray(val) ? val : ['Collect', 'Participate', 'Earn', 'Vote', 'Track Impact'];
  }, [t]);

  const solutionTitleParts = t('pitch.solution.title').split('. ');
  const catalogTitleParts = t('pitch.catalog.title').split('. ');
  const businessTitleParts = t('pitch.business.title').split('. ');
  const problemTitleParts = t('pitch.problem.title').split('. ');

  const renderProductCard = (p: ReturnType<typeof translateProduct>, i: number) => (
    <motion.div key={i} variants={fadeUp}>
      <Card 
        onClick={() => navigate(`/product/${getProductSlug(p.rawName)}`)}
        className="h-full overflow-hidden border-gray-200/60 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-emerald-300"
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
        <CardContent className={cn(isMobile ? "p-2" : "p-3")}>
          <h4 className={cn("font-bold text-gray-900 leading-tight", isMobile ? "text-[11px]" : "text-xs")}>{p.name}</h4>
          <div className={cn("text-emerald-600 font-semibold mt-0.5", isMobile ? "text-[10px]" : "text-[11px]")}>{p.material}</div>
          <div className="flex items-center justify-between mt-1.5">
            <span className={cn("font-bold text-gray-700", isMobile ? "text-[10px]" : "text-[11px]")}>
              {t('pitch.catalog.priceLabel')}: {p.price}
            </span>
            <Badge className={cn("text-[9px] px-1.5 py-0", getStatusBadgeStyle(p.status))}>
              {p.statusLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Layout title={t('pitch.title')} hideBottomNav>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/10">

        {/* ═══════ PITCH NAVIGATION BAR ═══════ */}
        <PitchNavBar isMobile={isMobile} t={t} />

        {/* ═══════ SECTION 1: Hero ═══════ */}
        <section
          id="pitch-hero"
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat text-white"
          style={{ backgroundImage: "url('/images/pitch-hero-bg.jpg')" }}
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
              {[t('pitch.hero.location'), t('pitch.hero.stage'), t('pitch.hero.established')].map(tag => (
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
                t('pitch.chain.product'),
                t('pitch.chain.revenue'),
                t('pitch.chain.impact')
              ].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs font-bold">
                    {step}
                  </span>
                  {i < 4 && <ChevronRight className="h-4 w-4 opacity-40" />}
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

        <div className={cn("max-w-6xl mx-auto", isMobile ? "px-3 space-y-10 py-8" : "px-6 space-y-16 py-14")}>

          {/* ═══════ SECTION 2: The Problem / Opportunity ═══════ */}
          <motion.section id="pitch-opportunity" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-red-50 text-red-700 border-red-200 mb-3">{t('pitch.problem.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {problemTitleParts[0]}
                {problemTitleParts[1] && (
                  <>
                    .<br />
                    <span className="text-emerald-600">{problemTitleParts[1]}</span>
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

          {/* ═══════ SECTION 3: Our Solution ═══════ */}
          <motion.section id="pitch-solution" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-3">{t('pitch.solution.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {solutionTitleParts[0]}
                {solutionTitleParts[1] && (
                  <>
                    .{' '}
                    <span className="text-emerald-600">{solutionTitleParts[1]}</span>
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
                        `p-2.5 rounded-xl bg-${pillar.color}-50 text-${pillar.color}-600 w-fit mb-3`,
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

          {/* ═══════ SECTION 4: Product Portfolio ═══════ */}
          <motion.section id="pitch-products" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 mb-3">{t('pitch.catalog.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {catalogTitleParts[0]}
                {catalogTitleParts[1] && (
                  <>
                    .{' '}
                    <span className="text-emerald-600">{catalogTitleParts[1]}</span>
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
            <div className="mb-6">
              <h3 className={cn("font-bold text-gray-800 border-l-4 border-sky-500 pl-3 mb-4", isMobile ? "text-sm" : "text-base")}>
                {t('pitch.catalog.phase2Title')}
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {phase2Products.map((p, i) => renderProductCard(p, i + 4))}
              </div>
            </div>

            {/* Roadmap Products */}
            <div>
              <h3 className={cn("font-bold text-gray-800 border-l-4 border-gray-400 pl-3 mb-4", isMobile ? "text-sm" : "text-base")}>
                {t('pitch.catalog.roadmapTitle')}
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {roadmapProducts.map((p, i) => renderProductCard(p, i + 8))}
              </div>
            </div>
          </motion.section>

          {/* ═══════ SECTION 5: EcoApp Platform ═══════ */}
          <motion.section id="pitch-ecoapp" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-teal-50 text-teal-700 border-teal-200 mb-3">{t('pitch.ecoapp.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {t('pitch.ecoapp.title')}
              </h2>
            </motion.div>

            {/* Visual Flow */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-1 mb-6">
              {ecoappFlow.map((step: string, i: number) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-bold text-teal-700">
                    {step}
                  </span>
                  {i < ecoappFlow.length - 1 && <ChevronRight className="h-4 w-4 text-teal-300" />}
                </React.Fragment>
              ))}
            </motion.div>

            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              {ecoappModules.map((mod, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn("flex items-start gap-3", isMobile ? "p-3" : "p-4")}>
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-600 flex-shrink-0">
                        <mod.icon className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-gray-900", isMobile ? "text-xs" : "text-sm")}>{mod.name}</h4>
                        <p className={cn("text-gray-500 leading-relaxed mt-0.5", isMobile ? "text-[10px]" : "text-xs")}>{mod.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 6: Business Model ═══════ */}
          <motion.section id="pitch-business" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-3">{t('pitch.business.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {businessTitleParts[0]}
                {businessTitleParts[1] && (
                  <>
                    .{' '}
                    <span className="text-emerald-600">{businessTitleParts[1]}</span>
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
            <div className="mt-8 space-y-4">
              <h3 className={cn("font-bold text-gray-900 border-l-4 border-emerald-500 pl-3", isMobile ? "text-base" : "text-lg")}>
                {t('pitch.business.market.title')}
              </h3>
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4")}>
                {marketDetails.map((item, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/5">
                      <CardContent className={cn("flex flex-col justify-between h-full", isMobile ? "p-4" : "p-5")}>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                            {item.label}
                          </span>
                          <div className={cn("font-black text-gray-900", isMobile ? "text-xl" : "text-2xl lg:text-3xl")}>
                            {item.value}
                          </div>
                        </div>
                        <p className={cn("text-gray-500 mt-2 leading-relaxed border-t border-gray-100 pt-3", isMobile ? "text-[11px]" : "text-xs")}>
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
                {t('pitch.business.tag')} — Key Metrics
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

          {/* ═══════ SECTION 7: Roadmap ═══════ */}
          <motion.section id="pitch-roadmap" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 mb-3">{t('pitch.roadmap.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {t('pitch.roadmap.title')}
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-4")}>
              {roadmap.map((yr, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm">
                    <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                      <div className={cn("font-black text-emerald-600 mb-1", isMobile ? "text-xl" : "text-2xl")}>{yr.year}</div>
                      <div className={cn("font-bold text-gray-900 mb-2", isMobile ? "text-xs" : "text-sm")}>{yr.title}</div>
                      <ul className="space-y-1">
                        {yr.items.map((item, j) => (
                          <li key={j} className={cn("flex items-start gap-1.5 text-gray-600", isMobile ? "text-[10px]" : "text-xs")}>
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

          {/* ═══════ SECTION 8: Traction ═══════ */}
          <motion.section id="pitch-traction" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-green-50 text-green-700 border-green-200 mb-3">{t('pitch.traction.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {t('pitch.traction.title')}
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
            <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-3")}>
              {tractionPillars.map((pillar, idx) => (
                <motion.div 
                  key={idx} 
                  variants={fadeUp} 
                  className={cn(idx === 6 ? "md:col-span-3 lg:col-span-3" : "")}
                >
                  <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <CardContent className={cn("flex flex-col justify-between h-full", isMobile ? "p-4" : "p-5")}>
                      <div>
                        <h4 className={cn("font-bold text-gray-900 border-b border-gray-100 pb-3 mb-3", isMobile ? "text-xs" : "text-sm")}>
                          {pillar.title}
                        </h4>
                        <ul className={cn("space-y-2.5", idx === 6 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2" : "")}>
                          {pillar.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2 text-gray-700">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className={cn(isMobile ? "text-[11px]" : "text-xs leading-relaxed")}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {pillar.note && (
                        <p className={cn("text-gray-400 mt-4 pt-3 border-t border-gray-100 italic", isMobile ? "text-[9px]" : "text-[10px] leading-relaxed")}>
                          {pillar.note}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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

          {/* ═══════ SECTION 9: Team ═══════ */}
          <motion.section id="pitch-team" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 mb-3">{t('pitch.team.tag')}</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                {t('pitch.team.title')}
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
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
          {/* ═══════ SECTION 10: Investment Ask ═══════ */}
          <motion.section id="pitch-ask" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Card 
                className="border-0 shadow-2xl text-white overflow-hidden relative bg-cover bg-center bg-no-repeat rounded-3xl"
                style={{ backgroundImage: "url('/images/pitch-ask-bg.jpg')" }}
              >
                <div className="absolute inset-0 bg-emerald-950/85" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <CardContent className={cn("relative z-10 text-left", isMobile ? "p-6" : "p-10 lg:p-12")}>
                  
                  {/* Badge & Title */}
                  <div className="text-center mb-8">
                    <Badge className="bg-white/15 text-white border-white/20 mb-4">{t('pitch.ask.tag')}</Badge>
                    <h3 className={cn("font-black tracking-tight leading-snug max-w-2xl mx-auto text-center", isMobile ? "text-xl" : "text-3xl")}>
                      {t('pitch.ask.seekingTitle')}
                    </h3>
                  </div>

                  {/* Scenarios Grid */}
                  <div className={cn("grid gap-6 mb-10", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                    {/* Scenario A */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:bg-white/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Landmark className="h-5 w-5 text-emerald-300" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">{t('pitch.ask.scenarioA.title').split(' — ')[0]}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{t('pitch.ask.scenarioA.title').split(' — ')[1] || t('pitch.ask.scenarioA.title')}</h4>
                        <p className="text-base font-extrabold text-white/95">{t('pitch.ask.scenarioA.details')}</p>
                      </div>
                      <div className="text-xs text-white/50 mt-4 border-t border-white/5 pt-3">
                        {t('pitch.ask.scenarioA.note')}
                      </div>
                    </div>

                    {/* Scenario B */}
                    <div className="bg-emerald-500/10 border-2 border-emerald-400/30 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:bg-emerald-500/15 transition-colors relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                        {t('pitch.ask.scenarioB.badge', { defaultValue: 'Strategic Option' })}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="h-5 w-5 text-emerald-300" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">{t('pitch.ask.scenarioB.title').split(' — ')[0]}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{t('pitch.ask.scenarioB.title').split(' — ')[1] || t('pitch.ask.scenarioB.title')}</h4>
                        <p className="text-base font-extrabold text-white/95">{t('pitch.ask.scenarioB.details')}</p>
                      </div>
                      <div className="text-xs text-white/70 mt-4 border-t border-white/10 pt-3 leading-relaxed">
                        {t('pitch.ask.scenarioB.note')}
                      </div>
                    </div>

                    {/* Scenario C */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between hover:bg-white/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="h-5 w-5 text-emerald-300" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">{t('pitch.ask.scenarioC.title').split(' — ')[0] || "Scenario C"}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{t('pitch.ask.scenarioC.title').split(' — ')[1] || t('pitch.ask.scenarioC.title')}</h4>
                        <p className="text-base font-extrabold text-white/95">{t('pitch.ask.scenarioC.details')}</p>
                      </div>
                      <div className="text-xs text-white/50 mt-4 border-t border-white/5 pt-3 leading-relaxed">
                        {t('pitch.ask.scenarioC.note')}
                      </div>
                    </div>
                  </div>

                  {/* Mid Section: Use of Funds & Strategy */}
                  <div className={cn("grid gap-8 border-t border-white/10 pt-8 mb-8", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                    {/* Left Column: Use of Funds */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg text-emerald-300 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {t('pitch.ask.fundsTitle')}
                      </h4>
                      {/* Visual budget split bar */}
                      <div className="flex h-3.5 rounded-full overflow-hidden gap-0.5 bg-white/10 p-0.5">
                        <div className="bg-emerald-400 rounded-full" style={{ width: '75%' }} title="Equipment (75%)" />
                        <div className="bg-teal-400 rounded-full" style={{ width: '11%' }} title="Facility Adaptation (11%)" />
                        <div className="bg-amber-400 rounded-full" style={{ width: '5%' }} title="Raw Materials (5%)" />
                        <div className="bg-sky-400 rounded-full" style={{ width: '4%' }} title="Certification (4%)" />
                        <div className="bg-indigo-400 rounded-full" style={{ width: '5%' }} title="Digital & Marketing (5%)" />
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 gap-2.5 text-xs text-white/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded bg-emerald-400 flex-shrink-0" />
                          <span className="font-medium">{t('pitch.ask.fund1')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded bg-teal-400 flex-shrink-0" />
                          <span className="font-medium">{t('pitch.ask.fund2')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded bg-amber-400 flex-shrink-0" />
                          <span className="font-medium">{t('pitch.ask.fund3')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded bg-sky-400 flex-shrink-0" />
                          <span className="font-medium">{t('pitch.ask.fund4')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded bg-indigo-400 flex-shrink-0" />
                          <span className="font-medium">{t('pitch.ask.fund5')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Facility Strategy & Partner Advantage */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg text-emerald-300 flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {t('pitch.ask.facilityTitle')}
                        </h4>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {t('pitch.ask.facilityDesc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg text-emerald-300 flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          {t('pitch.ask.partnerTitle')}
                        </h4>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {t('pitch.ask.partnerDesc')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Join Section */}
                  <div className="text-center border-t border-white/10 pt-8">
                    <p className={cn("font-semibold text-white/95", isMobile ? "text-sm" : "text-base")}>
                      {t('pitch.ask.cta1')}
                    </p>
                    <p className={cn("font-black text-yellow-300 mt-1 uppercase tracking-wider", isMobile ? "text-lg" : "text-2xl")}>
                      {t('pitch.ask.cta2')}
                    </p>
                  </div>

                  {/* Scan & Contact */}
                  <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white p-2 rounded-xl shadow-xl w-28 h-28 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                        <img src="/images/pitch-qr.png" alt="Scan to open Pitch Deck" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] text-white/70 font-semibold tracking-wide">
                        {t('pitch.ask.qrLabel')}
                      </span>
                      <span className="text-[9px] text-white/50">
                        {t('pitch.ask.qrSublabel', { defaultValue: 'Scan to explore ZAMINAT.eco' })}
                      </span>
                    </div>

                    <div className="w-px h-16 bg-white/20 hidden md:block" />

                    <Button
                      onClick={() => contactHelpers.generalInquiry('Investment Inquiry — ZAMINAT.eco Pitch Deck', 'I viewed the ZAMINAT.eco pitch deck and would like to discuss investment opportunities.')}
                      className={cn(
                        "bg-white text-emerald-700 hover:bg-gray-100 font-bold shadow-xl rounded-xl transition-all hover:-translate-y-0.5",
                        isMobile ? "px-6 py-3 text-sm w-full max-w-[240px]" : "px-8 py-4 text-base"
                      )}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t('buttons.contactUs', { ns: 'shop' })}
                    </Button>
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
