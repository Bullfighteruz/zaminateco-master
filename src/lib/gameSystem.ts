export const LEVEL_TITLES = [
  'Seedling', 'Sprout', 'Sapling', 'Young Tree', 'Growing Tree',
  'Strong Tree', 'Forest Guardian', 'Nature Protector', 'Eco Warrior', 'Green Champion',
  'Earth Defender', 'Climate Hero', 'Sustainability Expert', 'Environmental Leader', 'Eco Master',
  'Nature Sage', 'Green Guru', 'Eco Visionary', 'Planet Protector', 'Earth Angel',
  'Eco Legend', 'Nature Spirit', 'Green Oracle', 'Eco Mystic', 'Earth Shaman',
  'Nature Wizard', 'Eco Sage', 'Green Prophet', 'Earth Guardian', 'Eco Saint',
  'Nature Avatar', 'Green Deity', 'Eco Transcendent', 'Earth Eternal', 'Nature Infinite',
  'Eco Supreme', 'Green Cosmic', 'Earth Divine', 'Nature Universal', 'Eco Omnipotent',
  'Green Absolute', 'Earth Infinite', 'Nature Perfect', 'Eco Ultimate', 'Green Eternal',
  'Earth Immortal', 'Nature Boundless', 'Eco Limitless', 'Green Infinite', 'Eco-Immortal'
];

export const BADGE_TYPES = {
  'eco-hero': { name: 'Eco Hero', icon: '🌟', description: 'Collected over 100kg of waste' },
  'eco-volunteer': { name: 'Eco Volunteer', icon: '🤝', description: 'Participated in 10+ events' },
  'eco-influencer': { name: 'Eco Influencer', icon: '📢', description: 'Shared 50+ eco stories' },
  'tree-planter': { name: 'Tree Planter', icon: '🌳', description: 'Planted 25+ trees' },
  'waste-warrior': { name: 'Waste Warrior', icon: '♻️', description: 'Collected waste for 30 consecutive days' },
  'vote-champion': { name: 'Vote Champion', icon: '🗳️', description: 'Participated in 20+ votes' },
  'community-leader': { name: 'Community Leader', icon: '👑', description: 'Top contributor in mahalla' },
  'educator': { name: 'Educator', icon: '📚', description: 'Completed all educational modules' }
};

export function calculateLevel(ecoPoints: number): number {
  // Exponential growth: level = floor(sqrt(points / 100)) + 1
  return Math.min(Math.floor(Math.sqrt(ecoPoints / 100)) + 1, 50);
}

export function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel >= 50) return 0;
  return Math.pow(currentLevel, 2) * 100;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || 'Eco-Immortal';
}

export function calculateProgress(ecoPoints: number): number {
  const currentLevel = calculateLevel(ecoPoints);
  const currentLevelPoints = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelPoints = getPointsForNextLevel(currentLevel);
  
  if (nextLevelPoints === 0) return 100;
  
  const progress = ((ecoPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}