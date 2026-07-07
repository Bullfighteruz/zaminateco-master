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

  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const features = [
    { key: 'ecoscan', icon: Camera, badgeKey: 'tagPrototype' as const, screenIndex: 0, launchPath: '/scanner' },
    { key: 'ecocoach', icon: MessageSquare, badgeKey: 'tagConcept' as const, screenIndex: 1, launchPath: '/coach' },
    { key: 'impact', icon: Cpu, badgeKey: 'tagPrototype' as const, screenIndex: 2 },
    { key: 'fraud', icon: ShieldCheck, badgeKey: 'tagUpcoming' as const, screenIndex: 3 },
    { key: 'kids', icon: Smile, badgeKey: 'tagDesign' as const, screenIndex: 4 },
    { key: 'planner', icon: Factory, badgeKey: 'tagPlanned' as const, screenIndex: 5, launchPath: '/planner' }
  ];

  // Scroll-driven phone transitions
  const handleScroll = useCallback(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;
    const scrolled = viewportCenter - rect.top;
    const total = rect.height;
    if (total <= 0) return;

    const progress = Math.max(0, Math.min(1, scrolled / total));
    const numCards = features.length;
    const newIndex = Math.min(numCards - 1, Math.max(0, Math.floor(progress * numCards)));
    setActiveScreenIndex(prev => prev !== newIndex ? newIndex : prev);
  }, [features.length]);

  useEffect(() => {
    if (isMobile) return;
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { handleScroll(); rafId = null; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [handleScroll, isMobile]);

  return (
    <section id="ai-core-section" className="scroll-mt-20 w-full relative z-10">
      <Card className="border border-gray-200/50 shadow-xl bg-white/70 backdrop-blur-md overflow-hidden rounded-3xl relative">
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
          <div className={cn("grid gap-5", isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12 lg:gap-6")}>
            
            {/* LEFT COLUMN — stretches to match phone height */}
            <div className="lg:col-span-7 text-left flex flex-col justify-between gap-4">

              {/* TOP: Section Header + CTAs */}
              <div className={cn("space-y-2", isMobile ? "" : "")}>
                <h2 className={cn(
                  "font-black text-gray-900 tracking-tight leading-tight",
                  isMobile ? "text-xl" : "text-2xl lg:text-3xl"
                )}>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600">
                    ZAMINAT AI Core
                  </span>
                </h2>
                <p className={cn(
                  "text-slate-700 font-semibold leading-relaxed",
                  isMobile ? "text-xs" : "text-sm lg:text-base"
                )}>
                  {t('ai.subtitle')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/actions">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-1.5 shadow-sm rounded-xl gap-1.5">
                      {t('ai.exploreApp')} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Link to="/pitch">
                    <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-800 font-bold text-xs px-4 py-1.5 hover:bg-emerald-50 rounded-xl">
                      {t('ai.viewPitch')}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile phone inline */}
              {isMobile && (
                <div className="w-full flex justify-center py-1">
                  <FloatingAIPhone activeIndex={activeScreenIndex} />
                </div>
              )}

              {/* MIDDLE: Feature Cards 2×3 grid — grows to fill available space */}
              <div className="flex flex-col gap-1.5">
                <p className={cn(
                  "text-emerald-600/80 font-bold uppercase tracking-widest",
                  isMobile ? "text-[9px]" : "text-[10px]"
                )}>
                  {t('ai.intelligenceLayers')}
                </p>
                <div 
                  ref={cardsContainerRef}
                  className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}
                >
                  {features.map((feature, idx) => (
                    <div 
                      key={feature.key} 
                      onMouseEnter={() => !isMobile && setActiveScreenIndex(feature.screenIndex)}
                      onClick={() => setActiveScreenIndex(feature.screenIndex)}
                      className="cursor-pointer"
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

              {/* BOTTOM: Disclaimer — pushed to bottom */}
              <p className={cn(
                "text-slate-400 leading-relaxed",
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
