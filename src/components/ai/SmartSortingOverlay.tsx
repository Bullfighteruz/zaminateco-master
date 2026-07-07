/**
 * ZAMINAT.eco — Smart Sorting Camera Overlay
 * 
 * Real-time AR-style overlay on camera feed showing waste category predictions,
 * colored sorting bin recommendations, and sorting instructions.
 * Uses TensorFlow.js classifier running at ~2 FPS for performance.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Zap, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  classifyWasteImage,
  loadClassifierModel,
  isModelReady,
  type ClassifierResult,
  type WasteClassification,
} from '@/lib/wasteClassifier';

interface SmartSortingOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onClose: () => void;
}

// Bin display configuration
const BIN_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  'Blue Bin':    { label: 'Plastik', emoji: '🔵', color: '#3b82f6' },
  'Silver Bin':  { label: 'Metall',  emoji: '⚪', color: '#94a3b8' },
  'Green Bin':   { label: 'Shisha',  emoji: '🟢', color: '#22c55e' },
  'Yellow Bin':  { label: 'Qog\'oz', emoji: '🟡', color: '#eab308' },
  'Black Bin':   { label: 'Rezina',  emoji: '⚫', color: '#78716c' },
  'Brown Bin':   { label: 'Organik', emoji: '🟤', color: '#a16207' },
  'Red Bin':     { label: 'E-chiqindi', emoji: '🔴', color: '#ef4444' },
  'Purple Bin':  { label: 'Mato',    emoji: '🟣', color: '#a855f7' },
  'Gray Bin':    { label: 'Aralash', emoji: '⬜', color: '#6b7280' },
  'Check with staff': { label: 'Tekshiring', emoji: '❓', color: '#9ca3af' },
};

export default function SmartSortingOverlay({
  videoRef,
  isActive,
  onClose,
}: SmartSortingOverlayProps) {
  const { i18n } = useTranslation();
  const [predictions, setPredictions] = useState<WasteClassification[]>([]);
  const [topPrediction, setTopPrediction] = useState<WasteClassification | null>(null);
  const [fps, setFps] = useState(0);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(isModelReady());
  const [showLabels, setShowLabels] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  
  const animFrameRef = useRef<number>(0);
  const lastClassifyTime = useRef<number>(0);
  const isClassifying = useRef<boolean>(false);
  const fpsCounter = useRef<number[]>([]);

  // Load model on activation
  useEffect(() => {
    if (isActive && !isModelReady()) {
      setModelLoading(true);
      loadClassifierModel().then((ready) => {
        setModelLoaded(ready);
        setModelLoading(false);
      });
    }
  }, [isActive]);

  // Real-time classification loop
  const classifyFrame = useCallback(async () => {
    if (!isActive || !videoRef.current || isClassifying.current || !isModelReady()) {
      return;
    }

    const now = performance.now();
    // Throttle to ~2 FPS (every 500ms)
    if (now - lastClassifyTime.current < 500) {
      return;
    }

    isClassifying.current = true;
    lastClassifyTime.current = now;

    try {
      const result = await classifyWasteImage(videoRef.current);
      
      if (result.modelReady) {
        setPredictions(result.predictions.slice(0, 4));
        setTopPrediction(result.topPrediction);
        setScanCount(prev => prev + 1);

        // Track FPS
        fpsCounter.current.push(now);
        fpsCounter.current = fpsCounter.current.filter(t => now - t < 1000);
        setFps(fpsCounter.current.length);
      }
    } catch (error) {
      // Silently continue
    } finally {
      isClassifying.current = false;
    }
  }, [isActive, videoRef]);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const loop = () => {
      classifyFrame();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, classifyFrame]);

  if (!isActive) return null;

  const binInfo = topPrediction 
    ? BIN_CONFIG[topPrediction.sortingBin] || BIN_CONFIG['Check with staff']
    : null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-950/90 to-transparent">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              modelLoaded ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            )} />
            <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
              Smart Sort
            </span>
            {modelLoaded && (
              <span className="text-[9px] font-bold text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {fps} FPS • {scanCount} scans
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              {showLabels ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Loading State */}
      {modelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
          <div className="text-center space-y-3">
            <motion.div
              className="w-14 h-14 mx-auto rounded-full border-2 border-violet-400 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <div>
              <p className="text-white font-bold text-sm">Loading ML Model...</p>
              <p className="text-slate-400 text-[10px] mt-1">MobileNet v2 • ~15MB • One-time download</p>
            </div>
          </div>
        </div>
      )}

      {/* Classification Labels Overlay */}
      <AnimatePresence>
        {showLabels && topPrediction && modelLoaded && (
          <>
            {/* Scanning pulse corners */}
            <div className="absolute inset-6 pointer-events-none">
              <motion.div 
                className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 rounded-tl-xl"
                style={{ borderColor: binInfo?.color || '#10b981' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 rounded-tr-xl"
                style={{ borderColor: binInfo?.color || '#10b981' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 rounded-bl-xl"
                style={{ borderColor: binInfo?.color || '#10b981' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 rounded-br-xl"
                style={{ borderColor: binInfo?.color || '#10b981' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />
            </div>

            {/* Center Classification Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              {topPrediction.confidence > 20 && (
                <div 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl backdrop-blur-xl border shadow-2xl"
                  style={{
                    backgroundColor: (binInfo?.color || '#10b981') + '20',
                    borderColor: (binInfo?.color || '#10b981') + '50',
                  }}
                >
                  <span className="text-2xl">{topPrediction.icon}</span>
                  <div>
                    <div className="text-white font-black text-sm">{topPrediction.category}</div>
                    <div className="text-[10px] font-bold" style={{ color: binInfo?.color }}>
                      {topPrediction.confidence}% • {topPrediction.sortingBin}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Bottom Sorting Bins Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 pointer-events-auto"
            >
              <div className="bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent px-4 pb-5 pt-12">
                {/* Sorting Bin Recommendation */}
                {binInfo && topPrediction.confidence > 15 && (
                  <motion.div 
                    key={topPrediction.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-3 p-3 rounded-xl border backdrop-blur-md"
                    style={{
                      backgroundColor: binInfo.color + '15',
                      borderColor: binInfo.color + '30',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{binInfo.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-bold text-xs">{topPrediction.sortingBin}</div>
                        <div className="text-slate-300 text-[10px] leading-relaxed mt-0.5">
                          {topPrediction.instructions}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold" style={{ color: binInfo.color }}>
                          +{topPrediction.ecoCoinsEstimate}
                        </div>
                        <div className="text-[8px] text-slate-400">pts/kg</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* All Predictions Bar */}
                <div className="flex gap-1.5">
                  {predictions.map((pred, i) => (
                    <motion.div
                      key={`${pred.category}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex-1 text-center p-2 rounded-xl border backdrop-blur-md"
                      style={{
                        backgroundColor: pred.binColor + '15',
                        borderColor: i === 0 ? pred.binColor + '60' : pred.binColor + '20',
                      }}
                    >
                      <div className="text-base">{pred.icon}</div>
                      <div className="text-[8px] font-bold text-white/80 mt-0.5 truncate">
                        {pred.category}
                      </div>
                      <div className="text-[9px] font-black mt-0.5" style={{ color: pred.binColor }}>
                        {pred.confidence}%
                      </div>
                      {/* Confidence bar */}
                      <div className="mt-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: pred.binColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.confidence}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
