/**
 * ProductGallery Component
 * Masonry grid + lightbox viewer with swipe support
 * Optimized for mobile and desktop
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import ProfessionalImage from '../ui/ProfessionalImage';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ProductGallery({
  images,
  productName,
  className
}: ProductGalleryProps) {
  const { t } = useTranslation('shop');
  const isMobile = useIsMobile();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const validImages = images; // ProfessionalImage handles errors internally

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  if (validImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("w-full", className)}>
        <h2 className={cn(
          "font-bold mb-6",
          isMobile ? "text-xl" : "text-2xl md:text-3xl"
        )}>
          {t('productDetails.common.productGallery', { defaultValue: 'Product Gallery' })}
        </h2>

        {/* Desktop Grid */}
        {!isMobile && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {validImages.map((img, index) => (
              <motion.div
                key={`${img}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg bg-gray-100"
                onClick={() => {
                  setSelectedIndex(validImages.indexOf(img));
                  setLightboxOpen(true);
                }}
                role="button"
                tabIndex={0}
                aria-label={t('ariaLabels.viewImage', { defaultValue: `View image ${index + 1} of ${validImages.length}`, current: index + 1, total: validImages.length })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIndex(validImages.indexOf(img));
                    setLightboxOpen(true);
                  }
                }}
              >
                <ProfessionalImage
                  src={img}
                  alt={`${productName} - Image ${index + 1}`}
                  className="transition-transform duration-300 group-hover:scale-110"
                  priority={index < 4}
                  aspectRatio="square"
                  objectFit="cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  blurPlaceholder={true}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile Swipeable */}
        {isMobile && (
          <div className="relative">
            <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 flex gap-4 pb-4">
              {validImages.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="relative flex-shrink-0 w-[85vw] snap-center cursor-pointer bg-gray-100 rounded-lg min-h-[200px] flex items-center justify-center"
                  onClick={() => {
                    setSelectedIndex(index);
                    setLightboxOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={t('ariaLabels.viewImage', { defaultValue: `View image ${index + 1} of ${validImages.length}`, current: index + 1, total: validImages.length })}
                >
                  <ProfessionalImage
                    src={img}
                    alt={`${productName} - Image ${index + 1}`}
                    className="max-w-full rounded-lg"
                    priority={index < 2}
                    aspectRatio="auto"
                    objectFit="contain"
                    sizes="85vw"
                    blurPlaceholder={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && validImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-label={t('ariaLabels.imageLightbox', { defaultValue: 'Image lightbox' })}
            aria-modal="true"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label={t('ariaLabels.closeLightbox', { defaultValue: 'Close lightbox' })}
            >
              <X className="h-8 w-8" />
            </button>

            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 text-white hover:text-gray-300 z-10"
                  aria-label={t('ariaLabels.previousImage', { defaultValue: 'Previous image' })}
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 text-white hover:text-gray-300 z-10"
                  aria-label={t('ariaLabels.nextImage', { defaultValue: 'Next image' })}
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-7xl max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ProfessionalImage
                src={validImages[selectedIndex]}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                className="max-w-full max-h-[90vh] w-auto h-auto"
                priority={true}
                aspectRatio="auto"
                objectFit="contain"
                sizes="90vw"
                blurPlaceholder={true}
              />
            </motion.div>

            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
                <span className={cn(isMobile ? "text-sm" : "text-base")}>
                  {selectedIndex + 1} / {validImages.length}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

