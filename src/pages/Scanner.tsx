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
  const { t } = useTranslation();
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

  // Start camera
  const startCamera = useCallback(async () => {
    try {
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
      setError(err.name === 'NotAllowedError' ? 'CAMERA_DENIED' : 'CAMERA_ERROR');
      setState('error');
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
      const scanResult = await scanWasteImage(capturedImage);
      setResult(scanResult);
      setState('result');
    } catch (err: any) {
      if (err.message === 'GEMINI_API_KEY_MISSING') {
        setError('API_KEY_MISSING');
      } else if (err.message === 'PARSE_ERROR') {
        setError('PARSE_ERROR');
      } else {
        setError('SCAN_ERROR');
      }
      setState('error');
    }
  }, [capturedImage]);

  // Reset to camera
  const resetScanner = useCallback(() => {
    setCapturedImage(null);
    setResult(null);
    setError('');
    startCamera();
  }, [startCamera]);

  // Flip camera
  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  const wasteColor = result ? (WASTE_COLORS[result.wasteType] || WASTE_COLORS.Unknown) : WASTE_COLORS.Unknown;

  return (
    <Layout>
      <div className={cn("min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden", isMobile ? "pt-16" : "pt-20")}>
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t('scanner.back')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-white">{t('scanner.title')}</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className={cn("relative z-10 px-4 pb-8", isMobile ? "max-w-full" : "max-w-lg mx-auto")}>
          <canvas ref={canvasRef} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />

          <AnimatePresence mode="wait">
            {/* ─── CAMERA VIEW ─── */}
            {state === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] shadow-2xl border border-white/10">
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
                      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
                      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl" />
                      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl" />
                      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />
                      {/* Scan line animation */}
                      <motion.div
                        className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                        animate={{ top: ['15%', '85%', '15%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  )}
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center space-y-2">
                        <Camera className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
                        <p className="text-sm text-white/60">{t('scanner.loading')}</p>
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
                    className="h-12 w-12 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    className="h-16 w-16 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-white/30 shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>

                  <Button
                    onClick={flipCamera}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    <SwitchCamera className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-center text-xs text-white/40">{t('scanner.hint')}</p>
              </motion.div>
            )}

            {/* ─── PREVIEW ─── */}
            {state === 'preview' && capturedImage && (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl border border-white/10">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={resetScanner} variant="outline" className="flex-1 h-12 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <RotateCcw className="h-4 w-4 mr-2" /> {t('scanner.retake')}
                  </Button>
                  <Button onClick={analyzeImage} className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/25">
                    <Zap className="h-4 w-4 mr-2" /> {t('scanner.analyze')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── SCANNING ANIMATION ─── */}
            {state === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl border border-emerald-500/30">
                  <img src={capturedImage!} alt="Scanning" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                      <div className="relative mx-auto w-16 h-16">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <Zap className="absolute inset-0 m-auto h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{t('scanner.analyzing')}</p>
                        <p className="text-white/50 text-xs mt-1">{t('scanner.aiProcessing')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── RESULTS ─── */}
            {state === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden h-48 shadow-xl border border-white/10">
                  <img src={capturedImage!} alt="Scanned" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold border", wasteColor.bg, wasteColor.text, wasteColor.border)}>
                      {result.wasteType}
                    </div>
                  </div>
                </div>

                {/* Result Card */}
                <div className="bg-white rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-lg text-gray-900">{result.material}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", wasteColor.bg, wasteColor.text, wasteColor.border)}>
                          {result.wasteType}
                        </span>
                        {result.recyclable && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ♻️ {t('scanner.recyclable')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600">{result.confidence}%</div>
                      <div className="text-[10px] text-slate-400 font-medium">{t('scanner.confidence')}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <Leaf className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                      <div className="text-sm font-black text-emerald-700">{result.recyclabilityScore}%</div>
                      <div className="text-[9px] text-emerald-600/70 font-medium">{t('scanner.recyclability')}</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <Coins className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                      <div className="text-sm font-black text-amber-700">+{result.ecoCoins}</div>
                      <div className="text-[9px] text-amber-600/70 font-medium">Eco Coins</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <ShieldCheck className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-black text-blue-700">{result.recyclable ? '✓' : '✗'}</div>
                      <div className="text-[9px] text-blue-600/70 font-medium">{t('scanner.verified')}</div>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-700 mb-1">💡 {t('scanner.suggestion')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{result.suggestion}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={resetScanner} className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/25">
                    <Camera className="h-4 w-4 mr-2" /> {t('scanner.scanAgain')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── ERROR ─── */}
            {state === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl text-center space-y-4">
                  <div className="p-3 rounded-full bg-red-50 w-fit mx-auto">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {error === 'CAMERA_DENIED' ? t('scanner.errCameraDenied') :
                       error === 'API_KEY_MISSING' ? t('scanner.errApiKey') :
                       t('scanner.errGeneric')}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {error === 'CAMERA_DENIED' ? t('scanner.errCameraDeniedDesc') :
                       error === 'API_KEY_MISSING' ? t('scanner.errApiKeyDesc') :
                       t('scanner.errGenericDesc')}
                    </p>
                  </div>
                  <Button onClick={resetScanner} variant="outline" className="rounded-2xl">
                    <RotateCcw className="h-4 w-4 mr-2" /> {t('scanner.tryAgain')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>
    </Layout>
  );
}
