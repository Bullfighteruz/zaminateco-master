/**
 * ImageCarousel Component
 * A simple, optimized image carousel with manual navigation
 * Images maintain their natural aspect ratios
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface ScrollImageCarouselProps {
  images: string[];
  sections?: string[]; // Optional, kept for backward compatibility but not used
  className?: string;
  variant?: 'inline' | 'sticky' | 'floating';
  transitionDuration?: number;
}

export default function ScrollImageCarousel({
  images,
  sections,
  className,
  variant = 'inline',
  transitionDuration = 800
}: ScrollImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageError, setImageError] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<number, HTMLImageElement>>(new Map());
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
  
  // Touch/swipe state for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  
  // Minimum swipe distance (in pixels) to trigger navigation
  const minSwipeDistance = 50;

  // Manual navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    
    const touch = e.targetTouches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
    
    const distanceX = Math.abs(touchStartX.current - touch.clientX);
    const distanceY = Math.abs(touchStartY.current - touch.clientY);
    
    // If horizontal movement is significantly greater than vertical, prevent default to allow swipe
    // This prevents page scrolling when user is trying to swipe the carousel
    if (distanceX > distanceY * 1.2 && distanceX > 15) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null || touchStartY.current === null || touchEndY.current === null) {
      // Reset if incomplete
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
      return;
    }
    
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);
    
    // Check if it's a horizontal swipe (not vertical scroll)
    // Require horizontal movement to be at least 1.5x the vertical movement
    if (absDistanceX > absDistanceY * 1.5 && absDistanceX > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - go to next
        goToNext();
      } else {
        // Swipe right - go to previous
        goToPrevious();
      }
    }
    
    // Reset touch positions
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  }, [goToNext, goToPrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHovered && containerRef.current?.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, goToPrevious, goToNext]);

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      images.forEach((imageSrc, index) => {
        if (!loadedImages.has(index) && !imageError.has(index)) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
          };
          img.onerror = () => {
            setImageError(prev => new Set([...prev, index]));
          };
          img.src = imageSrc;
        }
      });
    };

    preloadImages();
  }, [images, loadedImages, imageError]);

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    const preloadAdjacent = () => {
      const indicesToPreload = [
        currentIndex - 1 >= 0 ? currentIndex - 1 : images.length - 1,
        currentIndex + 1 < images.length ? currentIndex + 1 : 0,
      ];

      indicesToPreload.forEach(index => {
        if (!loadedImages.has(index) && !imageError.has(index)) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
          };
          img.onerror = () => {
            setImageError(prev => new Set([...prev, index]));
          };
          img.src = images[index];
        }
      });
    };

    preloadAdjacent();
  }, [currentIndex, images, loadedImages, imageError]);


  if (!images.length) return null;

  const containerClasses = cn(
    "relative overflow-hidden",
    "transition-all duration-500",
    variant === 'sticky' && "sticky top-24 z-10",
    variant === 'floating' && "fixed top-24 right-8 z-10 max-w-md",
    isMobile ? "w-full" : variant === 'floating' ? "w-96" : "w-full",
    className
  );

  return (
    <motion.div
      ref={containerRef}
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: isHovered && !isMobile ? 1.02 : 1
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Container with Natural Aspect Ratio - Professional Design */}
      <div 
        className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-transparent"
        style={{
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          minHeight: isMobile ? '250px' : '400px',
          maxHeight: isMobile ? '500px' : '800px',
          touchAction: isMobile ? 'pan-y pinch-zoom' : 'auto', // Allow vertical scrolling and pinch zoom, handle horizontal swipes
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading Spinner - Subtle */}
        {!loadedImages.has(currentIndex) && !imageError.has(currentIndex) && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 rounded-2xl">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {!imageError.has(currentIndex) && (
            <motion.img
              key={currentIndex}
              ref={(el) => {
                if (el) imageRefs.current.set(currentIndex, el);
              }}
              src={images[currentIndex]}
              alt={`ZAMINAT.eco brand image ${currentIndex + 1}`}
              className={cn(
                "max-w-full max-h-full w-auto h-auto",
                "object-contain",
                "bg-transparent",
                !loadedImages.has(currentIndex) && "opacity-0"
              )}
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: loadedImages.has(currentIndex) ? 1 : 0,
                scale: 1 
              }}
              exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
              transition={{
                duration: shouldReduceMotion ? 0 : transitionDuration / 1000,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={currentIndex === 0 ? "high" : "auto"}
              onLoad={() => {
                setLoadedImages(prev => new Set([...prev, currentIndex]));
              }}
              onError={() => {
                setImageError(prev => new Set([...prev, currentIndex]));
              }}
              style={{
                imageRendering: 'high-quality',
                WebkitImageRendering: 'high-quality',
                backgroundColor: 'transparent',
                display: 'block',
              }}
            />
          )}
          
          {/* Error Fallback */}
          {imageError.has(currentIndex) && (
            <div className="flex flex-col items-center justify-center bg-transparent p-8 min-h-[250px]">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm text-center">Image {currentIndex + 1} unavailable</p>
            </div>
          )}
        </AnimatePresence>


        {/* Image Counter Badge - Minimal Design */}
        <motion.div
          className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs font-medium text-white/90 tracking-wide">
            {currentIndex + 1} / {images.length}
          </span>
        </motion.div>

        {/* Navigation Arrows - Minimal Apple/Linear Style */}
        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2",
                "bg-black/30 backdrop-blur-md hover:bg-black/50",
                "text-white hover:text-white",
                "h-12 w-12 rounded-full",
                "transition-all duration-300",
                "shadow-lg",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-6 top-1/2 -translate-y-1/2",
                "bg-black/30 backdrop-blur-md hover:bg-black/50",
                "text-white hover:text-white",
                "h-12 w-12 rounded-full",
                "transition-all duration-300",
                "shadow-lg",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              )}
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Progress Indicator Dots - Minimal Design - Touch Friendly on Mobile */}
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 flex gap-2 items-center",
          isMobile ? "bottom-3" : "bottom-6"
        )}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                "focus:outline-none focus:ring-2 focus:ring-white/50",
                "touch-manipulation", // Optimize for touch
                index === currentIndex
                  ? isMobile ? "w-6 h-1.5 bg-white shadow-md" : "w-8 h-1.5 bg-white shadow-md"
                  : isMobile ? "w-1.5 h-1.5 bg-white/40 active:bg-white/60" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to image ${index + 1}`}
              style={{ touchAction: 'manipulation' }}
            />
          ))}
        </div>
      </div>

    </motion.div>
  );
}
