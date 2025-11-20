import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ZoomIn, X, ChevronLeft, ChevronRight, Check, Leaf, Recycle } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/use-mobile';
import { useCart } from '../contexts/CartContext';
import { PRODUCT_DETAIL_DATA } from '../lib/productData';
import { getProductImages } from '../lib/productImages';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAddToCartAnimation } from '../hooks/useAddToCartAnimation';
import AddToCartAnimation from '../components/AddToCartAnimation';
import { getImageUrlVariations } from '../utils/imageHelper';

const BRAND_GREEN = '#009E60';
const BRAND_GOLD = '#E8C468';

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'EPDM-free Tiles': '/images/art-tiles.png',
  'EPDM Rubber Ecotiles': '/images/EPDM-Tiles.png',
  'EcoBrick': '/images/EcoBrick.png',
  'Waste Bin': '/images/Waste Bin.png',
  'Garden Planter': '/images/Garden Planter.png',
  'Eco Bench': '/images/Eco Bench.png',
  'ECOBIKE RACK': '/images/ECOBIKE RACK.png',
  'ECOBUSSTOP': '/images/ECOBUSSTOP.png',
  'Playground Block (Art Tiles)': '/images/art-tiles.png',
  'Ecostreet Furniture': '/images/green-city_5994274.png',
};

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
  'Ecostreet Furniture': 'Call for price',
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['shop', 'translation']);
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const { animationState, triggerAnimation, completeAnimation } = useAddToCartAnimation();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  const productDetail = useMemo(() => {
    if (!id) return null;
    let product = PRODUCT_DETAIL_DATA[id];
    if (!product) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        product = Object.values(PRODUCT_DETAIL_DATA).find(p => p.id === numericId) || null;
      }
    }
    return product;
  }, [id]);
  
  useEffect(() => {
    if (productDetail?.folderName) {
      // Get all images from the product folder
      let images = getProductImages(productDetail.folderName);
      
      // If no images found, fallback to main product image
      if (images.length === 0 && PRODUCT_IMAGE_MAP[productDetail.englishName]) {
        images = [PRODUCT_IMAGE_MAP[productDetail.englishName]];
      }
      
      // Set all images (they will be filtered by failedImages if needed)
      setProductImages(images);
      // Reset failed images when product changes
      setFailedImages(new Set());
      // Reset selected image index
      setSelectedImageIndex(0);
      
      // Preload images for better performance
      // Use requestAnimationFrame to avoid blocking
      requestAnimationFrame(() => {
        images.forEach((src, index) => {
          // Eager load first few, lazy load rest
          const img = new Image();
          img.loading = index < 4 ? 'eager' : 'lazy';
          img.src = src;
          
          // Debug: Log image dimensions when loaded
          img.onload = () => {
            if (img.width > 0 && img.height > 0) {
              console.log(`✅ Loaded: ${src} (${img.width}x${img.height})`);
            }
          };
          
          img.onerror = () => {
            console.warn(`❌ Failed to load: ${src}`);
          };
        });
      });
    }
  }, [productDetail]);
  
  // Filter out failed images
  const validProductImages = useMemo(() => {
    return productImages.filter(img => !failedImages.has(img));
  }, [productImages, failedImages]);
  
  const handleImageError = useCallback((imageSrc: string) => {
    // Mark this image as failed (but don't add to failed set yet - try alternatives first)
    console.warn(`❌ Failed to load image: ${imageSrc}, trying alternatives...`);
    
    // First, try a direct fetch to see if the file exists
    fetch(imageSrc, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log(`✅ File exists but img tag failed, retrying: ${imageSrc}`);
          // File exists, retry after a short delay
          setTimeout(() => {
            const retryImg = new Image();
            retryImg.onload = () => {
              setProductImages(prev => {
                const updated = [...prev];
                const index = updated.indexOf(imageSrc);
                if (index >= 0) {
                  // Force re-render by creating new array reference
                  updated[index] = imageSrc + '?retry=' + Date.now();
                }
                return updated;
              });
            };
            retryImg.src = imageSrc;
          }, 500);
          return;
        }
      })
      .catch(() => {
        // Fetch failed, continue with variations
      });
    
    // Try multiple URL variations
    const variations = getImageUrlVariations(imageSrc);
    console.log(`🔍 Trying ${variations.length} URL variations for: ${imageSrc}`);
    let triedCount = 0;
    
    const tryNextVariation = () => {
      if (triedCount >= variations.length) {
        // All variations failed, mark as failed
        console.warn(`❌ All variations failed for: ${imageSrc}`);
        setFailedImages(prev => new Set(prev).add(imageSrc));
        return;
      }
      
      const variation = variations[triedCount];
      triedCount++;
      
      // Skip if it's the original or already failed
      if (variation === imageSrc || failedImages.has(variation)) {
        tryNextVariation();
        return;
      }
      
      console.log(`🔄 Trying variation ${triedCount}/${variations.length}: ${variation}`);
      
      const testImg = new Image();
      testImg.onload = () => {
        console.log(`✅ Alternative URL works: ${variation}`);
        // Replace the failed image with working variation
        setProductImages(prev => prev.map(img => img === imageSrc ? variation : img));
      };
      testImg.onerror = () => {
        // Try next variation
        tryNextVariation();
      };
      testImg.src = variation;
    };
    
    // Start trying variations
    tryNextVariation();
  }, [failedImages, setProductImages]);
  
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
  
  const handleAddToCart = useCallback(() => {
    if (!productDetail) return;
    
    const price = PRODUCT_PRICE_MAP[productDetail.englishName] || 'Call for price';
    if (price === 'Call for price') {
      window.open(`mailto:sukhrobjonrikhsiboev@gmail.com?subject=${encodeURIComponent(t('buttons.contactUs', { ns: 'shop' }))} - ${t(productDetail.nameKey, { ns: 'shop' })}&body=${encodeURIComponent(t('inquiryAboutProduct', { defaultValue: 'I am interested in this product:', ns: 'shop' }))} ${t(productDetail.nameKey, { ns: 'shop' })}`, '_blank');
      toast.info(t('openingEmail', { defaultValue: 'Opening email client...', ns: 'shop' }));
      return;
    }
    
    const button = document.querySelector('[data-add-to-cart]') as HTMLElement;
    if (button) {
      triggerAnimation(heroImage, button);
    }
    
    addToCart({
      id: productDetail.id,
      productName: t(productDetail.nameKey, { ns: 'shop' }),
      price: price,
      image: heroImage,
      description: t(productDetail.descriptionKey, { ns: 'shop' }),
      nameKey: productDetail.nameKey,
      descriptionKey: productDetail.descriptionKey,
    });
    
    setTimeout(() => {
      let floatingCartIcon = document.querySelector('[data-floating-cart-icon="true"]') as HTMLElement;
      if (!floatingCartIcon) {
        floatingCartIcon = document.querySelector('[aria-label="Open shopping cart"]') as HTMLElement;
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
  }, [productDetail, heroImage, addToCart, triggerAnimation, t]);
  
  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev + 1) % validProductImages.length);
  }, [validProductImages.length]);
  
  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev - 1 + validProductImages.length) % validProductImages.length);
  }, [validProductImages.length]);
  
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
  
  if (!productDetail) {
    return (
      <Layout title={t('productNotFound', { defaultValue: 'Product Not Found', ns: 'translation' })}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-4">
              <h1 className="text-2xl font-bold">Product Not Found</h1>
              <p className="text-gray-600">The product you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/shop')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  const productName = t(productDetail.nameKey, { ns: 'shop' });
  const productDescription = t(productDetail.descriptionKey, { ns: 'shop' });
  const productCategory = t(productDetail.categoryKey, { ns: 'shop' });
  const price = PRODUCT_PRICE_MAP[productDetail.englishName] || 'Call for price';
  
  return (
    <Layout title={productName}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <section 
          id="hero" 
          className="relative w-full overflow-hidden"
          style={{ minHeight: isMobile ? '60vh' : '70vh' }}
        >
          {heroImage && (
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={productName}
                className="w-full h-full object-cover min-w-0 min-h-0"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                loading="eager"
                onError={() => handleImageError(heroImage)}
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_GREEN}88 0%, ${BRAND_GOLD}66 100%)`,
                }}
              />
            </div>
          )}
          
          <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 lg:py-16">
            <Button
              variant="ghost"
              className="mb-4 text-white hover:text-white hover:bg-white/20"
              onClick={() => navigate('/shop')}
              aria-label="Back to shop"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToShop', { defaultValue: 'Back to Shop', ns: 'shop' })}
            </Button>
            
            <div className="max-w-3xl">
              <Badge 
                className="mb-4 bg-white/90 text-gray-800 hover:bg-white"
                variant="secondary"
              >
                {productCategory}
              </Badge>
              
              <h1 
                className={cn(
                  "font-bold text-white mb-2 drop-shadow-lg",
                  isMobile ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl lg:text-6xl"
                )}
              >
                {productName}
              </h1>
              
              <p 
                className={cn(
                  "text-white/95 mb-6 drop-shadow-md",
                  isMobile ? "text-base md:text-lg" : "text-lg md:text-xl"
                )}
              >
                {productDescription}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {productDetail.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    className="bg-white/90 text-gray-800 hover:bg-white border-0"
                    variant="secondary"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    {badge.text}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div>
                  {price === 'Call for price' ? (
                    <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                      {t('pricing.callForPrice', { ns: 'shop' })}
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                        {price}
                      </div>
                      <div className="text-white/80 text-sm md:text-base">
                        {t('pricing.perSqM', { defaultValue: 'per sq. m', ns: 'shop' })}
                      </div>
                    </>
                  )}
                </div>
                
                <Button
                  data-add-to-cart
                  size={isMobile ? "default" : "lg"}
                  className={cn(
                    "bg-white text-gray-900 hover:bg-gray-100",
                    isMobile ? "w-full sm:w-auto" : ""
                  )}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {price === 'Call for price' 
                    ? t('buttons.contactUs', { ns: 'shop' })
                    : t('buttons.addToCart', { ns: 'shop' })
                  }
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <main id="main-content" className="container mx-auto px-4 py-8 md:py-12">
          {validProductImages.length > 0 && (
            <section className="mb-12" aria-label="Product gallery">
              <h2 className={cn(
                "font-bold mb-6",
                isMobile ? "text-xl" : "text-2xl md:text-3xl"
              )}>
                {t('productGallery', { defaultValue: 'Product Gallery', ns: 'shop' })}
              </h2>
              
              {!isMobile && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {validProductImages.map((img, index) => (
                    <div
                      key={`${img}-${index}`}
                      className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-100 min-h-[200px]"
                      onClick={() => {
                        const validIndex = validProductImages.indexOf(img);
                        setSelectedImageIndex(validIndex >= 0 ? validIndex : 0);
                        setLightboxOpen(true);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View image ${index + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          const validIndex = validProductImages.indexOf(img);
                          setSelectedImageIndex(validIndex >= 0 ? validIndex : 0);
                          setLightboxOpen(true);
                        }
                      }}
                    >
                      <img
                        src={img}
                        alt={`${productName} - Image ${index + 1}`}
                        className="w-full h-full object-cover min-w-0 min-h-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          minWidth: '100%',
                          minHeight: '100%',
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        loading={index < 4 ? "eager" : "lazy"}
                        onError={() => handleImageError(img)}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.width === 1024 && target.height === 1024) {
                            console.log(`✅ Square image loaded: ${img} (1024x1024)`);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isMobile && (
                <div className="relative">
                  <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 flex gap-4 pb-4">
                    {validProductImages.map((img, index) => (
                      <div
                        key={`${img}-${index}`}
                        className="relative flex-shrink-0 w-[85vw] snap-center cursor-pointer bg-gray-100 rounded-lg min-h-[200px] flex items-center justify-center"
                        onClick={() => {
                          const validIndex = validProductImages.indexOf(img);
                          setSelectedImageIndex(validIndex >= 0 ? validIndex : 0);
                          setLightboxOpen(true);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${productName} - Image ${index + 1}`}
                          className="w-full h-auto max-w-full rounded-lg min-w-0"
                          style={{ maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
                          loading={index < 2 ? "eager" : "lazy"}
                          onError={() => handleImageError(img)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
          
          <section className="mb-12" aria-labelledby="overview-heading">
            <Card>
              <CardHeader>
                <CardTitle 
                  id="overview-heading"
                  className={cn(isMobile ? "text-xl" : "text-2xl md:text-3xl")}
                >
                  {productDetail.overview.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className={cn(
                  "text-gray-700",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {productDetail.overview.description}
                </p>
                
                <ul className="space-y-2">
                  {productDetail.overview.specifications.map((spec, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className={cn("text-gray-700", isMobile ? "text-sm" : "text-base")}>
                        {spec}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
          
          {productDetail.technicalSpecs.length > 0 && (
            <section className="mb-12" aria-labelledby="specs-heading">
              <h2 
                id="specs-heading"
                className={cn(
                  "font-bold mb-6",
                  isMobile ? "text-xl" : "text-2xl md:text-3xl"
                )}
              >
                {t('technicalSpecifications', { defaultValue: 'Technical Specifications', ns: 'shop' })}
              </h2>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className={cn(isMobile ? "text-sm" : "text-base")}>
                            {t('specProperty', { defaultValue: 'Property', ns: 'shop' })}
                          </TableHead>
                          <TableHead className={cn(isMobile ? "text-sm" : "text-base")}>
                            {t('specValue', { defaultValue: 'Value', ns: 'shop' })}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productDetail.technicalSpecs.map((spec, index) => (
                          <TableRow key={index}>
                            <TableCell className={cn(
                              "font-medium",
                              isMobile ? "text-sm" : "text-base"
                            )}>
                              {spec.label}
                            </TableCell>
                            <TableCell className={cn(isMobile ? "text-sm" : "text-base")}>
                              {spec.value}
                              {spec.unit && <span className="text-gray-500 ml-1">{spec.unit}</span>}
                              {spec.description && (
                                <span className="text-gray-500 block text-xs mt-1">
                                  {spec.description}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
          
          {productDetail.sustainability.length > 0 && (
            <section className="mb-12" aria-labelledby="sustainability-heading">
              <h2 
                id="sustainability-heading"
                className={cn(
                  "font-bold mb-6 flex items-center",
                  isMobile ? "text-xl" : "text-2xl md:text-3xl"
                )}
              >
                <Leaf className="mr-2 h-6 w-6 text-green-600" />
                {t('sustainabilityMetrics', { defaultValue: 'Sustainability Metrics', ns: 'shop' })}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productDetail.sustainability.map((metric, index) => (
                  <Card key={index} className="bg-gradient-to-br from-green-50 to-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={cn(
                          "font-semibold",
                          isMobile ? "text-base" : "text-lg"
                        )}>
                          {metric.label}
                        </h3>
                        <Recycle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </div>
                      <div className={cn(
                        "font-bold text-green-600 mb-1",
                        isMobile ? "text-xl" : "text-2xl"
                      )}>
                        {metric.value}
                        {metric.unit && <span className="text-base ml-1">{metric.unit}</span>}
                      </div>
                      {metric.description && (
                        <p className={cn(
                          "text-gray-600",
                          isMobile ? "text-sm" : "text-base"
                        )}>
                          {metric.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {productDetail.materialComposition && (
                <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className={cn(isMobile ? "text-lg" : "text-xl")}>
                      {t('materialComposition', { defaultValue: 'Material Composition', ns: 'shop' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {productDetail.materialComposition.recycledRubber && (
                        <div className="flex items-center justify-between">
                          <span className={cn(isMobile ? "text-sm" : "text-base")}>
                            {t('recycledRubber', { defaultValue: 'Recycled Rubber', ns: 'shop' })}
                          </span>
                          <span className={cn(
                            "font-bold text-green-600",
                            isMobile ? "text-base" : "text-lg"
                          )}>
                            {productDetail.materialComposition.recycledRubber}%
                          </span>
                        </div>
                      )}
                      {productDetail.materialComposition.recycledPlastic && (
                        <div className="flex items-center justify-between">
                          <span className={cn(isMobile ? "text-sm" : "text-base")}>
                            {t('recycledPlastic', { defaultValue: 'Recycled Plastic', ns: 'shop' })}
                          </span>
                          <span className={cn(
                            "font-bold text-green-600",
                            isMobile ? "text-base" : "text-lg"
                          )}>
                            {productDetail.materialComposition.recycledPlastic}%
                          </span>
                        </div>
                      )}
                      {productDetail.materialComposition.other && (
                        <div className="flex items-center justify-between">
                          <span className={cn(isMobile ? "text-sm" : "text-base")}>
                            {t('otherMaterials', { defaultValue: 'Other Materials', ns: 'shop' })}
                          </span>
                          <span className={cn(
                            "font-medium text-gray-700",
                            isMobile ? "text-sm" : "text-base"
                          )}>
                            {productDetail.materialComposition.other}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          )}
          
          {productDetail.useCases.length > 0 && (
            <section className="mb-12" aria-labelledby="use-cases-heading">
              <h2 
                id="use-cases-heading"
                className={cn(
                  "font-bold mb-6",
                  isMobile ? "text-xl" : "text-2xl md:text-3xl"
                )}
              >
                {t('useCases', { defaultValue: 'Use Cases', ns: 'shop' })}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productDetail.useCases.map((useCase, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">{useCase.icon}</div>
                      <h3 className={cn(
                        "font-semibold mb-2",
                        isMobile ? "text-base" : "text-lg"
                      )}>
                        {useCase.title}
                      </h3>
                      <p className={cn(
                        "text-gray-600",
                        isMobile ? "text-sm" : "text-base"
                      )}>
                        {useCase.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
          
          {productDetail.features.length > 0 && (
            <section className="mb-12" aria-labelledby="features-heading">
              <h2 
                id="features-heading"
                className={cn(
                  "font-bold mb-6",
                  isMobile ? "text-xl" : "text-2xl md:text-3xl"
                )}
              >
                {t('features', { defaultValue: 'Features', ns: 'shop' })}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productDetail.features.map((feature, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardContent className="p-6 flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-semibold mb-2",
                            isMobile ? "text-base" : "text-lg"
                          )}>
                            {feature.title}
                          </h3>
                          <p className={cn(
                            "text-gray-600",
                            isMobile ? "text-sm" : "text-base"
                          )}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      
      {lightboxOpen && validProductImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-label="Image lightbox"
          aria-modal="true"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>
          
          {validProductImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}
          
          <div 
            className="max-w-7xl max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={validProductImages[selectedImageIndex] || validProductImages[0]}
              alt={`${productName} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain min-w-0 min-h-0"
              style={{ display: 'block' }}
              onError={() => {
                handleImageError(validProductImages[selectedImageIndex] || '');
                setLightboxOpen(false);
              }}
            />
          </div>
          
          {validProductImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              <span className={cn(isMobile ? "text-sm" : "text-base")}>
                {selectedImageIndex + 1} / {validProductImages.length}
              </span>
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
    </Layout>
  );
}


