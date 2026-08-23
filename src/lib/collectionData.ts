export type CollectionPointStatus = 'verified' | 'planned' | 'candidate';

export type MaterialKey =
  | 'plastic'
  | 'rubber'
  | 'tires'
  | 'mixed'
  | 'paper'
  | 'glass'
  | 'metal'
  | 'textile';

export interface CollectionPointItem {
  id: number;
  districtKey: 'chilonzor' | 'yunusobod' | 'sergeli' | 'mirzo_ulugbek' | 'yakkasaroy' | 'olmazor' | string;
  name: string;
  type: 'plastic' | 'tires' | 'mixed' | 'metal' | 'paper' | 'glass';
  status: CollectionPointStatus;
  statusLabelKey?: string;
  lat: number;
  lng: number;
  district: string;
  address?: string;
  materialKeys: MaterialKey[];
  targetMaterials?: string[];
  estimatedLaunch?: string;
  description?: string;
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
 * Deterministic District Icon Mapping using stable entity keys
 */
export const DISTRICT_ICON_MAP: Record<string, string> = {
  chilonzor: '/images/Chilonzor Mahalla.webp',
  yunusobod: '/images/Yunusobod District.webp',
  sergeli: '/images/location_5174778.webp',
  mirzo_ulugbek: '/images/location_5174778.webp',
  yakkasaroy: '/images/location_5174778.webp',
  olmazor: '/images/location_5174778.webp',
};

/**
 * Resolves the deterministic district illustration using stable district keys or item IDs.
 */
export const getDistrictIcon = (districtKeyOrId: string | number): string => {
  const raw = String(districtKeyOrId).toLowerCase().replace(/[^a-z_]/g, '');
  if (raw.includes('chilonzor') || raw === '301') return DISTRICT_ICON_MAP.chilonzor;
  if (raw.includes('yunusobod') || raw === '302') return DISTRICT_ICON_MAP.yunusobod;
  if (raw.includes('sergeli') || raw === '303') return DISTRICT_ICON_MAP.sergeli;
  if (raw.includes('mirzo') || raw.includes('ulugbek') || raw === '304') return DISTRICT_ICON_MAP.mirzo_ulugbek;
  if (raw.includes('yakkasaroy') || raw === '305') return DISTRICT_ICON_MAP.yakkasaroy;
  if (raw.includes('olmazor') || raw === '306') return DISTRICT_ICON_MAP.olmazor;
  return '/images/location_5174778.webp';
};

/**
 * 3. CANDIDATE COLLECTION ZONES
 * Broad geographic candidate areas under evaluation for potential network development.
 * Exact locations and openings are not yet confirmed.
 */
export const CANDIDATE_COLLECTION_POINTS: CollectionPointItem[] = [
  {
    id: 301,
    districtKey: 'chilonzor',
    name: 'Chilonzor District — Potential Network Expansion Area',
    type: 'plastic',
    status: 'candidate',
    lat: 41.2721,
    lng: 69.2084,
    district: 'Chilonzor',
    address: 'Chilonzor District (Candidate Area)',
    materialKeys: ['plastic', 'paper', 'mixed'],
    targetMaterials: ['Plastic', 'Paper', 'Mixed'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Чиланзарском районе.',
    isVerified: false,
    isOperational: false,
    image: DISTRICT_ICON_MAP.chilonzor
  },
  {
    id: 302,
    districtKey: 'yunusobod',
    name: 'Yunusobod District — Potential Network Expansion Area',
    type: 'tires',
    status: 'candidate',
    lat: 41.3654,
    lng: 69.2891,
    district: 'Yunusobod',
    address: 'Yunusobod District (Candidate Area)',
    materialKeys: ['rubber', 'tires', 'plastic'],
    targetMaterials: ['Rubber', 'Tires', 'Plastic'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Юнусабадском районе.',
    isVerified: false,
    isOperational: false,
    image: DISTRICT_ICON_MAP.yunusobod
  },
  {
    id: 303,
    districtKey: 'sergeli',
    name: 'Sergeli District — Potential Network Expansion Area',
    type: 'mixed',
    status: 'candidate',
    lat: 41.2230,
    lng: 69.2215,
    district: 'Sergeli',
    address: 'Sergeli District (Candidate Area)',
    materialKeys: ['plastic', 'metal', 'rubber'],
    targetMaterials: ['Plastic', 'Metal', 'Rubber'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Сергелийском районе.',
    isVerified: false,
    isOperational: false,
    image: DISTRICT_ICON_MAP.sergeli
  },
  {
    id: 304,
    districtKey: 'mirzo_ulugbek',
    name: "Mirzo Ulug'bek District — Potential Network Expansion Area",
    type: 'plastic',
    status: 'candidate',
    lat: 41.3325,
    lng: 69.3370,
    district: "Mirzo Ulug'bek",
    address: "Mirzo Ulug'bek District (Candidate Area)",
    materialKeys: ['plastic', 'glass', 'paper'],
    targetMaterials: ['Plastic', 'Glass', 'Paper'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Мирзо-Улугбекском районе.',
    isVerified: false,
    isOperational: false,
    image: DISTRICT_ICON_MAP.mirzo_ulugbek
  },
  {
    id: 305,
    districtKey: 'yakkasaroy',
    name: 'Yakkasaroy District — Potential Network Expansion Area',
    type: 'mixed',
    status: 'candidate',
    lat: 41.2850,
    lng: 69.2550,
    district: 'Yakkasaroy',
    address: 'Yakkasaroy District (Candidate Area)',
    materialKeys: ['plastic', 'paper', 'metal'],
    targetMaterials: ['Plastic', 'Paper', 'Metal'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Яккасарайском районе.',
    isVerified: false,
    isOperational: false,
    image: DISTRICT_ICON_MAP.yakkasaroy
  },
  {
    id: 306,
    districtKey: 'olmazor',
    name: 'Olmazor District — Potential Network Expansion Area',
    type: 'plastic',
    status: 'candidate',
    lat: 41.3480,
    lng: 69.2150,
    district: 'Olmazor',
    address: 'Olmazor District (Candidate Area)',
    materialKeys: ['plastic', 'textile', 'mixed'],
    targetMaterials: ['Plastic', 'Textile', 'Mixed'],
    description: 'ZAMINAT изучает возможность развития сети сбора в Алмазарском районе.',
    isVerified: false,
    isOperational: false,
    image: DISTRICT_ICON_MAP.olmazor
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