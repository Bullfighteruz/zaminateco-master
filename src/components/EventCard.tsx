import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Award,
  ChevronDown,
  CheckCircle,
  Info,
  Heart,
  Zap,
  TrendingUp,
  Globe,
  Leaf,
  BookOpen,
  Target,
  Shield,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface EcoEvent {
  id: number;
  titleKey: string;
  descriptionKey: string;
  category: 'cleanup' | 'planting' | 'education' | 'recycling' | 'awareness';
  locationKey: string;
  date: string;
  time: string;
  duration: string;
  organizerKey: string;
  participants: number;
  maxParticipants: number;
  ecoPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requirementsKey: string;
  whatToBringKey: string;
  benefitsKey: string;
  impactKey: string;
  image: string;
  isJoined: boolean;
  iconPath?: string;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface EventCardProps {
  event: EcoEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation(['actions', 'translation', 'common']);
  const isMobile = useIsMobile();
  const [isJoined, setIsJoined] = useState(event.isJoined);
  const [participants, setParticipants] = useState(event.participants);
  const [showDetails, setShowDetails] = useState(false);

  const handleJoinEvent = () => {
    setIsJoined(!isJoined);
    setParticipants(prev => isJoined ? prev - 1 : prev + 1);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleanup': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planting': return 'bg-green-100 text-green-800 border-green-200';
      case 'education': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recycling': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'awareness': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleanup': return <Globe className="h-4 w-4" />;
      case 'planting': return <Leaf className="h-4 w-4" />;
      case 'education': return <BookOpen className="h-4 w-4" />;
      case 'recycling': return <Target className="h-4 w-4" />;
      case 'awareness': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card 
        className="h-full bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 border-2 border-gray-100 hover:border-green-300 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative"
        role="article"
        aria-label={t(event.titleKey, { ns: 'actions' })}
      >
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-4 right-4 w-8 h-8 bg-green-200 rounded-full opacity-20"
            style={{ willChange: 'transform' }}
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-4 w-6 h-6 bg-blue-200 rounded-full opacity-20"
            style={{ willChange: 'transform' }}
          />
        </div>

        <CardHeader className={cn("relative z-10", isMobile ? "pb-2 p-3" : "pb-4 p-6")}>
          {/* Background decoration */}
          <div className={cn(
            "absolute top-0 right-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-30 group-hover:opacity-50 transition-opacity",
            isMobile ? "w-16 h-16 -translate-y-8 translate-x-8" : "w-24 h-24 -translate-y-12 translate-x-12"
          )} aria-hidden="true" />
          
          <div className="relative z-10">
            {/* Header with category and difficulty */}
            <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-3")}>
              <div className={cn("flex", isMobile ? "gap-1 flex-wrap" : "gap-2 flex-wrap")}>
                <Badge 
                  className={cn(
                    `${getCategoryColor(event.category)} border flex items-center`,
                    isMobile ? "gap-0.5 text-[10px] px-1.5 py-0.5" : "gap-1 text-xs px-2 py-1"
                  )}
                  aria-label={t(`eventCategories.${event.category}`, { ns: 'actions' })}
                >
                  <span className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden="true">
                    {getCategoryIcon(event.category)}
                  </span>
                  <span className="capitalize">{t(`eventCategories.${event.category}`, { ns: 'actions' })}</span>
                </Badge>
                <Badge 
                  className={cn(
                    `${getDifficultyColor(event.difficulty)} border`,
                    isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
                  )}
                  aria-label={t(`difficultyLevels.${event.difficulty}`, { ns: 'actions' })}
                >
                  <Shield className={cn(isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1")} aria-hidden="true" />
                  <span className="capitalize">{t(`difficultyLevels.${event.difficulty}`, { ns: 'actions' })}</span>
                </Badge>
              </div>
              <motion.div 
                className="flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: isMobile ? 1 : 1.2, rotate: isMobile ? 0 : 10 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ willChange: 'transform' }}
              >
                <img 
                  src={event.iconPath || event.image} 
                  alt={t(event.titleKey, { ns: 'actions' })} 
                  className={cn(
                    "object-contain flex-shrink-0",
                    isMobile ? "w-12 h-12" : "w-14 h-14 sm:w-16 sm:h-16"
                  )}
                  style={{ 
                    minWidth: isMobile ? '48px' : '56px', 
                    minHeight: isMobile ? '48px' : '56px',
                    maxWidth: 'none',
                    maxHeight: 'none'
                  }}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (event.image && target.src !== event.image) {
                      target.src = event.image;
                    }
                  }}
                />
              </motion.div>
            </div>

            {/* Title and description */}
            <CardTitle className={cn(
              "font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2 line-clamp-2",
              isMobile ? "text-sm" : "text-lg"
            )}>
              {t(event.titleKey, { ns: 'actions' })}
            </CardTitle>
            <p className={cn(
              "text-gray-600 leading-relaxed line-clamp-3 mb-3",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {t(event.descriptionKey, { ns: 'actions' })}
            </p>

            {/* Event details */}
            <div className={cn("space-y-2 text-gray-600", isMobile ? "space-y-1.5" : "space-y-2")}>
              <motion.div 
                className={cn(
                  "flex items-center bg-white/50 rounded-lg",
                  isMobile ? "p-1.5 text-xs" : "p-2 text-xs"
                )}
                whileHover={{ scale: isMobile ? 1 : 1.02 }}
                style={{ willChange: 'transform' }}
              >
                <Calendar className={cn("text-green-600", isMobile ? "h-2.5 w-2.5 mr-1.5" : "h-3 w-3 mr-2")} aria-hidden="true" />
                <span className="font-medium truncate">{event.date} at {event.time}</span>
              </motion.div>
              <motion.div 
                className={cn(
                  "flex items-center bg-white/50 rounded-lg",
                  isMobile ? "p-1.5 text-xs" : "p-2 text-xs"
                )}
                whileHover={{ scale: isMobile ? 1 : 1.02 }}
                style={{ willChange: 'transform' }}
              >
                <MapPin className={cn("text-blue-600", isMobile ? "h-2.5 w-2.5 mr-1.5" : "h-3 w-3 mr-2")} aria-hidden="true" />
                <span className="line-clamp-1 font-medium">{t(event.locationKey, { ns: 'actions' })}</span>
              </motion.div>
              <div className={cn("grid grid-cols-2", isMobile ? "gap-1.5" : "gap-2")}>
                <motion.div 
                  className={cn(
                    "flex items-center bg-white/50 rounded-lg",
                    isMobile ? "p-1.5 text-xs" : "p-2 text-xs"
                  )}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  style={{ willChange: 'transform' }}
                >
                  <Clock className={cn("text-purple-600", isMobile ? "h-2.5 w-2.5 mr-1.5" : "h-3 w-3 mr-2")} aria-hidden="true" />
                  <span className="font-medium truncate">{event.duration}</span>
                </motion.div>
                <motion.div 
                  className={cn(
                    "flex items-center bg-white/50 rounded-lg",
                    isMobile ? "p-1.5 text-xs" : "p-2 text-xs"
                  )}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  style={{ willChange: 'transform' }}
                >
                  <Users className={cn("text-orange-600", isMobile ? "h-2.5 w-2.5 mr-1.5" : "h-3 w-3 mr-2")} aria-hidden="true" />
                  <span className="font-medium truncate">{participants}/{event.maxParticipants}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("relative z-10", isMobile ? "space-y-2 p-3" : "space-y-4 p-6")}>
          {/* Eco Points and Organizer */}
          <div className={cn("grid grid-cols-2", isMobile ? "gap-2" : "gap-4")}>
            <motion.div 
              className={cn(
                "text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200",
                isMobile ? "p-2" : "p-3"
              )}
              whileHover={{ scale: isMobile ? 1 : 1.05 }}
              style={{ willChange: 'transform' }}
            >
              <div className="flex items-center justify-center mb-1">
                <Zap className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1")} aria-hidden="true" />
                <div className={cn("font-bold text-green-600", isMobile ? "text-sm" : "text-lg")}>{event.ecoPoints}</div>
              </div>
              <div className={cn("text-gray-600 font-medium", isMobile ? "text-[10px]" : "text-xs")}>{t('ecoPoints', { ns: 'actions' })}</div>
            </motion.div>
            <motion.div 
              className={cn(
                "text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200",
                isMobile ? "p-2" : "p-3"
              )}
              whileHover={{ scale: isMobile ? 1 : 1.05 }}
              style={{ willChange: 'transform' }}
            >
              <div className={cn("font-semibold text-blue-600 line-clamp-2 mb-1", isMobile ? "text-[10px]" : "text-xs")}>{t(event.organizerKey, { ns: 'actions' })}</div>
              <div className={cn("text-gray-600 font-medium", isMobile ? "text-[10px]" : "text-xs")}>{t('organizer', { ns: 'actions' })}</div>
            </motion.div>
          </div>

          {/* Impact statement */}
          <motion.div 
            className={cn(
              "bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg border border-green-200",
              isMobile ? "p-2" : "p-3"
            )}
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
            style={{ willChange: 'transform' }}
          >
            <div className={cn("flex items-center", isMobile ? "mb-1" : "mb-2")}>
              <TrendingUp className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} aria-hidden="true" />
              <span className={cn("font-semibold text-gray-700", isMobile ? "text-[10px]" : "text-xs")}>{t('impact', { ns: 'actions' })}</span>
            </div>
            <p className={cn("text-gray-600 line-clamp-2 leading-relaxed", isMobile ? "text-[10px]" : "text-xs")}>{t(event.impactKey, { ns: 'actions' })}</p>
          </motion.div>

          {/* Expandable details */}
          <motion.div
            initial={false}
            animate={{ height: showDetails ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className={cn(isMobile ? "space-y-2 pt-1" : "space-y-3 pt-2")}>
              {/* Requirements */}
              <div className={cn(
                "bg-gray-50 rounded-lg border border-gray-200",
                isMobile ? "p-2" : "p-3"
              )}>
                <div className={cn("flex items-center", isMobile ? "mb-0.5" : "mb-1")}>
                  <CheckCircle className={cn("text-gray-600", isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} aria-hidden="true" />
                  <span className={cn("font-semibold text-gray-700", isMobile ? "text-[10px]" : "text-xs")}>{t('requirements', { ns: 'actions' })}</span>
                </div>
                <p className={cn("text-gray-600 leading-relaxed", isMobile ? "text-[10px]" : "text-xs")}>{t(event.requirementsKey, { ns: 'actions' })}</p>
              </div>

              {/* What to bring */}
              <div className={cn(
                "bg-orange-50 rounded-lg border border-orange-200",
                isMobile ? "p-2" : "p-3"
              )}>
                <div className={cn("flex items-center", isMobile ? "mb-0.5" : "mb-1")}>
                  <Info className={cn("text-orange-600", isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} aria-hidden="true" />
                  <span className={cn("font-semibold text-gray-700", isMobile ? "text-[10px]" : "text-xs")}>{t('whatToBring', { ns: 'actions' })}</span>
                </div>
                <p className={cn("text-gray-600 leading-relaxed", isMobile ? "text-[10px]" : "text-xs")}>{t(event.whatToBringKey, { ns: 'actions' })}</p>
              </div>

              {/* Benefits */}
              <div className={cn(
                "bg-purple-50 rounded-lg border border-purple-200",
                isMobile ? "p-2" : "p-3"
              )}>
                <div className={cn("flex items-center", isMobile ? "mb-0.5" : "mb-1")}>
                  <Heart className={cn("text-purple-600", isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} aria-hidden="true" />
                  <span className={cn("font-semibold text-gray-700", isMobile ? "text-[10px]" : "text-xs")}>{t('benefits', { ns: 'actions' })}</span>
                </div>
                <p className={cn("text-gray-600 leading-relaxed", isMobile ? "text-[10px]" : "text-xs")}>{t(event.benefitsKey, { ns: 'actions' })}</p>
              </div>
            </div>
          </motion.div>

          {/* Show details toggle */}
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              "w-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors",
              isMobile ? "py-2.5 text-xs min-h-[44px]" : "py-2 text-xs"
            )}
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={showDetails}
            aria-label={showDetails ? t('hideDetails', { defaultValue: 'Hide details', ns: 'common' }) : t('showDetails', { ns: 'common' })}
            style={{ willChange: 'transform', touchAction: 'manipulation' }}
          >
            <span className={cn(isMobile ? "mr-0.5" : "mr-1")}>{showDetails ? t('showLess', { ns: 'common' }) : t('showDetails', { ns: 'common' })}</span>
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} aria-hidden="true" />
            </motion.div>
          </motion.button>

          {/* Join button */}
          <motion.div whileHover={{ scale: isMobile ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} style={{ willChange: 'transform' }}>
            <Button
              onClick={handleJoinEvent}
              className={cn(
                "w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95",
                isMobile ? "h-11 text-sm py-2.5 min-h-[44px]" : "h-auto text-sm py-3",
                isJoined 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' 
                  : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white'
              )}
              style={{ touchAction: 'manipulation' }}
              aria-label={isJoined ? t('eventJoined', { ns: 'actions' }) : t('joinEvent', { ns: 'actions' })}
            >
              <Award className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} aria-hidden="true" />
              {isJoined ? t('eventJoined', { ns: 'actions' }) : t('joinEvent', { ns: 'actions' })}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

