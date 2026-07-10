import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PhoneMockup from '../pitch/PhoneMockup';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface FloatingAIPhoneProps {
  activeIndex?: number;
}

/**
 * AI screens data — matches the 6 feature cards in AICoreSection.
 * Images are full-quality JPGs served from /public/images/ai-screens/
 * with no compression or resizing applied.
 */
const AI_SCREENS = [
  { src: '/images/ai-screens/eco-scan.png?v=3', label: 'AI EcoScan' },
  { src: '/images/ai-screens/eco-coach.png?v=3', label: 'ZAMI AI Advisor' },
  { src: '/images/ai-screens/impact-engine.jpg?v=3', label: 'AI Impact Engine' },
  { src: '/images/ai-screens/anti-fraud.jpg?v=3', label: 'AI Anti-Fraud' },
  { src: '/images/ai-screens/ecokids-tutor.jpg?v=3', label: 'AI EcoKids Tutor' },
  { src: '/images/ai-screens/production-planner.jpg?v=3', label: 'AI Production Planner' },
];

/**
 * Premium phone mockup for the AI Core section.
 */
export default function FloatingAIPhone({ activeIndex: propActiveIndex }: FloatingAIPhoneProps) {
  const isMobile = useIsMobile();
  const [internalIndex, setInternalIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(AI_SCREENS.length).fill(false));
  const [isHovered, setIsHovered] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeIndex = propActiveIndex !== undefined ? propActiveIndex : internalIndex;
  const phoneWidth = isMobile ? 260 : 370;

  // Prevent background page scrolling when the lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

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

  if (isMobile) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full px-2">
        {/* Decorative Outer Shadow Ring */}
        <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-2xl scale-95 pointer-events-none" />

        {/* Flat mobile screen view without bezel frame */}
        <div className="relative w-full max-w-[290px] aspect-[9/19.2] overflow-hidden rounded-2xl border border-slate-150 bg-slate-950 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
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
                      imageRendering: 'high-quality',
                      WebkitImageRendering: '-webkit-optimize-contrast',
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
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Screen Selector Dots indicator */}
        <div className="flex items-center gap-1.5 mt-4.5 z-20">
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

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Decorative Outer Shadow Ring */}
      <div 
        className="absolute inset-0 bg-emerald-500/5 rounded-[48px] blur-3xl scale-95 pointer-events-none transition-all duration-500" 
        style={{
          transform: isHovered ? 'scale(1.1)' : 'scale(0.95)',
          opacity: isHovered ? 0.8 : 0.4
        }}
      />

      {/* Interactive Hover-Scale Wrapper */}
      <div 
        className="transition-all duration-500 ease-out cursor-zoom-in relative z-10 select-none"
        style={{
          transform: isHovered ? 'scale(1.15) translateY(-12px)' : 'scale(1) translateY(0)',
          filter: isHovered ? 'drop-shadow(0 25px 30px rgba(0,0,0,0.18))' : 'drop-shadow(0 8px 16px rgba(0,0,0,0.06))',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          setLightboxIndex(activeIndex);
          setIsLightboxOpen(true);
        }}
      >
        <PhoneMockup width={phoneWidth}>
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
                      imageRendering: 'high-quality',
                      WebkitImageRendering: '-webkit-optimize-contrast',
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

          {/* Interactive Zoom Overlay Badge (visible on hover) */}
          <div 
            className="absolute inset-0 z-30 bg-black/10 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <div className="p-3.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-2xl scale-95 transition-transform duration-300">
              <ZoomIn className="h-5 w-5" />
            </div>
          </div>
        </PhoneMockup>
      </div>

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

      {/* World-Class Lightbox Modal (Click to zoom to full size) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 cursor-zoom-out"
              onClick={() => {
                setIsLightboxOpen(false);
                setLightboxIndex(null);
              }}
            >
              {/* Close button */}
              <button 
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 flex items-center justify-center z-50 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); setLightboxIndex(null); }}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Lightbox content: Large, high-resolution mockup */}
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center select-none"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the phone itself
              >
                <PhoneMockup width={isMobile ? 290 : 420}>
                  <div 
                    className="phone-screen-scroll relative w-full h-full overflow-y-auto overflow-x-hidden"
                    style={{
                      position: 'relative',
                    }}
                  >
                    {/* Embedded custom scrollbar style */}
                    <style>{`
                      .phone-screen-scroll::-webkit-scrollbar {
                        width: 4px;
                      }
                      .phone-screen-scroll::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .phone-screen-scroll::-webkit-scrollbar-thumb {
                        background: rgba(16, 185, 129, 0.45);
                        border-radius: 9999px;
                      }
                      .phone-screen-scroll::-webkit-scrollbar-thumb:hover {
                        background: rgba(16, 185, 129, 0.7);
                      }
                    `}</style>
                    <img
                      src={AI_SCREENS[lightboxIndex !== null ? lightboxIndex : activeIndex].src}
                      alt={AI_SCREENS[lightboxIndex !== null ? lightboxIndex : activeIndex].label}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        imageRendering: 'high-quality',
                        WebkitImageRendering: '-webkit-optimize-contrast',
                      }}
                      draggable={false}
                    />
                  </div>
                </PhoneMockup>
                
                {/* Caption */}
                <div className="mt-4 px-6 py-2 rounded-full bg-white/10 border border-white/5 text-xs text-white/90 font-bold backdrop-blur-md uppercase tracking-wider shadow-xl">
                  {AI_SCREENS[lightboxIndex !== null ? lightboxIndex : activeIndex].label} (Full Resolution)
                </div>

                {/* Interactive Tip */}
                <div className="mt-2 text-[10px] text-emerald-400/90 font-bold tracking-wide flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SCROLL SCREEN TO EXPLORE FULL INTERFACE
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
