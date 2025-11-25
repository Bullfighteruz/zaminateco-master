import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Star, Trophy, Zap, CheckCircle, Unlock, Save, Palette, Sparkles, Filter } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { EnhancedAvatar } from './enhanced-avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { PROFILE_BACKGROUNDS, ThemeBackground, loadUserProgress, saveUserProgress, UserProgress } from '@/lib/userProgress';
import { useTranslation } from '@/hooks/useTranslation';
import { getUserName } from '@/utils/userName';

interface EnhancedAvatarSystemProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar?: string;
  onAvatarSelect: (emoji: string) => void;
  onThemeChange?: (themeId: string) => void;
}

export const EnhancedAvatarSystem: React.FC<EnhancedAvatarSystemProps> = ({
  isOpen,
  onClose,
  selectedAvatar = '',
  onAvatarSelect,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState('avatars');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedLockedTheme, setSelectedLockedTheme] = useState<string | null>(null);
  const [currentSelection, setCurrentSelection] = useState(selectedAvatar);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [themeCategory, setThemeCategory] = useState<string>('all');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const isMobile = useIsMobile();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const { t } = useTranslation();

  // Sync currentSelection with selectedAvatar prop changes when modal opens
  useEffect(() => {
    if (isOpen && selectedAvatar) {
      setCurrentSelection(selectedAvatar);
    }
  }, [isOpen, selectedAvatar]);

  // Track viewport size - Optimized with debouncing
  useEffect(() => {
    if (!isOpen) {
      setViewportSize({ width: 0, height: 0 });
      return;
    }
    
    // Set initial viewport size immediately
    setViewportSize({
      width: window.innerWidth || 0,
      height: window.innerHeight || 0
    });
    
    // Debounced resize handler to prevent excessive updates
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setViewportSize({
          width: window.innerWidth || 0,
          height: window.innerHeight || 0
        });
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Lock body scroll when modal is open (prevent background scrolling) - Optimized
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Load user progress only when themes tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'themes' && !userProgress) {
      const progress = loadUserProgress();
      setUserProgress(progress);
      setSelectedTheme(progress.profileBackground || 'default');
    }
  }, [isOpen, activeTab, userProgress]);

  // Memoize static data arrays to prevent recreation on every render
  const avatarData = useMemo(() => ({
    emojis: ['👩‍🌾', '🌱', '🌿', '🌳', '♻️', '🌍', '💧', '☀️', '⚡', '🔥', '🌟', '🔮', '🦋'],
    images: ['/images/Eco Farmer.png', '/images/Green Sprout.png', '/images/Leaf Guardian.png', '/images/Tree Protector.png', '/images/Recycling Hero.png', '/images/Earth Guardian.png', '/images/Water Saver.png', '/images/Solar Champion.png', '/images/Energy Saver.png', '/images/Climate Warrior.png', '/images/Eco Star.png', '/images/Future Visionary.png', '/images/Nature Lover.png'],
    nameKeys: ['avatarEcoFarmer', 'avatarGreenSprout', 'avatarLeafGuardian', 'avatarTreeProtector', 'avatarRecyclingHero', 'avatarEarthGuardian', 'avatarWaterSaver', 'avatarSolarChampion', 'avatarEnergySaver', 'avatarClimateWarrior', 'avatarEcoStar', 'avatarFutureVisionary', 'avatarNatureLover'],
    descKeys: ['avatarDescEcoFarmer', 'avatarDescGreenSprout', 'avatarDescLeafGuardian', 'avatarDescTreeProtector', 'avatarDescRecyclingHero', 'avatarDescEarthGuardian', 'avatarDescWaterSaver', 'avatarDescSolarChampion', 'avatarDescEnergySaver', 'avatarDescClimateWarrior', 'avatarDescEcoStar', 'avatarDescFutureVisionary', 'avatarDescNatureLover'],
    rarities: ['common', 'common', 'common', 'rare', 'rare', 'rare', 'epic', 'epic', 'epic', 'epic', 'legendary', 'legendary', 'legendary'],
    unlocked: [true, true, true, true, true, true, true, true, false, false, false, false, false],
    tasks: ['', '', '', '', '', '', '', '', 'energy_master', 'climate_action', 'eco_champion', 'innovation_leader', 'biodiversity_protector']
  }), []);

  const taskTitleKeys = {
    'energy_master': 'taskEnergyMaster',
    'climate_action': 'taskClimateAction',
    'eco_champion': 'taskEcoChampion',
    'innovation_leader': 'taskInnovationLeader',
    'biodiversity_protector': 'taskBiodiversityProtector'
  };

  const taskDescKeys = {
    'energy_master': 'taskDescEnergyMaster',
    'climate_action': 'taskDescClimateAction',
    'eco_champion': 'taskDescEcoChampion',
    'innovation_leader': 'taskDescInnovationLeader',
    'biodiversity_protector': 'taskDescBiodiversityProtector'
  };

  const taskRewardKeys = {
    'energy_master': 'taskRewardEnergyMaster',
    'climate_action': 'taskRewardClimateAction',
    'eco_champion': 'taskRewardEcoChampion',
    'innovation_leader': 'taskRewardInnovationLeader',
    'biodiversity_protector': 'taskRewardBiodiversityProtector'
  };

  const taskReqKeys = {
    'energy_master': [
      'taskReqEnergyMaster1',
      'taskReqEnergyMaster2',
      'taskReqEnergyMaster3',
      'taskReqEnergyMaster4'
    ],
    'climate_action': [
      'taskReqClimateAction1',
      'taskReqClimateAction2',
      'taskReqClimateAction3',
      'taskReqClimateAction4'
    ],
    'eco_champion': [
      'taskReqEcoChampion1',
      'taskReqEcoChampion2',
      'taskReqEcoChampion3',
      'taskReqEcoChampion4'
    ],
    'innovation_leader': [
      'taskReqInnovationLeader1',
      'taskReqInnovationLeader2',
      'taskReqInnovationLeader3',
      'taskReqInnovationLeader4'
    ],
    'biodiversity_protector': [
      'taskReqBiodiversityProtector1',
      'taskReqBiodiversityProtector2',
      'taskReqBiodiversityProtector3',
      'taskReqBiodiversityProtector4'
    ]
  };

  const taskDiffs = {
    'energy_master': 'medium',
    'climate_action': 'hard',
    'eco_champion': 'hard',
    'innovation_leader': 'hard',
    'biodiversity_protector': 'hard'
  };

  const handleAvatarClick = useCallback((index: number) => {
    const emoji = avatarData.emojis[index];
    const unlocked = avatarData.unlocked[index];
    const task = avatarData.tasks[index];

    if (unlocked) {
      setCurrentSelection(emoji);
    } else if (task) {
      setSelectedTaskId(task);
    }
  }, [avatarData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAvatarClick(index);
    }
  }, [handleAvatarClick]);

  const handleConfirm = useCallback(() => {
    // Handle theme selection
    if (activeTab === 'themes' && selectedTheme && userProgress) {
      const updated = { ...userProgress, profileBackground: selectedTheme };
      saveUserProgress(updated);
      setUserProgress(updated);
      onThemeChange?.(selectedTheme);
      // Close modal after saving to show the change
      setTimeout(() => {
        onClose();
      }, 300);
      return;
    }
    
    // Handle avatar selection
    if (activeTab === 'avatars' && currentSelection) {
      onAvatarSelect(currentSelection);
      onClose();
    }
  }, [activeTab, currentSelection, selectedTheme, userProgress, onAvatarSelect, onThemeChange, onClose]);

  const handleCloseTask = useCallback(() => {
    setSelectedTaskId('');
  }, []);

  const handleCloseLockedTheme = useCallback(() => {
    setSelectedLockedTheme(null);
  }, []);

  // Simple helper functions - no memoization overhead
  const getThemeName = (themeId: string): string => {
    const themeNameKeys: Record<string, string> = {
      'default': 'themeDefaultGradient',
      'forest_gradient': 'themeForestHarmony',
      'solar_energy': 'themeSolarPower',
      'cosmic_nature': 'themeCosmicNature',
      'biodiversity_garden': 'themeBiodiversityGarden',
      'future_tech': 'themeFutureTechnology',
      'iridescent_emerald': 'themeIridescentEmerald',
      'aurora_borealis': 'themeAuroraBorealis',
      'ocean_depths': 'themeOceanDepths',
      'sunset_blaze': 'themeSunsetBlaze',
      'neon_eco': 'themeNeonEco',
      'pastel_dream': 'themePastelDream',
      'prismatic_flow': 'themePrismaticFlow',
      'moonlight_forest': 'themeMoonlightForest'
    };
    return t(themeNameKeys[themeId] || 'all');
  };

  const getThemeDescription = (themeId: string): string => {
    const themeDescKeys: Record<string, string> = {
      'default': 'themeDescDefaultGradient',
      'forest_gradient': 'themeDescForestHarmony',
      'solar_energy': 'themeDescSolarPower',
      'cosmic_nature': 'themeDescCosmicNature',
      'biodiversity_garden': 'themeDescBiodiversityGarden',
      'future_tech': 'themeDescFutureTechnology',
      'iridescent_emerald': 'themeDescIridescentEmerald',
      'aurora_borealis': 'themeDescAuroraBorealis',
      'ocean_depths': 'themeDescOceanDepths',
      'sunset_blaze': 'themeDescSunsetBlaze',
      'neon_eco': 'themeDescNeonEco',
      'pastel_dream': 'themeDescPastelDream',
      'prismatic_flow': 'themeDescPrismaticFlow',
      'moonlight_forest': 'themeDescMoonlightForest'
    };
    return t(themeDescKeys[themeId] || '');
  };

  const getThemeUnlockRequirements = useCallback((themeId: string): string[] => {
    // Define unlock requirements for each locked theme
    const requirements: Record<string, string[]> = {
      solar_energy: [
        t('themeReqSolar1'),
        t('themeReqSolar2'),
        t('themeReqSolar3')
      ],
      cosmic_nature: [
        t('themeReqCosmic1'),
        t('themeReqCosmic2'),
        t('themeReqCosmic3')
      ],
      biodiversity_garden: [
        t('themeReqBiodiversity1'),
        t('themeReqBiodiversity2'),
        t('themeReqBiodiversity3')
      ],
      future_tech: [
        t('themeReqFuture1'),
        t('themeReqFuture2'),
        t('themeReqFuture3')
      ],
      neon_eco: [
        t('themeReqNeon1'),
        t('themeReqNeon2'),
        t('themeReqNeon3')
      ],
      prismatic_flow: [
        t('themeReqPrismatic1'),
        t('themeReqPrismatic2'),
        t('themeReqPrismatic3')
      ]
    };
    return requirements[themeId] || [t('themeReqDefault')];
  }, [t]);

  if (!isOpen) return null;

  // Calculate these only when modal is open
  const unlockedCount = avatarData.unlocked.filter(Boolean).length;
  const selectedName = activeTab === 'themes' 
    ? (selectedTheme ? getThemeName(selectedTheme) : t('all'))
    : (currentSelection ? t(avatarData.nameKeys[avatarData.emojis.indexOf(currentSelection)] || 'all') : t('all'));

  return (
    <>
      <AnimatePresence>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 bg-black/50 z-50 flex items-center",
            isMobile ? "p-3 items-start justify-center pt-4" : "p-4 sm:p-6 items-center justify-center"
          )}
          style={{
            willChange: 'opacity',
            backdropFilter: isMobile ? 'blur(4px)' : 'blur(8px)',
            WebkitBackdropFilter: isMobile ? 'blur(4px)' : 'blur(8px)',
            ...(isMobile ? {
              paddingTop: 'max(1rem, env(safe-area-inset-top))',
              paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
              paddingBottom: 'max(100px, env(safe-area-inset-bottom) + 80px)',
              paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
            } : {}),
            // Allow touch events to pass through to children for scrolling
            touchAction: 'pan-y pinch-zoom',
          }}
          onClick={onClose}
          onTouchStart={(e) => {
            // Only prevent default if clicking backdrop (not modal content)
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              isMobile 
                ? "w-[calc(100vw-1.5rem)] mx-auto"
                : "w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl xl:max-w-7xl"
            )}
            onClick={(e) => e.stopPropagation()}
            style={{
              willChange: 'transform, opacity',
              // Allow vertical scrolling within modal
              touchAction: 'pan-y',
              maxHeight: isMobile && viewportSize.height > 0
                ? `${Math.min(viewportSize.height * 0.88, viewportSize.height - 48)}px`
                : isMobile
                ? 'calc(88dvh - 1.5rem)'
                : 'min(92vh, calc(100vh - 1.5rem))',
              height: isMobile && viewportSize.height > 0
                ? `${Math.min(viewportSize.height * 0.88, viewportSize.height - 48)}px`
                : 'auto',
              maxWidth: isMobile && viewportSize.width > 0
                ? `${Math.min(viewportSize.width - 24, 520)}px`
                : undefined,
              marginBottom: isMobile ? '16px' : undefined,
              position: 'relative',
            }}
          >
            {/* Header - Ultra Compact on Mobile */}
            <div className={cn(
              "relative border-b border-gray-200 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 flex-shrink-0",
              isMobile ? "p-2.5" : "p-4 sm:p-5"
            )}>
              {/* Title and Close - Single Row */}
              <div className={cn(
                "flex items-center justify-between",
                isMobile ? "mb-1.5" : "mb-3"
              )}>
                  <h2 className={cn(
                  "font-bold text-gray-900 truncate flex-1 min-w-0",
                  isMobile ? "text-xs" : "text-xl sm:text-2xl"
                  )}>
                  🎭 {isMobile ? t('avatars') : t('avatarAchievementSystem')}
                  </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={cn(
                    "flex-shrink-0",
                    isMobile ? "h-7 w-7 p-0 ml-1.5" : "h-8 w-8 p-0"
                  )}
                >
                  <X className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </Button>
              </div>

              {/* Tab Navigation - Ultra Compact */}
              <div 
                className={cn(
                  "flex space-x-1 bg-white/50 backdrop-blur-sm rounded-md overflow-x-auto",
                  isMobile ? "p-0.5" : "p-1.5"
                )}
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  touchAction: 'pan-x',
                }}
              >
                <Button
                  variant={activeTab === 'avatars' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('avatars')}
                  className={cn(
                    "whitespace-nowrap flex-shrink-0",
                    isMobile ? "text-[10px] px-1.5 py-0.5 h-7" : "text-xs sm:text-sm px-2 sm:px-3"
                  )}
                >
                  <span>🎭 {t('avatars')}</span>
                </Button>
                <Button
                  variant={activeTab === 'quests' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('quests')}
                  className={cn(
                    "whitespace-nowrap flex-shrink-0",
                    isMobile ? "text-[10px] px-1.5 py-0.5 h-7" : "text-xs sm:text-sm px-2 sm:px-3"
                  )}
                >
                  <span>⚔️ {t('quests')}</span>
                </Button>
                <Button
                  variant={activeTab === 'frames' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('frames')}
                  className={cn(
                    "whitespace-nowrap flex-shrink-0",
                    isMobile ? "text-[10px] px-1.5 py-0.5 h-7" : "text-xs sm:text-sm px-2 sm:px-3"
                  )}
                >
                  <span>🖼️ {t('frames')}</span>
                </Button>
                <Button
                  variant={activeTab === 'themes' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('themes')}
                  className={cn(
                    "whitespace-nowrap flex-shrink-0",
                    isMobile ? "text-[10px] px-1.5 py-0.5 h-7" : "text-xs sm:text-sm px-2 sm:px-3"
                  )}
                >
                  <span>🎨 {t('themes')}</span>
                </Button>
              </div>
            </div>

            {/* Desktop Selection Bar */}
            {!isMobile && (
              <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="text-sm text-gray-600">
                  <span>{t('selected')}: <strong className="text-gray-900">{selectedName}</strong></span>
                </div>
                <div className="flex gap-2.5">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onClose}
                  >
                    {t('cancel')}
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    onClick={handleConfirm}
                    disabled={activeTab === 'themes' ? !selectedTheme : !currentSelection}
                  >
                    {t('confirmSelection')}
                  </Button>
                </div>
              </div>
            )}

            {/* Content - Scrollable with proper touch handling - Maximized */}
            <div 
              className={cn(
                "overflow-y-auto flex-1",
              isMobile 
                  ? "p-3 pb-20" 
                  : "p-4 sm:p-5 lg:p-6"
              )}
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                // Critical: Allow vertical panning for scrolling
                touchAction: 'pan-y',
                maxHeight: isMobile && viewportSize.height > 0
                  ? `${Math.max(250, Math.min(viewportSize.height * 0.80 - 180, viewportSize.height - 200))}px`
                  : isMobile
                  ? 'calc(80dvh - 180px)'
                  : 'calc(92vh - 200px)',
                minHeight: isMobile ? '200px' : '400px',
                paddingBottom: isMobile ? 'calc(90px + env(safe-area-inset-bottom))' : undefined,
              }}
              // Remove touch handlers that block scrolling - let native scrolling work
            >
              {activeTab === 'avatars' && (
                <div className="space-y-4" style={{ contain: 'layout style paint' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('avatarCollection')}</h3>
                    <Badge variant="outline" className="text-xs sm:text-sm self-start sm:self-auto px-2.5 py-1">
                      {unlockedCount}/{avatarData.emojis.length} {t('unlocked')}
                    </Badge>
                  </div>

                  {/* Avatar Grid - Optimized Spacing */}
                  <div 
                    className={cn(
                      "grid",
                    isMobile 
                        ? "grid-cols-2 gap-2.5" 
                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
                    )}
                    style={{ 
                      contain: 'layout style paint',
                      contentVisibility: 'auto',
                    }}
                  >
                    {avatarData.emojis.map((emoji, index) => {
                      const name = t(avatarData.nameKeys[index]);
                      const description = t(avatarData.descKeys[index]);
                      const rarity = avatarData.rarities[index];
                      const unlocked = avatarData.unlocked[index];
                      const isSelected = currentSelection === emoji;
                      
                      let rarityIcon = null;
                      if (rarity === 'rare') rarityIcon = <Star className="h-3 w-3 text-yellow-500" />;
                      else if (rarity === 'epic') rarityIcon = <Trophy className="h-3 w-3 text-yellow-500" />;
                      else if (rarity === 'legendary') rarityIcon = <Zap className="h-3 w-3 text-yellow-500" />;
                      
                      let rarityStyles = 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100';
                      if (rarity === 'rare') rarityStyles = 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100';
                      else if (rarity === 'epic') rarityStyles = 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100';
                      else if (rarity === 'legendary') rarityStyles = 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100';

                      let rarityBadgeStyles = 'border-gray-400 text-gray-700 bg-gray-50';
                      if (rarity === 'rare') rarityBadgeStyles = 'border-blue-400 text-blue-700 bg-blue-50';
                      else if (rarity === 'epic') rarityBadgeStyles = 'border-purple-400 text-purple-700 bg-purple-50';
                      else if (rarity === 'legendary') rarityBadgeStyles = 'border-yellow-400 text-yellow-700 bg-yellow-50';
                      
                      return (
                        <motion.div
                          key={`avatar-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ 
                            // Reduced delay for faster initial render - batch animations
                            delay: isMobile ? Math.min(index * 0.008, 0.08) : Math.min(index * 0.015, 0.12),
                            duration: 0.2,
                            ease: "easeOut"
                          }}
                          className="relative"
                        >
                          <div
                            className={cn(
                              'relative flex flex-col items-center rounded-xl transition-all duration-300 cursor-pointer border-2',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                              'transform hover:scale-105 hover:shadow-lg active:scale-95',
                              isMobile ? 'p-2.5 min-h-[160px]' : 'p-3 sm:p-4 min-h-[170px] sm:min-h-[190px]',
                              unlocked 
                                ? 'hover:bg-gray-50' 
                                : 'opacity-90 hover:opacity-100 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 hover:border-orange-300 hover:shadow-orange-200/50',
                              isSelected && unlocked
                                ? 'bg-blue-50 ring-2 ring-blue-500 shadow-md' 
                                : '',
                              rarityStyles
                            )}
                            tabIndex={0}
                            role="button"
                            aria-label={`${name} - ${unlocked ? 'Available' : 'Locked'} - ${description}`}
                            onClick={() => handleAvatarClick(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          >
                            {/* Rarity indicator */}
                            {rarity !== 'common' && (
                              <div className="absolute -top-1 -right-1 z-20 p-1 rounded-full bg-white shadow-md border">
                                {rarityIcon}
                              </div>
                            )}

                            {/* Lock indicator */}
                            {!unlocked && (
                              <div className="absolute -top-1 -left-1 z-20">
                                <div className={cn(
                                  "flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg border-2 border-white",
                                  isMobile ? "w-5 h-5" : "w-6 h-6 sm:w-8 sm:h-8"
                                )}>
                                  <Lock className={cn(
                                    "text-white",
                                    isMobile ? "h-2 w-2" : "h-3 w-3 sm:h-4 sm:w-4"
                                  )} />
                                </div>
                              </div>
                            )}

                            {/* Avatar */}
                            <div className={cn("relative z-10", isMobile ? "mb-1" : "mb-2 sm:mb-3")}>
                              <EnhancedAvatar
                                emoji={emoji}
                                image={avatarData.images[index]}
                                size={isMobile ? "md" : "md"}
                                glowColor={unlocked ? 'green' : 'yellow'}
                                className={!unlocked ? 'grayscale brightness-75' : ''}
                                noBackground={true}
                              />
                            </div>

                            {/* Avatar info */}
                            <div className="text-center relative z-10 space-y-1.5 flex-1 flex flex-col justify-between w-full">
                              <div className="w-full">
                                <h4 className={cn("font-semibold text-gray-900 line-clamp-1", isMobile ? "text-xs" : "text-sm")}>
                                  {name}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={cn('text-xs mb-1.5 mt-1', rarityBadgeStyles)}
                                >
                                  {t(rarity)}
                                </Badge>
                                {!isMobile && (
                                  <p className="text-xs text-gray-600 leading-relaxed px-1 line-clamp-2 mt-1">
                                    {description}
                                  </p>
                                )}
                              </div>

                              {/* Status indicator */}
                              <div className="flex items-center justify-center mt-1">
                                {unlocked ? (
                                  <div className="flex items-center text-green-600 text-xs">
                                    <CheckCircle className="h-2 w-2 mr-1" />
                                    <span className={isMobile ? "text-xs" : ""}>{t('available')}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-orange-600 text-xs">
                                    <Unlock className="h-2 w-2 mr-1" />
                                    <span className={isMobile ? "text-xs" : ""}>{t('unlock')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quests Tab */}
              {activeTab === 'quests' && (
                <div className="text-center py-6 sm:py-12">
                  <p className="text-gray-500 text-sm sm:text-base">
                    ⚔️ {t('questSystemComingSoon')}
                  </p>
                </div>
              )}

              {/* Frames Tab */}
              {activeTab === 'frames' && (
                <div className="text-center py-6 sm:py-12">
                  <p className="text-gray-500 text-sm sm:text-base">
                    🖼️ {t('avatarFramesComingSoon')}
                  </p>
                </div>
              )}

              {/* Themes Tab - Full Implementation */}
              {activeTab === 'themes' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header with Preview */}
                  <div className="mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      🎨 {t('profileThemes')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {t('customizeProfileBadge')}
                    </p>
                  </div>

                  {/* Category Filter */}
                  <div 
                    className="flex items-center gap-2 overflow-x-auto pb-2"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                      touchAction: 'pan-x',
                    }}
                  >
                    <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex gap-2">
                      {['all', 'nature', 'energy', 'cosmic', 'ocean', 'sunset', 'neon', 'pastel'].map((cat) => (
                        <Button
                          key={cat}
                          variant={themeCategory === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setThemeCategory(cat)}
                          className="text-xs whitespace-nowrap"
                        >
                          {cat === 'all' ? t('all') : t(`category${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview */}
                  {selectedTheme && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3">{t('livePreview')}</p>
                        <div 
                          className="relative h-32 sm:h-40 rounded-lg overflow-hidden shadow-lg"
                          style={{
                            background: PROFILE_BACKGROUNDS[selectedTheme]?.gradient || PROFILE_BACKGROUNDS.default.gradient,
                            position: 'relative'
                          }}
                        >
                          {/* Iridescent animation overlay */}
                          {/* Optimized: Only render animation if visible and reduce complexity */}
                          {PROFILE_BACKGROUNDS[selectedTheme]?.animation === 'shimmer' && (
                            <motion.div
                              animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                                // Reduce animation complexity for performance
                                type: "tween"
                              }}
                              className="absolute inset-0 opacity-20"
                              style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                                backgroundSize: '200% 100%',
                                willChange: 'background-position',
                              }}
                            />
                          )}
                          {PROFILE_BACKGROUNDS[selectedTheme]?.animation === 'aurora' && (
                            <motion.div
                              animate={{
                                rotate: [0, 360]
                              }}
                              transition={{
                                duration: 12,
                                repeat: Infinity,
                                ease: "linear",
                                type: "tween"
                              }}
                              className="absolute inset-0 opacity-15"
                              style={{
                                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                                width: '150%',
                                height: '150%',
                                willChange: 'transform',
                              }}
                            />
                          )}
                          {PROFILE_BACKGROUNDS[selectedTheme]?.animation === 'flow' && (
                            <motion.div
                              animate={{
                                backgroundPosition: ['0% 0%', '100% 100%']
                              }}
                              transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "reverse",
                                type: "tween"
                              }}
                              className="absolute inset-0 opacity-20"
                              style={{
                                background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)`,
                                backgroundSize: '200% 200%',
                                willChange: 'background-position',
                              }}
                            />
                          )}
                          {PROFILE_BACKGROUNDS[selectedTheme]?.animation === 'pulse' && (
                            <motion.div
                              animate={{
                                opacity: [0.1, 0.2, 0.1]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                type: "tween"
                              }}
                              className="absolute inset-0"
                              style={{
                                background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
                                willChange: 'opacity',
                              }}
                            />
                          )}
                          
                          {/* Preview Content */}
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="text-center">
                              <EnhancedAvatar
                                emoji={selectedAvatar || '👩‍🌾'}
                                image={selectedAvatar ? avatarData.images[avatarData.emojis.indexOf(selectedAvatar)] : avatarData.images[0]}
                                size="lg"
                                glowColor="green"
                                noBackground={true}
                              />
                              <p className="text-white text-xs font-semibold mt-2 drop-shadow-lg">
                                {userProgress?.name || getUserName()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          {getThemeDescription(selectedTheme)}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Theme Grid */}
                  <div className={cn(
                    "grid gap-3 sm:gap-4",
                    isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  )}>
                    {Object.entries(PROFILE_BACKGROUNDS)
                      .filter(([_, theme]) => themeCategory === 'all' || theme.category === themeCategory)
                      .map(([themeId, theme]) => {
                        const isSelected = selectedTheme === themeId;
                        const isUnlocked = theme.unlocked;
                        
                        return (
                          <motion.div
                            key={themeId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              delay: isMobile ? Math.min(Object.keys(PROFILE_BACKGROUNDS).indexOf(themeId) * 0.008, 0.08) : Math.min(Object.keys(PROFILE_BACKGROUNDS).indexOf(themeId) * 0.015, 0.12),
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            className="relative"
                          >
                            <div
                              className={cn(
                                "relative flex flex-col rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                "transform hover:scale-105 hover:shadow-lg active:scale-95",
                                isUnlocked 
                                  ? 'hover:bg-gray-50' 
                                  : 'opacity-90 hover:opacity-100 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 hover:border-orange-300 hover:shadow-orange-200/50',
                                isSelected && isUnlocked
                                  ? 'bg-blue-50 ring-2 ring-blue-500 shadow-md' 
                                  : '',
                                !isUnlocked && "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
                              )}
                              onClick={() => {
                                if (isUnlocked) {
                                  setSelectedTheme(themeId);
                                } else {
                                  setSelectedLockedTheme(themeId);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`${getThemeName(themeId)} - ${isUnlocked ? 'Available' : 'Locked'} - ${getThemeDescription(themeId)}`}
                            >
                              {/* Lock indicator - Top Left */}
                              {!isUnlocked && (
                                <div className="absolute -top-1 -left-1 z-20">
                                  <motion.div
                                    className={cn(
                                      "flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg border-2 border-white",
                                      isMobile ? "w-6 h-6" : "w-7 h-7 sm:w-8 sm:h-8"
                                    )}
                                    animate={{
                                      scale: [1, 1.1, 1],
                                      rotate: [0, -5, 5, 0]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    <Lock className={cn(
                                      "text-white",
                                      isMobile ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"
                                    )} />
                                  </motion.div>
                                </div>
                              )}

                              {/* Theme Preview */}
                              <div 
                                className={cn(
                                  "relative overflow-hidden",
                                  isMobile ? "h-24" : "h-28 sm:h-32"
                                )}
                                style={{
                                  background: theme.gradient,
                                  filter: !isUnlocked ? 'grayscale(0.8) brightness(0.6)' : 'none'
                                }}
                              >
                                {/* Animation Overlays - Only show for unlocked themes */}
                                {isUnlocked && theme.animation === 'shimmer' && (
                                  <motion.div
                                    animate={{
                                      x: ['-100%', '200%']
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      ease: "linear",
                                      type: "tween"
                                    }}
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                                      transform: 'skewX(-20deg)',
                                      willChange: 'transform',
                                    }}
                                  />
                                )}
                                {isUnlocked && theme.animation === 'aurora' && (
                                  <motion.div
                                    animate={{
                                      rotate: [0, 360]
                                    }}
                                    transition={{
                                      duration: 10,
                                      repeat: Infinity,
                                      ease: "linear",
                                      type: "tween"
                                    }}
                                    className="absolute inset-0 opacity-15"
                                    style={{
                                      background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                                      willChange: 'transform',
                                    }}
                                  />
                                )}
                                {isUnlocked && theme.animation === 'flow' && (
                                  <motion.div
                                    animate={{
                                      backgroundPosition: ['0% 0%', '100% 100%']
                                    }}
                                    transition={{
                                      duration: 5,
                                      repeat: Infinity,
                                      ease: "linear",
                                      repeatType: "reverse",
                                      type: "tween"
                                    }}
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                      background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                                      backgroundSize: '200% 200%',
                                      willChange: 'background-position',
                                    }}
                                  />
                                )}
                                {isUnlocked && theme.animation === 'pulse' && (
                                  <motion.div
                                    animate={{
                                      opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      type: "tween"
                                    }}
                                    className="absolute inset-0"
                                    style={{
                                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                      willChange: 'opacity',
                                    }}
                                  />
                                )}

                                {/* Lock Overlay - Darkened background for locked themes */}
                                {!isUnlocked && (
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/60 flex items-center justify-center z-10"
                                    animate={{
                                      opacity: [0.5, 0.6, 0.5]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, -5, 5, 0]
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                      }}
                                    >
                                      <Lock className={cn(
                                        "text-white drop-shadow-lg",
                                        isMobile ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12"
                                      )} />
                                    </motion.div>
                                  </motion.div>
                                )}

                                {/* Selected Indicator - Top Right */}
                                {isSelected && isUnlocked && (
                                  <div className="absolute top-2 right-2 z-20">
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="bg-green-500 rounded-full p-1.5 shadow-lg"
                                    >
                                      <CheckCircle className={cn(
                                        "text-white",
                                        isMobile ? "h-3 w-3" : "h-4 w-4"
                                      )} />
                                    </motion.div>
                                  </div>
                                )}

                                {/* Category Badge - Bottom Left */}
                                <div className="absolute bottom-2 left-2 z-20">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs backdrop-blur-sm",
                                      isUnlocked 
                                        ? "bg-white/80 border-white/50" 
                                        : "bg-gray-800/80 border-gray-600/50 text-gray-200"
                                    )}
                                  >
                                    {t(`category${theme.category.charAt(0).toUpperCase() + theme.category.slice(1)}`)}
                                  </Badge>
                                </div>
                              </div>

                              {/* Theme Info */}
                              <div className={cn(
                                "p-3 flex-1 flex flex-col justify-between",
                                isUnlocked ? "bg-white" : "bg-gray-50"
                              )}>
                                <div className="w-full">
                                  <h4 className={cn(
                                    "font-semibold line-clamp-1 mb-1",
                                    isMobile ? "text-xs" : "text-sm",
                                    isUnlocked ? "text-gray-900" : "text-gray-600"
                                  )}>
                                    {getThemeName(themeId)}
                                  </h4>
                                  <p className={cn(
                                    "line-clamp-2",
                                    isMobile ? "text-[10px]" : "text-xs",
                                    isUnlocked ? "text-gray-600" : "text-gray-500"
                                  )}>
                                    {getThemeDescription(themeId)}
                                  </p>
                                  {isUnlocked && theme.animation && theme.animation !== 'none' && (
                                    <div className="mt-2 flex items-center gap-1">
                                      <Sparkles className={cn(
                                        "text-purple-500",
                                        isMobile ? "h-2.5 w-2.5" : "h-3 w-3"
                                      )} />
                                      <span className={cn(
                                        "text-purple-600 capitalize",
                                        isMobile ? "text-[10px]" : "text-xs"
                                      )}>
                                        {theme.animation}
                                      </span>
                                    </div>
                                  )}
                                  {!isUnlocked && (
                                    <div className="mt-2 flex items-center gap-1">
                                      <Sparkles className={cn(
                                        "text-gray-400",
                                        isMobile ? "h-2.5 w-2.5" : "h-3 w-3"
                                      )} />
                                      <span className={cn(
                                        "text-gray-500 capitalize",
                                        isMobile ? "text-[10px]" : "text-xs"
                                      )}>
                                        {theme.animation}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Status indicator */}
                                <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-200">
                                  {isUnlocked ? (
                                    <div className="flex items-center text-green-600 text-xs">
                                      <CheckCircle className={cn(
                                        "mr-1",
                                        isMobile ? "h-2 w-2" : "h-2.5 w-2.5"
                                      )} />
                                      <span className={isMobile ? "text-[10px]" : "text-xs"}>{t('available')}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-orange-600 text-xs">
                                      <Unlock className={cn(
                                        "mr-1",
                                        isMobile ? "h-2 w-2" : "h-2.5 w-2.5"
                                      )} />
                                      <span className={isMobile ? "text-[10px]" : "text-xs"}>{t('unlock')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                </div>
              )}
            </div>

            {/* Mobile Sticky Bottom Action Bar - Always visible when selection is made */}
            {isMobile && (
              <div 
                className={cn(
                  "absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30 flex-shrink-0",
                  (activeTab === 'themes' ? selectedTheme : currentSelection) ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                style={{
                  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                  paddingTop: '12px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  transform: 'translateZ(0)', // Force hardware acceleration
                  willChange: 'transform',
                }}
              >
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className={cn(
                      "flex-1 font-medium border-2",
                      isMobile ? "h-11 text-sm" : "h-10 text-sm"
                    )}
                  >
                    {t('cancel')}
                  </Button>
                  <Button 
                    className={cn(
                      "flex-1 font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg",
                      isMobile ? "h-11 text-sm" : "h-10 text-sm"
                    )}
                    onClick={handleConfirm}
                    disabled={activeTab === 'themes' ? !selectedTheme : !currentSelection}
                  >
                    {t('confirm')}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {selectedTaskId && taskTitleKeys[selectedTaskId] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4"
            onClick={handleCloseTask}
            onTouchStart={(e) => {
              // Only prevent if clicking backdrop directly
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col",
                isMobile 
                  ? "w-[calc(100vw-1.5rem)] mx-auto"
                  : "w-full max-w-sm sm:max-w-md"
              )}
              onClick={(e) => e.stopPropagation()}
              style={{
                // Critical: Allow vertical scrolling
                touchAction: 'pan-y',
                maxHeight: isMobile && viewportSize.height > 0
                  ? `${Math.min(viewportSize.height * 0.85, viewportSize.height - 32)}px`
                  : isMobile
                  ? '85dvh'
                  : 'min(85vh, calc(100vh - 2rem))',
                height: isMobile && viewportSize.height > 0
                  ? `${Math.min(viewportSize.height * 0.85, viewportSize.height - 32)}px`
                  : 'auto',
                maxWidth: isMobile && viewportSize.width > 0
                  ? `${Math.min(viewportSize.width - 24, 400)}px`
                  : undefined,
              }}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {t(taskTitleKeys[selectedTaskId])}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseTask}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Badge className={cn('text-xs', 
                  taskDiffs[selectedTaskId] === 'easy' ? 'bg-green-100 text-green-800 border-green-300' :
                  taskDiffs[selectedTaskId] === 'hard' ? 'bg-red-100 text-red-800 border-red-300' :
                  'bg-yellow-100 text-yellow-800 border-yellow-300'
                )}>
                  {t(taskDiffs[selectedTaskId])} {t('challenge')}
                </Badge>
              </div>
              
              <div 
                className="p-4 sm:p-6 overflow-y-auto flex-1"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  touchAction: 'pan-y',
                  maxHeight: isMobile && viewportSize.height > 0
                    ? `${Math.max(150, Math.min(viewportSize.height * 0.85 - 180, viewportSize.height - 212))}px`
                    : isMobile
                    ? 'calc(85dvh - 180px)'
                    : 'calc(85vh - 180px)',
                  minHeight: isMobile ? '150px' : '200px',
                }}
                // Removed touch handlers that were blocking native scroll
              >
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                  {t(taskDescKeys[selectedTaskId])}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('requirements')}:</h4>
                    <ul className="space-y-2">
                      {taskReqKeys[selectedTaskId] && taskReqKeys[selectedTaskId].map((reqKey, index) => (
                        <li key={`req-${index}`} className="flex items-start text-sm text-gray-600">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {t(reqKey)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-green-900 mb-1">{t('reward')}:</h4>
                    <p className="text-sm text-green-700">{t(taskRewardKeys[selectedTaskId])}</p>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "border-t border-gray-200 bg-gray-50",
                isMobile ? "p-3" : "p-4 sm:p-6"
              )}>
                <div className={cn(
                  isMobile ? "flex flex-col gap-2" : "flex flex-col sm:flex-row gap-2 sm:gap-3"
                )}>
                  {isMobile ? (
                    <>
                      <Button
                        className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 active:scale-95 transition-all duration-200"
                      >
                        {t('startChallenge')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCloseTask}
                        className="w-full h-10 text-sm font-medium border-2 active:scale-95 transition-all duration-200"
                      >
                        {t('close')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCloseTask}
                        className="flex-1 order-2 sm:order-1"
                      >
                        {t('close')}
                      </Button>
                      <Button
                        className="flex-1 order-1 sm:order-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        {t('startChallenge')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked Theme Modal */}
      <AnimatePresence>
        {selectedLockedTheme && PROFILE_BACKGROUNDS[selectedLockedTheme] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4"
            onClick={handleCloseLockedTheme}
            onTouchStart={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col",
                isMobile 
                  ? "w-[calc(100vw-1.5rem)] mx-auto"
                  : "w-full max-w-sm sm:max-w-md"
              )}
              onClick={(e) => e.stopPropagation()}
              style={{
                touchAction: 'pan-y',
                maxHeight: isMobile && viewportSize.height > 0
                  ? `${Math.min(viewportSize.height * 0.85, viewportSize.height - 32)}px`
                  : isMobile
                  ? '85dvh'
                  : 'min(85vh, calc(100vh - 2rem))',
                maxWidth: isMobile && viewportSize.width > 0
                  ? `${Math.min(viewportSize.width - 24, 400)}px`
                  : undefined,
              }}
            >
              {/* Header with Theme Preview */}
              <div className="relative">
                <div 
                  className="h-32 sm:h-40 relative overflow-hidden"
                  style={{
                    background: PROFILE_BACKGROUNDS[selectedLockedTheme].gradient
                  }}
                >
                  {/* Lock overlay - semi-transparent */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Lock className={cn(
                        "text-white drop-shadow-lg",
                        isMobile ? "h-12 w-12" : "h-16 w-16"
                      )} />
                    </motion.div>
                  </div>
                  
                  {/* Theme animation overlays - show actual animations */}
                  {PROFILE_BACKGROUNDS[selectedLockedTheme].animation === 'shimmer' && (
                    <motion.div
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        type: "tween"
                      }}
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        transform: 'skewX(-20deg)',
                        willChange: 'transform',
                      }}
                    />
                  )}
                  {PROFILE_BACKGROUNDS[selectedLockedTheme].animation === 'aurora' && (
                    <motion.div
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        type: "tween"
                      }}
                      className="absolute inset-0 opacity-15"
                      style={{
                        background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                        willChange: 'transform',
                      }}
                    />
                  )}
                  {PROFILE_BACKGROUNDS[selectedLockedTheme].animation === 'flow' && (
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%']
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "reverse",
                        type: "tween"
                      }}
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                        backgroundSize: '200% 200%',
                        willChange: 'background-position',
                      }}
                    />
                  )}
                  {PROFILE_BACKGROUNDS[selectedLockedTheme].animation === 'pulse' && (
                    <motion.div
                      animate={{
                        opacity: [0.1, 0.2, 0.1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        type: "tween"
                      }}
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                        willChange: 'opacity',
                      }}
                    />
                  )}
                </div>
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg mb-2">
                      {getThemeName(selectedLockedTheme)}
                    </h3>
                    <Badge className="bg-orange-500 text-white border-orange-400 text-xs">
                      {t('locked')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseLockedTheme}
                    className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div 
                className="p-4 sm:p-6 overflow-y-auto flex-1"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  touchAction: 'pan-y',
                  maxHeight: isMobile && viewportSize.height > 0
                    ? `${Math.max(150, Math.min(viewportSize.height * 0.85 - 200, viewportSize.height - 232))}px`
                    : isMobile
                    ? 'calc(85dvh - 200px)'
                    : 'calc(85vh - 200px)',
                  minHeight: isMobile ? '150px' : '200px',
                }}
              >
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                  {getThemeDescription(selectedLockedTheme)}
                </p>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('unlockRequirements')}:</h4>
                  <ul className="space-y-2">
                    {getThemeUnlockRequirements(selectedLockedTheme).map((req, index) => (
                      <li key={`req-${index}`} className="flex items-start text-sm text-gray-600">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Footer */}
              <div className={cn(
                "border-t border-gray-200 bg-gray-50",
                isMobile ? "p-3" : "p-4 sm:p-6"
              )}>
                <Button 
                  variant="outline"
                  onClick={handleCloseLockedTheme}
                  className="w-full h-10 text-sm font-medium border-2 active:scale-95 transition-all duration-200"
                >
                  {t('close')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};