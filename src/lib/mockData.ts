import { User, CollectionPoint, VotingProject, EcoAction, Product, EcoStory, NewsItem, LeaderboardEntry } from '@/types';
import { BADGE_TYPES } from './gameSystem';

export const currentUser: User = {
  id: '1',
  name: 'Aziza Karimova',
  avatar: '👩‍🌾',
  level: 12,
  ecoPoints: 14400,
  ecoCoins: 250,
  wasteCollected: 85.5,
  title: 'Climate Hero',
  mahalla: 'Chilonzor',
  school: 'School #45',
  badges: [
    { id: '1', ...BADGE_TYPES['eco-hero'], earnedAt: new Date('2025-08-15') },
    { id: '2', ...BADGE_TYPES['eco-volunteer'], earnedAt: new Date('2025-09-01') },
    { id: '3', ...BADGE_TYPES['tree-planter'], earnedAt: new Date('2025-09-10') }
  ]
};

export const collectionPoints: CollectionPoint[] = [
  {
    id: '1',
    name: 'Tashkent Central Park',
    latitude: 41.2995,
    longitude: 69.2401,
    type: 'mixed',
    totalCollected: 1250.5,
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: '2',
    name: 'Chilonzor Mahalla',
    latitude: 41.2856,
    longitude: 69.2034,
    type: 'plastic',
    totalCollected: 890.2,
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: '3',
    name: 'Yunusobod District',
    latitude: 41.3775,
    longitude: 69.2890,
    type: 'tires',
    totalCollected: 456.8,
    lastUpdated: new Date(),
    isActive: true
  }
];

export const votingProjects: VotingProject[] = [
  {
    id: '1',
    title: 'New Playground for School #45',
    description: 'Transform recycled plastic and rubber into colorful playground equipment for 500+ children',
    image: '🏫',
    location: 'Chilonzor District',
    requiredMaterials: 2500,
    currentVotes: 1847,
    totalVotes: 2500,
    category: 'school',
    deadline: new Date('2025-12-15'),
    status: 'active',
    donationTarget: 15000000, // 15M UZS
    donationRaised: 8500000   // 8.5M UZS
  },
  {
    id: '2',
    title: 'Eco-Park Benches from Recycled Tires',
    description: 'Create sustainable seating areas from recycled rubber tires in Alisher Navoi Park',
    image: '🏞️',
    location: 'Alisher Navoi Park',
    requiredMaterials: 1200,
    currentVotes: 956,
    totalVotes: 1500,
    category: 'park',
    deadline: new Date('2025-11-30'),
    status: 'active',
    donationTarget: 8000000,  // 8M UZS
    donationRaised: 3200000   // 3.2M UZS
  },
  {
    id: '3',
    title: 'Kindergarten Garden Path',
    description: 'Build safe walking paths using recycled plastic and rubber materials for little ones',
    image: '🌈',
    location: 'Mirzo Ulugbek District',
    requiredMaterials: 800,
    currentVotes: 623,
    totalVotes: 1000,
    category: 'kindergarten',
    deadline: new Date('2025-11-15'),
    status: 'active',
    donationTarget: 5000000,  // 5M UZS
    donationRaised: 1800000   // 1.8M UZS
  }
].sort((a, b) => b.currentVotes - a.currentVotes); // Sort by vote count

export const ecoActions: EcoAction[] = [
  {
    id: '1',
    title: 'Chirchiq River Cleanup',
    description: 'Join us for a major cleanup operation along the Chirchiq River banks',
    date: new Date('2025-10-25'),
    location: 'Chirchiq River, Tashkent',
    participants: 45,
    maxParticipants: 100,
    organizer: 'ZAMINAT.eco Team',
    type: 'cleanup',
    rewards: 500,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Tree Planting Marathon',
    description: 'Plant 1000 trees in the new eco-district development area',
    date: new Date('2025-10-28'),
    location: 'New Tashkent District',
    participants: 78,
    maxParticipants: 150,
    organizer: 'ZAMINAT.eco Team',
    type: 'planting',
    rewards: 750,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'School Eco-Education Workshop',
    description: 'Teach children about plastic and rubber recycling and environmental protection',
    date: new Date('2025-10-22'),
    location: 'School #127, Yunusobod',
    participants: 25,
    maxParticipants: 30,
    organizer: 'ZAMINAT.eco Team',
    type: 'education',
    rewards: 300,
    status: 'ongoing'
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Children\'s Art Tiles',
    description: 'Beautiful tiles made from recycled plastic featuring children\'s drawings',
    price: 320000, // Converted to UZS
    image: '🎨',
    category: 'Art & Decoration',
    charityPercentage: 100,
    inStock: true,
    recycledMaterials: ['plastic bottles', 'plastic bags'],
    materials: 'Made from 100% recycled plastic waste',
    benefit: 'Supports children\'s education programs'
  },
  {
    id: '2',
    name: 'Eco-Friendly School Desk',
    description: 'Durable school furniture made entirely from recycled plastic and rubber materials',
    price: 1920000, // Converted to UZS
    image: '🪑',
    category: 'Furniture',
    charityPercentage: 100,
    inStock: true,
    recycledMaterials: ['plastic', 'rubber tires'],
    materials: 'Recycled plastic frame with rubber tire components',
    benefit: 'Funds new school equipment'
  },
  {
    id: '3',
    name: 'Garden Planter Set',
    description: 'Set of 3 planters made from recycled tires, perfect for urban gardening',
    price: 576000, // Converted to UZS
    image: '🪴',
    category: 'Garden',
    charityPercentage: 100,
    inStock: true,
    recycledMaterials: ['rubber tires'],
    materials: 'Upcycled rubber tires with drainage system',
    benefit: 'Supports urban greening initiatives'
  }
];

// Removed eco-mug as requested - producing food containers from recycled materials is dangerous
export const rewards = [
  { id: '1', name: 'Plant a Tree', cost: 50, icon: '🌳', description: 'Plant one tree in your name in Tashkent parks' },
  { id: '2', name: 'Children\'s Souvenirs', cost: 75, icon: '🎁', description: 'Unique children\'s crafts supporting EcoKids program' },
  { id: '3', name: 'Home Decor Set', cost: 150, icon: '🏠', description: 'Decorative items made from recycled plastic and rubber' },
];

export const partners = [
  { name: 'Local Cafes', discount: '10%', icon: '☕' },
  { name: 'Eco Stores', discount: '15%', icon: '🛒' },
  { name: 'Scooter Rental', discount: '20%', icon: '🛴' },
  { name: 'Food Delivery', discount: '12%', icon: '🍕' },
];

export const ecoStories: EcoStory[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Bobur Rahimov',
      avatar: '👨‍🎓',
      level: 8,
      ecoPoints: 6400,
      ecoCoins: 120,
      wasteCollected: 45.2,
      title: 'Nature Protector',
      badges: []
    },
    title: 'From Landfill to Playground: Our Mahalla\'s Transformation',
    content: 'Six months ago, our mahalla had a terrible waste problem. Today, thanks to ZAMINAT.eco, we have a beautiful playground made from recycled plastic and rubber materials. Here\'s how we did it...',
    images: ['🏗️', '♻️', '🏞️'],
    likes: 234,
    comments: 45,
    createdAt: new Date('2025-09-15'),
    tags: ['transformation', 'playground', 'community'],
    wasteCollected: 1250,
    location: 'Sergeli District'
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Malika Tursunova',
      avatar: '👩‍🏫',
      level: 15,
      ecoPoints: 22500,
      ecoCoins: 340,
      wasteCollected: 156.7,
      title: 'Environmental Leader',
      badges: []
    },
    title: 'Teaching Kids About Plastic and Rubber Recycling',
    content: 'As a teacher, I\'ve seen how the ZAMINAT.eco program has changed my students. They now compete to bring the most recyclables to school and understand the difference between plastic and rubber waste!',
    images: ['👨‍👩‍👧‍👦', '📚', '🌱'],
    likes: 189,
    comments: 32,
    createdAt: new Date('2025-09-12'),
    tags: ['education', 'children', 'school'],
    location: 'Mirabad District'
  }
];

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'ZAMINAT.eco Launches Pilot Program in Tashkent',
    summary: 'The ecological movement begins its journey with plastic and rubber recycling initiatives',
    content: 'We are excited to announce the launch of our pilot program in Tashkent, focusing on both plastic and rubber waste recycling...',
    image: '🎉',
    author: 'ZAMINAT.eco Team',
    publishedAt: new Date('2025-09-18'),
    category: 'update',
    readTime: 3
  },
  {
    id: '2',
    title: 'The Future of Plastic and Rubber Recycling in Uzbekistan',
    summary: 'How ZAMINAT.eco plans to transform waste management across the country',
    content: 'Our vision extends beyond simple recycling - we\'re building an ecosystem that transforms both plastic and rubber waste...',
    image: '🏫',
    author: 'Sukhrobjon Rikhsiboev',
    publishedAt: new Date('2025-09-16'),
    category: 'success-story',
    readTime: 5
  },
  {
    id: '3',
    title: 'Educational Programs: Teaching the Next Generation',
    summary: 'How we\'re educating children about the importance of plastic and rubber recycling',
    content: 'Education is at the heart of our mission. Through our EcoKids program, we\'re teaching children...',
    image: '🎤',
    author: 'Education Team',
    publishedAt: new Date('2025-09-14'),
    category: 'education',
    readTime: 7
  }
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, user: { ...currentUser, name: 'Sardor Umarov', ecoPoints: 25600, wasteCollected: 198.5 }, score: 25600, change: 2 },
  { rank: 2, user: { ...currentUser, name: 'Aziza Karimova', ecoPoints: 14400, wasteCollected: 85.5 }, score: 14400, change: 0 },
  { rank: 3, user: { ...currentUser, name: 'Bobur Rahimov', ecoPoints: 12800, wasteCollected: 76.2 }, score: 12800, change: -1 },
  { rank: 4, user: { ...currentUser, name: 'Malika Tursunova', ecoPoints: 11200, wasteCollected: 67.8 }, score: 11200, change: 1 },
  { rank: 5, user: { ...currentUser, name: 'Jasur Karimov', ecoPoints: 9600, wasteCollected: 58.4 }, score: 9600, change: -2 }
];

// Updated realistic goals instead of current numbers
export const globalStats = {
  totalWasteCollected: 2500, // Realistic current amount
  totalUsers: 1250, // Realistic current users
  totalProjects: 3, // Current pilot projects
  treesPlanted: 156, // Realistic current number
  co2Saved: 1200.5
};

// Goals for 2026
export const goals2026 = {
  wasteTarget: 1000000, // 1,000 tons
  usersTarget: 50000,   // 50,000 users
  projectsTarget: 100,  // 100 projects
  treesTarget: 10000    // 10,000 trees
};