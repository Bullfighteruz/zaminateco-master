export interface CollectionPointItem {
  id: number;
  name: string;
  type: 'plastic' | 'tires' | 'mixed';
  collected?: string;
  status?: string;
  distance?: string;
  emoji?: string;
  image?: string;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  address?: string;
  hours?: string;
  capacity?: string;
}

/**
 * Authoritative collection points dataset.
 * In production, only verified points with isVerified: true are exposed.
 * Currently empty until physical partner collection infrastructure is formally verified.
 */
export const VERIFIED_COLLECTION_POINTS: CollectionPointItem[] = [];

export const getCollectionPoints = (_t?: (key: string) => string): CollectionPointItem[] => {
  return VERIFIED_COLLECTION_POINTS.filter(point => point.isVerified === true);
};