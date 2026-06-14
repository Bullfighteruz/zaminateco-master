import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const preloadLinkRef = useRef<HTMLLinkElement | null>(null);
  const isMobile = useIsMobile();

  // Preload Spline iframe in the background (low priority)
  useEffect(() => {
    // Create preload link for DNS prefetch and preconnect
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://my.spline.design';
    document.head.appendChild(preconnect);

    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = 'https://my.spline.design';
    document.head.appendChild(dnsPrefetch);

    // Preload iframe source after a short delay (non-blocking)
    const preloadTimer = setTimeout(() => {
      if (!shouldLoad && !isLoaded) {
        // Create hidden iframe for preloading
        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = 'https://my.spline.design/r4xbot-2nktQYWyjsecuJLGCyScQOuM/';
        preloadIframe.style.display = 'none';
        preloadIframe.style.width = '1px';
        preloadIframe.style.height = '1px';
        preloadIframe.style.opacity = '0';
        preloadIframe.style.pointerEvents = 'none';
        preloadIframe.loading = 'lazy';
        document.body.appendChild(preloadIframe);

        preloadIframe.onload = () => {
          // Once preloaded, remove the hidden iframe
          setTimeout(() => {
            if (preloadIframe.parentNode) {
              preloadIframe.parentNode.removeChild(preloadIframe);
            }
          }, 1000);
        };
      }
    }, 2000); // Wait 2 seconds before preloading

    return () => {
      clearTimeout(preloadTimer);
      if (preconnect.parentNode) preconnect.parentNode.removeChild(preconnect);
      if (dnsPrefetch.parentNode) dnsPrefetch.parentNode.removeChild(dnsPrefetch);
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

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    // Add smooth fade-in animation
    if (iframeRef.current) {
      iframeRef.current.style.opacity = '0';
      iframeRef.current.style.transition = 'opacity 0.5s ease-in';
      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.style.opacity = '1';
        }
      });
    }
  }, []);

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

      {/* Spline iframe - Only render when shouldLoad is true */}
      {shouldLoad && (
        <motion.iframe
          ref={iframeRef}
          src="https://my.spline.design/r4xbot-2nktQYWyjsecuJLGCyScQOuM/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full"
          style={{
            pointerEvents: 'auto',
            border: 'none',
            display: 'block',
            background: 'transparent',
            backgroundColor: 'transparent',
            mixBlendMode: 'normal',
            opacity: isLoaded ? 1 : 0,
            willChange: 'opacity',
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
            left: '0',
            right: '0',
            top: '0',
            bottom: '0',
          }}
          title="Spline 3D Interactive Robot"
          loading="lazy"
          allow="autoplay; fullscreen; accelerometer; gyroscope"
          onLoad={handleIframeLoad}
          // Performance optimizations
          importance="low"
        />
      )}

      {/* Creative "roots of change" overlay - Improved to fully cover Spline button */}
      <div
        className="absolute bottom-[10px] right-[6px] z-50"
        style={{ 
          pointerEvents: 'auto',
          minWidth: isMobile ? '150px' : '175px',
          minHeight: isMobile ? '48px' : '56px',
          padding: isMobile ? '2px' : '3px',
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
            className="relative overflow-hidden rounded-full shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] transition-all duration-300 hover:scale-[1.03]"
            style={{
              width: '100%',
              height: '100%',
              minWidth: isMobile ? '150px' : '175px',
              minHeight: isMobile ? '48px' : '56px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
              border: '1.5px solid rgba(34, 197, 94, 0.35)',
              padding: isMobile ? '11px 18px' : '14px 22px',
              pointerEvents: 'auto',
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                roots of change
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
// Type definitions for requestIdleCallback
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining(): number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface IdleRequestOptions {
  timeout?: number;
}

declare global {
  interface Window {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle?: number) => void;
  }
}

if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
    const timeout = options?.timeout || 0;
    const start = Date.now();
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

  window.cancelIdleCallback = (id?: number) => {
    if (typeof id === 'number') clearTimeout(id);
  };
}

