/**
 * Enhanced Shop Page for ZAMINAT.eco
 * World-class e-commerce catalog with video hero, advanced filtering, search, and animations
 * Following Apple, Tesla, IKEA, Patagonia, and Dyson design standards
 */

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Sparkles,
  Recycle,
  TrendingUp,
  Grid,
  List
} from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartSidebar from '../components/CartSidebar';
import FloatingCartIcon from '../components/FloatingCartIcon';
import AddToCartAnimation from '../components/AddToCartAnimation';
import { useAddToCartAnimation } from '../hooks/useAddToCartAnimation';
import { PRODUCT_DETAIL_DATA } from '../lib/productData';
import HeroVideo from '../components/shop/HeroVideo';
import ProductCard, { ProductCardProps } from '../components/shop/ProductCard';
import Filters, { FilterState } from '../components/shop/Filters';
import VirtualProductGrid from '../components/shop/VirtualProductGrid';
// Image preloading is handled inline to avoid unused preload warnings
import { useDebounce } from '../hooks/useDebounce';
import { useURLState } from '../hooks/useURLState';
import { useSEO } from '../hooks/useSEO';
import { useHreflang } from '../hooks/useHreflang';
import { ProductCardSkeleton } from '../components/ui/loading-skeleton';
import { contactHelpers } from '@/utils/mailto';

// Product item type
type ProductItem = {
  id: number;
  emoji?: string;
  image?: string;
  nameKey: string;
  englishName: string;
  descriptionKey: string;
  infoKey?: string;
  categoryKey: string;
  price?: string;
  pricingKey?: string;
  isCallForPrice?: boolean;
  recycledPercent?: number;
  category?: string;
};

// Category tag types
type CategoryTag = 'Tiles' | 'Curbs' | 'Bricks' | 'Furniture' | 'Panels' | 'EcoKids' | 'UrbanSound' | 'AquaSave' | 'Art-Tiles' | 'All';

// Sort options
type SortOption = 'newest' | 'popular' | 'price-low' | 'price-high' | 'name';

// Product data with enhanced metadata
const productData: ProductItem[] = [
  {
    id: 1,
    emoji: '🏗️',
    image: '/images/art-tiles.png',
    nameKey: 'products.epdmFreeTiles.name',
    englishName: 'EPDM-free Tiles',
    descriptionKey: 'products.epdmFreeTiles.description',
    infoKey: 'products.epdmFreeTiles.info',
    categoryKey: 'products.epdmFreeTiles.category',
    price: '219 000 UZS',
    pricingKey: 'pricing.perSqM',
    recycledPercent: 90,
    category: 'Tiles'
  },
  {
    id: 2,
    emoji: '🛝',
    image: '/images/EPDM-Tiles.png',
    nameKey: 'products.epdmRubberEcotiles.name',
    englishName: 'EPDM Rubber Ecotiles',
    descriptionKey: 'products.epdmRubberEcotiles.description',
    infoKey: 'products.epdmRubberEcotiles.info',
    categoryKey: 'products.epdmRubberEcotiles.category',
    price: '539 000 UZS',
    pricingKey: 'pricing.perSqM',
    recycledPercent: 95,
    category: 'Tiles'
  },
  {
    id: 3,
    emoji: '🧱',
    image: '/images/EcoBrick.png',
    nameKey: 'products.ecoBrick.name',
    englishName: 'EcoBrick',
    descriptionKey: 'products.ecoBrick.description',
    categoryKey: 'products.ecoBrick.category',
    price: '99 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 100,
    category: 'Bricks'
  },
  {
    id: 4,
    emoji: '🗑️',
    image: '/images/Waste Bin.png',
    nameKey: 'products.wasteBin.name',
    englishName: 'Waste Bin',
    descriptionKey: 'products.wasteBin.description',
    categoryKey: 'products.wasteBin.category',
    price: '79 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 100,
    category: 'Panels'
  },
  {
    id: 5,
    emoji: '🪴',
    image: '/images/Garden Planter.png',
    nameKey: 'products.gardenPlanter.name',
    englishName: 'Garden Planter',
    descriptionKey: 'products.gardenPlanter.description',
    categoryKey: 'products.gardenPlanter.category',
    price: '149 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 100,
    category: 'Furniture'
  },
  {
    id: 6,
    emoji: '🪑',
    image: '/images/Eco Bench.png',
    nameKey: 'products.ecoBench.name',
    englishName: 'Eco Bench',
    descriptionKey: 'products.ecoBench.description',
    categoryKey: 'products.ecoBench.category',
    price: '790 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 100,
    category: 'Furniture'
  },
  {
    id: 7,
    emoji: '🚲',
    image: '/images/ECOBIKE RACK.png',
    nameKey: 'products.ecobikeRack.name',
    englishName: 'ECOBIKE RACK',
    descriptionKey: 'products.ecobikeRack.description',
    categoryKey: 'products.ecobikeRack.category',
    price: '490 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 100,
    category: 'Furniture'
  },
  {
    id: 8,
    emoji: '🚌',
    image: '/images/ECOBUSSTOP.png',
    nameKey: 'products.ecobusStop.name',
    englishName: 'ECOBUSSTOP',
    descriptionKey: 'products.ecobusStop.description',
    categoryKey: 'products.ecobusStop.category',
    price: '8 590 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 100,
    category: 'Infrastructure'
  },
  {
    id: 9,
    emoji: '🎨',
    image: '/images/art-tiles.png',
    nameKey: 'products.playgroundBlock.name',
    englishName: 'Playground Block (Art Tiles)',
    descriptionKey: 'products.playgroundBlock.description',
    categoryKey: 'products.playgroundBlock.category',
    price: '49 000 UZS',
    pricingKey: 'pricing.perPiece',
    recycledPercent: 90,
    category: 'Art-Tiles'
  },
  {
    id: 10,
    emoji: '🏙️',
    image: '/images/green-city_5994274.png',
    nameKey: 'products.ecostreetFurniture.name',
    englishName: 'Ecostreet Furniture',
    descriptionKey: 'products.ecostreetFurniture.description',
    categoryKey: 'products.ecostreetFurniture.category',
    isCallForPrice: true,
    recycledPercent: 100,
    category: 'Furniture'
  }
];

// Category mapping for filtering - maps product categories to filter category IDs
const getCategoryFromProduct = (product: ProductItem, t: any): string => {
  // Map product.category to filter category IDs
  const categoryMap: Record<string, string> = {
    'Tiles': 'tiles',           // EPDM-free Tiles, EPDM Rubber Ecotiles -> Construction (tiles)
    'Bricks': 'tiles',          // EcoBrick -> Construction (tiles)
    'Furniture': 'furniture',   // Garden Planter, Eco Bench, ECOBIKE RACK, Ecostreet Furniture -> Furniture
    'Panels': 'infrastructure',  // Waste Bin -> Infrastructure
    'Art-Tiles': 'art',         // Playground Block (Art Tiles) -> Art
    'Infrastructure': 'infrastructure' // ECOBUSSTOP -> Infrastructure
  };
  const cat = product.category || '';
  return categoryMap[cat] || '';
};

// Categories for category grid - productCount will be calculated dynamically
const getCategoryData = (t: any, products: ProductItem[]): Category[] => {
  // Calculate product counts dynamically based on actual products
  const getProductCountForCategory = (categoryId: string): number => {
    return products.filter(product => {
      const productCategory = getCategoryFromProduct(product, t);
      return productCategory === categoryId;
    }).length;
  };

  return [
  {
    id: 'tiles',
    name: t('categories.construction.name', { ns: 'shop', defaultValue: 'Construction' }),
    description: t('categories.construction.description', { ns: 'shop' }),
    image: '/images/construction.png',
    icon: '🏗️',
      productCount: getProductCountForCategory('tiles')
  },
  {
      id: 'art',
      name: t('categories.art.name', { ns: 'shop', defaultValue: 'Art' }),
      description: t('categories.art.description', { ns: 'shop', defaultValue: 'Art tiles and decorative products' }),
      image: '/images/art-tiles.png',
      icon: '🎨',
      productCount: getProductCountForCategory('art')
  },
  {
    id: 'furniture',
    name: t('categories.furniture.name', { ns: 'shop', defaultValue: 'Furniture' }),
    description: t('categories.furniture.description', { ns: 'shop' }),
    image: '/images/Furniture.png',
    icon: '🪑',
      productCount: getProductCountForCategory('furniture')
  },
  {
    id: 'infrastructure',
    name: t('categories.infrastructure.name', { ns: 'shop', defaultValue: 'Infrastructure' }),
    description: t('categories.infrastructure.description', { ns: 'shop' }),
    image: '/images/Infrastructure.png',
    icon: '🏙️',
      productCount: getProductCountForCategory('infrastructure')
  }
];
};

export default function Shop() {
  const { t, i18n } = useTranslation(['shop', 'translation']);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { animationState, triggerAnimation, completeAnimation } = useAddToCartAnimation();
  const processingRef = useRef<Set<number>>(new Set());
  const { updateURL, getURLArray, getURLValue } = useURLState();

  // State management with URL sync
  const [filterState, setFilterState] = useState<FilterState>({
    category: [],
    material: [],
    priceRange: [0, 10000000],
    search: ''
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Debounced search for better performance
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Initialize from URL on mount
  useEffect(() => {
    const category = getURLArray('category');
    const material = getURLArray('material');
    const search = getURLValue('search') || '';
    const minPrice = parseInt(getURLValue('minPrice') || '0');
    const maxPrice = parseInt(getURLValue('maxPrice') || '10000000');
    const sort = (getURLValue('sort') || 'newest') as SortOption;
    
    setFilterState({
      category,
      material,
      priceRange: [minPrice, maxPrice],
      search
    });
    setSearchInput(search);
    setSortBy(sort);
  }, []); // Only on mount

  // Sync debounced search to filter state
  useEffect(() => {
    setFilterState(prev => ({
      ...prev,
      search: debouncedSearch
    }));
  }, [debouncedSearch]);

  // Sync filter state to URL (for shareable links)
  useEffect(() => {
    updateURL({
      category: filterState.category.length > 0 ? filterState.category : null,
      material: filterState.material.length > 0 ? filterState.material : null,
      search: filterState.search || null,
      minPrice: filterState.priceRange[0] !== 0 ? filterState.priceRange[0] : null,
      maxPrice: filterState.priceRange[1] !== 10000000 ? filterState.priceRange[1] : null,
      sort: sortBy !== 'newest' ? sortBy : null,
    });
  }, [filterState, sortBy, updateURL]);

  // Restore scroll position when returning from product page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('shopScrollPosition');
    if (savedScrollPosition) {
      // Wait for content to be rendered before restoring scroll
      const restoreScroll = () => {
        const scrollY = parseInt(savedScrollPosition, 10);
        if (scrollY > 0) {
          // Use multiple methods to ensure scroll works
          window.scrollTo({
            top: scrollY,
            behavior: 'instant' // Instant scroll to avoid animation
          });
          // Fallback for older browsers
          if (window.scrollY === 0) {
            document.documentElement.scrollTop = scrollY;
            document.body.scrollTop = scrollY;
          }
        }
        // Clear the saved position after restoring
        sessionStorage.removeItem('shopScrollPosition');
      };
      
      // Try immediately
      requestAnimationFrame(() => {
        restoreScroll();
        // Also try after a short delay to ensure content is loaded
        setTimeout(restoreScroll, 100);
      });
    }
  }, [location.pathname]); // Restore when pathname changes

  // Get product icons and translations
  const productsWithIcons = useMemo(() => {
    return productData.map(product => {
      const productName = t(product.nameKey, { ns: 'shop' });
      const categoryName = t(product.categoryKey, { ns: 'shop' });
      const englishName = product.englishName || productName;
      const iconPath = getIconForProductOrCategory(englishName, product.image);
      
      return {
        ...product,
        iconPath,
        productName,
        categoryName,
        filterCategory: getCategoryFromProduct(product, t) // Map to filter category ID
      };
    });
  }, [t]);

  // Preload critical images (first 6 products) for faster initial load
  // Using Image() objects instead of link preload to avoid "preloaded but not used" warnings
  useEffect(() => {
    const criticalImages = productsWithIcons
      .slice(0, 6)
      .map(p => p.iconPath || p.image)
      .filter(Boolean) as string[];
    
    if (criticalImages.length > 0) {
      // Use Image() objects for preloading - more reliable and avoids preload warnings
      criticalImages.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.loading = 'eager';
      });
    }
  }, [productsWithIcons]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = productsWithIcons;

    // Category filter - match filter category IDs directly
    if (filterState.category.length > 0) {
      filtered = filtered.filter(p => {
        // Product must have a filter category and it must be in the selected filters
        return p.filterCategory && filterState.category.includes(p.filterCategory);
      });
    }

    // Material filter - based on actual product materials
    if (filterState.material.length > 0) {
      filtered = filtered.filter(p => {
        const productName = p.englishName.toLowerCase();
        const description = t(p.descriptionKey, { ns: 'shop' }).toLowerCase();
        const searchText = `${productName} ${description}`;
        
        // Check if product matches ANY of the selected materials (OR logic)
        return filterState.material.some(material => {
          if (material === 'rubber') {
            // Products with rubber: EPDM tiles, rubber-based products
            return searchText.includes('rubber') || 
                   searchText.includes('epdm') ||
                   p.englishName.toLowerCase().includes('rubber') ||
                   p.englishName.toLowerCase().includes('epdm');
          }
          if (material === 'plastic') {
            // Products with plastic: HDPE, PP, plastic-based products (not rubber-based)
            // Most products with 100% recycled are plastic-based unless they mention rubber
            const isRubberBased = searchText.includes('rubber') || searchText.includes('epdm');
            return searchText.includes('plastic') || 
                   searchText.includes('hdpe') || 
                   searchText.includes('pp') ||
                   (p.recycledPercent === 100 && !isRubberBased && p.category !== 'Tiles');
          }
          if (material === 'composite') {
            // Composite materials: mix of rubber and plastic, or polymer-sand
            // Products that are not purely rubber or purely plastic
            const isRubber = searchText.includes('rubber') || searchText.includes('epdm');
            const isPlastic = searchText.includes('plastic') || searchText.includes('hdpe') || searchText.includes('pp');
            return searchText.includes('composite') || 
                   searchText.includes('polymer') ||
                   (isRubber && isPlastic) || // Mix of both
                   (p.recycledPercent >= 70 && p.recycledPercent < 100 && !isRubber && !isPlastic);
          }
          return false;
        });
      });
    }

    // Price filter
    filtered = filtered.filter(p => {
      // If product has no price or is "call for price", include it (don't filter out)
      if (!p.price || p.isCallForPrice) return true;
      
      // Extract numeric price value (remove spaces and "UZS")
      const priceStr = p.price.replace(/\s/g, '').replace(/UZS/gi, '');
      const price = parseFloat(priceStr);
      
      // Check if price is valid and within range
      if (isNaN(price)) return true; // Include if price can't be parsed
      
      return price >= filterState.priceRange[0] && price <= filterState.priceRange[1];
    });

    // Search filter (fuzzy matching)
    if (filterState.search.trim()) {
      const query = filterState.search.toLowerCase();
      filtered = filtered.filter(p => {
        const name = p.productName.toLowerCase();
        const description = t(p.descriptionKey, { ns: 'shop' }).toLowerCase();
        const category = p.categoryName.toLowerCase();
        const keywords = `${name} ${description} ${category}`;
        return keywords.includes(query) || query.split(' ').every(q => keywords.includes(q));
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'price-low':
          const priceA = a.price ? parseFloat(a.price.replace(/\s/g, '')) : Infinity;
          const priceB = b.price ? parseFloat(b.price.replace(/\s/g, '')) : Infinity;
          return priceA - priceB;
        case 'price-high':
          const priceHighA = a.price ? parseFloat(a.price.replace(/\s/g, '')) : 0;
          const priceHighB = b.price ? parseFloat(b.price.replace(/\s/g, '')) : 0;
          return priceHighB - priceHighA;
        case 'popular':
          return b.recycledPercent! - a.recycledPercent!;
        case 'newest':
        default:
          return b.id - a.id;
      }
    });

    return filtered;
  }, [productsWithIcons, filterState, sortBy, t]);

  // Show loading state during filter transitions
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 150);
    return () => clearTimeout(timer);
  }, [filterState, sortBy]);

  // Handle add to cart
  const handleAddToCart = useCallback((product: ProductCardProps) => {
    if (processingRef.current.has(product.id)) {
      return;
    }

    processingRef.current.add(product.id);

    if (product.isCallForPrice) {
      const currentLanguage = i18n.language || 'en';
      contactHelpers.productInquiry(product.name, currentLanguage);
      toast.info(t('openingEmail', { defaultValue: 'Opening email client...', ns: 'shop' }));
      setTimeout(() => processingRef.current.delete(product.id), 1000);
      return;
    }

    const button = document.querySelector(`[data-product-id="${product.id}"]`) as HTMLElement;
    if (button) {
      triggerAnimation(product.image, button);
    }

    addToCart({
      id: product.id,
      productName: product.name,
      price: product.price || '',
      image: product.image,
      description: product.description,
      nameKey: product.name,
      descriptionKey: product.description,
    });

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
      processingRef.current.delete(product.id);
    }, 1000);
  }, [addToCart, triggerAnimation, t]);

  // SEO Schema Markup
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('title', { ns: 'shop', defaultValue: 'ZAMINAT Eco-Products Shop' }),
      description: t('subtitle', { ns: 'shop' }),
      url: window.location.href,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: filteredProducts.map((product, index) => ({
          '@type': 'Product',
          position: index + 1,
          name: product.productName,
          description: t(product.descriptionKey, { ns: 'shop' }),
          image: product.iconPath || product.image,
          offers: product.price ? {
            '@type': 'Offer',
            price: product.price.replace(/\s/g, ''),
            priceCurrency: 'UZS'
          } : undefined,
          brand: {
            '@type': 'Brand',
            name: 'ZAMINAT.eco'
          }
        }))
      }
    };

    let script = document.getElementById('shop-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'shop-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      const scriptToRemove = document.getElementById('shop-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [filteredProducts, t]);

  // SEO Management - Dynamic meta tags, OG tags, canonical URL
  useSEO({
    title: t('title', { ns: 'shop', defaultValue: 'Shop' }),
    description: t('subtitle', { ns: 'shop' }),
    image: '/images/shop-preview.jpg', // Update with actual shop preview image
    type: 'website',
    keywords: 'eco products, recycled tiles, eco-friendly furniture, sustainable products, Uzbekistan',
  });

  // Hreflang tags for multilingual SEO
  useHreflang();

  // Video preloading is handled by HeroVideo component internally
  // The component uses intelligent preloading based on:
  // - Network quality (slow/medium/fast)
  // - Device type (mobile/desktop)
  // - Reduced motion preferences
  // - Intersection Observer for lazy loading
  // This is more sophisticated than manual preload links and avoids browser compatibility issues

  const categories = useMemo(() => getCategoryData(t, productData), [t]);

  return (
    <Layout title={t('title', { ns: 'shop', defaultValue: 'Shop' })}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
        {/* Hero Video Section */}
        <HeroVideo
          videoSrc="/images/intro.mp4"
          posterSrc="/images/green-city_5994274.png"
          title={t('hero.title', { ns: 'shop', defaultValue: 'Where waste ends — life begins.' })}
          subtitle={t('subtitle', { ns: 'shop' })}
          primaryCTA={{
            text: t('buttons.startShopping', { ns: 'shop' }),
            onClick: () => {
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          secondaryCTA={{
            text: t('buttons.learnAboutRecycling', { ns: 'shop', defaultValue: 'Learn About Recycling' }),
            onClick: () => navigate('/about')
          }}
          onVideoReady={() => {
            // Video loaded successfully
            console.log('Hero video loaded and ready');
          }}
        />

        {/* Stats Bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"
        >
          <div className={cn("container mx-auto", isMobile ? "px-2 py-3" : "px-4 py-6")}>
            <div className={cn(
              "grid text-center",
              isMobile ? "grid-cols-3 gap-2" : "grid-cols-3 gap-8"
            )}>
              <div>
                <div className={cn("font-bold text-green-600", isMobile ? "text-base" : "text-2xl md:text-3xl")}>
                  2,500
                </div>
                <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                  {t('stats.kgRecycled', { ns: 'shop' })}
                </div>
              </div>
              <div>
                <div className={cn("font-bold text-blue-600", isMobile ? "text-base" : "text-2xl md:text-3xl")}>
                  156
                </div>
                <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                  {t('stats.productsSold', { ns: 'shop' })}
                </div>
              </div>
              <div>
                <div className={cn("font-bold text-purple-600", isMobile ? "text-base" : "text-2xl md:text-3xl")}>
                  12
                </div>
                <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                  {t('stats.projectsFunded', { ns: 'shop' })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filters and Products Section */}
        <section id="products-section" className={cn("container mx-auto", isMobile ? "px-2 py-4" : "px-4 py-8 md:py-12")}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(isMobile ? "space-y-3" : "space-y-6")}
          >
            {/* Filters */}
            <Filters
              categories={categories.map(c => ({ id: c.id, label: c.name, count: c.productCount }))}
              materials={[
                { id: 'rubber', label: t('filters.materials.rubber', { defaultValue: 'Rubber', ns: 'shop' }) },
                { id: 'plastic', label: t('filters.materials.plastic', { defaultValue: 'Plastic', ns: 'shop' }) },
                { id: 'composite', label: t('filters.materials.composite', { defaultValue: 'Composite', ns: 'shop' }) }
              ]}
              priceRange={[0, 10000000]}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onFilterChange={setFilterState}
            />

            {/* Controls */}
            <div className={cn("flex items-center justify-between flex-wrap", isMobile ? "gap-2" : "gap-4")}>
              <div className="flex items-center gap-2">
                <span className={cn("text-gray-600", isMobile ? "text-xs" : "text-base")}>
                  {filteredProducts.length} {t('productsFound', { defaultValue: 'products found', ns: 'shop' })}
                </span>
              </div>
              <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-2")}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={cn(
                    "rounded-lg border border-gray-300 bg-white text-gray-700",
                    isMobile ? "text-xs px-2 py-1.5" : "px-3 py-2 text-base"
                  )}
                   aria-label={t('ariaLabels.sortProducts', { ns: 'shop', defaultValue: 'Sort products' })}
                >
                  <option value="newest">{t('sort.newest', { defaultValue: 'Newest', ns: 'shop' })}</option>
                  <option value="popular">{t('sort.popular', { defaultValue: 'Most Popular', ns: 'shop' })}</option>
                  <option value="price-low">{t('sort.priceLow', { defaultValue: 'Price: Low to High', ns: 'shop' })}</option>
                  <option value="price-high">{t('sort.priceHigh', { defaultValue: 'Price: High to Low', ns: 'shop' })}</option>
                  <option value="name">{t('sort.name', { defaultValue: 'Name: A-Z', ns: 'shop' })}</option>
                </select>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "transition-colors",
                      isMobile ? "p-1.5" : "p-2",
                      viewMode === 'grid' ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                     aria-label={t('ariaLabels.gridView', { ns: 'shop', defaultValue: 'Grid view' })}
                  >
                    <Grid className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "transition-colors",
                      isMobile ? "p-1.5" : "p-2",
                      viewMode === 'list' ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                     aria-label={t('ariaLabels.listView', { ns: 'shop', defaultValue: 'List view' })}
                  >
                    <List className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid - Virtual Scrolling for Large Lists */}
            <AnimatePresence mode="wait">
              {isFiltering ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    viewMode === 'grid'
                      ? isMobile
                        ? "grid grid-cols-2 gap-1.5"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : isMobile ? "space-y-2" : "space-y-4"
                  )}
                >
                  {Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} isMobile={isMobile} />
                  ))}
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <p className={cn("text-gray-600", isMobile ? "text-base" : "text-lg")}>
                    {t('noProductsFound', { defaultValue: 'No products found. Try adjusting your filters.', ns: 'shop' })}
                  </p>
                </motion.div>
              ) : viewMode === 'grid' ? (
                // Use VirtualProductGrid for grid view (handles virtual scrolling automatically)
                <VirtualProductGrid
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                  isLoading={isFiltering}
                  t={t}
                />
              ) : (
                // List view - render normally (virtual scrolling not needed for list)
                <motion.div
                  key="products-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={isMobile ? "space-y-2" : "space-y-4"}
                >
                  {filteredProducts.map((product, index) => (
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
                      onAddToCart={handleAddToCart}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
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
