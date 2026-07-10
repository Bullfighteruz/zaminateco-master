import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AIFeatureCard from './AIFeatureCard';
import FloatingAIPhone from './FloatingAIPhone';
import AIImpactPreview from './AIImpactPreview';
import AIRoadmap from './AIRoadmap';
import { UzbekPattern } from '../EcoIcons';
import { 
  Camera, 
  MessageSquare, 
  Cpu, 
  ShieldCheck, 
  Smile, 
  Factory,
  Sparkles,
  ArrowRight,
  MousePointerClick
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function AICoreSection() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [isHoveredByMouse, setIsHoveredByMouse] = useState(false);

  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (isHoveredByMouse || isMobile) return;

    const container = cardsContainerRef.current;
    if (!container) return;

    const cardElements = container.children;
    if (cardElements.length < 6) return;

    const viewportCenter = window.innerHeight / 2;

    // Row vertical centers (Row 0: cards 0,1; Row 1: cards 2,3; Row 2: cards 4,5)
    const rowCenters = [
      (cardElements[0].getBoundingClientRect().top + cardElements[0].getBoundingClientRect().bottom) / 2,
      (cardElements[2].getBoundingClientRect().top + cardElements[2].getBoundingClientRect().bottom) / 2,
      (cardElements[4].getBoundingClientRect().top + cardElements[4].getBoundingClientRect().bottom) / 2,
    ];

    let closestRow = 0;
    let minDistance = Infinity;
    rowCenters.forEach((center, idx) => {
      const distance = Math.abs(center - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestRow = idx;
      }
    });

    setActiveScreenIndex(prev => {
      if (closestRow === 0) {
        return (prev === 0 || prev === 1) ? prev : 0;
      } else if (closestRow === 1) {
        return (prev === 2 || prev === 3) ? prev : 2;
      } else {
        return (prev === 4 || prev === 5) ? prev : 5;
      }
    });
  }, [isHoveredByMouse, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [handleScroll, isMobile]);

  const features = [
    { key: 'ecoscan', icon: Camera, badgeKey: 'tagLive' as const, screenIndex: 0, launchPath: '/scanner' },
    { key: 'ecocoach', icon: MessageSquare, badgeKey: 'tagLive' as const, screenIndex: 1, launchPath: '/coach' },
    { key: 'impact', icon: Cpu, badgeKey: 'tagPrototype' as const, screenIndex: 2 },
    { key: 'fraud', icon: ShieldCheck, badgeKey: 'tagUpcoming' as const, screenIndex: 3 },
    { key: 'kids', icon: Smile, badgeKey: 'tagDesign' as const, screenIndex: 4 },
    { key: 'planner', icon: Factory, badgeKey: 'tagPlanned' as const, screenIndex: 5, launchPath: '/planner' }
  ];

  return (
    <section id="ai-core-section" className="scroll-mt-20 w-full relative z-10">
      <Card className="border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] bg-white/80 backdrop-blur-xl overflow-hidden rounded-3xl relative">
        {/* Top pattern accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden bg-gray-50/50">
          <UzbekPattern className="w-full h-full text-emerald-600/30" />
        </div>

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
        </div>

        <CardContent className={cn("relative z-10", isMobile ? "p-3 space-y-4" : "p-6 lg:p-8 space-y-5")}>
          
          {/* ─── HERO ZONE: Header + Phone + Feature Cards ─── */}
          <div className={cn("grid gap-5 items-start", isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12 lg:gap-6")}>
            
            {/* LEFT COLUMN — fits naturally to content, grouped with professional vertical gaps */}
            <div className="lg:col-span-7 text-left flex flex-col justify-start gap-4 sm:gap-6">

              {/* TOP: Section Header + CTAs */}
              <div className="space-y-3.5">
                {/* Micro-badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-800 text-[10px] font-black uppercase tracking-widest shadow-sm select-none">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Zaminat Intelligence
                </div>

                <h2 className={cn(
                  "font-black text-gray-900 tracking-tight leading-none",
                  isMobile ? "text-2xl" : "text-3xl lg:text-4xl"
                )}>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-600">
                    ZAMINAT AI Core
                  </span>
                  <span className="text-teal-500 font-black">.</span>
                  <span className="text-xs font-bold text-slate-400 align-super ml-1">v2.1</span>
                </h2>
                
                <p className={cn(
                  "text-slate-600 font-semibold leading-relaxed max-w-xl",
                  isMobile ? "text-xs" : "text-sm lg:text-[15px]"
                )}>
                  {t('ai.subtitle')}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to="/pitch" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                    {/* Sliding Shine Sweep Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    <span>{t('ai.viewPitch')}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>



              {/* MIDDLE: Feature Cards 2×3 grid — grows to fill available space */}
              <div className="flex flex-col gap-1.5">
                <p className={cn(
                  "text-emerald-600/80 font-bold uppercase tracking-widest",
                  isMobile ? "text-[9px]" : "text-[10px]"
                )}>
                  {t('ai.intelLayers')}
                </p>
                <div 
                  ref={cardsContainerRef}
                  onMouseEnter={() => setIsHoveredByMouse(true)}
                  onMouseLeave={() => setIsHoveredByMouse(false)}
                  className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}
                >
                  {features.map((feature, idx) => (
                    <div 
                      key={feature.key} 
                      onMouseEnter={() => !isMobile && setActiveScreenIndex(feature.screenIndex)}
                      onClick={() => setActiveScreenIndex(feature.screenIndex)}
                      className="cursor-pointer h-full flex flex-col"
                    >
                      <AIFeatureCard
                        title={t(`ai.features.${feature.key}.title`)}
                        description={t(`ai.features.${feature.key}.desc`)}
                        icon={feature.icon}
                        badgeKey={feature.badgeKey}
                        index={idx}
                        isActive={activeScreenIndex === feature.screenIndex}
                        launchPath={feature.launchPath}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTTOM: Disclaimer — sits naturally next to feature grid */}
              <p className={cn(
                "text-slate-400 leading-relaxed mt-2 pt-4 border-t border-slate-100/50",
                isMobile ? "text-[9px]" : "text-[11px]"
              )}>
                {t('ai.disclaimer')}
              </p>
            </div>

            {/* RIGHT COLUMN: Sticky Phone (Desktop only) */}
            <div className="hidden lg:flex lg:col-span-5 relative justify-center">
              <div className="sticky top-24 flex flex-col items-center gap-2 py-1">
                <FloatingAIPhone activeIndex={activeScreenIndex} />
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium select-none animate-pulse">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{t('ai.hoverExplore')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── BOTTOM ZONE: Impact + Roadmap side by side on desktop ─── */}
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-12")}>
            
            {/* Impact Simulator */}
            <div className={cn(isMobile ? "" : "col-span-5")}>
              <AIImpactPreview />
            </div>

            {/* Roadmap */}
            <div className={cn(isMobile ? "" : "col-span-7")}>
              <AIRoadmap />
            </div>

          </div>

        </CardContent>
      </Card>
    </section>
  );
}
