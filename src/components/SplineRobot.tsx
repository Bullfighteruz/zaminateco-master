import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface SplineRobotProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Optimized Spline Robot Component with:
 * - Lazy loading with Intersection Observer
 * - Preloading strategy
 * - Skeleton placeholder
 * - Performance optimizations
 * - Progressive enhancement
 */
export const SplineRobot: React.FC<SplineRobotProps> = ({ className, style }) => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLElement>(null);
  const preloadLinkRef = useRef<HTMLLinkElement | null>(null);
  const isMobile = useIsMobile();

  // Preload Spline scene file in the background (low priority)
  useEffect(() => {
    // Create preload link for DNS prefetch and preconnect
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://prod.spline.design';
    document.head.appendChild(preconnect);

    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = 'https://prod.spline.design';
    document.head.appendChild(dnsPrefetch);

    // Preload scene asset after a short delay (non-blocking)
    const preloadTimer = setTimeout(() => {
      if (!shouldLoad && !isLoaded) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = 'https://prod.spline.design/YnRWMili7tld67PU/scene.splinecode';
        preloadLink.as = 'fetch';
        preloadLink.crossOrigin = 'anonymous';
        document.head.appendChild(preloadLink);
        preloadLinkRef.current = preloadLink;
      }
    }, 2000); // Wait 2 seconds before preloading

    return () => {
      clearTimeout(preloadTimer);
      if (preconnect.parentNode) preconnect.parentNode.removeChild(preconnect);
      if (dnsPrefetch.parentNode) dnsPrefetch.parentNode.removeChild(dnsPrefetch);
      if (preloadLinkRef.current && preloadLinkRef.current.parentNode) {
        preloadLinkRef.current.parentNode.removeChild(preloadLinkRef.current);
      }
    };
  }, [shouldLoad, isLoaded]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
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

  // Load iframe when shouldLoad is true
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      // Use requestAnimationFrame to ensure smooth loading
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [shouldLoad, isLoaded]);

  // Listen for spline-viewer load-complete event
  useEffect(() => {
    const viewer = iframeRef.current;
    if (!viewer) return;

    const handleLoadComplete = () => {
      setIsLoaded(true);
    };

    viewer.addEventListener('load-complete', handleLoadComplete);

    // Fallback load trigger after 4 seconds (in case event isn't supported or fails)
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        setIsLoaded(true);
      }
    }, 4000);

    return () => {
      viewer.removeEventListener('load-complete', handleLoadComplete);
      clearTimeout(fallbackTimer);
    };
  }, [shouldLoad, isLoaded]);

  // Optimize for low-end devices
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  if (prefersReducedMotion || isLowEndDevice) {
    // Return static placeholder for low-end devices
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
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50"
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

      {/* Spline 3D Viewer - Only render when shouldLoad is true */}
      {shouldLoad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
          style={{
            pointerEvents: 'auto',
            willChange: 'opacity',
          }}
        >
          <spline-viewer
            ref={iframeRef as any}
            url="https://prod.spline.design/YnRWMili7tld67PU/scene.splinecode"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              background: 'transparent',
            }}
          />
        </motion.div>
      )}

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
                {isMobile
                  ? (i18n.language === 'uz' ? "App-ni o'rnatish" : i18n.language === 'ru' ? "Скачать App" : "Install App")
                  : "roots of change"}
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

