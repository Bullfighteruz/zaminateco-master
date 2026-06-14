/**
 * ProductCard Component
 * Animated product card with hover effects, recycled badge, and direct PDP link
 * Optimized for performance and accessibility - Mobile 2-column grid optimized
 */

import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Recycle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { productNameToSlug } from '@/utils/slug';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
// Using native img for better control over spacing

export interface ProductCardProps {
  id: number;
  name: string;
  englishName: string;
  description: string;
  image: string;
  price?: string;
  pricingUnit?: string;
  recycledPercent?: number;
  category?: string;
  isCallForPrice?: boolean;
  onAddToCart?: (product: ProductCardProps) => void;
  onViewDetails?: (product: ProductCardProps) => void;
  className?: string;
  index?: number;
}

function ProductCard({
  id,
  name,
  englishName,
  description,
  image,
  price,
  pricingUnit,
  recycledPercent,
  category,
  isCallForPrice,
  onAddToCart,
  onViewDetails,
  className,
  index = 0
}: ProductCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('shop');
  const isMobile = useIsMobile();

  const handleCardClick = useCallback(() => {
    // Save scroll position before navigating
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    sessionStorage.setItem('shopScrollPosition', scrollPosition.toString());
    
    // Use slug for clean URLs
    const slug = englishName ? productNameToSlug(englishName) : String(id);
    navigate(`/product/${slug}`);
    onViewDetails?.({ id, name, englishName, description, image, price, pricingUnit, recycledPercent, category, isCallForPrice });
  }, [navigate, englishName, id, onViewDetails, id, name, englishName, description, image, price, pricingUnit, recycledPercent, category, isCallForPrice]);

  const handleAddToCartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.({ id, name, englishName, description, image, price, pricingUnit, recycledPercent, category, isCallForPrice });
  }, [onAddToCart, id, name, englishName, description, image, price, pricingUnit, recycledPercent, category, isCallForPrice]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className={cn("h-full", className)}
    >
      <Card
        className={cn(
          "h-full flex flex-col cursor-pointer glass-card glass-card-hover border border-white/40 overflow-hidden group",
          isMobile && "min-h-0"
        )}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Image Container - Old Banner Style */}
        <div className="relative bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden aspect-square">
          {image ? (
              <img
                src={image}
                alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading={index < 6 ? "eager" : "lazy"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/art-tiles.webp";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Recycle className={cn(isMobile ? "w-8 h-8" : "w-16 h-16", "text-gray-400")} />
            </div>
          )}

          {/* Recycled Badge */}
          {recycledPercent !== undefined && (
            <Badge className={cn("absolute bg-emerald-600 text-white shadow-lg", isMobile ? "top-1 right-1 text-[8px] px-0.5 py-0" : "top-3 right-3")}>
              <Recycle className={cn(isMobile ? "h-1.5 w-1.5 mr-0.5" : "h-3 w-3 mr-1")} />
              {recycledPercent}%
            </Badge>
          )}

          {/* Category Badge - Hidden on mobile to save space */}
          {category && (
            <Badge
              variant="secondary"
              className={cn("absolute bg-white/90 backdrop-blur-sm text-gray-700", isMobile ? "hidden" : "top-3 left-3")}
            >
              {category}
            </Badge>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Content */}
        <CardContent className={cn("flex flex-col flex-1", isMobile ? "p-2 space-y-1" : "p-5 space-y-4")}>
          {/* Title and Description */}
          <div className="flex-1 space-y-0.5">
            <h3 className={cn("font-semibold text-gray-900 line-clamp-2", isMobile ? "text-[11px] min-h-[1.75rem] leading-tight" : "text-lg min-h-[3.5rem]")}>
              {name}
            </h3>
            <p className={cn("text-gray-600 line-clamp-1", isMobile ? "text-[9px] leading-tight" : "text-sm line-clamp-2")}>
              {description}
            </p>
          </div>

          {/* Price */}
          <div className={cn("border-t border-gray-100", isMobile ? "pt-1 mt-1" : "pt-2")}>
            {isCallForPrice ? (
              <p className={cn("font-bold text-orange-600 truncate", isMobile ? "text-[10px]" : "text-lg")}>
                {t('pricing.callForPrice', { defaultValue: 'Call for Price' })}
              </p>
            ) : (
              <div>
                <p className={cn("font-bold text-green-600 truncate", isMobile ? "text-xs" : "text-2xl")}>
                  {price || 'N/A'}
                </p>
                {pricingUnit && (
                  <p className={cn("text-gray-500 truncate", isMobile ? "text-[8px]" : "text-sm")}>{pricingUnit}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn("flex", isMobile ? "gap-1 pt-1" : "gap-2 pt-2")}>
            <Button
              data-product-id={id}
              className={cn("flex-1 bg-emerald-600 hover:bg-emerald-700 text-white", isMobile ? "h-7 text-[9px] px-1" : "")}
              onClick={handleAddToCartClick}
              size={isMobile ? "sm" : "sm"}
            >
              <ShoppingBag className={cn(isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-4 w-4 mr-2")} />
              <span className={cn(isMobile ? "truncate" : "")}>{isCallForPrice 
                  ? t('buttons.contactShort', { defaultValue: 'Contact' })
                  : t('buttons.cartShort', { defaultValue: 'Cart' })
                }</span>
            </Button>
            <Button
              variant="outline"
              className={cn("border-green-600 text-green-600 hover:bg-green-50 flex-shrink-0", isMobile ? "h-7 w-7 p-0" : "")}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              size={isMobile ? "sm" : "sm"}
              aria-label={`View details for ${name}`}
            >
              <ArrowRight className={cn(isMobile ? "h-2.5 w-2.5" : "h-4 w-4")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

// Memoize ProductCard to prevent unnecessary re-renders
// Only re-render if product data or index changes
export default memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.price === nextProps.price &&
    prevProps.image === nextProps.image &&
    prevProps.index === nextProps.index &&
    prevProps.recycledPercent === nextProps.recycledPercent
  );
});
