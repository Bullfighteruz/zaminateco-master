import React, { useState, useEffect } from 'react';
import PhoneMockup from '../pitch/PhoneMockup';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingAIPhoneProps {
  activeIndex?: number;
}

/**
 * AI screens data — matches the 6 feature cards in AICoreSection.
 * Images are full-quality JPGs served from /public/images/ai-screens/
 * with no compression or resizing applied.
 */
const AI_SCREENS = [
  { src: '/images/ai-screens/eco-scan.jpg', label: 'AI EcoScan' },
  { src: '/images/ai-screens/eco-coach.jpg', label: 'ZAMI AI Advisor' },
  { src: '/images/ai-screens/impact-engine.jpg', label: 'AI Impact Engine' },
  { src: '/images/ai-screens/anti-fraud.jpg', label: 'AI Anti-Fraud' },
  { src: '/images/ai-screens/ecokids-tutor.jpg', label: 'AI EcoKids Tutor' },
  { src: '/images/ai-screens/production-planner.jpg', label: 'AI Production Planner' },
];

/**
 * Premium phone mockup for the AI Core section.
 * 
 * Uses the SAME rendering technique as the pitch page's FloatingPhoneShowcase:
 * - All images are pre-loaded eagerly on mount
 * - All 6 images are stacked with absolute positioning
 * - Only the active image has opacity: 1
 * - CSS transition handles buttery-smooth 60fps crossfade without React re-renders
 * - No 3D transforms to avoid GPU rasterization quality loss
 * - Images rendered at full quality with no compression
 */
export default function FloatingAIPhone({ activeIndex: propActiveIndex }: FloatingAIPhoneProps) {
  const isMobile = useIsMobile();
  const [internalIndex, setInternalIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(AI_SCREENS.length).fill(false));

  const activeIndex = propActiveIndex !== undefined ? propActiveIndex : internalIndex;
  const phoneWidth = isMobile ? 260 : 320;

  // Preload all images eagerly on mount (same pattern as pitch page)
  useEffect(() => {
    AI_SCREENS.forEach((screen, i) => {
      const img = new Image();
      img.src = screen.src;
      img.onload = () => {
        setImagesLoaded(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      };
    });
  }, []);

  // Auto-rotation cycle if propActiveIndex is not provided
  useEffect(() => {
    if (propActiveIndex !== undefined) return;

    const interval = setInterval(() => {
      setInternalIndex((prev) => (prev + 1) % AI_SCREENS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [propActiveIndex]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Decorative Outer Shadow Ring */}
      <div className="absolute inset-0 bg-emerald-500/5 rounded-[48px] blur-3xl scale-95 pointer-events-none" />

      <PhoneMockup width={phoneWidth}>
        {/* 
          Screen content with smooth CSS crossfade.
          All 6 images are pre-rendered and stacked. Only the active
          one has opacity: 1. CSS transition handles the crossfade
          for buttery-smooth 60fps animation without React re-renders.
          
          This is the EXACT same pattern as FloatingPhoneShowcase.tsx
          on the pitch page.
        */}
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          {AI_SCREENS.map((screen, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === activeIndex ? 1 : 0,
                transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: i === activeIndex ? 1 : 0,
              }}
            >
              {imagesLoaded[i] ? (
                <img
                  src={screen.src}
                  alt={screen.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    display: 'block',
                    imageRendering: 'auto',
                    backfaceVisibility: 'hidden',
                  }}
                  draggable={false}
                />
              ) : (
                <div 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#0c0f14',
                  }}
                >
                  {/* Shimmer placeholder while image loads */}
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      </PhoneMockup>

      {/* Screen Selector Dots indicator */}
      <div className="flex items-center gap-1.5 mt-3 z-20">
        {AI_SCREENS.map((_, idx) => (
          <div
            key={idx}
            role="button"
            onClick={() => setInternalIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer min-h-0 min-w-0",
              activeIndex === idx 
                ? "w-4 bg-emerald-600" 
                : "w-1.5 bg-slate-300 hover:bg-slate-400"
            )}
            aria-label={`Show ${AI_SCREENS[idx].label} screen`}
          />
        ))}
      </div>
    </div>
  );
}
