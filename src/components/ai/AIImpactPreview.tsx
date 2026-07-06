import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { 
  Recycle, 
  TrendingUp, 
  Construction
} from 'lucide-react';

export default function AIImpactPreview() {
  const { t } = useTranslation();
  const [wasteKg, setWasteKg] = useState<number>(350);

  const tilesCalculated = Math.round(wasteKg * 0.31);
  const co2Saved = (wasteKg * 1.84).toFixed(1);
  const benchesPlanted = (wasteKg / 160).toFixed(1);

  return (
    <div className="bg-white/40 border border-slate-200/40 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        
        {/* Header */}
        <div className="text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
            {t('ai.tagConcept', { defaultValue: 'AI-Powered Concept' })}
          </span>
          <h4 className="font-extrabold text-lg text-gray-900">
            AI Impact Engine
          </h4>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs font-bold text-gray-700">
            <span>Waste Collected:</span>
            <span className="text-emerald-700 font-extrabold text-base tabular-nums">
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
          <div className="flex justify-between text-[9px] text-gray-400 font-medium">
            <span>50 kg</span>
            <span>2,000 kg</span>
          </div>
        </div>

        {/* Outputs — vertical stack in narrow column */}
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
                  <motion.span 
                    key={o.value}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-base font-extrabold text-gray-900 tabular-nums"
                  >
                    {o.value} <span className="text-[11px] font-medium text-gray-500">{o.unit}</span>
                  </motion.span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
