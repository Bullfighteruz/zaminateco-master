import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { 
  Recycle, 
  TrendingUp, 
  Construction
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface LiveImpact {
  plasticKg: number;
  rubberKg: number;
  paperKg: number;
  benchesCreated: number;
  tilesCreated: number;
  co2SavedKg: number;
}

export default function AIImpactPreview() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'calc'>('live');
  const [wasteKg, setWasteKg] = useState<number>(350);
  const [liveImpact, setLiveImpact] = useState<LiveImpact>({
    plasticKg: 1420.5,
    rubberKg: 950.0,
    paperKg: 680.0,
    benchesCreated: 18,
    tilesCreated: 235,
    co2SavedKg: 1850.4
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getGlobalImpact()
      .then((data) => {
        setLiveImpact(data);
      })
      .catch(() => {
        // Fallback to default mock values if offline
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const tilesCalculated = Math.round(wasteKg * 0.31);
  const co2Saved = (wasteKg * 1.84).toFixed(1);
  const benchesPlanted = (wasteKg / 160).toFixed(1);

  const totalRecycledKg = liveImpact.plasticKg + liveImpact.rubberKg + liveImpact.paperKg;

  return (
    <div className="bg-white/80 border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.02)] h-full flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-emerald-500/20">
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-md">
            {t('ai.tagPrototype', { defaultValue: 'AI Prototype Logic' })}
          </span>
          <h4 className="font-black text-base text-gray-900 tracking-tight pt-1">
            AI Impact Engine
          </h4>
        </div>

        {/* Tabs switcher - Vercel-style Clean Mini Tabs */}
        <div className="flex bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
              activeTab === 'live'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('liveImpact', { defaultValue: 'Live Community Stats' })}
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
              activeTab === 'calc'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t('calculator', { defaultValue: 'Impact Simulator' })}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'live' ? (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Total Waste Collected */}
              <div className="text-center bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-3.5 rounded-2xl border border-emerald-500/10 shadow-[0_2px_12px_rgba(16,185,129,0.01)]">
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block mb-0.5">Total Recycled Weight</span>
                <span className="text-2xl font-black text-emerald-950 tracking-tight tabular-nums">
                  {totalRecycledKg.toLocaleString()} <span className="text-base font-semibold text-emerald-800">kg</span>
                </span>
              </div>

              {/* Live metrics list */}
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { label: 'EcoTiles Produced', value: liveImpact.tilesCreated, unit: 'pcs', icon: Recycle, color: 'text-emerald-600 bg-emerald-500/10' },
                  { label: 'Benches Funded', value: liveImpact.benchesCreated, unit: 'benches', icon: Construction, color: 'text-teal-600 bg-teal-500/10' },
                  { label: 'Total Carbon Saved', value: Number(liveImpact.co2SavedKg).toFixed(1), unit: 'kg CO₂', icon: TrendingUp, color: 'text-amber-600 bg-amber-500/10' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/80 border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-emerald-500/10 transition-all duration-300">
                      <div className={`w-8.5 h-8.5 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-1">{item.label}</span>
                        <span className="text-sm font-black text-gray-900 leading-none">
                          {item.value} <span className="text-[9px] font-semibold text-gray-400 uppercase">{item.unit}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              {/* Simulator Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-bold text-gray-700">
                  <span>Your Waste:</span>
                  <span className="text-emerald-700 font-black text-sm sm:text-base tabular-nums">
                    {wasteKg.toLocaleString()} kg
                  </span>
                </div>
                <div className="px-1.5">
                  <Slider
                    min={50}
                    max={2000}
                    step={25}
                    value={[wasteKg]}
                    onValueChange={(val) => setWasteKg(val[0])}
                    className="text-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider px-0.5">
                  <span>50 kg</span>
                  <span>2,000 kg</span>
                </div>
              </div>

              {/* Calculator output list */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100/80">
                {[
                  { label: 'EPDM-free Tiles', value: `${tilesCalculated}`, unit: 'pcs', icon: Recycle, color: 'text-emerald-600 bg-emerald-500/10' },
                  { label: 'Community Benches', value: benchesPlanted, unit: 'benches', icon: Construction, color: 'text-teal-600 bg-teal-500/10' },
                  { label: 'Carbon Saved', value: co2Saved, unit: 'kg CO₂', icon: TrendingUp, color: 'text-amber-600 bg-amber-500/10' },
                ].map((o, i) => {
                  const Icon = o.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/80 border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-emerald-500/10 transition-all duration-300">
                      <div className={`w-8.5 h-8.5 rounded-xl ${o.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-1">{o.label}</span>
                        <span className="text-sm font-black text-gray-900 leading-none">
                          {o.value} <span className="text-[9px] font-semibold text-gray-400 uppercase">{o.unit}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
