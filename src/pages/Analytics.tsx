/**
 * ZAMINAT.eco — Predictive Analytics Dashboard
 * 
 * Full-page interactive dashboard with 4 chart panels:
 * 1. Waste Collection Forecast (line chart with prediction range)
 * 2. District Comparison (bar chart)
 * 3. Waste Type Breakdown (pie/donut chart)
 * 4. CO₂ Impact Projections (area chart)
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Leaf, ArrowLeft,
  Activity, TreeDeciduous, MapPin, Recycle, Zap, ChevronUp,
  ChevronDown, Minus
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  getCollectionForecast,
  getDistrictData,
  getWasteBreakdown,
  getCO2Projections,
  getSummaryStats,
} from '@/lib/predictiveAnalytics';

export default function Analytics() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'forecast' | 'districts' | 'breakdown' | 'co2'>('forecast');

  // Generate data
  const forecast = useMemo(() => getCollectionForecast(12, 6), []);
  const districts = useMemo(() => getDistrictData(), []);
  const breakdown = useMemo(() => getWasteBreakdown(), []);
  const co2Data = useMemo(() => getCO2Projections(18), []);
  const stats = useMemo(() => getSummaryStats(), []);

  // Prepare chart data
  const forecastChartData = useMemo(() => {
    const historical = forecast.historical.map(d => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short' }),
      actual: d.value,
      predicted: null as number | null,
      upper: null as number | null,
      lower: null as number | null,
    }));

    const predicted = forecast.predicted.map((d, i) => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short' }),
      actual: null as number | null,
      predicted: d.value,
      upper: forecast.upperBound[i].value,
      lower: forecast.lowerBound[i].value,
    }));

    // Bridge: last historical point connects to first prediction
    if (historical.length > 0 && predicted.length > 0) {
      predicted[0].actual = historical[historical.length - 1].actual;
    }

    return [...historical, ...predicted];
  }, [forecast]);

  const districtChartData = useMemo(() => {
    return districts
      .sort((a, b) => b.totalKg - a.totalKg)
      .map(d => ({
        name: d.name,
        plastic: d.plastic,
        rubber: d.rubber,
        paper: d.paper,
        glass: d.glass,
        organic: d.organic,
        total: d.totalKg,
        growth: d.growth,
      }));
  }, [districts]);

  const co2ChartData = useMemo(() => {
    return co2Data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      saved: d.saved,
      cumulative: d.cumulative,
    }));
  }, [co2Data]);

  const TrendIcon = forecast.trend === 'increasing' ? ChevronUp : forecast.trend === 'decreasing' ? ChevronDown : Minus;
  const trendColor = forecast.trend === 'increasing' ? 'text-emerald-400' : forecast.trend === 'decreasing' ? 'text-red-400' : 'text-slate-400';

  const tabs = [
    { key: 'forecast' as const, label: 'Forecast', icon: TrendingUp },
    { key: 'districts' as const, label: 'Districts', icon: BarChart3 },
    { key: 'breakdown' as const, label: 'Breakdown', icon: PieIcon },
    { key: 'co2' as const, label: 'CO₂ Impact', icon: Leaf },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 pb-24">
        {/* Ambient */}
        <div className="fixed top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 px-4 pt-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs font-semibold">Back</span>
              </Link>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-black text-white uppercase tracking-widest">Analytics</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase">ML</span>
              </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Collected', value: `${(stats.totalCollectedKg / 1000).toFixed(1)}t`, icon: Recycle, color: 'emerald' },
                { label: 'CO₂ Saved', value: `${(stats.totalCO2SavedKg / 1000).toFixed(1)}t`, icon: Leaf, color: 'teal' },
                { label: 'Avg Growth', value: `+${stats.avgGrowthPercent}%`, icon: TrendingUp, color: 'blue' },
                { label: 'Trees Equiv.', value: `${stats.treesEquivalent}`, icon: TreeDeciduous, color: 'green' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-4 rounded-2xl border backdrop-blur-md",
                    `bg-${stat.color}-500/5 border-${stat.color}-500/15`
                  )}
                >
                  <stat.icon className={cn("h-4 w-4 mb-2", `text-${stat.color}-400`)} />
                  <div className="text-white font-black text-lg">{stat.value}</div>
                  <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Panels */}
        <div className="relative z-10 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Forecast Chart */}
            {activeTab === 'forecast' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">Waste Collection Forecast</h3>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      12-month history + 6-month prediction • R² = {forecast.r2}
                    </p>
                  </div>
                  <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold", trendColor, "bg-current/10")}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    {forecast.trendPercent > 0 ? '+' : ''}{forecast.trendPercent}%
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={forecastChartData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="#8b5cf620" />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#0f172a" />
                    <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fill="url(#colorActual)" dot={{ fill: '#10b981', r: 3 }} />
                    <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#8b5cf6', r: 3 }} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Districts Chart */}
            {activeTab === 'districts' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl"
              >
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm">District Collection Comparison</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Waste collected by district and material type (kg)</p>
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={districtChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="plastic" stackId="a" fill="#3b82f6" name="Plastic" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="paper" stackId="a" fill="#eab308" name="Paper" />
                    <Bar dataKey="rubber" stackId="a" fill="#78716c" name="Rubber" />
                    <Bar dataKey="glass" stackId="a" fill="#22c55e" name="Glass" />
                    <Bar dataKey="organic" stackId="a" fill="#a16207" name="Organic" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* District Growth Cards */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {districts.slice(0, 4).map(d => (
                    <div key={d.name} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-slate-400 font-semibold">{d.name}</div>
                      <div className="text-white font-bold text-sm">{d.totalKg} kg</div>
                      <div className="text-emerald-400 text-[10px] font-bold">+{d.growth}% growth</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Waste Breakdown */}
            {activeTab === 'breakdown' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl"
              >
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm">Waste Type Breakdown</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Distribution by material type with trends</p>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <ResponsiveContainer width="100%" height={280} className="max-w-[280px]">
                    <PieChart>
                      <Pie
                        data={breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="kg"
                        nameKey="category"
                        stroke="none"
                      >
                        {breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                        formatter={(value: number) => [`${value} kg`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend list */}
                  <div className="flex-1 space-y-2 w-full">
                    {breakdown.map(item => (
                      <div key={item.category} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs font-semibold truncate">{item.category}</div>
                          <div className="text-slate-400 text-[10px]">{item.kg.toLocaleString()} kg</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs font-bold">{item.percent}%</div>
                          <div className={cn("text-[10px] font-bold", item.trend > 0 ? "text-emerald-400" : "text-red-400")}>
                            {item.trend > 0 ? '↑' : '↓'}{Math.abs(item.trend)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* CO₂ Impact */}
            {activeTab === 'co2' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">CO₂ Impact Projections</h3>
                    <p className="text-slate-400 text-[10px] mt-0.5">Monthly savings and cumulative environmental impact</p>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-lg">{(stats.totalCO2SavedKg / 1000).toFixed(1)}t</div>
                    <div className="text-[9px] text-slate-400 font-semibold">CO₂ SAVED</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={co2ChartData}>
                    <defs>
                      <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString()} kg`,
                        name === 'saved' ? 'Monthly Saved' : 'Cumulative'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area yAxisId="right" type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} fill="url(#colorCum)" name="Cumulative" />
                    <Area yAxisId="left" type="monotone" dataKey="saved" stroke="#14b8a6" strokeWidth={2} fill="url(#colorCO2)" name="Monthly" dot={{ fill: '#14b8a6', r: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Impact equivalence cards */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-center">
                    <TreeDeciduous className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-white font-black text-lg">{stats.treesEquivalent}</div>
                    <div className="text-[9px] text-slate-400 font-semibold">Trees Equiv.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/15 text-center">
                    <MapPin className="h-5 w-5 text-teal-400 mx-auto mb-1" />
                    <div className="text-white font-black text-lg">{stats.activeDistricts}</div>
                    <div className="text-[9px] text-slate-400 font-semibold">Districts</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/15 text-center">
                    <Recycle className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-white font-black text-lg">{(stats.totalCollectedKg / 1000).toFixed(1)}t</div>
                    <div className="text-[9px] text-slate-400 font-semibold">Recycled</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
