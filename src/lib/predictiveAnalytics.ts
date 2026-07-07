/**
 * ZAMINAT.eco — Predictive Analytics Engine
 * 
 * Pure TypeScript statistical ML for waste collection forecasting.
 * - Linear regression for trend prediction
 * - Moving averages for smoothing
 * - Seasonal decomposition
 * - CO₂ savings projections
 */

// ============================================
// Types
// ============================================

export interface DataPoint {
  date: string;     // ISO date string
  value: number;
}

export interface PredictionResult {
  historical: DataPoint[];
  predicted: DataPoint[];
  upperBound: DataPoint[];
  lowerBound: DataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercent: number;
  r2: number; // Model fitness (0-1)
}

export interface DistrictData {
  name: string;
  nameUz: string;
  nameRu: string;
  totalKg: number;
  plastic: number;
  rubber: number;
  paper: number;
  glass: number;
  organic: number;
  growth: number; // percent
}

export interface WasteBreakdown {
  category: string;
  kg: number;
  percent: number;
  color: string;
  trend: number; // percent change
}

export interface CO2Projection {
  date: string;
  saved: number;      // kg CO2 saved
  cumulative: number;  // cumulative total
}

// ============================================
// Linear Regression
// ============================================

interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  predict: (x: number) => number;
}

function linearRegression(xs: number[], ys: number[]): RegressionResult {
  const n = xs.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0, predict: () => 0 };

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denom = sumX2 - (sumX * sumX) / n;
  const slope = denom === 0 ? 0 : (sumXY - (sumX * sumY) / n) / denom;
  const intercept = meanY - slope * meanX;

  // Calculate R²
  const ssRes = ys.reduce((acc, y, i) => acc + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return {
    slope,
    intercept,
    r2,
    predict: (x: number) => slope * x + intercept,
  };
}

// ============================================
// Moving Average
// ============================================

export function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(data.length, i + Math.ceil(window / 2));
    const slice = data.slice(start, end);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

// ============================================
// Mock Data Generators (simulates real collection data)
// ============================================

function generateHistoricalData(months: number = 12): DataPoint[] {
  const data: DataPoint[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Seasonal pattern: higher in summer, lower in winter
    const monthOfYear = date.getMonth();
    const seasonalFactor = 1 + 0.3 * Math.sin(((monthOfYear - 3) / 12) * 2 * Math.PI);
    
    // Growth trend: 5% monthly growth
    const trendFactor = 1 + (months - i) * 0.05;
    
    // Base collection: 500-800 kg/month
    const base = 500 + Math.random() * 300;
    const value = Math.round(base * seasonalFactor * trendFactor);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value,
    });
  }
  
  return data;
}

// ============================================
// Public API
// ============================================

/**
 * Generate waste collection forecast with confidence intervals.
 */
export function getCollectionForecast(
  historicalMonths: number = 12,
  forecastMonths: number = 6
): PredictionResult {
  const historical = generateHistoricalData(historicalMonths);
  
  // Prepare regression data
  const xs = historical.map((_, i) => i);
  const ys = historical.map(d => d.value);
  
  const regression = linearRegression(xs, ys);
  
  // Calculate standard error for confidence intervals
  const residuals = ys.map((y, i) => y - regression.predict(i));
  const stdError = Math.sqrt(
    residuals.reduce((acc, r) => acc + r * r, 0) / (ys.length - 2)
  );
  
  // Generate predictions
  const predicted: DataPoint[] = [];
  const upperBound: DataPoint[] = [];
  const lowerBound: DataPoint[] = [];
  
  const lastDate = new Date(historical[historical.length - 1].date);
  
  for (let i = 1; i <= forecastMonths; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setMonth(futureDate.getMonth() + i);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    const x = historical.length - 1 + i;
    const yPred = Math.max(0, Math.round(regression.predict(x)));
    const margin = Math.round(stdError * 1.96 * Math.sqrt(1 + 1 / ys.length + ((x - xs.reduce((a, b) => a + b, 0) / xs.length) ** 2) / xs.reduce((a, b, j) => a + (b - xs.reduce((c, d) => c + d, 0) / xs.length) ** 2, 0)));
    
    predicted.push({ date: dateStr, value: yPred });
    upperBound.push({ date: dateStr, value: yPred + margin });
    lowerBound.push({ date: dateStr, value: Math.max(0, yPred - margin) });
  }
  
  // Determine trend
  const trendPercent = ys.length >= 2
    ? ((ys[ys.length - 1] - ys[0]) / ys[0]) * 100
    : 0;
  
  const trend: 'increasing' | 'decreasing' | 'stable' = 
    trendPercent > 5 ? 'increasing' : trendPercent < -5 ? 'decreasing' : 'stable';
  
  return {
    historical,
    predicted,
    upperBound,
    lowerBound,
    trend,
    trendPercent: Math.round(trendPercent),
    r2: Math.round(regression.r2 * 100) / 100,
  };
}

/**
 * Get waste collection data by district.
 */
export function getDistrictData(): DistrictData[] {
  return [
    { name: 'Chilanzar', nameUz: 'Chilonzor', nameRu: 'Чиланзар', totalKg: 4250, plastic: 1800, rubber: 650, paper: 980, glass: 420, organic: 400, growth: 12 },
    { name: 'Yunusabad', nameUz: 'Yunusobod', nameRu: 'Юнусабад', totalKg: 3800, plastic: 1550, rubber: 500, paper: 900, glass: 380, organic: 470, growth: 8 },
    { name: 'Mirzo Ulugbek', nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо Улугбек', totalKg: 3200, plastic: 1300, rubber: 420, paper: 800, glass: 350, organic: 330, growth: 15 },
    { name: 'Sergeli', nameUz: 'Sergeli', nameRu: 'Сергели', totalKg: 2900, plastic: 1200, rubber: 380, paper: 720, glass: 300, organic: 300, growth: 22 },
    { name: 'Yakkasaray', nameUz: 'Yakkasaroy', nameRu: 'Яккасарай', totalKg: 2600, plastic: 1100, rubber: 340, paper: 650, glass: 260, organic: 250, growth: 6 },
    { name: 'Shaykhantahur', nameUz: 'Shayhontohur', nameRu: 'Шайхантахур', totalKg: 2100, plastic: 900, rubber: 280, paper: 520, glass: 210, organic: 190, growth: 18 },
    { name: 'Almazar', nameUz: 'Olmazor', nameRu: 'Алмазар', totalKg: 1800, plastic: 750, rubber: 240, paper: 450, glass: 180, organic: 180, growth: 10 },
    { name: 'Bektemir', nameUz: 'Bektemir', nameRu: 'Бектемир', totalKg: 1500, plastic: 620, rubber: 200, paper: 380, glass: 150, organic: 150, growth: 25 },
  ];
}

/**
 * Get waste type breakdown with trends.
 */
export function getWasteBreakdown(): WasteBreakdown[] {
  return [
    { category: 'Plastic / PET', kg: 9220, percent: 38.2, color: '#3b82f6', trend: 12 },
    { category: 'Paper / Cardboard', kg: 5400, percent: 22.4, color: '#eab308', trend: 8 },
    { category: 'Rubber / Tires', kg: 3010, percent: 12.5, color: '#78716c', trend: 15 },
    { category: 'Glass', kg: 2250, percent: 9.3, color: '#22c55e', trend: -3 },
    { category: 'Organic', kg: 2270, percent: 9.4, color: '#a16207', trend: 20 },
    { category: 'E-waste', kg: 1200, percent: 5.0, color: '#ef4444', trend: 30 },
    { category: 'Textile', kg: 780, percent: 3.2, color: '#a855f7', trend: 5 },
  ];
}

/**
 * Get CO₂ savings projections.
 * Conversion: ~2.5 kg CO₂ saved per kg of recycled plastic
 */
export function getCO2Projections(months: number = 18): CO2Projection[] {
  const projections: CO2Projection[] = [];
  const now = new Date();
  let cumulative = 0;
  
  // CO₂ conversion factors (kg CO₂ per kg recycled)
  const CO2_FACTORS: Record<string, number> = {
    plastic: 2.5,
    paper: 1.1,
    rubber: 1.8,
    glass: 0.6,
    organic: 0.3,
  };
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate monthly waste with growth
    const growthFactor = 1 + (months - i) * 0.04;
    const monthlyPlastic = 300 * growthFactor * (0.8 + Math.random() * 0.4);
    const monthlyPaper = 180 * growthFactor * (0.8 + Math.random() * 0.4);
    const monthlyRubber = 100 * growthFactor * (0.8 + Math.random() * 0.4);
    const monthlyGlass = 80 * growthFactor * (0.8 + Math.random() * 0.4);
    const monthlyOrganic = 75 * growthFactor * (0.8 + Math.random() * 0.4);
    
    const saved = Math.round(
      monthlyPlastic * CO2_FACTORS.plastic +
      monthlyPaper * CO2_FACTORS.paper +
      monthlyRubber * CO2_FACTORS.rubber +
      monthlyGlass * CO2_FACTORS.glass +
      monthlyOrganic * CO2_FACTORS.organic
    );
    
    cumulative += saved;
    
    projections.push({
      date: date.toISOString().split('T')[0],
      saved,
      cumulative,
    });
  }
  
  return projections;
}

/**
 * Get summary statistics for dashboard header.
 */
export function getSummaryStats() {
  const districts = getDistrictData();
  const breakdown = getWasteBreakdown();
  const co2 = getCO2Projections();
  
  const totalCollected = districts.reduce((acc, d) => acc + d.totalKg, 0);
  const totalCO2Saved = co2[co2.length - 1]?.cumulative || 0;
  const avgGrowth = Math.round(districts.reduce((acc, d) => acc + d.growth, 0) / districts.length);
  const activeDistricts = districts.length;
  const topCategory = breakdown.sort((a, b) => b.kg - a.kg)[0];
  
  return {
    totalCollectedKg: totalCollected,
    totalCO2SavedKg: totalCO2Saved,
    avgGrowthPercent: avgGrowth,
    activeDistricts,
    topCategory: topCategory.category,
    topCategoryPercent: topCategory.percent,
    treesEquivalent: Math.round(totalCO2Saved / 22), // 1 tree absorbs ~22 kg CO2/year
  };
}
