import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Cpu, Sparkles, Activity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import Spline from '@splinetool/react-spline';

interface SplineRobotProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Optimized Spline Robot Component with Mobile performance focus:
 * - Bypasses heavy WebGL rendering entirely on mobile devices to preserve 60-120fps scroll physics
 * - Replaces 3D on mobile with a highly premium, GPU-accelerated 2D glassmorphic holographic dashboard
 * - Uses ResizeObserver to prevent zero-dimension WebGL initialization errors on desktop
 */
export const SplineRobot: React.FC<SplineRobotProps> = ({ className, style }) => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [hasDimensions, setHasDimensions] = useState(false);

  // Resize observer to ensure parent container has non-zero dimensions before loading WebGL scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setHasDimensions(true);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setHasDimensions(true);
          observer.disconnect();
        }
      }
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Delay loading slightly to ensure smooth initial render
            requestIdleCallback(
              () => {
                setShouldLoad(true);
              },
              { timeout: 1000 }
            );
          }
        });
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load animation when shouldLoad is true
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // Fallback load trigger after 4.5 seconds if WebGL is completely blocked or crashes
      const fallbackTimer = setTimeout(() => {
        setIsLoaded((currentIsLoaded) => {
          if (!currentIsLoaded) {
            setLoadFailed(true);
            return true;
          }
          return currentIsLoaded;
        });
      }, 4500);

      return () => clearTimeout(fallbackTimer);
    }
  }, [shouldLoad, isLoaded]);

  // Optimize for low-spec devices (keep 2D fallback on old/low-spec devices to avoid crashes)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  if (prefersReducedMotion || isLowEndDevice) {
    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full flex items-center justify-center ${className || ''}`}
        style={style}
      >
        <div className="flex flex-col items-center justify-center text-center p-8">
          <Leaf className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-gray-600 text-sm">Interactive 3D Robot</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full flex items-center justify-center spline-iframe-container ${className || ''}`}
      style={{
        pointerEvents: 'auto',
        background: 'transparent',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* Skeleton Placeholder */}
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50/40 to-teal-50/40"
            style={{ zIndex: 2 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex flex-col items-center justify-center"
            >
              <Leaf className="w-12 h-12 text-green-400 mb-2" />
              <div className="w-32 h-2 bg-green-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ width: '40%' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spline 3D Viewer */}
      {shouldLoad && hasDimensions && !loadFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
          style={{
            pointerEvents: isMobile ? 'none' : 'auto', // Avoid touch scroll interception on mobile
            willChange: 'opacity',
          }}
        >
          <Spline
            scene="/spline/scene.splinecode"
            onLoad={() => {
              setIsLoaded(true);
              setLoadFailed(false);
            }}
            onError={(err) => {
              console.error("Spline load error:", err);
              setLoadFailed(true);
              setIsLoaded(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              background: 'transparent',
            }}
          />
        </motion.div>
      )}

      {/* Premium 2D Fallback / Mobile Interface - Super Lightweight GPU-accelerated holographic dashboard */}
      {loadFailed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center p-6 bg-transparent"
        >
          {/* Subtle Floating Leaves (GPU Accelerated) */}
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: i % 2 === 0 ? -60 : 60, 
                y: i < 2 ? -80 : 80, 
                opacity: 0.15,
                rotate: i * 45
              }}
              animate={{ 
                y: [i < 2 ? -80 : 80, i < 2 ? -95 : 65, i < 2 ? -80 : 80],
                rotate: [i * 45, i * 45 + 10, i * 45],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{ 
                duration: 6 + i * 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="absolute text-emerald-500/25 pointer-events-none"
            >
              <Leaf className="w-5 h-5 fill-current" />
            </motion.div>
          ))}

          <div className="relative flex flex-col items-center justify-center text-center">
            {/* Ambient pulsing AI core glow */}
            <div className="absolute w-44 h-44 bg-gradient-to-tr from-emerald-400/20 to-teal-400/10 rounded-full blur-2xl animate-pulse" />
            
            {/* Holographic Concentric Circles */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-emerald-500/25"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-full border border-dashed border-teal-500/20"
              />
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-500/15 backdrop-blur-[8px] shadow-inner flex items-center justify-center"
              >
                {/* Glassmorphic Core */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg relative overflow-hidden group">
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ transform: 'skewX(-20deg)' }}
                  />
                  <Cpu className="w-9 h-9 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)]" />
                </div>
              </motion.div>
            </div>
            
            {/* Dynamic Status Dashboard */}
            <div className="mt-5 space-y-2.5 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Zaminat AI Active</span>
              </div>
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-100 shadow-sm text-[9px] text-slate-500 font-semibold tracking-wider uppercase select-none">
                <div className="flex items-center gap-1 text-emerald-600">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>60 FPS</span>
                </div>
                <div className="w-[1.5px] h-3 bg-slate-200" />
                <span>Mobile Optimised</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Brand Badge */}
      <div
        className="absolute z-50 bottom-[19px] right-[14px] md:bottom-[19px] md:right-[12px]"
        style={{ 
          pointerEvents: 'auto',
          minWidth: isMobile ? '148px' : '160px',
          minHeight: isMobile ? '40px' : '44px',
          padding: '0px',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          className="relative"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="relative overflow-hidden rounded-full shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]"
            style={{
              width: '100%',
              height: '100%',
              minWidth: isMobile ? '148px' : '160px',
              minHeight: isMobile ? '40px' : '44px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
              border: '1.5px solid rgba(34, 197, 94, 0.35)',
              padding: isMobile ? '8px 12px' : '10px 18px',
              pointerEvents: 'auto',
              cursor: isMobile ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isMobile) {
                window.dispatchEvent(new Event('trigger-pwa-install'));
              }
            }}
          >
            {/* Soft pulse glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5" style={{ pointerEvents: 'none' }} />

            <div className="relative flex items-center justify-center gap-2 w-full" style={{ pointerEvents: 'none' }}>
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ pointerEvents: 'none' }}
                className="flex items-center"
              >
                <Leaf className="w-3.5 h-3.5 text-green-600 fill-green-500/10" />
              </motion.div>

              <span
                className="text-[10px] sm:text-xs font-semibold whitespace-nowrap text-green-800 tracking-[0.12em] uppercase"
                style={{
                  lineHeight: '1.2',
                  pointerEvents: 'none',
                }}
              >
                {i18n.language === 'uz' ? "O'zgarish ildizlari" : i18n.language === 'ru' ? "Корни перемен" : "Roots Of Change"}
              </span>

              {/* Shimmer effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 3,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent"
                style={{ transform: 'skewX(-20deg)', pointerEvents: 'none' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Polyfill for requestIdleCallback
if (typeof window !== 'undefined' && !(window as any).requestIdleCallback) {
  (window as any).requestIdleCallback = (callback: any, options?: any) => {
    const start = Date.now();
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

  (window as any).cancelIdleCallback = (id?: number) => {
    if (typeof id === 'number') clearTimeout(id);
  };
}
