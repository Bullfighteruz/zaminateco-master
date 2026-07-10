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
  badgeKey: 'tagConcept' | 'tagPlanned' | 'tagUpcoming' | 'tagPrototype' | 'tagDesign' | 'tagLive';
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
          "h-full rounded-2xl px-4 py-3.5 transition-[background-color,border-color,shadow] duration-200 ease-out relative overflow-hidden flex items-start gap-3.5 border",
          isActive 
            ? "bg-emerald-500/[0.04] border-emerald-500/35 shadow-[0_8px_30px_rgba(16,185,129,0.04)]" 
            : "bg-white/60 border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]",
          "hover:bg-emerald-500/[0.02] hover:border-emerald-500/20 hover:shadow-[0_8px_30px_rgba(16,185,129,0.02)]"
        )}
      >
        {/* Active side indicator pill */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500 to-teal-500" />
        )}

        {/* Icon */}
        <div className={cn(
          "p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center transition-[background-color,color,box-shadow] duration-200 shadow-sm",
          isActive 
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20" 
            : "bg-zinc-50/80 text-zinc-500 border border-zinc-200/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 group-hover:border-emerald-500/10"
        )}>
          <Icon className="h-4.5 w-4.5 stroke-[2]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className={cn(
              "font-bold text-sm tracking-tight leading-tight transition-colors",
              isActive ? "text-emerald-950" : "text-gray-900 group-hover:text-emerald-800"
            )}>
              {title}
            </h4>
            <span className={cn(
              "text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none whitespace-nowrap border",
              isActive 
                ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/10" 
                : "bg-zinc-100 text-zinc-500 border-zinc-200/30"
            )}>
              {t(`ai.${badgeKey}`, { defaultValue: 'AI' })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {description}
          </p>
          
          {launchPath && (
            <div className="pt-2">
              <Link 
                to={launchPath}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                  isActive 
                    ? "text-emerald-600 translate-x-1" 
                    : "text-slate-400/80 hover:text-slate-500"
                )}
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
