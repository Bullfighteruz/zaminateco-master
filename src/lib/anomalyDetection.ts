/**
 * ZAMINAT.eco — Anomaly Detection Engine
 * 
 * Detects suspicious scan submissions to prevent fraud:
 * - Duplicate image detection (perceptual hashing)
 * - Statistical outlier detection (Z-score)
 * - Geo-velocity checking (distance/time between scans)
 * - Frequency rate limiting
 */

// ============================================
// Types
// ============================================

export interface AnomalyCheckResult {
  riskScore: number;       // 0–100 (flagged if > 70)
  isAnomaly: boolean;
  checks: AnomalyCheck[];
  overallStatus: 'clean' | 'suspicious' | 'blocked';
}

export interface AnomalyCheck {
  name: string;
  passed: boolean;
  score: number;   // 0–25 contribution to risk
  message: string;
}

interface ScanRecord {
  timestamp: number;
  imageHash: string;
  lat?: number;
  lng?: number;
  coins: number;
  weight: number;
}

// ============================================
// Constants
// ============================================

const SCAN_HISTORY_KEY = 'zaminat_scan_history';
const MAX_HISTORY_SIZE = 50;
const DUPLICATE_THRESHOLD = 0.85; // 85% hash similarity
const GEO_VELOCITY_MAX_KMH = 120; // Max realistic speed
const MIN_SCAN_INTERVAL_MS = 30_000; // 30 seconds between scans
const WEIGHT_ZSCORE_THRESHOLD = 2.5; // Standard deviations

// ============================================
// Perceptual Image Hash (Average Hash)
// ============================================

/**
 * Compute a simple perceptual hash of an image.
 * Resizes to 8x8, converts to grayscale, compares to mean.
 * Returns a 64-bit hash as a hex string.
 */
export function computeImageHash(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }
      
      ctx.drawImage(img, 0, 0, 8, 8);
      const pixels = ctx.getImageData(0, 0, 8, 8).data;
      
      // Convert to grayscale values
      const grays: number[] = [];
      for (let i = 0; i < pixels.length; i += 4) {
        grays.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
      }
      
      // Compute mean
      const mean = grays.reduce((a, b) => a + b, 0) / grays.length;
      
      // Build hash: each bit is 1 if pixel > mean
      let hash = '';
      for (const g of grays) {
        hash += g >= mean ? '1' : '0';
      }
      
      // Convert binary to hex
      let hex = '';
      for (let i = 0; i < hash.length; i += 4) {
        hex += parseInt(hash.substring(i, i + 4), 2).toString(16);
      }
      
      resolve(hex);
    };
    img.onerror = () => resolve('');
    img.src = imageDataUrl;
  });
}

/**
 * Compare two hashes and return similarity (0 to 1).
 */
function hashSimilarity(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;
  
  let matching = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matching++;
  }
  return matching / hash1.length;
}

// ============================================
// Scan History (localStorage)
// ============================================

function loadScanHistory(): ScanRecord[] {
  try {
    const stored = localStorage.getItem(SCAN_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveScanHistory(records: ScanRecord[]): void {
  try {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(records.slice(-MAX_HISTORY_SIZE)));
  } catch { /* ignore */ }
}

export function addScanRecord(record: Omit<ScanRecord, 'timestamp'>): void {
  const history = loadScanHistory();
  history.push({ ...record, timestamp: Date.now() });
  saveScanHistory(history);
}

// ============================================
// Anomaly Checks
// ============================================

/**
 * Check 1: Duplicate Image Detection
 */
function checkDuplicateImage(imageHash: string, history: ScanRecord[]): AnomalyCheck {
  if (!imageHash || history.length === 0) {
    return { name: 'Duplicate Check', passed: true, score: 0, message: 'No duplicates found' };
  }

  for (const record of history) {
    const similarity = hashSimilarity(imageHash, record.imageHash);
    if (similarity >= DUPLICATE_THRESHOLD) {
      const minutesAgo = Math.round((Date.now() - record.timestamp) / 60000);
      return {
        name: 'Duplicate Check',
        passed: false,
        score: 25,
        message: `Similar image detected (${Math.round(similarity * 100)}% match, ${minutesAgo}min ago)`,
      };
    }
  }

  return { name: 'Duplicate Check', passed: true, score: 0, message: 'Image is unique' };
}

/**
 * Check 2: Frequency Rate Limiting
 */
function checkFrequency(history: ScanRecord[]): AnomalyCheck {
  if (history.length === 0) {
    return { name: 'Frequency Check', passed: true, score: 0, message: 'First scan' };
  }

  const lastScan = history[history.length - 1];
  const timeSinceLastMs = Date.now() - lastScan.timestamp;
  
  if (timeSinceLastMs < MIN_SCAN_INTERVAL_MS) {
    const waitSeconds = Math.ceil((MIN_SCAN_INTERVAL_MS - timeSinceLastMs) / 1000);
    return {
      name: 'Frequency Check',
      passed: false,
      score: 20,
      message: `Too fast! Wait ${waitSeconds}s before next scan`,
    };
  }

  // Check scans in last hour
  const lastHour = history.filter(r => Date.now() - r.timestamp < 3_600_000);
  if (lastHour.length >= 15) {
    return {
      name: 'Frequency Check',
      passed: false,
      score: 15,
      message: `${lastHour.length} scans in last hour (limit: 15)`,
    };
  }

  return { name: 'Frequency Check', passed: true, score: 0, message: 'Normal scan rate' };
}

/**
 * Check 3: Geo-Velocity (can't teleport)
 */
function checkGeoVelocity(lat?: number, lng?: number, history?: ScanRecord[]): AnomalyCheck {
  if (!lat || !lng || !history || history.length === 0) {
    return { name: 'Geo-Velocity Check', passed: true, score: 0, message: 'No location data' };
  }

  const lastWithGeo = [...history].reverse().find(r => r.lat && r.lng);
  if (!lastWithGeo || !lastWithGeo.lat || !lastWithGeo.lng) {
    return { name: 'Geo-Velocity Check', passed: true, score: 0, message: 'No prior location' };
  }

  // Haversine distance
  const R = 6371;
  const dLat = (lat - lastWithGeo.lat) * Math.PI / 180;
  const dLon = (lng - lastWithGeo.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lastWithGeo.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  const timeHours = (Date.now() - lastWithGeo.timestamp) / 3_600_000;
  if (timeHours <= 0) {
    return { name: 'Geo-Velocity Check', passed: true, score: 0, message: 'Same time' };
  }

  const velocityKmh = distanceKm / timeHours;

  if (velocityKmh > GEO_VELOCITY_MAX_KMH) {
    return {
      name: 'Geo-Velocity Check',
      passed: false,
      score: 20,
      message: `Impossible travel speed: ${Math.round(velocityKmh)} km/h over ${distanceKm.toFixed(1)} km`,
    };
  }

  return { name: 'Geo-Velocity Check', passed: true, score: 0, message: `Speed: ${Math.round(velocityKmh)} km/h (normal)` };
}

/**
 * Check 4: Weight/Coin Outlier Detection (Z-score)
 */
function checkOutliers(coins: number, weight: number, history: ScanRecord[]): AnomalyCheck {
  if (history.length < 5) {
    return { name: 'Outlier Check', passed: true, score: 0, message: 'Not enough data for analysis' };
  }

  // Calculate Z-scores for coins
  const coinValues = history.map(r => r.coins);
  const mean = coinValues.reduce((a, b) => a + b, 0) / coinValues.length;
  const stdDev = Math.sqrt(coinValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) / coinValues.length);
  
  if (stdDev === 0) {
    return { name: 'Outlier Check', passed: true, score: 0, message: 'Consistent values' };
  }

  const zScore = Math.abs((coins - mean) / stdDev);
  
  if (zScore > WEIGHT_ZSCORE_THRESHOLD) {
    return {
      name: 'Outlier Check',
      passed: false,
      score: 15,
      message: `Unusual value: ${coins} coins (Z-score: ${zScore.toFixed(1)}, avg: ${Math.round(mean)})`,
    };
  }

  return { name: 'Outlier Check', passed: true, score: 0, message: `Normal range (Z: ${zScore.toFixed(1)})` };
}

// ============================================
// Public API
// ============================================

/**
 * Run all anomaly checks on a scan submission.
 */
export async function checkForAnomalies(params: {
  imageDataUrl?: string;
  coins: number;
  weight: number;
  lat?: number;
  lng?: number;
}): Promise<AnomalyCheckResult> {
  const history = loadScanHistory();
  
  // Compute image hash
  const imageHash = params.imageDataUrl 
    ? await computeImageHash(params.imageDataUrl) 
    : '';

  // Run all checks
  const checks: AnomalyCheck[] = [
    checkDuplicateImage(imageHash, history),
    checkFrequency(history),
    checkGeoVelocity(params.lat, params.lng, history),
    checkOutliers(params.coins, params.weight, history),
  ];

  const riskScore = checks.reduce((sum, check) => sum + check.score, 0);
  const isAnomaly = riskScore > 30;
  
  const overallStatus: 'clean' | 'suspicious' | 'blocked' =
    riskScore >= 50 ? 'blocked' : riskScore >= 30 ? 'suspicious' : 'clean';

  // Record this scan for future comparison
  addScanRecord({
    imageHash,
    coins: params.coins,
    weight: params.weight,
    lat: params.lat,
    lng: params.lng,
  });

  return {
    riskScore: Math.min(riskScore, 100),
    isAnomaly,
    checks,
    overallStatus,
  };
}

/**
 * Get scan history stats for UI display.
 */
export function getScanStats() {
  const history = loadScanHistory();
  const last24h = history.filter(r => Date.now() - r.timestamp < 86_400_000);
  const lastHour = history.filter(r => Date.now() - r.timestamp < 3_600_000);
  
  return {
    totalScans: history.length,
    scansLast24h: last24h.length,
    scansLastHour: lastHour.length,
    averageCoins: history.length > 0
      ? Math.round(history.reduce((sum, r) => sum + r.coins, 0) / history.length)
      : 0,
  };
}
