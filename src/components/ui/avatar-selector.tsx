import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Star, Trophy, Target, Zap, CheckCircle, Clock, Play, Gift } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { cn } from '@/lib/utils';
import { EnhancedAvatar } from './enhanced-avatar';

interface Avatar {
  emoji: string;
  name: string;
  glowColor: 'green' | 'blue' | 'purple' | 'yellow' | 'red';
  unlocked: boolean;
  requirement?: {
    type: 'level' | 'coins' | 'waste' | 'events' | 'badges' | 'referrals';
    value: number;
    description: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  task?: {
    title: string;
    description: string;
    reward: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
  };
}

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onAvatarSelect: (emoji: string) => void;
}

// Mock user progress data - in real app this would come from props or context
const USER_PROGRESS = {
  level: 15,
  ecoCoins: 250,
  wasteCollected: 85.5,
  eventsAttended: 12,
  badgesEarned: 8,
  referrals: 5
};

const AVATARS: Avatar[] = [
  // Common avatars (always unlocked)
  { 
    emoji: '👩‍🌾', 
    name: 'Eco Farmer', 
    glowColor: 'green', 
    unlocked: true, 
    rarity: 'common' 
  },
  { 
    emoji: '🌱', 
    name: 'Green Sprout', 
    glowColor: 'green', 
    unlocked: true, 
    rarity: 'common' 
  },
  { 
    emoji: '🌿', 
    name: 'Leaf Guardian', 
    glowColor: 'green', 
    unlocked: true, 
    rarity: 'common' 
  },
  
  // Rare avatars (level/activity based)
  { 
    emoji: '🌳', 
    name: 'Tree Protector', 
    glowColor: 'green', 
    unlocked: USER_PROGRESS.level >= 3,
    requirement: { type: 'level', value: 3, description: 'Reach Level 3' },
    rarity: 'rare',
    task: {
      title: 'Plant 5 Trees',
      description: 'Join a tree planting event in your local community',
      reward: 'Unlock Tree Protector avatar + 100 EcoCoins',
      difficulty: 'easy',
      estimatedTime: '2-3 hours'
    }
  },
  { 
    emoji: '🌲', 
    name: 'Forest Keeper', 
    glowColor: 'green', 
    unlocked: USER_PROGRESS.wasteCollected >= 25,
    requirement: { type: 'waste', value: 25, description: 'Collect 25kg of waste' },
    rarity: 'rare',
    task: {
      title: 'Forest Cleanup Mission',
      description: 'Organize a forest cleanup and collect 25kg of waste',
      reward: 'Unlock Forest Keeper avatar + Special Forest Badge',
      difficulty: 'medium',
      estimatedTime: '1 day'
    }
  },
  { 
    emoji: '♻️', 
    name: 'Recycling Hero', 
    glowColor: 'blue', 
    unlocked: USER_PROGRESS.ecoCoins >= 500,
    requirement: { type: 'coins', value: 500, description: 'Earn 500 EcoCoins' },
    rarity: 'rare',
    task: {
      title: 'Recycling Champion',
      description: 'Sort and recycle 100 items correctly',
      reward: 'Unlock Recycling Hero avatar + Recycling Master Badge',
      difficulty: 'easy',
      estimatedTime: '3-4 hours'
    }
  },
  { 
    emoji: '🌍', 
    name: 'Earth Guardian', 
    glowColor: 'blue', 
    unlocked: USER_PROGRESS.eventsAttended >= 5,
    requirement: { type: 'events', value: 5, description: 'Attend 5 eco events' },
    rarity: 'rare',
    task: {
      title: 'Community Earth Day',
      description: 'Attend 5 environmental awareness events',
      reward: 'Unlock Earth Guardian avatar + Community Leader Badge',
      difficulty: 'medium',
      estimatedTime: '2 weeks'
    }
  },
  
  // Epic avatars (higher requirements)
  { 
    emoji: '💧', 
    name: 'Water Saver', 
    glowColor: 'blue', 
    unlocked: USER_PROGRESS.level >= 6,
    requirement: { type: 'level', value: 6, description: 'Reach Level 6' },
    rarity: 'epic',
    task: {
      title: 'Water Conservation Project',
      description: 'Install water-saving devices and track usage for 30 days',
      reward: 'Unlock Water Saver avatar + 300 EcoCoins + Water Guardian Badge',
      difficulty: 'hard',
      estimatedTime: '30 days'
    }
  },
  { 
    emoji: '☀️', 
    name: 'Solar Champion', 
    glowColor: 'yellow', 
    unlocked: USER_PROGRESS.badgesEarned >= 4,
    requirement: { type: 'badges', value: 4, description: 'Earn 4 achievement badges' },
    rarity: 'epic',
    task: {
      title: 'Solar Energy Advocate',
      description: 'Promote solar energy adoption in your community',
      reward: 'Unlock Solar Champion avatar + Solar Power Badge + 250 EcoCoins',
      difficulty: 'hard',
      estimatedTime: '2-3 weeks'
    }
  },
  { 
    emoji: '⚡', 
    name: 'Energy Saver', 
    glowColor: 'yellow', 
    unlocked: USER_PROGRESS.wasteCollected >= 40,
    requirement: { type: 'waste', value: 40, description: 'Collect 40kg of waste' },
    rarity: 'epic',
    task: {
      title: 'Energy Efficiency Challenge',
      description: 'Reduce household energy consumption by 25%',
      reward: 'Unlock Energy Saver avatar + Energy Master Badge',
      difficulty: 'medium',
      estimatedTime: '1 month'
    }
  },
  { 
    emoji: '🔥', 
    name: 'Climate Warrior', 
    glowColor: 'red', 
    unlocked: USER_PROGRESS.ecoCoins >= 1000,
    requirement: { type: 'coins', value: 1000, description: 'Earn 1000 EcoCoins' },
    rarity: 'epic',
    task: {
      title: 'Climate Action Leader',
      description: 'Lead a climate awareness campaign in your area',
      reward: 'Unlock Climate Warrior avatar + Leadership Badge + 500 EcoCoins',
      difficulty: 'hard',
      estimatedTime: '1-2 months'
    }
  },
  
  // Legendary avatars (very high requirements)
  { 
    emoji: '🌟', 
    name: 'Eco Star', 
    glowColor: 'yellow', 
    unlocked: USER_PROGRESS.level >= 10,
    requirement: { type: 'level', value: 10, description: 'Reach Level 10' },
    rarity: 'legendary',
    task: {
      title: 'Environmental Excellence',
      description: 'Complete all eco challenges and become a community leader',
      reward: 'Unlock Eco Star avatar + Legendary Status + 1000 EcoCoins',
      difficulty: 'hard',
      estimatedTime: '3-6 months'
    }
  },
  { 
    emoji: '🔮', 
    name: 'Future Visionary', 
    glowColor: 'purple', 
    unlocked: USER_PROGRESS.eventsAttended >= 15,
    requirement: { type: 'events', value: 15, description: 'Attend 15 eco events' },
    rarity: 'legendary',
    task: {
      title: 'Sustainability Innovation',
      description: 'Develop and implement a new sustainability initiative',
      reward: 'Unlock Future Visionary avatar + Innovation Badge + Special Recognition',
      difficulty: 'hard',
      estimatedTime: '6+ months'
    }
  },
  { 
    emoji: '🦋', 
    name: 'Nature Lover', 
    glowColor: 'purple', 
    unlocked: USER_PROGRESS.badgesEarned >= 8,
    requirement: { type: 'badges', value: 8, description: 'Earn 8 achievement badges' },
    rarity: 'legendary',
    task: {
      title: 'Biodiversity Guardian',
      description: 'Create and maintain a wildlife habitat garden',
      reward: 'Unlock Nature Lover avatar + Biodiversity Badge + Garden Kit',
      difficulty: 'hard',
      estimatedTime: '4-6 months'
    }
  },
  { 
    emoji: '🌸', 
    name: 'Bloom Tender', 
    glowColor: 'purple', 
    unlocked: USER_PROGRESS.referrals >= 5,
    requirement: { type: 'referrals', value: 5, description: 'Refer 5 friends' },
    rarity: 'legendary',
    task: {
      title: 'Community Growth',
      description: 'Build a network of 5 eco-conscious friends',
      reward: 'Unlock Bloom Tender avatar + Community Builder Badge + Bonus Rewards',
      difficulty: 'medium',
      estimatedTime: '2-3 months'
    }
  }
];

const rarityColors = {
  common: 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100',
  rare: 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100',
  epic: 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100',
  legendary: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100'
};

const rarityIcons = {
  common: null,
  rare: Star,
  epic: Trophy,
  legendary: Zap
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200'
};

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarSelect
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(
    AVATARS.find(avatar => avatar.emoji === currentAvatar) || null
  );
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showTaskModal, setShowTaskModal] = useState<Avatar | null>(null);

  // Sort avatars: unlocked first, then by rarity (legendary > epic > rare > common)
  const sortedAvatars = useMemo(() => {
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    
    return [...AVATARS].sort((a, b) => {
      // First sort by unlocked status (unlocked first)
      if (a.unlocked !== b.unlocked) {
        return a.unlocked ? -1 : 1;
      }
      
      // Then sort by rarity (highest first)
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  }, []);

  const filteredAvatars = useMemo(() => {
    switch (filter) {
      case 'unlocked':
        return sortedAvatars.filter(avatar => avatar.unlocked);
      case 'locked':
        return sortedAvatars.filter(avatar => !avatar.unlocked);
      default:
        return sortedAvatars;
    }
  }, [sortedAvatars, filter]);

  const handleAvatarClick = (avatar: Avatar) => {
    if (!avatar.unlocked) {
      if (avatar.task) {
        setShowTaskModal(avatar);
      }
      return;
    }
    setSelectedAvatar(avatar);
  };

  const handleConfirm = () => {
    if (selectedAvatar && selectedAvatar.unlocked) {
      // Fixed: Pass only the emoji string, not the full avatar object
      onAvatarSelect(selectedAvatar.emoji);
      onClose();
    }
  };

  const getProgressPercentage = (requirement: Avatar['requirement']) => {
    if (!requirement) return 100;
    
    const current = USER_PROGRESS[requirement.type as keyof typeof USER_PROGRESS];
    return Math.min((current / requirement.value) * 100, 100);
  };

  const handleStartTask = (avatar: Avatar) => {
    // In a real app, this would start the task tracking
    // Starting task for avatar selection
    setShowTaskModal(null);
    // Show success message or navigate to task page
  };

  if (!isOpen) return null;

  const unlockedCount = AVATARS.filter(a => a.unlocked).length;
  const totalCount = AVATARS.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header with Animated Background */}
          <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-20 h-20 bg-green-400/20 rounded-full blur-xl"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute top-10 right-10 w-16 h-16 bg-blue-400/20 rounded-full blur-lg"
                animate={{
                  x: [0, -80, 0],
                  y: [0, 60, 0],
                  scale: [1, 0.8, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <motion.h2 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  🎭 Avatar Collection
                </motion.h2>
                <div className="flex items-center space-x-4 mt-2">
                  <motion.p 
                    className="text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Collection: {unlockedCount}/{totalCount} unlocked
                  </motion.p>
                  <div className="flex space-x-2">
                    {(['all', 'unlocked', 'locked'] as const).map((filterType, index) => (
                      <motion.div
                        key={filterType}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Button
                          variant={filter === filterType ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter(filterType)}
                          className="text-xs"
                        >
                          {filterType === 'all' ? 'All' : 
                           filterType === 'unlocked' ? 'Unlocked' : 'Locked'}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAvatars.map((avatar, index) => {
                const RarityIcon = rarityIcons[avatar.rarity];
                const isSelected = selectedAvatar?.emoji === avatar.emoji;
                
                return (
                  <motion.div
                    key={`${avatar.emoji}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200",
                      "hover:scale-105 border-2 overflow-hidden",
                      avatar.unlocked 
                        ? "hover:bg-gray-50 dark:hover:bg-gray-800" 
                        : "opacity-80 hover:opacity-100",
                      isSelected && avatar.unlocked
                        ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500" 
                        : "",
                      rarityColors[avatar.rarity]
                    )}
                    onClick={() => handleAvatarClick(avatar)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated Background for Rarity */}
                    {avatar.rarity === 'legendary' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-yellow-200/30 via-orange-200/30 to-yellow-200/30"
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    )}

                    {/* Rarity indicator */}
                    {RarityIcon && (
                      <motion.div 
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md border"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                      >
                        <RarityIcon className="h-3 w-3 text-yellow-500" />
                      </motion.div>
                    )}
                    
                    {/* Enhanced Lock indicator for locked avatars */}
                    {!avatar.unlocked && (
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-sm"
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                      >
                        <motion.div 
                          className="bg-white/95 rounded-full p-3 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(59, 130, 246, 0.4)',
                              '0 0 0 10px rgba(59, 130, 246, 0)',
                              '0 0 0 0 rgba(59, 130, 246, 0)'
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity
                          }}
                        >
                          <Lock className="h-4 w-4 text-gray-600" />
                        </motion.div>
                        {avatar.task && (
                          <motion.div
                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                              <Play className="h-2 w-2 mr-1" />
                              Task Available
                            </Badge>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Avatar with enhanced animations */}
                    <motion.div
                      whileHover={{ 
                        scale: avatar.unlocked ? 1.1 : 1.05,
                        rotate: avatar.unlocked ? [0, -5, 5, 0] : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <EnhancedAvatar
                        emoji={avatar.emoji}
                        size="lg"
                        glowColor={avatar.glowColor}
                        className={!avatar.unlocked ? "grayscale" : ""}
                        noBackground={true}
                      />
                    </motion.div>

                    {/* Name and rarity */}
                    <div className="text-center mt-2 relative z-10">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block">
                        {avatar.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs mt-1",
                          avatar.rarity === 'legendary' && "border-yellow-400 text-yellow-700 bg-yellow-50",
                          avatar.rarity === 'epic' && "border-purple-400 text-purple-700 bg-purple-50",
                          avatar.rarity === 'rare' && "border-blue-400 text-blue-700 bg-blue-50",
                          avatar.rarity === 'common' && "border-gray-400 text-gray-700 bg-gray-50"
                        )}
                      >
                        {avatar.rarity}
                      </Badge>
                    </div>

                    {/* Progress for locked avatars */}
                    {!avatar.unlocked && avatar.requirement && (
                      <div className="mt-2 text-center w-full relative z-10">
                        <div className="text-xs text-gray-500 mb-1">
                          {avatar.requirement.description}
                        </div>
                        <Progress 
                          value={getProgressPercentage(avatar.requirement)} 
                          className="h-1.5"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(getProgressPercentage(avatar.requirement))}%
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedAvatar ? (
                  <span>Selected: <strong>{selectedAvatar.name}</strong></span>
                ) : (
                  <span>Select an avatar to continue</span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={!selectedAvatar || !selectedAvatar.unlocked}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Confirm Selection
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Modal */}
        <AnimatePresence>
          {showTaskModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10"
              onClick={() => setShowTaskModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Task Header */}
                <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    animate={{
                      x: [-100, 400],
                      skewX: [0, 15, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Unlock Quest</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowTaskModal(null)}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <EnhancedAvatar
                        emoji={showTaskModal.emoji}
                        size="md"
                        glowColor={showTaskModal.glowColor}
                        className="grayscale"
                        noBackground={true}
                      />
                      <div>
                        <h4 className="font-semibold">{showTaskModal.name}</h4>
                        <Badge className="bg-white/20 text-white border-white/30">
                          {showTaskModal.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Content */}
                <div className="p-6 space-y-4">
                  {showTaskModal.task && (
                    <>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-blue-500" />
                          {showTaskModal.task.title}
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {showTaskModal.task.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                          <div className="text-xs text-gray-500">Estimated Time</div>
                          <div className="text-sm font-medium">{showTaskModal.task.estimatedTime}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Badge 
                            className={cn(
                              "text-xs",
                              difficultyColors[showTaskModal.task.difficulty]
                            )}
                          >
                            {showTaskModal.task.difficulty}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">Difficulty</div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h6 className="font-semibold text-green-800 mb-2 flex items-center">
                          <Gift className="h-4 w-4 mr-2" />
                          Rewards
                        </h6>
                        <p className="text-sm text-green-700">{showTaskModal.task.reward}</p>
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowTaskModal(null)}
                        >
                          Maybe Later
                        </Button>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          onClick={() => handleStartTask(showTaskModal)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Quest
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};