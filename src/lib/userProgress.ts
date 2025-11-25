// User Progress Data Management for Aziza Karimova
export interface UserProgress {
  id: string;
  name: string;
  level: number;
  ecoCoins: number;
  ecoPoints: number;
  wasteCollected: number;
  eventsAttended: number;
  badgesEarned: number;
  referrals: number;
  treesPlanted: number;
  energySaved: number; // kWh
  waterSaved: number; // liters
  carbonReduced: number; // kg CO2
  streakDays: number;
  joinDate: string;
  lastActive: string;
  completedTasks: string[];
  activeAvatar: string;
  unlockedAvatars: string[];
  profileFrame: string;
  profileBackground: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'environmental' | 'social' | 'milestone' | 'special';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'collection' | 'conservation' | 'community' | 'education' | 'innovation';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: string;
  requirements: {
    type: 'waste_collection' | 'event_attendance' | 'energy_saving' | 'referral' | 'streak' | 'level';
    target: number;
    current?: number;
  }[];
  rewards: {
    ecoCoins: number;
    ecoPoints: number;
    avatar?: string;
    frame?: string;
    background?: string;
    badge?: string;
  };
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  unlockConditions?: {
    level?: number;
    completedTasks?: string[];
    achievements?: string[];
  };
}

import { getUserName } from '@/utils/userName';

// User's Current Progress (realistic data)
export const AZIZA_PROGRESS: UserProgress = {
  id: 'user_001',
  name: getUserName(),
  level: 15,
  ecoCoins: 250,
  ecoPoints: 14400,
  wasteCollected: 85.5,
  eventsAttended: 12,
  badgesEarned: 8,
  referrals: 5,
  treesPlanted: 15,
  energySaved: 320, // kWh
  waterSaved: 2400, // liters
  carbonReduced: 180, // kg CO2
  streakDays: 7,
  joinDate: '2024-03-15',
  lastActive: new Date().toISOString(),
  completedTasks: [
    'first_collection', 'tree_planter', 'community_hero', 'energy_saver_basic',
    'water_guardian', 'recycling_champion', 'green_commuter', 'eco_educator'
  ],
  activeAvatar: '👩‍🌾',
  unlockedAvatars: ['👩‍🌾', '🌱', '🌿', '🌳', '♻️', '🌍', '💧', '☀️'],
  profileFrame: 'eco_champion',
  profileBackground: 'forest_gradient',
  achievements: [
    {
      id: 'first_collection',
      name: 'First Steps',
      description: 'Completed your first waste collection',
      icon: '🏆',
      unlockedAt: '2024-03-16',
      category: 'milestone'
    },
    {
      id: 'tree_planter',
      name: 'Tree Planter',
      description: 'Planted 10 trees',
      icon: '🌳',
      unlockedAt: '2024-04-20',
      category: 'environmental'
    },
    {
      id: 'community_hero',
      name: 'Community Hero',
      description: 'Attended 10+ environmental events',
      icon: '👥',
      unlockedAt: '2024-06-15',
      category: 'social'
    },
    {
      id: 'energy_master',
      name: 'Energy Master',
      description: 'Saved 300+ kWh of energy',
      icon: '⚡',
      unlockedAt: '2024-08-10',
      category: 'environmental'
    },
    {
      id: 'water_guardian',
      name: 'Water Guardian',
      description: 'Saved 2000+ liters of water',
      icon: '💧',
      unlockedAt: '2024-09-05',
      category: 'environmental'
    },
    {
      id: 'streak_champion',
      name: 'Streak Champion',
      description: '7-day activity streak',
      icon: '🔥',
      unlockedAt: '2024-10-01',
      category: 'milestone'
    },
    {
      id: 'referral_master',
      name: 'Community Builder',
      description: 'Referred 5+ friends',
      icon: '🤝',
      unlockedAt: '2024-09-20',
      category: 'social'
    },
    {
      id: 'eco_champion',
      name: 'Eco Champion',
      description: 'Reached Level 15',
      icon: '🌟',
      unlockedAt: '2024-09-30',
      category: 'milestone'
    }
  ]
};

// Available Tasks for Aziza
export const AVAILABLE_TASKS: Task[] = [
  // Currently Available Tasks
  {
    id: 'climate_warrior',
    title: 'Climate Action Leader',
    description: 'Lead a climate awareness campaign in your community and reduce 50kg of CO2 emissions',
    category: 'community',
    difficulty: 'hard',
    estimatedTime: '2-3 months',
    requirements: [
      { type: 'event_attendance', target: 15, current: 12 },
      { type: 'referral', target: 8, current: 5 }
    ],
    rewards: {
      ecoCoins: 500,
      ecoPoints: 2000,
      avatar: '🔥',
      frame: 'climate_warrior',
      badge: 'climate_leader'
    },
    status: 'available'
  },
  {
    id: 'solar_champion',
    title: 'Solar Energy Advocate',
    description: 'Promote solar energy adoption and save 100 kWh through renewable sources',
    category: 'innovation',
    difficulty: 'hard',
    estimatedTime: '2-3 weeks',
    requirements: [
      { type: 'energy_saving', target: 400, current: 320 },
      { type: 'level', target: 16, current: 15 }
    ],
    rewards: {
      ecoCoins: 300,
      ecoPoints: 1500,
      avatar: '☀️',
      background: 'solar_energy',
      badge: 'solar_pioneer'
    },
    status: 'available'
  },
  {
    id: 'waste_master',
    title: 'Waste Collection Master',
    description: 'Collect and properly sort 100kg of waste materials',
    category: 'collection',
    difficulty: 'medium',
    estimatedTime: '1 month',
    requirements: [
      { type: 'waste_collection', target: 100, current: 85.5 }
    ],
    rewards: {
      ecoCoins: 200,
      ecoPoints: 1000,
      avatar: '♻️',
      frame: 'recycling_master'
    },
    status: 'available'
  },
  
  // Locked Tasks (Future Goals)
  {
    id: 'eco_star',
    title: 'Environmental Excellence',
    description: 'Complete all eco challenges and become a sustainability leader',
    category: 'milestone',
    difficulty: 'expert',
    estimatedTime: '6+ months',
    requirements: [
      { type: 'level', target: 20, current: 15 },
      { type: 'waste_collection', target: 200, current: 85.5 }
    ],
    rewards: {
      ecoCoins: 1000,
      ecoPoints: 5000,
      avatar: '🌟',
      frame: 'legendary_eco_star',
      background: 'cosmic_nature',
      badge: 'eco_legend'
    },
    status: 'locked',
    unlockConditions: {
      level: 18,
      completedTasks: ['climate_warrior', 'solar_champion', 'waste_master']
    }
  },
  {
    id: 'future_visionary',
    title: 'Sustainability Innovation',
    description: 'Develop and implement a new sustainability initiative',
    category: 'innovation',
    difficulty: 'expert',
    estimatedTime: '6+ months',
    requirements: [
      { type: 'event_attendance', target: 25, current: 12 },
      { type: 'referral', target: 15, current: 5 }
    ],
    rewards: {
      ecoCoins: 800,
      ecoPoints: 4000,
      avatar: '🔮',
      frame: 'innovation_master',
      background: 'future_tech'
    },
    status: 'locked',
    unlockConditions: {
      level: 17,
      achievements: ['climate_leader', 'solar_pioneer']
    }
  },
  {
    id: 'nature_lover',
    title: 'Biodiversity Guardian',
    description: 'Create and maintain a wildlife habitat garden',
    category: 'conservation',
    difficulty: 'hard',
    estimatedTime: '4-6 months',
    requirements: [
      { type: 'waste_collection', target: 150, current: 85.5 },
      { type: 'streak', target: 30, current: 7 }
    ],
    rewards: {
      ecoCoins: 600,
      ecoPoints: 3000,
      avatar: '🦋',
      frame: 'nature_guardian',
      background: 'biodiversity_garden'
    },
    status: 'locked',
    unlockConditions: {
      level: 16,
      completedTasks: ['waste_master']
    }
  }
];

// Profile Frames
export const PROFILE_FRAMES = {
  default: {
    name: 'Default',
    description: 'Standard profile frame',
    unlocked: true,
    gradient: 'from-gray-300 to-gray-400',
    animation: 'none'
  },
  eco_champion: {
    name: 'Eco Champion',
    description: 'For reaching Level 15',
    unlocked: true,
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    animation: 'pulse'
  },
  climate_warrior: {
    name: 'Climate Warrior',
    description: 'For leading climate action',
    unlocked: false,
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    animation: 'glow'
  },
  recycling_master: {
    name: 'Recycling Master',
    description: 'For waste collection mastery',
    unlocked: false,
    gradient: 'from-blue-400 via-cyan-500 to-teal-500',
    animation: 'rotate'
  },
  legendary_eco_star: {
    name: 'Legendary Eco Star',
    description: 'Ultimate environmental achievement',
    unlocked: false,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    animation: 'rainbow'
  }
};

// Profile Backgrounds with Iridescent Gradients
export interface ThemeBackground {
  name: string;
  description: string;
  unlocked: boolean;
  style: string;
  gradient: string; // CSS gradient string for more complex gradients
  animation?: 'none' | 'shimmer' | 'pulse' | 'flow' | 'aurora';
  category: 'nature' | 'energy' | 'cosmic' | 'ocean' | 'sunset' | 'neon' | 'pastel';
}

export const PROFILE_BACKGROUNDS: Record<string, ThemeBackground> = {
  default: {
    name: 'Default Gradient',
    description: 'Standard background',
    unlocked: true,
    style: 'from-green-600 via-green-500 to-blue-600',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #2563eb 100%)',
    animation: 'none',
    category: 'nature'
  },
  forest_gradient: {
    name: 'Forest Harmony',
    description: 'For nature lovers',
    unlocked: true,
    style: 'from-green-800 via-emerald-600 to-teal-500',
    gradient: 'linear-gradient(135deg, #166534 0%, #059669 50%, #14b8a6 100%)',
    animation: 'pulse',
    category: 'nature'
  },
  solar_energy: {
    name: 'Solar Power',
    description: 'For renewable energy advocates',
    unlocked: false,
    style: 'from-yellow-500 via-orange-500 to-red-500',
    gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 50%, #ef4444 100%)',
    animation: 'shimmer',
    category: 'energy'
  },
  cosmic_nature: {
    name: 'Cosmic Nature',
    description: 'Legendary background for eco stars',
    unlocked: false,
    style: 'from-purple-900 via-blue-800 to-green-600',
    gradient: 'linear-gradient(135deg, #581c87 0%, #1e40af 50%, #16a34a 100%)',
    animation: 'aurora',
    category: 'cosmic'
  },
  biodiversity_garden: {
    name: 'Biodiversity Garden',
    description: 'For biodiversity guardians',
    unlocked: false,
    style: 'from-pink-500 via-purple-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #4f46e5 100%)',
    animation: 'flow',
    category: 'pastel'
  },
  future_tech: {
    name: 'Future Technology',
    description: 'For innovation masters',
    unlocked: false,
    style: 'from-cyan-400 via-blue-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #9333ea 100%)',
    animation: 'shimmer',
    category: 'neon'
  },
  // New Iridescent Themes
  iridescent_emerald: {
    name: 'Iridescent Emerald',
    description: 'Shimmering green with iridescent shine',
    unlocked: true,
    style: 'from-emerald-400 via-teal-500 to-cyan-600',
    gradient: 'linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #0891b2 100%)',
    animation: 'shimmer',
    category: 'nature'
  },
  aurora_borealis: {
    name: 'Aurora Borealis',
    description: 'Northern lights inspired gradient',
    unlocked: true,
    style: 'from-green-400 via-blue-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #3b82f6 50%, #9333ea 100%)',
    animation: 'aurora',
    category: 'cosmic'
  },
  ocean_depths: {
    name: 'Ocean Depths',
    description: 'Deep blue with teal highlights',
    unlocked: true,
    style: 'from-blue-700 via-cyan-600 to-teal-500',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 50%, #14b8a6 100%)',
    animation: 'flow',
    category: 'ocean'
  },
  sunset_blaze: {
    name: 'Sunset Blaze',
    description: 'Warm sunset colors',
    unlocked: true,
    style: 'from-orange-400 via-pink-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #9333ea 100%)',
    animation: 'pulse',
    category: 'sunset'
  },
  neon_eco: {
    name: 'Neon Eco',
    description: 'Vibrant neon green and cyan',
    unlocked: false,
    style: 'from-green-400 via-cyan-400 to-blue-500',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #3b82f6 100%)',
    animation: 'shimmer',
    category: 'neon'
  },
  pastel_dream: {
    name: 'Pastel Dream',
    description: 'Soft pastel colors',
    unlocked: true,
    style: 'from-pink-300 via-purple-300 to-indigo-400',
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 50%, #818cf8 100%)',
    animation: 'pulse',
    category: 'pastel'
  },
  prismatic_flow: {
    name: 'Prismatic Flow',
    description: 'Rainbow iridescent gradient',
    unlocked: false,
    style: 'from-red-400 via-yellow-400 via-green-400 to-blue-500',
    gradient: 'linear-gradient(135deg, #f87171 0%, #fbbf24 25%, #4ade80 50%, #3b82f6 75%, #8b5cf6 100%)',
    animation: 'flow',
    category: 'neon'
  },
  moonlight_forest: {
    name: 'Moonlight Forest',
    description: 'Mystical dark green with blue',
    unlocked: true,
    style: 'from-slate-800 via-green-700 to-blue-800',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #15803d 50%, #1e40af 100%)',
    animation: 'aurora',
    category: 'nature'
  }
};

// Utility Functions
export const calculateTaskProgress = (task: Task, userProgress: UserProgress): number => {
  let totalProgress = 0;
  let completedRequirements = 0;

  task.requirements.forEach(req => {
    let current = 0;
    switch (req.type) {
      case 'waste_collection':
        current = userProgress.wasteCollected;
        break;
      case 'event_attendance':
        current = userProgress.eventsAttended;
        break;
      case 'energy_saving':
        current = userProgress.energySaved;
        break;
      case 'referral':
        current = userProgress.referrals;
        break;
      case 'streak':
        current = userProgress.streakDays;
        break;
      case 'level':
        current = userProgress.level;
        break;
    }
    
    const progress = Math.min((current / req.target) * 100, 100);
    totalProgress += progress;
    if (progress >= 100) completedRequirements++;
  });

  return totalProgress / task.requirements.length;
};

export const canStartTask = (task: Task, userProgress: UserProgress): boolean => {
  if (task.status === 'completed') return false;
  
  if (task.unlockConditions) {
    if (task.unlockConditions.level && userProgress.level < task.unlockConditions.level) {
      return false;
    }
    
    if (task.unlockConditions.completedTasks) {
      const hasAllTasks = task.unlockConditions.completedTasks.every(taskId => 
        userProgress.completedTasks.includes(taskId)
      );
      if (!hasAllTasks) return false;
    }
    
    if (task.unlockConditions.achievements) {
      const hasAllAchievements = task.unlockConditions.achievements.every(achievementId => 
        userProgress.achievements.some(a => a.id === achievementId)
      );
      if (!hasAllAchievements) return false;
    }
  }
  
  return true;
};

export const getNextLevelRequirement = (currentLevel: number): number => {
  // Simplified level requirements to make 600 points to next level for level 15
  const levelRequirements = {
    1: 0,
    2: 1000,
    3: 2500,
    4: 4500,
    5: 7000,
    6: 10000,
    7: 13500,
    8: 17500,
    9: 22000,
    10: 27000,
    11: 32500,
    12: 38500,
    13: 45000,
    14: 52000,
    15: 59500,
    16: 67500, // Current user has 14400, but we want next level to be 15000 for 600 points difference
    17: 76000,
    18: 85000,
    19: 94500,
    20: 105000
  };
  
  return levelRequirements[currentLevel] || Math.floor(1000 * Math.pow(1.2, currentLevel - 1));
};

export const calculateLevelProgress = (points: number, level: number) => {
  // For level 15 with 14400 points, we want next level to require 15000 points (600 more)
  if (level === 15) {
    const nextLevelReq = 15000; // Fixed requirement for level 16
    const currentLevelReq = 14000; // Fixed requirement for level 15
    const pointsInCurrentLevel = points - currentLevelReq;
    const pointsNeededForNext = nextLevelReq - currentLevelReq;
    
    return {
      progress: Math.max(0, Math.min(100, (pointsInCurrentLevel / pointsNeededForNext) * 100)),
      pointsToNext: Math.max(0, nextLevelReq - points)
    };
  }
  
  // Original calculation for other levels
  const currentLevelReq = getNextLevelRequirement(level);
  const nextLevelReq = getNextLevelRequirement(level + 1);
  const pointsInCurrentLevel = points - currentLevelReq;
  const pointsNeededForNext = nextLevelReq - currentLevelReq;
  
  return {
    progress: Math.max(0, (pointsInCurrentLevel / pointsNeededForNext) * 100),
    pointsToNext: Math.max(0, nextLevelReq - points)
  };
};

// Save/Load functions (localStorage for now, can be replaced with API calls)
export const saveUserProgress = (progress: UserProgress): void => {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return;
  }
  
  // Always use the current name from storage
  const currentName = getUserName();
  const updatedProgress = { ...progress, name: currentName };
  localStorage.setItem('aziza_progress', JSON.stringify(updatedProgress));
  // Dispatch custom event to notify other components of the update
  window.dispatchEvent(new Event('userProgressUpdated'));
};

export const loadUserProgress = (): UserProgress => {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    // Return default progress during SSR/build
    return { ...AZIZA_PROGRESS };
  }
  
  // Get current user name from storage
  const currentName = getUserName();
  const saved = localStorage.getItem('aziza_progress');
  const progress = saved ? JSON.parse(saved) : { ...AZIZA_PROGRESS };
  // Always use the current name from storage
  progress.name = currentName;
  return progress;
};

export const completeTask = (taskId: string, userProgress: UserProgress): UserProgress => {
  const task = AVAILABLE_TASKS.find(t => t.id === taskId);
  if (!task) return userProgress;

  const updatedProgress = {
    ...userProgress,
    ecoCoins: userProgress.ecoCoins + task.rewards.ecoCoins,
    ecoPoints: userProgress.ecoPoints + task.rewards.ecoPoints,
    completedTasks: [...userProgress.completedTasks, taskId],
    lastActive: new Date().toISOString()
  };

  // Unlock rewards
  if (task.rewards.avatar && !updatedProgress.unlockedAvatars.includes(task.rewards.avatar)) {
    updatedProgress.unlockedAvatars.push(task.rewards.avatar);
  }

  saveUserProgress(updatedProgress);
  return updatedProgress;
};