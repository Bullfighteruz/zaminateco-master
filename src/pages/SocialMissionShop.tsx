import React, { useMemo, useRef } from 'react';
import { ShoppingBag, TrendingUp, Phone, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartSidebar from '../components/CartSidebar';
import FloatingCartIcon from '../components/FloatingCartIcon';
import AddToCartAnimation from '../components/AddToCartAnimation';
import { useAddToCartAnimation } from '../hooks/useAddToCartAnimation';
import { contactHelpers } from '@/utils/mailto';

// Sample product data with translation keys
// IMPORTANT: englishName is used for icon matching to ensure consistency across languages
type ProductItem = {
  id: number;
  emoji?: string;
  image?: string;
  nameKey: string;
  englishName?: string;
  descriptionKey?: string;
  infoKey?: string;
  categoryKey?: string;
  price?: string;
  pricingKey?: string;
  isCallForPrice?: boolean;
};

const productData: ProductItem[] = [
  {
    id: 1,
    emoji: '🏗️',
    image: '/images/art-tiles.webp',
    nameKey: 'products.epdmFreeTiles.name',
    englishName: 'EPDM-free Tiles', // Original English name for icon matching
    descriptionKey: 'products.epdmFreeTiles.description',
    infoKey: 'products.epdmFreeTiles.info',
    categoryKey: 'products.epdmFreeTiles.category',
    price: '219 000 UZS',
    pricingKey: 'pricing.perSqM'
  },
  {
    id: 2,
    emoji: '🛝',
    image: '/images/EPDM Tiles.webp', // Primary image
    nameKey: 'products.epdmRubberEcotiles.name',
    englishName: 'EPDM Rubber Ecotiles', // Original English name for icon matching
    descriptionKey: 'products.epdmRubberEcotiles.description',
    infoKey: 'products.epdmRubberEcotiles.info',
    categoryKey: 'products.epdmRubberEcotiles.category',
    price: '539 000 UZS',
    pricingKey: 'pricing.perSqM'
  },
  {
    id: 3,
    emoji: '🧱',
    image: '/images/EcoBrick.webp',
    nameKey: 'products.ecoBrick.name',
    englishName: 'EcoBrick', // Original English name for icon matching
    descriptionKey: 'products.ecoBrick.description',
    categoryKey: 'products.ecoBrick.category',
    price: '99 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 4,
    emoji: '🗑️',
    image: '/images/Waste Bin.webp',
    nameKey: 'products.wasteBin.name',
    englishName: 'Waste Bin', // Original English name for icon matching
    descriptionKey: 'products.wasteBin.description',
    categoryKey: 'products.wasteBin.category',
    price: '79 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 5,
    emoji: '🪴',
    image: '/images/Garden Planter.webp',
    nameKey: 'products.gardenPlanter.name',
    englishName: 'Garden Planter', // Original English name for icon matching
    descriptionKey: 'products.gardenPlanter.description',
    categoryKey: 'products.gardenPlanter.category',
    price: '149 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 6,
    emoji: '🪑',
    image: '/images/Eco Bench.webp',
    nameKey: 'products.ecoBench.name',
    englishName: 'Eco Bench', // Original English name for icon matching
    descriptionKey: 'products.ecoBench.description',
    categoryKey: 'products.ecoBench.category',
    price: '790 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 7,
    emoji: '🚲',
    image: '/images/ECOBIKE RACK.webp',
    nameKey: 'products.ecobikeRack.name',
    englishName: 'ECOBIKE RACK', // Original English name for icon matching
    descriptionKey: 'products.ecobikeRack.description',
    categoryKey: 'products.ecobikeRack.category',
    price: '490 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 8,
    emoji: '🚌',
    image: '/images/ECOBUSSTOP.webp',
    nameKey: 'products.ecobusStop.name',
    englishName: 'ECOBUSSTOP', // Original English name for icon matching
    descriptionKey: 'products.ecobusStop.description',
    categoryKey: 'products.ecobusStop.category',
    price: '8 590 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 9,
    emoji: '🎨',
    image: '/images/art-tiles.webp',
    nameKey: 'products.playgroundBlock.name',
    englishName: 'Playground Block (Art Tiles)', // Original English name for icon matching
    descriptionKey: 'products.playgroundBlock.description',
    categoryKey: 'products.playgroundBlock.category',
    price: '49 000 UZS',
    pricingKey: 'pricing.perPiece'
  },
  {
    id: 10,
    emoji: '🏙️',
    image: '/images/green-city_5994274.webp',
    nameKey: 'products.ecostreetFurniture.name',
    englishName: 'Ecostreet Furniture', // Original English name for icon matching
    descriptionKey: 'products.ecostreetFurniture.description',
    categoryKey: 'products.ecostreetFurniture.category',
    isCallForPrice: true
  }
];

// Category data with translation keys and icon images
// Note: Icon files exist in public/images/ folder:
// - construction.png (lowercase)
// - recreation.png (lowercase)
// - Furniture.png
// - Infrastructure.png
// - playground.png
// IMPORTANT: englishName and iconImage are used for consistent icons across languages
type CategoryItem = {
  emoji?: string;
  image?: string;
  iconImage?: string;
  nameKey: string;
  englishName?: string;
  descriptionKey?: string;
};

const categoryData: CategoryItem[] = [
  {
    emoji: '🏗️',
    image: '/images/art-tiles.webp',
    iconImage: '/images/construction.webp', // Construction icon - explicit path
    nameKey: 'categories.construction.name',
    englishName: 'Construction', // Original English name for icon matching
    descriptionKey: 'categories.construction.description'
  },
  {
    emoji: '🛝',
    image: '/images/Eco Bench.webp',
    iconImage: '/images/recreation.webp', // Recreation icon - explicit path
    nameKey: 'categories.recreation.name',
    englishName: 'Recreation', // Original English name for icon matching
    descriptionKey: 'categories.recreation.description'
  },
  {
    emoji: '🪑',
    image: '/images/Eco Bench.webp',
    iconImage: '/images/Furniture.webp', // Furniture icon - explicit path
    nameKey: 'categories.furniture.name',
    englishName: 'Furniture', // Original English name for icon matching
    descriptionKey: 'categories.furniture.description'
  },
  {
    emoji: '🏙️',
    image: '/images/green-city_5994274.webp',
    iconImage: '/images/Infrastructure.webp', // Infrastructure icon - explicit path
    nameKey: 'categories.infrastructure.name',
    englishName: 'Infrastructure', // Original English name for icon matching
    descriptionKey: 'categories.infrastructure.description'
  }
];

export default function SocialMissionShop() {
  const { t, i18n } = useTranslation(['shop', 'translation']);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const { animationState, triggerAnimation, completeAnimation } = useAddToCartAnimation();
  // Track processing state to prevent double-adds (especially in React StrictMode)
  const processingRef = useRef<Set<number>>(new Set());
  
  // Get product icons - use English names for consistency across languages
  const productsWithIcons = useMemo(() => {
    return productData.map(product => {
      const productName = t(product.nameKey, { ns: 'shop' });
      const categoryName = t(product.categoryKey, { ns: 'shop' });
      
      // Use original English name for icon matching (language-independent)
      const englishName = product.englishName || productName;
      const iconPath = getIconForProductOrCategory(englishName, product.image);
      
      return {
        ...product,
        iconPath,
        productName,
        categoryName
      };
    });
  }, [t]);
  
  // Get category icons - use explicit iconImage paths for consistency across languages
  const categoriesWithIcons = useMemo(() => {
    return categoryData.map(category => {
      const categoryName = t(category.nameKey, { ns: 'shop' });
      
      // Use explicit iconImage if set, otherwise try matching with English name
      let iconPath = category.iconImage;
      
      if (!iconPath || !iconPath.startsWith('/images/')) {
        const englishName = category.englishName || categoryName;
        iconPath = getIconForProductOrCategory(englishName, category.iconImage || category.image);
      }
      
      // Final fallback
      if (!iconPath || !iconPath.startsWith('/images/')) {
        iconPath = category.iconImage || category.image;
      }
      
      return {
        ...category,
        iconPath,
        categoryName
      };
    });
  }, [t]);

  return (
    <Layout title={t('shop', { ns: 'translation' })}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 relative overflow-hidden">
        {/* Decorative background glow orbs */}
        <div className="bg-glow-orb bg-glow-emerald w-[500px] h-[500px] top-10 -left-40" />
        <div className="bg-glow-orb bg-glow-teal w-[600px] h-[600px] top-1/2 -right-40" />
        <div className="bg-glow-orb bg-glow-emerald w-[400px] h-[400px] bottom-10 -left-20" />

        <div className={cn("w-full relative z-10", isMobile ? "p-1.5 space-y-2" : "p-4 space-y-6")}>
          {/* Header */}
          <div className={cn("text-center", isMobile ? "space-y-1" : "space-y-2")}>
            <h2 className={cn(
              "font-bold",
              isMobile ? "text-base" : "text-lg sm:text-2xl"
            )}>
              {t('title', { ns: 'shop' })}
            </h2>
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-xs" : "text-sm sm:text-base"
            )}>
              {t('subtitle', { ns: 'shop' })}
            </p>
          </div>

          {/* Stats */}
          <Card className="glass-card border border-white/40 shadow-md">
            <CardContent className={cn(isMobile ? "p-2" : "p-3 sm:p-4")}>
              <div className={cn(
                "grid grid-cols-3 text-center",
                isMobile ? "gap-1.5" : "gap-2 sm:gap-4"
              )}>
                <div>
                  <div className={cn("font-bold text-green-600", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>2,500</div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>{t('stats.kgRecycled', { ns: 'shop' })}</div>
                </div>
                <div>
                  <div className={cn("font-bold text-emerald-600", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>156</div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>{t('stats.productsSold', { ns: 'shop' })}</div>
                </div>
                <div>
                  <div className={cn("font-bold text-teal-600", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>12</div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>{t('stats.projectsFunded', { ns: 'shop' })}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eco Products Section */}
          <section id="eco-products">
            <h3 className={cn(
              "font-semibold flex items-center",
              isMobile ? "text-sm mb-2" : "text-lg sm:text-xl mb-3 sm:mb-4"
            )}>
              <ShoppingBag className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 sm:h-5 sm:w-5 mr-2")} />
              {t('sections.ecoProducts', { ns: 'shop' })}
            </h3>
            <div className={cn(
              "grid grid-cols-1",
              isMobile ? "gap-1.5" : "md:grid-cols-2 gap-3 sm:gap-4"
            )}>
              {productsWithIcons.map((product) => (
                <Card 
                  key={product.id} 
                  className="glass-card glass-card-hover border border-white/40 cursor-pointer"
                  onClick={() => {
                    const slug = product.englishName ? productNameToSlug(product.englishName) : String(product.id);
                    navigate(`/product/${slug}`);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${product.productName}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const slug = product.englishName ? productNameToSlug(product.englishName) : String(product.id);
                      navigate(`/product/${slug}`);
                    }
                  }}
                >
                  <CardContent className={cn(
                    "flex flex-col",
                    isMobile ? "p-2" : "p-3 sm:p-4"
                  )}>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className={cn(
                            "flex items-center",
                            isMobile ? "space-x-1.5 mb-1" : "space-x-2 mb-1 sm:mb-2"
                            )}>
                              <img 
                              src={product.iconPath || product.image || product.emoji} 
                                alt={product.productName}
                                className={cn(
                                "object-contain flex-shrink-0",
                                  isMobile ? "w-10 h-10" : "w-12 h-12 sm:w-14 sm:h-14"
                                )}
                                style={{ 
                                  minWidth: isMobile ? '40px' : '48px', 
                                  minHeight: isMobile ? '40px' : '48px',
                                maxWidth: 'none',
                                maxHeight: 'none'
                                }}
                                loading="lazy"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.emoji-fallback')) {
                                  const emojiSpan = document.createElement('span');
                                  emojiSpan.className = 'emoji-fallback text-xl';
                                  emojiSpan.textContent = product.emoji;
                                  parent.appendChild(emojiSpan);
                                }
                              }}
                              />
                            <div>
                              <h4 className={cn(
                                "font-medium",
                                isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                              )}>
                                {t(product.nameKey, { ns: 'shop' })}
                              </h4>
                              <Badge className={cn(isMobile ? "text-[9px] px-1 py-0" : "text-xs")}>
                                {t(product.categoryKey, { ns: 'shop' })}
                              </Badge>
                            </div>
                          </div>
                          <p className={cn(
                            "text-gray-600",
                            isMobile ? "text-[10px] mb-1" : "text-xs mb-1 sm:mb-2"
                          )}>
                            {t(product.descriptionKey, { ns: 'shop' })}
                          </p>
                          {product.infoKey && (
                            <p className={cn(
                              "text-emerald-600",
                              isMobile ? "text-[10px] mb-1" : "text-xs mb-1 sm:mb-2"
                            )}>
                              <Info className={cn("inline", isMobile ? "h-2 w-2 mr-0.5" : "h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1")} />
                              {t(product.infoKey, { ns: 'shop' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={cn("mt-auto", isMobile ? "space-y-1" : "space-y-1 sm:space-y-2")}>
                      <div className="text-center">
                        {product.isCallForPrice ? (
                          <div className={cn(
                            "font-bold text-orange-600",
                            isMobile ? "text-xs mb-1" : "text-sm sm:text-lg mb-1 sm:mb-2"
                          )}>
                            {t('pricing.callForPrice', { ns: 'shop' })}
                          </div>
                        ) : (
                          <>
                            <div className={cn(
                              "font-bold text-green-600",
                              isMobile ? "text-xs mb-0.5" : "text-sm sm:text-xl mb-1"
                            )}>
                              {product.price}
                            </div>
                            <div className={cn(isMobile ? "text-[9px]" : "text-xs") + " text-gray-500"}>
                              {t(product.pricingKey, { ns: 'shop' })}
                            </div>
                          </>
                        )}
                      </div>
                      <Button 
                        className={cn(
                          "w-full",
                          isMobile ? "h-8 text-[10px] py-1" : "text-xs sm:text-sm py-1 sm:py-2 h-7 sm:h-9",
                          product.isCallForPrice 
                            ? 'bg-background hover:bg-accent hover:text-accent-foreground border border-input' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-primary-foreground'
                        )}
                        variant={product.isCallForPrice ? "outline" : "default"}
                        onClick={(e) => {
                          // Prevent navigation to detail page when clicking button
                          e.stopPropagation();
                          // Prevent double-clicks and event bubbling
                          e.preventDefault();
                          
                          // Check if this product is already being processed (prevents React StrictMode double-calls)
                          if (processingRef.current.has(product.id)) {
                            return; // Already processing this product
                          }
                          
                          // Prevent rapid multiple clicks (debounce protection)
                          const button = e.currentTarget;
                          const isProcessing = button.getAttribute('data-adding') === 'true';
                          if (isProcessing) {
                            return; // Already processing, ignore this click
                          }
                          
                          // Mark product and button as processing
                          processingRef.current.add(product.id);
                          button.setAttribute('data-adding', 'true');
                          button.style.pointerEvents = 'none'; // Disable further clicks
                          
                          // Re-enable after animation completes
                          setTimeout(() => {
                            processingRef.current.delete(product.id);
                            button.removeAttribute('data-adding');
                            button.style.pointerEvents = '';
                          }, 1500);
                          
                          if (product.isCallForPrice) {
                            // Open contact form or email
                            const currentLanguage = i18n.language || 'en';
                            contactHelpers.productInquiry(product.productName, currentLanguage);
                            toast.info(t('openingEmail', { defaultValue: 'Opening email client...', ns: 'shop' }));
                          } else {
                            // Trigger animation using the button element from the event
                            const buttonElement = e.currentTarget;
                            triggerAnimation(product.iconPath || product.image, buttonElement);
                            // Add to cart using context with translation keys for language switching
                            addToCart({
                              id: product.id,
                              productName: product.productName, // Current translated name
                              price: product.price,
                              image: product.iconPath || product.image,
                              description: t(product.descriptionKey, { ns: 'shop' }), // Current translated description
                              // Store translation keys for dynamic language updates
                              nameKey: product.nameKey,
                              descriptionKey: product.descriptionKey,
                            });
                            // Add bounce effect to floating cart icon after animation completes
                            setTimeout(() => {
                              // Target the FloatingCartIcon using multiple methods for reliability
                              let floatingCartIcon = document.querySelector('[data-floating-cart-icon="true"]') as HTMLElement;
                              
                              if (!floatingCartIcon) {
                                floatingCartIcon = document.querySelector('[aria-label="Open shopping cart"]') as HTMLElement;
                              }
                              
                              if (floatingCartIcon) {
                                // Reset animation
                                floatingCartIcon.style.animation = 'none';
                                // Force reflow
                                void floatingCartIcon.offsetWidth;
                                // Apply bounce animation
                                floatingCartIcon.style.animation = 'cartBounce 0.6s ease-in-out';
                                // Remove animation after it completes
                                setTimeout(() => {
                                  floatingCartIcon.style.animation = '';
                                }, 600);
                              }
                            }, 1000); // Match animation duration (1.0s)
                          }
                        }}
                      >
                        {product.isCallForPrice ? (
                          <>
                            <Phone className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2")} />
                            {t('buttons.contactUs', { ns: 'shop' })}
                          </>
                        ) : (
                          <>
                            <ShoppingBag className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2")} />
                            {t('buttons.addToCart', { ns: 'shop' })}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <Card className="glass-card border border-white/40 shadow-sm bg-blue-50/10 text-blue-900">
            <CardHeader className={cn(isMobile ? "p-2 pb-1" : "p-4")}>
              <CardTitle className={cn(
                "text-blue-800",
                isMobile ? "text-sm" : "text-lg sm:text-2xl"
              )}>
                {t('sections.howItWorks', { ns: 'shop' })}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(
              "text-blue-700",
              isMobile ? "p-2 pt-1 space-y-1 text-[10px]" : "space-y-1 sm:space-y-2 text-xs sm:text-sm"
            )}>
              <p>
                • <strong>{t('howItWorksPoints.recycledMaterials.title', { ns: 'shop' })}</strong> {t('howItWorksPoints.recycledMaterials.description', { ns: 'shop' })}
              </p>
              <p>
                • <strong>{t('howItWorksPoints.qualityGuaranteed.title', { ns: 'shop' })}</strong> {t('howItWorksPoints.qualityGuaranteed.description', { ns: 'shop' })}
              </p>
              <p>
                • <strong>{t('howItWorksPoints.localProduction.title', { ns: 'shop' })}</strong> {t('howItWorksPoints.localProduction.description', { ns: 'shop' })}
              </p>
              <p>
                • <strong>{t('howItWorksPoints.communityImpact.title', { ns: 'shop' })}</strong> {t('howItWorksPoints.communityImpact.description', { ns: 'shop' })}
              </p>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <section>
            <h3 className={cn(
              "font-semibold flex items-center",
              isMobile ? "text-sm mb-2" : "text-lg sm:text-xl mb-3 sm:mb-4"
            )}>
              <TrendingUp className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 sm:h-5 sm:w-5 mr-2")} />
              {t('sections.popularCategories', { ns: 'shop' })}
            </h3>
            <div className={cn(
              "grid grid-cols-2",
              isMobile ? "gap-1" : "gap-2 sm:gap-3"
            )}>
              {categoriesWithIcons.map((category, index) => (
                <Card key={index} className="glass-card glass-card-hover border border-white/40 cursor-pointer">
                  <CardContent className={cn(
                    "text-center flex flex-col items-center",
                    isMobile ? "p-2" : "p-3 sm:p-4"
                  )}>
                    <div className={cn(
                      "flex items-center justify-center mb-1 rounded-full bg-gradient-to-br from-emerald-50/50 to-teal-50/50 flex-shrink-0",
                      isMobile ? "w-16 h-16 p-2" : "w-20 h-20 sm:w-24 sm:h-24 p-3"
                    )}>
                      <img 
                        src={category.iconPath || category.iconImage || category.image} 
                        alt={category.categoryName} 
                          className={cn(
                            "object-contain flex-shrink-0",
                            isMobile ? "h-10 w-10" : "h-12 w-12 sm:h-14 sm:w-14"
                          )}
                          style={{ 
                            minWidth: isMobile ? '40px' : '48px', 
                            minHeight: isMobile ? '40px' : '48px',
                            maxWidth: 'none',
                            maxHeight: 'none'
                          }}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.emoji-fallback')) {
                            const emojiSpan = document.createElement('span');
                            emojiSpan.className = 'emoji-fallback text-2xl';
                            emojiSpan.textContent = category.emoji;
                            parent.appendChild(emojiSpan);
                          }
                        }}
                      />
                    </div>
                    <h4 className={cn(
                      "font-medium",
                      isMobile ? "text-xs mb-0.5" : "text-sm sm:text-base mb-1"
                    )}>
                      {category.categoryName}
                    </h4>
                    <p className={cn(
                      "text-gray-600",
                      isMobile ? "text-[10px] line-clamp-2" : "text-xs"
                    )}>
                      {t(category.descriptionKey, { ns: 'shop' })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Bottom CTA Section */}
          <Card className="glass-card border border-white/40 shadow-md">
            <CardContent className={cn(
              "text-center",
              isMobile ? "p-3" : "p-4 sm:p-6"
            )}>
              <h3 className={cn(
                "font-bold",
                isMobile ? "text-sm mb-1.5" : "text-lg sm:text-xl mb-2"
              )}>
                {t('bottomSection.title', { ns: 'shop' })}
              </h3>
              <p className={cn(
                "text-gray-600",
                isMobile ? "text-xs mb-2" : "mb-3 sm:mb-4 text-sm sm:text-base"
              )}>
                {t('bottomSection.description', { ns: 'shop' })}
              </p>
              <div className={cn(
                "flex justify-center",
                isMobile ? "flex-col gap-1.5" : "flex-col sm:flex-row gap-2 sm:gap-3"
              )}>
                <Button 
                  className={cn(
                    "bg-emerald-600 hover:bg-emerald-700",
                    isMobile ? "h-8 text-xs py-1.5 px-3" : "text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
                  )}
                  onClick={() => {
                    // Scroll to products section
                    const productsSection = document.getElementById('eco-products');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      // If section doesn't exist, just scroll to top of products
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <ShoppingBag className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2")} />
                  {t('buttons.startShopping', { ns: 'shop' })}
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    isMobile ? "h-8 text-xs py-1.5 px-3" : "text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
                  )}
                  onClick={() => {
                    // Open contact page or email for bulk orders
                    navigate('/contacts');
                    // Alternatively, open email:
                    // window.open('mailto:sukhrobjonrikhsiboev@gmail.com?subject=' + encodeURIComponent(t('buttons.contactForBulkOrders', { ns: 'shop' })), '_blank');
                    toast.info(t('redirectingToContact', { defaultValue: 'Redirecting to contact page...', ns: 'shop' }));
                  }}
                >
                  <Phone className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2")} />
                  {t('buttons.contactForBulkOrders', { ns: 'shop' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <CartSidebar />
      <FloatingCartIcon />
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