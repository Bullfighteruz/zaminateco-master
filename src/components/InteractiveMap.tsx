import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { LatLngExpression, divIcon, type LeafletMouseEvent } from 'leaflet';
import { MapPin, Recycle, Navigation, ExternalLink, Clock, Users, X, Droplets, GraduationCap, Activity, Info, Lightbulb, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDistrictIcon, type MaterialKey } from '@/lib/collectionData';
import 'leaflet/dist/leaflet.css';

export interface MapPoint {
  id: number;
  districtKey?: string;
  name: string;
  lat: number;
  lng: number;
  type: 'plastic' | 'tires' | 'mixed' | 'metal' | 'paper' | 'glass' | 'cleanup' | 'education' | 'recycling' | 'awareness';
  address: string;
  status?: 'verified' | 'planned' | 'candidate';
  district?: string;
  materialKeys?: MaterialKey[];
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

// Get icon path for action locations
const getActionLocationIconPath = (type: 'cleanup' | 'education' | 'recycling' | 'awareness', name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('chirchiq') || lower.includes('river')) {
    return '/images/River Cleanup.webp';
  }
  if (lower.includes('school') || lower.includes('#45')) {
    return '/images/school.webp';
  }
  if (lower.includes('recycling') || lower.includes('badamzar')) {
    return '/images/Plastic Recycling.webp';
  }
  if (lower.includes('awareness') || lower.includes('walk') || lower.includes('olmazor')) {
    return '/images/community_16119903.webp';
  }

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

// Create clean, location-first marker icon for collection points (0 permanent floating labels)
const createCollectionPointIcon = (
  type: 'plastic' | 'tires' | 'mixed' | 'metal' | 'paper' | 'glass',
  displayName: string,
  isMobile: boolean = false,
  status: 'verified' | 'planned' | 'candidate' = 'verified',
  isSelected: boolean = false,
  iconSrc?: string
) => {
  const baseSize = isMobile ? 36 : 40;
  const size = isSelected ? baseSize + 6 : baseSize;
  const iconSize = Math.round(size * 0.62);

  let bg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  let shadow = isSelected
    ? '0 0 0 4px rgba(16, 185, 129, 0.5), 0 8px 18px rgba(5, 150, 105, 0.45)'
    : '0 0 0 2px rgba(16, 185, 129, 0.25), 0 3px 10px rgba(0,0,0,0.18)';
  const border = '2.5px solid #ffffff';

  if (status === 'planned') {
    bg = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    shadow = isSelected
      ? '0 0 0 4px rgba(245, 158, 11, 0.5), 0 8px 18px rgba(217, 119, 6, 0.45)'
      : '0 0 0 2px rgba(245, 158, 11, 0.25), 0 3px 10px rgba(0,0,0,0.18)';
  } else if (status === 'candidate') {
    bg = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
    shadow = isSelected
      ? '0 0 0 4px rgba(99, 102, 241, 0.55), 0 8px 18px rgba(79, 70, 229, 0.5)'
      : '0 0 0 3px rgba(99, 102, 241, 0.25), 0 3px 10px rgba(0,0,0,0.18)';
  }

  const iconPath = iconSrc || getDistrictIcon(displayName);

  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      border-radius: 50%;
      border: ${border};
      box-shadow: ${shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      position: relative;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      cursor: pointer;
    ">
      <img
        src="${iconPath}"
        alt=""
        style="
          width: ${iconSize}px;
          height: ${iconSize}px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
        "
        onerror="this.onerror=null; this.style.display='none';"
      />
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: 'zaminat-map-marker-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
};

// Create clean, location-first marker icon for action locations (0 permanent floating labels)
const createActionLocationIcon = (
  type: 'cleanup' | 'education' | 'recycling' | 'awareness',
  name: string,
  isMobile: boolean = false,
  isSelected: boolean = false
) => {
  const baseSize = isMobile ? 36 : 40;
  const size = isSelected ? baseSize + 6 : baseSize;
  const iconSize = Math.round(size * 0.62);

  const colorMap = {
    cleanup: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',   // sky/cyan
    education: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // purple
    recycling: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', // emerald
    awareness: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'  // amber
  };

  const shadowMap = {
    cleanup: 'rgba(2, 132, 199, ',
    education: 'rgba(139, 92, 246, ',
    recycling: 'rgba(16, 185, 129, ',
    awareness: 'rgba(245, 158, 11, '
  };

  const bg = colorMap[type] || 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
  const shadowColor = shadowMap[type] || 'rgba(2, 132, 199, ';
  const shadow = isSelected
    ? `0 0 0 4px ${shadowColor}0.55), 0 8px 18px ${shadowColor}0.5)`
    : `0 0 0 2px ${shadowColor}0.25), 0 3px 10px rgba(0,0,0,0.18)`;

  const iconPath = getActionLocationIconPath(type, name);

  // Distinct squircle shape (12px rounded corners) for action events
  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      border-radius: 12px;
      border: 2.5px solid #ffffff;
      box-shadow: ${shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      position: relative;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      cursor: pointer;
    ">
      <img
        src="${iconPath}"
        alt=""
        style="
          width: ${iconSize}px;
          height: ${iconSize}px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
        "
        onerror="this.onerror=null; this.style.display='none';"
      />
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: 'zaminat-action-marker-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
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

// Custom Popup Content Component for Collection Points
const CustomPopup: React.FC<{
  point: MapPoint;
  isMobile: boolean;
  onNavigate: (point: MapPoint) => void;
}> = ({ point, isMobile, onNavigate }) => {
  const { t } = useTranslation(['actions', 'translation']);
  const [tipsOpen, setTipsOpen] = useState(false);

  const isVerified = point.status === 'verified';
  const isPlanned = point.status === 'planned';
  const isCandidate = point.status === 'candidate';

  const localizedName = point.districtKey
    ? t(`districts.${point.districtKey}.title`, { ns: 'actions', defaultValue: point.name })
    : point.name;

  const localizedArea = point.districtKey
    ? t(`districts.${point.districtKey}.area`, { ns: 'actions', defaultValue: point.address || point.district })
    : point.address;

  const localizedDescription = point.districtKey
    ? t(`districts.${point.districtKey}.description`, { ns: 'actions', defaultValue: t('candidateStudyNotice', { ns: 'actions' }) })
    : (point.description || t('candidateStudyNotice', { ns: 'actions', defaultValue: 'ZAMINAT изучает возможность развития сети в этом районе.' }));

  return (
    <div className="p-3.5 min-w-[260px] max-w-[300px] text-gray-800 space-y-3 font-sans">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">
          {localizedName}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <p className="leading-snug">{localizedArea}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {isVerified && (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] px-2 py-0.5 font-bold">
            {t('verifiedOperating', { ns: 'actions', defaultValue: 'Подтверждён' })}
          </Badge>
        )}

        {isPlanned && (
          <>
            <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold">
              {t('plannedPoint', { ns: 'actions', defaultValue: 'Планируемая точка' })}
            </Badge>
            <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-200 text-[9px] px-1.5 py-0.5 font-semibold">
              {t('notOperationalYet', { ns: 'actions', defaultValue: 'Ещё не работает' })}
            </Badge>
          </>
        )}

        {isCandidate && (
          <>
            <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 font-bold">
              {t('candidateZone', { ns: 'actions', defaultValue: 'Рассматриваемая зона' })}
            </Badge>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-[9px] px-1.5 py-0.5 font-medium">
              {t('underReview', { ns: 'actions', defaultValue: 'Изучение возможностей' })}
            </Badge>
          </>
        )}

        {/* Material Tags */}
        {point.materialKeys && point.materialKeys.length > 0 && (
          point.materialKeys.map(matKey => (
            <Badge key={matKey} variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200 text-[9px] px-1.5 py-0.5 font-medium">
              {t(`materials.${matKey}`, { ns: 'actions', defaultValue: matKey })}
            </Badge>
          ))
        )}
      </div>

      {/* Candidate Notice */}
      {isCandidate && (
        <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-100/80 text-xs space-y-1">
          <p className="font-semibold text-indigo-950 text-[11px] leading-snug">
            {localizedDescription}
          </p>
          <p className="text-[10px] text-indigo-800 leading-snug">
            {t('noCommitmentNotice', { ns: 'actions', defaultValue: 'Точное местоположение и открытие пока не подтверждены. Приём вторсырья в данной зоне пока не ведётся.' })}
          </p>
        </div>
      )}

      {/* Planned Notice */}
      {isPlanned && (
        <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-100/80 text-xs space-y-1">
          <p className="font-semibold text-amber-950 text-[11px] leading-snug">
            {t('plannedRolloutNotice', { ns: 'actions', defaultValue: 'Локация утверждена в плане развития сети ZAMINAT.' })}
          </p>
          <p className="text-[10px] text-amber-800 leading-snug">
            {t('notOperationalYet', { ns: 'actions', defaultValue: 'Пункт ещё не открыт для сдачи вторсырья.' })}
          </p>
        </div>
      )}

      {/* Verified Info */}
      {isVerified && point.hours && (
        <div className="flex items-center gap-2 text-xs text-gray-600 py-1 border-t border-gray-100">
          <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span>{point.hours}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-1">
        {isVerified ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onNavigate(point)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold shadow-sm"
            >
              <Navigation className="mr-1.5 h-3.5 w-3.5" />
              {t('navigate', { ns: 'translation', defaultValue: 'Маршрут' })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
                window.open(url, '_blank');
              }}
              className="h-8 w-8 p-0"
              title={t('openInGoogleMaps', { ns: 'translation', defaultValue: 'Open in Google Maps' })}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-semibold">
            <Info className="h-3 w-3 mr-1.5 text-slate-500" />
            {isPlanned
              ? t('dropoffUnavailable', { ns: 'actions', defaultValue: 'Приём ещё не начат (в планах)' })
              : t('zoneUnderReview', { ns: 'actions', defaultValue: 'Зона находится на рассмотрении' })}
          </div>
        )}
      </div>
    </div>
  );
};

// Action Location Popup Component
const ActionLocationPopup: React.FC<{
  point: MapPoint;
  isMobile: boolean;
  onNavigate: (point: MapPoint) => void;
}> = ({ point, isMobile, onNavigate }) => {
  const { t } = useTranslation(['actions', 'translation']);

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

  return (
    <div className="p-3.5 min-w-[260px] max-w-[300px] text-gray-800 space-y-3 font-sans">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 mb-1">
          <Badge className="bg-sky-600 text-white text-[10px] px-2 py-0.5 font-bold">
            {t('event', { ns: 'translation', defaultValue: 'Эко-акция' })}
          </Badge>
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-tight">
          {point.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <p className="leading-snug">{point.address}</p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-100 text-xs">
        <p className="text-gray-700 text-[11px] leading-snug">
          {getEventDescription()}
        </p>
      </div>

      <div className="pt-1">
        <Button
          size="sm"
          onClick={() => onNavigate(point)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold shadow-sm"
        >
          <Navigation className="mr-1.5 h-3.5 w-3.5" />
          {t('navigate', { ns: 'translation', defaultValue: 'Маршрут' })}
        </Button>
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
  const { t } = useTranslation(['actions', 'translation']);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  const centerPosition: LatLngExpression = useMemo(() => [center.lat, center.lng], [center.lat, center.lng]);

  const handleMarkerClick = (point: MapPoint, e?: LeafletMouseEvent) => {
    if (e?.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent.preventDefault();
    }
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
    const markerRef = useRef<any>(null);
    const status = point.status || 'verified';
    const isSelected = selectedPoint?.id === point.id && !selectedPoint?.isActionLocation;

    const localizedName = point.districtKey
      ? t(`districts.${point.districtKey}.name`, { ns: 'actions', defaultValue: point.name })
      : point.name;

    const iconPath = getDistrictIcon(point.districtKey || point.id);

    const icon = createCollectionPointIcon(
      point.type as any,
      point.districtKey || point.name,
      isMobile,
      status,
      isSelected,
      iconPath
    );

    const accessibleTitle = `${localizedName}, ${
      status === 'candidate'
        ? t('candidateZone', { ns: 'actions', defaultValue: 'Рассматриваемая зона' })
        : status === 'planned'
        ? t('plannedPoint', { ns: 'actions', defaultValue: 'Планируемая точка' })
        : t('verifiedOperating', { ns: 'actions', defaultValue: 'Подтверждён' })
    }`;

    return (
      <Marker
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
        title={accessibleTitle}
        zIndexOffset={isSelected ? 1000 : 100}
        eventHandlers={{
          click: (e) => {
            handleMarkerClick(point, e);
          }
        }}
      >
        {!isMobile && (
          <>
            <Tooltip
              direction="top"
              offset={[0, isSelected ? -24 : -20]}
              opacity={0.95}
              className="zaminat-map-tooltip"
            >
              <span>{localizedName}</span>
            </Tooltip>
            <Popup
              closeButton={true}
              className="custom-popup"
              maxWidth={300}
              autoPan={true}
              autoPanPadding={[20, 20]}
            >
              <CustomPopup
                point={point}
                isMobile={false}
                onNavigate={handleNavigate}
              />
            </Popup>
          </>
        )}
      </Marker>
    );
  };

  // Action location marker component
  const ActionLocationMarker: React.FC<{ point: MapPoint }> = ({ point }) => {
    const markerRef = useRef<any>(null);
    const isSelected = selectedPoint?.id === point.id && selectedPoint?.isActionLocation;

    const icon = createActionLocationIcon(
      point.type as 'cleanup' | 'education' | 'recycling' | 'awareness',
      point.name,
      isMobile,
      isSelected
    );

    const accessibleTitle = `${point.name} (${t('event', { ns: 'translation', defaultValue: 'Эко-акция' })})`;

    return (
      <Marker
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
        title={accessibleTitle}
        zIndexOffset={isSelected ? 1000 : 200}
        eventHandlers={{
          click: (e) => {
            handleMarkerClick(point, e);
          }
        }}
      >
        {!isMobile && (
          <>
            <Tooltip
              direction="top"
              offset={[0, isSelected ? -24 : -20]}
              opacity={0.95}
              className="zaminat-map-tooltip"
            >
              <span>{point.name}</span>
            </Tooltip>
            <Popup
              closeButton={true}
              className="custom-popup"
              maxWidth={300}
              autoPan={true}
              autoPanPadding={[20, 20]}
            >
              <ActionLocationPopup
                point={point}
                isMobile={false}
                onNavigate={handleNavigate}
              />
            </Popup>
          </>
        )}
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
          minHeight: isMobile ? '380px' : '520px',
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
            style={{ height: '100%', width: '100%', zIndex: 1, minHeight: isMobile ? '380px' : '520px' }}
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
              <p className="text-xs text-gray-600">{t('loadingMap', { ns: 'translation', defaultValue: 'Загрузка карты...' })}</p>
            </div>
          </div>
        )}

        {/* Mobile Bottom Sheet Info Panel */}
        <AnimatePresence>
          {selectedPoint && isMobile && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="absolute bottom-2 left-2 right-2 z-[1000] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/90 max-h-[65vh] overflow-y-auto"
              style={{ touchAction: 'pan-y' }}
            >
              <div className="p-3.5 space-y-2.5">
                {/* Header with thumbnail & close button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center p-1 flex-shrink-0 shadow-sm border",
                      selectedPoint.status === 'candidate' ? "bg-indigo-50 border-indigo-200" :
                      selectedPoint.status === 'planned' ? "bg-amber-50 border-amber-200" :
                      selectedPoint.isActionLocation ? "bg-sky-50 border-sky-200" :
                      "bg-emerald-50 border-emerald-200"
                    )}>
                      <img
                        src={selectedPoint.isActionLocation
                          ? getActionLocationIconPath(selectedPoint.type as any, selectedPoint.name)
                          : getDistrictIcon(selectedPoint.districtKey || selectedPoint.id)}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
                        {selectedPoint.districtKey
                          ? t(`districts.${selectedPoint.districtKey}.title`, { ns: 'actions', defaultValue: selectedPoint.name })
                          : selectedPoint.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400" />
                        <span className="truncate">
                          {selectedPoint.districtKey
                            ? t(`districts.${selectedPoint.districtKey}.area`, { ns: 'actions', defaultValue: selectedPoint.address || selectedPoint.district })
                            : selectedPoint.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPoint(null)}
                    className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 flex-shrink-0 -mr-1 -mt-1"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>

                {/* Status & Material Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedPoint.isActionLocation ? (
                    <Badge className="bg-sky-600 text-white text-[10px] px-2 py-0.5 font-bold">
                      {t('event', { ns: 'translation', defaultValue: 'Эко-акция' })}
                    </Badge>
                  ) : selectedPoint.status === 'candidate' ? (
                    <>
                      <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 font-bold">
                        {t('candidateZone', { ns: 'actions', defaultValue: 'Рассматриваемая зона' })}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-[9px] px-1.5 py-0.5 font-medium">
                        {t('underReview', { ns: 'actions', defaultValue: 'Изучение возможностей' })}
                      </Badge>
                    </>
                  ) : selectedPoint.status === 'planned' ? (
                    <>
                      <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold">
                        {t('plannedPoint', { ns: 'actions', defaultValue: 'Планируемая точка' })}
                      </Badge>
                      <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-200 text-[9px] px-1.5 py-0.5 font-semibold">
                        {t('notOperationalYet', { ns: 'actions', defaultValue: 'Ещё не работает' })}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] px-2 py-0.5 font-semibold">
                      {t('verifiedOperating', { ns: 'actions', defaultValue: 'Подтверждён' })}
                    </Badge>
                  )}

                  {/* Material Tags */}
                  {selectedPoint.materialKeys && selectedPoint.materialKeys.length > 0 && (
                    selectedPoint.materialKeys.map(matKey => (
                      <Badge key={matKey} variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200 text-[9px] px-1.5 py-0.5 font-medium">
                        {t(`materials.${matKey}`, { ns: 'actions', defaultValue: matKey })}
                      </Badge>
                    ))
                  )}
                </div>

                {/* Description & Non-Operational Notices */}
                {selectedPoint.status === 'candidate' && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs space-y-1">
                    <p className="font-semibold text-indigo-950 text-[11px] leading-snug">
                      {selectedPoint.districtKey
                        ? t(`districts.${selectedPoint.districtKey}.description`, { ns: 'actions', defaultValue: t('candidateStudyNotice', { ns: 'actions' }) })
                        : (selectedPoint.description || t('candidateStudyNotice', { ns: 'actions' }))}
                    </p>
                    <p className="text-[10px] text-indigo-800 leading-snug">
                      {t('noCommitmentNotice', { ns: 'actions', defaultValue: 'Точное местоположение и открытие пока не подтверждены. Приём вторсырья в данной зоне пока не ведётся.' })}
                    </p>
                  </div>
                )}

                {selectedPoint.status === 'planned' && (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-xs space-y-1">
                    <p className="font-semibold text-amber-950 text-[11px] leading-snug">
                      {t('plannedRolloutNotice', { ns: 'actions', defaultValue: 'Локация утверждена в плане развития сети ZAMINAT.' })}
                    </p>
                    <p className="text-[10px] text-amber-800 leading-snug">
                      {t('notOperationalYet', { ns: 'actions', defaultValue: 'Пункт ещё не открыт для сдачи вторсырья.' })}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-0.5">
                  {selectedPoint.status === 'verified' || selectedPoint.isActionLocation ? (
                    <Button
                      size="sm"
                      onClick={() => handleNavigate(selectedPoint)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold shadow-sm"
                    >
                      <Navigation className="mr-1.5 h-3.5 w-3.5" />
                      {t('navigate', { ns: 'translation', defaultValue: 'Маршрут' })}
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      <Info className="h-3 w-3 mr-1.5 text-slate-500" />
                      {selectedPoint.status === 'planned'
                        ? t('dropoffUnavailable', { ns: 'actions', defaultValue: 'Приём ещё не начат (в планах)' })
                        : t('zoneUnderReview', { ns: 'actions', defaultValue: 'Зона находится на рассмотрении' })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom CSS for Leaflet popup, tooltips, and clean pins */}
      <style>{`
        .leaflet-container {
          background: #f8f9fa !important;
          font-family: inherit;
        }
        .leaflet-tile-container img {
          max-width: none !important;
          max-height: none !important;
        }
        .zaminat-map-marker-pin, .zaminat-action-marker-pin {
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
        }
        .zaminat-map-tooltip {
          background: rgba(15, 23, 42, 0.92) !important;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          padding: 4px 10px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
          white-space: nowrap !important;
        }
        .zaminat-map-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.92) !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          padding: 0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
          max-height: 480px;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          max-height: 460px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-popup .leaflet-popup-close-button {
          width: 22px;
          height: 22px;
          font-size: 16px;
          line-height: 22px;
          color: #64748b;
          top: 6px;
          right: 6px;
          z-index: 10;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          color: #0f172a;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
