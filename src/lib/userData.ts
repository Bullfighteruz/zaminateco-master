// Centralized user data configuration for ZAMINAT.eco application
// This ensures data consistency across all pages

// FIXED: Collection points data with correct amounts
export const COLLECTION_POINTS = [
  { 
    id: 1, 
    name: 'Tashkent Central Park', 
    amount: 1250.5, 
    type: 'mixed',
    isActive: true
  },
  { 
    id: 2, 
    name: 'Chilonzor Mahalla', 
    amount: 890.2, 
    type: 'plastic',
    isActive: true
  },
  { 
    id: 3, 
    name: 'Yunusobod District', 
    amount: 456.8, 
    type: 'tires',
    isActive: true
  }
];

// FIXED: Calculate total waste from collection points (for system-wide data)
export const calculateTotalWaste = (): number => {
  return COLLECTION_POINTS.reduce((total, point) => total + point.amount, 0);
};

export const USER_DATA = {
  name: 'Aziza Karimova',
  ecoCoins: 250,
  ecoPoints: 14400,
  wasteCollected: 85.5, // UPDATED: User's personal waste collection in kg (changed from 47.3 to 85.5)
  location: 'Chilonzor',
  school: 'School #45',
  avatar: '👩‍🌾'
};

export const LEVEL_CONFIG = {
  pointsPerLevel: 1000,
  maxLevel: 20
};

// Calculate level from points - standardized calculation
export const calculateLevel = (points: number): number => {
  return Math.min(Math.floor(points / LEVEL_CONFIG.pointsPerLevel) + 1, LEVEL_CONFIG.maxLevel);
};

// Calculate progress to next level - standardized calculation
export const calculateLevelProgress = (points: number): { progress: number, pointsToNext: number } => {
  const pointsInCurrentLevel = points % LEVEL_CONFIG.pointsPerLevel;
  const progress = (pointsInCurrentLevel / LEVEL_CONFIG.pointsPerLevel) * 100;
  const pointsToNext = LEVEL_CONFIG.pointsPerLevel - pointsInCurrentLevel;
  
  return { progress, pointsToNext };
};

// Derived calculations for consistency
export const CALCULATED_DATA = {
  level: calculateLevel(USER_DATA.ecoPoints),
  levelProgress: calculateLevelProgress(USER_DATA.ecoPoints),
  totalWasteCollected: calculateTotalWaste(), // System-wide total
  userWasteCollected: USER_DATA.wasteCollected // User's personal total
};

// Format large numbers for display
export const formatWasteAmount = (amount: number): { value: string, unit: string } => {
  if (amount >= 1000) {
    return {
      value: (amount / 1000).toFixed(1),
      unit: 'Kkg'
    };
  }
  return {
    value: amount.toFixed(1),
    unit: 'kg'
  };
};

// Export for use across the application
export default {
  USER_DATA,
  LEVEL_CONFIG,
  CALCULATED_DATA,
  COLLECTION_POINTS,
  calculateLevel,
  calculateLevelProgress,
  calculateTotalWaste,
  formatWasteAmount
};