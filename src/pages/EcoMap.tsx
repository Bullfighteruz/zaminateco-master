import React, { useState, useMemo } from 'react';
import { Filter, Navigation, MapPin, Recycle, ExternalLink, Info, CheckCircle2, Clock, Users, Sparkles, TrendingUp, Zap, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import EcoCounter from '@/components/EcoCounter';
import InteractiveMap from '@/components/InteractiveMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getCollectionPoints } from '@/lib/collectionData';
import { getIconForProductOrCategory } from '@/lib/iconMatcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/mobile-responsive.css';

// Collection point coordinates in Tashkent, Uzbekistan
const COLLECTION_POINTS = [
  {
    id: 1,
    name: 'Tashkent Central Park',
    lat: 41.3111,
    lng: 69.2797,
    type: 'mixed',
    address: 'Central Park, Tashkent',
    hours: '8:00 AM - 8:00 PM',
    capacity: 'High'
  },
  {
    id: 2,
    name: 'Chilonzor Mahalla',
    lat: 41.2683,
    lng: 69.2031,
    type: 'plastic',
    address: 'Chilonzor District, Tashkent',
    hours: '9:00 AM - 7:00 PM',
    capacity: 'Medium'
  },
  {
    id: 3,
    name: 'Yunusobod District',
    lat: 41.3500,
    lng: 69.2833,
    type: 'tires',
    address: 'Yunusobod District, Tashkent',
    hours: '8:00 AM - 9:00 PM',
    capacity: 'High'
  }
];

export default function EcoMap() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'plastic' | 'tires' | 'mixed'>('all');
  
  // Get translated collection points
  const rawCollectionPoints = getCollectionPoints(t);
  
  // Map of collection point IDs to their original English names (for consistent icon matching)
  const englishNames: Record<number, string> = {
    1: 'Tashkent Central Park',
    2: 'Chilonzor Mahalla',
    3: 'Yunusobod District'
  };
  
  // Get collection points with dynamically matched icons - use English names for consistency
  const collectionPoints = useMemo(() => {
    return rawCollectionPoints.map(point => {
      // Use original English name for icon matching (language-independent)
      const englishName = englishNames[point.id] || point.name;
      
      // Try to match icon based on English name first
      let iconPath = getIconForProductOrCategory(englishName, point.image);
      
      // If name matching returned the fallback (original image), try type matching
      if (iconPath === point.image) {
        const typeMatched = getIconForProductOrCategory(point.type, point.image);
        if (typeMatched !== point.image && typeMatched.startsWith('/images/')) {
          iconPath = typeMatched;
        }
      }
      
      // Ensure we have a valid path
      if (!iconPath || !iconPath.startsWith('/images/')) {
        iconPath = point.type === 'plastic' 
          ? '/images/compost_13285420.png' 
          : point.type === 'tires' 
          ? '/images/ECOBUSSTOP.png' 
          : '/images/park.png';
      }
      
      // Get coordinates for this point
      const coordinates = COLLECTION_POINTS.find(cp => cp.id === point.id);
      
      return {
        ...point,
        iconPath,
        coordinates
      };
    });
  }, [rawCollectionPoints]);

  // Filter collection points
  const filteredPoints = useMemo(() => {
    if (filterType === 'all') return collectionPoints;
    return collectionPoints.filter(point => point.type === filterType);
  }, [collectionPoints, filterType]);

  // Handle navigation to point
  const handleNavigate = (pointId: number) => {
    const point = COLLECTION_POINTS.find(p => p.id === pointId);
    if (point) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat.toString()},${point.lng.toString()}`;
      window.open(url, '_blank');
      toast.success(t('openingNavigation', { defaultValue: 'Opening navigation...' }));
    }
  };

  // Handle point selection
  const handlePointClick = (pointId: number) => {
    setSelectedPoint(selectedPoint === pointId ? null : pointId);
  };

  const totalCollected = useMemo(() => {
    return collectionPoints.reduce((sum, point) => {
      const collected = parseFloat(point.collected?.replace(/[^0-9.]/g, '') || '0');
      return sum + collected;
    }, 0);
  }, [collectionPoints]);

  return (
    <Layout title={t('ecoMap')}>
      <div className={cn("w-full min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50", isMobile ? "p-2" : "p-4")}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "relative overflow-hidden rounded-2xl mb-4",
            "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500",
            "shadow-xl border border-green-400/20",
            isMobile ? "p-4 mb-3" : "p-6 mb-4"
          )}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 opacity-20">
            <MapPin className={cn("text-white", isMobile ? "h-24 w-24" : "h-32 w-32")} />
          </div>
          <div className="absolute bottom-0 left-0 opacity-10">
            <Recycle className={cn("text-white", isMobile ? "h-20 w-20" : "h-28 w-28")} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className={cn("text-yellow-300", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              </motion.div>
              <h1 className={cn(
                "font-bold text-white",
                isMobile ? "text-xl" : "text-3xl"
              )}>
                {t('ecoMap')}
              </h1>
            </div>
            <p className={cn(
              "text-white/90 leading-relaxed",
              isMobile ? "text-xs" : "text-base"
            )}>
              {t('collectionPointsInTashkent')} - {t('findNearestCollectionPoint', { defaultValue: 'Find the nearest collection point' })}
            </p>
          </div>
        </motion.div>

        {/* Stats Overview - Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "grid gap-3 mb-4",
            isMobile ? "grid-cols-2" : "grid-cols-2"
          )}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
              <CardContent className={cn("p-4", isMobile && "p-3")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Recycle className={cn("text-green-600", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </div>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    <span className={cn("font-semibold", isMobile ? "text-xs" : "text-sm")}>+12%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className={cn(
                    "font-bold text-gray-900",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {totalCollected.toLocaleString()} {t('kg')}
                  </p>
                  <p className={cn(
                    "text-gray-600 font-medium",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('totalCollected')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
              <CardContent className={cn("p-4", isMobile && "p-3")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MapPin className={cn("text-blue-600", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Zap className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    <span className={cn("font-semibold", isMobile ? "text-xs" : "text-sm")}>Active</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className={cn(
                    "font-bold text-gray-900",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {filteredPoints.length}
                  </p>
                  <p className={cn(
                    "text-gray-600 font-medium",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('activePoints')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filter Controls - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4"
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className={cn("p-3", isMobile && "p-2")}>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-1.5",
                    isMobile ? "text-xs h-8 px-2" : "text-sm h-9 px-3"
                  )}
                >
                  <Filter className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  {t('filter')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                          window.open(url, '_blank');
                          toast.success(t('locationFound', { defaultValue: 'Location found! Opening map...' }));
                        },
                        () => {
                          toast.error(t('locationError', { defaultValue: 'Unable to get your location' }));
                        }
                      );
                    } else {
                      toast.error(t('locationNotSupported', { defaultValue: 'Geolocation not supported' }));
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5",
                    isMobile ? "text-xs h-8 px-2" : "text-sm h-9 px-3"
                  )}
                >
                  <Navigation className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  {t('myLocation')}
                </Button>
                
                {/* Filter Options */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full overflow-hidden"
                    >
                      <div className={cn(
                        "flex flex-wrap gap-2 pt-2 mt-2 border-t border-gray-200",
                        isMobile ? "pt-2" : "pt-3"
                      )}>
                        {(['all', 'plastic', 'tires', 'mixed'] as const).map((type) => (
                          <motion.div
                            key={type}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant={filterType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setFilterType(type);
                                setShowFilters(false);
                              }}
                              className={cn(
                                filterType === type && "shadow-md",
                                isMobile ? "text-xs h-7 px-2" : "text-sm h-8 px-3"
                              )}
                            >
                              {type === 'all' ? t('all') : t(type)}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Map - Enhanced Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <Card className="border-0 shadow-xl overflow-hidden bg-white">
            <CardHeader className={cn(
              "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
              isMobile ? "p-4" : "p-6"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MapPin className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </div>
                  <CardTitle className={cn(
                    "text-white font-bold",
                    isMobile ? "text-base" : "text-xl"
                  )}>
                    {t('collectionPointsInTashkent')}
                  </CardTitle>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {filteredPoints.length} {t('points', { defaultValue: 'points' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <InteractiveMap
                points={filteredPoints.map(point => {
                  const coord = COLLECTION_POINTS.find(cp => cp.id === point.id);
                  return {
                    id: point.id,
                    name: point.name,
                    lat: coord?.lat || 41.2995,
                    lng: coord?.lng || 69.2401,
                    type: point.type as 'plastic' | 'tires' | 'mixed',
                    address: coord?.address || point.name,
                    hours: coord?.hours || '8:00 AM - 8:00 PM',
                    capacity: coord?.capacity || 'Medium',
                    collected: point.collected,
                    distance: point.distance,
                    iconPath: point.iconPath
                  };
                })}
                center={{ lat: 41.2995, lng: 69.2401 }}
                zoom={12}
                height={isMobile ? '400px' : '650px'}
                isMobile={isMobile}
                onPointClick={(point) => {
                  setSelectedPoint(point.id);
                  handlePointClick(point.id);
                }}
                onNavigate={(point) => {
                  handleNavigate(point.id);
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Collection Points List - Modern Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-4"
        >
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className={cn(
              "border-b border-gray-100",
              isMobile ? "p-4" : "p-6"
            )}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Users className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <CardTitle className={cn(
                  "font-bold text-gray-900",
                  isMobile ? "text-base" : "text-xl"
                )}>
                  {t('nearbyCollectionPoints')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className={cn(
              "space-y-3",
              isMobile ? "p-3" : "p-6"
            )}>
              {filteredPoints.map((point, index) => {
                const coordinates = COLLECTION_POINTS.find(cp => cp.id === point.id);
                const isSelected = selectedPoint === point.id;
                
                return (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className={cn(
                        "relative rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                        isSelected 
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg" 
                          : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md",
                        isMobile ? "p-3" : "p-4"
                      )}
                      onClick={() => handlePointClick(point.id)}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <div className="p-1.5 bg-green-500 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </motion.div>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn(
                          "rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                          point.type === 'plastic' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                          point.type === 'tires' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                          'bg-gradient-to-br from-purple-400 to-pink-500',
                          isMobile ? "w-14 h-14 p-2" : "w-16 h-16 p-3"
                        )}>
                          <img 
                            src={point.iconPath || point.image}
                            alt={point.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const fallback = point.type === 'plastic' 
                                ? '/images/compost_13285420.png' 
                                : point.type === 'tires' 
                                ? '/images/ECOBUSSTOP.png' 
                                : '/images/park.png';
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className={cn(
                                "font-bold text-gray-900 mb-1",
                                isMobile ? "text-sm" : "text-base"
                              )}>
                                {point.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                                <MapPin className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                                <span className={cn(isMobile ? "text-xs" : "text-sm")}>
                                  {coordinates?.address || point.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={cn(
                              "bg-green-100 text-green-800 border-green-200 font-medium",
                              isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
                            )}>
                              <CheckCircle2 className={cn("mr-1", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                              {t('active')}
                            </Badge>
                            <Badge variant="outline" className={cn(
                              "capitalize font-medium",
                              isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
                            )}>
                              {point.type === 'plastic' ? t('plastic') : 
                               point.type === 'tires' ? t('tires') : 
                               t('mixed')}
                            </Badge>
                            {point.collected && (
                              <Badge variant="outline" className={cn(
                                "font-medium",
                                isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
                              )}>
                                <Recycle className={cn("mr-1", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                                {point.collected} {t('kg')}
                              </Badge>
                            )}
                            {coordinates && point.distance && (
                              <Badge variant="outline" className={cn(
                                "font-medium",
                                isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
                              )}>
                                {point.distance} {t('kmAway')}
                              </Badge>
                            )}
                          </div>

                          {/* Info Row */}
                          <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                              <span className={cn(isMobile ? "text-[10px]" : "text-xs")}>
                                {coordinates?.hours || '8:00 AM - 8:00 PM'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Award className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                              <span className={cn(isMobile ? "text-[10px]" : "text-xs")}>
                                {coordinates?.capacity || 'Medium'} {t('capacity', { defaultValue: 'Capacity' })}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button 
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(point.id);
                            }}
                            className={cn(
                              "w-full",
                              isSelected && "bg-green-600 hover:bg-green-700",
                              isMobile ? "text-xs h-8" : "text-sm h-9"
                            )}
                          >
                            <Navigation className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            {t('navigate')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary & Tips - Side by Side on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {/* Collection Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className={cn(
              "border-b border-blue-200/50",
              isMobile ? "p-4" : "p-5"
            )}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500">
                  <TrendingUp className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <CardTitle className={cn(
                  "font-bold text-blue-900",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  {t('collectionSummary')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className={cn(
              "space-y-2",
              isMobile ? "p-4" : "p-5"
            )}>
              {collectionPoints.map((point) => (
                <div key={point.id} className="flex justify-between items-center p-2 rounded-lg bg-white/60">
                  <span className={cn("text-blue-800 font-medium", isMobile ? "text-xs" : "text-sm")}>
                    {point.name}:
                  </span>
                  <span className={cn("font-bold text-blue-900", isMobile ? "text-xs" : "text-sm")}>
                    {point.collected} {t('kg')}
                  </span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100/80">
                  <span className={cn("font-bold text-blue-900", isMobile ? "text-xs" : "text-sm")}>
                    {t('totalCollected')}:
                  </span>
                  <span className={cn("font-bold text-blue-900", isMobile ? "text-base" : "text-lg")}>
                    {totalCollected.toLocaleString()} {t('kg')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Tips */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className={cn(
              "border-b border-green-200/50",
              isMobile ? "p-4" : "p-5"
            )}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500">
                  <Info className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <CardTitle className={cn(
                  "font-bold text-green-900",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  {t('collectionTips')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className={cn(
              "space-y-2",
              isMobile ? "p-4" : "p-5"
            )}>
              {[
                t('plasticItems'),
                t('rubberItems'),
                t('preparation'),
                t('rewards')
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/60"
                >
                  <div className="mt-0.5 p-1 rounded-full bg-green-500 flex-shrink-0">
                    <CheckCircle2 className={cn("text-white", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                  </div>
                  <p className={cn("text-green-800 font-medium", isMobile ? "text-xs" : "text-sm")}>
                    {tip}
                  </p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
