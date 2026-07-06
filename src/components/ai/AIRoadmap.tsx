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
    { id: 'phase1', icon: Sparkles, color: 'from-emerald-500 to-teal-500', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'phase2', icon: ShieldCheck, color: 'from-amber-500 to-yellow-500', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'phase3', icon: Workflow, color: 'from-teal-600 to-emerald-600', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' }
  ];

  return (
    <div className="bg-white/40 border border-slate-200/40 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 space-y-3 flex-1">
        
        {/* Header */}
        <div className="text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Staged Rollout</span>
          <h4 className="text-lg font-extrabold text-gray-900">
            {t('ai.roadmapTitle', { defaultValue: 'Implementation Roadmap' })}
          </h4>
        </div>

        {/* 3 Phase Cards — vertical stack */}
        <div className="space-y-2.5">
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
                className="bg-white/50 border border-slate-100 rounded-xl px-4 py-3 hover:border-emerald-200/50 transition-all duration-200"
              >
                {/* Phase header row */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${phase.color} text-white shadow-sm`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h5 className="font-bold text-sm text-gray-900 flex-1 min-w-0 truncate leading-tight">
                    {t(`ai.roadmap.${phase.id}.title`)}
                  </h5>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${phase.badgeColor} whitespace-nowrap`}>
                    {idx === 0 ? t('ai.tagPrototype') : idx === 1 ? t('ai.tagUpcoming') : t('ai.tagPlanned')}
                  </span>
                </div>

                {/* Items — horizontal wrap for space efficiency */}
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {items.map((item: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600 leading-snug">
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
