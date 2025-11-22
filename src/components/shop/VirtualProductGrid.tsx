/**
 * VirtualProductGrid Component
 * Implements virtual scrolling for large product lists
 * Only renders visible products + buffer for smooth performance
 * 
 * Industry standard: Like YouTube, Instagram, Twitter feeds
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ProductCard, { ProductCardProps } from './ProductCard';
import { ProductCardSkeleton } from '../ui/loading-skeleton';

interface VirtualProductGridProps {
  products: Array<{
    id: number;
    productName: string;
    englishName: string;
    descriptionKey: string;
    iconPath?: string;
    image?: string;
    price?: string;
    pricingKey?: string;
    recycledPercent?: number;
    categoryName?: string;
    isCallForPrice?: boolean;
  }>;
  onAddToCart: (product: ProductCardProps) => void;
  isLoading?: boolean;
  t: (key: string, options?: any) => string;
}

export default function VirtualProductGrid({
  products,
  onAddToCart,
  isLoading = false,
  t,
}: VirtualProductGridProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate item height based on view mode and device
  const itemHeight = useMemo(() => {
    if (isMobile) {
      // Mobile: 2 columns, each card is approximately 280px tall
      return 280;
    }
    // Desktop: 4 columns, each card is approximately 400px tall
    return 400;
  }, [isMobile]);

  // Get container height - use viewport height minus estimated header/filters
  const containerHeight = useMemo(() => {
    return window.innerHeight - 400;
  }, []);

  // Use virtual scrolling for large lists (20+ items)
  const shouldUseVirtual = products.length > 20;
  
  const {
    visibleItems,
    totalHeight,
    handleScroll,
    containerRef: virtualContainerRef,
    startIndex,
  } = useVirtualScroll(products, {
    itemHeight,
    containerHeight,
    overscan: 3, // Render 3 extra items above/below viewport
    enabled: shouldUseVirtual,
  });

  // Use the virtual container ref directly
  React.useEffect(() => {
    if (virtualContainerRef && containerRef.current) {
      if (typeof virtualContainerRef === 'function') {
        virtualContainerRef(containerRef.current);
      } else if (virtualContainerRef.current !== undefined) {
        (virtualContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = containerRef.current;
      }
    }
  }, [virtualContainerRef]);

  if (isLoading) {
    return (
      <div
        className={cn(
          isMobile
            ? "grid grid-cols-2 gap-1.5"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        )}
      >
        {Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} isMobile={isMobile} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={cn("text-gray-600", isMobile ? "text-base" : "text-lg")}>
          {t('noProductsFound', { defaultValue: 'No products found. Try adjusting your filters.', ns: 'shop' })}
        </p>
      </div>
    );
  }

  // If virtual scrolling is disabled or few items, render normally
  if (!shouldUseVirtual) {
    return (
      <div
        className={cn(
          isMobile
            ? "grid grid-cols-2 gap-1.5"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        )}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.productName}
            englishName={product.englishName}
            description={t(product.descriptionKey, { ns: 'shop' })}
            image={product.iconPath || product.image || ''}
            price={product.price}
            pricingUnit={t(product.pricingKey || 'pricing.perPiece', { ns: 'shop' })}
            recycledPercent={product.recycledPercent}
            category={product.categoryName}
            isCallForPrice={product.isCallForPrice}
            onAddToCart={onAddToCart}
            index={index}
          />
        ))}
      </div>
    );
  }

  // Virtual scrolling mode
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-auto"
      style={{
        height: containerHeight || 'calc(100vh - 400px)',
      }}
    >
      {/* Spacer for items above viewport */}
      <div style={{ height: startIndex * itemHeight }} />

      {/* Visible items */}
      <div
        className={cn(
          isMobile
            ? "grid grid-cols-2 gap-1.5"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        )}
      >
        {visibleItems.map((virtualItem) => {
          const product = virtualItem.item;
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.productName}
              englishName={product.englishName}
              description={t(product.descriptionKey, { ns: 'shop' })}
              image={product.iconPath || product.image || ''}
              price={product.price}
              pricingUnit={t(product.pricingKey || 'pricing.perPiece', { ns: 'shop' })}
              recycledPercent={product.recycledPercent}
              category={product.categoryName}
              isCallForPrice={product.isCallForPrice}
              onAddToCart={onAddToCart}
              index={virtualItem.index}
            />
          );
        })}
      </div>

      {/* Spacer for items below viewport */}
      <div
        style={{
          height: Math.max(0, (products.length - visibleItems[visibleItems.length - 1]?.index - 1) * itemHeight),
        }}
      />
    </div>
  );
}

