export type CollectionPointStatus = 'verified' | 'planned' | 'candidate';

export interface CollectionPointItem {
  id: number;
  name: string;
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
 * Locations/districts approved by ZAMINAT as part of its future rollout roadmap.
 * NOT operational yet.
 */
export const PLANNED_COLLECTION_POINTS: CollectionPointItem[] = [
  {
    id: 201,
    name: 'Chilonzor District Hub',
    type: 'plastic',
    status: 'planned',
    lat: 41.2721,
    lng: 69.2084,
    district: 'Chilonzor',
    address: 'Bunyodkor Avenue / Chilonzor Hub',
    targetMaterials: ['Plastic', 'Paper', 'Mixed'],
    estimatedLaunch: 'Q4 2026',
    description: 'Планируемый районный хаб по раздельному сбору пластика и вторсырья.',
    isVerified: false,
    isOperational: false,
    image: '/images/compost_13285420.webp'
  },
  {
    id: 202,
    name: 'Yunusobod EcoHub',
    type: 'tires',
    status: 'planned',
    lat: 41.3654,
    lng: 69.2891,
    district: 'Yunusobod',
    address: 'Amir Temur Avenue / Yunusobod EcoHub',
    targetMaterials: ['Rubber', 'Tires', 'Plastic'],
    estimatedLaunch: 'Q1 2027',
    description: 'Планируемый специализированный пункт сбора изношенных шин и полимеров.',
    isVerified: false,
    isOperational: false,
    image: '/images/ECOBUSSTOP.webp'
  },
  {
    id: 203,
    name: 'Sergeli Polymer Point',
    type: 'mixed',
    status: 'planned',
    lat: 41.2230,
    lng: 69.2215,
    district: 'Sergeli',
    address: 'Yangisergeli Street / Industrial Zone',
    targetMaterials: ['Plastic', 'Metal', 'Rubber'],
    estimatedLaunch: 'Q2 2027',
    description: 'Интеграционный пункт для приёма вторсырья от махаллинских комитетов.',
    isVerified: false,
    isOperational: false,
    image: '/images/park.webp'
  }
];

/**
 * 3. CANDIDATE COLLECTION ZONES
 * Broad geographic candidate areas under consideration / feasibility study.
 * No commitment yet, district-level potential.
 */
export const CANDIDATE_COLLECTION_POINTS: CollectionPointItem[] = [
  {
    id: 301,
    name: "Mirzo Ulug'bek Candidate Area",
    type: 'plastic',
    status: 'candidate',
    lat: 41.3325,
    lng: 69.3370,
    district: "Mirzo Ulug'bek",
    address: "Mirzo Ulug'bek District (Candidate Zone)",
    targetMaterials: ['Plastic', 'Glass', 'Paper'],
    estimatedLaunch: 'Feasibility Study',
    description: 'Потенциальная зона для установки смарт-контейнеров по сбору пластика.',
    isVerified: false,
    isOperational: false,
    image: '/images/compost_13285420.webp'
  },
  {
    id: 302,
    name: 'Yakkasaroy Candidate Area',
    type: 'mixed',
    status: 'candidate',
    lat: 41.2850,
    lng: 69.2550,
    district: 'Yakkasaroy',
    address: 'Yakkasaroy District (Candidate Zone)',
    targetMaterials: ['Plastic', 'Paper', 'Metal'],
    estimatedLaunch: 'Feasibility Study',
    description: 'Рассматриваемая территория для махаллинского пункта приёма.',
    isVerified: false,
    isOperational: false,
    image: '/images/park.webp'
  },
  {
    id: 303,
    name: 'Olmazor Candidate Area',
    type: 'plastic',
    status: 'candidate',
    lat: 41.3480,
    lng: 69.2150,
    district: 'Olmazor',
    address: 'Olmazor District (Candidate Zone)',
    targetMaterials: ['Plastic', 'Textile', 'Mixed'],
    estimatedLaunch: 'Feasibility Study',
    description: 'Район предварительного анализа плотности образования отходов.',
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