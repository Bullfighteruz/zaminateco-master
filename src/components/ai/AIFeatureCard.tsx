import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeKey: 'tagConcept' | 'tagPlanned' | 'tagUpcoming' | 'tagPrototype' | 'tagDesign';
  index: number;
  isActive?: boolean;
  launchPath?: string;
}

export default function AIFeatureCard({ title, description, icon: Icon, badgeKey, index, isActive, launchPath }: AIFeatureCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group relative w-full select-none h-full"
    >
      <div 
        className={cn(
          "h-full rounded-xl px-3.5 py-3 transition-all duration-200 relative overflow-hidden flex items-start gap-3 border",
          isActive 
            ? "bg-emerald-50/80 border-emerald-300 shadow-sm" 
            : "bg-white/40 border-gray-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          "hover:bg-emerald-50/50 hover:border-emerald-200/60"
        )}
      >
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-200",
          isActive 
            ? "bg-emerald-600 text-white" 
            : "bg-slate-50 text-emerald-600 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700"
        )}>
          <Icon className="h-4 w-4 stroke-[2.25]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className={cn(
              "font-bold text-sm tracking-tight leading-tight transition-colors",
              isActive ? "text-emerald-900" : "text-gray-900 group-hover:text-emerald-800"
            )}>
              {title}
            </h4>
            <span className={cn(
              "text-[9px] font-semibold px-1.5 py-px rounded uppercase tracking-wider leading-none whitespace-nowrap",
              isActive 
                ? "bg-emerald-200/60 text-emerald-800" 
                : "bg-slate-100 text-slate-500"
            )}>
              {t(`ai.${badgeKey}`, { defaultValue: 'AI' })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            {description}
          </p>
          
          {launchPath && isActive && (
            <div className="pt-1.5">
              <Link 
                to={launchPath}
                className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider"
                onClick={(e) => e.stopPropagation()}
              >
                {t('tryLiveDemo', { defaultValue: 'Try Live Demo' })} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
