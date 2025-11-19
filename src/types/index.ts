export interface User {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  ecoPoints: number;
  ecoCoins: number;
  wasteCollected: number;
  title: string;
  badges: Badge[];
  mahalla?: string;
  school?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: Date;
}

export interface CollectionPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'plastic' | 'tires' | 'mixed';
  totalCollected: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface VotingProject {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  requiredMaterials: number;
  currentVotes: number;
  totalVotes: number;
  category: 'school' | 'kindergarten' | 'park' | 'mahalla';
  deadline: Date;
  status: 'active' | 'completed' | 'in-progress';
  donationTarget?: number;
  donationRaised?: number;
}

export interface EcoAction {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  type: 'cleanup' | 'planting' | 'education' | 'collection';
  rewards: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  charityPercentage: number;
  inStock: boolean;
  recycledMaterials: string[];
  materials?: string;
  benefit?: string;
}

export interface EcoStory {
  id: string;
  author: User;
  title: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  createdAt: Date;
  tags: string[];
  wasteCollected?: number;
  location?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  publishedAt: Date;
  category: 'success-story' | 'education' | 'interview' | 'update';
  readTime: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  change: number;
}