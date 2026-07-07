/**
 * ZAMINAT.eco — Recommendation Engine
 * 
 * Personalized eco-challenge and product recommendations based on user activity.
 * Uses hybrid approach: content-based filtering + rule-based boosting.
 */

import { loadUserProgress } from '@/lib/userProgress';

// ============================================
// Types
// ============================================

export type RecommendationType = 'challenge' | 'product' | 'event' | 'ecopoint';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  titleUz: string;
  titleRu: string;
  description: string;
  descriptionUz: string;
  descriptionRu: string;
  icon: string;
  color: string;
  relevanceScore: number; // 0–100
  reason: string;
  reasonUz: string;
  reasonRu: string;
  actionLabel: string;
  actionUrl?: string;
  reward?: number; // EcoCoins
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

// ============================================
// Recommendation Database
// ============================================

const ALL_RECOMMENDATIONS: Omit<Recommendation, 'relevanceScore' | 'reason' | 'reasonUz' | 'reasonRu'>[] = [
  // Challenges
  {
    id: 'ch-plastic-week',
    type: 'challenge',
    title: 'Plastic-Free Week',
    titleUz: 'Plastiksiz hafta',
    titleRu: 'Неделя без пластика',
    description: 'Go 7 days without single-use plastic. Track your progress and earn bonus coins!',
    descriptionUz: 'Bir martalik plastikdan 7 kun foydalanmaslik. Taraqqiyotingizni kuzating va bonus tangalar oling!',
    descriptionRu: 'Проведите 7 дней без одноразового пластика. Отслеживайте прогресс и зарабатывайте бонусные монеты!',
    icon: '🚫',
    color: '#3b82f6',
    actionLabel: 'Start Challenge',
    reward: 50,
    difficulty: 'medium',
    category: 'plastic',
  },
  {
    id: 'ch-scan-10',
    type: 'challenge',
    title: 'Scan Master',
    titleUz: 'Skan ustasi',
    titleRu: 'Мастер сканирования',
    description: 'Scan 10 different waste items this week using the AI Scanner.',
    descriptionUz: 'Shu hafta AI Skaner yordamida 10 xil chiqindi turini skanerlang.',
    descriptionRu: 'Отсканируйте 10 различных видов отходов на этой неделе с помощью ИИ-сканера.',
    icon: '📷',
    color: '#8b5cf6',
    actionLabel: 'Open Scanner',
    actionUrl: '/scanner',
    reward: 30,
    difficulty: 'easy',
    category: 'scanning',
  },
  {
    id: 'ch-tree-plant',
    type: 'challenge',
    title: 'Plant a Tree',
    titleUz: 'Daraxt ek',
    titleRu: 'Посадите дерево',
    description: 'Earn 50 EcoCoins and plant a real tree in a Tashkent park.',
    descriptionUz: 'Toshkent bog\'larida haqiqiy daraxt ekish uchun 50 EcoCoins ishlang.',
    descriptionRu: 'Заработайте 50 экомонет и посадите настоящее дерево в парке Ташкента.',
    icon: '🌱',
    color: '#22c55e',
    actionLabel: 'View Trees',
    reward: 50,
    difficulty: 'hard',
    category: 'organic',
  },
  {
    id: 'ch-rubber-collect',
    type: 'challenge',
    title: 'Tire Collection Drive',
    titleUz: 'Shinalar to\'plash',
    titleRu: 'Сбор шин',
    description: 'Collect 5 old tires and bring them to the nearest EcoPoint for recycling.',
    descriptionUz: '5 ta eski shinani to\'plab, eng yaqin EcoPointga olib boring.',
    descriptionRu: 'Соберите 5 старых шин и сдайте их в ближайший EcoPoint для переработки.',
    icon: '🛞',
    color: '#78716c',
    actionLabel: 'Find EcoPoint',
    actionUrl: '/map',
    reward: 75,
    difficulty: 'hard',
    category: 'rubber',
  },
  {
    id: 'ch-paper-origami',
    type: 'challenge',
    title: 'Paper Upcycling Art',
    titleUz: 'Qog\'oz san\'ati',
    titleRu: 'Искусство из бумаги',
    description: 'Create 3 origami crafts from recycled paper and share on EcoStories.',
    descriptionUz: 'Qayta ishlangan qog\'ozdan 3 origami yarating va EcoStories\'da ulashing.',
    descriptionRu: 'Создайте 3 оригами из переработанной бумаги и поделитесь в EcoStories.',
    icon: '🦢',
    color: '#eab308',
    actionLabel: 'Share Story',
    actionUrl: '/stories',
    reward: 25,
    difficulty: 'easy',
    category: 'paper',
  },
  // Products
  {
    id: 'prod-tiles',
    type: 'product',
    title: 'Children\'s Art Tiles',
    titleUz: 'Bolalar san\'at plitkasi',
    titleRu: 'Детская художественная плитка',
    description: 'Made from 100% recycled plastic. Perfect for schools and playgrounds.',
    descriptionUz: '100% qayta ishlangan plastikdan yasalgan. Maktablar va o\'yin maydonchalari uchun mukammal.',
    descriptionRu: 'Из 100% переработанного пластика. Идеально для школ и детских площадок.',
    icon: '🎨',
    color: '#f472b6',
    actionLabel: 'View Product',
    actionUrl: '/shop',
    category: 'plastic',
  },
  {
    id: 'prod-bench',
    type: 'product',
    title: 'Eco Park Bench',
    titleUz: 'Eko park skameykasi',
    titleRu: 'Эко-скамейка для парка',
    description: 'Durable bench made from recycled plastic and rubber.',
    descriptionUz: 'Qayta ishlangan plastik va rezinadan yasalgan chidamli skameyka.',
    descriptionRu: 'Прочная скамейка из переработанного пластика и резины.',
    icon: '🪑',
    color: '#a16207',
    actionLabel: 'View Product',
    actionUrl: '/shop',
    category: 'plastic',
  },
  // Events
  {
    id: 'evt-cleanup',
    type: 'event',
    title: 'Weekend Cleanup: Chilanzar Park',
    titleUz: 'Dam olish kuni tozalash: Chilonzor bog\'i',
    titleRu: 'Субботник: парк Чиланзар',
    description: 'Join 50+ volunteers to clean up Chilanzar Park. Earn 100 EcoPoints!',
    descriptionUz: 'Chilonzor bog\'ini tozalash uchun 50+ ko\'ngillilarga qo\'shiling. 100 EcoPoints ishlang!',
    descriptionRu: 'Присоединяйтесь к 50+ волонтёрам для уборки парка Чиланзар. Заработайте 100 EcoPoints!',
    icon: '🧹',
    color: '#14b8a6',
    actionLabel: 'Join Event',
    reward: 100,
    category: 'event',
  },
  {
    id: 'evt-workshop',
    type: 'event',
    title: 'Recycling Workshop',
    titleUz: 'Qayta ishlash ustaxonasi',
    titleRu: 'Мастер-класс по переработке',
    description: 'Learn how to sort waste properly at our free workshop in Yunusabad.',
    descriptionUz: 'Yunusobodda bepul ustaxonamizda chiqindilarni to\'g\'ri saralashni o\'rganing.',
    descriptionRu: 'Узнайте, как правильно сортировать отходы на бесплатном мастер-классе в Юнусабаде.',
    icon: '🎓',
    color: '#8b5cf6',
    actionLabel: 'Register',
    reward: 30,
    category: 'education',
  },
  // EcoPoints
  {
    id: 'ep-chilanzar',
    type: 'ecopoint',
    title: 'Chilanzar EcoPoint',
    titleUz: 'Chilonzor EcoPoint',
    titleRu: 'EcoPoint Чиланзар',
    description: 'Closest plastic collection point. Open daily 8:00-18:00.',
    descriptionUz: 'Eng yaqin plastik yig\'ish punkti. Har kuni 8:00-18:00.',
    descriptionRu: 'Ближайший пункт сбора пластика. Работает ежедневно 8:00-18:00.',
    icon: '📍',
    color: '#ef4444',
    actionLabel: 'Get Directions',
    category: 'plastic',
  },
  {
    id: 'ep-tires',
    type: 'ecopoint',
    title: 'Yunusabad Tire Collection',
    titleUz: 'Yunusobod shina yig\'ish',
    titleRu: 'Сбор шин Юнусабад',
    description: 'Specialized tire recycling point. Extra 5 bonus pts per tire.',
    descriptionUz: 'Ixtisoslashtirilgan shina qayta ishlash punkti. Har bir shina uchun 5 bonus ball.',
    descriptionRu: 'Специализированный пункт переработки шин. 5 бонусных баллов за шину.',
    icon: '🛞',
    color: '#78716c',
    actionLabel: 'Get Directions',
    category: 'rubber',
  },
];

// ============================================
// Scoring Logic
// ============================================

interface UserProfile {
  preferredCategories: string[];
  activityLevel: 'low' | 'medium' | 'high';
  totalScans: number;
  ecoCoins: number;
  wasteCollected: number;
}

function buildUserProfile(): UserProfile {
  const progress = loadUserProgress();
  
  // Determine preferred categories based on scan history
  const preferredCategories = ['plastic']; // Default
  if (progress.wasteCollected > 5) preferredCategories.push('rubber');
  if (progress.ecoCoins > 20) preferredCategories.push('paper', 'organic');
  
  // Activity level
  const activityLevel: 'low' | 'medium' | 'high' = 
    progress.ecoCoins > 50 ? 'high' : progress.ecoCoins > 10 ? 'medium' : 'low';
  
  return {
    preferredCategories,
    activityLevel,
    totalScans: Math.floor(progress.wasteCollected * 4), // Estimate scans from collected waste
    ecoCoins: progress.ecoCoins,
    wasteCollected: progress.wasteCollected,
  };
}

function scoreRecommendation(
  rec: typeof ALL_RECOMMENDATIONS[number],
  profile: UserProfile
): { score: number; reason: string; reasonUz: string; reasonRu: string } {
  let score = 50; // Base score
  let reason = 'Suggested for you';
  let reasonUz = 'Siz uchun tavsiya etilgan';
  let reasonRu = 'Рекомендовано для вас';

  // Category match boost
  if (rec.category && profile.preferredCategories.includes(rec.category)) {
    score += 25;
    reason = `Matches your interest in ${rec.category}`;
    reasonUz = `${rec.category} bo'yicha qiziqishingizga mos`;
    reasonRu = `Соответствует вашему интересу к ${rec.category}`;
  }

  // Activity-based scoring
  if (profile.activityLevel === 'low') {
    // Recommend easy challenges and nearby ecopoints
    if (rec.difficulty === 'easy') score += 20;
    if (rec.type === 'ecopoint') score += 15;
    reason = 'Great starting point for beginners';
    reasonUz = 'Yangi boshlanuvchilar uchun ajoyib boshlang\'ich nuqta';
    reasonRu = 'Отличная отправная точка для начинающих';
  } else if (profile.activityLevel === 'high') {
    // Recommend hard challenges and events
    if (rec.difficulty === 'hard') score += 20;
    if (rec.type === 'event') score += 15;
    reason = 'Challenge yourself further!';
    reasonUz = 'O\'zingizni sinab ko\'ring!';
    reasonRu = 'Попробуйте себя!';
  }

  // Reward boost (items with higher rewards rank higher)
  if (rec.reward) {
    score += Math.min(rec.reward / 5, 15);
  }

  // Type diversity boost
  const typeBoosts: Record<RecommendationType, number> = {
    challenge: 10,
    product: 5,
    event: 15,
    ecopoint: 8,
  };
  score += typeBoosts[rec.type] || 0;

  // Randomize slightly to prevent stale recommendations
  score += Math.random() * 10;

  return { 
    score: Math.min(Math.round(score), 100), 
    reason, 
    reasonUz, 
    reasonRu 
  };
}

// ============================================
// Public API
// ============================================

/**
 * Get personalized recommendations for the current user.
 * Returns top N recommendations sorted by relevance.
 */
export function getRecommendations(count: number = 6): Recommendation[] {
  const profile = buildUserProfile();
  
  const scored = ALL_RECOMMENDATIONS.map(rec => {
    const { score, reason, reasonUz, reasonRu } = scoreRecommendation(rec, profile);
    return {
      ...rec,
      relevanceScore: score,
      reason,
      reasonUz,
      reasonRu,
    };
  });
  
  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, count);
}

/**
 * Get recommendations filtered by type.
 */
export function getRecommendationsByType(type: RecommendationType, count: number = 4): Recommendation[] {
  return getRecommendations(20)
    .filter(r => r.type === type)
    .slice(0, count);
}
