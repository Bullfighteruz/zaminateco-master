import { Bell, Leaf, Award, Users, ArrowRight, Settings, Coins, Star, Trophy, Crown, MapPin, School, ExternalLink, UserCheck, Phone, Mail, Sparkles } from 'lucide-react';
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
import '../styles/mobile-responsive.css';

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
  const { t } = useTranslation();
  const [userProgress, setUserProgress] = useState<UserProgress>(() => loadUserProgress());
  const isMobile = useIsMobile();

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
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Use userProgress data if available, otherwise fall back to USER_DATA - Memoized for performance
  const displayData = useMemo(() => {
    const ecoCoins = userProgress?.ecoCoins ?? USER_DATA.ecoCoins;
    const ecoPoints = userProgress?.ecoPoints ?? USER_DATA.ecoPoints;
    const name = userProgress?.name ?? USER_DATA.name;
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
          className="relative overflow-hidden hero-mobile min-h-[600px] sm:min-h-[700px] md:min-h-[800px]"
          role="banner"
          aria-labelledby="hero-title"
        >
          {/* Header with Logo - Mobile Optimized - Fixed at top */}
          <header className="flex items-center justify-between p-4 relative z-30 header-mobile" style={{ pointerEvents: 'auto', position: 'relative', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/logo.png" 
                alt="ZAMINAT.eco Logo" 
                className="h-8 w-8 sm:h-12 sm:w-12 header-logo-mobile"
                loading="eager"
              />
              <div>
                <h1 className="text-sm sm:text-xl font-bold header-title-mobile text-gray-900">{t('appName')}</h1>
                <p className="text-xs sm:text-sm opacity-90 header-tagline-mobile text-gray-700">{t('tagline')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <LanguageSwitcher />
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-gray-200/80 border-gray-300 text-gray-900 hover:bg-gray-300/80 h-8 w-8 p-0 sm:h-10 sm:w-auto sm:px-4"
                aria-label={t('notifications')}
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </header>

          {/* Hero Content Layout - Mobile Optimized */}
          {isMobile ? (
            /* Mobile Layout: Robot takes most space, Spline text visible, consistent cards below */
            <div className="relative z-10">
              {/* Robot Section - Properly Sized to Show Full Spline Scene Text */}
              <div className="relative w-full mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center" style={{ height: '44.55vh', minHeight: '324px', maxHeight: '389px', width: '100%' }}>
                <SplineRobot />
            </div>
            
              {/* Text Content - Combined Interactive Section */}
              <div className="px-3 sm:px-4">
                {/* Combined Interactive Card with Enhanced Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative overflow-hidden rounded-2xl shadow-2xl p-4 sm:p-5"
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
                  <div className="relative z-10 space-y-3">
                    {/* Subtitle */}
                    <motion.p 
                      className="text-sm sm:text-base leading-relaxed text-gray-800 font-semibold"
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
                      className="text-xs sm:text-sm leading-relaxed text-gray-700 font-medium"
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
                  className="flex flex-row gap-2"
                >
                  <Button 
                    onClick={scrollToAbout}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700 font-semibold text-xs py-2 px-3 shadow-md transition-all h-auto min-h-[40px]"
                  >
                    {t('learnAboutProject')}
                  </Button>
                  <Link to="/actions" className="flex-1">
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-green-600 bg-white/90 backdrop-blur-sm text-green-700 hover:bg-green-50 font-semibold text-xs py-2 px-3 shadow-md transition-all h-auto min-h-[40px]"
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
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-6 space-y-mobile">
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
            
            <div className="p-3 sm:p-6 relative z-10 welcome-mobile">
              {/* Welcome Header - Mobile Optimized */}
              <div className="text-center w-full mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-xl font-semibold welcome-title-mobile">
                  {t('welcomeBackUser')}, <span className="text-yellow-300">{displayName}</span>!
                </h3>
                <p className="text-white/80 mt-1 text-center text-xs sm:text-sm welcome-subtitle-mobile">{t('continueImpactMessage')}</p>
              </div>

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="relative">
                    <EnhancedAvatar
                      emoji={displayAvatar}
                      image={getAvatarImage(displayAvatar)}
                      size={isMobile ? "xl" : "2xl"}
                      glowColor="green"
                      showCrown={true}
                      profileFrame={userProgress?.profileFrame}
                      noBackground={true}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm sm:text-xl font-bold user-name-mobile">{displayName}</h2>
                    <p className="text-white/80 text-xs sm:text-sm user-role-mobile">{t('climateHero')}</p>
                    <div className="flex items-center space-x-2 sm:space-x-3 mt-1 sm:mt-2 text-xs text-white/70 user-info-mobile">
                      <div className="flex items-center">
                        <MapPin className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        {USER_DATA.location}
                      </div>
                      <div className="flex items-center">
                        <School className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        {USER_DATA.school}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/20 h-6 w-6 sm:h-10 sm:w-10 p-0">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Coins and Points - Icon-Focused Creative Design */}
              <div className={cn("grid grid-cols-2", isMobile ? "gap-1.5 mb-2" : "gap-2 sm:gap-4 mb-3 sm:mb-4")}>
                {/* Eco Coins Card - Golden Theme */}
                <motion.div 
                  className={cn(
                    "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md",
                    "bg-gradient-to-br from-yellow-500/30 via-yellow-400/25 to-amber-500/20",
                    "border-yellow-400/50",
                    isMobile ? "p-2" : "p-3 sm:p-4"
                  )}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                  
                  <div className="relative z-10">
                    {/* Icon - Large and Prominent */}
                    <div className={cn("flex items-center justify-center mb-2", isMobile ? "mb-1.5" : "")}>
                      <Coins className={cn("text-yellow-200 drop-shadow-lg", isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12")} />
                    </div>
                    
                    {/* Label */}
                    <div className={cn("text-center mb-1", isMobile ? "mb-0.5" : "")}>
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
                    "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md",
                    "bg-gradient-to-br from-blue-500/30 via-cyan-400/25 to-blue-600/20",
                    "border-blue-400/50",
                    isMobile ? "p-2" : "p-3 sm:p-4"
                  )}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                  
                  <div className="relative z-10">
                    {/* Icon - Large and Prominent */}
                    <div className={cn("flex items-center justify-center mb-2", isMobile ? "mb-1.5" : "")}>
                      <Star className={cn("text-blue-200 drop-shadow-lg fill-blue-200", isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12")} />
                    </div>
                    
                    {/* Label */}
                    <div className={cn("text-center mb-1", isMobile ? "mb-0.5" : "")}>
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
                      isMobile ? "text-base" : "text-xl sm:text-2xl"
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
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 id="impact-title" className="text-lg sm:text-xl font-semibold flex items-center mx-auto section-title-mobile">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 icon-md-mobile" />
                <strong>{t('ourImpact')}</strong>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 gap-mobile">
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
                    <div className="flex items-center text-green-600 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2 w-2 sm:h-3 sm:w-3 mr-1">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+12%
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 flex-1 flex flex-col">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight impact-value-mobile">2.5Kkg</p>
                    <p className="text-xs font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile">{t('plasticRubberRecycledTitle')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile">{t('transformedIntoEcoTiles')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className="p-2 sm:p-3 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div className="p-1 sm:p-1.5 rounded-lg text-blue-600 bg-blue-50">
                      <Users className="h-3 w-3 sm:h-5 sm:w-5 icon-sm-mobile" />
                    </div>
                    <div className="flex items-center text-green-600 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2 w-2 sm:h-3 sm:w-3 mr-1">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+8%
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 flex-1 flex flex-col">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight impact-value-mobile">1.3K</p>
                    <p className="text-xs font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile">{t('ecoWarriorsActiveTitle')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile">{t('citizensSchoolsUnited')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className="p-2 sm:p-3 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div className="p-1 sm:p-1.5 rounded-lg text-purple-600 bg-purple-50">
                      <Leaf className="h-3 w-3 sm:h-5 sm:w-5 icon-sm-mobile" />
                    </div>
                    <div className="flex items-center text-green-600 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2 w-2 sm:h-3 sm:w-3 mr-1">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+15%
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 flex-1 flex flex-col">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight impact-value-mobile">3</p>
                    <p className="text-xs font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile">{t('communityProjectsTitle')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile">{t('pilotProjectsTransforming')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm eco-card-hover h-full impact-card-mobile">
                <div className="p-2 sm:p-3 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div className="p-1 sm:p-1.5 rounded-lg text-green-600 bg-green-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-5 sm:w-5 icon-sm-mobile">
                        <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"></path>
                        <path d="M12 22v-3"></path>
                      </svg>
                    </div>
                    <div className="flex items-center text-green-600 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2 w-2 sm:h-3 sm:w-3 mr-1">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>+22%
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 flex-1 flex flex-col">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight impact-value-mobile">156</p>
                    <p className="text-xs font-medium text-gray-700 leading-tight break-words hyphens-auto impact-title-mobile">{t('treesPlantedTitle')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed break-words hyphens-auto mt-auto impact-description-mobile">{t('growingGreenSpaces')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions - Mobile Optimized */}
          <section aria-labelledby="actions-title">
            <Card className="card-mobile">
              <CardHeader className="card-header-mobile">
                <CardTitle id="actions-title" className="flex items-center justify-center text-lg sm:text-2xl section-title-mobile">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 icon-md-mobile" />
                  <strong>{t('takeAction')}</strong>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 sm:gap-3 card-content-mobile gap-mobile">
                <Link to="/actions">
                  <Button className="min-h-[3rem] sm:min-h-[5rem] h-auto w-full flex-col bg-green-600 hover:bg-green-700 eco-card-hover p-2 sm:p-3 action-button-mobile">
                    <img src="/images/location_5174778.png" alt="" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 object-contain" aria-hidden="true" loading="lazy" />
                    <span className="text-xs font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile">
                      {t('findCollectionPoints')}
                    </span>
                  </Button>
                </Link>
                <Link to="/vote">
                  <Button className="min-h-[3rem] sm:min-h-[5rem] h-auto w-full flex-col bg-blue-600 hover:bg-blue-700 eco-card-hover p-2 sm:p-3 action-button-mobile">
                    <img src="/images/vote_15269306.png" alt="" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 object-contain" aria-hidden="true" loading="lazy" />
                    <span className="text-xs font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile">
                      {t('voteOnProjects')}
                    </span>
                  </Button>
                </Link>
                <Link to="/actions">
                  <Button className="min-h-[3rem] sm:min-h-[5rem] h-auto w-full flex-col bg-purple-600 hover:bg-purple-700 eco-card-hover p-2 sm:p-3 action-button-mobile">
                    <img src="/images/event.png" alt="" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 object-contain" aria-hidden="true" loading="lazy" />
                    <span className="text-xs font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile">
                      {t('eventsButton')}
                    </span>
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button className="min-h-[3rem] sm:min-h-[5rem] h-auto w-full flex-col bg-orange-600 hover:bg-orange-700 eco-card-hover p-2 sm:p-3 action-button-mobile">
                    <img src="/images/eco-bag_10158203.png" alt="" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 object-contain" aria-hidden="true" loading="lazy" />
                    <span className="text-xs font-medium text-center text-white leading-tight break-words hyphens-auto px-1 action-text-mobile">
                      {t('shopButton')}
                    </span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* About Section - Mobile Optimized */}
          <section id="about-section" className="scroll-mt-20">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 card-mobile">
              <CardHeader className="card-header-mobile">
                <CardTitle className="flex items-center justify-center text-lg sm:text-2xl section-title-mobile">
                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600 icon-lg-mobile" />
                  {t('aboutZaminatProject')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3 sm:space-y-4 text-center card-content-mobile">
                <div className="max-w-none mx-auto">
                  <p className="text-gray-700 leading-relaxed text-center break-words hyphens-auto text-sm sm:text-base about-description-mobile">
                    {t('aboutZaminatDescription')}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg about-goals-mobile">
                    <h3 className="font-semibold text-green-800 mb-2 text-center text-sm sm:text-base about-goals-title-mobile">{t('ourGoalsFor2026')}</h3>
                    <ul className="text-xs sm:text-sm text-green-700 space-y-1 text-left about-goals-list-mobile">
                      <li className="break-words">• {t('recycle1000Tons')}</li>
                      <li className="break-words">• {t('engage50000Users')}</li>
                      <li className="break-words">• {t('complete100Projects')}</li>
                      <li className="break-words">• {t('plant10000Trees')}</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-white rounded-lg about-goals-mobile">
                    <h3 className="font-semibold text-blue-800 mb-2 text-center text-sm sm:text-base about-goals-title-mobile">{t('currentProgressStatus')}</h3>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1 text-left about-goals-list-mobile">
                      <li className="break-words">• {t('recycled2500kg')}</li>
                      <li className="break-words">• {t('active1250Members')}</li>
                      <li className="break-words">• {t('launched3Projects')}</li>
                      <li className="break-words">• {t('planted156Trees')}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link to="/about">
                    <Button className="bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6">
                      {t('readFullStoryButton')}
                    </Button>
                  </Link>
                </div>

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
              </CardContent>
            </Card>
          </section>

          {/* Latest News & Education - Mobile Optimized */}
          <section aria-labelledby="news-title">
            <Card className="card-mobile">
              <CardHeader className="card-header-mobile">
                <div className="flex items-center justify-between">
                  <CardTitle id="news-title" className="mx-auto text-lg sm:text-2xl section-title-mobile">
                    <strong>{t('latestNewsEducation')}</strong>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 card-content-mobile">
                {newsItems.slice(0, 3).map((news) => (
                  <article key={news.id} className="border-l-4 border-green-500 pl-3 sm:pl-4 py-1 sm:py-2 eco-card-hover news-item-mobile">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 break-words text-sm sm:text-base news-title-mobile">
                          <strong>{news.title}</strong>
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed break-words hyphens-auto news-summary-mobile">
                          {news.summary}
                        </p>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline" className="text-xs news-meta-mobile">
                            {news.category}
                          </Badge>
                          <span className="text-xs text-gray-500 news-meta-mobile">
                            <strong>{news.readTime} {t('minReadTime')}</strong>
                          </span>
                          <span className="text-xs text-gray-500 break-words news-meta-mobile">
                            {t('byAuthor')} {news.author}
                          </span>
                        </div>
                      </div>
                      <span className="text-lg sm:text-2xl ml-2 sm:ml-3 flex-shrink-0" aria-hidden="true">{news.image}</span>
                    </div>
                  </article>
                ))}
                <div className="text-center mt-3 sm:mt-4">
                  <Link to="/stories">
                    <Button variant="outline" className="text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6">
                      {t('viewAllNews')} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Personal Progress - Mobile Optimized */}
          <section aria-labelledby="progress-title">
            <Card className="card-mobile">
              <CardHeader className="card-header-mobile">
                <CardTitle id="progress-title" className="text-center text-lg sm:text-2xl section-title-mobile">
                  <strong>{t('yourEnvironmentalImpact')}</strong>
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content-mobile">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center progress-grid-mobile">
                  <div className="p-2 sm:p-3 bg-green-50 rounded-lg progress-item-mobile">
                    <p className="text-lg sm:text-2xl font-bold text-green-600 progress-value-mobile">
                      85.5kg
                    </p>
                    <p className="text-xs text-gray-600 break-words hyphens-auto progress-label-mobile">
                      <strong>{t('wasteCollectedLabel')}</strong>
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg progress-item-mobile">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600 progress-value-mobile">
                      3
                    </p>
                    <p className="text-xs text-gray-600 break-words hyphens-auto progress-label-mobile">
                      <strong>{t('badgesEarnedLabel')}</strong>
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-50 rounded-lg progress-item-mobile">
                    <p className="text-lg sm:text-2xl font-bold text-purple-600 progress-value-mobile">
                      250
                    </p>
                    <p className="text-xs text-gray-600 break-words hyphens-auto progress-label-mobile">
                      <strong>{t('ecoCoinsProgress')}</strong>
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-xs sm:text-sm text-gray-700 text-center break-words hyphens-auto">
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
    </Layout>
  );
}