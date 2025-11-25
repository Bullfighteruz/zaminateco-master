import React, { useState, useEffect, useMemo, useCallback, useRef, startTransition } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ZoomIn, X, ChevronLeft, ChevronRight, Check, Leaf, Recycle, Download, FileText, Award, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/use-mobile';
import { useCart } from '../contexts/CartContext';
import { PRODUCT_DETAIL_DATA, getProductDetailData } from '../lib/productData';
import type { ProductDetailData } from '../lib/productData';
import { getProductImages } from '../lib/productImages';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAddToCartAnimation } from '../hooks/useAddToCartAnimation';
import AddToCartAnimation from '../components/AddToCartAnimation';
import { getImageUrlVariations } from '../utils/imageHelper';
import { getProductTranslationKey } from '../lib/productTranslationMapper';
import { productNameToSlug } from '../utils/slug';
import { useSEO } from '../hooks/useSEO';
import { useHreflang } from '../hooks/useHreflang';
import CartSidebar from '../components/CartSidebar';
import FloatingCartIcon from '../components/FloatingCartIcon';
import { contactHelpers } from '@/utils/mailto';

const BRAND_GREEN = '#009E60';
const BRAND_GOLD = '#E8C468';

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'EPDM-free Tiles': '/images/EPDM-free Tiles.png',
  'EPDM Rubber Ecotiles': '/images/EPDM Tiles.png',
  'EcoBrick': '/images/EcoBrick.png',
  'Waste Bin': '/images/Waste Bin.png',
  'Garden Planter': '/images/Garden Planter.png',
  'Eco Bench': '/images/Eco Bench.png',
  'ECOBIKE RACK': '/images/ECOBIKE RACK.png',
  'ECOBUSSTOP': '/images/ECOBUSSTOP.png',
  'Playground Block (Art Tiles)': '/images/art-tiles.png',
  'Ecostreet Furniture': '/images/green-city_5994274.png',
};

// Special marker for products that require price inquiry
const CALL_FOR_PRICE_MARKER = '__CALL_FOR_PRICE__';

const PRODUCT_PRICE_MAP: Record<string, string> = {
  'EPDM-free Tiles': '219 000 UZS',
  'EPDM Rubber Ecotiles': '539 000 UZS',
  'EcoBrick': '99 000 UZS',
  'Waste Bin': '79 000 UZS',
  'Garden Planter': '149 000 UZS',
  'Eco Bench': '790 000 UZS',
  'ECOBIKE RACK': '490 000 UZS',
  'ECOBUSSTOP': '8 590 000 UZS',
  'Playground Block (Art Tiles)': '49 000 UZS',
  'Ecostreet Furniture': CALL_FOR_PRICE_MARKER,
};

// Related Product Carousel Component
interface RelatedProductCarouselProps {
  product: ProductDetailData;
  productName: string;
  productPrice: string;
  images: string[];
  onNavigate: () => void;
  isMobile: boolean;
}

const RelatedProductCarousel = React.memo(({ product, productName, productPrice, images, onNavigate, isMobile }: RelatedProductCarouselProps) => {
  const { t } = useTranslation('shop');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const hoverIntervalRef = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Reset to first image when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images.length]);
  
  // Auto-scroll on hover
  useEffect(() => {
    if (isHovering && images.length > 1) {
      hoverIntervalRef.current = window.setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2000); // Change image every 2 seconds on hover
    } else {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
        hoverIntervalRef.current = null;
      }
    }
    
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [isHovering, images.length]);
  
  const goToNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);
  
  const goToPrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer group relative"
      onClick={onNavigate}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="button"
      tabIndex={0}
      aria-label={`View ${productName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
    >
      {/* Card Container with Enhanced Styling */}
      <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 group-hover:-translate-y-1">
        <div 
          ref={imageContainerRef}
          className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
          style={{ aspectRatio: '1 / 1', width: '100%' }}
        >
        {/* Image Container with Smooth Transitions - 1:1 Aspect Ratio */}
        {images.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
            {images.map((img, index) => (
              <img
                key={`${product.id}-${img}-${index}`}
                src={img}
                alt={`${productName} - View ${index + 1}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                  index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
                style={{ 
                  willChange: index === currentImageIndex ? 'opacity' : 'auto'
                }}
                loading={index === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = PRODUCT_IMAGE_MAP[product.englishName] || '/images/art-tiles.png';
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
            <img
              src={getIconForProductOrCategory(
                product.englishName,
                PRODUCT_IMAGE_MAP[product.englishName] || '/images/art-tiles.png'
              )}
              alt={productName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = PRODUCT_IMAGE_MAP[product.englishName] || '/images/art-tiles.png';
              }}
            />
          </div>
        )}
        
        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100 z-20",
                isMobile ? "h-7 w-7" : "h-8 w-8"
              )}
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeft className={cn("text-gray-700", isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </button>
            
            <button
              onClick={goToNext}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100 z-20",
                isMobile ? "h-7 w-7" : "h-8 w-8"
              )}
              aria-label="Next image"
              type="button"
            >
              <ChevronRight className={cn("text-gray-700", isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </button>
            
            {/* Image Indicator Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={cn(
                      "rounded-full transition-all",
                      index === currentImageIndex 
                        ? "bg-white w-2 h-2" 
                        : "bg-white/50 w-1.5 h-1.5 hover:bg-white/75"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Hover Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        
        {/* Quick View Badge */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-30">
          <div className={cn(
            "bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg",
            isMobile ? "text-[9px]" : "text-[10px]"
          )}>
            <span className="font-medium text-gray-800 flex items-center gap-1">
              <ShoppingBag className={cn("inline", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
              <span>View Details</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Product Info Section */}
      <div className="p-3 bg-white border-t border-gray-100">
        <h3 className={cn(
          "font-semibold text-gray-900 mb-1.5 group-hover:text-green-600 transition-colors duration-200 line-clamp-2",
          isMobile ? "text-xs leading-tight" : "text-sm leading-snug"
        )}>
          {productName}
        </h3>
        
        {/* Price with Enhanced Styling */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex-1">
            <div className={cn(
              "font-bold text-green-600",
              isMobile ? "text-sm" : "text-base"
            )}>
              {productPrice}
            </div>
            {productPrice !== t('pricing.callForPrice', { ns: 'shop', defaultValue: 'Call for price' }) && (
              <span className={cn(
                "text-gray-500",
                isMobile ? "text-[9px]" : "text-[10px]"
              )}>
                {t('pricing.perSqM', { ns: 'shop', defaultValue: 'per sq.m' })}
              </span>
            )}
          </div>
          
          {/* Arrow Icon */}
          <div className={cn(
            "bg-green-50 rounded-full p-1.5 group-hover:bg-green-100 transition-colors duration-200",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <ChevronRight className={cn("text-green-600", isMobile ? "h-3 w-3" : "h-4 w-4")} />
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
});

RelatedProductCarousel.displayName = 'RelatedProductCarousel';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['shop', 'translation']);
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const { animationState, triggerAnimation, completeAnimation } = useAddToCartAnimation();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // Touch swipe state for mobile - use refs to avoid re-renders
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);
  const isSwipingRef = useRef<boolean>(false);
  const minSwipeDistance = 50;
  
  // Fade animation state for smooth transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayImageIndex, setDisplayImageIndex] = useState(0);
  
  // Thumbnail carousel scroll state (for lightbox)
  const thumbnailScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeftThumb, setCanScrollLeftThumb] = useState(false);
  const [canScrollRightThumb, setCanScrollRightThumb] = useState(false);
  
  // Main gallery thumbnail carousel scroll state
  const mainThumbnailScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeftMain, setCanScrollLeftMain] = useState(false);
  const [canScrollRightMain, setCanScrollRightMain] = useState(false);
  
  const productDetail = useMemo(() => {
    if (!id) return null;
    // Use getProductDetailData which handles slugs, IDs, and names
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
      return getProductDetailData(numericId);
      }
    return getProductDetailData(id);
  }, [id]);
  
  const productKey = productDetail ? getProductTranslationKey(productDetail.englishName) : '';
  const detailBasePath = productDetail ? `productDetails.${productKey}` : '';
  const productName = productDetail
    ? t(productDetail.nameKey, { ns: 'shop' })
    : t('productDetails.common.productNotFound', { defaultValue: 'Product Not Found', ns: 'shop' });
  const productDescription = productDetail
    ? t(productDetail.descriptionKey, { ns: 'shop' })
    : t('productDetails.common.productNotFoundDescription', { defaultValue: 'The product you are looking for does not exist.', ns: 'shop' });
  const productCategory = productDetail
    ? t(productDetail.categoryKey, { ns: 'shop' })
    : t('productDetails.common.categoryFallback', { ns: 'shop', defaultValue: 'Eco Product' });
  const priceValue = productDetail ? PRODUCT_PRICE_MAP[productDetail.englishName] || CALL_FOR_PRICE_MARKER : CALL_FOR_PRICE_MARKER;
  const price = priceValue === CALL_FOR_PRICE_MARKER
    ? t('pricing.callForPrice', { ns: 'shop', defaultValue: 'Call for price' })
    : priceValue;
  
  const getTranslated = useCallback((path: string, fallback: string) => {
    if (!productDetail || !detailBasePath) return fallback;
    return t(`${detailBasePath}.${path}`, { ns: 'shop', defaultValue: fallback });
  }, [productDetail, detailBasePath, t]);
  
  useEffect(() => {
    if (productDetail?.folderName) {
      // Get all images from the product folder
      let images = getProductImages(productDetail.folderName);
      
      // Remove duplicates from the image array
      images = Array.from(new Set(images));
      
      // If no images found, fallback to main product image
      if (images.length === 0 && PRODUCT_IMAGE_MAP[productDetail.englishName]) {
        images = [PRODUCT_IMAGE_MAP[productDetail.englishName]];
      } else if (images.length > 0 && PRODUCT_IMAGE_MAP[productDetail.englishName]) {
        // Ensure the fallback image is not already in the list
        const fallbackImage = PRODUCT_IMAGE_MAP[productDetail.englishName];
        if (!images.includes(fallbackImage)) {
          // Don't add it if it's already there, but also don't add it as duplicate
        }
      }
      
      // Set all images (they will be filtered by failedImages if needed)
      setProductImages(images);
      // Reset failed images when product changes
      setFailedImages(new Set());
      // Reset selected image index
      setSelectedImageIndex(0);
      setDisplayImageIndex(0);
      
      // Optimized image preloading - only preload first 3 images immediately
      // Rest will be loaded on demand or when visible
      const preloadImages = (imageList: string[], count: number = 3) => {
        requestAnimationFrame(() => {
          imageList.slice(0, count).forEach((src) => {
            const img = new Image();
            img.loading = 'eager';
            img.src = src;
          });
        });
      };
      
      preloadImages(images, 3);
    }
  }, [productDetail]);
  
  // Filter out failed images and remove duplicates
  const validProductImages = useMemo(() => {
    const filtered = productImages.filter(img => !failedImages.has(img));
    // Remove duplicates (normalize URLs for comparison)
    const uniqueImages: string[] = [];
    const seenUrls = new Set<string>();
    
    filtered.forEach(img => {
      try {
        // Normalize URL for comparison: decode URL encoding and normalize path separators
        let normalized = decodeURIComponent(img);
        // Normalize to forward slashes and lowercase for comparison
        // Also extract just the filename for comparison (in case same file is referenced differently)
        normalized = normalized.toLowerCase().replace(/\\/g, '/');
        
        // Extract filename for additional comparison
        const filename = normalized.split('/').pop() || normalized;
        
        // Check both full path and filename to catch duplicates
        if (!seenUrls.has(normalized) && !seenUrls.has(filename)) {
          seenUrls.add(normalized);
          seenUrls.add(filename);
          uniqueImages.push(img);
        }
      } catch (e) {
        // If decoding fails, use original URL
        const lowerImg = img.toLowerCase();
        const filename = lowerImg.split('/').pop() || lowerImg;
        if (!seenUrls.has(lowerImg) && !seenUrls.has(filename)) {
          seenUrls.add(lowerImg);
          seenUrls.add(filename);
          uniqueImages.push(img);
        }
      }
    });
    
    return uniqueImages;
  }, [productImages, failedImages]);
  
  const handleImageError = useCallback((imageSrc: string) => {
    // Optimized error handling - try variations without blocking
    const variations = getImageUrlVariations(imageSrc);
    let triedCount = 0;
    
    const tryNextVariation = () => {
      if (triedCount >= variations.length) {
        // All variations failed, mark as failed (non-blocking)
        startTransition(() => {
          setFailedImages(prev => new Set(prev).add(imageSrc));
        });
        return;
      }
      
      const variation = variations[triedCount];
      triedCount++;
      
      // Skip if it's the original or already failed
      if (variation === imageSrc || failedImages.has(variation)) {
        tryNextVariation();
        return;
      }
      
      const testImg = new Image();
      testImg.onload = () => {
        // Replace the failed image with working variation (non-blocking)
        // Only replace if the variation is not already in the array to avoid duplicates
        startTransition(() => {
          setProductImages(prev => {
            // Normalize variation for comparison
            let normalizedVariation: string;
            let variationFilename: string;
            try {
              normalizedVariation = decodeURIComponent(variation).toLowerCase().replace(/\\/g, '/');
              variationFilename = normalizedVariation.split('/').pop() || normalizedVariation;
            } catch {
              normalizedVariation = variation.toLowerCase();
              variationFilename = normalizedVariation.split('/').pop() || normalizedVariation;
            }
            
            // Check if variation already exists (by full path or filename)
            const hasVariation = prev.some(img => {
              try {
                const normalized = decodeURIComponent(img).toLowerCase().replace(/\\/g, '/');
                const filename = normalized.split('/').pop() || normalized;
                return normalized === normalizedVariation || filename === variationFilename;
              } catch {
                const lowerImg = img.toLowerCase();
                const filename = lowerImg.split('/').pop() || lowerImg;
                return lowerImg === normalizedVariation || filename === variationFilename;
              }
            });
            
            if (hasVariation) {
              // Variation already exists, just remove the failed image
              return prev.filter(img => img !== imageSrc);
            } else {
              // Replace failed image with working variation
              return prev.map(img => img === imageSrc ? variation : img);
            }
          });
        });
      };
      testImg.onerror = () => {
        // Try next variation
        tryNextVariation();
      };
      testImg.src = variation;
    };
    
    // Start trying variations
    tryNextVariation();
  }, [failedImages]);
  
  const heroImage = useMemo(() => {
    const imagesToUse = validProductImages.length > 0 ? validProductImages : productImages;
    if (imagesToUse.length === 0) {
      return PRODUCT_IMAGE_MAP[productDetail?.englishName || ''] || '';
    }
    const preferred = imagesToUse.find(img => 
      img.toLowerCase().includes('environment') || 
      img.toLowerCase().includes('collage') ||
      img.toLowerCase().includes('hero')
    );
    return preferred || imagesToUse[0];
  }, [validProductImages, productImages, productDetail]);
  
  // Helper function to get fallback image for current product
  const getFallbackImage = useCallback(() => {
    return PRODUCT_IMAGE_MAP[productDetail?.englishName || ''] || '/images/art-tiles.png';
  }, [productDetail]);
  
  const handleAddToCart = useCallback(() => {
    if (!productDetail) {
      toast.error(t('productNotFound', { ns: 'translation', defaultValue: 'Product not found' }));
      return;
    }
    
    const priceValue = PRODUCT_PRICE_MAP[productDetail.englishName] || CALL_FOR_PRICE_MARKER;
    if (priceValue === CALL_FOR_PRICE_MARKER) {
      try {
        const productName = t(productDetail.nameKey, { ns: 'shop' });
        const currentLanguage = i18n.language || 'en';
        contactHelpers.productInquiry(productName, currentLanguage);
        toast.info(t('openingEmail', { defaultValue: 'Opening email client...', ns: 'shop' }));
      } catch (error) {
        console.error('Error opening email client:', error);
        toast.error(t('emailError', { ns: 'shop', defaultValue: 'Error opening email client. Please contact us directly.' }));
      }
      return;
    }
    const price = priceValue;
    
    try {
    const button = document.querySelector('[data-add-to-cart]') as HTMLElement;
      if (button && heroImage) {
      triggerAnimation(heroImage, button);
    }
    
    addToCart({
      id: productDetail.id,
      productName: t(productDetail.nameKey, { ns: 'shop' }),
      price: price,
        image: heroImage || PRODUCT_IMAGE_MAP[productDetail.englishName] || '/images/art-tiles.png',
      description: t(productDetail.descriptionKey, { ns: 'shop' }),
      nameKey: productDetail.nameKey,
      descriptionKey: productDetail.descriptionKey,
    });
      
      toast.success(t('addedToCart', { ns: 'shop', defaultValue: 'Added to cart!' }));
    
    setTimeout(() => {
      let floatingCartIcon = document.querySelector('[data-floating-cart-icon="true"]') as HTMLElement;
      if (!floatingCartIcon) {
          floatingCartIcon = document.querySelector(`[aria-label="${t('ariaLabels.openShoppingCart', { ns: 'shop', defaultValue: 'Open shopping cart' })}"]`) as HTMLElement;
      }
      if (floatingCartIcon) {
        floatingCartIcon.style.animation = 'none';
        void floatingCartIcon.offsetWidth;
        floatingCartIcon.style.animation = 'cartBounce 0.6s ease-in-out';
        setTimeout(() => {
          floatingCartIcon.style.animation = '';
        }, 600);
      }
    }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('cartError', { ns: 'shop', defaultValue: 'Error adding product to cart. Please try again.' }));
    }
  }, [productDetail, heroImage, addToCart, triggerAnimation, t]);
  
  // Throttled scroll handler for better performance
  const scrollTimeoutRef = useRef<number | null>(null);
  const checkMainThumbnailScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      const container = mainThumbnailScrollRef.current;
      if (!container) return;
      
      const canScrollLeft = container.scrollLeft > 10;
      const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
      
      // Batch state updates
      startTransition(() => {
        setCanScrollLeftMain(canScrollLeft);
        setCanScrollRightMain(canScrollRight);
      });
    });
  }, []);
  
  // Scroll thumbnail carousel to show selected thumbnail - optimized with RAF
  const scrollToThumbnail = useCallback((index: number) => {
    requestAnimationFrame(() => {
      const container = mainThumbnailScrollRef.current;
      if (!container) return;
      
      const thumbnailButtons = container.querySelectorAll('button');
      if (thumbnailButtons[index]) {
        const thumbnail = thumbnailButtons[index] as HTMLElement;
        
        // Calculate scroll position to center the thumbnail
        const scrollLeft = thumbnail.offsetLeft - (container.clientWidth / 2) + (thumbnail.offsetWidth / 2);
        
        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
        
        // Update scroll state after animation (throttled)
        setTimeout(checkMainThumbnailScroll, 400);
      }
    });
  }, [checkMainThumbnailScroll]);

  // Smooth fade image transition (optimized with RAF)
  const nextImage = useCallback(() => {
    if (validProductImages.length === 0 || isTransitioning) return;
    const nextIndex = (displayImageIndex + 1) % validProductImages.length;
    
    requestAnimationFrame(() => {
      setIsTransitioning(true);
      setSelectedImageIndex(nextIndex);
      setDisplayImageIndex(nextIndex);
      
      // Scroll thumbnail carousel (non-blocking)
      requestAnimationFrame(() => {
        scrollToThumbnail(nextIndex);
      });
      
      // Reset after fade animation completes (faster for instant switching)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    });
  }, [validProductImages.length, isTransitioning, displayImageIndex, scrollToThumbnail]);

  const prevImage = useCallback(() => {
    if (validProductImages.length === 0 || isTransitioning) return;
    const prevIndex = (displayImageIndex - 1 + validProductImages.length) % validProductImages.length;
    
    requestAnimationFrame(() => {
      setIsTransitioning(true);
      setSelectedImageIndex(prevIndex);
      setDisplayImageIndex(prevIndex);
      
      // Scroll thumbnail carousel (non-blocking)
      requestAnimationFrame(() => {
        scrollToThumbnail(prevIndex);
      });
      
      // Reset after fade animation completes (faster for instant switching)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    });
  }, [validProductImages.length, isTransitioning, displayImageIndex, scrollToThumbnail]);
  
  // Handle direct thumbnail selection with fade animation
  const handleThumbnailClick = useCallback((index: number) => {
    if (isTransitioning || index === displayImageIndex) return;
    
    requestAnimationFrame(() => {
      setIsTransitioning(true);
      setSelectedImageIndex(index);
      setDisplayImageIndex(index);
      
      // Scroll thumbnail carousel (non-blocking)
      requestAnimationFrame(() => {
        scrollToThumbnail(index);
      });
      
      // Reset after fade animation completes (faster for instant switching)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    });
  }, [displayImageIndex, isTransitioning, scrollToThumbnail]);
  
  // Check thumbnail scroll position
  const checkThumbnailScroll = useCallback(() => {
    const container = thumbnailScrollRef.current;
    if (!container) return;
    setCanScrollLeftThumb(container.scrollLeft > 10);
    setCanScrollRightThumb(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);
  
  // Scroll thumbnails (for lightbox)
  const scrollThumbnails = useCallback((direction: 'left' | 'right') => {
    const container = thumbnailScrollRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkThumbnailScroll, 300);
  }, [checkThumbnailScroll]);
  
  // Scroll main gallery thumbnails
  const scrollMainThumbnails = useCallback((direction: 'left' | 'right') => {
    const container = mainThumbnailScrollRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkMainThumbnailScroll, 300);
  }, [checkMainThumbnailScroll]);
  
  // Touch swipe handlers for mobile (main image and lightbox) - optimized with refs
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't prevent default initially - allow vertical scrolling
    touchEndRef.current = null;
    touchEndYRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    isSwipingRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current === null || touchStartYRef.current === null) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartRef.current);
    const deltaY = Math.abs(currentY - touchStartYRef.current);
    
    // Only consider it a horizontal swipe if horizontal movement is significantly greater than vertical
    // This allows vertical page scrolling to work normally
    if (deltaX > deltaY && deltaX > 15) {
      // User is swiping horizontally - prevent vertical scroll
      if (!isSwipingRef.current) {
        isSwipingRef.current = true;
      }
      // Only prevent default if we're definitely doing a horizontal swipe
      if (deltaX > 20) {
        e.preventDefault();
      }
    } else if (deltaY > deltaX && deltaY > 15) {
      // User is scrolling vertically - allow it, don't interfere
      isSwipingRef.current = false;
      return;
    }
    
    touchEndRef.current = currentX;
    touchEndYRef.current = currentY;
  }, []);

  const onTouchEnd = useCallback((e?: React.TouchEvent) => {
    if (touchStartRef.current === null || touchEndRef.current === null) {
      // Reset if incomplete touch
      touchStartRef.current = null;
      touchEndRef.current = null;
      touchStartYRef.current = null;
      touchEndYRef.current = null;
      isSwipingRef.current = false;
      return;
    }
    
    // Only process swipe if it was a horizontal swipe
    if (isSwipingRef.current) {
      const distance = touchStartRef.current - touchEndRef.current;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe || isRightSwipe) {
        // Prevent click event if swipe was detected
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        if (isLeftSwipe && validProductImages.length > 1) {
          nextImage();
        }
        if (isRightSwipe && validProductImages.length > 1) {
          prevImage();
        }
      }
    }
    
    // Reset touch values after a delay to prevent click events
    setTimeout(() => {
      touchStartRef.current = null;
      touchEndRef.current = null;
      touchStartYRef.current = null;
      touchEndYRef.current = null;
      isSwipingRef.current = false;
    }, 100);
  }, [validProductImages.length, nextImage, prevImage]);
  
  // Touch swipe handlers for thumbnail carousel - allow natural scrolling
  const thumbTouchStartRef = useRef<number | null>(null);
  const thumbTouchEndRef = useRef<number | null>(null);
  const thumbIsScrollingRef = useRef<boolean>(false);
  const thumbScrollTimeoutRef = useRef<number | null>(null);
  
  const onThumbTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't prevent default - allow natural scrolling
    thumbTouchEndRef.current = null;
    thumbTouchStartRef.current = e.targetTouches[0].clientX;
    thumbIsScrollingRef.current = false;
    
    // Clear any existing timeout
    if (thumbScrollTimeoutRef.current) {
      clearTimeout(thumbScrollTimeoutRef.current);
    }
  }, []);

  const onThumbTouchMove = useCallback((e: React.TouchEvent) => {
    if (thumbTouchStartRef.current === null) return;
    
    const currentX = e.targetTouches[0].clientX;
    const deltaX = Math.abs(currentX - thumbTouchStartRef.current);
    
    // If user is scrolling horizontally, mark as scrolling
    if (deltaX > 5) {
      thumbIsScrollingRef.current = true;
    }
    
    thumbTouchEndRef.current = currentX;
  }, []);

  const onThumbTouchEnd = useCallback((e?: React.TouchEvent) => {
    if (thumbTouchStartRef.current === null || thumbTouchEndRef.current === null) {
      thumbTouchStartRef.current = null;
      thumbTouchEndRef.current = null;
      thumbIsScrollingRef.current = false;
      return;
    }
    
    // Only handle swipe if user wasn't scrolling the carousel
    if (!thumbIsScrollingRef.current) {
      const distance = thumbTouchStartRef.current - thumbTouchEndRef.current;
      const thumbMinSwipeDistance = 50;
      const isLeftSwipe = distance > thumbMinSwipeDistance;
      const isRightSwipe = distance < -thumbMinSwipeDistance;
      
      if (isLeftSwipe && validProductImages.length > 1) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        nextImage();
      }
      if (isRightSwipe && validProductImages.length > 1) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        prevImage();
      }
    }
    
    // Reset after a delay to allow click events if no swipe occurred
    thumbScrollTimeoutRef.current = window.setTimeout(() => {
      thumbTouchStartRef.current = null;
      thumbTouchEndRef.current = null;
      thumbIsScrollingRef.current = false;
    }, 150);
  }, [validProductImages.length, nextImage, prevImage]);
  
  useEffect(() => {
    if (!lightboxOpen || validProductImages.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxOpen(false);
      }
    };
    
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
      // Hide navigation bars when lightbox is open
      const navElements = document.querySelectorAll('nav[class*="fixed"], header[class*="sticky"]');
      navElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // Check thumbnail scroll on lightbox open
      setTimeout(checkThumbnailScroll, 100);
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        
        // Restore navigation bars when lightbox closes
        navElements.forEach((el) => {
          (el as HTMLElement).style.display = '';
        });
        
        // Cleanup thumb scroll timeout
        if (thumbScrollTimeoutRef.current) {
          clearTimeout(thumbScrollTimeoutRef.current);
          thumbScrollTimeoutRef.current = null;
        }
      };
    }, [lightboxOpen, nextImage, prevImage, validProductImages.length, checkThumbnailScroll]);
    
    // Monitor thumbnail scroll position (for lightbox) - throttled
    useEffect(() => {
      const container = thumbnailScrollRef.current;
      if (!container || !lightboxOpen) return;
      
      let rafId: number;
      const handleScroll = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(checkThumbnailScroll);
      };
      
      checkThumbnailScroll();
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, [checkThumbnailScroll, lightboxOpen, validProductImages.length]);
    
    // Monitor main gallery thumbnail scroll position - throttled with passive listener
    useEffect(() => {
      const container = mainThumbnailScrollRef.current;
      if (!container) return;
      
      let rafId: number;
      const handleScroll = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(checkMainThumbnailScroll);
      };
      
      checkMainThumbnailScroll();
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (rafId) cancelAnimationFrame(rafId);
        if (scrollTimeoutRef.current) cancelAnimationFrame(scrollTimeoutRef.current);
      };
    }, [checkMainThumbnailScroll, validProductImages.length]);
    
    // Auto-scroll thumbnail carousel when main image changes (optimized with RAF)
    useEffect(() => {
      if (validProductImages.length > 1 && displayImageIndex !== undefined) {
        // Use RAF to ensure DOM is updated before scrolling
        const rafId = requestAnimationFrame(() => {
          scrollToThumbnail(displayImageIndex);
        });
        return () => cancelAnimationFrame(rafId);
      }
    }, [displayImageIndex, validProductImages.length, scrollToThumbnail]);
  
  const renderProductNotFound = () => (
    <Layout title={t('productNotFound', { defaultValue: 'Product Not Found', ns: 'translation' })}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <h1 className="text-2xl font-bold">{t('productDetails.common.productNotFound', { defaultValue: 'Product Not Found', ns: 'shop' })}</h1>
            <p className="text-gray-600">{t('productDetails.common.productNotFoundDescription', { defaultValue: "The product you're looking for doesn't exist.", ns: 'shop' })}</p>
            <Button onClick={() => {
              // Navigate back to shop - scroll position will be restored by Shop component
              navigate('/shop');
            }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToShop', { defaultValue: 'Back to Shop', ns: 'shop' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
  
  // Memoize expensive translations for better performance
  const translatedOverview = useMemo(() => {
    if (!productDetail) {
      return {
        title: '',
        description: '',
        specifications: [],
      };
    }
    return {
      title: getTranslated('overview.title', productDetail.overview.title),
      description: getTranslated('overview.description', productDetail.overview.description),
      specifications: productDetail.overview.specifications.map((spec, index) => 
        getTranslated(`overview.specs.${index}`, spec)
      ),
    };
  }, [productDetail, getTranslated]);
  
  // Get translated badges - memoized
  const translatedBadges = useMemo(() => {
    if (!productDetail) return [];
    return productDetail.badges.map((badge, index) => {
      const badgeKeys = ['recycledMaterial', 'heatResistant', 'frostResistant', 'uvStabilized', 'nonToxic', 
                        'en1177Certified', 'weatherproof', 'lightweight', 'modularDesign', 'drainageSystem',
                        'uvResistant', 'easyToClean', 'maintenanceFree', 'secureDesign', 'modular',
                        'completeInfrastructure', 'customizable', 'creativeDesigns', 'safeForKids'];
      const key = badgeKeys[index] || index.toString();
      return {
        ...badge,
        text: getTranslated(`badges.${key}`, badge.text),
      };
    });
  }, [productDetail, getTranslated]);
  
  // Get translated technical specs - memoized
  const translatedTechnicalSpecs = useMemo(() => {
    if (!productDetail) return [];
    return productDetail.technicalSpecs.map((spec) => {
      const labelMap: Record<string, string> = {
        'Size': 'technicalSpecs.size',
        'Thickness': 'technicalSpecs.thickness',
        'Weight': 'technicalSpecs.weight',
        'Density': 'technicalSpecs.density',
        'Base Material': 'technicalSpecs.baseMaterial',
        'Top Layer': 'technicalSpecs.topLayer',
        'Compressive Strength': 'technicalSpecs.compressiveStrength',
        'Shore Hardness': 'technicalSpecs.shoreHardness',
        'Water Absorption': 'technicalSpecs.waterAbsorption',
        'UV Rating': 'technicalSpecs.uvRating',
        'Temperature Range': 'technicalSpecs.temperatureRange',
        'Lifespan': 'technicalSpecs.lifespan',
        'Manufacturing': 'technicalSpecs.manufacturing',
        'Standards': 'technicalSpecs.standards',
        'Standard Size': 'technicalSpecs.standardSize',
        'Material': 'technicalSpecs.material',
        'Capacity': 'technicalSpecs.capacity',
        'Wall Thickness': 'technicalSpecs.wallThickness',
        'Dimensions': 'technicalSpecs.dimensions',
        'Length': 'technicalSpecs.length',
        'Width': 'technicalSpecs.width',
        'Height': 'technicalSpecs.height',
        'Load Capacity': 'technicalSpecs.loadCapacity',
        'HIC Value': 'technicalSpecs.hicValue',
        'Critical Fall Height': 'technicalSpecs.criticalFallHeight',
        'Seating Capacity': 'technicalSpecs.seatingCapacity',
        'Customization': 'technicalSpecs.customization',
      };
      const labelKey = labelMap[spec.label] || `technicalSpecs.${spec.label.toLowerCase().replace(/\s+/g, '')}`;
      return {
        ...spec,
        label: getTranslated(labelKey, spec.label),
      };
    });
  }, [productDetail, getTranslated]);
  
  // Get translated sustainability metrics - memoized
  const translatedSustainability = useMemo(() => {
    if (!productDetail) return [];
    return productDetail.sustainability.map((metric) => {
      const labelMap: Record<string, string> = {
        'Recycled Rubber': 'sustainability.recycledRubber',
        'Recycled Plastic': 'sustainability.recycledPlastic',
        'CO2 Reduction': 'sustainability.co2Reduction',
        'Waste Diverted': 'sustainability.wasteDiverted',
        'Social Impact': 'sustainability.socialImpact',
        'Recyclable': 'sustainability.recyclable',
        'Recycled Steel': 'sustainability.recycledSteel',
      };
      const labelKey = labelMap[metric.label] || `sustainability.${metric.label.toLowerCase().replace(/\s+/g, '')}`;
      const descMap: Record<string, string> = {
        'From waste tires': 'sustainability.fromWasteTires',
        'HDPE/PP waste': 'sustainability.hdpPpWaste',
        'vs virgin materials': 'sustainability.vsVirginMaterials',
        'From landfill': 'sustainability.fromLandfill',
        'Community mahalla projects supported': 'sustainability.communityMahalla',
        'EcoKids playground projects supported': 'sustainability.ecokidsProjects',
        'vs traditional bricks': 'sustainability.vsTraditionalBricks',
        'vs virgin HDPE': 'sustainability.vsVirginHdpe',
        'Can be recycled again': 'sustainability.canBeRecycledAgain',
        'From scrap metal': 'sustainability.fromScrapMetal',
        'Community transit infrastructure': 'sustainability.communityTransitInfrastructure',
        'EcoKids educational play projects': 'sustainability.ecokidsEducationalPlayProjects',
        'HDPE from waste': 'sustainability.hdpFromWaste',
        'Depends on product': 'sustainability.dependsOnProduct',
      };
      const descKey = metric.description ? (descMap[metric.description] || `sustainability.${metric.description.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`) : '';
      return {
        ...metric,
        label: getTranslated(labelKey, metric.label),
        description: metric.description ? (descKey ? getTranslated(descKey, metric.description) : metric.description) : undefined,
        unit: metric.unit,
      };
    });
  }, [productDetail, getTranslated]);
  
  // Get translated use cases - ensure we always return strings, not objects - memoized
  const translatedUseCases = useMemo(() => {
    if (!productDetail) return [];
    // Map use case titles to their translation key names
    const useCaseKeyMap: Record<string, string> = {
      'Playgrounds': 'playgrounds',
      'Schools': 'schools',
      'Kindergartens': 'kindergartens',
      'Parks': 'parks',
      'Sports Facilities': 'sportsFacilities',
      'Waterfront Areas': 'waterfrontAreas',
      'Production Rooms': 'productionRooms',
      'Jogging Paths': 'joggingPaths',
      'Walking Trails': 'walkingTrails',
      'Sports Zones': 'sportsZones',
      'Garden Walls': 'gardenWalls',
      'Construction': 'construction',
      'Creative Installations': 'creativeInstallations',
      'Retaining Walls': 'retainingWalls',
      'Public Spaces': 'publicSpaces',
      'Communities': 'communities',
      'Events': 'events',
      'Home Gardens': 'homeGardens',
      'Balconies': 'balconies',
      'Restaurants': 'restaurants',
      'Bus Stops': 'busStops',
      'Gardens': 'gardens',
      'Schoolyards': 'schoolyards',
      'Offices': 'offices',
      'Residential': 'residential',
      'Urban Transit': 'urbanTransit',
      'Suburban Routes': 'suburbanRoutes',
      'School Routes': 'schoolRoutes',
      'Rural Areas': 'ruralAreas',
      'Urban Spaces': 'urbanSpaces',
      'Outdoor Dining': 'outdoorDining',
    };
    
    return productDetail.useCases.map((useCase) => {
      // Get the use case key name from the map
      const useCaseKey = useCaseKeyMap[useCase.title] || useCase.title.toLowerCase().replace(/\s+/g, '');
      
      // Try to get translation using the named key
      const titleKey = `${detailBasePath}.useCases.${useCaseKey}.title`;
      const descKey = `${detailBasePath}.useCases.${useCaseKey}.description`;
      
      const titleTranslation = t(titleKey, { ns: 'shop', defaultValue: useCase.title });
      const descTranslation = t(descKey, { ns: 'shop', defaultValue: useCase.description });
      
      // Ensure we have strings, not objects
      const translatedTitle = typeof titleTranslation === 'string' ? titleTranslation : useCase.title;
      const translatedDescription = typeof descTranslation === 'string' ? descTranslation : useCase.description;
      
      return {
        ...useCase,
        title: translatedTitle,
        description: translatedDescription,
      };
    });
  }, [productDetail, detailBasePath, t]);
  
  // Get translated features - ensure we always return strings, not objects - memoized
  const translatedFeatures = useMemo(() => {
    if (!productDetail) return [];
    // Map feature titles to their translation key names
    const featureKeyMap: Record<string, string> = {
      'Creative Designs': 'creativeDesigns',
      'Safe for Kids': 'safeForKids',
      'Educational': 'educational',
      'UV-Stable': 'uvStable',
      'Shock Absorbing': 'shockAbsorbing',
      'Easy Installation': 'easyInstallation',
      'Shock Absorption': 'shockAbsorption',
      'Anti-slip': 'antiSlip',
      'Chemical Resistant': 'chemicalResistant',
      'Non-toxic': 'nonToxic',
      'Durable': 'durable',
      'Maximum Shock Absorption': 'maximumShockAbsorption',
      'Weatherproof': 'weatherproof',
      'Maintenance Free': 'maintenanceFree',
      '100% Recycled': 'recycled',
      'Lightweight': 'lightweight',
      'Modular': 'modular',
      'Non-porous': 'nonPorous',
      'UV-Resistant': 'uvResistant',
      'Easy to Clean': 'easyToClean',
      'Customizable': 'customizable',
      'Comfortable': 'comfortable',
      'Secure Design': 'secureDesign',
      'Complete Solution': 'completeSolution',
      'Low Maintenance': 'lowMaintenance',
      'Eco-friendly': 'ecoFriendly',
      'Drainage System': 'drainageSystem',
      'Natural Look': 'naturalLook',
    };
    
    return productDetail.features.map((feature) => {
      // Get the feature key name from the map
      const featureKey = featureKeyMap[feature.title] || feature.title.toLowerCase().replace(/\s+/g, '');
      
      // Try to get translation using the named key
      const titleKey = `${detailBasePath}.features.${featureKey}.title`;
      const descKey = `${detailBasePath}.features.${featureKey}.description`;
      
      const titleTranslation = t(titleKey, { ns: 'shop', defaultValue: feature.title });
      const descTranslation = t(descKey, { ns: 'shop', defaultValue: feature.description });
      
      // Ensure we have strings, not objects
      const translatedTitle = typeof titleTranslation === 'string' ? titleTranslation : feature.title;
      const translatedDescription = typeof descTranslation === 'string' ? descTranslation : feature.description;
      
      return {
        ...feature,
        title: translatedTitle,
        description: translatedDescription,
      };
    });
  }, [productDetail, detailBasePath, t]);
  
  // SEO Management - Dynamic meta tags, OG tags, canonical URL
  useSEO({
    title: productName,
    description: productDescription,
    image: validProductImages.length > 0 ? validProductImages[0] : heroImage,
    type: 'product',
    keywords: `${productName}, ${productCategory}, eco-friendly, recycled, ZAMINAT.eco`,
  });

  // Hreflang tags for multilingual SEO
  useHreflang();
  
  // Enhanced SEO Schema Markup
  useEffect(() => {
    if (!productDetail) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productName,
      description: productDescription,
      image: validProductImages.length > 0 ? validProductImages : [heroImage],
      brand: {
        '@type': 'Brand',
        name: 'ZAMINAT.eco'
      },
      category: productCategory,
      offers: priceValue !== CALL_FOR_PRICE_MARKER ? {
        '@type': 'Offer',
        price: priceValue.replace(/\s/g, ''),
        priceCurrency: 'UZS',
        availability: 'https://schema.org/InStock',
        url: window.location.href
      } : undefined,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '156'
      },
      additionalProperty: productDetail.technicalSpecs.map(spec => ({
        '@type': 'PropertyValue',
        name: spec.label,
        value: `${spec.value}${spec.unit || ''}`
      })),
      ...(productDetail.materialComposition && {
        material: [
          ...(productDetail.materialComposition.recycledRubber ? [`${productDetail.materialComposition.recycledRubber}% Recycled Rubber`] : []),
          ...(productDetail.materialComposition.recycledPlastic ? [`${productDetail.materialComposition.recycledPlastic}% Recycled Plastic`] : []),
          ...(productDetail.materialComposition.other ? [productDetail.materialComposition.other] : [])
        ].join(', ')
      })
    };

    let script = document.getElementById('product-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'product-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      const scriptToRemove = document.getElementById('product-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [productDetail, productName, productDescription, productCategory, heroImage, validProductImages, price]);
  
  // Get related products - prioritize same category, then similar categories
  const relatedProducts = useMemo(() => {
    if (!productDetail) return [];
    
    const currentCategory = t(productDetail.categoryKey, { ns: 'shop' });
    const allProducts = Object.values(PRODUCT_DETAIL_DATA).filter(p => p.id !== productDetail.id);
    
    // Step 1: Get products with the same category first
    const sameCategoryProducts = allProducts.filter(p => {
      const otherCategory = t(p.categoryKey, { ns: 'shop' });
      return currentCategory === otherCategory;
    });
    
    // Step 2: If we have less than 4, add products from similar categories
    let related = [...sameCategoryProducts];
    
    if (related.length < 4) {
      // Map category translations to similar categories based on product relationships
      const categorySimilarity: Record<string, string[]> = {
        'Construction': ['Infrastructure', 'Art'],
        'Utility': ['Infrastructure', 'Furniture'],
        'Garden': ['Furniture', 'Art'],
        'Furniture': ['Garden', 'Infrastructure'],
        'Infrastructure': ['Construction', 'Furniture'],
        'Art': ['Construction', 'Garden'],
      };
      
      // Find similar categories based on current category
      const similarCategoryNames = categorySimilarity[currentCategory] || [];
      
      // Get products from similar categories
      const similarCategoryProducts = allProducts.filter(p => {
        // Skip if already included
        if (related.some(r => r.id === p.id)) return false;
        
        const otherCategory = t(p.categoryKey, { ns: 'shop' });
        return similarCategoryNames.includes(otherCategory);
      });
      
      // Add similar category products until we have 4 or run out
      related = [...related, ...similarCategoryProducts].slice(0, 4);
    }
    
    // Step 3: If still less than 4, add any remaining products
    if (related.length < 4) {
      const remainingProducts = allProducts.filter(p => 
        !related.some(r => r.id === p.id)
      );
      related = [...related, ...remainingProducts].slice(0, 4);
    }
    
    return related;
  }, [productDetail, t]);

  if (!productDetail) {
    return renderProductNotFound();
  }
  
  return (
    <Layout title={productName}>
      <a href="#main-content" className="skip-link">
        {t('ariaLabels.skipToMainContent', { ns: 'shop', defaultValue: 'Skip to main content' })}
      </a>
      
      <div className="min-h-screen bg-white">
        {/* Apple-style Header - Minimal */}
        <div className="border-b border-gray-200 bg-white">
          <div className={cn(
            "container mx-auto",
            isMobile ? "px-4 py-4" : "px-8 py-5 max-w-7xl"
          )}>
            <Button
              variant="ghost"
              className={cn(
                "text-gray-600 hover:text-gray-900 hover:bg-transparent p-0 h-auto",
                isMobile ? "text-sm" : "text-base"
              )}
              onClick={() => {
                // Navigate back to shop - scroll position will be restored by Shop component
                navigate('/shop');
              }}
              aria-label={t('ariaLabels.backToShop', { ns: 'shop', defaultValue: 'Back to shop' })}
            >
              <ArrowLeft className={cn("mr-1.5", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              {t('backToShop', { defaultValue: 'Back to Shop', ns: 'shop' })}
            </Button>
          </div>
        </div>
        
        <main id="main-content" className={cn(
          "container mx-auto",
          isMobile ? "px-3 py-3" : "px-6 py-5 max-w-7xl"
        )}>
          {/* Enhanced Product Header */}
          <div className="mb-6">
            <div className={cn(
              "flex flex-col",
              isMobile ? "gap-3" : "gap-4"
            )}>
              {/* Title and Price Row */}
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className={cn(
                    "font-bold text-gray-900 leading-tight tracking-tight",
                    isMobile ? "text-2xl" : "text-4xl"
                  )}>
                    {productName}
                  </h1>
                  <p className={cn(
                    "text-gray-600 mt-2 leading-relaxed",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    {productDescription}
                  </p>
                </div>
                
                {/* Enhanced Price Display */}
                <div className="flex-shrink-0 text-right">
                  {priceValue === CALL_FOR_PRICE_MARKER ? (
                    <div className={cn(
                      "inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      <span className="font-semibold text-green-700">
                        {t('pricing.callForPrice', { ns: 'shop' })}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className={cn(
                        "font-bold text-gray-900 mb-1",
                        isMobile ? "text-2xl" : "text-3xl"
                      )}>
                        {price.split(' ')[0]}
                        <span className={cn(
                          "font-semibold text-gray-600 ml-1",
                          isMobile ? "text-lg" : "text-xl"
                        )}>
                          {price.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                      <div className={cn(
                        "text-gray-500 font-medium",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        {t('pricing.perSqM', { defaultValue: 'per sq. m', ns: 'shop' })}
                      </div>
                      {/* Price badge for visual appeal */}
                      <div className={cn(
                        "mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}>
                        <Leaf className={cn("text-green-600", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                        <span className="text-green-700 font-medium">
                          {t('pricing.sustainable', { defaultValue: 'Sustainable', ns: 'shop' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Badges Row - Enhanced */}
              {translatedBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  {translatedBadges.slice(0, 4).map((badge, index) => (
                    <Badge
                      key={index}
                      className={cn(
                        "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all shadow-sm",
                        isMobile ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5"
                      )}
                      variant="outline"
                    >
                      <Check className={cn("mr-1.5 text-green-600", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                      <span className="font-medium">{badge.text}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Product Layout - Compact Side by Side */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "lg:grid-cols-2 lg:gap-6"
          )}>
            {/* Left Column - Larger Product Image Gallery */}
            <div className={cn(
              "flex flex-col",
              isMobile ? "" : "lg:sticky lg:top-[73px] lg:self-start"
            )}>
              {validProductImages.length > 0 ? (
                <>
                  {/* Main Product Image - Fade Animation with Navigation Arrows */}
                  <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-3">
                    <div 
                      className="relative flex items-center justify-center"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                      style={{ touchAction: 'pan-y pan-x', userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                       {/* Fade Animation Container - Natural Image Sizing */}
                       <div className="relative w-full" ref={(el) => {
                         if (el && validProductImages.length > 0) {
                           // Get height from first image to set container height
                           const firstImg = el.querySelector('img') as HTMLImageElement;
                           if (firstImg && firstImg.complete && firstImg.naturalHeight > 0) {
                             el.style.minHeight = `${firstImg.offsetHeight}px`;
                           }
                         }
                       }}>
                         {validProductImages.map((img, index) => {
                           const isActive = index === displayImageIndex;
                           const isFirst = index === 0;
                           
                           return (
                             <div
                               key={`main-wrapper-${img}-${index}`}
                               className={cn(
                                 "flex items-center justify-center transition-opacity duration-300",
                                 isActive ? "opacity-100 z-10 relative" : "opacity-0 z-0 absolute inset-0 pointer-events-none"
                               )}
                               style={{
                                 willChange: isActive ? 'opacity' : 'auto'
                               }}
                             >
                               <img
                                 src={img}
                                 alt={`${productName} - View ${index + 1}`}
                                 className="w-auto h-auto max-w-full cursor-pointer select-none"
                                 style={{ 
                                   maxWidth: '100%',
                                   width: 'auto',
                                   height: 'auto',
                                   display: 'block',
                                   touchAction: 'pan-y pan-x',
                                   userSelect: 'none',
                                   WebkitUserSelect: 'none',
                                   pointerEvents: isActive ? 'auto' : 'none'
                                 }}
                                 onClick={(e) => {
                                  // Only trigger if not swiping
                                  if (!isSwipingRef.current) {
                                    e.stopPropagation();
                                    setDisplayImageIndex(selectedImageIndex);
                                    setLightboxOpen(true);
                                  }
                                }}
                                 loading={index === 0 ? "eager" : "lazy"}
                                 draggable={false}
                                 onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   target.onerror = null;
                                   target.src = getFallbackImage();
                                 }}
                                 onLoad={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   if (isFirst) {
                                     const container = target.closest('.relative') as HTMLElement;
                                     if (container && target.naturalHeight > 0) {
                                       // Set container height based on first image
                                       container.style.minHeight = `${target.offsetHeight}px`;
                                     }
                                   }
                                 }}
                               />
                             </div>
                           );
                         })}
                       </div>
                       
                       {/* Navigation Arrows - Only show if multiple images */}
                       {validProductImages.length > 1 && (
                         <>
                           {/* Previous Image Arrow */}
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               prevImage();
                             }}
                             className={cn(
                               "absolute left-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed",
                               isMobile ? "h-9 w-9" : "h-10 w-10"
                             )}
                             aria-label={t('ariaLabels.previousImage', { ns: 'shop', defaultValue: 'Previous image' })}
                             type="button"
                             disabled={isTransitioning}
                           >
                             <ChevronLeft className={cn("text-gray-700", isMobile ? "h-5 w-5" : "h-6 w-6")} />
                           </button>
                           
                           {/* Next Image Arrow */}
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               nextImage();
                             }}
                             className={cn(
                               "absolute right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed",
                               isMobile ? "h-9 w-9" : "h-10 w-10"
                             )}
                             aria-label={t('ariaLabels.nextImage', { ns: 'shop', defaultValue: 'Next image' })}
                             type="button"
                             disabled={isTransitioning}
                           >
                             <ChevronRight className={cn("text-gray-700", isMobile ? "h-5 w-5" : "h-6 w-6")} />
                           </button>
                         </>
                       )}
                       
                      {/* Fullscreen Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDisplayImageIndex(selectedImageIndex);
                          setLightboxOpen(true);
                        }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all z-10"
                        aria-label={t('ariaLabels.viewFullscreen', { ns: 'shop', defaultValue: 'View fullscreen image' })}
                        type="button"
                      >
                        <ZoomIn className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Thumbnail Navigation - 50% Larger - Always visible when multiple images */}
                  {validProductImages.length > 1 ? (
                    <div className="relative mt-2">
                      {/* Left Scroll Arrow */}
                      {canScrollLeftMain && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollMainThumbnails('left');
                          }}
                          className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all",
                            isMobile ? "h-8 w-8" : "h-9 w-9"
                          )}
                          aria-label={t('ariaLabels.scrollLeft', { ns: 'shop', defaultValue: 'Scroll thumbnails left' })}
                          type="button"
                        >
                          <ChevronLeft className={cn("text-gray-700", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                        </button>
                      )}
                      
                      {/* Right Scroll Arrow */}
                      {canScrollRightMain && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollMainThumbnails('right');
                          }}
                          className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all",
                            isMobile ? "h-8 w-8" : "h-9 w-9"
                          )}
                          aria-label={t('ariaLabels.scrollRight', { ns: 'shop', defaultValue: 'Scroll thumbnails right' })}
                          type="button"
                        >
                          <ChevronRight className={cn("text-gray-700", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                        </button>
                      )}
                      
                      {/* Scrollable Thumbnail Container */}
                      <div 
                        ref={mainThumbnailScrollRef}
                        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" 
                        role="tablist" 
                        aria-label={t('ariaLabels.imageThumbnails', { ns: 'shop', defaultValue: 'Product image thumbnails' })}
                        style={{ 
                          scrollbarWidth: 'none', 
                          msOverflowStyle: 'none',
                          touchAction: 'pan-y pan-x',
                          WebkitOverflowScrolling: 'touch'
                        }}
                        onScroll={checkMainThumbnailScroll}
                        onTouchStart={onThumbTouchStart}
                        onTouchMove={onThumbTouchMove}
                        onTouchEnd={onThumbTouchEnd}
                      >
                        {validProductImages.map((img, index) => (
                           <button
                         key={`${img}-${index}`}
                             onClick={(e) => {
                               // Only trigger if not scrolling/swiping
                               if (!thumbIsScrollingRef.current) {
                                 e.stopPropagation();
                                 handleThumbnailClick(index);
                               }
                             }}
                             onTouchEnd={(e) => {
                               // Prevent click if scrolling
                               if (thumbIsScrollingRef.current) {
                                 e.preventDefault();
                                 e.stopPropagation();
                               }
                             }}
                             className={cn(
                               "flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all shadow-sm hover:shadow-md",
                               isMobile ? "w-24 h-24" : "w-[120px] h-[120px]",
                               displayImageIndex === index 
                                 ? "border-gray-900 ring-2 ring-gray-300 ring-offset-2 scale-105" 
                                 : "border-gray-200 hover:border-gray-400"
                             )}
                             aria-label={`View image ${index + 1} of ${validProductImages.length}`}
                             aria-pressed={displayImageIndex === index}
                             type="button"
                             disabled={isTransitioning}
                             style={{ 
                               touchAction: 'manipulation',
                               userSelect: 'none',
                               WebkitUserSelect: 'none'
                             }}
                       >
                        <img
                          src={img}
                              alt={`${productName} - View ${index + 1}`}
                              className="w-full h-full object-cover pointer-events-none"
                              style={{ 
                                userSelect: 'none', 
                                WebkitUserSelect: 'none',
                                touchAction: 'none'
                              }}
                              loading="lazy"
                              draggable={false}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = getFallbackImage();
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="relative bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  {heroImage || PRODUCT_IMAGE_MAP[productDetail?.englishName || ''] ? (
                    <img
                      src={heroImage || PRODUCT_IMAGE_MAP[productDetail?.englishName || ''] || getFallbackImage()}
                      alt={productName}
                      className="w-auto h-auto"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      loading="eager"
                      onError={(e) => {
                          const target = e.target as HTMLImageElement;
                        handleImageError(target.src);
                        target.onerror = null;
                        target.src = getFallbackImage();
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm text-center p-4">
                      {t('noImageAvailable', { ns: 'shop', defaultValue: 'No image available' })}
                      </div>
                  )}
                    </div>
              )}
                </div>
              
            {/* Right Column - Compact Product Info */}
            <div className="space-y-3">
              {/* Add to Cart - Compact */}
              <Button
                data-add-to-cart
                size="default"
                className={cn(
                  "w-full bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md",
                  isMobile ? "h-10 text-sm" : "h-11 text-base"
                )}
                onClick={handleAddToCart}
              >
                <ShoppingBag className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                {priceValue === CALL_FOR_PRICE_MARKER 
                  ? t('buttons.contactUs', { ns: 'shop' })
                  : t('buttons.addToCart', { ns: 'shop' })
                }
              </Button>

              {/* Product Specifications Section - Exact Content */}
              {productDetail.technicalSpecs.length > 0 && (() => {
                // Get key specs: Capacity, Weight, Material, Dimensions
                const keySpecs = [
                  translatedTechnicalSpecs.find(s => s.label.toLowerCase().includes('capacity')),
                  translatedTechnicalSpecs.find(s => s.label.toLowerCase().includes('weight')),
                  translatedTechnicalSpecs.find(s => s.label.toLowerCase().includes('material') || s.label.toLowerCase().includes('base material')),
                  translatedTechnicalSpecs.find(s => s.label.toLowerCase().includes('dimension') || s.label.toLowerCase().includes('size'))
                ].filter(Boolean).slice(0, 4);
                
                // Fallback to first 4 if key specs not found
                const specsToShow = keySpecs.length > 0 ? keySpecs : translatedTechnicalSpecs.slice(0, 4);
                
                return (
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50">
                    <h3 className="text-xs font-medium text-gray-900 mb-2.5">
                      {t('productSpecifications', { defaultValue: 'Product Specifications', ns: 'shop' })}
                    </h3>
                    <div className="space-y-2">
                      {specsToShow.map((spec, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 font-medium">{spec.label}</span>
                          <span className="font-medium text-gray-900 ml-2 text-right">
                            {spec.value}
                            {spec.unit && <span className="text-gray-500 ml-0.5 font-normal">{spec.unit}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                    {translatedTechnicalSpecs.length > 4 && (
                      <button
                        onClick={() => {
                          const tabButton = document.querySelector('button[role="tab"][aria-controls*="specs"]') as HTMLElement;
                          if (tabButton) {
                            tabButton.click();
                            setTimeout(() => {
                              const tabsSection = document.querySelector('[role="tablist"]')?.parentElement;
                              tabsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }
                        }}
                        className="text-xs text-green-600 hover:text-green-700 mt-2 font-medium w-full text-left"
                      >
                        {t('viewAllSpecs', { defaultValue: 'View all specifications →', ns: 'shop' })}
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Sustainability Section - Exact Content */}
              {translatedSustainability.length > 0 && (() => {
                // Get key metrics: Recycled Plastic, Recycled Steel, CO2 Reduction, Waste Diverted
                const keyMetrics = [
                  translatedSustainability.find(m => m.label.toLowerCase().includes('recycled plastic')),
                  translatedSustainability.find(m => m.label.toLowerCase().includes('recycled steel')),
                  translatedSustainability.find(m => m.label.toLowerCase().includes('co2') || m.label.toLowerCase().includes('co₂')),
                  translatedSustainability.find(m => m.label.toLowerCase().includes('waste diverted'))
                ].filter(Boolean).slice(0, 4);
                
                // Fallback to first 4 if key metrics not found
                const metricsToShow = keyMetrics.length > 0 ? keyMetrics : translatedSustainability.slice(0, 4);
                
                return (
                  <div className="border border-gray-200 rounded-md p-3 bg-green-50/30">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <h3 className="text-xs font-medium text-gray-900">
                        {t('sustainability', { defaultValue: 'Sustainability', ns: 'shop' })}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {metricsToShow.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between py-0.5">
                          <span className="text-xs text-gray-600">{metric.label}</span>
                          <span className="text-xs font-semibold text-green-600">
                            {metric.value}
                            {metric.unit && <span className="font-normal ml-0.5">{metric.unit}</span>}
                          </span>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })()}

              {/* Tabs Section - Moved Under Add to Cart */}
              <div className="mt-3 border-t border-gray-200 pt-3">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className={cn(
                    "inline-flex w-auto bg-transparent border-b border-gray-200 rounded-none p-0 gap-3",
                    isMobile ? "h-8 text-xs" : "h-9 text-sm"
                  )}>
                    <TabsTrigger 
                      value="overview" 
                      className={cn(
                        "border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 py-1 font-medium text-gray-600 data-[state=active]:text-gray-900",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                    >
                      {t('tabs.overview', { defaultValue: 'Overview', ns: 'shop' })}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="specs" 
                      className={cn(
                        "border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 py-1 font-medium text-gray-600 data-[state=active]:text-gray-900",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                    >
                      {t('tabs.specifications', { defaultValue: 'Specs', ns: 'shop' })}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sustainability" 
                      className={cn(
                        "border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 py-1 font-medium text-gray-600 data-[state=active]:text-gray-900",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                    >
                      {t('tabs.sustainability', { defaultValue: 'Sustainability', ns: 'shop' })}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="applications" 
                      className={cn(
                        "border-b-2 border-transparent data-[state=active]:border-gray-900 rounded-none px-0 py-1 font-medium text-gray-600 data-[state=active]:text-gray-900",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                    >
                      {t('tabs.applications', { defaultValue: 'Applications', ns: 'shop' })}
                    </TabsTrigger>
                  </TabsList>
              {/* Overview Tab - Enhanced & Interactive */}
              <TabsContent value="overview" className="mt-3">
                <div className={cn(
                  "grid gap-5",
                  isMobile ? "grid-cols-1" : "lg:grid-cols-2"
                )}>
                  {/* Overview Section - Enhanced & Interactive */}
                  <div className="space-y-4">
                    {/* Product Title & Description */}
                    <div>
                      <h2 className={cn(
                        "font-semibold text-gray-900 mb-3 leading-tight",
                        isMobile ? "text-base" : "text-lg"
                      )}>
                  {translatedOverview.title}
                      </h2>
                <p className={cn(
                        "text-gray-700 leading-relaxed mb-4",
                        isMobile ? "text-xs" : "text-sm"
                )}>
                  {translatedOverview.description}
                </p>
                    </div>
                    
                    {/* Key Specifications - Interactive Card */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
                      <h3 className={cn(
                        "font-semibold text-gray-900 mb-3 flex items-center",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        <Info className={cn(
                          "mr-1.5 text-green-600",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                        )} />
                        {t('keySpecifications', { defaultValue: 'Key Specifications', ns: 'shop' })}
                      </h3>
                      <div className="space-y-2.5">
                        {translatedOverview.specifications.map((spec, index) => {
                          // Parse spec to extract label and value for better formatting
                          const specParts = spec.split(':');
                          const label = specParts[0]?.trim() || '';
                          const value = specParts[1]?.trim() || spec;
                          
                          return (
                            <div 
                              key={index} 
                              className="flex items-start group hover:bg-white/80 rounded-md p-2 -m-2 transition-all cursor-default"
                            >
                              <div className={cn(
                                "flex-shrink-0 rounded-full bg-green-100 p-0.5 mr-2.5 group-hover:bg-green-200 transition-colors",
                                isMobile ? "mt-0.5" : "mt-0.5"
                              )}>
                                <Check className={cn(
                                  "text-green-600 group-hover:scale-110 transition-transform",
                                  isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                {label ? (
                                  <>
                                    <span className={cn(
                                      "font-semibold text-gray-900",
                                      isMobile ? "text-xs" : "text-sm"
                                    )}>
                                      {label}:
                                    </span>
                                    <span className={cn(
                                      "text-gray-700 ml-1",
                                      isMobile ? "text-xs" : "text-sm"
                                    )}>
                                      {value}
                                    </span>
                                  </>
                                ) : (
                                  <span className={cn(
                                    "text-gray-800 leading-relaxed",
                                    isMobile ? "text-xs" : "text-sm"
                                  )}>
                                    {spec}
                                </span>
                              )}
                  </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Features Section - Enhanced & Interactive */}
                  {productDetail.features.length > 0 && (
                    <div className="space-y-4">
                      <h2 className={cn(
                        "font-semibold text-gray-900 mb-3 flex items-center",
                          isMobile ? "text-base" : "text-lg"
                        )}>
                        <Award className={cn(
                          "mr-1.5 text-green-600",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                        )} />
                        {t('features', { defaultValue: 'Features', ns: 'shop' })}
                      </h2>
                      <div className="space-y-3">
                        {translatedFeatures.map((feature, index) => (
                          <div 
                            key={index} 
                            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30 hover:shadow-sm transition-all group cursor-default"
                          >
                      <div className={cn(
                              "text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform",
                              isMobile ? "text-lg" : "text-xl"
                      )}>
                              {feature.icon}
                      </div>
                            <div className="min-w-0 flex-1">
                              <h3 className={cn(
                                "font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                {feature.title}
                              </h3>
                        <p className={cn(
                                "text-gray-600 leading-relaxed",
                                isMobile ? "text-[11px]" : "text-xs"
                              )}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Specifications Tab - Enhanced & Interactive */}
              <TabsContent value="specs" className="mt-3">
                <div className={cn(
                  "grid gap-5",
                  isMobile ? "grid-cols-1" : "lg:grid-cols-2"
                )}>
                  {/* Full Technical Specs - Enhanced & Interactive */}
                  {productDetail.technicalSpecs.length > 0 && (
                    <div className="space-y-4">
                      <h2 className={cn(
                        "font-semibold text-gray-900 mb-3 flex items-center",
                        isMobile ? "text-base" : "text-lg"
                      )}>
                        <FileText className={cn(
                          "mr-1.5 text-green-600",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                        )} />
                        {t('technicalSpecifications', { defaultValue: 'Technical Specifications', ns: 'shop' })}
                      </h2>
                      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {translatedTechnicalSpecs.map((spec, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex justify-between items-start py-3 px-4 border-b border-gray-200 last:border-0 group hover:bg-green-50/20 transition-colors cursor-default",
                              index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                            )}
                          >
                            <span className={cn(
                              "text-gray-700 font-medium group-hover:text-gray-900 transition-colors",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {spec.label}
                            </span>
                            <span className={cn(
                              "font-semibold text-gray-900 text-right ml-4 group-hover:text-green-700 transition-colors",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {spec.value}
                              {spec.unit && <span className="text-gray-600 ml-1 font-normal">{spec.unit}</span>}
                            </span>
                          </div>
                ))}
              </div>
                    </div>
                  )}
              
                  {/* Material Composition - Enhanced & Interactive */}
              {productDetail.materialComposition && (
                    <div className="space-y-4">
                      <h2 className={cn(
                        "font-semibold text-gray-900 mb-3 flex items-center",
                        isMobile ? "text-base" : "text-lg"
                      )}>
                        <Recycle className={cn(
                          "mr-1.5 text-green-600",
                          isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                        )} />
                      {t('materialComposition', { defaultValue: 'Material Composition', ns: 'shop' })}
                      </h2>
                      <div className="border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50/50 to-white shadow-sm hover:shadow-md transition-shadow space-y-3">
                      {productDetail.materialComposition.recycledRubber && (
                          <div className="flex items-center justify-between py-2 px-3 border-b border-green-200 last:border-0 group hover:bg-green-100/50 rounded-md transition-colors cursor-default">
                            <div className="flex items-center">
                              <Leaf className={cn(
                                "mr-2 text-green-600 group-hover:scale-110 transition-transform",
                                isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                              )} />
                              <span className={cn(
                                "text-gray-800 font-medium group-hover:text-gray-900 transition-colors",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                            {t('recycledRubber', { defaultValue: 'Recycled Rubber', ns: 'shop' })}
                          </span>
                            </div>
                          <span className={cn(
                              "font-bold text-green-600 group-hover:text-green-700 transition-colors",
                              isMobile ? "text-sm" : "text-base"
                          )}>
                            {productDetail.materialComposition.recycledRubber}%
                          </span>
                        </div>
                      )}
                      {productDetail.materialComposition.recycledPlastic && (
                          <div className="flex items-center justify-between py-2 px-3 border-b border-green-200 last:border-0 group hover:bg-green-100/50 rounded-md transition-colors cursor-default">
                            <div className="flex items-center">
                              <Recycle className={cn(
                                "mr-2 text-green-600 group-hover:scale-110 transition-transform",
                                isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                              )} />
                              <span className={cn(
                                "text-gray-800 font-medium group-hover:text-gray-900 transition-colors",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                            {t('recycledPlastic', { defaultValue: 'Recycled Plastic', ns: 'shop' })}
                          </span>
                            </div>
                          <span className={cn(
                              "font-bold text-green-600 group-hover:text-green-700 transition-colors",
                              isMobile ? "text-sm" : "text-base"
                          )}>
                            {productDetail.materialComposition.recycledPlastic}%
                          </span>
                        </div>
                      )}
                      {productDetail.materialComposition.other && (
                          <div className="flex items-center justify-between py-2 px-3 group hover:bg-green-100/50 rounded-md transition-colors cursor-default">
                            <div className="flex items-center">
                              <Info className={cn(
                                "mr-2 text-green-600 group-hover:scale-110 transition-transform",
                                isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                              )} />
                              <span className={cn(
                                "text-gray-800 font-medium group-hover:text-gray-900 transition-colors",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                            {t('otherMaterials', { defaultValue: 'Other Materials', ns: 'shop' })}
                          </span>
                            </div>
                          <span className={cn(
                              "font-semibold text-gray-900 group-hover:text-green-700 transition-colors",
                              isMobile ? "text-xs" : "text-sm"
                          )}>
                            {productDetail.materialComposition.other}
                          </span>
                        </div>
                      )}
                    </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Sustainability Tab - Enhanced & Interactive */}
              <TabsContent value="sustainability" className="mt-3">
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                )}>
                  {translatedSustainability.map((metric, index) => (
                    <div 
                      key={index} 
                      className="border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50/40 to-white shadow-sm hover:shadow-md hover:border-green-300 transition-all group cursor-default"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={cn(
                          "font-semibold text-gray-900 group-hover:text-green-700 transition-colors",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          {metric.label}
                        </h3>
                        <div className="rounded-full bg-green-100 p-1.5 group-hover:bg-green-200 group-hover:scale-110 transition-all">
                          <Recycle className={cn(
                            "text-green-600",
                            isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                          )} />
                        </div>
                      </div>
                      <div className={cn(
                        "font-bold text-green-600 mb-2 group-hover:text-green-700 transition-colors",
                        isMobile ? "text-lg" : "text-xl"
                      )}>
                        {metric.value}
                        {metric.unit && <span className="ml-1 font-normal text-sm text-gray-600">{metric.unit}</span>}
                      </div>
                      {metric.description && (
                        <p className={cn(
                          "text-gray-600 leading-relaxed mt-2 pt-2 border-t border-green-200 group-hover:text-gray-700 transition-colors",
                          isMobile ? "text-[10px]" : "text-xs"
                        )}>
                          {metric.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Applications Tab - Enhanced & Interactive */}
              <TabsContent value="applications" className="mt-3">
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                )}>
                {translatedUseCases.map((useCase, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 border border-gray-200 rounded-lg p-4 bg-white hover:border-green-300 hover:bg-green-50/30 hover:shadow-md transition-all group cursor-default"
                    >
                      <div className={cn(
                        "text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform",
                        isMobile ? "text-xl" : "text-2xl"
                      )}>
                        {useCase.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                      <h3 className={cn(
                          "font-semibold text-gray-900 mb-1.5 group-hover:text-green-700 transition-colors",
                          isMobile ? "text-xs" : "text-sm"
                      )}>
                        {useCase.title}
                      </h3>
                      <p className={cn(
                          "text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors",
                          isMobile ? "text-[11px]" : "text-xs"
                      )}>
                        {useCase.description}
                      </p>
                      </div>
                    </div>
                ))}
              </div>
              </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Additional Sections - Compact Accordion */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <Accordion type="multiple" className="w-full space-y-2">
              {/* How It's Made - Collapsible */}
              {productDetail && (
                <AccordionItem value="manufacturing" className="border border-gray-200 rounded-md px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center">
                      <Recycle className={cn(
                        "text-green-600 mr-2",
                        isMobile ? "h-4 w-4" : "h-4 w-4"
                      )} />
                      <span className={cn(
                        "font-medium text-gray-900",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        {t('howItsMade', { defaultValue: 'How It\'s Made', ns: 'shop' })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className={cn(
                      "grid gap-3 pb-3",
                      isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
                    )}>
                      {[
                        { step: 1, title: t('manufacturing.collection', { defaultValue: 'Waste Collection', ns: 'shop' }), desc: t('manufacturing.collectionDesc', { defaultValue: 'Recycled materials are collected and sorted by type.', ns: 'shop' }) },
                        { step: 2, title: t('manufacturing.processing', { defaultValue: 'Processing & Mixing', ns: 'shop' }), desc: t('manufacturing.processingDesc', { defaultValue: 'Materials are shredded, cleaned, and mixed with PU binder in precise ratios for optimal performance.', ns: 'shop' }) },
                        { step: 3, title: t('manufacturing.shaping', { defaultValue: 'Shaping & Molding', ns: 'shop' }), desc: t('manufacturing.shapingDesc', { defaultValue: productDetail.englishName.includes('Tile') ? 'Hot-press molding creates dense, uniform tiles with excellent shock absorption properties.' : productDetail.englishName.includes('Brick') ? 'Extrusion molding forms durable modular blocks with interlocking design.' : 'Extrusion or composite molding shapes the final product with precision.', ns: 'shop' }) },
                        { step: 4, title: t('manufacturing.finishing', { defaultValue: 'Finishing & Quality Control', ns: 'shop' }), desc: t('manufacturing.finishingDesc', { defaultValue: productDetail.englishName.includes('EPDM') ? 'EPDM top layer is applied and cured. Each tile is tested for hardness, shock absorption, and durability.' : 'Products are trimmed, tested for strength and durability, and packaged for shipment.', ns: 'shop' }) }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start space-x-2">
                          <div className={cn(
                            "flex-shrink-0 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium",
                            isMobile ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm"
                          )}>
                            {item.step}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className={cn(
                              "font-medium text-gray-900 mb-1",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {item.title}
                            </h3>
                            <p className={cn(
                              "text-gray-600 leading-relaxed",
                              isMobile ? "text-[10px]" : "text-xs"
                            )}>
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Downloads - Collapsible */}
              {productDetail && (
                <AccordionItem value="downloads" className="border border-gray-200 rounded-md px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center">
                      <Download className={cn(
                        "text-green-600 mr-2",
                        isMobile ? "h-4 w-4" : "h-4 w-4"
                      )} />
                      <span className={cn(
                        "font-medium text-gray-900",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        {t('downloads.title', { defaultValue: 'Downloads & Resources', ns: 'shop' })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className={cn(
                      "grid gap-2 pb-3",
                      isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
                    )}>
                      {[
                        { icon: '📄', title: t('downloads.technicalDataSheet', { defaultValue: 'Technical Data Sheet', ns: 'shop' }), action: t('downloads.downloadPdf', { defaultValue: 'Download PDF', ns: 'shop' }) },
                        { icon: '🏆', title: t('downloads.certifications', { defaultValue: 'Certifications', ns: 'shop' }), action: t('downloads.viewCertificates', { defaultValue: 'View Certificates', ns: 'shop' }) },
                        { icon: '📋', title: t('downloads.brochure', { defaultValue: 'Product Brochure', ns: 'shop' }), action: t('downloads.downloadPdf', { defaultValue: 'Download PDF', ns: 'shop' }) },
                        { icon: '📐', title: t('downloads.installationGuide', { defaultValue: 'Installation Guide', ns: 'shop' }), action: t('downloads.downloadPdf', { defaultValue: 'Download PDF', ns: 'shop' }) }
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => toast.info(t('downloads.comingSoon', { defaultValue: 'Coming soon', ns: 'shop' }))}
                          className="text-left p-3 border border-gray-200 rounded-md hover:border-gray-400 transition-all"
                        >
                          <div className={cn(
                            "mb-2",
                            isMobile ? "text-2xl" : "text-2xl"
                          )}>
                            {item.icon}
                          </div>
                          <h3 className={cn(
                            "font-medium text-gray-900 mb-1",
                            isMobile ? "text-xs" : "text-sm"
                          )}>
                            {item.title}
                          </h3>
                          <span className={cn(
                            "text-green-600 hover:text-green-700 font-medium",
                            isMobile ? "text-xs" : "text-xs"
                          )}>
                            {item.action} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

          {/* Related Products - Interactive Carousel */}
          {productDetail && relatedProducts.length > 0 && (
            <section className={cn(
              "mt-4 border-t border-gray-200 pt-4",
              isMobile ? "" : ""
            )} aria-labelledby="related-products-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 
                  id="related-products-heading"
                  className={cn(
                    "font-bold text-gray-900 relative",
                    isMobile ? "text-base" : "text-lg"
                  )}
                >
                  <span className="relative z-10">
                    {t('relatedProducts', { defaultValue: 'Related Products', ns: 'shop' })}
                  </span>
                  <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                </h2>
              </div>
              
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-2 gap-3" : "grid-cols-2 md:grid-cols-4 gap-4"
              )}>
                {relatedProducts.map((relatedProduct) => {
                    const relatedName = t(relatedProduct.nameKey, { ns: 'shop' });
                    const relatedPriceValue = PRODUCT_PRICE_MAP[relatedProduct.englishName] || CALL_FOR_PRICE_MARKER;
                    const relatedPrice = relatedPriceValue === CALL_FOR_PRICE_MARKER ? t('pricing.callForPrice', { ns: 'shop', defaultValue: 'Call for price' }) : relatedPriceValue;
                    
                    // Get all images for this related product
                    const images = getProductImages(relatedProduct.folderName);
                    const relatedProductImages = images.length > 0 
                      ? images 
                      : [getIconForProductOrCategory(
                          relatedProduct.englishName,
                          PRODUCT_IMAGE_MAP[relatedProduct.englishName] || '/images/art-tiles.png'
                        )];
                    
                    return (
                      <RelatedProductCarousel
                        key={relatedProduct.id}
                        product={relatedProduct}
                        productName={relatedName}
                        productPrice={relatedPrice}
                        images={relatedProductImages}
                        onNavigate={() => navigate(`/product/${productNameToSlug(relatedProduct.englishName)}`)}
                        isMobile={isMobile}
                      />
                    );
                  })}
              </div>
            </section>
          )}
          
        </main>
      </div>
      
      {lightboxOpen && validProductImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => {
            // Only close if not swiping
            if (!isSwipingRef.current) {
              setLightboxOpen(false);
            }
          }}
          role="dialog"
          aria-label={t('ariaLabels.imageLightbox', { ns: 'shop', defaultValue: 'Image lightbox' })}
          aria-modal="true"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ padding: 0, touchAction: 'pan-y pan-x', userSelect: 'none' }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 bg-black/50 rounded-full p-2 backdrop-blur-sm transition-all"
            aria-label={t('ariaLabels.closeLightbox', { ns: 'shop', defaultValue: 'Close lightbox' })}
          >
            <X className={cn(isMobile ? "h-6 w-6" : "h-8 w-8")} />
          </button>
          
          {/* Main Image Container - Fullscreen Auto-Sizing */}
          <div 
            className="flex-1 flex items-center justify-center w-full h-full relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              padding: isMobile ? '10px' : '20px',
              paddingBottom: validProductImages.length > 1 ? (isMobile ? '80px' : '120px') : (isMobile ? '10px' : '20px'),
              touchAction: 'pan-y pan-x',
              userSelect: 'none'
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Fade Animation Container - Fullscreen Natural Image Sizing */}
              <div className="relative w-full h-full flex items-center justify-center">
                {validProductImages.map((img, index) => {
                  const isActive = index === displayImageIndex;
                  
                  return (
                    <div
                      key={`lightbox-${img}-${index}`}
                      className={cn(
                        "absolute flex items-center justify-center transition-opacity duration-300",
                        isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      )}
                      style={{
                        willChange: isActive ? 'opacity' : 'auto',
                        padding: '10px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={img}
                        alt={`${productName} - Image ${index + 1}`}
                        className="w-auto h-auto max-w-full max-h-full select-none"
                        style={{ 
                          display: 'block',
                          maxWidth: isMobile ? '95vw' : '95vw',
                          maxHeight: isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 200px)',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                        draggable={false}
                        onClick={(e) => e.stopPropagation()}
                        onError={() => {
                          handleImageError(img);
                          setLightboxOpen(false);
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.naturalWidth > 0 && target.naturalHeight > 0) {
                            // Auto-size to fill available space while maintaining aspect ratio
                            const viewportWidth = window.innerWidth * 0.95;
                            const viewportHeight = (window.innerHeight - (validProductImages.length > 1 ? (isMobile ? 150 : 200) : 50)) * 0.95;
                            const imageRatio = target.naturalWidth / target.naturalHeight;
                            const viewportRatio = viewportWidth / viewportHeight;
                            
                            let finalWidth: number;
                            let finalHeight: number;
                            
                            if (imageRatio > viewportRatio) {
                              // Image is wider - fit to width
                              finalWidth = viewportWidth;
                              finalHeight = viewportWidth / imageRatio;
                            } else {
                              // Image is taller - fit to height
                              finalHeight = viewportHeight;
                              finalWidth = viewportHeight * imageRatio;
                            }
                            
                            // Apply auto-sizing
                            target.style.width = `${finalWidth}px`;
                            target.style.height = `${finalHeight}px`;
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Thumbnail Navigation at Bottom with Counter */}
          {validProductImages.length > 1 && (
            <div 
              className="absolute bottom-0 left-0 right-0 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Counter - Interactive with Arrows */}
              <div className="flex justify-center mb-2 px-4">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="text-white hover:text-gray-200 active:scale-95 transition-all p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t('ariaLabels.previousImage', { ns: 'shop', defaultValue: 'Previous image' })}
                    type="button"
                    disabled={isTransitioning}
                  >
                    <ChevronLeft className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </button>
                  <span className={cn(
                    "text-white font-medium select-none min-w-[50px] text-center",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    <span className="text-white">{displayImageIndex + 1}</span>
                    <span className="text-white/50 mx-1">/</span>
                    <span className="text-white/70">{validProductImages.length}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="text-white hover:text-gray-200 active:scale-95 transition-all p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t('ariaLabels.nextImage', { ns: 'shop', defaultValue: 'Next image' })}
                    type="button"
                    disabled={isTransitioning}
                  >
                    <ChevronRight className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </button>
                </div>
              </div>
              
              {/* Thumbnail Strip with Scroll Arrows */}
              <div className="relative px-4 pb-4">
                {/* Left Scroll Arrow */}
                {canScrollLeftThumb && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails('left');
                    }}
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-black/90 text-white rounded-full p-2 backdrop-blur-sm transition-all shadow-lg border border-white/20",
                      isMobile ? "h-8 w-8" : "h-10 w-10"
                    )}
                    aria-label="Scroll thumbnails left"
                    type="button"
                  >
                    <ChevronLeft className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </button>
                )}
                
                {/* Right Scroll Arrow */}
                {canScrollRightThumb && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails('right');
                    }}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-black/90 text-white rounded-full p-2 backdrop-blur-sm transition-all shadow-lg border border-white/20",
                      isMobile ? "h-8 w-8" : "h-10 w-10"
                    )}
                    aria-label="Scroll thumbnails right"
                    type="button"
                  >
                    <ChevronRight className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </button>
                )}
                
                {/* Scrollable Thumbnail Container */}
                <div 
                  ref={thumbnailScrollRef}
                  className="overflow-x-auto scrollbar-hide px-8"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={checkThumbnailScroll}
                >
                  <div className="flex gap-2.5 justify-center max-w-7xl mx-auto">
                    {validProductImages.map((img, index) => (
                      <button
                        key={`lightbox-thumb-${img}-${index}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThumbnailClick(index);
                        }}
                        className={cn(
                          "flex-shrink-0 rounded overflow-hidden border-2 transition-all opacity-70 hover:opacity-100",
                          isMobile ? "w-12 h-12" : "w-16 h-16",
                          displayImageIndex === index 
                            ? "border-white opacity-100 ring-2 ring-white/50" 
                            : "border-white/50"
                        )}
                        aria-label={`View image ${index + 1} of ${validProductImages.length}`}
                        aria-pressed={displayImageIndex === index}
                        type="button"
                      >
                        <img
                          src={img}
                          alt={`${productName} - Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          draggable={false}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = getFallbackImage();
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {animationState.isAnimating && animationState.productImage && animationState.startPosition && (
        <AddToCartAnimation
          productImage={animationState.productImage}
          startPosition={animationState.startPosition}
          onComplete={completeAnimation}
        />
      )}
      
      <CartSidebar />
      <FloatingCartIcon />
    </Layout>
  );
}



