import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Award, 
  Star, 
  ChevronDown,
  Target,
  Leaf,
  Heart,
  Globe,
  TrendingUp,
  CheckCircle,
  Info,
  Zap,
  Shield,
  BookOpen,
  Navigation,
  Recycle,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Activity
} from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getIconForProductOrCategory } from '@/lib/iconMatcher';
import { EventCard, type EcoEvent } from '@/components/EventCard';
import InteractiveMap from '@/components/InteractiveMap';
import { getCollectionPoints } from '@/lib/collectionData';
import { toast } from 'sonner';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Collection point coordinates in Tashkent, Uzbekistan (verified locations)
const COLLECTION_POINTS = [
  {
    id: 1,
    name: 'Tashkent Central Park',
    lat: 41.313519,
    lng: 69.298288,
    type: 'mixed',
    address: 'Navoi Avenue, Tashkent Central Park, Tashkent 100000, Uzbekistan',
    hours: '8:00 AM - 8:00 PM',
    capacity: 'High',
    icon: 'park'
  },
  {
    id: 2,
    name: 'Chilonzor Mahalla',
    lat: 41.2683,
    lng: 69.2031,
    type: 'plastic',
    address: 'Chilonzor District, Bunyodkor Avenue, Tashkent, Uzbekistan',
    hours: '9:00 AM - 7:00 PM',
    capacity: 'Medium',
    icon: 'recycle'
  },
  {
    id: 3,
    name: 'Yunusobod District',
    lat: 41.372357,
    lng: 69.310537,
    type: 'tires',
    address: 'Yunusobod District, Amir Temur Avenue, Tashkent, Uzbekistan',
    hours: '8:00 AM - 9:00 PM',
    capacity: 'High',
    icon: 'tires'
  }
];

// Action location points for events
const ACTION_LOCATIONS = [
  {
    id: 101,
    name: 'Chirchiq River',
    lat: 41.246514,
    lng: 69.347525,
    type: 'cleanup',
    address: 'Chirchiq River, Tashkent',
    eventType: 'River Cleanup',
    icon: 'river',
    description: 'River cleanup campaign location'
  },
  {
    id: 102,
    name: 'School #45',
    lat: 41.313413,
    lng: 69.232257,
    type: 'education',
    address: 'School #45, Chilonzor District',
    eventType: 'Education Workshop',
    icon: 'school',
    description: 'Environmental education workshop'
  },
  {
    id: 103,
    name: 'Plastic Recycling Drive',
    lat: 41.336792,
    lng: 69.284764,
    type: 'recycling',
    address: 'Badamzar Street, Tashkent',
    eventType: 'Recycling Drive',
    icon: 'recycle',
    description: 'Plastic recycling collection point'
  },
  {
    id: 104,
    name: 'Environmental Awareness Walk',
    lat: 41.338377,
    lng: 69.223598,
    type: 'awareness',
    address: 'Olmazor District, Tashkent',
    eventType: 'Awareness Walk',
    icon: 'walk',
    description: 'Community awareness walk route'
  }
];

// Helper function to get current and future dates
const getCurrentDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  
  const threeWeeks = new Date(today);
  threeWeeks.setDate(threeWeeks.getDate() + 21);
  
  const oneMonth = new Date(today);
  oneMonth.setDate(oneMonth.getDate() + 30);

  return {
    today: today.toISOString().split('T')[0],
    tomorrow: tomorrow.toISOString().split('T')[0],
    nextWeek: nextWeek.toISOString().split('T')[0],
    twoWeeks: twoWeeks.toISOString().split('T')[0],
    threeWeeks: threeWeeks.toISOString().split('T')[0],
    oneMonth: oneMonth.toISOString().split('T')[0]
  };
};

// Key Features Component
const KeyFeaturesSection = () => {
  const { t } = useTranslation(['actions', 'translation']);
  const isMobile = useIsMobile();
  
  type Feature = {
    image: string;
    title: string;
    englishTitle?: string;
    description: string;
    color: string;
    iconPath?: string;
  };

  const features = useMemo(() => {
    const baseFeatures: Feature[] = [
    {
        image: '/images/community_16119903.webp',
      title: t('communityImpact', { ns: 'actions' }),
      englishTitle: 'Community Impact',
      description: t('communityImpactDesc', { ns: 'actions' }),
      color: "from-emerald-500 to-teal-500",
      iconPath: '/images/community_16119903.webp'
    },
    {
        image: '/images/sustainable-future_2293652.webp',
      title: t('sustainableFuture', { ns: 'actions' }),
      englishTitle: 'Sustainable Future',
      description: t('sustainableFutureDesc', { ns: 'actions' }),
      color: "from-green-500 to-emerald-500",
      iconPath: '/images/sustainable-future_2293652.webp'
    },
    {
        image: '/images/eco-points.webp',
      title: t('earnEcoPoints', { ns: 'actions' }),
      englishTitle: 'Earn EcoPoints',
      description: t('earnEcoPointsDesc', { ns: 'actions' }),
      color: "from-teal-500 to-emerald-500",
      iconPath: '/images/eco-points.webp'
    },
    {
        image: '/images/Meet Like-minded People.webp',
      title: t('meetLikeMindedPeople', { ns: 'actions' }),
      englishTitle: 'Meet Like-minded People',
      description: t('meetLikeMindedPeopleDesc', { ns: 'actions' }),
      color: "from-emerald-500 to-teal-500",
      iconPath: '/images/Meet Like-minded People.webp'
    }
  ];
    
    return baseFeatures.map((feature: Feature) => {
      let iconPath = feature.iconPath;

      if (!iconPath || !iconPath.startsWith('/images/')) {
        const englishTitle = feature.englishTitle || feature.title;
        iconPath = getIconForProductOrCategory(englishTitle, feature.image);
      }

      return {
        ...feature,
        iconPath: iconPath && iconPath.startsWith('/images/') ? iconPath : feature.image
      } as Feature;
    });
  }, [t]);

  return (
    <motion.div variants={itemVariants} className={cn(isMobile ? "mb-6" : "mb-12")}>
      <Card className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 border-2 border-emerald-100/50 overflow-hidden shadow-xl">
        <CardContent className={cn(isMobile ? "p-4" : "p-8")}>
          <div className={cn("text-center", isMobile ? "mb-4" : "mb-8")}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className={cn("text-yellow-500", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              </motion.div>
              <h2 className={cn(
                "font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
                isMobile ? "text-lg" : "text-2xl md:text-3xl"
              )}>
                {t('whyJoinOurEcoActions', { ns: 'actions' })}
              </h2>
            </div>
            <p className={cn(
              "text-gray-600 max-w-2xl mx-auto leading-relaxed",
              isMobile ? "text-xs" : "text-sm sm:text-base"
            )}>
              {t('whyJoinOurEcoActionsDesc', { ns: 'actions' })}
            </p>
          </div>
          
          <div className={cn(
            "grid",
            isMobile 
              ? "grid-cols-2 gap-3" 
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          )}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: isMobile ? 0 : -8, scale: isMobile ? 1 : 1.03 }}
                className={cn(
                  "text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group",
                  isMobile ? "p-3" : "p-6"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center mb-3",
                  isMobile ? "mb-2" : "mb-4"
                )}>
                  <div className="relative group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={feature.iconPath || feature.image} 
                      alt={feature.title} 
                      className={cn(
                        "object-contain flex-shrink-0",
                        isMobile ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
                      )}
                      style={{ 
                        minWidth: isMobile ? '48px' : '64px', 
                        minHeight: isMobile ? '48px' : '64px',
                        maxWidth: 'none',
                        maxHeight: 'none'
                      }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (feature.image && target.src !== feature.image) {
                          target.src = feature.image;
                        }
                      }}
                    />
                  </div>
                </div>
                <h3 className={cn(
                  "font-bold text-gray-900 mb-2",
                  isMobile ? "text-xs mb-1" : "text-base mb-2"
                )}>
                  {feature.title}
                </h3>
                <p className={cn(
                  "text-gray-600 leading-relaxed",
                  isMobile ? "text-[10px] line-clamp-3" : "text-sm"
                )}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function EcoActions() {
  const { t } = useTranslation(['actions', 'translation']);
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showMapFilters, setShowMapFilters] = useState(false);
  const [mapFilterType, setMapFilterType] = useState<'all' | 'plastic' | 'tires' | 'mixed'>('all');

  const dates = getCurrentDates();

  // Map of event IDs to their original English titles (for consistent icon matching)
  const eventEnglishTitles: Record<number, string> = {
    1: 'School Workshop on Plastic Recycling',
    2: 'Tree Planting Day',
    3: 'River Cleanup Event',
    4: 'Plastic Recycling Drive',
    5: 'Environmental Awareness Walk',
    6: 'Waste Audit Workshop'
  };

  // Sample events data with translation keys
  const sampleEvents: EcoEvent[] = [
    {
      id: 1,
      titleKey: "events.schoolWorkshop.title",
      descriptionKey: "events.schoolWorkshop.description",
      category: 'education',
      locationKey: "events.schoolWorkshop.location",
      date: dates.nextWeek,
      time: '10:00 AM',
      duration: '3 hours',
      organizerKey: "events.schoolWorkshop.organizer",
      participants: 15,
      maxParticipants: 25,
      ecoPoints: 50,
      difficulty: 'medium',
      requirementsKey: "events.schoolWorkshop.requirements",
      whatToBringKey: "events.schoolWorkshop.whatToBring",
      benefitsKey: "events.schoolWorkshop.benefits",
      impactKey: "events.schoolWorkshop.impact",
      image: '/images/book_649180.webp',
      isJoined: false
    },
    {
      id: 2,
      titleKey: "events.treePlanting.title",
      descriptionKey: "events.treePlanting.description",
      category: 'planting',
      locationKey: "events.treePlanting.location",
      date: dates.twoWeeks,
      time: '8:00 AM',
      duration: '4 hours',
      organizerKey: "events.treePlanting.organizer",
      participants: 45,
      maxParticipants: 100,
      ecoPoints: 75,
      difficulty: 'medium',
      requirementsKey: "events.treePlanting.requirements",
      whatToBringKey: "events.treePlanting.whatToBring",
      benefitsKey: "events.treePlanting.benefits",
      impactKey: "events.treePlanting.impact",
      image: '/images/plant-a-tree_6675353.webp',
      isJoined: true
    },
    {
      id: 3,
      titleKey: "events.riverCleanup.title",
      descriptionKey: "events.riverCleanup.description",
      category: 'cleanup',
      locationKey: "events.riverCleanup.location",
      date: dates.tomorrow,
      time: '9:00 AM',
      duration: '3 hours',
      organizerKey: "events.riverCleanup.organizer",
      participants: 32,
      maxParticipants: 50,
      ecoPoints: 60,
      difficulty: 'easy',
      requirementsKey: "events.riverCleanup.requirements",
      whatToBringKey: "events.riverCleanup.whatToBring",
      benefitsKey: "events.riverCleanup.benefits",
      impactKey: "events.riverCleanup.impact",
      image: '/images/forest_10089053.webp',
      isJoined: false
    },
    {
      id: 4,
      titleKey: "events.plasticRecycling.title",
      descriptionKey: "events.plasticRecycling.description",
      category: 'recycling',
      locationKey: "events.plasticRecycling.location",
      date: dates.threeWeeks,
      time: '2:00 PM',
      duration: '2 hours',
      organizerKey: "events.plasticRecycling.organizer",
      participants: 18,
      maxParticipants: 30,
      ecoPoints: 40,
      difficulty: 'easy',
      requirementsKey: "events.plasticRecycling.requirements",
      whatToBringKey: "events.plasticRecycling.whatToBring",
      benefitsKey: "events.plasticRecycling.benefits",
      impactKey: "events.plasticRecycling.impact",
      image: '/images/Plastic Recycling.webp',
      isJoined: false
    },
    {
      id: 5,
      titleKey: "events.awarenessWalk.title",
      descriptionKey: "events.awarenessWalk.description",
      category: 'awareness',
      locationKey: "events.awarenessWalk.location",
      date: dates.oneMonth,
      time: '4:00 PM',
      duration: '2 hours',
      organizerKey: "events.awarenessWalk.organizer",
      participants: 67,
      maxParticipants: 200,
      ecoPoints: 35,
      difficulty: 'easy',
      requirementsKey: "events.awarenessWalk.requirements",
      whatToBringKey: "events.awarenessWalk.whatToBring",
      benefitsKey: "events.awarenessWalk.benefits",
      impactKey: "events.awarenessWalk.impact",
      image: '/images/community_16119903.webp',
      isJoined: false
    },
    {
      id: 6,
      titleKey: "events.wasteAudit.title",
      descriptionKey: "events.wasteAudit.description",
      category: 'recycling',
      locationKey: "events.wasteAudit.location",
      date: dates.today,
      time: '11:00 AM',
      duration: '4 hours',
      organizerKey: "events.wasteAudit.organizer",
      participants: 8,
      maxParticipants: 15,
      ecoPoints: 80,
      difficulty: 'hard',
      requirementsKey: "events.wasteAudit.requirements",
      whatToBringKey: "events.wasteAudit.whatToBring",
      benefitsKey: "events.wasteAudit.benefits",
      impactKey: "events.wasteAudit.impact",
      image: '/images/eco-points.webp',
      isJoined: true
    }
  ];

  // Get events with icons - use English titles for consistency across languages
  const eventsWithIcons = useMemo(() => {
    return sampleEvents.map(event => {
      const title = t(event.titleKey, { ns: 'actions' });
      const description = t(event.descriptionKey, { ns: 'actions' });
      
      const englishTitle = eventEnglishTitles[event.id] || title;
      
      let iconPath = getIconForProductOrCategory(englishTitle, event.image);
      
      if (iconPath === event.image) {
        const categoryMatched = getIconForProductOrCategory(event.category, event.image);
        if (categoryMatched !== event.image && categoryMatched.startsWith('/images/')) {
          iconPath = categoryMatched;
        }
      }
      
      if (iconPath === event.image) {
        const descMatched = getIconForProductOrCategory(description, event.image);
        if (descMatched !== event.image && descMatched.startsWith('/images/')) {
          iconPath = descMatched;
        }
      }
      
      if (!iconPath || !iconPath.startsWith('/images/')) {
        iconPath = event.image;
      }
      
      return {
        ...event,
        iconPath
      };
    });
  }, [t, sampleEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const filtered = eventsWithIcons.filter((event) => {
      const title = t(event.titleKey, { ns: 'actions' });
      const description = t(event.descriptionKey, { ns: 'actions' });
      const location = t(event.locationKey, { ns: 'actions' });
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || location.includes(selectedLocation);
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'upcoming' && !event.isJoined) ||
                        (activeTab === 'joined' && event.isJoined);

      return matchesSearch && matchesCategory && matchesLocation && matchesTab;
    });

    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filtered;
  }, [searchTerm, selectedCategory, selectedLocation, activeTab, eventsWithIcons, t]);

  // Get unique locations
  const locations = [...new Set(eventsWithIcons.map(e => t(e.locationKey, { ns: 'actions' }).split(',')[0].trim()))];

  // Collection Points Integration
  const rawCollectionPoints = getCollectionPoints(t);
  
  const englishNames: Record<number, string> = {
    1: 'Tashkent Central Park',
    2: 'Chilonzor Mahalla',
    3: 'Yunusobod District'
  };
  
  const collectionPoints = useMemo(() => {
    return rawCollectionPoints.map(point => {
      const englishName = englishNames[point.id] || point.name;
      let iconPath = getIconForProductOrCategory(englishName, point.image);
      
      if (iconPath === point.image) {
        const typeMatched = getIconForProductOrCategory(point.type, point.image);
        if (typeMatched !== point.image && typeMatched.startsWith('/images/')) {
          iconPath = typeMatched;
        }
      }
      
      if (!iconPath || !iconPath.startsWith('/images/')) {
        iconPath = point.type === 'plastic' 
          ? '/images/compost_13285420.webp' 
          : point.type === 'tires' 
          ? '/images/ECOBUSSTOP.webp' 
          : '/images/park.webp';
      }
      
      const coordinates = COLLECTION_POINTS.find(cp => cp.id === point.id);
      
      return {
        ...point,
        iconPath,
        coordinates
      };
    });
  }, [rawCollectionPoints]);

  const filteredCollectionPoints = useMemo(() => {
    if (mapFilterType === 'all') return collectionPoints;
    return collectionPoints.filter(point => point.type === mapFilterType);
  }, [collectionPoints, mapFilterType]);

  const totalCollected = useMemo(() => {
    return collectionPoints.reduce((sum, point) => {
      const collected = parseFloat(point.collected?.replace(/[^0-9.]/g, '') || '0');
      return sum + collected;
    }, 0);
  }, [collectionPoints]);

  const handleNavigateToPoint = (pointId: number) => {
    const point = COLLECTION_POINTS.find(p => p.id === pointId);
    if (point) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat.toString()},${point.lng.toString()}`;
      window.open(url, '_blank');
      toast.success(t('openingNavigation', { ns: 'translation' }));
    }
  };


  return (
    <Layout title={t('actions', { ns: 'translation' })}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20">
        <div className={cn("w-full", isMobile ? "px-2 py-4" : "px-4 md:px-6 lg:px-8 py-6")}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(isMobile ? "space-y-4" : "space-y-6")}
          >
            {/* Hero Section - Unified */}
            <motion.div 
              variants={itemVariants}
              className={cn(
                "relative overflow-hidden rounded-2xl",
                "bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800",
                "shadow-2xl border border-emerald-600/20",
                isMobile ? "p-4 mb-4" : "p-8 mb-6"
              )}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 opacity-20">
                <Activity className={cn("text-white", isMobile ? "h-24 w-24" : "h-32 w-32")} />
              </div>
              <div className="absolute bottom-0 left-0 opacity-10">
                <MapPin className={cn("text-white", isMobile ? "h-20 w-20" : "h-28 w-28")} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className={cn("text-yellow-300", isMobile ? "h-5 w-5" : "h-6 w-6")} />
                  </motion.div>
                  <h1 className={cn(
                    "font-bold text-white",
                    isMobile ? "text-2xl" : "text-4xl md:text-5xl"
                  )}>
                    {t('volunteerEvents', { ns: 'translation' })}
                  </h1>
                </div>
                <p className={cn(
                  "text-white/95 text-center max-w-3xl mx-auto leading-relaxed mb-6",
                  isMobile ? "text-xs" : "text-base md:text-lg"
                )}>
                  {t('eventsDescription', { ns: 'translation' })}
                </p>
                
                {/* Unified Stats */}
                <div className={cn(
                  "grid max-w-4xl mx-auto",
                  isMobile ? "grid-cols-2 gap-2" : "grid-cols-4 gap-3"
                )}>
                  <motion.div 
                    className={cn(
                      "bg-white/20 backdrop-blur-md rounded-lg border border-white/30",
                      isMobile ? "p-2.5" : "p-4"
                    )}
                    whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center">
                      <div className={cn(
                        "font-bold text-white leading-tight",
                        isMobile ? "text-base mb-0.5" : "text-3xl mb-1"
                      )}>
                        {sampleEvents.length}
                      </div>
                      <div className={cn(
                        "text-white/90 leading-tight",
                        isMobile ? "text-[11px]" : "text-sm"
                      )}>
                        {t('upcoming', { ns: 'translation' })}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className={cn(
                      "bg-white/20 backdrop-blur-md rounded-lg border border-white/30",
                      isMobile ? "p-2.5" : "p-4"
                    )}
                    whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center">
                      <div className={cn(
                        "font-bold text-white leading-tight",
                        isMobile ? "text-base mb-0.5" : "text-3xl mb-1"
                      )}>
                        {sampleEvents.reduce((sum, e) => sum + e.participants, 0)}
                      </div>
                      <div className={cn(
                        "text-white/90 leading-tight",
                        isMobile ? "text-[11px]" : "text-sm"
                      )}>
                        {t('joined', { ns: 'translation' })}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className={cn(
                      "bg-white/20 backdrop-blur-md rounded-lg border border-white/30",
                      isMobile ? "p-2.5" : "p-4"
                    )}
                    whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center">
                      <div className={cn(
                        "font-bold text-white leading-tight",
                        isMobile ? "text-base mb-0.5" : "text-3xl mb-1"
                      )}>
                        {filteredCollectionPoints.length}
                      </div>
                      <div className={cn(
                        "text-white/90 leading-tight",
                        isMobile ? "text-[11px]" : "text-sm"
                      )}>
                        {t('activePoints', { ns: 'translation' })}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className={cn(
                      "bg-white/20 backdrop-blur-md rounded-lg border border-white/30",
                      isMobile ? "p-2.5" : "p-4"
                    )}
                    whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center">
                      <div className={cn(
                        "font-bold text-white leading-tight",
                        isMobile ? "text-base mb-0.5" : "text-3xl mb-1"
                      )}>
                        {totalCollected.toLocaleString()}
                      </div>
                      <div className={cn(
                        "text-white/90 leading-tight",
                        isMobile ? "text-[11px]" : "text-sm"
                      )}>
                        {t('kg', { ns: 'translation' })} {t('collected', { ns: 'translation' })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Key Features Section */}
            <KeyFeaturesSection />

            {/* Action Locations & Collection Points Section */}
            <motion.div variants={itemVariants} className={cn(isMobile ? "mb-6" : "mb-8")}>
              {/* Section Header */}
              <div className={cn("text-center mb-6", isMobile && "mb-4")}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
                    <MapPin className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </div>
                  <h2 className={cn(
                    "font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
                    isMobile ? "text-lg" : "text-2xl md:text-3xl"
                  )}>
                    {t('actionLocations', { ns: 'translation' })}
                  </h2>
                </div>
                <p className={cn(
                  "text-gray-600 max-w-2xl mx-auto leading-relaxed",
                  isMobile ? "text-xs px-2" : "text-sm"
                )}>
                  {t('actionLocationsDesc', { ns: 'translation' })}
                </p>
              </div>

              {/* Map Filter Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className={cn("p-4", isMobile && "p-3")}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        variant={showMapFilters ? "default" : "outline"}
                        size="sm" 
                        onClick={() => setShowMapFilters(!showMapFilters)}
                        className={cn(
                          "flex items-center gap-1.5",
                          isMobile ? "text-xs h-8 px-2" : "text-sm h-9 px-3"
                        )}
                      >
                        <Filter className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        {t('filter', { ns: 'translation' })}
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
                                toast.success(t('locationFound', { ns: 'translation' }));
                              },
                              () => {
                                toast.error(t('locationError', { ns: 'translation' }));
                              }
                            );
                          } else {
                            toast.error(t('locationNotSupported', { ns: 'translation' }));
                          }
                        }}
                        className={cn(
                          "flex items-center gap-1.5",
                          isMobile ? "text-xs h-8 px-2" : "text-sm h-9 px-3"
                        )}
                      >
                        <Navigation className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        {t('myLocation', { ns: 'translation' })}
                      </Button>
                      
                      <AnimatePresence>
                        {showMapFilters && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full overflow-hidden"
                          >
                            <div className={cn(
                              "flex flex-wrap gap-2 pt-3 mt-3 border-t border-gray-200",
                              isMobile ? "pt-2" : "pt-3"
                            )}>
                              {(['all', 'plastic', 'tires', 'mixed'] as const).map((type) => (
                                <motion.div
                                  key={type}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant={mapFilterType === type ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                      setMapFilterType(type);
                                      setShowMapFilters(false);
                                    }}
                                    className={cn(
                                      mapFilterType === type && "shadow-md",
                                      "active:scale-95",
                                      isMobile ? "text-xs h-9 px-3 min-w-[44px]" : "text-sm h-8 px-3"
                                    )}
                                    style={{ touchAction: 'manipulation' }}
                                  >
                                    {type === 'all' ? t('all', { ns: 'translation' }) : t(type, { ns: 'translation' })}
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

              {/* Interactive Map */}
              {/* Map and Collection Points Side by Side */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                  "mb-6",
                  isMobile ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6"
                )}
              >
                {/* Map Section - Left Side */}
                <div className={cn(isMobile ? "w-full" : "lg:col-span-1")}>
                  <Card className="glass-card border shadow-2xl overflow-hidden h-full flex flex-col" style={{ minHeight: isMobile ? '400px' : '600px' }}>
                    <CardHeader className={cn(
                      "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white flex-shrink-0",
                      isMobile ? "p-4" : "p-6"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <MapPin className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                          </div>
                          <CardTitle className={cn(
                            "text-white font-bold",
                            isMobile ? "text-base" : "text-xl"
                          )}>
                            {t('collectionPointsAndActions', { ns: 'translation' })}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                            {filteredCollectionPoints.length} {t('points', { ns: 'translation' })}
                          </Badge>
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                            {ACTION_LOCATIONS.length} {t('actions', { ns: 'translation' })}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col" style={{ minHeight: 0 }}>
                      <div className="flex-1 w-full" style={{ minHeight: isMobile ? '350px' : '500px', height: isMobile ? '350px' : '100%' }}>
                        <InteractiveMap
                          points={filteredCollectionPoints.map(point => {
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
                          actionLocations={ACTION_LOCATIONS.map(location => ({
                            id: location.id,
                            name: location.name,
                            lat: location.lat,
                            lng: location.lng,
                            type: location.type as 'cleanup' | 'education' | 'recycling' | 'awareness',
                            address: location.address,
                            eventType: location.eventType,
                            description: location.description,
                            isActionLocation: true
                          }))}
                          center={{ lat: 41.2995, lng: 69.2401 }}
                          zoom={11}
                          height={isMobile ? '300px' : '100%'}
                          isMobile={isMobile}
                          onPointClick={(point) => {
                            // Popup will handle all information display
                          }}
                          onNavigate={(point) => {
                            if (point.id < 100) {
                              handleNavigateToPoint(point.id);
                            } else {
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
                              window.open(url, '_blank');
                              toast.success(t('openingNavigation', { ns: 'translation' }));
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Collection Points List - Right Side */}
                <div className={cn(isMobile ? "w-full" : "lg:col-span-1")}>
                  <Card className="glass-card border shadow-lg h-full flex flex-col">
                    <CardHeader className={cn(
                      "border-b border-gray-100 flex-shrink-0",
                      isMobile ? "p-3" : "p-5"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn("p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0", isMobile && "p-1.5")}>
                            <Users className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-5 w-5")} />
                          </div>
                          <CardTitle className={cn(
                            "font-bold text-gray-900 truncate",
                            isMobile ? "text-sm" : "text-lg"
                          )}>
                            {t('nearbyCollectionPoints', { ns: 'translation' })}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className={cn("font-medium flex-shrink-0 ml-2", isMobile && "text-xs px-2 py-0.5")}>
                          {filteredCollectionPoints.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className={cn(
                      "space-y-2.5 overflow-y-auto flex-1",
                      isMobile ? "p-2.5" : "p-5",
                      isMobile ? "max-h-[400px]" : "max-h-[500px]"
                    )} style={{ WebkitOverflowScrolling: 'touch' }}>
                      {filteredCollectionPoints.map((point, index) => {
                        const coordinates = COLLECTION_POINTS.find(cp => cp.id === point.id);
                        
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
                                "glass-card glass-card-hover relative rounded-xl transition-all duration-300 overflow-hidden",
                                "active:scale-[0.98]",
                                isMobile ? "p-2.5" : "p-4"
                              )}
                              style={{ touchAction: 'manipulation' }}
                            >

                              <div className={cn("flex items-center gap-2.5", isMobile && "gap-2")}>
                                <div className={cn(
                                  "rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                                  point.type === 'plastic' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' :
                                  point.type === 'tires' ? 'bg-gradient-to-br from-teal-400 to-teal-500' :
                                  'bg-gradient-to-br from-teal-400 to-emerald-500',
                                  isMobile ? "w-11 h-11 p-1.5" : "w-14 h-14 p-2.5"
                                )}>
                                  <img 
                                    src={point.iconPath || point.image}
                                    alt={point.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const fallback = point.type === 'plastic' 
                                        ? '/images/compost_13285420.webp' 
                                        : point.type === 'tires' 
                                        ? '/images/ECOBUSSTOP.webp' 
                                        : '/images/park.webp';
                                      if (target.src !== fallback) {
                                        target.src = fallback;
                                      }
                                    }}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className={cn(
                                    "font-bold text-gray-900 mb-1",
                                    isMobile ? "text-xs leading-tight" : "text-base"
                                  )}>
                                    {point.name}
                                  </h3>
                                  <div className="flex items-start gap-1 text-gray-600 mb-1.5">
                                    <MapPin className={cn("flex-shrink-0 mt-0.5", isMobile ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
                                    <span className={cn("line-clamp-1", isMobile ? "text-[10px] leading-tight" : "text-sm")}>
                                      {coordinates?.address || point.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge className={cn(
                                      "bg-emerald-100 text-emerald-800 border-emerald-200",
                                      isMobile ? "text-[9px] px-1 py-0.5" : "text-xs"
                                    )}>
                                      {t('active', { ns: 'translation' })}
                                    </Badge>
                                    <Badge variant="outline" className={cn(
                                      "capitalize",
                                      isMobile ? "text-[9px] px-1 py-0.5" : "text-xs"
                                    )}>
                                      {point.type === 'plastic' ? t('plastic', { ns: 'translation' }) : 
                                       point.type === 'tires' ? t('tires', { ns: 'translation' }) : 
                                       t('mixed', { ns: 'translation' })}
                                    </Badge>
                                    {point.collected && (
                                      <Badge variant="outline" className={cn(
                                        isMobile ? "text-[9px] px-1 py-0.5" : "text-xs"
                                      )}>
                                        {point.collected} {t('kg', { ns: 'translation' })}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToPoint(point.id);
                                  }}
                                  className={cn(
                                    "flex-shrink-0 hover:bg-emerald-50 hover:border-emerald-300 active:scale-95",
                                    isMobile ? "text-[10px] h-9 px-2.5 min-w-[44px]" : "text-sm h-9 px-3"
                                  )}
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  <Navigation className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                                  {!isMobile && <span className="ml-1">{t('navigate', { ns: 'translation' })}</span>}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </motion.div>

            {/* Events Section */}
            <motion.div variants={itemVariants}>
              {/* Section Header */}
              <div className={cn("text-center mb-6", isMobile && "mb-4")}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
                    <Calendar className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </div>
                  <h2 className={cn(
                    "font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
                    isMobile ? "text-lg" : "text-2xl md:text-3xl"
                  )}>
                    {t('upcomingEvents', { ns: 'actions' })}
                  </h2>
                </div>
                <p className={cn(
                  "text-gray-600 max-w-2xl mx-auto",
                  isMobile ? "text-xs px-2" : "text-sm"
                )}>
                  {t('joinCommunityEvents', { ns: 'translation' })}
                </p>
              </div>

              {/* Tabs */}
              <div className={cn("flex justify-center mb-6", isMobile && "mb-4")}>
                <div className={cn(
                  "flex bg-white rounded-xl shadow-md border border-emerald-100",
                  isMobile ? "p-1" : "p-1.5"
                )}>
                  <motion.button
                    onClick={() => setActiveTab('upcoming')}
                    className={cn(
                      "rounded-lg font-semibold transition-colors",
                      isMobile ? "px-3 py-2.5 text-xs min-h-[44px]" : "px-6 py-2 text-sm",
                      activeTab === 'upcoming'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                    whileHover={{ scale: isMobile ? 1 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {t('upcomingEvents', { ns: 'actions' })}
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('joined')}
                    className={cn(
                      "rounded-lg font-semibold transition-colors",
                      isMobile ? "px-3 py-2.5 text-xs min-h-[44px]" : "px-6 py-2 text-sm",
                      activeTab === 'joined'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                    whileHover={{ scale: isMobile ? 1 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {t('myEvents', { ns: 'actions' })}
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      "rounded-lg font-semibold transition-colors",
                      isMobile ? "px-3 py-2.5 text-xs min-h-[44px]" : "px-6 py-2 text-sm",
                      activeTab === 'all'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                    whileHover={{ scale: isMobile ? 1 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {t('allEvents', { ns: 'actions' })}
                  </motion.button>
                </div>
              </div>

              {/* Filters */}
              <motion.div variants={itemVariants} className="mb-6">
                <Card className={cn(
                  "glass-card border shadow-lg",
                  isMobile ? "p-4" : "p-6"
                )}>
                  <div className={cn(isMobile ? "space-y-3" : "space-y-4")}>
                    {/* Search */}
                    <div className="relative">
                      <Search className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                        isMobile ? "h-4 w-4" : "h-5 w-5"
                      )} />
                      <Input
                        placeholder={t('searchEvents', { ns: 'actions' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                          "border-emerald-200 focus:border-emerald-400 bg-white",
                          isMobile ? "pl-10 h-11 text-sm min-h-[44px]" : "pl-12 h-11"
                        )}
                        style={{ touchAction: 'manipulation' }}
                      />
                    </div>

                    {/* Filter controls */}
                    <div className={cn(
                      "grid",
                      isMobile ? "grid-cols-1 gap-2" : "grid-cols-1 md:grid-cols-3 gap-4"
                    )}>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="border-emerald-200 bg-white">
                          <SelectValue placeholder={t('filterByCategory', { ns: 'actions' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allCategories', { ns: 'translation' })}</SelectItem>
                          <SelectItem value="cleanup">{t('eventCategories.cleanup', { ns: 'actions' })}</SelectItem>
                          <SelectItem value="planting">{t('eventCategories.planting', { ns: 'actions' })}</SelectItem>
                          <SelectItem value="education">{t('eventCategories.education', { ns: 'actions' })}</SelectItem>
                          <SelectItem value="recycling">{t('eventCategories.recycling', { ns: 'actions' })}</SelectItem>
                          <SelectItem value="awareness">{t('eventCategories.awareness', { ns: 'actions' })}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="border-emerald-200 bg-white">
                          <SelectValue placeholder={t('filterByLocation', { ns: 'actions' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allLocations', { ns: 'translation' })}</SelectItem>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <motion.div whileHover={{ scale: isMobile ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                            setSelectedLocation('all');
                          }}
                          variant="outline"
                          className={cn(
                            "w-full border-emerald-200 hover:bg-emerald-50 bg-white",
                            isMobile ? "h-10 text-xs" : "h-11 text-sm"
                          )}
                        >
                          <Filter className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                          {t('clearFilters', { ns: 'translation' })}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Results count */}
              <motion.div variants={itemVariants} className="text-center mb-4">
                <p className={cn("text-gray-600", isMobile ? "text-xs" : "text-sm")}>
                  {t('showingResults', { ns: 'translation' })} <span className="font-semibold text-emerald-600">{filteredEvents.length}</span> {t('of', { ns: 'translation' })} <span className="font-semibold">{sampleEvents.length}</span> {t('events', { ns: 'translation' })}
                </p>
              </motion.div>

              {/* Events grid */}
              <motion.div variants={itemVariants}>
                <AnimatePresence>
                  <div className={cn(
                    "grid grid-cols-1",
                    isMobile ? "gap-4" : "md:grid-cols-2 lg:grid-cols-3 gap-6"
                  )}>
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </AnimatePresence>
              </motion.div>

              {/* No results */}
              {filteredEvents.length === 0 && (
                <motion.div 
                  variants={itemVariants}
                  className={cn("text-center", isMobile ? "py-8" : "py-12")}
                >
                  <div className={cn(isMobile ? "text-5xl mb-3" : "text-6xl mb-4")}>🔍</div>
                  <h3 className={cn(
                    "font-semibold text-gray-700",
                    isMobile ? "text-base mb-2" : "text-xl mb-3"
                  )}>
                    {t('noEventsFound', { ns: 'actions' })}
                  </h3>
                  <p className={cn(
                    "text-gray-500 mb-4",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('noEventsFoundDescription', { ns: 'actions' })}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                      setActiveTab('all');
                    }}
                    className={cn(
                      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white",
                      isMobile ? "h-10 text-xs" : "h-11 text-sm"
                    )}
                  >
                    {t('resetAllFilters', { ns: 'translation' })}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
