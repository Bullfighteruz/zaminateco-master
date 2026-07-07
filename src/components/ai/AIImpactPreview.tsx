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
    <div className="bg-white/40 border border-slate-200/40 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
            {t('ai.tagPrototype', { defaultValue: 'AI Prototype Logic' })}
          </span>
          <h4 className="font-extrabold text-lg text-gray-900">
            AI Impact Engine
          </h4>
        </div>

        {/* Tabs switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${
              activeTab === 'live'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('liveImpact', { defaultValue: 'Live Community Stats' })}
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${
              activeTab === 'calc'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('calculator', { defaultValue: 'Impact Simulator' })}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'live' ? (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Total Waste Collected */}
              <div className="text-center bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-3 rounded-xl border border-emerald-500/15">
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block">Total Recycled Weight</span>
                <span className="text-2xl font-black text-emerald-800 tracking-tight tabular-nums">
                  {totalRecycledKg.toLocaleString()} kg
                </span>
              </div>

              {/* Live metrics list */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'EcoTiles Produced', value: liveImpact.tilesCreated, unit: 'pcs', icon: Recycle, color: 'text-emerald-600 bg-emerald-500/10' },
                  { label: 'Benches Funded', value: liveImpact.benchesCreated, unit: 'benches', icon: Construction, color: 'text-teal-600 bg-teal-500/10' },
                  { label: 'Total Carbon Saved', value: Number(liveImpact.co2SavedKg).toFixed(1), unit: 'kg CO₂', icon: TrendingUp, color: 'text-amber-600 bg-amber-500/10' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/60">
                      <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">{item.label}</span>
                        <span className="text-sm font-extrabold text-gray-900">
                          {item.value} <span className="text-[10px] font-medium text-gray-500">{item.unit}</span>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Simulator Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-bold text-gray-700">
                  <span>Your Waste:</span>
                  <span className="text-emerald-700 font-extrabold text-sm sm:text-base tabular-nums">
                    {wasteKg.toLocaleString()} kg
                  </span>
                </div>
                <Slider
                  min={50}
                  max={2000}
                  step={25}
                  value={[wasteKg]}
                  onValueChange={(val) => setWasteKg(val[0])}
                  className="text-emerald-500"
                />
                <div className="flex justify-between text-[8px] text-gray-400 font-medium">
                  <span>50 kg</span>
                  <span>2,000 kg</span>
                </div>
              </div>

              {/* Calculator output list */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {[
                  { label: 'EPDM-free Tiles', value: `${tilesCalculated}`, unit: 'pcs', icon: Recycle, color: 'text-emerald-600 bg-emerald-500/10' },
                  { label: 'Community Benches', value: benchesPlanted, unit: 'benches', icon: Construction, color: 'text-teal-600 bg-teal-500/10' },
                  { label: 'Carbon Saved', value: co2Saved, unit: 'kg CO₂', icon: TrendingUp, color: 'text-amber-600 bg-amber-500/10' },
                ].map((o, i) => {
                  const Icon = o.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/60">
                      <div className={`w-7 h-7 rounded-lg ${o.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">{o.label}</span>
                        <span className="text-sm font-extrabold text-gray-900">
                          {o.value} <span className="text-[10px] font-medium text-gray-500">{o.unit}</span>
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
