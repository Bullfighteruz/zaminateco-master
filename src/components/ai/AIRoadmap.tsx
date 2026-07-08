import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ShieldCheck, 
  Workflow
} from 'lucide-react';

export default function AIRoadmap() {
  const { t } = useTranslation();

  const phases = [
    { id: 'phase1', icon: Sparkles, color: 'from-emerald-500 to-teal-500', badgeColor: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' },
    { id: 'phase2', icon: ShieldCheck, color: 'from-amber-500 to-yellow-500', badgeColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20' },
    { id: 'phase3', icon: Workflow, color: 'from-teal-600 to-emerald-600', badgeColor: 'bg-teal-500/10 text-teal-800 border-teal-500/20' }
  ];

  return (
    <div className="bg-white/80 border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.02)] h-full flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-emerald-500/20">
      <div className="p-5 space-y-4 flex-1">
        
        {/* Header */}
        <div className="text-center space-y-0.5">
          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-md">
            Staged Rollout
          </span>
          <h4 className="text-base font-black text-gray-900 tracking-tight pt-1">
            {t('ai.roadmapTitle', { defaultValue: 'Implementation Roadmap' })}
          </h4>
        </div>

        {/* 3 Phase Cards — vertical stack */}
        <div className="space-y-3">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            const itemsRaw = t(`ai.roadmap.${phase.id}.items`, { returnObjects: true });
            const items = Array.isArray(itemsRaw) ? itemsRaw : [];

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="bg-white/80 border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] rounded-2xl px-4 py-3.5 hover:border-emerald-500/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-[border-color,box-shadow] duration-200 ease-out"
              >
                {/* Phase header row */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${phase.color} text-white shadow-sm`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h5 className="font-bold text-xs text-gray-900 flex-1 min-w-0 truncate leading-tight">
                    {t(`ai.roadmap.${phase.id}.title`)}
                  </h5>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border ${phase.badgeColor} uppercase tracking-wider whitespace-nowrap`}>
                    {idx === 0 ? t('ai.tagPrototype') : idx === 1 ? t('ai.tagUpcoming') : t('ai.tagPlanned')}
                  </span>
                </div>

                {/* Items — horizontal wrap for space efficiency as modern tag badges */}
                <div className="flex flex-wrap gap-2">
                  {items.map((item: string, i: number) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 border border-slate-200/40 rounded-lg px-2.5 py-1 font-semibold leading-none shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
