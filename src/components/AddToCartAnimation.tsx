import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';

interface AddToCartAnimationProps {
  productImage: string;
  startPosition: { x: number; y: number };
  onComplete: () => void;
}

const AddToCartAnimation: React.FC<AddToCartAnimationProps> = ({
  productImage,
  startPosition,
  onComplete,
}) => {
  const isMobile = useIsMobile();
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Function to calculate target position
    const calculateTargetPosition = (): { x: number; y: number } => {
      // Priority 1: Try to find the actual FloatingCartIcon element using multiple methods
      let floatingCartIcon = document.querySelector('[data-floating-cart-icon="true"]') as HTMLElement;
      
      if (!floatingCartIcon) {
        floatingCartIcon = document.querySelector('[aria-label="Open shopping cart"]') as HTMLElement;
      }
      
      let x: number, y: number;
      
      if (floatingCartIcon) {
        // Use actual rendered position
        const rect = floatingCartIcon.getBoundingClientRect();
        
        // Check if element is properly positioned
        if (rect.width > 0 && rect.height > 0 && rect.top > 0) {
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else {
          // Element exists but not yet positioned, use fallback calculation
          const cartIconSize = isMobile ? 56 : 64;
          const navBarHeight = isMobile ? 60 : 50;
          const spacing = isMobile ? 20 : 20;
          const rightOffset = isMobile ? 16 : 24;
          const bottomOffset = navBarHeight + spacing;
          
          x = window.innerWidth - rightOffset - cartIconSize / 2;
          y = window.innerHeight - bottomOffset - cartIconSize / 2;
        }
      } else {
        // Fallback: Calculate position based on known styling
        // Navigation bar is approximately 60-70px tall
        // Cart icon is positioned above it
        const cartIconSize = isMobile ? 56 : 64; // h-14 w-14 = 56px, h-16 w-16 = 64px
        const navBarHeight = isMobile ? 60 : 50; // Approximate nav bar height
        const spacing = isMobile ? 20 : 20; // Space above nav bar
        const rightOffset = isMobile ? 16 : 24; // right-4 = 16px, right-6 = 24px
        const bottomOffset = navBarHeight + spacing; // Position above nav bar
        
        x = window.innerWidth - rightOffset - cartIconSize / 2;
        y = window.innerHeight - bottomOffset - cartIconSize / 2;
      }
      
      return { x, y };
    };

    // Use requestAnimationFrame to ensure DOM is ready, then calculate position
    let timer: NodeJS.Timeout;
    const rafId = requestAnimationFrame(() => {
      // Small additional delay to ensure FloatingCartIcon is fully rendered
      timer = setTimeout(() => {
        const position = calculateTargetPosition();
        setTargetPosition(position);
      }, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timer) clearTimeout(timer);
    };
  }, [isMobile]);

  if (!targetPosition) return null;

  return (
    <AnimatePresence mode="wait">
      {targetPosition && (
        <motion.div
          key="cart-animation"
          initial={{
            x: startPosition.x - 30, // Center the 60px element
            y: startPosition.y - 30,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: targetPosition.x - 30,
            y: targetPosition.y - 30,
            scale: [1, 1.4, 0.6, 0.3],
            opacity: [1, 1, 0.95, 0],
          }}
          exit={{
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 1.0,
            ease: [0.43, 0.13, 0.23, 0.96], // Smooth bezier curve for natural motion
          }}
          onAnimationComplete={onComplete}
          style={{
            position: 'fixed',
            zIndex: 99999,
            pointerEvents: 'none',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: 0,
            left: 0,
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            animate={{
              rotate: [0, 25, -25, 15, -15, 0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.0,
              ease: 'easeInOut',
            }}
          >
            <motion.img
              src={productImage}
              alt="Product"
              className="w-full h-full object-contain rounded-lg"
              style={{
                filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4))',
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
              }}
            />
          </motion.div>
          {/* Trailing glow effect */}
          <motion.div
            style={{
              position: 'absolute',
              inset: -15,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, rgba(34, 197, 94, 0.2) 40%, transparent 70%)',
              pointerEvents: 'none',
            }}
            animate={{
              scale: [1, 2, 2.5],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 1.0,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartAnimation;

