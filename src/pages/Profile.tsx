import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { apiClient, IS_BACKEND_AVAILABLE } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Coins, 
  Star, 
  Trophy, 
  Crown,
  MapPin,
  School,
  Gift,
  ShoppingBag,
  TrendingUp,
  Share2,
  Target,
  Medal,
  Zap,
  Wallet,
  Award,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Recycle,
  Vote,
  Share,
  UserPlus,
  Sparkles,
  Flame,
  Leaf,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  TrendingDown,
  Percent,
  Tag,
  Coffee,
  Car,
  Utensils,
  ShirtIcon,
  Info,
  ChevronUp,
  ChevronDown,
  Camera,
  CircleDollarSign,
  BadgeCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { USER_DATA, calculateLevel, calculateLevelProgress, formatWasteAmount } from '@/lib/userData';
import { getUserNameData, saveUserName } from '@/utils/userName';
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';
import { EnhancedAvatarSystem } from '@/components/ui/enhanced-avatar-system';
import { 
  UserProgress, AZIZA_PROGRESS, PROFILE_FRAMES, PROFILE_BACKGROUNDS,
  loadUserProgress, saveUserProgress, calculateLevelProgress as calcLevelProgress
} from '@/lib/userProgress';
import { getAvatarImage } from '@/lib/avatarImages';

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  })
};

// Improved mobile-friendly animation variants for level benefits with better readability and performance
const levelBenefitsVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.12,
      type: "tween",
      ease: "easeOut"
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      type: "tween",
      ease: "easeOut",
      staggerChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.12,
      type: "tween",
      ease: "easeIn"
    }
  }
};

const benefitItemVariants = {
  hidden: { 
    opacity: 0, 
    y: -4,
    transition: { 
      duration: 0.1,
      type: "tween",
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.12,
      type: "tween",
      ease: "easeOut"
    }
  }
};

// Name Change Section Component
const NameChangeSection: React.FC<{ onNameUpdated: () => void; t: TFunction }> = ({ onNameUpdated, t }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const nameData = getUserNameData();
    setFirstName(nameData.firstName);
    setLastName(nameData.lastName);
  }, []);

  return (
    <div className="space-y-4 pb-4 border-b">
      <h3 className="text-sm font-semibold">
        {t('changeName', { ns: 'profile', defaultValue: 'Change Your Name' })}
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-firstName" className="text-sm font-medium">
            {t('welcome.firstName', { defaultValue: 'First Name' })} 
            <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
          </Label>
          <Input
            id="profile-firstName"
            type="text"
            placeholder={t('welcome.firstNamePlaceholder', { defaultValue: 'Enter your first name' })}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-lastName" className="text-sm font-medium">
            {t('welcome.lastName', { defaultValue: 'Last Name' })} 
            <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
          </Label>
          <Input
            id="profile-lastName"
            type="text"
            placeholder={t('welcome.lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-11"
          />
        </div>

        <Button
          onClick={() => {
            if (!firstName.trim() && !lastName.trim()) {
              toast.error(t('nameRequired', { ns: 'profile', defaultValue: 'Please enter at least a first name' }));
              return;
            }

            // Save exactly what user entered - no defaults
            // If only first name is provided, lastName will be empty string (no default last name added)
            saveUserName(firstName.trim() || '', lastName.trim() || '');
            onNameUpdated();
            
            toast.success(t('nameUpdated', { ns: 'profile', defaultValue: 'Name updated successfully!' }));
          }}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          {t('saveName', { ns: 'profile', defaultValue: 'Save Name' })}
        </Button>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Load user progress from localStorage or use default
  const [userProgress, setUserProgress] = useState<UserProgress>(() => loadUserProgress());
  const [activeTab, setActiveTab] = useState('wallet');
  const [levelExpanded, setLevelExpanded] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const touchHandledRef = useRef(false);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage only (just like avatars/backgrounds)
  // Backend sync is completely optional and non-blocking
  useEffect(() => {
    // Always use localStorage first (works offline, no backend needed)
    const savedProgress = loadUserProgress();
    setUserProgress(savedProgress);
    setLoading(false);

    // Optional: Try to sync with backend in background (non-blocking)
    // This only runs if user is authenticated AND backend is available
    // If backend fails, we just use localStorage (which already works)
    if (IS_BACKEND_AVAILABLE && isAuthenticated && user) {
      // Run in background, don't wait for it
      apiClient.getUserProfile()
        .then((userData) => {
          // Only update if backend data is available
          if (userData?.profile) {
            setUserProgress(prev => ({
              ...prev,
              // Keep localStorage name (user's choice), only sync points/coins if available
              ecoPoints: userData.profile.ecoPoints ?? prev.ecoPoints,
              ecoCoins: userData.profile.ecoCoins ?? prev.ecoCoins,
              level: userData.profile.level ?? prev.level,
            }));
          }
        })
        .catch(() => {
          // Silently fail - localStorage data is already loaded and working
          // No error needed, app works fine without backend
        });
    }
  }, [isAuthenticated, user]);

  // Calculate level progress
  const { progress: levelProgress, pointsToNext } = calcLevelProgress(userProgress.ecoPoints, userProgress.level);
  const wasteFormatted = formatWasteAmount(userProgress.wasteCollected);

  // Get current profile frame and background
  const currentFrame = PROFILE_FRAMES[userProgress.profileFrame] || PROFILE_FRAMES.default;
  const currentBackground = PROFILE_BACKGROUNDS[userProgress.profileBackground] || PROFILE_BACKGROUNDS.default;

  // Mock data with translated text
  const mockBadges = [
    { id: 1, name: t('firstCollection'), icon: '🏆', unlocked: true, description: t('firstCollectionDesc') },
    { id: 2, name: t('treePlanter'), icon: '🌳', unlocked: true, description: t('treePlanterDesc') },
    { id: 3, name: t('communityHero'), icon: '👥', unlocked: true, description: t('communityHeroDesc') },
    { id: 4, name: t('energyMaster'), icon: '⚡', unlocked: true, description: t('energyMasterDesc') },
    { id: 5, name: t('waterGuardian'), icon: '💧', unlocked: true, description: t('waterGuardianDesc') },
    { id: 6, name: t('streakChampion'), icon: '🔥', unlocked: true, description: t('streakChampionDesc') },
    { id: 7, name: t('communityBuilder'), icon: '🤝', unlocked: true, description: t('communityBuilderDesc') },
    { id: 8, name: t('ecoChampion'), icon: '🌟', unlocked: true, description: t('ecoChampionDesc') }
  ];

  // Leaderboard with current user at #1 and Uzbek names
  const leaderboardData = [
    { 
      rank: 1, 
      name: userProgress.name, 
      points: userProgress.ecoPoints, 
      avatar: userProgress.activeAvatar,
      isCurrentUser: true
    },
    { rank: 2, name: 'Bobur Rahimov', points: 12400, avatar: '👨‍💼', isCurrentUser: false },
    { rank: 3, name: 'Dilnoza Saidova', points: 11200, avatar: '👩‍🎓', isCurrentUser: false },
    { rank: 4, name: 'Eldor Tursunov', points: 10800, avatar: '👨‍🔬', isCurrentUser: false },
    { rank: 5, name: 'Feruza Nazarova', points: 9900, avatar: '👩‍💻', isCurrentUser: false },
    { rank: 6, name: 'Gulnora Alimova', points: 9200, avatar: '👩‍🏫', isCurrentUser: false },
    { rank: 7, name: 'Hasan Yusupov', points: 8800, avatar: '👨‍🌾', isCurrentUser: false },
    { rank: 8, name: 'Iroda Toshmatova', points: 8500, avatar: '👩‍⚕️', isCurrentUser: false },
    { rank: 9, name: 'Javohir Mirzayev', points: 8200, avatar: '👨‍🎓', isCurrentUser: false },
    { rank: 10, name: 'Kamola Rustamova', points: 7900, avatar: '👩‍🎨', isCurrentUser: false }
  ];

  // Keep old mockLeaderboard for backward compatibility
  const mockLeaderboard = leaderboardData;

  const REWARDS_DATA = [
    {
      id: 1,
      emoji: "🌳",
      image: "/images/plant-a-tree_6675353.png",
      title: t('plantTree'),
      description: t('plantTreeDesc'),
      coins: 50
    },
    {
      id: 2,
      emoji: "🎁",
      image: "/images/Children's Souvenirs.png",
      title: t('childrenSouvenirs'),
      description: t('childrenSouvenirsDesc'),
      coins: 75
    },
    {
      id: 3,
      emoji: "🏠",
      image: "/images/Home Decor Set.png",
      title: t('homeDecorSet'),
      description: t('homeDecorSetDesc'),
      coins: 150
    },
    {
      id: 4,
      emoji: "📚",
      image: "/images/Eco Education Kit.png",
      title: t('ecoEducationKit'),
      description: t('ecoEducationKitDesc'),
      coins: 100
    }
  ];

  // Realistic partner offers for Tashkent, Uzbekistan
  const PARTNER_OFFERS = [
    {
      id: 1,
      partner: t('carrefourTashkent'),
      discount: "15%",
      description: t('carrefourDesc'),
      minCoins: 30,
      icon: ShoppingBag,
      color: "green"
    },
    {
      id: 2,
      partner: t('yandexTaxi'),
      discount: "20%",
      description: t('yandexTaxiDesc'),
      minCoins: 25,
      icon: Car,
      color: "yellow"
    },
    {
      id: 3,
      partner: t('coffeeBeanCafe'),
      discount: "10%",
      description: t('coffeeBeanDesc'),
      minCoins: 15,
      icon: Coffee,
      color: "brown"
    },
    {
      id: 4,
      partner: t('samarkandDarvoza'),
      discount: "25%",
      description: t('samarkandDesc'),
      minCoins: 40,
      icon: Utensils,
      color: "orange"
    },
    {
      id: 5,
      partner: t('korzinkaUz'),
      discount: "12%",
      description: t('korzinkaDesc'),
      minCoins: 20,
      icon: ShoppingBag,
      color: "blue"
    },
    {
      id: 6,
      partner: t('uzbekistanAirways'),
      discount: "5%",
      description: t('uzbekistanAirwaysDesc'),
      minCoins: 100,
      icon: Target,
      color: "sky"
    }
  ];

  // Analytics mock data
  const analyticsData = {
    weeklyEngagement: [
      { day: 'Mon', actions: 3, streak: 1 },
      { day: 'Tue', actions: 5, streak: 2 },
      { day: 'Wed', actions: 2, streak: 3 },
      { day: 'Thu', actions: 7, streak: 4 },
      { day: 'Fri', actions: 4, streak: 5 },
      { day: 'Sat', actions: 8, streak: 6 },
      { day: 'Sun', actions: 6, streak: 7 }
    ],
    monthlyStats: {
      totalWaste: 85.5,
      totalPoints: 14400,
      eventsAttended: 12,
      treesPlanted: 15,
      referrals: 5
    },
    achievements: {
      thisMonth: 3,
      total: 12,
      nextGoal: t('climateHero')
    },
    impact: {
      wasteCollected: 85.5, // kg - realistic based on user activity
      eventsAttended: 12,
      treesPlanted: 15,
      friendsReferred: 5
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    const updatedProgress = {
      ...userProgress,
      activeAvatar: emoji
    };
    setUserProgress(updatedProgress);
    saveUserProgress(updatedProgress);
  };

  const handleProgressUpdate = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
  };

  const RewardCard: React.FC<{ reward: typeof REWARDS_DATA[0] }> = ({ reward }) => {
    const isAvailable = userProgress.ecoCoins >= reward.coins;
    const progress = Math.min((userProgress.ecoCoins / reward.coins) * 100, 100);

    return (
      <motion.div
        whileHover={isMobile ? {} : { scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
      >
        <Card className={cn(
          "transition-all duration-300 group h-full border-2",
          isMobile ? "" : "hover:shadow-lg hover:border-green-200"
        )}>
          <CardContent className={cn("text-center", isMobile ? "p-2 space-y-2" : "p-3 sm:p-4 space-y-3")}>
            <motion.div 
              className={cn("inline-block transition-transform duration-300", isMobile ? "" : "group-hover:scale-110")}
              whileHover={isMobile ? {} : { rotate: [0, -10, 10, 0] }}
            >
              <img 
                src={reward.image || reward.emoji} 
                alt={reward.title} 
                className={cn(
                  "object-contain",
                  isMobile ? "w-8 h-8" : "w-10 h-10 sm:w-12 sm:h-12"
                )} 
                loading="lazy" 
              />
            </motion.div>
            <div>
              <h4 className={cn("font-medium", isMobile ? "text-xs" : "text-sm sm:text-base")}>
                {reward.title}
              </h4>
              <p className={cn("text-gray-600 mt-1 line-clamp-2", isMobile ? "text-[10px]" : "text-xs")}>
                {reward.description}
              </p>
            </div>
            <div className={cn(isMobile ? "space-y-1.5" : "space-y-2")}>
              <div className={cn("flex items-center justify-between", isMobile ? "text-[10px]" : "text-xs")}>
                <span className="text-gray-500">{t('progress')}</span>
                <span className={cn("flex items-center gap-1", isAvailable ? 'text-green-600' : 'text-orange-600')}>
                  {userProgress.ecoCoins}/{reward.coins} <img src="/images/eco coins.png" alt="eco coins" className={cn("inline-block", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                </span>
              </div>
              <Progress value={progress} className={cn(isMobile ? "h-1.5" : "h-2")} />
              <div className={cn("font-bold text-green-600 flex items-center gap-1", isMobile ? "text-xs" : "text-sm")}>
                {reward.coins} <img src="/images/eco coins.png" alt="eco coins" className={cn("inline-block", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              </div>
              <Button 
                className={cn(
                  "w-full transition-all duration-300",
                  isMobile ? "h-10 text-xs min-h-[44px]" : "h-9 text-xs"
                )} 
                disabled={!isAvailable}
                variant={isAvailable ? "default" : "secondary"}
                onClick={() => {
                  if (isAvailable) {
                    const updatedProgress = {
                      ...userProgress,
                      ecoCoins: userProgress.ecoCoins - reward.coins
                    };
                    setUserProgress(updatedProgress);
                    saveUserProgress(updatedProgress);
                  }
                }}
                style={{ touchAction: 'manipulation' }}
              >
                {isAvailable ? t('redeemNow') : t('needMoreCoins')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const PartnerOfferCard: React.FC<{ offer: typeof PARTNER_OFFERS[0] }> = ({ offer }) => {
    const isAvailable = userProgress.ecoCoins >= offer.minCoins;
    const IconComponent = offer.icon;

    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.97 }}
        className="cursor-pointer"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.18,
          type: "tween",
          ease: "easeOut"
        }}
        style={{ willChange: 'transform, opacity' }}
      >
        <Card className={`hover:shadow-xl transition-all duration-400 group h-full border-2 ${
          isAvailable 
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-white hover:border-green-300' 
            : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300'
        }`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`p-3 rounded-full ${
                  isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                } transition-all duration-300`}
              >
                <IconComponent className="h-5 w-5" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-right"
              >
                <Badge 
                  variant={isAvailable ? "default" : "secondary"} 
                  className={`text-sm font-bold ${
                    isAvailable 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {offer.discount} {t('off')}
                </Badge>
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-base text-gray-900 group-hover:text-green-700 transition-colors">
                {offer.partner}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">{t('required')}:</span>
                <span className={cn("font-bold flex items-center gap-1", isAvailable ? 'text-green-600' : 'text-red-500')}>
                  {offer.minCoins} <img src="/images/eco coins.png" alt="eco coins" className="h-4 w-4 inline-block" />
                </span>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className={`w-full h-10 text-sm font-semibold transition-all duration-300 ${
                    isAvailable 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      {t('claimDiscount')}
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      {t('need')} {offer.minCoins - userProgress.ecoCoins} {t('more')} <img src="/images/eco coins.png" alt="eco coins" className="h-4 w-4 inline-block ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const BadgeCard: React.FC<{ badge: typeof mockBadges[0] }> = ({ badge }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <Card className={`${badge.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-all duration-300 h-full`}>
        <CardContent className="p-3 sm:p-4 text-center">
          <div 
            className={`text-2xl sm:text-3xl mb-2 ${!badge.unlocked ? 'grayscale opacity-50' : ''}`}
          >
            {badge.icon}
          </div>
          <h4 className={`font-semibold text-sm sm:text-base mb-1 ${badge.unlocked ? 'text-yellow-800' : 'text-gray-500'}`}>
            {badge.name}
          </h4>
          <p className={`text-xs ${badge.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
            {badge.description}
          </p>
          {badge.unlocked && (
            <Badge className="mt-2 bg-yellow-100 text-yellow-800 text-xs">
              {t('unlocked')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // FIXED: Enhanced mobile-responsive WeeklyEngagementChart with proper text handling
  const WeeklyEngagementChart: React.FC = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{t('dailyEngagementStreak')}</h4>
        <Badge variant="outline" className="text-xs bg-gradient-to-r from-orange-100 to-red-100 border-orange-300">
          <Flame className="h-3 w-3 mr-1 text-orange-500" />
          {userProgress.streakDays} {t('dayStreak')}
        </Badge>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {analyticsData.weeklyEngagement.map((day, index) => {
          const maxActions = Math.max(...analyticsData.weeklyEngagement.map(d => d.actions));
          const height = (day.actions / maxActions) * 100;
          
          return (
            <motion.div 
              key={day.day} 
              className="flex flex-col items-center space-y-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.03,
                duration: 0.12,
                type: "tween",
                ease: "easeOut"
              }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="text-xs text-gray-500 font-medium">{day.day}</div>
              <div className="w-6 h-16 bg-gray-100 rounded-sm relative overflow-hidden">
                <motion.div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              {/* FIXED: Better mobile text layout with responsive sizing and word wrapping */}
              <div className="text-xs font-semibold text-orange-600 text-center leading-tight">
                <div>{day.actions}</div>
                <div className="text-[10px] sm:text-xs break-words">{t('actions')}</div>
              </div>
              <div className="text-xs text-gray-400 text-center leading-tight">
                <div className="text-[10px] sm:text-xs">{t('day')} {day.streak}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          <Flame className="h-4 w-4 inline mr-1 text-orange-500" />
          {t('youreOnStreak')} {userProgress.streakDays}-{t('dayStreak')}! {t('keepItUpStreak')}
        </p>
      </div>
    </div>
  );

  const ImpactMetrics: React.FC = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 text-center">
          <img src="/images/ECOBUSSTOP.png" alt="Eco Bus Stop" className="w-8 h-8 mx-auto mb-1 object-contain" loading="lazy" />
          <div className="text-lg font-bold text-green-600">{userProgress.wasteCollected}kg</div>
          <div className="text-xs text-green-600">{t('wasteCollected', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4 text-center">
          <img src="/images/plant-a-tree_6675353.png" alt="Plant a Tree" className="w-8 h-8 mx-auto mb-1 object-contain" loading="lazy" />
          <div className="text-lg font-bold text-blue-600">{userProgress.treesPlanted}</div>
          <div className="text-xs text-blue-600">{t('treesPlanted', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4 text-center">
          <img src="/images/community_16119903.png" alt="Community" className="w-8 h-8 mx-auto mb-1 object-contain" loading="lazy" />
          <div className="text-lg font-bold text-purple-600">{userProgress.eventsAttended}</div>
          <div className="text-xs text-purple-600">{t('eventsAttended', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4 text-center">
          <img src="/images/meet-the-team_15916616.png" alt="Meet the Team" className="w-8 h-8 mx-auto mb-1 object-contain" loading="lazy" />
          <div className="text-lg font-bold text-orange-600">{userProgress.referrals}</div>
          <div className="text-xs text-orange-600">{t('friendsReferred', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
    </div>
  );

  const ReferralSection: React.FC = () => (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <UserPlus className="h-5 w-5 mr-2 text-green-600" />
          {t('referralProgram')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{t('youveReferred')} {userProgress.referrals} {t('friendsSoFar')}</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">50</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <img src="/images/eco coins.png" alt="eco coins" className="h-4 w-4 inline-block" /> {t('perReferral')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userProgress.referrals * 50}</div>
              <div className="text-sm text-gray-600">{t('totalEarned')}</div>
            </div>
          </div>
        </div>
        <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold">
          <Share2 className="h-4 w-4 mr-2" />
          {t('shareReferralLink')}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Layout title={t('profile')}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30">
        <div className={cn(
          "w-full py-4 sm:py-6",
          isMobile ? "px-2" : "px-3 sm:px-4 md:px-6 lg:px-8"
        )}>
          <motion.div 
            className={cn(
              "space-y-4 sm:space-y-6",
              isMobile && "space-y-3"
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Enhanced Profile Header with Dynamic Background */}
            <motion.div variants={itemVariants}>
              <Card 
                className="text-white overflow-hidden relative shadow-xl border-0"
                style={{
                  background: currentBackground.gradient || `linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #2563eb 100%)`
                }}
              >
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Theme-specific animations */}
                  {currentBackground.animation === 'shimmer' && (
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        backgroundSize: '200% 100%'
                      }}
                    />
                  )}
                  
                  {currentBackground.animation === 'aurora' && (
                    <motion.div
                      animate={{
                        x: ['-50%', '50%'],
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
                        width: '200%',
                        height: '200%',
                        left: '-50%',
                        top: '-50%'
                      }}
                    />
                  )}
                  
                  {currentBackground.animation === 'flow' && (
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%']
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse"
                      }}
                      className="absolute inset-0 opacity-25"
                      style={{
                        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                        backgroundSize: '200% 200%'
                      }}
                    />
                  )}
                  
                  {currentBackground.animation === 'pulse' && (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)'
                      }}
                    />
                  )}

                  {/* Floating particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className={`absolute bg-white/10 rounded-full blur-sm`}
                      style={{
                        width: `${8 + i * 4}px`,
                        height: `${8 + i * 4}px`,
                        left: `${5 + i * 12}%`,
                        top: `${10 + i * 8}%`
                      }}
                      animate={{
                        x: [0, 100 + i * 20, 0],
                        y: [0, -50 + i * 10, 0],
                        scale: [1, 1.2 + i * 0.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 6 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                      }}
                    />
                  ))}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10" />
                </div>
                
                <CardContent className={cn("relative z-10", isMobile ? "p-2" : "p-4 sm:p-6 lg:p-8")}>
                  {/* Settings Button - Absolute positioned in top right corner */}
                  <motion.div
                    className={cn(
                      "absolute top-0 right-0 z-20",
                      isMobile ? "top-2 right-2" : "top-4 right-4 sm:top-6 sm:right-6"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300",
                        isMobile ? "h-7 w-7 p-0 min-h-[28px] min-w-[28px]" : "h-8 w-8"
                      )}
                      onClick={() => setIsSettingsOpen(true)}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Settings className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    </Button>
                  </motion.div>

                  <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between", isMobile ? "mb-2" : "mb-4 sm:mb-6")}>
                    <div className={cn("flex items-center sm:mb-0", isMobile ? "space-x-2 mb-1.5" : "space-x-3 sm:space-x-4 mb-4")}>
                      <div className="relative group">
                        <div 
                          className="relative z-10 cursor-pointer"
                          onClick={(e) => {
                            if (!touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                            }
                            touchHandledRef.current = false;
                          }}
                          onTouchStart={(e) => {
                            touchHandledRef.current = true;
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            if (touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                              touchHandledRef.current = false;
                            }
                          }}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <EnhancedAvatar
                            emoji={userProgress.activeAvatar}
                            image={getAvatarImage(userProgress.activeAvatar)}
                            size={isMobile ? "xl" : "2xl"}
                            glowColor="green"
                            showCrown={true}
                            profileFrame={userProgress.profileFrame}
                            noBackground={true}
                          />
                        </div>
                        
                        <motion.button 
                          className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full p-2 
                                   opacity-0 group-hover:opacity-100 transition-all duration-200 
                                   hover:bg-white/30 hover:scale-110"
                          onClick={(e) => {
                            if (!touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                            }
                            touchHandledRef.current = false;
                          }}
                          onTouchStart={(e) => {
                            touchHandledRef.current = true;
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            if (touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                              touchHandledRef.current = false;
                            }
                          }}
                          style={{ touchAction: 'manipulation' }}
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </motion.button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h2 className={cn(
                          "font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent",
                          isMobile ? "text-sm leading-tight" : "text-lg sm:text-xl lg:text-2xl"
                        )}>
                          {userProgress.name}
                        </h2>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <p className={cn(
                            "text-white/90 font-medium",
                            isMobile ? "text-[10px]" : "text-sm sm:text-base"
                          )}>
                            {t('climateHero')}
                          </p>
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Flame className={cn("text-orange-300", isMobile ? "h-2.5 w-2.5" : "h-4 w-4")} />
                          </motion.div>
                        </div>
                        
                        <div className={cn(
                          "flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-white/80 sm:space-y-0",
                          isMobile ? "mt-0.5 space-y-0 text-[9px]" : "mt-2 space-y-1 text-xs sm:text-sm"
                        )}>
                          <div className="flex items-center space-x-1">
                            <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                            <span>{t('chilonzorDistrict')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <School className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                            <span>{t('school45', { ns: 'profile' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className={cn(
                    "grid sm:mb-4 sm:mb-6",
                    isMobile ? "grid-cols-2 gap-1.5 mb-2" : "grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3"
                  )}>
                    {/* EcoCoins Card - Golden Theme */}
                    <motion.div 
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md",
                        "bg-gradient-to-br from-yellow-500/30 via-yellow-400/25 to-amber-500/20",
                        "border-yellow-400/50",
                        isMobile ? "p-2" : "p-3 sm:p-4"
                      )}
                      whileHover={isMobile ? {} : { scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Decorative glow effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                      
                      <div className="relative z-10">
                        {/* Icon - Large and Prominent */}
                        <div className={cn("flex items-center justify-center mb-2", isMobile ? "mb-1.5" : "")}>
                          <img 
                            src="/images/eco coins.png" 
                            alt="Eco Coins" 
                            className={cn(
                              "object-contain drop-shadow-lg",
                              isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12"
                            )}
                            style={{ 
                              filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            }}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Label */}
                        <div className={cn("text-center mb-1", isMobile ? "mb-0.5" : "")}>
                          <span className={cn(
                            "font-semibold text-white/95 drop-shadow-sm",
                            isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                          )}>
                            {t('ecoCoins')}
                          </span>
                        </div>
                        
                        {/* Value - Bold and Prominent */}
                        <div className={cn(
                          "text-center font-bold",
                          "bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 bg-clip-text text-transparent",
                          "drop-shadow-lg",
                          isMobile ? "text-base" : "text-xl sm:text-2xl lg:text-3xl"
                        )}>
                          {userProgress.ecoCoins}
                        </div>
                      </div>
                    </motion.div>

                    {/* EcoPoints Card - Blue/Cyan Theme */}
                    <motion.div 
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md",
                        "bg-gradient-to-br from-blue-500/30 via-cyan-400/25 to-blue-600/20",
                        "border-blue-400/50",
                        isMobile ? "p-2" : "p-3 sm:p-4"
                      )}
                      whileHover={isMobile ? {} : { scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Decorative glow effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                      
                      <div className="relative z-10">
                        {/* Icon - Large and Prominent */}
                        <div className={cn("flex items-center justify-center mb-2", isMobile ? "mb-1.5" : "")}>
                          <img 
                            src="/images/eco-points.png" 
                            alt="Eco Points" 
                            className={cn(
                              "object-contain drop-shadow-lg",
                              isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12"
                            )}
                            style={{ 
                              filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            }}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Label */}
                        <div className={cn("text-center mb-1", isMobile ? "mb-0.5" : "")}>
                          <span className={cn(
                            "font-semibold text-white/95 drop-shadow-sm",
                            isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                          )}>
                            {t('ecoPoints')}
                          </span>
                        </div>
                        
                        {/* Value - Bold and Prominent */}
                        <div className={cn(
                          "text-center font-bold",
                          "bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-400 bg-clip-text text-transparent",
                          "drop-shadow-lg",
                          isMobile ? "text-base" : "text-xl sm:text-2xl lg:text-3xl"
                        )}>
                          {userProgress.ecoPoints.toLocaleString()}
                        </div>
                      </div>
                    </motion.div>

                    {/* Waste Collected Card - Green/Emerald Theme */}
                    <motion.div
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md col-span-1",
                        "bg-gradient-to-br from-green-500/30 via-emerald-400/25 to-green-600/20",
                        "border-green-400/50",
                        isMobile ? "p-2" : "p-3 sm:p-4"
                      )}
                      whileHover={isMobile ? {} : { scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Decorative glow effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                      
                      <div className="relative z-10">
                        {/* Icon - Large and Prominent */}
                        <div className={cn("flex items-center justify-center mb-2", isMobile ? "mb-1.5" : "")}>
                          <img 
                            src="/images/Waste Collected.png" 
                            alt="Waste Collected" 
                            className={cn(
                              "object-contain drop-shadow-lg",
                              isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12"
                            )}
                            style={{ 
                              filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            }}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Label */}
                        <div className={cn("text-center mb-1", isMobile ? "mb-0.5" : "")}>
                          <span className={cn(
                            "font-semibold text-white/95 drop-shadow-sm",
                            isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                          )}>
                            {t('wasteCollected')}
                          </span>
                        </div>
                        
                        {/* Value - Bold and Prominent */}
                        <div className={cn(
                          "text-center font-bold",
                          "bg-gradient-to-r from-green-200 via-emerald-300 to-green-400 bg-clip-text text-transparent",
                          "drop-shadow-lg",
                          isMobile ? "text-base" : "text-xl sm:text-2xl lg:text-3xl"
                        )}>
                          {wasteFormatted.value}{wasteFormatted.unit}
                        </div>
                      </div>
                    </motion.div>

                    {/* Badges Card - Purple/Pink Theme */}
                    <motion.div
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md col-span-1",
                        "bg-gradient-to-br from-purple-500/30 via-pink-400/25 to-purple-600/20",
                        "border-purple-400/50",
                        isMobile ? "p-2" : "p-3 sm:p-4"
                      )}
                      whileHover={isMobile ? {} : { scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Decorative glow effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                      
                      <div className="relative z-10">
                        {/* Icon - Large and Prominent */}
                        <div className={cn("flex items-center justify-center mb-2", isMobile ? "mb-1.5" : "")}>
                          <img 
                            src="/images/badges.png" 
                            alt="Badges" 
                            className={cn(
                              "object-contain drop-shadow-lg",
                              isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12"
                            )}
                            style={{ 
                              filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            }}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Label */}
                        <div className={cn("text-center mb-1", isMobile ? "mb-0.5" : "")}>
                          <span className={cn(
                            "font-semibold text-white/95 drop-shadow-sm",
                            isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                          )}>
                            {t('badges')}
                          </span>
                        </div>
                        
                        {/* Value - Bold and Prominent */}
                        <div className={cn(
                          "text-center font-bold",
                          "bg-gradient-to-r from-purple-200 via-pink-300 to-purple-400 bg-clip-text text-transparent",
                          "drop-shadow-lg",
                          isMobile ? "text-base" : "text-xl sm:text-2xl lg:text-3xl"
                        )}>
                          {userProgress.badgesEarned}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Enhanced Level Progress with Improved Text Readability */}
                  <motion.div 
                    className={cn(
                      "bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 shadow-lg",
                      isMobile ? "p-2" : "p-4 sm:p-6"
                    )}
                    whileHover={isMobile ? {} : { scale: 1.01 }}
                    layout
                  >
                    {/* Header Row - Level, Icon, and Points Badge - Aligned Horizontally */}
                    <div className={cn(
                      "flex items-center justify-between",
                      isMobile ? "mb-2" : "mb-3"
                    )}>
                      {/* Left: Level Text */}
                      <div className="flex items-center h-full">
                        <p className={cn(
                          "font-semibold text-white m-0 leading-none",
                          isMobile ? "text-xs" : "text-sm sm:text-base"
                        )}>
                          {t('levelFifteen')} {userProgress.level}
                        </p>
                      </div>
                      
                      {/* Center: Level Icon */}
                      <div className="flex items-center justify-center flex-1">
                        <motion.div 
                          className="flex items-center justify-center"
                          whileHover={isMobile ? {} : { rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <img 
                            src="/images/level.png" 
                            alt="Level" 
                            className={cn(
                              "object-contain drop-shadow-lg",
                              isMobile ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
                            )}
                            loading="lazy"
                          />
                        </motion.div>
                      </div>
                      
                      {/* Right: Points Badge */}
                      <div className="flex items-center h-full">
                        <Badge className={cn(
                          "bg-gradient-to-r from-white/20 to-white/10 text-white border-white/30 backdrop-blur-sm shadow-lg flex items-center",
                          isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs sm:text-sm px-3 py-1.5"
                        )}>
                          <Sparkles className={cn(isMobile ? "h-2 w-2 mr-0.5" : "h-3 w-3 mr-1")} />
                          {userProgress.ecoPoints.toLocaleString()} {t('pts', { ns: 'profile' })}
                        </Badge>
                      </div>
                    </div>

                    {/* Title Row - Sustainability Expert and Chevron - Aligned Horizontally */}
                    <div className={cn(
                      "flex items-center justify-between",
                      isMobile ? "mb-3" : "mb-4"
                    )}>
                      <p className={cn(
                        "font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent",
                        isMobile ? "text-sm" : "text-base sm:text-lg"
                      )}>
                        {t('sustainabilityExpert')}
                      </p>
                      <motion.button
                        onClick={() => setLevelExpanded(!levelExpanded)}
                        className={cn(
                          "rounded-full hover:bg-white/20 transition-colors touch-feedback btn-touch flex-shrink-0",
                          isMobile ? "p-1 min-h-[24px] min-w-[24px]" : "p-1.5 min-h-[28px] min-w-[28px]"
                        )}
                        whileHover={isMobile ? {} : { scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ willChange: 'transform', touchAction: 'manipulation' }}
                      >
                        {levelExpanded ? <ChevronUp className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} /> : <ChevronDown className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />}
                      </motion.button>
                    </div>
                    
                    {/* Progress Section - Well Structured */}
                    <motion.div 
                      className={cn(isMobile ? "space-y-2" : "space-y-3")}
                      layout
                    >
                      {/* Progress Label and Percentage - Aligned Horizontally */}
                      <div className={cn(
                        "flex items-center justify-between",
                        isMobile ? "mb-1.5" : "mb-2"
                      )}>
                        <span className={cn(
                          "font-medium text-white/90",
                          isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                        )}>
                          {t('progressToLevel')} {userProgress.level + 1}
                        </span>
                        <span className={cn(
                          "font-semibold text-white flex-shrink-0",
                          isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                        )}>
                          {Math.round(levelProgress)}%
                        </span>
                      </div>
                      
                      {/* Elegant Liquid Wave Progress Bar */}
                      <div className="relative">
                        {/* Glassmorphism Track Background */}
                        <div className={cn(
                          "relative rounded-full overflow-hidden",
                          "bg-white/5 backdrop-blur-sm border border-white/10",
                          isMobile ? "h-2.5" : "h-4"
                        )}
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)',
                        }}
                        >
                          {/* Progress Fill with Liquid Wave Effect */}
                          <motion.div
                            className="relative h-full rounded-full overflow-hidden"
                            variants={progressVariants}
                            initial="initial"
                            animate="animate"
                            custom={levelProgress}
                            style={{
                              background: `linear-gradient(90deg, 
                                #facc15 0%,
                                #fb923c ${levelProgress * 0.5}%,
                                #f87171 ${levelProgress}%
                              )`,
                              filter: `drop-shadow(0 0 ${2 + (levelProgress / 100) * 4}px rgba(251, 146, 60, 0.6))`,
                            }}
                          >
                            {/* Animated Liquid Wave Layer 1 */}
                            <motion.div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(90deg, 
                                  transparent 0%,
                                  rgba(255, 255, 255, 0.3) 30%,
                                  rgba(255, 255, 255, 0.5) 50%,
                                  rgba(255, 255, 255, 0.3) 70%,
                                  transparent 100%
                                )`,
                                clipPath: `polygon(0% 0%, ${levelProgress}% 0%, ${levelProgress}% 100%, 0% 100%)`,
                              }}
                              animate={{
                                x: ['-100%', '100%'],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                                repeatDelay: 0
                              }}
                            />
                            
                            {/* Animated Liquid Wave Layer 2 - slower */}
                            <motion.div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(90deg, 
                                  transparent 0%,
                                  rgba(255, 255, 255, 0.2) 40%,
                                  rgba(255, 255, 255, 0.4) 60%,
                                  rgba(255, 255, 255, 0.2) 80%,
                                  transparent 100%
                                )`,
                                clipPath: `polygon(0% 0%, ${levelProgress}% 0%, ${levelProgress}% 100%, 0% 100%)`,
                              }}
                              animate={{
                                x: ['-100%', '100%'],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear",
                                repeatDelay: 0.5
                              }}
                            />
                            
                            {/* Shimmer Effect at Progress Edge */}
                            <motion.div
                              className="absolute top-0 bottom-0 right-0"
                              style={{
                                width: '20px',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                                filter: 'blur(4px)',
                                left: `${levelProgress}%`,
                                transform: 'translateX(-50%)',
                              }}
                              animate={{
                                opacity: [0.3, 0.8, 0.3],
                                scaleX: [0.8, 1.2, 0.8],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.div>
                        </div>
                        
                        {/* Floating Progress Indicator */}
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2"
                          style={{ 
                            left: `${levelProgress}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          initial={{ left: 0 }}
                          animate={{ 
                            left: `${levelProgress}%`,
                          }}
                          transition={{ 
                            left: { duration: 1.5, ease: "easeOut" },
                          }}
                        >
                          {/* Outer Glow Halo */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                              width: isMobile ? '14px' : '18px',
                              height: isMobile ? '14px' : '18px',
                              background: 'radial-gradient(circle, rgba(250, 204, 21, 0.4), transparent 70%)',
                              transform: 'translate(-50%, -50%)',
                            }}
                            animate={{
                              scale: [1, 1.4, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          {/* Main Indicator */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                              width: isMobile ? '10px' : '12px',
                              height: isMobile ? '10px' : '12px',
                              background: 'radial-gradient(circle, #facc15, #fb923c)',
                              transform: 'translate(-50%, -50%)',
                              boxShadow: `
                                0 0 ${4 + (levelProgress / 100) * 6}px rgba(250, 204, 21, 0.8),
                                0 0 ${2 + (levelProgress / 100) * 4}px rgba(251, 146, 60, 0.6),
                                inset 0 1px 2px rgba(255, 255, 255, 0.4)
                              `,
                              border: '1.5px solid rgba(255, 255, 255, 0.5)',
                            }}
                            animate={{
                              y: [0, -2, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          {/* Inner Highlight */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                              width: isMobile ? '4px' : '5px',
                              height: isMobile ? '4px' : '5px',
                              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent)',
                              transform: 'translate(-50%, -50%)',
                              top: '30%',
                            }}
                            animate={{
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                      </div>
                      
                      {/* Points to Next Level - Aligned Left */}
                      <motion.p 
                        className={cn(
                          "opacity-90 text-white/90 font-medium",
                          isMobile ? "text-[9px] leading-tight mt-1.5" : "text-xs sm:text-sm mt-2"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 1 }}
                      >
                        <span className="text-yellow-200 font-semibold">{pointsToNext}</span> {t('pointsToNextLevel')}
                      </motion.p>

                      {/* Improved Level Benefits with Better Text Readability */}
                      <AnimatePresence initial={false}>
                        {levelExpanded && (
                          <motion.div
                            key="level-benefits"
                            variants={levelBenefitsVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(
                              "bg-white/20 rounded-lg border border-white/30 shadow-inner",
                              isMobile ? "mt-2 p-2.5" : "mt-4 p-4"
                            )}
                            style={{ 
                              willChange: 'transform, opacity',
                              transform: 'translateZ(0)',
                              backfaceVisibility: 'hidden'
                            }}
                          >
                            <motion.h4 
                              className={cn(
                                "font-bold flex items-center text-white",
                                isMobile ? "text-xs mb-2" : "text-sm mb-3"
                              )}
                              variants={benefitItemVariants}
                            >
                              <Info className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                              {t('levelBenefits')}
                            </motion.h4>
                            <motion.ul 
                              className={cn(
                                "space-y-2 text-white/95 font-medium",
                                isMobile ? "text-[10px] space-y-1.5" : "text-sm space-y-2"
                              )}
                              variants={levelBenefitsVariants}
                            >
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('accessExclusiveOffers')}
                              </motion.li>
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('priorityEventRegistration')}
                              </motion.li>
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('monthlyBonusEcoCoins')}
                              </motion.li>
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('specialRecognitionBadges')}
                              </motion.li>
                            </motion.ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={cn(
                  "grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border border-white/20",
                  isMobile ? "h-11 mb-3" : "h-12 sm:h-14 mb-4 sm:mb-6"
                )}>
                  <TabsTrigger 
                    value="wallet" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Wallet className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('wallet')}</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="offers" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Tag className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('offers')}</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="badges" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Award className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('badges')}</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <BarChart3 className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('analytics')}</span>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="space-y-4 sm:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.15,
                      type: "tween",
                      ease: "easeOut"
                    }}
                    style={{ willChange: 'transform, opacity' }}
                    className="space-y-4 sm:space-y-6"
                  >
                      {/* Rewards Store */}
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <Gift className="h-5 w-5 mr-2 text-green-600" />
                              {t('ecoRewardsStore')}
                            </div>
                            <motion.div 
                              className="text-sm text-gray-600 flex items-center space-x-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img src="/images/eco coins.png" alt="eco coins" className="h-5 w-5 inline-block" />
                              <span>{userProgress.ecoCoins}</span>
                            </motion.div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {REWARDS_DATA.map((reward) => (
                              <RewardCard key={reward.id} reward={reward} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Referral Section */}
                      <ReferralSection />

                      {/* Recent Transactions */}
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                              {t('recentTransactions')}
                            </div>
                            <Button variant="ghost" size="sm" className="text-sm hover:bg-gray-100">{t('viewAll')}</Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="space-y-0">
                            {[
                              { type: 'earned' as const, title: t('plasticCollectionCentralPark'), time: `2 ${t('hoursAgo')}`, amount: 50 },
                              { type: 'spent' as const, title: t('childrenSouvenirsPurchase'), time: `1 ${t('dayAgo')}`, amount: -75 },
                              { type: 'earned' as const, title: t('treePlantingEventParticipation'), time: `3 ${t('daysAgo')}`, amount: 100 },
                              { type: 'earned' as const, title: t('communityCleanupVolunteer'), time: `5 ${t('daysAgo')}`, amount: 25 }
                            ].map((transaction, index) => (
                              <motion.div
                                key={index}
                                className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                                whileHover={{ x: 4 }}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                  delay: index * 0.03,
                                  duration: 0.12,
                                  type: "tween",
                                  ease: "easeOut"
                                }}
                                style={{ willChange: 'transform, opacity' }}
                              >
                                <div className="flex items-center space-x-3">
                                  <motion.div 
                                    className={`p-2 rounded-full ${
                                      transaction.type === 'earned' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-red-100 text-red-600'
                                    }`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                  >
                                    {transaction.type === 'earned' ? 
                                      <ArrowUpRight className="h-4 w-4" /> : 
                                      <ArrowDownRight className="h-4 w-4" />
                                    }
                                  </motion.div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm sm:text-base truncate">{transaction.title}</p>
                                    <p className="text-xs text-gray-500">{transaction.time}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <div className={cn("font-semibold text-sm sm:text-base flex items-center gap-1", transaction.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} <img src="/images/eco coins.png" alt="eco coins" className="h-4 w-4 inline-block" />
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="offers" className="mt-4 sm:mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <Tag className="h-5 w-5 mr-2 text-blue-600" />
                              {t('partnerDiscountOffers')}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                {PARTNER_OFFERS.filter(offer => userProgress.ecoCoins >= offer.minCoins).length} {t('available')}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-600 gap-1">
                                <img src="/images/eco coins.png" alt="eco coins" className="h-5 w-5 inline-block" />
                                {userProgress.ecoCoins}
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {PARTNER_OFFERS.map((offer, index) => (
                              <PartnerOfferCard key={offer.id} offer={offer} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="badges" className="mt-4 sm:mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Award className="h-5 w-5 mr-2 text-yellow-600" />
                            {t('achievementBadges')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {mockBadges.map((badge) => (
                              <BadgeCard key={badge.id} badge={badge} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-4 sm:mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.15,
                      type: "tween",
                      ease: "easeOut"
                    }}
                    style={{ willChange: 'transform, opacity' }}
                    className="space-y-4 sm:space-y-6"
                  >
                      {/* Analytics Overview */}
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Activity className="h-5 w-5 mr-2 text-orange-600" />
                            {t('yourEngagementAnalytics')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Weekly Engagement Chart */}
                          <WeeklyEngagementChart />
                          
                          {/* Monthly Summary */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm">{t('monthlySummary')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {[
                                { value: userProgress.eventsAttended, label: t('eventsAttended'), color: 'green' },
                                { value: userProgress.treesPlanted, label: t('treesPlanted'), color: 'blue' },
                                { value: analyticsData.achievements.thisMonth, label: t('newBadges'), color: 'purple' },
                                { value: `#${mockLeaderboard.find(u => u.name === userProgress.name)?.rank || '5'}`, label: t('leaderboardRank'), color: 'orange' }
                              ].map((stat, index) => (
                                <motion.div
                                  key={stat.label}
                                  className={`text-center p-3 rounded-lg`}
                                  style={{
                                    backgroundColor: `var(--${stat.color}-50)`,
                                    color: `var(--${stat.color}-600)`,
                                    willChange: 'transform, opacity'
                                  }}
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ 
                                    delay: index * 0.03,
                                    duration: 0.12,
                                    type: "tween",
                                    ease: "easeOut"
                                  }}
                                >
                                  <div className="text-lg font-bold">{stat.value}</div>
                                  <div className="text-xs">{stat.label}</div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Environmental Impact */}
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Leaf className="h-5 w-5 mr-2 text-green-600" />
                            {t('yourEnvironmentalImpact')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ImpactMetrics />
                        </CardContent>
                      </Card>

                      {/* Goal Progress */}
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Target className="h-5 w-5 mr-2 text-purple-600" />
                            {t('goalProgress')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { label: `${t('nextBadge')}: ${analyticsData.achievements.nextGoal}`, current: 85, total: 100, unit: t('kg') },
                            { label: t('monthlyWasteGoal'), current: userProgress.wasteCollected, total: 100, unit: t('kg') },
                            { label: t('communityEvents'), current: userProgress.eventsAttended, total: 15, unit: t('events') }
                          ].map((goal, index) => (
                            <motion.div
                              key={goal.label}
                              className="space-y-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{goal.label}</span>
                                <span className="text-sm text-gray-600">
                                  {goal.current}/{goal.total} {goal.unit}
                                </span>
                              </div>
                              <Progress value={(goal.current / goal.total) * 100} className="h-2" />
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Leaderboard */}
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                              {t('leaderboard', { ns: 'profile' })}
                            </div>
                            {leaderboardData[0]?.isCurrentUser && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
                                <Crown className="h-3 w-3 mr-1" />
                                {t('topPerformer', { ns: 'profile' })}
                              </Badge>
                            )}
                          </CardTitle>
                          <p className={cn("text-gray-600 mt-1", isMobile ? "text-xs" : "text-sm")}>
                            {t('leaderboardDescription', { ns: 'profile' })}
                          </p>
                        </CardHeader>
                        <CardContent>
                          {/* Congratulations Banner for #1 */}
                          {leaderboardData[0]?.isCurrentUser && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                duration: 0.12,
                                type: "tween",
                                ease: "easeOut"
                              }}
                              style={{ willChange: 'transform, opacity' }}
                              className={cn(
                                "mb-4 p-3 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500",
                                "text-white font-semibold text-center shadow-lg",
                                isMobile ? "text-xs" : "text-sm"
                              )}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Crown className={cn("text-yellow-200", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                <span>{t('congratulations', { ns: 'profile' })}</span>
                                <Crown className={cn("text-yellow-200", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                              </div>
                            </motion.div>
                          )}

                          {/* Leaderboard Table - Desktop View */}
                          <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className={cn("text-left py-3 px-4 font-semibold text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                                    {t('rank', { ns: 'profile' })}
                                  </th>
                                  <th className={cn("text-left py-3 px-4 font-semibold text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                                    {t('player', { ns: 'profile' })}
                                  </th>
                                  <th className={cn("text-right py-3 px-4 font-semibold text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                                    {t('points', { ns: 'profile' })}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {leaderboardData.map((player, index) => (
                                  <motion.tr
                                    key={`table-${player.rank}-${index}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                      delay: index * 0.02,
                                      duration: 0.1,
                                      type: "tween",
                                      ease: "easeOut"
                                    }}
                                    style={{ willChange: 'transform, opacity' }}
                                    className={cn(
                                      "border-b border-gray-100 transition-colors",
                                      player.isCurrentUser 
                                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100" 
                                        : "hover:bg-gray-50"
                                    )}
                                  >
                                    <td className={cn("py-3 px-4", isMobile ? "text-xs" : "text-sm")}>
                                      <div className="flex items-center gap-2">
                                        {player.rank === 1 && (
                                          <Crown className={cn("text-yellow-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        )}
                                        {player.rank === 2 && (
                                          <Medal className={cn("text-gray-400", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        )}
                                        {player.rank === 3 && (
                                          <Medal className={cn("text-orange-400", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        )}
                                        <span className={cn(
                                          "font-bold",
                                          player.rank <= 3 ? "text-lg" : "text-base",
                                          player.isCurrentUser ? "text-orange-600" : "text-gray-700"
                                        )}>
                                          #{player.rank}
                                        </span>
                                      </div>
                                    </td>
                                    <td className={cn("py-3 px-4", isMobile ? "text-xs" : "text-sm")}>
                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          <Avatar className={cn(
                                            player.isCurrentUser 
                                              ? "ring-2 ring-yellow-400 ring-offset-2" 
                                              : "",
                                            isMobile ? "h-8 w-8" : "h-10 w-10"
                                          )}>
                                            <AvatarFallback className={cn(
                                              "text-lg",
                                              player.isCurrentUser 
                                                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" 
                                                : "bg-gray-200"
                                            )}>
                                              {player.avatar}
                                            </AvatarFallback>
                                          </Avatar>
                                          {player.isCurrentUser && (
                                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                              <CheckCircle className="h-2.5 w-2.5 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className={cn(
                                            "font-semibold truncate",
                                            player.isCurrentUser ? "text-orange-600" : "text-gray-900",
                                            isMobile ? "text-xs" : "text-sm"
                                          )}>
                                            {player.name}
                                            {player.isCurrentUser && (
                                              <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-300 text-[10px] px-1.5 py-0">
                                                {t('you', { ns: 'profile' })}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className={cn("py-3 px-4 text-right", isMobile ? "text-xs" : "text-sm")}>
                                      <div className={cn(
                                        "font-bold",
                                        player.isCurrentUser ? "text-orange-600" : "text-gray-700",
                                        isMobile ? "text-sm" : "text-base"
                                      )}>
                                        {player.points.toLocaleString()}
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Leaderboard Cards - Mobile View */}
                          <div className="sm:hidden space-y-2">
                            {leaderboardData.map((player, index) => (
                              <motion.div
                                key={`mobile-${player.rank}-${index}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                  delay: index * 0.02,
                                  duration: 0.1,
                                  type: "tween",
                                  ease: "easeOut"
                                }}
                                style={{ willChange: 'transform, opacity' }}
                                className={cn(
                                  "p-3 rounded-lg border transition-all",
                                  player.isCurrentUser
                                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md"
                                    : "bg-white border-gray-200"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {player.rank === 1 && (
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                      )}
                                      {player.rank === 2 && (
                                        <Medal className="h-4 w-4 text-gray-400" />
                                      )}
                                      {player.rank === 3 && (
                                        <Medal className="h-4 w-4 text-orange-400" />
                                      )}
                                      <span className={cn(
                                        "font-bold text-xs",
                                        player.isCurrentUser ? "text-orange-600" : "text-gray-700"
                                      )}>
                                        #{player.rank}
                                      </span>
                                    </div>
                                    <Avatar className={cn(
                                      "h-8 w-8 flex-shrink-0",
                                      player.isCurrentUser ? "ring-2 ring-yellow-400" : ""
                                    )}>
                                      <AvatarFallback className={cn(
                                        "text-sm",
                                        player.isCurrentUser 
                                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" 
                                          : "bg-gray-200"
                                      )}>
                                        {player.avatar}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 ml-2">
                                      <div className={cn(
                                        "font-semibold truncate text-xs",
                                        player.isCurrentUser ? "text-orange-600" : "text-gray-900"
                                      )}>
                                        {player.name}
                                        {player.isCurrentUser && (
                                          <Badge className="ml-1 bg-orange-100 text-orange-700 border-orange-300 text-[9px] px-1 py-0">
                                            {t('you', { ns: 'profile' })}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "font-bold text-sm flex-shrink-0 ml-2",
                                    player.isCurrentUser ? "text-orange-600" : "text-gray-700"
                                  )}>
                                    {player.points.toLocaleString()}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings', { ns: 'profile' })}
            </DialogTitle>
            <DialogDescription>
              {t('settingsDescription', { ns: 'profile' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Name Change Section */}
            <NameChangeSection 
              onNameUpdated={() => {
                const savedProgress = loadUserProgress();
                setUserProgress(savedProgress);
              }}
              t={t}
            />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base font-medium">
                  {t('notifications', { ns: 'profile' })}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('notificationsDescription', { ns: 'profile' })}
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  setNotificationsEnabled(checked);
                  toast.success(t('settingsSaved', { ns: 'profile' }));
                }}
              />
            </div>

            {/* Email Updates */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-updates" className="text-base font-medium">
                  {t('emailUpdates', { ns: 'profile' })}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('emailUpdatesDescription', { ns: 'profile' })}
                </p>
              </div>
              <Switch
                id="email-updates"
                checked={emailUpdates}
                onCheckedChange={(checked) => {
                  setEmailUpdates(checked);
                  toast.success(t('settingsSaved', { ns: 'profile' }));
                }}
              />
            </div>

            {/* Privacy Settings */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">
                {t('privacy', { ns: 'profile' })}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    toast.info(t('privacyPolicyComingSoon', { ns: 'profile' }));
                  }}
                >
                  {t('viewPrivacyPolicy', { ns: 'profile' })}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    toast.info(t('termsComingSoon', { ns: 'profile' }));
                  }}
                >
                  {t('viewTerms', { ns: 'profile' })}
                </Button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">
                {t('account', { ns: 'profile' })}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    toast.info(t('exportDataComingSoon', { ns: 'profile' }));
                  }}
                >
                  {t('exportData', { ns: 'profile' })}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    if (window.confirm(t('deleteAccountConfirm', { ns: 'profile' }))) {
                      toast.error(t('deleteAccountComingSoon', { ns: 'profile' }));
                    }
                  }}
                >
                  {t('deleteAccount', { ns: 'profile' })}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Avatar System Modal - FIXED PROPS */}
      <EnhancedAvatarSystem
        isOpen={isAvatarSelectorOpen}
        onClose={() => {
          setIsAvatarSelectorOpen(false);
          // Reload progress after closing to ensure theme is updated
          const savedProgress = loadUserProgress();
          setUserProgress(savedProgress);
        }}
        selectedAvatar={userProgress.activeAvatar}
        onAvatarSelect={handleAvatarSelect}
        onThemeChange={(themeId) => {
          // Use functional update to ensure we have the latest state
          setUserProgress((prevProgress) => {
            const updated = { ...prevProgress, profileBackground: themeId };
            saveUserProgress(updated);
            return updated;
          });
        }}
      />
    </Layout>
  );
};

export default Profile;