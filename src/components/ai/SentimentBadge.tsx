/**
 * ZAMINAT.eco — Sentiment Badge Component
 * 
 * Displays a colored sentiment indicator badge (positive/neutral/negative)
 * with emoji and tooltip showing confidence score.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { analyzeSentiment, type SentimentResult } from '@/lib/sentimentAnalysis';

interface SentimentBadgeProps {
  text: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function SentimentBadge({ text, className, showLabel = false, size = 'sm' }: SentimentBadgeProps) {
  const sentiment = analyzeSentiment(text);
  
  if (sentiment.confidence < 10) return null; // Too uncertain to display

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border font-bold transition-all",
        size === 'sm' ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1",
        className
      )}
      style={{
        backgroundColor: sentiment.color + '15',
        borderColor: sentiment.color + '30',
        color: sentiment.color,
      }}
      title={`Sentiment: ${sentiment.label} (${sentiment.confidence}% confidence)`}
    >
      <span>{sentiment.emoji}</span>
      {showLabel && (
        <span className="capitalize">{sentiment.label}</span>
      )}
    </span>
  );
}

/**
 * Aggregate sentiment indicator for a collection of texts.
 */
export function SentimentSummary({ texts, className }: { texts: string[]; className?: string }) {
  if (texts.length === 0) return null;

  const sentiments = texts.map(t => analyzeSentiment(t));
  const positiveCount = sentiments.filter(s => s.label === 'positive').length;
  const negativeCount = sentiments.filter(s => s.label === 'negative').length;
  const total = sentiments.length;
  
  const positivePercent = Math.round((positiveCount / total) * 100);
  const negativePercent = Math.round((negativeCount / total) * 100);
  const neutralPercent = 100 - positivePercent - negativePercent;

  const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / total;
  const overallEmoji = avgScore > 0.15 ? '😊' : avgScore < -0.15 ? '😞' : '😐';
  const overallColor = avgScore > 0.15 ? '#22c55e' : avgScore < -0.15 ? '#ef4444' : '#eab308';

  return (
    <div 
      className={cn("flex items-center gap-2 p-2.5 rounded-xl border backdrop-blur-md", className)}
      style={{
        backgroundColor: overallColor + '10',
        borderColor: overallColor + '25',
      }}
    >
      <span className="text-lg">{overallEmoji}</span>
      <div className="flex-1">
        <div className="text-[10px] font-bold text-white/80">Community Mood</div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden flex">
            <div className="h-full bg-emerald-400 rounded-l-full" style={{ width: `${positivePercent}%` }} />
            <div className="h-full bg-amber-400" style={{ width: `${neutralPercent}%` }} />
            <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${negativePercent}%` }} />
          </div>
          <span className="text-[9px] font-bold" style={{ color: overallColor }}>
            {positivePercent}% positive
          </span>
        </div>
      </div>
    </div>
  );
}
