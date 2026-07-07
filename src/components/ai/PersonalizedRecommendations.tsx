/**
 * ZAMINAT.eco — Personalized Recommendations Component
 * 
 * Displays a carousel of AI-recommended eco-challenges, products,
 * events, and collection points based on user activity.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, Trophy, Gift, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRecommendations, type Recommendation, type RecommendationType } from '@/lib/recommendationEngine';
import { Link } from 'react-router-dom';

const TYPE_CONFIG: Record<RecommendationType, { label: string; icon: React.ElementType; gradient: string }> = {
  challenge: { label: 'Challenge', icon: Trophy, gradient: 'from-amber-500/20 to-orange-500/20' },
  product: { label: 'Product', icon: Gift, gradient: 'from-blue-500/20 to-indigo-500/20' },
  event: { label: 'Event', icon: Calendar, gradient: 'from-violet-500/20 to-purple-500/20' },
  ecopoint: { label: 'EcoPoint', icon: MapPin, gradient: 'from-emerald-500/20 to-teal-500/20' },
};

interface PersonalizedRecommendationsProps {
  maxItems?: number;
  compact?: boolean;
}

export default function PersonalizedRecommendations({ maxItems = 6, compact = false }: PersonalizedRecommendationsProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const recommendations = useMemo(() => getRecommendations(maxItems), [maxItems]);

  const getTitle = (rec: Recommendation) => lang === 'uz' ? rec.titleUz : lang === 'ru' ? rec.titleRu : rec.title;
  const getDesc = (rec: Recommendation) => lang === 'uz' ? rec.descriptionUz : lang === 'ru' ? rec.descriptionRu : rec.description;
  const getReason = (rec: Recommendation) => lang === 'uz' ? rec.reasonUz : lang === 'ru' ? rec.reasonRu : rec.reason;

  if (recommendations.length === 0) return null;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">
              {lang === 'uz' ? 'Siz uchun tavsiyalar' : lang === 'ru' ? 'Рекомендации для вас' : 'Recommended for You'}
            </h3>
            <p className="text-slate-400 text-[10px]">
              {lang === 'uz' ? 'AI asosida tanlangan' : lang === 'ru' ? 'Подобрано с помощью ИИ' : 'AI-powered personalization'}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={cn(
        "grid gap-3",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {recommendations.map((rec, i) => {
          const config = TYPE_CONFIG[rec.type];
          const TypeIcon = config.icon;

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "group relative p-4 rounded-2xl border backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                "bg-slate-900/60 border-white/5 hover:border-white/15"
              )}
            >
              {/* Background gradient */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity", config.gradient)} />
              
              <div className="relative z-10">
                {/* Top row: type badge + relevance */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: rec.color + '15',
                      borderColor: rec.color + '30',
                      color: rec.color,
                    }}
                  >
                    <TypeIcon className="h-2.5 w-2.5" />
                    {config.label}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">
                    {rec.relevanceScore}% match
                  </span>
                </div>

                {/* Title + Icon */}
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs leading-tight">{getTitle(rec)}</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed mt-1 line-clamp-2">
                      {getDesc(rec)}
                    </p>
                  </div>
                </div>

                {/* Why recommended */}
                <div className="text-[9px] text-slate-500 italic mb-3 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-violet-400" />
                  {getReason(rec)}
                </div>

                {/* Footer: reward + action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rec.reward && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        +{rec.reward} coins
                      </span>
                    )}
                    {rec.difficulty && (
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                        rec.difficulty === 'easy' ? "text-emerald-400 bg-emerald-500/10" :
                        rec.difficulty === 'medium' ? "text-amber-400 bg-amber-500/10" :
                        "text-red-400 bg-red-500/10"
                      )}>
                        {rec.difficulty}
                      </span>
                    )}
                  </div>
                  
                  {rec.actionUrl ? (
                    <Link
                      to={rec.actionUrl}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-white/70 hover:text-white transition-colors"
                    >
                      {rec.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button className="inline-flex items-center gap-1 text-[10px] font-bold text-white/70 hover:text-white transition-colors">
                      {rec.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
