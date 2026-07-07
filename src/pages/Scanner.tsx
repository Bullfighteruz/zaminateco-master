import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Camera, RotateCcw, Zap, Leaf, Coins, ShieldCheck,
  AlertTriangle, X, SwitchCamera, ImageIcon, ArrowLeft,
  CheckCircle2, MapPin, Wallet, Sparkles, Navigation as NavIcon,
  Vote, Calendar as CalendarIcon, Info, Weight, Barcode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { scanWasteImage, type WasteScanResult, type DetectedItem } from '@/lib/gemini';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

type ScanState = 'camera' | 'preview' | 'scanning' | 'result' | 'error';

const STATUS_COLORS = {
  Accepted: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Needs sorting': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'Needs cleaning': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Not accepted': { bg: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const WASTE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Plastic:  { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
  Metal:    { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/20' },
  Glass:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  Paper:    { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  Rubber:   { bg: 'bg-stone-500/10',   text: 'text-stone-400',   border: 'border-stone-500/20' },
  Organic:  { bg: 'bg-green-500/10',   text: 'text-green-400',   border: 'border-green-500/20' },
  'E-waste':{ bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  Textile:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
  Mixed:    { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20' },
  Unknown:  { bg: 'bg-gray-500/10',    text: 'text-gray-400',    border: 'border-gray-500/20' },
};

export default function Scanner() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<WasteScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [useNativeCamera, setUseNativeCamera] = useState(false);

  // Anti-fraud check simulation states
  const [selectedProject, setSelectedProject] = useState<string>('school45');
  const [isJoinedEvent, setIsJoinedEvent] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setUseNativeCamera(true);
        setState('camera');
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
      setState('camera');
      setError('');
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError' || err.name === 'NotReadableError' || err.name === 'TypeError') {
        setUseNativeCamera(true);
        setState('camera');
      } else {
        setError('CAMERA_ERROR');
        setState('error');
      }
    }
  }, [facingMode]);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    setState('preview');
  }, []);

  // Upload from gallery
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      setState('preview');
    };
    reader.readAsDataURL(file);
  }, []);

  // Analyze with Gemini
  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;
    setState('scanning');
    try {
      const scanResult = await scanWasteImage(capturedImage, i18n.language);
      setResult(scanResult);
      
      // If Supabase is configured, attempt to save the scan record
      if (isSupabaseConfigured() && supabase) {
        console.log('[EcoScan] Supabase is configured. Checking user session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[EcoScan] Active session found. Saving scan to database...');
          const { error: dbError } = await supabase
            .from('scans')
            .insert({
              user_id: session.user.id,
              detected_items: scanResult.items,
              total_weight_kg: scanResult.totalEstimatedWeightKg,
              estimated_coins: scanResult.estimatedEcoCoins,
              project_pledged: selectedProject,
              verification_status: 'Pending'
            });
            
          if (dbError) {
            console.error('[EcoScan] Database insert failed:', dbError.message);
          } else {
            console.log('[EcoScan] Scan successfully persisted to database.');
          }
        } else {
          console.log('[EcoScan] No active user session. Running in guest/demo mode.');
        }
      } else {
        console.log('[EcoScan] Supabase not configured. Running in local/demo mode.');
      }
      
      setState('result');
    } catch (err: any) {
      if (err.message === 'GEMINI_API_KEY_MISSING') {
        setError('API_KEY_MISSING');
      } else if (err.message === 'API_KEY_INVALID') {
        setError('API_KEY_INVALID');
      } else if (err.message === 'PARSE_ERROR') {
        setError('PARSE_ERROR');
      } else {
        setError('SCAN_ERROR');
      }
      setState('error');
    }
  }, [capturedImage, i18n.language, selectedProject]);

  // Reset to camera
  const resetScanner = useCallback(() => {
    setCapturedImage(null);
    setResult(null);
    setError('');
    setIsJoinedEvent(false);
    if (useNativeCamera) {
      setState('camera');
    } else {
      startCamera();
    }
  }, [startCamera, useNativeCamera]);

  // Flip camera
  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  return (
    <Layout hideBottomNav={true}>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col">
        
        {/* Floating Premium Header */}
        <div className="relative z-20 px-4 pt-4 pb-2">
          <div className="max-w-md mx-auto bg-slate-900/70 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-2xl">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-semibold">{t('scanner.back')}</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-white/95 uppercase tracking-widest">{t('scanner.title')}</span>
            </div>
            
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">AI</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center px-4 pb-8 max-w-md mx-auto w-full relative z-10">
          <canvas ref={canvasRef} className="hidden" />
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileUpload} 
          />

          <AnimatePresence mode="wait">
            {/* ─── CAMERA VIEW ─── */}
            {state === 'camera' && (
              <motion.div 
                key="camera" 
                initial={{ opacity: 0, scale: 0.96 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.96 }} 
                className="space-y-6 w-full"
              >
                {/* Native camera fallback mode (iOS / no HTTPS) */}
                {useNativeCamera ? (
                  <div className="rounded-[2.25rem] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 aspect-[3/4] shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col items-center justify-center p-8 gap-6 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
                    
                    <div className="relative">
                      <div className="p-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 relative z-10">
                        <Camera className="h-10 w-10 stroke-[1.75]" />
                      </div>
                    </div>

                    <div className="text-center space-y-2 relative z-10">
                      <h3 className="text-white font-extrabold text-xl tracking-tight">{t('scanner.title')}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto">
                        {t('scanner.hint')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-[240px] relative z-10 mt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-200"
                      >
                        <Camera className="h-5 w-5" /> {t('scanner.takePhoto')}
                      </button>
                      <button
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute('capture');
                            fileInputRef.current.click();
                            fileInputRef.current.setAttribute('capture', 'environment');
                          }
                        }}
                        className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all duration-200"
                      >
                        <ImageIcon className="h-4 w-4" /> {t('scanner.uploadPhoto')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Live camera viewfinder mode (HTTPS / desktop) */
                  <>
                    <div className="relative rounded-[2.25rem] overflow-hidden bg-black aspect-[3/4] shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-white/10">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning overlay */}
                      {cameraReady && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
                          <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl" />
                          <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl" />
                          <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />
                          <motion.div
                            className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                            animate={{ top: ['15%', '85%', '15%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </div>
                      )}
                      {!cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                          <div className="text-center space-y-2">
                            <Camera className="h-8 w-8 text-emerald-400 mx-auto animate-pulse" />
                            <p className="text-xs text-slate-400">{t('scanner.loading')}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Camera controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-white/10 bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-800/80 active:scale-95 transition-all"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      
                      <button
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="h-18 w-18 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-white/20 shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center"
                      >
                        <div className="h-8 w-8 rounded-full border-2 border-white/80" />
                      </button>

                      <Button
                        onClick={flipCamera}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-white/10 bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-800/80 active:scale-95 transition-all"
                      >
                        <SwitchCamera className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ─── PREVIEW ─── */}
            {state === 'preview' && capturedImage && (
              <motion.div 
                key="preview" 
                initial={{ opacity: 0, scale: 0.96 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.96 }} 
                className="space-y-6 w-full"
              >
                <div className="relative rounded-[2.25rem] overflow-hidden aspect-[3/4] shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-white/10">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={resetScanner} 
                    variant="outline" 
                    className="flex-1 h-13 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95 transition-all"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> {t('scanner.retake')}
                  </Button>
                  <Button 
                    onClick={analyzeImage} 
                    className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-[0_8px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
                  >
                    <Zap className="h-4 w-4 mr-2" /> {t('scanner.analyze')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── SCANNING ANIMATION ─── */}
            {state === 'scanning' && (
              <motion.div 
                key="scanning" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="w-full"
              >
                <div className="relative rounded-[2.25rem] overflow-hidden aspect-[3/4] shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-emerald-500/20">
                  <img src={capturedImage!} alt="Scanning" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
                    <div className="text-center space-y-4">
                      <div className="relative mx-auto w-16 h-16">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <Zap className="absolute inset-0 m-auto h-6 w-6 text-emerald-400 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-extrabold text-base tracking-tight">{t('scanner.analyzing')}</p>
                        <p className="text-slate-400 text-xs">{t('scanner.aiProcessing')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── RESULTS (SOLID ECOSYSTEM ENGINE) ─── */}
            {state === 'result' && result && (
              <motion.div 
                key="result" 
                initial={{ opacity: 0, y: 24 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 24 }} 
                className="space-y-6 w-full"
              >
                {/* Photo Header */}
                <div className="relative rounded-[2.25rem] overflow-hidden h-40 shadow-2xl border border-white/10">
                  <img src={capturedImage!} alt="Scanned waste" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">{t('scanner.scanSuccess')}</span>
                      <h4 className="text-white font-bold text-sm">{t('scanner.detectedCount', { count: result.items.length })}</h4>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 text-right">
                      <div className="text-xs font-black text-emerald-400">{result.confidence}%</div>
                      <div className="text-[7px] font-bold text-emerald-400/70 uppercase tracking-widest leading-none">{t('scanner.confidence')}</div>
                    </div>
                  </div>
                </div>

                {/* 1. DETECTED ITEMS LIST */}
                <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/5 shadow-xl space-y-3">
                  <h4 className="text-xs font-extrabold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-emerald-400" />
                    {t('scanner.detectedItems')}
                  </h4>
                  
                  <div className="space-y-2">
                    {result.items.map((item, idx) => {
                      const color = WASTE_COLORS[item.wasteType] || WASTE_COLORS.Unknown;
                      const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.Accepted;
                      return (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-white">{item.quantity} × {item.name}</span>
                              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", color.bg, color.text, color.border)}>
                                {t(`scanner.wasteTypes.${item.wasteType}`, { defaultValue: item.wasteType })}
                              </span>
                              <span className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded border", statusColor.bg)}>
                                {t(`scanner.status.${item.status.replace(' ', '')}`, { defaultValue: item.status })}
                              </span>
                            </div>
                            {item.instructions && (
                              <p className="text-[10px] text-slate-400 leading-normal flex items-start gap-1">
                                <span className="text-emerald-400/80">•</span> {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {result.items.length === 0 && (
                      <div className="text-center py-4 text-slate-500 text-xs">{t('scanner.noItemsFound')}</div>
                    )}
                  </div>
                </div>

                {/* 2. ECOSYSTEM ESTIMATES & WALLET */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Pending Eco Wallet Card */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Wallet className="h-4 w-4" />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider">{t('scanner.pendingWallet')}</span>
                    </div>
                    <div className="text-lg font-black text-amber-400">+{result.estimatedEcoCoins}</div>
                    <p className="text-[9px] text-amber-500/70 leading-snug">{t('scanner.walletAwaiting')}</p>
                  </div>

                  {/* Impact Engine Card */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Weight className="h-4 w-4" />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider">{t('scanner.materialWeight')}</span>
                    </div>
                    <div className="text-lg font-black text-emerald-400">{result.totalEstimatedWeightKg}</div>
                    <p className="text-[9px] text-emerald-500/70 leading-snug">
                      {t('scanner.productOutputPrefix')} <span className="font-bold text-emerald-300">{result.suggestedProduct}</span>
                    </p>
                  </div>
                </div>

                {/* Impact details */}
                {result.moatImpact && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 flex items-start gap-2">
                    <Leaf className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-emerald-300/80 leading-normal">{result.moatImpact}</p>
                  </div>
                )}

                {/* 3. ECOMAP INTEGRATION */}
                <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-4 border border-white/5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        {t('scanner.nearestPoint')}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-300">Yunusobod EcoPoint (1.4 km · 8 min walk)</p>
                      <p className="text-[9px] text-slate-400">Open: 09:00 - 18:00 · Accepts: PET, HDPE, PP, Paper</p>
                    </div>
                    <a 
                      href="https://maps.google.com/?q=Tashkent,Yunusobod" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    >
                      <NavIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* 4. ECOVOTE & ECOACTIONS ACTIONABLE CARDS */}
                <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/5 space-y-4">
                  
                  {/* EcoVote Connection */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Vote className="h-3.5 w-3.5 text-emerald-400" />
                      {t('scanner.linkProject')}
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'school45', label: 'School #45 Playground' },
                        { id: 'mahallaPark', label: 'Yunusobod Park' },
                      ].map((proj) => (
                        <button
                          key={proj.id}
                          onClick={() => setSelectedProject(proj.id)}
                          className={cn(
                            "p-2.5 rounded-xl border text-left transition-all duration-200",
                            selectedProject === proj.id 
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                          )}
                        >
                          <div className="text-xs font-bold leading-tight">{proj.label}</div>
                          <div className="text-[8px] opacity-65 mt-0.5">{selectedProject === proj.id ? '✓ Selected' : 'Tap to select'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* EcoActions Connection */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
                        {t('scanner.nearbyEvent')}
                      </h5>
                      <p className="text-xs font-bold text-white">Yunusobod Plastic Drive</p>
                      <p className="text-[9px] text-slate-400">Saturday, 10:00 AM @ EcoPoint</p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => setIsJoinedEvent(prev => !prev)}
                      className={cn(
                        "rounded-xl font-bold text-xs h-9 px-4",
                        isJoinedEvent 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      )}
                    >
                      {isJoinedEvent ? '✓ Joined' : 'Join'}
                    </Button>
                  </div>
                </div>

                {/* 5. DYNAMIC FLOW ACTIONS */}
                <div className="flex flex-col gap-3">
                  <Link to="/vote" className="w-full">
                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-[0_8px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all">
                      {t('scanner.btnDropoff')}
                    </Button>
                  </Link>

                  <div className="flex gap-3">
                    <Button 
                      onClick={resetScanner} 
                      variant="outline" 
                      className="flex-1 h-12 rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    >
                      {t('scanner.btnScanMore')}
                    </Button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ─── ERROR ─── */}
            {state === 'error' && (
              <motion.div 
                key="error" 
                initial={{ opacity: 0, y: 24 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 24 }} 
                className="w-full"
              >
                <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.25rem] p-8 shadow-2xl border border-white/5 text-center space-y-5">
                  <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 w-fit mx-auto text-red-400">
                    <AlertTriangle className="h-8 w-8 stroke-[1.75]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-white text-lg tracking-tight">
                      {error === 'CAMERA_DENIED' ? t('scanner.errCameraDenied') :
                       error === 'API_KEY_MISSING' ? t('scanner.errApiKey') :
                       t('scanner.errGeneric')}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                      {error === 'CAMERA_DENIED' ? t('scanner.errCameraDeniedDesc') :
                       error === 'API_KEY_MISSING' ? t('scanner.errApiKeyDesc') :
                       t('scanner.errGenericDesc')}
                    </p>
                  </div>
                  <Button 
                    onClick={resetScanner} 
                    className="h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 px-6"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> {t('scanner.tryAgain')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      </div>
    </Layout>
  );
}
