export type CollectionPointStatus = 'verified' | 'planned' | 'candidate';

export interface CollectionPointItem {
  id: number;
  name: string;
  nameKey?: string;
  type: 'plastic' | 'tires' | 'mixed' | 'metal' | 'paper' | 'glass';
  status: CollectionPointStatus;
  statusLabelKey?: string;
  lat: number;
  lng: number;
  district: string;
  address?: string;
  targetMaterials?: string[];
  estimatedLaunch?: string;
  description?: string;
  descriptionKey?: string;
  hours?: string;
  capacity?: string;
  collected?: string;
  distance?: string;
  emoji?: string;
  image?: string;
  isVerified: boolean;
  isOperational: boolean;
}

/**
 * 1. VERIFIED COLLECTION POINTS
 * Real confirmed operating collection points.
 * Currently 0 until physical partner collection infrastructure is formally verified.
 */
export const VERIFIED_COLLECTION_POINTS: CollectionPointItem[] = [];

/**
 * 2. PLANNED COLLECTION POINTS
 * Specifically approved by ZAMINAT leadership for future rollout roadmap.
 * Currently 0 as no specific facilities have authoritative formal approval documents yet.
 */
export const PLANNED_COLLECTION_POINTS: CollectionPointItem[] = [];

/**
 * 3. CANDIDATE COLLECTION ZONES
 * Broad geographic candidate areas under evaluation for potential network development.
 * Exact locations and openings are not yet confirmed.
 */
export const CANDIDATE_COLLECTION_POINTS: CollectionPointItem[] = [
  {
    id: 301,
    name: 'Chilonzor District — Potential Network Expansion Area',
    type: 'plastic',
    status: 'candidate',
    lat: 41.2721,
    lng: 69.2084,
    district: 'Chilonzor',
    address: 'Chilonzor District (Candidate Area)',
    targetMaterials: ['Plastic', 'Paper', 'Mixed'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Чиланзарском районе.',
    isVerified: false,
    isOperational: false,
    image: '/images/compost_13285420.webp'
  },
  {
    id: 302,
    name: 'Yunusobod District — Potential Network Expansion Area',
    type: 'tires',
    status: 'candidate',
    lat: 41.3654,
    lng: 69.2891,
    district: 'Yunusobod',
    address: 'Yunusobod District (Candidate Area)',
    targetMaterials: ['Rubber', 'Tires', 'Plastic'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Юнусабадском районе.',
    isVerified: false,
    isOperational: false,
    image: '/images/ECOBUSSTOP.webp'
  },
  {
    id: 303,
    name: 'Sergeli District — Potential Network Expansion Area',
    type: 'mixed',
    status: 'candidate',
    lat: 41.2230,
    lng: 69.2215,
    district: 'Sergeli',
    address: 'Sergeli District (Candidate Area)',
    targetMaterials: ['Plastic', 'Metal', 'Rubber'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Сергелийском районе.',
    isVerified: false,
    isOperational: false,
    image: '/images/park.webp'
  },
  {
    id: 304,
    name: "Mirzo Ulug'bek District — Potential Network Expansion Area",
    type: 'plastic',
    status: 'candidate',
    lat: 41.3325,
    lng: 69.3370,
    district: "Mirzo Ulug'bek",
    address: "Mirzo Ulug'bek District (Candidate Area)",
    targetMaterials: ['Plastic', 'Glass', 'Paper'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Мирзо-Улугбекском районе.',
    isVerified: false,
    isOperational: false,
    image: '/images/compost_13285420.webp'
  },
  {
    id: 305,
    name: 'Yakkasaroy District — Potential Network Expansion Area',
    type: 'mixed',
    status: 'candidate',
    lat: 41.2850,
    lng: 69.2550,
    district: 'Yakkasaroy',
    address: 'Yakkasaroy District (Candidate Area)',
    targetMaterials: ['Plastic', 'Paper', 'Metal'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Яккасарайском районе.',
    isVerified: false,
    isOperational: false,
    image: '/images/park.webp'
  },
  {
    id: 306,
    name: 'Olmazor District — Potential Network Expansion Area',
    type: 'plastic',
    status: 'candidate',
    lat: 41.3480,
    lng: 69.2150,
    district: 'Olmazor',
    address: 'Olmazor District (Candidate Area)',
    targetMaterials: ['Plastic', 'Textile', 'Mixed'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Алмазарском районе.',
    isVerified: false,
    isOperational: false,
    image: '/images/compost_13285420.webp'
  }
];

export const getVerifiedCollectionPoints = (): CollectionPointItem[] => {
  return VERIFIED_COLLECTION_POINTS;
};

export const getPlannedCollectionPoints = (): CollectionPointItem[] => {
  return PLANNED_COLLECTION_POINTS;
};

export const getCandidateCollectionPoints = (): CollectionPointItem[] => {
  return CANDIDATE_COLLECTION_POINTS;
};

export const getNetworkExpansionPoints = (): CollectionPointItem[] => {
  return [...PLANNED_COLLECTION_POINTS, ...CANDIDATE_COLLECTION_POINTS];
};

export const getAllCollectionPoints = (): CollectionPointItem[] => {
  return [...VERIFIED_COLLECTION_POINTS, ...PLANNED_COLLECTION_POINTS, ...CANDIDATE_COLLECTION_POINTS];
};

/**
 * Backwards compatibility helper: returns only verified points (0 currently).
 */
export const getCollectionPoints = (_t?: (key: string) => string): CollectionPointItem[] => {
  return VERIFIED_COLLECTION_POINTS;
};