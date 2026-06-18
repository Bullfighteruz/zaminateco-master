import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import PhoneMockup from './PhoneMockup';
import { APP_SCREENS } from './ScrollScreenRenderer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence } from 'framer-motion';

interface FloatingPhoneShowcaseProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

/**
 * Premium scroll-driven floating phone showcase.
 * 
 * Desktop: Sticky phone on the right side with parallax transforms.
 * Mobile: Inline horizontal swipe carousel between sections.
 */
export default function FloatingPhoneShowcase({ scrollRef, className }: FloatingPhoneShowcaseProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobilePhoneCarousel />;
  }

  return <DesktopFloatingPhone scrollRef={scrollRef} className={className} />;
}

/* ─────────────────────────── Desktop Floating Phone ─────────────────────────── */

function DesktopFloatingPhone({
  scrollRef,
  className,
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(APP_SCREENS.length).fill(false));

  // Preload all images
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

  // Track the overall scroll entrance/exit of the container relative to viewport (used for parallax and opacity)
  const { scrollYProgress: enterExitProgress } = useScroll({
    target: scrollRef,
    offset: ['start end', 'end start'],
  });

  // Smooth spring for premium feel
  const smoothProgress = useSpring(enterExitProgress, { stiffness: 80, damping: 25, mass: 0.4 });

  // Parallax transforms
  const y = useTransform(smoothProgress, [0, 1], [60, -100]);
  const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-5, 0, 4]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.97, 1.02, 0.98]);
  
  // Phone fades in at container entrance and fades out at container exit
  const opacity = useTransform(enterExitProgress, [0, 0.05, 0.88, 1], [0.3, 1, 1, 0]);

  // Track scroll progress ONLY while the phone is sticky in the viewport (to drive the slideshow)
  const { scrollYProgress: stickyProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress to active screenshot index
  useMotionValueEvent(stickyProgress, 'change', (latest) => {
    const segmentSize = 1 / APP_SCREENS.length;
    const newIndex = Math.min(
      APP_SCREENS.length - 1,
      Math.max(0, Math.floor(latest / segmentSize))
    );
    setActiveIndex(newIndex);
  });

  const currentScreen = APP_SCREENS[activeIndex];

  return (
    <div
      className={cn('sticky top-[120px] self-start flex-shrink-0', className)}
      style={{
        width: 340,
        zIndex: 2,
        perspective: 1200,
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
          rotateY,
          scale,
          opacity,
          transformStyle: 'preserve-3d',
        }}
        className="flex justify-center"
      >
        <PhoneMockup width={300}>
          {/* Screen content with crossfade */}
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ position: 'absolute', inset: 0 }}
              >
                {imagesLoaded[activeIndex] ? (
                  <img
                    src={currentScreen.src}
                    alt={currentScreen.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      display: 'block',
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
              </motion.div>
            </AnimatePresence>


          </div>
        </PhoneMockup>
      </motion.div>

      {/* Caption below phone */}
      <motion.div
        style={{ opacity }}
        className="text-center mt-5"
      >
        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">
          ZAMINAT.eco Platform
        </p>
        <p className="text-[9px] text-gray-400 mt-0.5">
          Scroll to explore app screens
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
