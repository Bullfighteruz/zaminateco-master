import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, divIcon, Marker as LeafletMarker, type LeafletMouseEvent } from 'leaflet';
import { MapPin, Recycle, Navigation, ExternalLink, Clock, Users, X, Droplets, GraduationCap, Leaf, Activity, Info, Lightbulb, Target, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

interface MapPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'plastic' | 'tires' | 'mixed' | 'metal' | 'paper' | 'glass' | 'cleanup' | 'education' | 'recycling' | 'awareness';
  address: string;
  status?: 'verified' | 'planned' | 'candidate';
  district?: string;
  targetMaterials?: string[];
  estimatedLaunch?: string;
  isOperational?: boolean;
  hours?: string;
  capacity?: string;
  collected?: string;
  distance?: string;
  iconPath?: string;
  eventType?: string;
  description?: string;
  isActionLocation?: boolean;
}

interface InteractiveMapProps {
  points: MapPoint[];
  actionLocations?: MapPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onPointClick?: (point: MapPoint) => void;
  onNavigate?: (point: MapPoint) => void;
  isMobile?: boolean;
}

// Get icon path for collection points
const getCollectionPointIconPath = (type: 'plastic' | 'tires' | 'mixed', name: string): string => {
  // Check for specific location names first
  if (name.toLowerCase().includes('tashkent central park') || name.toLowerCase().includes('central park')) {
    return '/images/park.webp';
  }
  if (name.toLowerCase().includes('chilonzor')) {
    return '/images/Chilonzor Mahalla.webp';
  }
  if (name.toLowerCase().includes('yunusobod')) {
    return '/images/Yunusobod District.webp';
  }

  // Fallback to type-based icons
  switch (type) {
    case 'plastic':
      return '/images/compost_13285420.webp';
    case 'tires':
      return '/images/ECOBUSSTOP.webp';
    case 'mixed':
      return '/images/park.webp';
    default:
      return '/images/park.webp';
  }
};

// Create icon for collection points with text label and category badge
const createCollectionPointIcon = (
  type: 'plastic' | 'tires' | 'mixed' | 'metal' | 'paper' | 'glass',
  name: string,
  isMobile: boolean = false,
  status: 'verified' | 'planned' | 'candidate' = 'verified',
  statusLabel?: string
) => {
  const size = isMobile ? 36 : 44;
  const iconSize = isMobile ? 24 : 28;

  let badgeBg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  let badgeBorder = '1.5px solid white';
  let badgeShadow = '0 2px 8px rgba(16, 185, 129, 0.4)';
  let defaultLabel = 'Verified';
  let color = type === 'plastic' ? '#22c55e' : type === 'tires' ? '#3b82f6' : '#a855f7';

  if (status === 'planned') {
    badgeBg = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    badgeShadow = '0 2px 8px rgba(245, 158, 11, 0.4)';
    defaultLabel = 'Planned';
    color = '#f59e0b';
  } else if (status === 'candidate') {
    badgeBg = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
    badgeShadow = '0 2px 8px rgba(99, 102, 241, 0.4)';
    defaultLabel = 'Candidate';
    color = '#6366f1';
  }

  const labelText = statusLabel || defaultLabel;
  const iconPath = getCollectionPointIconPath(type as any, name);

  const iconHtml = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    ">
      <!-- Category Badge -->
      <div style="
        background: ${badgeBg};
        color: white;
        padding: ${isMobile ? '2px 8px' : '3px 10px'};
        border-radius: 12px;
        font-size: ${isMobile ? '8px' : '9px'};
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: ${badgeShadow};
        border: ${badgeBorder};
        margin-bottom: 4px;
        white-space: nowrap;
        z-index: 3;
        position: relative;
      ">${labelText}</div>

      <!-- Marker Icon -->
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px ${color}40;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
        overflow: hidden;
      ">
        <img
          src="${iconPath}"
          alt="${name}"
          style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            object-fit: contain;
            display: block;
          "
          onerror="this.onerror=null; this.style.display='none';"
        />
      </div>

      <!-- Location Name Label -->
      <div style="
        margin-top: 3px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: ${isMobile ? '2px 6px' : '3px 8px'};
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        font-size: ${isMobile ? '8px' : '9px'};
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #1f2937;
        letter-spacing: 0.01em;
        line-height: 1.2;
        white-space: normal;
        word-wrap: break-word;
        max-width: ${isMobile ? '100px' : '130px'};
        min-width: ${isMobile ? '50px' : '70px'};
        text-align: center;
        border: 0.5px solid rgba(255, 255, 255, 0.4);
        position: relative;
        z-index: 1;
        box-sizing: border-box;
      ">${name}</div>
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: 'collection-marker-div',
    iconSize: [isMobile ? 150 : 170, isMobile ? 100 : 115],
    iconAnchor: [isMobile ? 75 : 85, isMobile ? 100 : 115],
    popupAnchor: [0, -(isMobile ? 100 : 115)],
  });
};

// Get icon path for action locations
const getActionLocationIconPath = (type: 'cleanup' | 'education' | 'recycling' | 'awareness', name: string): string => {
  // Check for specific names first
  if (name.toLowerCase().includes('chirchiq') || name.toLowerCase().includes('river')) {
    return '/images/River Cleanup.webp';
  }
  if (name.toLowerCase().includes('school') || name.toLowerCase().includes('#45')) {
    return '/images/school.webp';
  }
  if (name.toLowerCase().includes('recycling') || name.toLowerCase().includes('badamzar')) {
    return '/images/Plastic Recycling.webp';
  }
  if (name.toLowerCase().includes('awareness') || name.toLowerCase().includes('walk') || name.toLowerCase().includes('olmazor')) {
    return '/images/community_16119903.webp';
  }

  // Fallback to type-based icons
  switch (type) {
    case 'cleanup':
      return '/images/River Cleanup.webp';
    case 'education':
      return '/images/school.webp';
    case 'recycling':
      return '/images/Plastic Recycling.webp';
    case 'awareness':
      return '/images/community_16119903.webp';
    default:
      return '/images/location_5174778.webp';
  }
};

// Create icon for action locations with text label and category badge
const createActionLocationIcon = (
  type: 'cleanup' | 'education' | 'recycling' | 'awareness',
  name: string,
  isMobile: boolean = false,
  eventLabel: string = 'Event'
) => {
  const size = isMobile ? 36 : 44;
  const labelSize = isMobile ? 28 : 32;
  const iconSize = isMobile ? 24 : 28;
  const categoryBadgeHeight = isMobile ? 18 : 20;

  const colorMap = {
    cleanup: '#06b6d4',      // cyan for river/water
    education: '#8b5cf6',    // purple for school
    recycling: '#10b981',    // green for recycling
    awareness: '#f59e0b'     // amber for awareness
  };

  const color = colorMap[type];
  const iconPath = getActionLocationIconPath(type, name);

  const iconHtml = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    ">
      <!-- Category Badge -->
      <div style="
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: ${isMobile ? '2px 8px' : '3px 10px'};
        border-radius: 12px;
        font-size: ${isMobile ? '8px' : '9px'};
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        border: 1.5px solid white;
        margin-bottom: 4px;
        white-space: nowrap;
        z-index: 3;
        position: relative;
      ">${eventLabel}</div>

      <!-- Marker Icon -->
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px ${color}40;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
        overflow: hidden;
      ">
        <img
          src="${iconPath}"
          alt="${name}"
          style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            object-fit: contain;
            display: block;
          "
          onerror="this.onerror=null; this.style.display='none';"
        />
      </div>

      <!-- Location Name Label -->
      <div style="
        margin-top: 3px;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: ${isMobile ? '2px 6px' : '3px 8px'};
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        font-size: ${isMobile ? '8px' : '9px'};
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #1f2937;
        letter-spacing: 0.01em;
        line-height: 1.2;
        white-space: normal;
        word-wrap: break-word;
        max-width: ${isMobile ? '100px' : '130px'};
        min-width: ${isMobile ? '50px' : '70px'};
        text-align: center;
        border: 0.5px solid rgba(255, 255, 255, 0.4);
        position: relative;
        z-index: 1;
        box-sizing: border-box;
      ">${name}</div>
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: 'action-marker-div',
    iconSize: [isMobile ? 150 : 170, isMobile ? 100 : 115],
    iconAnchor: [isMobile ? 75 : 85, isMobile ? 100 : 115],
    popupAnchor: [0, -(isMobile ? 100 : 115)],
  });
};

// Component to handle map view updates
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

// Custom Popup Content Component
const CustomPopup: React.FC<{ point: MapPoint; isMobile: boolean; onNavigate: (point: MapPoint) => void }> = ({
  point,
  isMobile,
  onNavigate
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const [tipsOpen, setTipsOpen] = useState(false);

  const getTranslatedType = () => {
    switch (point.type) {
      case 'plastic':
        return t('plastic', { ns: 'translation', defaultValue: 'Plastic' });
      case 'tires':
        return t('tires', { ns: 'translation', defaultValue: 'Tires' });
      case 'mixed':
        return t('mixed', { ns: 'translation', defaultValue: 'Mixed' });
      default:
        return point.type.charAt(0).toUpperCase() + point.type.slice(1);
    }
  };

  const getLocationSummary = () => {
    switch (point.type) {
      case 'plastic':
        return t('plasticCollectionSummary', {
          ns: 'translation',
          defaultValue: 'Drop off clean plastic waste for recycling into eco-tiles and sustainable infrastructure.'
        });
      case 'tires':
        return t('tiresCollectionSummary', {
          ns: 'translation',
          defaultValue: 'Tire recycling facility. Dispose old tires to support circular economy and eco-friendly infrastructure.'
        });
      case 'mixed':
        return t('mixedCollectionSummary', {
          ns: 'translation',
          defaultValue: 'Mixed waste collection point. Accepts various recyclable materials for proper processing.'
        });
      default:
        return t('defaultCollectionSummary', {
          ns: 'translation',
          defaultValue: 'Waste collection point for environmental sustainability.'
        });
    }
  };

  const getRecyclingTips = () => {
    switch (point.type) {
      case 'plastic':
        return [
          t('cleanBottlesContainers', { ns: 'translation', defaultValue: 'Clean bottles and containers before bringing them' }),
          t('removeLabelsCaps', { ns: 'translation', defaultValue: 'Remove labels and caps when possible' }),
          t('sortByType', { ns: 'translation', defaultValue: 'Sort by type: bottles, bags, containers' }),
          t('noFoodResidue', { ns: 'translation', defaultValue: 'No food residue or contamination' })
        ];
      case 'tires':
        return [
          t('removeRimsMetal', { ns: 'translation', defaultValue: 'Remove rims and metal parts if possible' }),
          t('cleanTiresMud', { ns: 'translation', defaultValue: 'Clean tires from mud and debris' }),
          t('checkTireCondition', { ns: 'translation', defaultValue: 'Check tire condition - no excessive damage' }),
          t('stackTiresNeatly', { ns: 'translation', defaultValue: 'Stack tires neatly for easy collection' })
        ];
      case 'mixed':
        return [
          t('separateByType', { ns: 'translation', defaultValue: 'Separate materials by type before arrival' }),
          t('cleanThoroughly', { ns: 'translation', defaultValue: 'Clean all items thoroughly' }),
          t('removeNonRecyclables', { ns: 'translation', defaultValue: 'Remove non-recyclable components' }),
          t('followSortingGuidelines', { ns: 'translation', defaultValue: 'Follow sorting guidelines for each material' })
        ];
      default:
        return [];
    }
  };

  const getTipIcon = () => {
    switch (point.type) {
      case 'plastic':
        return '♻️';
      case 'tires':
        return '🛞';
      case 'mixed':
        return '🗂️';
      default:
        return 'ℹ️';
    }
  };

  const tips = getRecyclingTips();

  const isVerified = point.status === 'verified';
  const isPlanned = point.status === 'planned';
  const isCandidate = point.status === 'candidate';

  return (
    <div className={cn(
      "p-3 min-w-[280px] max-w-[320px]",
      isMobile && "min-w-[260px] max-w-[300px]"
    )}>
      <div className="space-y-3">
        {/* Header - Essential Info */}
        <div>
          <h3 className={cn(
            "font-semibold text-gray-900 mb-1.5",
            isMobile ? "text-sm" : "text-base"
          )}>
            {point.name}
          </h3>
          <div className="flex items-start gap-1.5">
            <MapPin className={cn("flex-shrink-0 mt-0.5 text-gray-500", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
            <p className={cn(
              "text-gray-600 leading-snug",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {point.address}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={cn(
            point.type === 'plastic' ? 'bg-green-100 text-green-800' :
            point.type === 'tires' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800',
            isMobile ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-0.5"
          )}>
            {getTranslatedType()}
          </Badge>

          {isVerified && (
            <Badge variant="outline" className={cn(
              "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold",
              isMobile ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-0.5"
            )}>
              {t('actions.verifiedOperating', { ns: 'actions', defaultValue: 'Подтверждён' })}
            </Badge>
          )}

          {isPlanned && (
            <>
              <Badge className={cn(
                "bg-amber-500 text-white font-bold",
                isMobile ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-0.5"
              )}>
                {t('actions.plannedPoint', { ns: 'actions', defaultValue: 'Планируемая точка' })}
              </Badge>
              <Badge variant="outline" className={cn(
                "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
                isMobile ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
              )}>
                {t('actions.notOperationalYet', { ns: 'actions', defaultValue: 'Ещё не работает' })}
              </Badge>
            </>
          )}

          {isCandidate && (
            <>
              <Badge className={cn(
                "bg-indigo-600 text-white font-bold",
                isMobile ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-0.5"
              )}>
                {t('actions.candidateZone', { ns: 'actions', defaultValue: 'Рассматриваемая зона' })}
              </Badge>
              <Badge variant="outline" className={cn(
                "bg-slate-100 text-slate-700 border-slate-300 font-medium",
                isMobile ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
              )}>
                {t('actions.underReview', { ns: 'actions', defaultValue: 'Изучение спроса' })}
              </Badge>
            </>
          )}
        </div>

        {/* Planned / Candidate Notice Box */}
        {isPlanned && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-950 text-xs space-y-1">
            <p className="font-semibold text-amber-900 leading-tight">
              {t('actions.plannedRolloutNotice', { ns: 'actions', defaultValue: 'Локация утверждена в плане развития сети ZAMINAT.' })}
            </p>
            {point.estimatedLaunch && (
              <p className="text-[11px] text-amber-800">
                <span className="font-medium">{t('actions.estimatedLaunch', { ns: 'actions', defaultValue: 'Ориентировочный запуск' })}:</span> {point.estimatedLaunch}
              </p>
            )}
            {point.targetMaterials && point.targetMaterials.length > 0 && (
              <p className="text-[11px] text-amber-800">
                <span className="font-medium">{t('actions.targetMaterials', { ns: 'actions', defaultValue: 'Планируемые материалы' })}:</span> {point.targetMaterials.join(', ')}
              </p>
            )}
          </div>
        )}

        {isCandidate && (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-950 text-xs space-y-1">
            <p className="font-semibold text-indigo-950 leading-tight">
              {t('actions.candidateStudyNotice', { ns: 'actions', defaultValue: 'Зона предварительного анализа плотности образования отходов.' })}
            </p>
            <p className="text-[11px] text-indigo-800 leading-tight">
              {t('actions.noCommitmentNotice', { ns: 'actions', defaultValue: 'Окончательное решение принимается по результатам согласования.' })}
            </p>
          </div>
        )}

        {/* Quick Info for Verified Operating Points */}
        {isVerified && (
          <div className={cn(
            "flex items-center gap-3 text-gray-600 py-2 border-y border-gray-200",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {point.hours && (
              <div className="flex items-center gap-1.5">
                <Clock className={cn("flex-shrink-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                <span>{point.hours}</span>
              </div>
            )}
            {point.collected && (
              <div className="flex items-center gap-1.5">
                <Recycle className={cn("flex-shrink-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                <span className="font-semibold text-green-700">{point.collected}kg</span>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Tips Section for Verified Points */}
        {isVerified && tips.length > 0 && (
          <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between w-full p-2 rounded-lg bg-amber-50/50 border border-amber-200 hover:bg-amber-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Lightbulb className={cn("text-amber-600", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                  <span className={cn(
                    "font-semibold text-amber-900",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('recyclingTips', { ns: 'translation', defaultValue: 'Recycling Tips' })}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "text-amber-600 transition-transform duration-200",
                  tipsOpen && "rotate-180",
                  isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-2.5 bg-amber-50/30 border border-amber-200 rounded-lg">
                <div className="grid grid-cols-1 gap-2">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="flex-shrink-0 text-sm mt-0.5">{getTipIcon()}</span>
                      <span className={cn("leading-relaxed", isMobile ? "text-xs" : "text-sm")}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {isVerified ? (
            <>
              <Button
                size="sm"
                onClick={() => onNavigate(point)}
                className={cn(
                  "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white",
                  isMobile ? "h-9 text-sm px-3" : "h-10 text-base px-4"
                )}
              >
                <Navigation className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                {t('navigate', { ns: 'translation', defaultValue: 'Navigate' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
                  window.open(url, '_blank');
                }}
                className={cn(
                  "hover:bg-gray-50",
                  isMobile ? "h-9 w-9 p-0" : "h-10 w-10 p-0"
                )}
                title={t('openInGoogleMaps', { ns: 'translation', defaultValue: 'Open in Google Maps' })}
              >
                <ExternalLink className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </Button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
              <Info className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              {isPlanned
                ? t('actions.dropoffUnavailable', { ns: 'actions', defaultValue: 'Приём ещё не начат (в планах)' })
                : t('actions.zoneUnderReview', { ns: 'actions', defaultValue: 'Зона находится на рассмотрении' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Action Location Popup Component
const ActionLocationPopup: React.FC<{
  point: MapPoint;
  isMobile: boolean;
  onNavigate: (point: MapPoint) => void
}> = ({ point, isMobile, onNavigate }) => {
  const { t } = useTranslation(['translation', 'actions']);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getIcon = () => {
    switch (point.type) {
      case 'cleanup': return <Droplets className={cn("mr-1.5", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />;
      case 'education': return <GraduationCap className={cn("mr-1.5", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />;
      case 'recycling': return <Recycle className={cn("mr-1.5", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />;
      case 'awareness': return <Activity className={cn("mr-1.5", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />;
      default: return <MapPin className={cn("mr-1.5", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />;
    }
  };

  const getColor = () => {
    switch (point.type) {
      case 'cleanup': return 'bg-cyan-100 text-cyan-800';
      case 'education': return 'bg-purple-100 text-purple-800';
      case 'recycling': return 'bg-green-100 text-green-800';
      case 'awareness': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventDescription = () => {
    const nameLower = point.name.toLowerCase();
    if (nameLower.includes('chirchiq') || nameLower.includes('river')) {
      return t('events.riverCleanup.description', {
        ns: 'actions',
        defaultValue: 'Help clean the Chirchiq River banks from plastic waste and debris while learning about water ecosystem protection.'
      });
    }
    if (nameLower.includes('school') || nameLower.includes('#45')) {
      return t('events.schoolWorkshop.description', {
        ns: 'actions',
        defaultValue: 'Interactive workshop teaching children about plastic recycling, waste management, and environmental protection through fun activities and games.'
      });
    }
    if (nameLower.includes('recycling') || nameLower.includes('badamzar')) {
      return t('events.plasticRecycling.description', {
        ns: 'actions',
        defaultValue: 'Collect and sort plastic waste from neighborhoods for proper recycling into eco-tiles and construction materials.'
      });
    }
    if (nameLower.includes('awareness') || nameLower.includes('walk') || nameLower.includes('olmazor')) {
      return t('events.awarenessWalk.description', {
        ns: 'actions',
        defaultValue: 'Peaceful walk through Tashkent promoting environmental consciousness and sustainable living practices.'
      });
    }
    return point.description || t('actionLocationDescription', {
      ns: 'translation',
      defaultValue: 'Join us for this environmental action to make a positive impact on our community.'
    });
  };

  const getEventTips = () => {
    const nameLower = point.name.toLowerCase();
    if (nameLower.includes('chirchiq') || nameLower.includes('river')) {
      return [
        t('cleanupTip1', { ns: 'translation', defaultValue: 'Wear old clothes & rubber boots' }),
        t('cleanupTip2', { ns: 'translation', defaultValue: 'Bring gloves & water bottle' }),
        t('cleanupTip3', { ns: 'translation', defaultValue: 'Work in teams for safety' }),
        t('cleanupTip4', { ns: 'translation', defaultValue: 'Sort waste by type' })
      ];
    }
    if (nameLower.includes('school') || nameLower.includes('#45')) {
      return [
        t('educationTip1', { ns: 'translation', defaultValue: 'Bring notebook & pen' }),
        t('educationTip2', { ns: 'translation', defaultValue: 'Wear comfortable clothing' }),
        t('educationTip3', { ns: 'translation', defaultValue: 'Prepare interactive activities' }),
        t('educationTip4', { ns: 'translation', defaultValue: 'Engage with children actively' })
      ];
    }
    if (nameLower.includes('recycling') || nameLower.includes('badamzar')) {
      return [
        t('recyclingEventTip1', { ns: 'translation', defaultValue: 'Sort plastic by type' }),
        t('recyclingEventTip2', { ns: 'translation', defaultValue: 'Clean items before bringing' }),
        t('recyclingEventTip3', { ns: 'translation', defaultValue: 'Bring gloves & water' }),
        t('recyclingEventTip4', { ns: 'translation', defaultValue: 'Follow sorting guidelines' })
      ];
    }
    if (nameLower.includes('awareness') || nameLower.includes('walk') || nameLower.includes('olmazor')) {
      return [
        t('walkTip1', { ns: 'translation', defaultValue: 'Wear comfortable walking shoes' }),
        t('walkTip2', { ns: 'translation', defaultValue: 'Bring water bottle' }),
        t('walkTip3', { ns: 'translation', defaultValue: 'Prepare eco-friendly signs' }),
        t('walkTip4', { ns: 'translation', defaultValue: 'Invite friends & family' })
      ];
    }
    return [];
  };

  const getEventImpact = () => {
    const nameLower = point.name.toLowerCase();
    if (nameLower.includes('chirchiq') || nameLower.includes('river')) {
      return t('events.riverCleanup.impact', {
        ns: 'actions',
        defaultValue: 'Clean 2km of riverbank, remove 500kg+ of waste from water ecosystem'
      });
    }
    if (nameLower.includes('school') || nameLower.includes('#45')) {
      return t('events.schoolWorkshop.impact', {
        ns: 'actions',
        defaultValue: 'Educate 100+ children about environmental protection and sustainable practices'
      });
    }
    if (nameLower.includes('recycling') || nameLower.includes('badamzar')) {
      return t('events.plasticRecycling.impact', {
        ns: 'actions',
        defaultValue: 'Process 300kg+ plastic waste into valuable eco-products'
      });
    }
    if (nameLower.includes('awareness') || nameLower.includes('walk') || nameLower.includes('olmazor')) {
      return t('events.awarenessWalk.impact', {
        ns: 'actions',
        defaultValue: 'Reach 1000+ people with environmental messages, inspire sustainable living'
      });
    }
    return null;
  };

  const getTranslatedEventType = () => {
    const eventType = point.eventType || point.type;
    if (!eventType) return '';

    // Check for specific event types first
    if (eventType.toLowerCase().includes('river') || eventType.toLowerCase().includes('cleanup')) {
      if (eventType.toLowerCase().includes('river')) {
        return t('eventTypeRiverCleanup', { ns: 'translation', defaultValue: 'River Cleanup' });
      }
      return t('eventTypeCleanup', { ns: 'translation', defaultValue: 'Cleanup' });
    }

    // Map common event types
    switch (eventType.toLowerCase()) {
      case 'cleanup':
        return t('eventTypeCleanup', { ns: 'translation', defaultValue: 'Cleanup' });
      case 'education':
        return t('eventTypeEducation', { ns: 'translation', defaultValue: 'Education' });
      case 'recycling':
        return t('eventTypeRecycling', { ns: 'translation', defaultValue: 'Recycling' });
      case 'awareness':
        return t('eventTypeAwareness', { ns: 'translation', defaultValue: 'Awareness' });
      default:
        // If it's already translated or doesn't match, return as is
        return eventType;
    }
  };

  const tips = getEventTips();
  const impact = getEventImpact();

  return (
    <div className={cn(
      "p-3 min-w-[280px] max-w-[320px]",
      isMobile && "min-w-[260px] max-w-[300px]"
    )}>
      <div className="space-y-3">
        {/* Header - Essential Info */}
        <div>
          <h3 className={cn("font-semibold text-gray-900 mb-1.5", isMobile ? "text-sm" : "text-base")}>
            {point.name}
          </h3>
          <div className="flex items-start gap-1.5">
            <MapPin className={cn("flex-shrink-0 mt-0.5 text-gray-500", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
            <p className={cn("text-gray-600 leading-snug", isMobile ? "text-xs" : "text-sm")}>
              {point.address}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn(getColor(), isMobile ? "text-xs px-2 py-1" : "text-sm px-2.5 py-1")}>
            {getIcon()}
            {getTranslatedEventType()}
          </Badge>
          <Badge variant="outline" className={cn("bg-blue-50 text-blue-800 border-blue-200", isMobile ? "text-xs px-2 py-1" : "text-sm px-2.5 py-1")}>
            {t('actionLocation', { ns: 'translation', defaultValue: 'Action Location' })}
          </Badge>
        </div>

        {/* Collapsible Description */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className={cn(
              "flex items-center justify-between w-full p-2.5 rounded-lg border-l-3 transition-colors",
              point.type === 'cleanup' ? 'bg-cyan-50/50 border-cyan-400 hover:bg-cyan-50' :
              point.type === 'education' ? 'bg-purple-50/50 border-purple-400 hover:bg-purple-50' :
              point.type === 'recycling' ? 'bg-green-50/50 border-green-400 hover:bg-green-50' :
              'bg-amber-50/50 border-amber-400 hover:bg-amber-50'
            )}>
              <div className="flex items-center gap-2 flex-1 text-left">
                <Info className={cn(
                  point.type === 'cleanup' ? 'text-cyan-600' :
                  point.type === 'education' ? 'text-purple-600' :
                  point.type === 'recycling' ? 'text-green-600' :
                  'text-amber-600',
                  isMobile ? "h-4 w-4" : "h-4 w-4"
                )} />
                <span className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {t('description', { ns: 'translation', defaultValue: 'Description' })}
                </span>
              </div>
              <ChevronDown className={cn(
                "transition-transform duration-200",
                detailsOpen && "rotate-180",
                isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
              )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={cn(
              "mt-2 p-2.5 rounded-lg border-l-3",
              point.type === 'cleanup' ? 'bg-cyan-50/30 border-cyan-300' :
              point.type === 'education' ? 'bg-purple-50/30 border-purple-300' :
              point.type === 'recycling' ? 'bg-green-50/30 border-green-300' :
              'bg-amber-50/30 border-amber-300'
            )}>
              <p className={cn("text-gray-700 leading-relaxed", isMobile ? "text-xs" : "text-sm")}>
                {getEventDescription()}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Collapsible Tips Section */}
        {tips.length > 0 && (
          <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between w-full p-2 rounded-lg bg-amber-50/50 border border-amber-200 hover:bg-amber-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Lightbulb className={cn("text-amber-600", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                  <span className={cn(
                    "font-semibold text-amber-900",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('participationTips', { ns: 'translation', defaultValue: 'Participation Tips' })}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "text-amber-600 transition-transform duration-200",
                  tipsOpen && "rotate-180",
                  isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-2.5 bg-amber-50/30 border border-amber-200 rounded-lg">
                <div className="grid grid-cols-1 gap-2">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="flex-shrink-0 text-sm mt-0.5">✓</span>
                      <span className={cn("leading-relaxed", isMobile ? "text-xs" : "text-sm")}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Collapsible Impact */}
        {impact && (
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between w-full p-2 rounded-lg bg-green-50/50 border border-green-200 hover:bg-green-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Target className={cn("text-green-600", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                  <span className={cn(
                    "font-semibold text-green-900",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('expectedImpact', { ns: 'translation', defaultValue: 'Expected Impact' })}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "text-green-600 transition-transform duration-200",
                  isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-2.5 bg-green-50/30 border border-green-200 rounded-lg">
                <p className={cn("text-gray-700 leading-relaxed", isMobile ? "text-xs" : "text-sm")}>
                  {impact}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => onNavigate(point)}
            className={cn("flex-1 bg-emerald-600 hover:bg-emerald-700 text-white", isMobile ? "h-9 text-sm px-3" : "h-10 text-base px-4")}
          >
            <Navigation className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
            {t('navigate', { ns: 'translation', defaultValue: 'Navigate' })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
              window.open(url, '_blank');
            }}
            className={cn("hover:bg-gray-50", isMobile ? "h-9 w-9 p-0" : "h-10 w-10 p-0")}
            title={t('openInGoogleMaps', { ns: 'translation', defaultValue: 'Open in Google Maps' })}
          >
            <ExternalLink className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function InteractiveMap({
  points,
  actionLocations = [],
  center = { lat: 41.2995, lng: 69.2401 },
  zoom = 12,
  height = '600px',
  onPointClick,
  onNavigate,
  isMobile = false
}: InteractiveMapProps) {
  const { t } = useTranslation('translation');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  const centerPosition: LatLngExpression = useMemo(() => [center.lat, center.lng], [center.lat, center.lng]);

  const handleMarkerClick = (point: MapPoint) => {
    setSelectedPoint(point);
    onPointClick?.(point);
  };

  const handleNavigate = (point: MapPoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
    window.open(url, '_blank');
    onNavigate?.(point);
  };

  // Collection point marker component
  const CollectionPointMarker: React.FC<{ point: MapPoint }> = ({ point }) => {
    const markerRef = useRef<React.ComponentRef<typeof Marker> | null>(null);
    const status = point.status || 'verified';
    const statusLabel =
      status === 'planned' ? t('actions.plannedPoint', { ns: 'actions', defaultValue: 'Планируется' }) :
      status === 'candidate' ? t('actions.candidateZone', { ns: 'actions', defaultValue: 'На рассмотрении' }) :
      t('actions.verifiedPoint', { ns: 'actions', defaultValue: 'Подтверждён' });

    const icon = createCollectionPointIcon(
      point.type as any,
      point.name,
      isMobile,
      status,
      statusLabel
    );

    useEffect(() => {
      const marker = markerRef.current?.leafletElement;
      if (!marker) return;

      const handleClick = (e: LeafletMouseEvent) => {
        e.originalEvent?.stopPropagation();
        e.originalEvent?.preventDefault();
        handleMarkerClick(point);
        marker.openPopup();
      };

      marker.on('click', handleClick);

      return () => {
        marker.off('click', handleClick);
      };
    }, [point]);

    return (
      <Marker
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
      >
        <Popup
          closeButton={true}
          className="custom-popup"
          maxWidth={isMobile ? 320 : 360}
          autoPan={true}
          autoPanPadding={[30, 30]}
        >
          <CustomPopup
            point={point}
            isMobile={isMobile}
            onNavigate={handleNavigate}
          />
        </Popup>
      </Marker>
    );
  };

  // Action location marker component
  const ActionLocationMarker: React.FC<{ point: MapPoint }> = ({ point }) => {
    const markerRef = useRef<React.ComponentRef<typeof Marker> | null>(null);
    const icon = createActionLocationIcon(
      point.type as 'cleanup' | 'education' | 'recycling' | 'awareness',
      point.name,
      isMobile,
      t('event')
    );

    useEffect(() => {
      const marker = markerRef.current?.leafletElement;
      if (!marker) return;

      const handleClick = (e: LeafletMouseEvent) => {
        e.originalEvent?.stopPropagation();
        e.originalEvent?.preventDefault();
        handleMarkerClick(point);
        marker.openPopup();
      };

      marker.on('click', handleClick);

      return () => {
        marker.off('click', handleClick);
      };
    }, [point]);

    return (
      <Marker
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
      >
        <Popup
          closeButton={true}
          className="custom-popup"
          maxWidth={isMobile ? 320 : 360}
          autoPan={true}
          autoPanPadding={[30, 30]}
        >
          <ActionLocationPopup
            point={point}
            isMobile={isMobile}
            onNavigate={handleNavigate}
          />
        </Popup>
      </Marker>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Leaflet Map Container */}
      <div
        className={cn(
          "w-full rounded-lg overflow-hidden relative",
          isMobile ? "h-80" : "h-full"
        )}
        style={{
          height: height === '100%' ? '100%' : height,
          minHeight: isMobile ? '350px' : '500px',
          backgroundColor: '#f8f9fa',
          touchAction: 'pan-x pan-y pinch-zoom'
        }}
      >
        {typeof window !== 'undefined' && (
          <MapContainer
            center={centerPosition}
            zoom={zoom}
            scrollWheelZoom={!isMobile}
            doubleClickZoom={false}
            touchZoom={true}
            dragging={true}
            style={{ height: '100%', width: '100%', zIndex: 1, minHeight: isMobile ? '350px' : '500px' }}
            className="rounded-lg"
            whenReady={() => setMapLoaded(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewUpdater center={centerPosition} zoom={zoom} />
            {/* Collection Points */}
            {points.map((point) => (
              <CollectionPointMarker key={point.id} point={point} />
            ))}
            {/* Action Locations */}
            {actionLocations.map((point) => (
              <ActionLocationMarker key={point.id} point={point} />
            ))}
          </MapContainer>
        )}

        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">{t('loadingMap')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Info Panel */}
      <AnimatePresence>
        {selectedPoint && isMobile && !selectedPoint.isActionLocation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl border-t border-gray-200 z-50 max-h-[70vh] overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {selectedPoint.name}
                  </h3>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="flex-shrink-0 mt-0.5 text-gray-500 h-3 w-3" />
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedPoint.address}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPoint(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 mb-3">
                <Badge
                  className={
                    selectedPoint.type === 'plastic' ? 'bg-green-100 text-green-800' :
                    selectedPoint.type === 'tires' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }
                >
                  {selectedPoint.type.charAt(0).toUpperCase() + selectedPoint.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  {t('active')}
                </Badge>
              </div>

              {/* Location Summary */}
              <div className={cn(
                "bg-gradient-to-r p-3 rounded-lg border-l-4 mb-3",
                selectedPoint.type === 'plastic' ? 'bg-green-50 border-green-400' :
                selectedPoint.type === 'tires' ? 'bg-blue-50 border-blue-400' :
                'bg-purple-50 border-purple-400'
              )}>
                <div className="flex items-start gap-2">
                  <Info className={cn("flex-shrink-0 mt-0.5 h-3.5 w-3.5",
                    selectedPoint.type === 'plastic' ? 'text-green-600' :
                    selectedPoint.type === 'tires' ? 'text-blue-600' :
                    'text-purple-600'
                  )} />
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {selectedPoint.type === 'plastic'
                      ? t('plasticCollectionSummary', { ns: 'translation' })
                      : selectedPoint.type === 'tires'
                      ? t('tiresCollectionSummary', { ns: 'translation' })
                      : t('mixedCollectionSummary', { ns: 'translation' })}
                  </p>
                </div>
              </div>

              {/* Recycling Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="text-amber-600 h-3.5 w-3.5" />
                  <h4 className="font-semibold text-amber-900 text-xs">
                    {t('recyclingTips')}
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {selectedPoint.type === 'plastic' ? (
                    <>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">♻️</span>
                        <span className="leading-relaxed">{t('cleanBottlesContainers')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">♻️</span>
                        <span className="leading-relaxed">{t('removeLabelsCaps')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">♻️</span>
                        <span className="leading-relaxed">{t('sortByType')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">♻️</span>
                        <span className="leading-relaxed">{t('noFoodResidue')}</span>
                      </li>
                    </>
                  ) : selectedPoint.type === 'tires' ? (
                    <>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🛞</span>
                        <span className="leading-relaxed">{t('removeRimsMetal')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🛞</span>
                        <span className="leading-relaxed">{t('cleanTiresMud')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🛞</span>
                        <span className="leading-relaxed">{t('checkTireCondition')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🛞</span>
                        <span className="leading-relaxed">{t('stackTiresNeatly')}</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🗂️</span>
                        <span className="leading-relaxed">{t('separateByType')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🗂️</span>
                        <span className="leading-relaxed">{t('cleanThoroughly')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🗂️</span>
                        <span className="leading-relaxed">{t('removeNonRecyclables')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">🗂️</span>
                        <span className="leading-relaxed">{t('followSortingGuidelines')}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="space-y-2 text-xs text-gray-600 mb-4">
                {selectedPoint.hours && (
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-2" />
                    <span className="font-medium">{t('hours')}</span>
                    <span className="ml-1">{selectedPoint.hours}</span>
                  </div>
                )}
                {selectedPoint.capacity && (
                  <div className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-2" />
                    <span className="font-medium">{t('capacity')}</span>
                    <span className="ml-1">{selectedPoint.capacity}</span>
                  </div>
                )}
                {selectedPoint.collected && (
                  <div className="flex items-center">
                    <Recycle className="h-3.5 w-3.5 mr-2" />
                    <span className="font-medium">{t('collectedLabel')}</span>
                    <span className="ml-1 font-semibold text-green-700">{selectedPoint.collected} kg</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleNavigate(selectedPoint)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-9"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('navigate')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${selectedPoint.lat},${selectedPoint.lng}`;
                    window.open(url, '_blank');
                  }}
                  className="h-9"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for Leaflet popup and markers */}
      <style>{`
        .leaflet-container {
          background: #f8f9fa !important;
          font-family: inherit;
        }
        .leaflet-tile-container img {
          max-width: none !important;
          max-height: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          max-height: 520px;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          max-height: 500px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .custom-popup .leaflet-popup-content::-webkit-scrollbar {
          width: 6px;
        }
        .custom-popup .leaflet-popup-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-popup .leaflet-popup-content::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-popup .leaflet-popup-content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-popup .leaflet-popup-close-button {
          width: 24px;
          height: 24px;
          font-size: 18px;
          line-height: 24px;
          color: #666;
          z-index: 10;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          color: #000;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .custom-marker-div {
          background: transparent !important;
          border: none !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .action-marker-div {
          background: transparent !important;
          border: none !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .collection-marker-div {
          background: transparent !important;
          border: none !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .custom-marker-div * {
          pointer-events: none !important;
        }
        .action-marker-div * {
          pointer-events: none !important;
        }
        .collection-marker-div * {
          pointer-events: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
