import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Camera, RotateCcw, Zap, Leaf, Coins, ShieldCheck,
  AlertTriangle, X, SwitchCamera, ImageIcon, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { scanWasteImage, type WasteScanResult } from '@/lib/gemini';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

type ScanState = 'camera' | 'preview' | 'scanning' | 'result' | 'error';

const WASTE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Plastic:  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  Metal:    { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200' },
  Glass:    { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200' },
  Paper:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  Rubber:   { bg: 'bg-stone-50',   text: 'text-stone-700',   border: 'border-stone-200' },
  Organic:  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
  'E-waste':{ bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  Textile:  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  Mixed:    { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  Unknown:  { bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200' },
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

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      // Check if getUserMedia is available (requires HTTPS on iOS)
      if (!navigator.mediaDevices?.getUserMedia) {
        setUseNativeCamera(true);
        setState('camera');
        return;
      }

      // Stop existing stream
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
      // On iOS over HTTP, fall back to native camera input instead of showing error
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
  }, [capturedImage, i18n.language]);

  // Reset to camera
  const resetScanner = useCallback(() => {
    setCapturedImage(null);
    setResult(null);
    setError('');
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

  const wasteColor = result ? (WASTE_COLORS[result.wasteType] || WASTE_COLORS.Unknown) : WASTE_COLORS.Unknown;

  return (
    <Layout hideBottomNav={true}>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col">
        
        {/* Floating Premium Header */}
        <div className="relative z-20 px-4 pt-4 pb-2">
          <div className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-semibold">{t('scanner.back')}</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-white/90 uppercase tracking-widest">{t('scanner.title')}</span>
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
                    {/* Glowing radial background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
                    
                    <div className="relative">
                      {/* Radar-like pulsing circles */}
                      <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping scale-150 duration-1000" />
                      <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping scale-125 duration-700" />
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
                          {/* Corner brackets */}
                          <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
                          <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl" />
                          <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl" />
                          <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />
                          {/* Scan line animation */}
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

            {/* ─── RESULTS ─── */}
            {state === 'result' && result && (
              <motion.div 
                key="result" 
                initial={{ opacity: 0, y: 24 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 24 }} 
                className="space-y-6 w-full"
              >
                {/* Thumbnail */}
                <div className="relative rounded-[2.25rem] overflow-hidden h-44 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/10">
                  <img src={capturedImage!} alt="Scanned" className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4">
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-md", wasteColor.bg, wasteColor.text, wasteColor.border)}>
                      {t(`scanner.wasteTypes.${result.wasteType}`, { defaultValue: result.wasteType })}
                    </div>
                  </div>
                </div>

                {/* Result Card (Glassmorphism design) */}
                <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.25rem] p-6 shadow-2xl border border-white/5 space-y-5 relative">
                  
                  {/* Glowing card border accent */}
                  <div className={cn("absolute top-0 left-6 right-6 h-[2px]", result.recyclable ? 'bg-emerald-500/30' : 'bg-red-500/30')} />

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-xl text-white tracking-tight leading-tight">{result.material}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", wasteColor.bg, wasteColor.text, wasteColor.border)}>
                          {t(`scanner.wasteTypes.${result.wasteType}`, { defaultValue: result.wasteType })}
                        </span>
                        {result.recyclable && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ♻️ {t('scanner.recyclable')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-400 leading-none">{result.confidence}%</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{t('scanner.confidence')}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Recyclability */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                      <Leaf className="h-4 w-4 text-emerald-400 mx-auto mb-1.5" />
                      <div className="text-base font-extrabold text-white">{result.recyclabilityScore}%</div>
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{t('scanner.recyclability')}</div>
                    </div>
                    {/* Eco Coins */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-center">
                      <Coins className="h-4 w-4 text-amber-400 mx-auto mb-1.5" />
                      <div className="text-base font-extrabold text-amber-400">+{result.ecoCoins}</div>
                      <div className="text-[9px] text-amber-500/70 font-semibold mt-0.5">Eco Coins</div>
                    </div>
                    {/* Verified */}
                    <div className={cn("rounded-2xl p-3 text-center border transition-colors", result.recyclable ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
                      <ShieldCheck className={cn("h-4 w-4 mx-auto mb-1.5", result.recyclable ? "text-emerald-400" : "text-red-400")} />
                      <div className={cn("text-base font-extrabold", result.recyclable ? "text-emerald-400" : "text-red-400")}>
                        {result.recyclable ? t('scanner.yes') : t('scanner.no')}
                      </div>
                      <div className={cn("text-[9px] font-semibold mt-0.5", result.recyclable ? "text-emerald-400/60" : "text-red-400/60")}>{t('scanner.verified')}</div>
                    </div>
                  </div>

                  {/* Suggestion Card */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <span>💡</span> {t('scanner.suggestion')}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{result.suggestion}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    onClick={resetScanner} 
                    className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-[0_8px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
                  >
                    <Camera className="h-4 w-4 mr-2" /> {t('scanner.scanAgain')}
                  </Button>
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
