import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Users, 
  ShieldAlert, 
  Settings2,
  CheckCircle2
} from 'lucide-react';

export default function AIEcosystemTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'citizen' | 'trust' | 'infrastructure'>('citizen');

  const tabs = [
    { id: 'citizen' as const, icon: Users, color: 'text-emerald-600', activeBg: 'bg-emerald-500/10 border-emerald-500/20' },
    { id: 'trust' as const, icon: ShieldAlert, color: 'text-amber-600', activeBg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'infrastructure' as const, icon: Settings2, color: 'text-teal-600', activeBg: 'bg-teal-500/10 border-teal-500/20' }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
  const itemsRaw = t(`ai.layers.${currentTab.id}.items`, { returnObjects: true });
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Tab Switcher Headers */}
      <div className="flex border border-slate-200/50 bg-white/50 backdrop-blur-md rounded-2xl p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300",
                isActive 
                  ? `${tab.activeBg} text-gray-900 shadow-sm border` 
                  : "text-gray-500 hover:text-gray-900 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", tab.color)} />
              <span>{t(`ai.layers.${tab.id}.title`)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="relative overflow-hidden bg-white/40 border border-slate-200/40 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block">
                {t(`ai.tagPlanned`)}
              </span>
              <h4 className="font-extrabold text-base sm:text-lg text-gray-900">
                {t(`ai.layers.${currentTab.id}.title`)}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {t(`ai.layers.${currentTab.id}.desc`)}
              </p>
            </div>

            <div className="h-px bg-slate-200/40 my-2" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {items.map((item: string, i: number) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 bg-white/60 border border-white/50 rounded-xl p-3.5 shadow-sm"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
