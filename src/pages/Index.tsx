import { Bell, Leaf, Award, Users, ArrowRight, Settings, Coins, Star, Trophy, Crown, MapPin, School, ExternalLink, UserCheck, Phone, Mail, Sparkles, Recycle, TreePine, Target, TrendingUp, CheckCircle2, Vote, Calendar, ShoppingBag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AICoreSection from '@/components/ai/AICoreSection';
import PrefetchLink from '@/components/PrefetchLink';
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
    title: 'ZAMINAT AI Core — AI-Powered Recycling and Impact Platform',
    description: 'ZAMINAT AI Core is the planned intelligence layer of ZAMINAT.eco, helping identify recyclable materials, guide citizens, verify reports, calculate impact and support scalable Waste-to-Life infrastructure.',
    image: '/logo.webp',
    type: 'website',
    keywords: 'plastic recycling, rubber recycling, AI waste recognition, waste management Uzbekistan, volunteer eco-campaigns, EcoApp, EcoKids, environmental movement, sustainability, AI Core',
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

  // Inject JSON-LD structured data for ZAMINAT AI Core
  useEffect(() => {
    const scriptId = 'jsonld-ai-core';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://zaminat.eco/#organization",
          "name": "ZAMINAT.eco",
          "url": "https://zaminat.eco",
          "logo": "https://zaminat.eco/logo.webp",
          "sameAs": [
            "https://github.com/Bullfighteruz/zaminateco-master"
          ]
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://zaminat.eco/#software",
          "name": "ZAMINAT AI Core",
          "applicationCategory": "GreenTechApplication",
          "operatingSystem": "All",
          "description": "ZAMINAT AI Core is the intelligence layer of ZAMINAT.eco, helping identify recyclable materials, guide citizens, verify reports, calculate impact and support scalable Waste-to-Life infrastructure.",
          "publisher": {
            "@id": "https://zaminat.eco/#organization"
          }
        }
      ]
    });

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/15 uzbek-pattern">
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
                  className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 md:p-5"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
                  }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                >
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
                    <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    
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
                </motion.div>
                
                {/* Compact Action Buttons - Horizontal, Space Efficient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={cn("flex flex-row gap-2.5", isMobile ? "gap-2" : "gap-3")}
                >
                  <Button 
                    onClick={scrollToAbout}
                    className={cn(
                      "flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl",
                      isMobile ? "text-[11px] py-2 px-2.5 min-h-[38px]" : "text-xs py-2 px-3 min-h-[40px]"
                    )}
                  >
                    {t('learnAboutProject')}
                  </Button>
                  <Link to="/actions" className="flex-1">
                    <Button 
                      variant="outline"
                      className={cn(
                        "w-full border border-emerald-600/30 bg-white/90 backdrop-blur-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl",
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
                  style={{ pointerEvents: 'none' }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                >
                  <div 
                    className="relative overflow-hidden rounded-2xl shadow-xl p-4 sm:p-6"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {/* Main description text */}
                    <div className="relative z-10">
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed hero-description-mobile text-gray-800 font-medium">
                  {t('heroDescription')}
                </p>
              </div>
                  </div>
                </motion.div>
                
                {/* Action Buttons - Creative positioning */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto px-4"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Button 
                    onClick={scrollToAbout}
                    size="lg"
                    className={cn(
                      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base py-3.5 px-8 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-2xl"
                    )}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {t('learnAboutProject')}
                  </Button>
                  <Link to="/actions" style={{ pointerEvents: 'auto' }}>
                    <Button 
                      size="lg"
                      variant="outline"
                      className={cn(
                        "w-full sm:w-auto border border-emerald-600/30 bg-white/85 backdrop-blur-sm text-emerald-700 hover:bg-emerald-50/50 hover:text-emerald-800 font-extrabold text-sm sm:text-base py-3.5 px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-2xl"
                      )}
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
                    "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
                    "bg-white/10 border-white/25 hover:bg-white/15 hover:border-yellow-400/40",
                    isMobile ? "p-2.5" : "p-3.5 sm:p-5"
                  )}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 text-left">
                      <span className={cn(
                        "font-semibold text-white/70 block uppercase tracking-wider mb-0.5",
                        isMobile ? "text-[8px]" : "text-[10px]"
                      )}>
                        {t('ecoCoinsLabel')}
                      </span>
                      <div className={cn(
                        "font-extrabold bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-200 bg-clip-text text-transparent drop-shadow-sm",
                        isMobile ? "text-sm" : "text-lg sm:text-2xl"
                      )}>
                        {displayEcoCoins}
                      </div>
                    </div>
                    
                    {/* Icon Container */}
                    <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 shadow-sm flex-shrink-0">
                      <Coins className={cn(isMobile ? "h-5 w-5" : "h-7 w-7")} />
                    </div>
                  </div>
                </motion.div>

                {/* Eco Points Card - Blue/Cyan Theme */}
                <motion.div 
                  className={cn(
                    "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
                    "bg-white/10 border-white/25 hover:bg-white/15 hover:border-emerald-400/40",
                    isMobile ? "p-2.5" : "p-3.5 sm:p-5"
                  )}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 text-left">
                      <span className={cn(
                        "font-semibold text-white/70 block uppercase tracking-wider mb-0.5",
                        isMobile ? "text-[8px]" : "text-[10px]"
                      )}>
                        {t('ecoPointsLabel')}
                      </span>
                      <div className={cn(
                        "font-extrabold bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-200 bg-clip-text text-transparent drop-shadow-sm",
                        isMobile ? "text-sm" : "text-lg sm:text-2xl"
                      )}>
                        {displayEcoPoints.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Icon Container */}
                    <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-200 border border-emerald-400/20 shadow-sm flex-shrink-0">
                      <Star className={cn("text-emerald-200 fill-emerald-200/20", isMobile ? "h-5 w-5" : "h-7 w-7")} />
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
              <h2 id="impact-title" className={cn("font-semibold flex items-center justify-center mx-auto section-title-mobile gap-2", isMobile ? "text-sm" : "text-lg sm:text-xl")}>
                <Award className={cn("text-green-600 icon-md-mobile flex-shrink-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                <strong>{t('ourImpact')}</strong>
                <div className={cn("flex-shrink-0 opacity-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} aria-hidden="true" />
              </h2>
            </div>
            <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-mobile", isMobile ? "gap-1.5" : "gap-3 sm:gap-4")}>
              <div className="glass-card glass-card-hover rounded-2xl h-full impact-card-mobile">
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

              <div className="glass-card glass-card-hover rounded-2xl h-full impact-card-mobile">
                <div className={cn("h-full flex flex-col", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                  <div className={cn("flex items-start justify-between", isMobile ? "mb-1" : "mb-1 sm:mb-2")}>
                    <div className={cn("rounded-lg text-teal-600 bg-teal-50", isMobile ? "p-0.5" : "p-1 sm:p-1.5")}>
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

              <div className="glass-card glass-card-hover rounded-2xl h-full impact-card-mobile">
                <div className={cn("h-full flex flex-col", isMobile ? "p-1.5" : "p-2 sm:p-3")}>
                  <div className={cn("flex items-start justify-between", isMobile ? "mb-1" : "mb-1 sm:mb-2")}>
                    <div className={cn("rounded-lg text-teal-600 bg-teal-50", isMobile ? "p-0.5" : "p-1 sm:p-1.5")}>
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

              <div className="glass-card glass-card-hover rounded-2xl h-full impact-card-mobile">
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
            <Card className="card-mobile border border-gray-200/50 shadow-xl bg-white/70 backdrop-blur-md overflow-hidden rounded-3xl">
              <CardHeader className="card-header-mobile border-b border-gray-200/50 bg-gray-50/50">
                <CardTitle id="actions-title" className={cn("flex items-center justify-center section-title-mobile gap-2", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                  <Users className={cn("text-green-600 icon-md-mobile flex-shrink-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                  <strong className="text-gray-900 tracking-wide font-bold">{t('takeAction')}</strong>
                  <div className={cn("flex-shrink-0 opacity-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} aria-hidden="true" />
                </CardTitle>
              </CardHeader>
              <CardContent className={cn("grid grid-cols-2 lg:grid-cols-4 card-content-mobile gap-mobile", isMobile ? "gap-2.5 p-3" : "gap-4 sm:gap-6 p-4 sm:p-6")}>
                {/* 1. Collection Points */}
                <PrefetchLink to="/actions" className="block">
                  <div className={cn(
                    "glass-card p-3 sm:p-5 flex flex-col items-center justify-center text-center rounded-2xl cursor-pointer select-none",
                    "border border-gray-200/60 shadow-sm take-action-card",
                    "hover:shadow-lg hover:border-green-400/50 hover:bg-white/95 hover:-translate-y-1 group",
                    "gradient-hover-shimmer"
                  )}>
                    <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 text-green-600 mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                      <MapPin className={cn(isMobile ? "h-5 w-5" : "h-7 w-7")} />
                    </div>
                    <span className={cn("font-bold text-gray-800 leading-tight group-hover:text-green-700 transition-colors flex items-center justify-center", isMobile ? "text-[11px]" : "text-sm sm:text-base")}>
                      <span className="relative">
                        {t('findCollectionPoints')}
                        {!isMobile && <ArrowRight className="absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-green-600" />}
                      </span>
                    </span>
                  </div>
                </PrefetchLink>

                {/* 2. Vote */}
                <PrefetchLink to="/vote" className="block">
                  <div className={cn(
                    "glass-card p-3 sm:p-5 flex flex-col items-center justify-center text-center rounded-2xl cursor-pointer select-none",
                    "border border-gray-200/60 shadow-sm take-action-card",
                    "hover:shadow-lg hover:border-emerald-400/50 hover:bg-white/95 hover:-translate-y-1 group",
                    "gradient-hover-shimmer"
                  )}>
                    <div className="p-2 sm:p-3 rounded-xl bg-teal-500/10 text-teal-600 mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                      <Vote className={cn(isMobile ? "h-5 w-5" : "h-7 w-7")} />
                    </div>
                    <span className={cn("font-bold text-gray-800 leading-tight group-hover:text-emerald-700 transition-colors flex items-center justify-center", isMobile ? "text-[11px]" : "text-sm sm:text-base")}>
                      <span className="relative">
                        {t('voteOnProjects')}
                        {!isMobile && <ArrowRight className="absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-teal-600" />}
                      </span>
                    </span>
                  </div>
                </PrefetchLink>

                {/* 3. Events */}
                <PrefetchLink to="/actions" className="block">
                  <div className={cn(
                    "glass-card p-3 sm:p-5 flex flex-col items-center justify-center text-center rounded-2xl cursor-pointer select-none",
                    "border border-gray-200/60 shadow-sm take-action-card",
                    "hover:shadow-lg hover:border-teal-400/50 hover:bg-white/95 hover:-translate-y-1 group",
                    "gradient-hover-shimmer"
                  )}>
                    <div className="p-2 sm:p-3 rounded-xl bg-teal-500/10 text-teal-600 mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                      <Calendar className={cn(isMobile ? "h-5 w-5" : "h-7 w-7")} />
                    </div>
                    <span className={cn("font-bold text-gray-800 leading-tight group-hover:text-teal-700 transition-colors flex items-center justify-center", isMobile ? "text-[11px]" : "text-sm sm:text-base")}>
                      <span className="relative">
                        {t('eventsButton')}
                        {!isMobile && <ArrowRight className="absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-teal-600" />}
                      </span>
                    </span>
                  </div>
                </PrefetchLink>

                {/* 4. Shop */}
                <PrefetchLink to="/shop" className="block">
                  <div className={cn(
                    "glass-card p-3 sm:p-5 flex flex-col items-center justify-center text-center rounded-2xl cursor-pointer select-none",
                    "border border-gray-200/60 shadow-sm take-action-card",
                    "hover:shadow-lg hover:border-emerald-400/50 hover:bg-white/95 hover:-translate-y-1 group",
                    "gradient-hover-shimmer"
                  )}>
                    <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-600 mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                      <ShoppingBag className={cn(isMobile ? "h-5 w-5" : "h-7 w-7")} />
                    </div>
                    <span className={cn("font-bold text-gray-800 leading-tight group-hover:text-emerald-700 transition-colors flex items-center justify-center", isMobile ? "text-[11px]" : "text-sm sm:text-base")}>
                      <span className="relative">
                        {t('shopButton')}
                        {!isMobile && <ArrowRight className="absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-600" />}
                      </span>
                    </span>
                  </div>
                </PrefetchLink>
              </CardContent>
            </Card>
          </section>

          {/* ZAMINAT AI Core Platform Update */}
          <AICoreSection />

          {/* About Section - Enhanced with Interactive Elements */}
          <section id="about-section" className="scroll-mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border border-white/60 card-mobile shadow-xl shadow-green-900/5 overflow-hidden">
                <CardHeader className={cn("card-header-mobile bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative overflow-hidden", isMobile ? "p-3" : "p-4 sm:p-6")}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
                  <CardTitle className={cn("flex items-center justify-center section-title-mobile relative z-10 gap-2", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="flex-shrink-0"
                    >
                      <Leaf className={cn("text-white icon-lg-mobile drop-shadow-lg", isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6")} />
                    </motion.div>
                    <span className="font-bold">{t('aboutZaminatProject')}</span>
                    <div className={cn("flex-shrink-0 opacity-0", isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6")} aria-hidden="true" />
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
                      <strong className="text-emerald-700">ZAMINAT.eco</strong> {t('aboutZaminatDescription')}
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
                      <div className={cn("bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-emerald-300/80 about-goals-mobile h-full", isMobile ? "p-3" : "p-5 sm:p-6")}>
                        <div className={cn("flex items-center justify-center", isMobile ? "gap-1.5 mb-3" : "gap-2 mb-4")}>
                          <div className={cn("bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300", isMobile ? "p-1.5" : "p-2")}>
                            <Target className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                          </div>
                          <h3 className={cn("font-bold text-emerald-800 about-goals-title-mobile", isMobile ? "text-xs" : "text-base sm:text-lg")}>
                            {t('ourGoalsFor2026')}
                          </h3>
                        </div>
                        <ul className={cn("text-gray-700 text-left about-goals-list-mobile", isMobile ? "space-y-1.5" : "space-y-2 sm:space-y-3")}>
                          {[
                            { icon: Recycle, text: t('recycle1000Tons'), color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
                            { icon: Users, text: t('engage50000Users'), color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
                            { icon: Award, text: t('complete100Projects'), color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
                            { icon: TreePine, text: t('plant10000Trees'), color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' }
                          ].map((item, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className={cn(
                                "flex items-center break-words bg-emerald-500/5 border border-emerald-500/10 group/item hover:bg-emerald-500/10 transition-all duration-200",
                                isMobile ? "p-1.5 rounded-lg gap-2" : "p-2 rounded-xl gap-3"
                              )}
                            >
                              <div className={cn(
                                "rounded-lg flex-shrink-0 text-emerald-600 bg-emerald-500/10 group-hover/item:scale-110 transition-transform",
                                isMobile ? "p-1" : "p-1.5"
                              )}>
                                <item.icon className={cn(isMobile ? "h-3.5 w-3.5" : "h-4.5 w-4.5 sm:h-5 sm:w-5")} />
                              </div>
                              <span className={cn("font-medium text-gray-700", isMobile ? "text-[11px]" : "text-xs sm:text-sm")}>{item.text}</span>
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
                      <div className={cn("bg-white/60 backdrop-blur-sm border border-white/80 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-emerald-300/80 about-goals-mobile h-full", isMobile ? "p-3" : "p-5 sm:p-6")}>
                        <div className={cn("flex items-center justify-center", isMobile ? "gap-1.5 mb-3" : "gap-2 mb-4")}>
                          <div className={cn("bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300", isMobile ? "p-1.5" : "p-2")}>
                            <TrendingUp className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5")} />
                          </div>
                          <h3 className={cn("font-bold text-emerald-800 about-goals-title-mobile", isMobile ? "text-xs" : "text-base sm:text-lg")}>
                            {t('currentProgressStatus')}
                          </h3>
                        </div>
                        <div className={cn("text-left about-goals-list-mobile", isMobile ? "space-y-1.5" : "space-y-2 sm:space-y-3.5")}>
                          {[
                            { 
                              icon: Recycle, 
                              label: t('recycled2500kg'), 
                              value: globalStats.totalWasteCollected, 
                              suffix: ' kg',
                              progress: (globalStats.totalWasteCollected / goals2026.wasteTarget) * 100,
                              color: 'text-emerald-600',
                              bgColor: 'bg-emerald-500/10',
                              fillColor: 'from-emerald-500 via-teal-500 to-teal-400'
                            },
                            { 
                              icon: Users, 
                              label: t('active1250Members'), 
                              value: globalStats.totalUsers, 
                              suffix: '+',
                              progress: (globalStats.totalUsers / goals2026.usersTarget) * 100,
                              color: 'text-emerald-600',
                              bgColor: 'bg-sky-500/10',
                              fillColor: 'from-emerald-500 via-teal-500 to-teal-400'
                            },
                            { 
                              icon: Award, 
                              label: t('launched3Projects'), 
                              value: globalStats.totalProjects, 
                              suffix: '',
                              progress: (globalStats.totalProjects / goals2026.projectsTarget) * 100,
                              color: 'text-emerald-600',
                              bgColor: 'bg-sky-500/10',
                              fillColor: 'from-emerald-500 via-teal-500 to-teal-400'
                            },
                            { 
                              icon: TreePine, 
                              label: t('planted156Trees'), 
                              value: globalStats.treesPlanted, 
                              suffix: '',
                              progress: (globalStats.treesPlanted / goals2026.treesTarget) * 100,
                              color: 'text-emerald-600',
                              bgColor: 'bg-sky-500/10',
                              fillColor: 'from-emerald-500 via-teal-500 to-teal-400'
                            }
                          ].map((stat, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className={cn(
                                "group/stat bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all duration-200",
                                isMobile ? "p-1.5 rounded-lg space-y-1" : "p-2.5 rounded-xl space-y-2"
                              )}
                            >
                              <div className={cn("flex items-center justify-between", isMobile ? "gap-1.5" : "gap-2")}>
                                <div className={cn("flex items-center flex-1 min-w-0 gap-2")}>
                                  <div className={cn(
                                    "rounded-lg flex-shrink-0 bg-emerald-500/10 text-emerald-600 group-hover/stat:scale-110 transition-transform",
                                    isMobile ? "p-1" : "p-1.5"
                                  )}>
                                    <stat.icon className={cn(isMobile ? "h-3.5 w-3.5" : "h-4.5 w-4.5 sm:h-5 sm:w-5")} />
                                  </div>
                                  <span className={cn("text-gray-700 font-medium break-words flex-1", isMobile ? "text-[11px]" : "text-xs sm:text-sm")}>{stat.label}</span>
                                </div>
                                {isMobile ? (
                                  <div className="flex flex-col items-end flex-shrink-0 text-right leading-none">
                                    <span className="font-bold text-emerald-700 text-[11px]">
                                      <AnimatedCounter end={stat.value} suffix={stat.suffix} className="text-[11px]" />
                                    </span>
                                    <span className="text-[9px] text-emerald-600 font-medium mt-0.5">
                                      {stat.progress.toFixed(1)}%
                                    </span>
                                  </div>
                                ) : (
                                  <div className={cn("rounded-lg font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-2 py-0.5 text-xs sm:text-sm flex-shrink-0")}>
                                    <AnimatedCounter 
                                      end={stat.value} 
                                      suffix={stat.suffix}
                                      className="text-xs sm:text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div className={isMobile ? "w-full" : "space-y-1"}>
                                <div className={cn("w-full bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden shadow-inner", isMobile ? "h-1" : "h-2 sm:h-2.5")}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.min(stat.progress, 100)}%` }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                      duration: 1, 
                                      delay: 0.5 + idx * 0.1,
                                      ease: "easeOut"
                                    }}
                                    className={cn("h-full rounded-full bg-gradient-to-r", stat.fillColor)}
                                  />
                                </div>
                                {!isMobile && (
                                  <div className="text-right text-emerald-700 font-semibold text-[10px] sm:text-xs">
                                    {stat.progress.toFixed(1)}% {t('completed', { defaultValue: 'complete' })}
                                  </div>
                                )}
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
                        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto rounded-xl",
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
                    <div className="flex flex-row gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                      {/* Partners Link */}
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="flex-shrink-0"
                        style={{ width: 'calc(100vw - 2rem)', maxWidth: '280px', minWidth: '260px' }}
                      >
                        <Link to="/partners">
                          <Card className="glass-card glass-card-hover h-full group">
                            <CardContent className="p-4 text-center flex flex-col h-full min-h-[220px] justify-between">
                              <div>
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <img src="/images/partners_7967044.webp" alt="" className="w-9 h-9 object-contain" loading="lazy" />
                                </div>
                                <h4 className="font-bold text-emerald-800 mb-1.5 text-sm sm:text-base">{t('ourPartnersLink')}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed px-1">
                                  {t('discoverExclusiveDiscounts')}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
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
                          <Card className="glass-card glass-card-hover h-full group">
                            <CardContent className="p-4 text-center flex flex-col h-full min-h-[220px] justify-between">
                              <div>
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <img src="/images/meet-the-team_15916616.webp" alt="" className="w-9 h-9 object-contain" loading="lazy" />
                                </div>
                                <h4 className="font-bold text-teal-800 mb-1.5 text-sm sm:text-base">{t('meetOurTeam')}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed px-1">
                                  {t('passionatePeopleBehind')}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 h-auto rounded-xl shadow-md transition-all"
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
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
                          <Card className="glass-card glass-card-hover h-full group">
                            <CardContent className="p-4 text-center flex flex-col h-full min-h-[220px] justify-between">
                              <div>
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <img src="/images/contact-us.webp" alt="" className="w-9 h-9 object-contain" loading="lazy" />
                                </div>
                                <h4 className="font-bold text-emerald-800 mb-1.5 text-sm sm:text-base">{t('contactUsButton')}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed px-1">
                                  {t('getInTouchPartnerships')}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 h-auto rounded-xl shadow-md transition-all"
                              >
                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                {t('contactUsButton')}
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    </div>
                  ) : (
                    /* Desktop: Grid Layout */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* Partners Link */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link to="/partners">
                          <Card className="glass-card glass-card-hover h-full group">
                            <CardContent className="p-5 text-center flex flex-col h-full justify-between min-h-[250px]">
                              <div>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <img src="/images/partners_7967044.webp" alt="" className="w-10 h-10 object-contain" loading="lazy" />
                                </div>
                                <h4 className="font-bold text-emerald-800 mb-2 text-base sm:text-lg">{t('ourPartnersLink')}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                  {t('discoverExclusiveDiscounts')}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 h-auto rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link to="/team">
                          <Card className="glass-card glass-card-hover h-full group">
                            <CardContent className="p-5 text-center flex flex-col h-full justify-between min-h-[250px]">
                              <div>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <img src="/images/meet-the-team_15916616.webp" alt="" className="w-10 h-10 object-contain" loading="lazy" />
                                </div>
                                <h4 className="font-bold text-teal-800 mb-2 text-base sm:text-lg">{t('meetOurTeam')}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                  {t('passionatePeopleBehind')}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 h-auto rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link to="/contacts">
                          <Card className="glass-card glass-card-hover h-full group">
                            <CardContent className="p-5 text-center flex flex-col h-full justify-between min-h-[250px]">
                              <div>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <img src="/images/contact-us.webp" alt="" className="w-10 h-10 object-contain" loading="lazy" />
                                </div>
                                <h4 className="font-semibold text-emerald-800 mb-2 text-base sm:text-lg">{t('contactUsButton')}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                  {t('getInTouchPartnerships')}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 h-auto rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
            <Card className="bg-white/80 backdrop-blur-md border border-white/60 card-mobile shadow-xl shadow-green-900/5 overflow-hidden">
              <CardHeader className={cn("card-header-mobile bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative overflow-hidden", isMobile ? "p-3" : "p-4 sm:p-5")}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
                <CardTitle id="news-title" className={cn("mx-auto section-title-mobile relative z-10", isMobile ? "text-sm" : "text-lg sm:text-2xl")}>
                  <strong>{t('latestNewsEducation')}</strong>
                </CardTitle>
              </CardHeader>
              <CardContent className={cn("card-content-mobile", isMobile ? "p-3.5 space-y-3" : "p-5 sm:p-6 space-y-4")}>
                <div className="grid grid-cols-1 gap-4">
                  {newsItems.slice(0, 3).map((news) => (
                    <article key={news.id} className="group/news p-4 rounded-xl border border-gray-100 bg-white/60 hover:bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex gap-4 items-start">
                      {/* Styled circular emoji container */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-500/10 group-hover/news:scale-110 group-hover/news:rotate-6 transition-all duration-300">
                        <span className="text-xl" aria-hidden="true">{news.image}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border-emerald-100/50 text-[10px] px-2 py-0.5">
                            {news.category}
                          </Badge>
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {news.readTime} {t('minReadTime')}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 group-hover/news:text-emerald-700 transition-colors text-xs sm:text-base leading-snug break-words">
                          {news.title}
                        </h3>
                        
                        <p className="text-[11px] sm:text-sm text-gray-500 leading-relaxed break-words line-clamp-2">
                          {news.summary}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2 text-[10px] text-gray-400 border-t border-gray-100">
                          <span>{t('byAuthor')} <strong className="text-gray-600">{news.author}</strong></span>
                          <span className="group-hover/news:text-emerald-600 group-hover/news:translate-x-1 transition-all flex items-center gap-1 font-semibold">
                            Read Full <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className={cn("text-center", isMobile ? "mt-2" : "mt-3 sm:mt-4")}>
                  <Link to="/stories">
                    <Button variant="outline" className={cn("rounded-xl border border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold hover:-translate-y-0.5 hover:shadow-md transition-all duration-300", isMobile ? "text-xs py-1.5 px-3" : "text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6")}>
                      {t('viewAllNews')} <ArrowRight className={cn("ml-1", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Personal Progress - Space Optimized & Visual Polish */}
          <section aria-labelledby="progress-title" className="max-w-4xl mx-auto w-full my-6 sm:my-8">
            <Card className="card-mobile border border-gray-200/50 shadow-xl bg-white/70 backdrop-blur-md overflow-hidden rounded-3xl">
              <CardHeader className={cn("card-header-mobile border-b border-gray-200/50 bg-gray-50/50", isMobile ? "p-3" : "p-4 sm:p-5")}>
                <CardTitle id="progress-title" className={cn("text-center section-title-mobile flex items-center justify-center gap-2", isMobile ? "text-sm" : "text-lg sm:text-xl")}>
                  <Sparkles className="h-5 w-5 text-amber-500 animate-pulse flex-shrink-0" />
                  <strong className="text-gray-900 tracking-wide font-bold">{t('yourEnvironmentalImpact')}</strong>
                  <div className="h-5 w-5 opacity-0 flex-shrink-0" aria-hidden="true" />
                </CardTitle>
              </CardHeader>
              <CardContent className={cn("card-content-mobile", isMobile ? "p-3" : "p-6")}>
                <div className={cn("grid grid-cols-3 text-center progress-grid-mobile", isMobile ? "gap-2" : "gap-4 sm:gap-6")}>
                  {/* Stat 1 */}
                  <div className={cn(
                    "rounded-2xl border border-green-100/70 p-3 sm:p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300",
                    "bg-gradient-to-br from-green-50/80 via-white to-emerald-50/20"
                  )}>
                    <div className="p-2 rounded-xl bg-green-500/10 text-green-600 mb-2 shadow-sm">
                      <Recycle className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className={cn("font-extrabold text-green-600 progress-value-mobile leading-none", isMobile ? "text-sm" : "text-2xl sm:text-3xl")}>
                      85.5kg
                    </p>
                    <p className={cn("text-gray-500 font-medium progress-label-mobile mt-2", isMobile ? "text-[9px]" : "text-xs sm:text-sm")}>
                      <strong>{t('wasteCollectedLabel')}</strong>
                    </p>
                  </div>

                  {/* Stat 2 */}
                  <div className={cn(
                    "rounded-2xl border border-teal-100/70 p-3 sm:p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300",
                    "bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/20"
                  )}>
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 mb-2 shadow-sm">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className={cn("font-extrabold text-teal-600 progress-value-mobile leading-none", isMobile ? "text-sm" : "text-2xl sm:text-3xl")}>
                      3
                    </p>
                    <p className={cn("text-gray-500 font-medium progress-label-mobile mt-2", isMobile ? "text-[9px]" : "text-xs sm:text-sm")}>
                      <strong>{t('badgesEarnedLabel')}</strong>
                    </p>
                  </div>

                  {/* Stat 3 */}
                  <div className={cn(
                    "rounded-2xl border border-teal-100/70 p-3 sm:p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300",
                    "bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/20"
                  )}>
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 mb-2 shadow-sm">
                      <Coins className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className={cn("font-extrabold text-teal-600 progress-value-mobile leading-none", isMobile ? "text-sm" : "text-2xl sm:text-3xl")}>
                      250
                    </p>
                    <p className={cn("text-gray-500 font-medium progress-label-mobile mt-2", isMobile ? "text-[9px]" : "text-xs sm:text-sm")}>
                      <strong>{t('ecoCoinsProgress')}</strong>
                    </p>
                  </div>
                </div>

                {/* Banner Message */}
                <div className={cn(
                  "flex items-center justify-center gap-2 bg-amber-50/60 border border-amber-200/50 rounded-xl p-2.5 text-amber-800 text-center max-w-2xl mx-auto",
                  isMobile ? "mt-3" : "mt-5"
                )}>
                  <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 animate-pulse" />
                  <p className={cn("font-medium leading-relaxed break-words hyphens-auto", isMobile ? "text-[10px]" : "text-xs sm:text-sm")}>
                    {t('keepItUpMessage')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Bottom Action Card - High Converting & Space Optimized */}
          <section className="max-w-4xl mx-auto w-full my-6 sm:my-10 px-0">
            <div className={cn(
              "relative overflow-hidden rounded-3xl border border-emerald-100 shadow-xl",
              "bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-teal-500/5 backdrop-blur-md",
              "p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            )}>
              {/* Decorative Background Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-4 text-left w-full md:w-auto">
                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 flex-shrink-0 shadow-inner">
                  <Recycle className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                    {t('readyForBiggerImpact')}
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                    {t('joinVolunteerCampaigns')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-[320px] lg:w-[360px] xl:w-[400px] flex-shrink-0">
                <Link to="/actions" className="w-full sm:w-auto md:w-full flex-1 md:flex-initial">
                  <Button className={cn(
                    "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold whitespace-normal h-auto",
                    "py-3 px-5 text-sm rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  )}>
                    {t('joinNextCleanupEvent')}
                  </Button>
                </Link>
                <Link to="/about" className="w-full sm:w-auto md:w-full flex-1 md:flex-initial">
                  <Button variant="outline" className={cn(
                    "w-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold whitespace-normal h-auto",
                    "py-3 px-5 text-sm rounded-xl transition-all hover:-translate-y-0.5"
                  )}>
                    {t('learnAboutZaminatProject')}
                  </Button>
                </Link>
              </div>
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