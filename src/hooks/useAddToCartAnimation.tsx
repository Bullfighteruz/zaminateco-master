import { useState, useCallback } from 'react';

interface AnimationState {
  isAnimating: boolean;
  productImage: string | null;
  startPosition: { x: number; y: number } | null;
}

export const useAddToCartAnimation = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    productImage: null,
    startPosition: null,
  });

  const triggerAnimation = useCallback((productImage: string, buttonElement: HTMLElement) => {
    // Get button position relative to viewport
    const rect = buttonElement.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    setAnimationState({
      isAnimating: true,
      productImage,
      startPosition: { x: startX, y: startY },
    });
  }, []);

  const completeAnimation = useCallback(() => {
    setAnimationState({
      isAnimating: false,
      productImage: null,
      startPosition: null,
    });
  }, []);

  return {
    animationState,
    triggerAnimation,
    completeAnimation,
  };
};

