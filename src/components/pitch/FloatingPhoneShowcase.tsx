import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import PhoneMockup from './PhoneMockup';
import { APP_SCREENS } from './ScrollScreenRenderer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingPhoneShowcaseProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  /** Marker at the top of the Solution section */
  slideStartRef?: React.RefObject<HTMLDivElement>;
  /** Marker at the bottom of the Traction section */
  slideEndRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

/**
 * Premium scroll-driven floating phone showcase.
 * 
 * Desktop: Sticky phone on the right side with parallax transforms.
 *   Image transitions are driven by scroll progress, divided equally
 *   among the 5 app screen images. The range is bounded by how long
 *   the phone remains visually sticky on screen.
 * Mobile: Inline horizontal swipe carousel between sections.
 */
export default function FloatingPhoneShowcase({ scrollRef, slideStartRef, slideEndRef, className }: FloatingPhoneShowcaseProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobilePhoneCarousel />;
  }

  return <DesktopFloatingPhone scrollRef={scrollRef} slideStartRef={slideStartRef} slideEndRef={slideEndRef} className={className} />;
}

/* ─────────────────────────── Desktop Floating Phone ─────────────────────────── */

/** The CSS `top` value for the sticky phone container */
const STICKY_TOP_OFFSET = 200;

function DesktopFloatingPhone({
  scrollRef,
  slideStartRef,
  slideEndRef,
  className,
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  slideStartRef?: React.RefObject<HTMLDivElement>;
  slideEndRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(APP_SCREENS.length).fill(false));

  // Preload all images eagerly on mount
  useEffect(() => {
    APP_SCREENS.forEach((screen, i) => {
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

  // Track the overall scroll entrance/exit of the container (for parallax + opacity)
  const { scrollYProgress: enterExitProgress } = useScroll({
    target: scrollRef,
    offset: ['start end', 'end start'],
  });

  // Smooth spring for premium parallax feel
  const smoothProgress = useSpring(enterExitProgress, { stiffness: 80, damping: 25, mass: 0.4 });

  // Parallax transforms — only vertical movement + opacity, no 3D transforms
  // NOTE: rotateY, scale, and perspective were removed because they cause
  // the browser GPU compositor to rasterize images at lower quality,
  // resulting in blurry/compressed-looking screenshots.
  const y = useTransform(smoothProgress, [0, 1], [40, -60]);
  
  // Phone fades in at container entrance and fades out late (0.94) so last image has display time
  const opacity = useTransform(enterExitProgress, [0, 0.05, 0.94, 1], [0.3, 1, 1, 0]);

  /**
   * Scroll handler that maps scroll position to equally-spaced image indices.
   * 
   * KEY INSIGHT: The phone is sticky, so images should transition across the
   * scroll range where the phone is actually VISIBLE and STUCK on screen.
   * This is from when the slideStartRef reaches the viewport top, to when
   * the sticky container would naturally unstick (parent bottom minus 
   * phone height minus sticky offset).
   * 
   * We calculate the effective sticky scroll range and distribute all 5
   * images equally across it, ensuring the last image appears well before
   * the phone scrolls away.
   */
  const handleScroll = useCallback(() => {
    const startEl = slideStartRef?.current;
    const endEl = slideEndRef?.current;
    const phoneEl = phoneContainerRef.current;

    if (!startEl || !endEl) return;

    // Absolute page positions (stable, don't shift with scroll)
    const startTop = startEl.getBoundingClientRect().top + window.scrollY;
    const endBottom = endEl.getBoundingClientRect().bottom + window.scrollY;

    // The phone's parent container determines when sticky ends.
    // When the parent's bottom edge reaches the phone's bottom edge,
    // the phone unsticks and scrolls away. We want all 5 images to
    // finish transitioning BEFORE that point.
    //
    // Effective scroll range = distance from start marker to
    // (endBottom minus a safety margin for the phone height).
    // But we simplify by using 90% of the total marker distance,
    // ensuring the last image is fully shown before the phone exits.
    
    const markerDistance = endBottom - startTop;
    if (markerDistance <= 0) return;

    // Use 85% of the distance as the active transition zone.
    // This means all 5 images finish transitioning when we've scrolled
    // through 85% of the marker-to-marker distance, giving the last
    // image ~15% of scroll distance as pure display time.
    const effectiveDistance = markerDistance * 0.85;

    // Current scroll position relative to start marker
    const scrolled = window.scrollY - startTop;
    const progress = Math.max(0, Math.min(1, scrolled / effectiveDistance));

    // Divide into 5 equal segments
    const numScreens = APP_SCREENS.length;
    const segmentSize = 1 / numScreens;
    const newIndex = Math.min(
      numScreens - 1,
      Math.max(0, Math.floor(progress / segmentSize))
    );

    setActiveIndex(prev => prev !== newIndex ? newIndex : prev);
  }, [slideStartRef, slideEndRef]);

  // Attach scroll listener with rAF throttling for smooth 60fps
  useEffect(() => {
    if (!slideStartRef?.current || !slideEndRef?.current) return;

    let rafId: number | null = null;
    
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [handleScroll, slideStartRef, slideEndRef]);

  const currentScreen = APP_SCREENS[activeIndex];

  return (
    <div
      ref={phoneContainerRef}
      className={cn(`sticky top-[${STICKY_TOP_OFFSET}px] self-start flex-shrink-0`, className)}
      style={{
        position: 'sticky',
        top: STICKY_TOP_OFFSET,
        width: 340,
        zIndex: 2,
      }}
    >
      {/* Emerald glow behind phone */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          left: '-20%',
          right: '-20%',
          bottom: '0%',
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.04) 40%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: -1,
        }}
      />

      <motion.div
        style={{
          y,
          opacity,
        }}
        className="flex justify-center"
      >
        <PhoneMockup width={300}>
          {/* 
            Screen content with smooth CSS crossfade.
            All 5 images are pre-rendered and stacked. Only the active
            one has opacity: 1. CSS transition handles the crossfade
            for buttery-smooth 60fps animation without React re-renders.
          */}
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {APP_SCREENS.map((screen, i) => (
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
                      background: 'linear-gradient(110deg, #f0f0f0 30%, #e8e8e8 50%, #f0f0f0 70%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </PhoneMockup>
      </motion.div>

      {/* Screen label indicator */}
      <motion.div
        style={{ opacity }}
        className="text-center mt-5"
      >
        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">
          ZAMINAT.eco Platform
        </p>
        <p
          className="text-[9px] text-gray-400 mt-0.5"
          style={{ transition: 'opacity 0.3s ease' }}
        >
          {currentScreen.label} — {activeIndex + 1}/{APP_SCREENS.length}
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Mobile Swipe Carousel ─────────────────────────── */

function MobilePhoneCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="my-10 -mx-3">
      {/* Section header */}
      <div className="text-center mb-5 px-3">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          Live App Screens
        </div>
        <p className="text-xs text-gray-500 mt-1.5">Swipe to explore the ZAMINAT.eco platform</p>
      </div>

      {/* Scrollable carousel */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
        }}
      >
        {APP_SCREENS.map((screen, i) => (
          <div
            key={i}
            className="flex-shrink-0 snap-center flex flex-col items-center"
            style={{ width: 220 }}
          >
            <PhoneMockup width={200}>
              <img
                src={screen.src}
                alt={screen.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                }}
                loading="lazy"
                draggable={false}
              />
            </PhoneMockup>
            <div className="mt-3 text-center">
              <span className="inline-block bg-emerald-500/10 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                {screen.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {APP_SCREENS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              i === 0 ? 'bg-emerald-500' : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    </div>
  );
}
