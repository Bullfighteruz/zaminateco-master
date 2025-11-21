/**
 * CategoryGrid Component
 * Animated category cards grid with auto-pulled images
 * Responsive 1/2/3/4-column layout
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  productCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export default function CategoryGrid({
  categories,
  onCategoryClick,
  className,
  columns = 4
}: CategoryGridProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('shop');

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const handleClick = (category: Category) => {
    onCategoryClick?.(category);
    // Navigate to shop with category filter
    navigate(`/shop?category=${encodeURIComponent(category.id)}`);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("grid gap-6", gridCols[columns])}>
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Card
              className="cursor-pointer overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-gray-200 group"
              onClick={() => handleClick(category)}
              role="button"
              tabIndex={0}
              aria-label={t('ariaLabels.browseCategory', { defaultValue: `Browse ${category.name} category`, category: category.name })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(category);
                }
              }}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
                <img
                  src={category.image}
                  alt={category.name}
                  className={cn(
                    "w-full h-full object-contain p-6 transition-transform duration-500",
                    "group-hover:scale-110"
                  )}
                  loading={index < 4 ? "eager" : "lazy"}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (category.icon) {
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.icon-fallback')) {
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'icon-fallback text-6xl';
                        iconSpan.textContent = category.icon;
                        parent.appendChild(iconSpan);
                      }
                    }
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 transition-colors duration-300" />
              </div>

              {/* Content */}
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
                {category.productCount !== undefined && (
                  <p className="text-xs text-gray-500">
                    {category.productCount} {t('productCount.other', { defaultValue: 'products', count: category.productCount })}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

