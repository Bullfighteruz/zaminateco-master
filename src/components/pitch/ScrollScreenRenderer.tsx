import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, type MotionValue, useMotionValueEvent } from 'framer-motion';

const APP_SCREENS = [
  { src: '/images/app-screens/eco-map.webp', label: 'EcoMap' },
  { src: '/images/app-screens/eco-vote.webp', label: 'EcoVote' },
  { src: '/images/app-screens/eco-hub.webp', label: 'EcoHub' },
  { src: '/images/app-screens/profile.webp', label: 'Profile' },
  { src: '/images/app-screens/eco-actions.webp', label: 'EcoActions' },
];

interface ScrollScreenRendererProps {
  scrollProgress: MotionValue<number>;
  className?: string;
}

/**
 * Scroll-driven screenshot renderer.
 * Maps a 0–1 MotionValue to one of 6 app screens and
 * crossfades between them with a smooth slide-up transition.
 */
export default function ScrollScreenRenderer({ scrollProgress, className }: ScrollScreenRendererProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(APP_SCREENS.length).fill(false));

  // Preload all images on mount
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

  // Map scroll progress → active screen index
  useMotionValueEvent(scrollProgress, 'change', (latest) => {
    const segmentSize = 1 / APP_SCREENS.length;
    const newIndex = Math.min(
      APP_SCREENS.length - 1,
      Math.max(0, Math.floor(latest / segmentSize))
    );
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  });

  const currentScreen = APP_SCREENS[activeIndex];

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
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
              loading="eager"
              draggable={false}
            />
          ) : (
            /* Shimmer loading placeholder */
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
  );
}

export { APP_SCREENS };
