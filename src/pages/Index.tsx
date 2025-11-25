import { Bell, Leaf, Award, Users, ArrowRight, Settings, Coins, Star, Trophy, Crown, MapPin, School, ExternalLink, UserCheck, Phone, Mail, Sparkles, Recycle, TreePine, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Layout from '@/components/Layout';
import EcoCounter from '@/components/EcoCounter';
import GameLevel from '@/components/GameLevel';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getUserNameData, saveUserName } from '@/utils/userName';
import { currentUser, globalStats, goals2026 } from '@/lib/mockData';
import { getNewsItems } from '@/lib/newsData';
import { USER_DATA, calculateLevel, calculateLevelProgress } from '@/lib/userData';
import { UzbekPattern } from '@/components/EcoIcons';
import { useTranslation } from 'react-i18next';
import { loadUserProgress, PROFILE_BACKGROUNDS, UserProgress, calculateLevelProgress as calcLevelProgress } from '@/lib/userProgress';
import { getAvatarImage } from '@/lib/avatarImages';
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';
import { useEffect, useMemo, lazy, Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SplineRobot } from '@/components/SplineRobot';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';
import { useHreflang } from '@/hooks/useHreflang';
import '../styles/mobile-responsive.css';
import { contactHelpers } from '@/utils/mailto';
import AnimatedCounter from '@/components/AnimatedCounter';

// Progress animation variants
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

export default function Index() {
  const { t, i18n } = useTranslation();
  const [userProgress, setUserProgress] = useState<UserProgress>(() => loadUserProgress());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const isMobile = useIsMobile();

  // Load current name when settings modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      const nameData = getUserNameData();
      setFirstName(nameData.firstName);
      setLastName(nameData.lastName);
    }
  }, [isSettingsOpen]);

  // SEO Management
  useSEO({
    title: t('heroTitle', { defaultValue: 'ZAMINAT.eco - Ecological Movement' }),
    description: t('heroDescription', { defaultValue: 'Transform plastic and rubber waste recycling into social movement in Uzbekistan. Join EcoApp gamification platform for eco-products, volunteer campaigns, sustainable future.' }),
    image: '/logo.png',
    type: 'website',
    keywords: 'plastic recycling, rubber recycling, eco-tiles, waste management Uzbekistan, volunteer eco-campaigns, EcoApp, EcoKids, environmental movement, sustainability',
  });

  // Hreflang tags for multilingual SEO
  useHreflang();

  // Listen for storage changes to update when profile changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProgress = loadUserProgress();
      setUserProgress(savedProgress);
    };

    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event (when localStorage changes in same tab)
    window.addEventListener('userProgressUpdated', handleStorageChange);
    
    // Listen for user name updates
    const handleUserNameUpdate = () => {
      handleStorageChange();
    };
    window.addEventListener('userNameUpdated', handleUserNameUpdate);
    
    // Also check on focus (when user comes back to this tab)
    const handleFocus = () => {
      handleStorageChange();
    };
    window.addEventListener('focus', handleFocus);

    // Initial load
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProgressUpdated', handleStorageChange);
      window.removeEventListener('userNameUpdated', handleUserNameUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Use userProgress data if available, otherwise fall back to USER_DATA - Memoized for performance
  const displayData = useMemo(() => {
    const ecoCoins = userProgress?.ecoCoins ?? USER_DATA.ecoCoins;
    const ecoPoints = userProgress?.ecoPoints ?? USER_DATA.ecoPoints;
    // Get name from stored data, ensuring it only shows what user entered (no last name if only first name provided)
    const storedName = getUserNameData().fullName;
    const name = userProgress?.name || storedName || USER_DATA.name;
    const avatar = userProgress?.activeAvatar ?? USER_DATA.avatar;
    const background = userProgress?.profileBackground 
      ? (PROFILE_BACKGROUNDS[userProgress.profileBackground]?.gradient || 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #2563eb 100%)')
      : 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #2563eb 100%)';
    
    const level = calculateLevel(ecoPoints);
    const { progress, pointsToNext } = calcLevelProgress(ecoPoints, level);
    
    return {
      ecoCoins,
      ecoPoints,
      name,
      avatar,
      background,
      level,
      levelProgress: progress,
      pointsToNext
    };
  }, [userProgress]);

  const { 
    ecoCoins: displayEcoCoins, 
    ecoPoints: displayEcoPoints, 
    name: displayName, 
    avatar: displayAvatar, 
    background: displayBackground,
    level: currentLevel,
    levelProgress,
    pointsToNext
  } = displayData;
  
  // Get translated news items - Memoized to prevent unnecessary recalculations
  const newsItems = useMemo(() => getNewsItems(t), [t]);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <Layout title={t('home')}>
      <div className="min-h-screen bg-background uzbek-pattern">
        {/* Hero Section - Mobile Optimized with Space Management */}
        <section 
          className="relative overflow-hidden hero-mobile min-h-[500px] sm:min-h-[600px] md:min-h-[700px]"
          role="banner"
          aria-labelledby="hero-title"
        >
          {/* Header removed - Now using Layout's sticky header */}

          {/* Hero Content Layout - Mobile Optimized */}
          {isMobile ? (
            /* Mobile Layout: Robot takes most space, Spline text visible, consistent cards below */
            <div className="relative z-10">
              {/* Robot Section - Optimized for Mobile */}
              <div className="relative w-full mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center" style={{ height: isMobile ? '35vh' : '44.55vh', minHeight: isMobile ? '280px' : '324px', maxHeight: isMobile ? '320px' : '389px', width: '100%' }}>
                <SplineRobot />
            </div>
            
              {/* Text Content - Combined Interactive Section */}
              <div className="px-3 sm:px-4">
                {/* Combined Interactive Card with Enhanced Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-5"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(147, 51, 234, 0.2) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '2px solid rgba(34, 197, 94, 0.4)',
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated leaf pattern - Top Left */}
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-3 left-3 opacity-30"
                    style={{ pointerEvents: 'none' }}
                  >
                    <Leaf className="w-6 h-6 text-green-500" />
                  </motion.div>
                  
                  {/* Animated leaf pattern - Bottom Right */}
                  <motion.div
                    animate={{ rotate: [0, -6, 6, 0], scale: [1, 0.9, 1] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                    className="absolute bottom-3 right-3 opacity-25"
                    style={{ pointerEvents: 'none' }}
                  >
                    <Leaf className="w-5 h-5 text-green-500" />
                  </motion.div>
                  
                  {/* Decorative dots */}
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-4 right-6 w-2 h-2 rounded-full bg-green-400"
                    style={{ pointerEvents: 'none' }}
                  />
                  
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-4 left-6 w-1.5 h-1.5 rounded-full bg-blue-400"
                    style={{ pointerEvents: 'none' }}
                  />
                  
                  {/* Combined Text Content */}
                  <div className="relative z-10 space-y-2 sm:space-y-3">
                    {/* Subtitle */}
                    <motion.p 
                      className={cn("leading-relaxed text-gray-800 font-semibold", isMobile ? "text-xs" : "text-sm sm:text-base")}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {t('heroSubtitle')}
                    </motion.p>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
                    
                    {/* Description */}
                    <motion.p 
                      className={cn("leading-relaxed text-gray-700 font-medium", isMobile ? "text-[11px]" : "text-xs sm:text-sm")}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {t('heroDescription')}
                    </motion.p>
                  </div>
                  
                  {/* Enhanced Shine effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ transform: 'skewX(-20deg)', pointerEvents: 'none' }}
                  />
                  
                  {/* Pulsing glow effect */}
                  <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{ 
                      background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                      pointerEvents: 'none' 
                    }}
                  />
                </motion.div>
                
                {/* Compact Action Buttons - Horizontal, Space Efficient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={cn("flex flex-row gap-2", isMobile ? "gap-1.5" : "gap-2")}
                >
                  <Button 
                    onClick={scrollToAbout}
                    className={cn(
                      "flex-1 bg-green-600 text-white hover:bg-green-700 font-semibold shadow-md transition-all",
                      isMobile ? "text-[11px] py-2 px-2.5 min-h-[38px]" : "text-xs py-2 px-3 min-h-[40px]"
                    )}
                  >
                    {t('learnAboutProject')}
                  </Button>
                  <Link to="/actions" className="flex-1">
                    <Button 
                      variant="outline"
                      className={cn(
                        "w-full border-2 border-green-600 bg-white/90 backdrop-blur-sm text-green-700 hover:bg-green-50 font-semibold shadow-md transition-all",
                        isMobile ? "text-[11px] py-2 px-2.5 min-h-[38px]" : "text-xs py-2 px-3 min-h-[40px]"
                      )}
                    >
                      {t('findCollectionPoints')}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          ) : (
            /* Desktop Layout: Original design */
            <div className="relative z-10 px-3 sm:px-4 py-6 sm:py-8 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
              {/* Optimized Spline 3D Bot - Lazy loaded with Intersection Observer */}
              <SplineRobot />

              {/* Text Content - Overlaid on top with creative positioning */}
              <div className="relative z-20 flex flex-col justify-center items-center text-center min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]" style={{ pointerEvents: 'none' }}>
                {/* Spacer for top area - Bot will be visible in center */}
                <div className="flex-1 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] w-full" style={{ pointerEvents: 'none' }} />
                
                {/* Subtitle - Positioned below bot area with proper spacing */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="max-w-3xl mx-auto px-4 mb-4 sm:mb-6"
                >
                  <p className="text-base sm:text-xl md:text-2xl opacity-90 leading-relaxed hero-subtitle-mobile text-gray-700 font-medium">
                {t('heroSubtitle')}
              </p>
                </motion.div>
                
                {/* Description Card - Positioned below subtitle with creative background */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-2xl mx-auto px-4 mb-4 sm:mb-6"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div 
                    className="relative overflow-hidden rounded-2xl shadow-2xl p-4 sm:p-6"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    {/* Animated leaf pattern background */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 8, -8, 0],
                        scale: [1, 1.1, 1],
                        x: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-2 left-3 opacity-20"
                      style={{ pointerEvents: 'none' }}
                    >
                      <Leaf className="w-12 h-12 sm:w-16 sm:w-16 text-green-500" />
                    </motion.div>
                    
                    <motion.div
                      animate={{ 
                        rotate: [0, -6, 6, 0],
                        scale: [1, 0.9, 1],
                        x: [0, -4, 4, 0]
                      }}
                      transition={{ 
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.7
                      }}
                      className="absolute bottom-3 right-4 opacity-15"
                      style={{ pointerEvents: 'none' }}
                    >
                      <Leaf className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500" />
                    </motion.div>
                    
                    {/* Additional decorative leaf */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        opacity: [0.1, 0.2, 0.1]
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.2
                      }}
                      className="absolute top-1/2 left-1/4 opacity-10"
                      style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}
                    >
                      <Leaf className="w-8 h-8 text-green-400" />
                    </motion.div>
                    
                    {/* Decorative dots */}
                    <motion.div
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.3, 1]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-4 right-6 w-2 h-2 rounded-full bg-green-400"
                      style={{ pointerEvents: 'none' }}
                    />
                    
                    <motion.div
                      animate={{ 
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                      className="absolute bottom-4 left-6 w-1.5 h-1.5 rounded-full bg-blue-400"
                      style={{ pointerEvents: 'none' }}
                    />
                    
                    {/* Main description text */}
                    <div className="relative z-10">
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed hero-description-mobile text-gray-800 font-medium">
                  {t('heroDescription')}
                </p>
              </div>
              
                    {/* Shine effect overlay */}
                    <motion.div
                      animate={{ 
                        x: ['-100%', '200%']
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 3
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      style={{ transform: 'skewX(-20deg)', pointerEvents: 'none' }}
                    />
                  </div>
                </motion.div>
                
                {/* Action Buttons - Creative positioning */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto px-4"
                  style={{ pointerEvents: 'auto' }}
                >
                <Button 
                  onClick={scrollToAbout}
                    size="lg"
                    className="bg-green-600 text-white hover:bg-green-700 font-semibold text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ pointerEvents: 'auto' }}
                >
                  {t('learnAboutProject')}
                </Button>
                  <Link to="/actions" style={{ pointerEvents: 'auto' }}>
                  <Button 
                      size="lg"
                    variant="outline"
                      className="border-2 border-green-600 bg-white/90 backdrop-blur-sm text-green-700 hover:bg-green-50 w-full sm:w-auto font-semibold text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      style={{ pointerEvents: 'auto' }}
                  >
                    {t('findCollectionPoints')}
                  </Button>
                </Link>
                </motion.div>
              </div>
            </div>
          )}
          
          <UzbekPattern className="w-full h-1 sm:h-2 text-gray-300 opacity-50 relative z-10" />
        </section>

        {/* Main Content - Mobile Optimized */}
        <div className={cn("space-y-mobile", isMobile ? "p-2 space-y-2.5" : "p-2 sm:p-4 space-y-3 sm:space-y-6")}>
          {/* Welcome Back Section - Mobile Optimized */}
          <motion.section 
            className="text-white overflow-hidden relative shadow-xl rounded-xl"
            style={{
              background: displayBackground
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated background elements */}
            <motion.div 
              className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full"
              animate={{ 
                x: [25, 35, 25],
                y: [-25, -35, -25],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-12 h-12 sm:w-24 sm:h-24 bg-white/5 rounded-full"
              animate={{ 
                x: [-15, -25, -15],
                y: [15, 25, 15],
                scale: [1, 0.9, 1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            <div className={cn("relative z-10 welcome-mobile", isMobile ? "p-2.5" : "p-3 sm:p-6")}>
              {/* Welcome Header - Mobile Optimized */}
              <div className={cn("text-center w-full", isMobile ? "mb-2" : "mb-3 sm:mb-4")}>
                <h3 className={cn("font-semibold welcome-title-mobile", isMobile ? "text-xs" : "text-sm sm:text-xl")}>
                  {t('welcomeBackUser')}, <span className="text-yellow-300">{displayName}</span>!
                </h3>
                <p className={cn("text-white/80 mt-0.5 text-center welcome-subtitle-mobile", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>{t('continueImpactMessage')}</p>
              </div>

              <div className={cn("flex items-start justify-between", isMobile ? "mb-2" : "mb-3 sm:mb-4")}>
                <div className={cn("flex items-center", isMobile ? "space-x-1.5" : "space-x-2 sm:space-x-4")}>
                  <div className="relative">
                    <EnhancedAvatar
                      emoji={displayAvatar}
                      image={getAvatarImage(displayAvatar)}
                      size={isMobile ? "lg" : "xl"}
                      glowColor="green"
                      showCrown={true}
                      profileFrame={userProgress?.profileFrame}
                      noBackground={true}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={cn("font-bold user-name-mobile truncate", isMobile ? "text-xs" : "text-sm sm:text-xl")}>{displayName}</h2>
                    <p className={cn("text-white/80 user-role-mobile", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>{t('climateHero')}</p>
                    <div className={cn("flex items-center text-white/70 user-info-mobile", isMobile ? "space-x-1.5 mt-0.5 text-[9px]" : "space-x-2 sm:space-x-3 mt-1 sm:mt-2 text-xs")}>
                      <div className="flex items-center truncate">
                        <MapPin className={cn("mr-0.5 flex-shrink-0", isMobile ? "h-2 w-2" : "h-2 w-2 sm:h-3 sm:w-3")} />
                        <span className="truncate">{USER_DATA.location}</span>
                      </div>
                      <div className="flex items-center truncate">
                        <School className={cn("mr-0.5 flex-shrink-0", isMobile ? "h-2 w-2" : "h-2 w-2 sm:h-3 sm:w-3")} />
                        <span className="truncate">{USER_DATA.school}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className={cn("text-white hover:bg-white/20 p-0 flex-shrink-0", isMobile ? "h-7 w-7" : "h-6 w-6 sm:h-10 sm:w-10")}
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className={cn(isMobile ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")} />
                </Button>
              </div>

              {/* Coins and Points - Icon-Focused Creative Design */}
              <div className={cn("grid grid-cols-2", isMobile ? "gap-1.5 mb-1.5" : "gap-2 sm:gap-4 mb-3 sm:mb-4")}>
                {/* Eco Coins Card - Golden Theme */}
                <motion.div 
                  className={cn(
                    "relative overflow-hidden rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md",
                    "bg-gradient-to-br from-yellow-500/30 via-yellow-400/25 to-amber-500/20",
                    "border-yellow-400/50",
                    isMobile ? "p-1.5" : "p-3 sm:p-4"
                  )}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                  
                  <div className="relative z-10">
                    {/* Icon - Large and Prominent */}
                    <div className={cn("flex items-center justify-center", isMobile ? "mb-1" : "mb-2")}>
                      <Coins className={cn("text-yellow-200 drop-shadow-lg", isMobile ? "h-6 w-6" : "h-10 w-10 sm:h-12 sm:w-12")} />
                    </div>
                    
                    {/* Label */}
                    <div className={cn("text-center", isMobile ? "mb-0.5" : "mb-1")}>
                      <span className={cn(
                        "font-semibold text-white/95 drop-shadow-sm",
                        isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                      )}>
                        {t('ecoCoinsLabel')}
                      </span>
                    </div>
                    
                    {/* Value - Bold and Prominent */}
                    <div className={cn(
                      "text-center font-bold",
                      "bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 bg-clip-text text-transparent",
                      "drop-shadow-lg",
                      isMobile ? "text-base" : "text-xl sm:text-2xl"
                    )}>
                      {displayEcoCoins}
                    </div>
                  </div>
                </motion.div>

                {/* Eco Points Card - Blue/Cyan Theme */}
                <motion.div 
                  className={cn(
                    "relative overflow-hidden rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md",
                    "bg-gradient-to-br from-blue-500/30 via-cyan-400/25 to-blue-600/20",
                    "border-blue-400/50",
                    isMobile ? "p-1.5" : "p-3 sm:p-4"
                  )}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                  
                  <div className="relative z-10">
                    {/* Icon - Large and Prominent */}
                    <div className={cn("flex items-center justify-center", isMobile ? "mb-1" : "mb-2")}>
                      <Star className={cn("text-blue-200 drop-shadow-lg fill-blue-200", isMobile ? "h-6 w-6" : "h-10 w-10 sm:h-12 sm:w-12")} />
                    </div>
                    
                    {/* Label */}
                    <div className={cn("text-center", isMobile ? "mb-0.5" : "mb-1")}>
                      <span className={cn(
                        "font-semibold text-white/95 drop-shadow-sm",
                        isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                      )}>
                        {t('ecoPointsLabel')}
                      </span>
                    </div>
                    
                    {/* Value - Bold and Prominent */}
                    <div className={cn(
                      "text-center font-bold",
                      "bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-400 bg-clip-text text-transparent",
                      "drop-shadow-lg",
                      isMobile ? "text-sm" : "text-xl sm:text-2xl"
                    )}>
                      {displayEcoPoints.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Level Progress - Connected to Profile Page */}
              <Link to="/profile" className="block">
                <motion.div 
                  className={cn(
                    "bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 shadow-lg cursor-pointer",
                    isMobile ? "p-2" : "p-4"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center sm:justify-between",
                    isMobile ? "mb-1.5" : "mb-4"
                  )}>
                    <div className={cn("flex items-center flex-1", isMobile ? "mb-1.5" : "mb-3 sm:mb-0")}>
                      <motion.div 
                        className={cn("flex items-center justify-center", isMobile ? "mr-1.5" : "mr-3")}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Trophy className={cn(
                          "text-yellow-300",
                          isMobile ? "h-5 w-5" : "h-6 w-6"
                        )} />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <div className={cn("flex items-center justify-between", isMobile ? "mb-0.5" : "mb-1")}>
                          <p className={cn(
                            "opacity-90 font-medium",
                            isMobile ? "text-[10px] leading-tight" : "text-sm"
                          )}>
                            {t('levelFifteen')} {currentLevel}
                          </p>
                          <Badge className={cn(
                            "bg-gradient-to-r from-white/20 to-white/10 text-white border-white/30 backdrop-blur-sm shadow-lg",
                            isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs px-3 py-1.5"
                          )}>
                            <Sparkles className={cn(isMobile ? "h-2 w-2 mr-0.5" : "h-3 w-3 mr-1")} />
                            {displayEcoPoints.toLocaleString()} {t('pts', { ns: 'profile' })}
                          </Badge>
                        </div>
                        <p className={cn(
                          "font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent",
                          isMobile ? "text-xs leading-tight" : "text-base"
                        )}>
                          {t('sustainabilityExpert')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(isMobile ? "space-y-1" : "space-y-3")}>
                    <div className={cn(
                      "flex justify-between opacity-90 font-medium",
                      isMobile ? "text-[9px] leading-tight" : "text-xs"
                    )}>
                      <span className="truncate mr-1">Progress to Level {currentLevel + 1}</span>
                      <span className="flex-shrink-0">{Math.round(levelProgress)}%</span>
                    </div>
                    
                    {/* Elegant Liquid Wave Progress Bar - Same as Profile Page */}
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
                    
                    <motion.p 
                      className={cn(
                        "opacity-80 font-medium",
                        isMobile ? "text-[9px] leading-tight mt-0.5" : "text-xs mt-1"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <span className="text-yellow-200">{pointsToNext}</span> points to next level
                    </motion.p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.section>

          {/* Global Impact Stats - Mobile Optimized */}
          <section aria-labelledby="impact-title">
            <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-3 sm:mb-4")}>
              <h2 id="impact-title" className={cn("font-semibold flex items-center mx-auto section-title-mobile", isMobile ? "text-sm" : "text-lg sm:text-xl")}>
                <Award className={cn("mr-2 text-green-600 icon-md-mobile", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                <strong>{t('ourImpact')}</strong>
              </h2>
            </div>
            <div className={cn("grid grid-cols-2 gap-mobile", isMobile ? "gap-1.5" : "gap-2 sm:gap-3")}>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className="p-2 sm:p-3 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div className="p-1 sm:p-1.5 rounded-lg text-green-600 bg-green-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-5 sm:w-5 icon-sm-mobile">
                        <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"></path>
                        <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"></path>
                        <path d="m14 16-3 3 3 3"></path>
                        <path d="M8.293 13.596 7.196 9.5 3.1 10.598"></path>
                        <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"></path>
                        <path d="m13.378 9.633 4.096 1.098 1.097-4.096"></path>
                      </svg>
                    </div>
                    <div className={cn("flex items-center text-green-600", isMobile ? "text-[9px]" : "text-xs")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("mr-0.5", isMobile ? "h-1.5 w-1.5" : "h-2 w-2 sm:h-3 sm:w-3")}>
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+12%
                    </div>
                  </div>
                  <div className={cn("flex-1 flex flex-col", isMobile ? "space-y-0.5" : "space-y-0.5 sm:space-y-1")}>
                    <p className={cn("font-bold text-gray-900 leading-tight impact-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-xl")}>2.5Kkg</p>
                    <p className={cn("font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile", isMobile ? "text-[10px]" : "text-xs")}>{t('plasticRubberRecycledTitle')}</p>
                    <p className={cn("text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile", isMobile ? "text-[9px]" : "text-xs")}>{t('transformedIntoEcoTiles')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className={cn("h-full flex flex-col", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                  <div className={cn("flex items-start justify-between", isMobile ? "mb-1" : "mb-1 sm:mb-2")}>
                    <div className={cn("rounded-lg text-blue-600 bg-blue-50", isMobile ? "p-0.5" : "p-1 sm:p-1.5")}>
                      <Users className={cn("icon-sm-mobile", isMobile ? "h-2.5 w-2.5" : "h-3 w-3 sm:h-5 sm:w-5")} />
                    </div>
                    <div className={cn("flex items-center text-green-600", isMobile ? "text-[9px]" : "text-xs")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("mr-0.5", isMobile ? "h-1.5 w-1.5" : "h-2 w-2 sm:h-3 sm:w-3")}>
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+8%
                    </div>
                  </div>
                  <div className={cn("flex-1 flex flex-col", isMobile ? "space-y-0.5" : "space-y-0.5 sm:space-y-1")}>
                    <p className={cn("font-bold text-gray-900 leading-tight impact-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-xl")}>1.3K</p>
                    <p className={cn("font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile", isMobile ? "text-[10px]" : "text-xs")}>{t('ecoWarriorsActiveTitle')}</p>
                    <p className={cn("text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile", isMobile ? "text-[9px]" : "text-xs")}>{t('citizensSchoolsUnited')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className={cn("h-full flex flex-col", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                  <div className={cn("flex items-start justify-between", isMobile ? "mb-1" : "mb-1 sm:mb-2")}>
                    <div className={cn("rounded-lg text-purple-600 bg-purple-50", isMobile ? "p-0.5" : "p-1 sm:p-1.5")}>
                      <Leaf className={cn("icon-sm-mobile", isMobile ? "h-2.5 w-2.5" : "h-3 w-3 sm:h-5 sm:w-5")} />
                    </div>
                    <div className={cn("flex items-center text-green-600", isMobile ? "text-[9px]" : "text-xs")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("mr-0.5", isMobile ? "h-1.5 w-1.5" : "h-2 w-2 sm:h-3 sm:w-3")}>
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+15%
                    </div>
                  </div>
                  <div className={cn("flex-1 flex flex-col", isMobile ? "space-y-0.5" : "space-y-0.5 sm:space-y-1")}>
                    <p className={cn("font-bold text-gray-900 leading-tight impact-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-xl")}>3</p>
                    <p className={cn("font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile", isMobile ? "text-[10px]" : "text-xs")}>{t('communityProjectsTitle')}</p>
                    <p className={cn("text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile", isMobile ? "text-[9px]" : "text-xs")}>{t('pilotProjectsTransforming')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className={cn("h-full flex flex-col", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                  <div className={cn("flex items-start justify-between", isMobile ? "mb-1" : "mb-1 sm:mb-2")}>
                    <div className={cn("rounded-lg text-green-600 bg-green-50", isMobile ? "p-0.5" : "p-1 sm:p-1.5")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("icon-sm-mobile", isMobile ? "h-2.5 w-2.5" : "h-3 w-3 sm:h-5 sm:w-5")}>
                        <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"></path>
                        <path d="M12 22v-3"></path>
                      </svg>
                    </div>
                    <div className={cn("flex items-center text-green-600", isMobile ? "text-[9px]" : "text-xs")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("mr-0.5", isMobile ? "h-1.5 w-1.5" : "h-2 w-2 sm:h-3 sm:w-3")}>
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+22%
                    </div>
                  </div>
                  <div className={cn("flex-1 flex flex-col", isMobile ? "space-y-0.5" : "space-y-0.5 sm:space-y-1")}>
                    <p className={cn("font-bold text-gray-900 leading-tight impact-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-xl")}>156</p>
                    <p className={cn("font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile", isMobile ? "text-[10px]" : "text-xs")}>{t('treesPlantedTitle')}</p>
                    <p className={cn("text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile", isMobile ? "text-[9px]" : "text-xs")}>{t('growingGreenSpaces')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions - Mobile Optimized */}
          <section aria-labelledby="actions-title">
            <Card className="card-mobile">
              <CardHeader className="card-header-mobile">
                <CardTitle id="actions-title" className={cn("flex items-center justify-center section-title-mobile", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                  <Users className={cn("mr-2 text-blue-600 icon-md-mobile", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                  <strong>{t('takeAction')}</strong>
                </CardTitle>
              </CardHeader>
              <CardContent className={cn("grid grid-cols-2 card-content-mobile gap-mobile", isMobile ? "gap-1.5" : "gap-2 sm:gap-3")}>
                <Link to="/actions">
                  <Button className={cn("h-auto w-full flex-col bg-green-600 hover:bg-green-700 eco-card-hover action-button-mobile", isMobile ? "min-h-[2.5rem] p-1.5" : "min-h-[3rem] sm:min-h-[5rem] p-2 sm:p-3")}>
                    <img src="/images/location_5174778.png" alt="" className={cn("object-contain", isMobile ? "w-5 h-5 mb-0.5" : "w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2")} aria-hidden="true" loading="lazy" />
                    <span className={cn("font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile", isMobile ? "text-[10px]" : "text-xs")}>
                      {t('findCollectionPoints')}
                    </span>
                  </Button>
                </Link>
                <Link to="/vote">
                  <Button className={cn("h-auto w-full flex-col bg-blue-600 hover:bg-blue-700 eco-card-hover action-button-mobile", isMobile ? "min-h-[2.5rem] p-1.5" : "min-h-[3rem] sm:min-h-[5rem] p-2 sm:p-3")}>
                    <img src="/images/vote_15269306.png" alt="" className={cn("object-contain", isMobile ? "w-5 h-5 mb-0.5" : "w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2")} aria-hidden="true" loading="lazy" />
                    <span className={cn("font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile", isMobile ? "text-[10px]" : "text-xs")}>
                      {t('voteOnProjects')}
                    </span>
                  </Button>
                </Link>
                <Link to="/actions">
                  <Button className={cn("h-auto w-full flex-col bg-purple-600 hover:bg-purple-700 eco-card-hover action-button-mobile", isMobile ? "min-h-[2.5rem] p-1.5" : "min-h-[3rem] sm:min-h-[5rem] p-2 sm:p-3")}>
                    <img src="/images/event.png" alt="" className={cn("object-contain", isMobile ? "w-5 h-5 mb-0.5" : "w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2")} aria-hidden="true" loading="lazy" />
                    <span className={cn("font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile", isMobile ? "text-[10px]" : "text-xs")}>
                      {t('eventsButton')}
                    </span>
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button className={cn("h-auto w-full flex-col bg-orange-600 hover:bg-orange-700 eco-card-hover action-button-mobile", isMobile ? "min-h-[2.5rem] p-1.5" : "min-h-[3rem] sm:min-h-[5rem] p-2 sm:p-3")}>
                    <img src="/images/eco-bag_10158203.png" alt="" className={cn("object-contain", isMobile ? "w-5 h-5 mb-0.5" : "w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2")} aria-hidden="true" loading="lazy" />
                    <span className={cn("font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile", isMobile ? "text-[10px]" : "text-xs")}>
                      {t('shopButton')}
                    </span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* About Section - Enhanced with Interactive Elements */}
          <section id="about-section" className="scroll-mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 card-mobile shadow-lg border-2 border-green-100/50 overflow-hidden">
                <CardHeader className={cn("card-header-mobile bg-gradient-to-r from-green-600 to-emerald-600 text-white relative overflow-hidden", isMobile ? "p-3" : "p-4 sm:p-6")}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
                  <CardTitle className={cn("flex items-center justify-center section-title-mobile relative z-10", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className={cn(isMobile ? "mr-1.5" : "mr-2")}
                    >
                      <Leaf className={cn("text-white icon-lg-mobile drop-shadow-lg", isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6")} />
                    </motion.div>
                    {t('aboutZaminatProject')}
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn("text-center card-content-mobile", isMobile ? "p-3 space-y-3" : "p-4 sm:p-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6")}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                  >
                    <p className={cn("text-gray-700 leading-relaxed text-center break-words hyphens-auto about-description-mobile font-medium", isMobile ? "text-xs" : "text-sm sm:text-base md:text-lg")}>
                      <strong className="text-green-700">ZAMINAT.eco</strong> {t('aboutZaminatDescription')}
                    </p>
                  </motion.div>
                  
                  <div className={cn("grid md:grid-cols-2", isMobile ? "gap-3" : "gap-4 sm:gap-6")}>
                    {/* Goals 2026 Card - Enhanced */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="group"
                    >
                      <div className={cn("bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 about-goals-mobile h-full", isMobile ? "p-3" : "p-4 sm:p-6")}>
                        <div className={cn("flex items-center justify-center", isMobile ? "gap-1.5 mb-3" : "gap-2 mb-4")}>
                          <div className={cn("bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300", isMobile ? "p-1.5" : "p-2")}>
                            <Target className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                          </div>
                          <h3 className={cn("font-bold text-green-800 about-goals-title-mobile", isMobile ? "text-xs" : "text-base sm:text-lg")}>
                            {t('ourGoalsFor2026')}
                          </h3>
                        </div>
                        <ul className={cn("text-gray-700 text-left about-goals-list-mobile", isMobile ? "text-[10px] space-y-1.5" : "text-xs sm:text-sm space-y-2.5 sm:space-y-3")}>
                          {[
                            { icon: Recycle, text: t('recycle1000Tons'), color: 'text-green-600' },
                            { icon: Users, text: t('engage50000Users'), color: 'text-green-600' },
                            { icon: Award, text: t('complete100Projects'), color: 'text-green-600' },
                            { icon: TreePine, text: t('plant10000Trees'), color: 'text-green-600' }
                          ].map((item, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className={cn("flex items-start break-words group/item", isMobile ? "gap-1.5" : "gap-2.5 sm:gap-3")}
                            >
                              <item.icon className={cn("mt-0.5 flex-shrink-0", item.color, "group-hover/item:scale-110 transition-transform", isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")} />
                              <span className="flex-1">{item.text}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                    
                    {/* Current Progress Card - Enhanced with Animated Counters */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="group"
                    >
                      <div className={cn("bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 about-goals-mobile h-full", isMobile ? "p-3" : "p-4 sm:p-6")}>
                        <div className={cn("flex items-center justify-center", isMobile ? "gap-1.5 mb-3" : "gap-2 mb-4")}>
                          <div className={cn("bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300", isMobile ? "p-1.5" : "p-2")}>
                            <TrendingUp className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                          </div>
                          <h3 className={cn("font-bold text-blue-800 about-goals-title-mobile", isMobile ? "text-xs" : "text-base sm:text-lg")}>
                            {t('currentProgressStatus')}
                          </h3>
                        </div>
                        <div className={cn("text-left about-goals-list-mobile", isMobile ? "space-y-2" : "space-y-3 sm:space-y-4")}>
                          {[
                            { 
                              icon: Recycle, 
                              label: t('recycled2500kg'), 
                              value: globalStats.totalWasteCollected, 
                              suffix: ' kg',
                              // wasteTarget is in kg (1,000,000 kg = 1,000 tons), so no conversion needed
                              progress: (globalStats.totalWasteCollected / goals2026.wasteTarget) * 100,
                              color: 'text-blue-600',
                              bgColor: 'bg-blue-100'
                            },
                            { 
                              icon: Users, 
                              label: t('active1250Members'), 
                              value: globalStats.totalUsers, 
                              suffix: '+',
                              progress: (globalStats.totalUsers / goals2026.usersTarget) * 100,
                              color: 'text-blue-600',
                              bgColor: 'bg-blue-100'
                            },
                            { 
                              icon: Award, 
                              label: t('launched3Projects'), 
                              value: globalStats.totalProjects, 
                              suffix: '',
                              progress: (globalStats.totalProjects / goals2026.projectsTarget) * 100,
                              color: 'text-blue-600',
                              bgColor: 'bg-blue-100'
                            },
                            { 
                              icon: TreePine, 
                              label: t('planted156Trees'), 
                              value: globalStats.treesPlanted, 
                              suffix: '',
                              progress: (globalStats.treesPlanted / goals2026.treesTarget) * 100,
                              color: 'text-blue-600',
                              bgColor: 'bg-blue-100'
                            }
                          ].map((stat, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className="space-y-1.5 group/stat"
                            >
                              <div className={cn("flex items-center justify-between", isMobile ? "gap-1.5" : "gap-2")}>
                                <div className={cn("flex items-center flex-1 min-w-0", isMobile ? "gap-1.5" : "gap-2")}>
                                  <stat.icon className={cn("flex-shrink-0", stat.color, "group-hover/stat:scale-110 transition-transform", isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")} />
                                  <span className={cn("text-gray-700 break-words flex-1", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>{stat.label}</span>
                                </div>
                                <div className={cn("rounded-md font-bold", stat.bgColor, stat.color, isMobile ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs sm:text-sm")}>
                                  <AnimatedCounter 
                                    end={stat.value} 
                                    suffix={stat.suffix}
                                    className={cn(isMobile ? "text-[10px]" : "text-xs sm:text-sm")}
                                  />
                                </div>
                              </div>
                              <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", isMobile ? "h-1" : "h-1.5 sm:h-2")}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${Math.min(stat.progress, 100)}%` }}
                                  viewport={{ once: true }}
                                  transition={{ 
                                    duration: 1, 
                                    delay: 0.5 + idx * 0.1,
                                    ease: "easeOut"
                                  }}
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                />
                              </div>
                              <div className={cn("text-gray-500", isMobile ? "text-[9px]" : "text-[10px] sm:text-xs")}>
                                {stat.progress.toFixed(1)}% {t('completed', { defaultValue: 'complete' })}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center pt-2"
                  >
                    <Link to="/about">
                      <Button className={cn(
                        "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto",
                        isMobile ? "text-xs py-2 px-4" : "text-sm sm:text-base py-2.5 sm:py-3 px-6 sm:px-8"
                      )}>
                        <span>{t('readFullStoryButton')}</span>
                        <ArrowRight className={cn("group-hover:translate-x-1 transition-transform", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

                {/* Navigation Links Section - Mobile Optimized */}
                <motion.div 
                  className="mt-8 pt-6 border-t border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
                    {t('exploreMore')}
                  </h3>
                  {isMobile ? (
                    /* Mobile: Single Row Horizontal Scroll - Optimized */
                    <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                      {/* Partners Link */}
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="flex-shrink-0"
                        style={{ width: 'calc(100vw - 2rem)', maxWidth: '280px', minWidth: '260px' }}
                      >
                        <Link to="/partners">
                          <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-white">
                            <CardContent className="p-3 sm:p-4 text-center flex flex-col h-full min-h-[200px]">
                              <img src="/images/partners_7967044.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 object-contain" loading="lazy" />
                              <h4 className="font-semibold text-green-800 mb-1.5 text-sm sm:text-base">{t('ourPartnersLink')}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 mb-3 flex-1 leading-relaxed">
                                {t('discoverExclusiveDiscounts')}
                              </p>
                              <Button 
                                size="sm" 
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-xs sm:text-sm py-2 h-auto"
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                                {t('viewPartners')}
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>

                      {/* Team Link */}
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="flex-shrink-0"
                        style={{ width: 'calc(100vw - 2rem)', maxWidth: '280px', minWidth: '260px' }}
                      >
                        <Link to="/team">
                          <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                            <CardContent className="p-3 sm:p-4 text-center flex flex-col h-full min-h-[200px]">
                              <img src="/images/meet-the-team_15916616.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 object-contain" loading="lazy" />
                              <h4 className="font-semibold text-blue-800 mb-1.5 text-sm sm:text-base">{t('meetOurTeam')}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 mb-3 flex-1 leading-relaxed">
                                {t('passionatePeopleBehind')}
                              </p>
                              <Button 
                                size="sm" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm py-2 h-auto"
                              >
                                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                                {t('meetTeam')}
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>

                      {/* Contact Link */}
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="flex-shrink-0"
                        style={{ width: 'calc(100vw - 2rem)', maxWidth: '280px', minWidth: '260px' }}
                      >
                        <Link to="/contacts">
                          <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                            <CardContent className="p-3 sm:p-4 text-center flex flex-col h-full min-h-[200px]">
                              <img src="/images/contact-us.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 object-contain" loading="lazy" />
                              <h4 className="font-semibold text-purple-800 mb-1.5 text-sm sm:text-base">{t('contactUsButton')}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 mb-3 flex-1 leading-relaxed">
                                {t('getInTouchPartnerships')}
                              </p>
                              <Button 
                                size="sm" 
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm py-2 h-auto"
                              >
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                                {t('contactUsButton')}
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    </div>
                  ) : (
                    /* Desktop: Grid Layout */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Partners Link */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to="/partners">
                        <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-white">
                          <CardContent className="p-4 text-center">
                              <img src="/images/partners_7967044.png" alt="" className="w-12 h-12 mx-auto mb-3 object-contain" loading="lazy" />
                            <h4 className="font-semibold text-green-800 mb-2">{t('ourPartnersLink')}</h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {t('discoverExclusiveDiscounts')}
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t('viewPartners')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    {/* Team Link */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to="/team">
                        <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                          <CardContent className="p-4 text-center">
                              <img src="/images/meet-the-team_15916616.png" alt="" className="w-12 h-12 mx-auto mb-3 object-contain" loading="lazy" />
                            <h4 className="font-semibold text-blue-800 mb-2">{t('meetOurTeam')}</h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {t('passionatePeopleBehind')}
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              {t('meetTeam')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    {/* Contact Link */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to="/contacts">
                        <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                          <CardContent className="p-4 text-center">
                              <img src="/images/contact-us.png" alt="" className="w-12 h-12 mx-auto mb-3 object-contain" loading="lazy" />
                            <h4 className="font-semibold text-purple-800 mb-2">{t('contactUsButton')}</h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {t('getInTouchPartnerships')}
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {t('contactUsButton')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  </div>
                  )}
                </motion.div>
          </section>

          {/* Latest News & Education - Mobile Optimized */}
          <section aria-labelledby="news-title">
            <Card className="card-mobile">
              <CardHeader className={cn("card-header-mobile", isMobile ? "p-3" : "p-4 sm:p-6")}>
                <div className="flex items-center justify-between">
                  <CardTitle id="news-title" className={cn("mx-auto section-title-mobile", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                    <strong>{t('latestNewsEducation')}</strong>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className={cn("card-content-mobile", isMobile ? "p-3 space-y-2" : "space-y-3 sm:space-y-4")}>
                {newsItems.slice(0, 3).map((news) => (
                  <article key={news.id} className={cn("border-l-4 border-green-500 eco-card-hover news-item-mobile", isMobile ? "pl-2 py-1.5" : "pl-3 sm:pl-4 py-1 sm:py-2")}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn("font-medium text-gray-900 break-words news-title-mobile", isMobile ? "text-xs mb-0.5" : "text-sm sm:text-base mb-1")}>
                          <strong>{news.title}</strong>
                        </h3>
                        <p className={cn("text-gray-600 leading-relaxed break-words hyphens-auto news-summary-mobile", isMobile ? "text-[10px] mb-1" : "text-xs sm:text-sm mb-2")}>
                          {news.summary}
                        </p>
                        <div className={cn("flex items-center flex-wrap", isMobile ? "space-x-1.5" : "space-x-2")}>
                          <Badge variant="outline" className={cn("news-meta-mobile", isMobile ? "text-[9px] px-1 py-0" : "text-xs")}>
                            {news.category}
                          </Badge>
                          <span className={cn("text-gray-500 news-meta-mobile", isMobile ? "text-[9px]" : "text-xs")}>
                            <strong>{news.readTime} {t('minReadTime')}</strong>
                          </span>
                          <span className={cn("text-gray-500 break-words news-meta-mobile", isMobile ? "text-[9px]" : "text-xs")}>
                            {t('byAuthor')} {news.author}
                          </span>
                        </div>
                      </div>
                      <span className={cn("flex-shrink-0", isMobile ? "text-base ml-1.5" : "text-lg sm:text-2xl ml-2 sm:ml-3")} aria-hidden="true">{news.image}</span>
                    </div>
                  </article>
                ))}
                <div className={cn("text-center", isMobile ? "mt-2" : "mt-3 sm:mt-4")}>
                  <Link to="/stories">
                    <Button variant="outline" className={cn(isMobile ? "text-xs py-1.5 px-3" : "text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6")}>
                      {t('viewAllNews')} <ArrowRight className={cn("ml-1", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Personal Progress - Mobile Optimized */}
          <section aria-labelledby="progress-title">
            <Card className="card-mobile">
              <CardHeader className={cn("card-header-mobile", isMobile ? "p-3" : "p-4 sm:p-6")}>
                <CardTitle id="progress-title" className={cn("text-center section-title-mobile", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                  <strong>{t('yourEnvironmentalImpact')}</strong>
                </CardTitle>
              </CardHeader>
              <CardContent className={cn("card-content-mobile", isMobile ? "p-2" : "p-4 sm:p-6")}>
                <div className={cn("grid grid-cols-3 text-center progress-grid-mobile", isMobile ? "gap-1.5" : "gap-2 sm:gap-4")}>
                  <div className={cn("bg-green-50 rounded-lg progress-item-mobile", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                    <p className={cn("font-bold text-green-600 progress-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                      85.5kg
                    </p>
                    <p className={cn("text-gray-600 break-words hyphens-auto progress-label-mobile", isMobile ? "text-[9px]" : "text-xs")}>
                      <strong>{t('wasteCollectedLabel')}</strong>
                    </p>
                  </div>
                  <div className={cn("bg-blue-50 rounded-lg progress-item-mobile", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                    <p className={cn("font-bold text-blue-600 progress-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                      3
                    </p>
                    <p className={cn("text-gray-600 break-words hyphens-auto progress-label-mobile", isMobile ? "text-[9px]" : "text-xs")}>
                      <strong>{t('badgesEarnedLabel')}</strong>
                    </p>
                  </div>
                  <div className={cn("bg-purple-50 rounded-lg progress-item-mobile", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                    <p className={cn("font-bold text-purple-600 progress-value-mobile", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                      250
                    </p>
                    <p className={cn("text-gray-600 break-words hyphens-auto progress-label-mobile", isMobile ? "text-[9px]" : "text-xs")}>
                      <strong>{t('ecoCoinsProgress')}</strong>
                    </p>
                  </div>
                </div>
                <div className={cn("bg-yellow-50 rounded-lg text-center", isMobile ? "mt-2 p-2" : "mt-3 sm:mt-4 p-2 sm:p-3")}>
                  <p className={cn("text-gray-700 text-center break-words hyphens-auto", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>
                    {t('keepItUpMessage')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Bottom Action Buttons - Mobile Optimized */}
          <section className="text-center py-4 sm:py-8 space-y-4 sm:space-y-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl bottom-section-mobile">
            <div className="space-y-3 sm:space-y-4">
              <img src="/images/compost_13285420.png" alt="" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto object-contain" loading="lazy" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 bottom-title-mobile">
                {t('readyForBiggerImpact')}
              </h2>
              <div className="max-w-none mx-auto">
                <p className="text-gray-600 leading-relaxed text-center break-words hyphens-auto text-sm sm:text-base bottom-description-mobile">
                  {t('joinVolunteerCampaigns')}
                </p>
              </div>
            </div>
            
            {/* Bottom Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
              <Link to="/actions" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-lg bottom-button-mobile">
                  {t('joinNextCleanupEvent')}
                </Button>
              </Link>
              <Link to="/about" className="flex-1">
                <Button variant="outline" className="w-full py-3 sm:py-4 text-sm sm:text-lg font-semibold border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-lg bottom-button-mobile">
                  {t('learnAboutZaminatProject')}
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings', { defaultValue: 'Settings' })}
            </DialogTitle>
            <DialogDescription>
              {t('settingsDescription', { defaultValue: 'Manage your account settings and preferences' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Name Change Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">
                {t('changeName', { defaultValue: 'Change Your Name' })}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-firstName" className="text-sm font-medium">
                    {t('welcome.firstName', { defaultValue: 'First Name' })} 
                    <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
                  </Label>
                  <Input
                    id="settings-firstName"
                    type="text"
                    placeholder={t('welcome.firstNamePlaceholder', { defaultValue: 'Enter your first name' })}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-lastName" className="text-sm font-medium">
                    {t('welcome.lastName', { defaultValue: 'Last Name' })} 
                    <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
                  </Label>
                  <Input
                    id="settings-lastName"
                    type="text"
                    placeholder={t('welcome.lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <Button
                  onClick={() => {
                    // If both fields are empty, show error
                    if (!firstName.trim() && !lastName.trim()) {
                      toast.error(t('nameRequired', { defaultValue: 'Please enter at least a first name' }));
                      return;
                    }

                    // Save exactly what user entered - no defaults
                    // If only first name is provided, lastName will be empty string (no default last name added)
                    saveUserName(firstName.trim() || '', lastName.trim() || '');
                    
                    // Update user progress with new name
                    const nameData = getUserNameData();
                    const updatedProgress = { ...userProgress, name: nameData.fullName };
                    setUserProgress(updatedProgress);
                    
                    toast.success(t('nameUpdated', { defaultValue: 'Name updated successfully!' }));
                    setIsSettingsOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  {t('saveName', { defaultValue: 'Save Name' })}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}