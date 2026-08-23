import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Camera, RotateCcw, Zap, Leaf, Coins, ShieldCheck,
  AlertTriangle, X, SwitchCamera, ImageIcon, ArrowLeft,
  CheckCircle2, MapPin, Wallet, Sparkles, Navigation as NavIcon,
  Vote, Calendar as CalendarIcon, Info, Weight, Barcode, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { scanWasteImage, type WasteScanResult, type DetectedItem } from '@/lib/gemini';
import { 
  classifyWasteFromBase64, classifyWasteImage as classifyWasteFromElement,
  loadClassifierModel, isModelReady, isModelLoading as checkModelLoading,
  type ClassifierResult, type WasteClassification 
} from '@/lib/wasteClassifier';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';
import { loadUserProgress, saveUserProgress } from '@/lib/userProgress';
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

  // Anti-fraud check states
  const [selectedProject, setSelectedProject] = useState<string>('school45');
  const [isJoinedEvent, setIsJoinedEvent] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [collectionPoints, setCollectionPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'Pending' | 'Verified'>('Pending');
  const [antiFraudMessage, setAntiFraudMessage] = useState<string>('');

  // ML Classifier states
  const [scanMode, setScanMode] = useState<'cloud' | 'offline'>('cloud');
  const [mlResult, setMlResult] = useState<ClassifierResult | null>(null);
  const [mlModelLoading, setMlModelLoading] = useState(false);
  const [mlModelReady, setMlModelReady] = useState(isModelReady());

  // 1. Fetch points and locate user
  useEffect(() => {
    // Get points (only verified points returned)
    apiClient.getCollectionPoints()
      .then((points) => {
        setCollectionPoints(points || []);
        if (points && points.length > 0) {
          setSelectedPoint(points[0]);
        } else {
          setSelectedPoint(null);
        }
      })
      .catch((err) => {
        console.warn('[Scanner] Failed to load collection points:', err);
        setCollectionPoints([]);
        setSelectedPoint(null);
      });

    // Get GPS coords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          console.log('[Anti-Fraud] User location loaded:', coords);
        },
        (err) => {
          console.warn('[Anti-Fraud] Geolocator access denied or offline:', err.message);
        }
      );
    }
  }, []);

  // 2. Haversine distance proximity calculator
  const getProximityCheck = useCallback((point: any) => {
    if (!userCoords || !point || (!point.latitude && !point.lat)) return { distance: null, isClose: false };
    const pLat = point.latitude || point.lat;
    const pLng = point.longitude || point.lng;
    const R = 6371; // Earth radius in km
    const dLat = (pLat - userCoords.lat) * Math.PI / 180;
    const dLon = (pLng - userCoords.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMeters = distanceKm * 1000;
    
    return {
      distance: distanceKm,
      isClose: distanceMeters <= 200 // 200m range threshold
    };
  }, [userCoords]);

  // 3. Auto-select nearest point once user coordinates are resolved
  useEffect(() => {
    if (userCoords && collectionPoints.length > 0) {
      let nearest = collectionPoints[0];
      let minDistance = Infinity;

      collectionPoints.forEach(p => {
        const check = getProximityCheck(p);
        if (check.distance !== null && check.distance < minDistance) {
          minDistance = check.distance;
          nearest = p;
        }
      });
      setSelectedPoint(nearest);
      console.log('[Anti-Fraud] Auto-selected nearest EcoPoint:', nearest.name);
    } else {
      setSelectedPoint(null);
    }
  }, [userCoords, collectionPoints, getProximityCheck]);

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

  // Smart Unified Image Analyzer
  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;
    setState('scanning');
    setError('');
    
    let scanResult: WasteScanResult | null = null;

    try {
      // Attempt Real Backend AI EcoScan Call
      scanResult = await scanWasteImage(capturedImage, i18n.language);
    } catch (err: any) {
      console.warn('[Scanner] EcoScan API call failed:', err.message || err);
      setResult(null);
      setError(err.message || 'SCAN_ERROR');
      setState('error');
      return;
    }

    try {
      setResult(scanResult);
      setState('result');
      
      // Proximity GPS Check (only if a real verified point is present)
      if (selectedPoint) {
        const check = getProximityCheck(selectedPoint);
        const status = check.isClose ? 'Verified' : 'Pending';
        setVerificationStatus(status);

        if (status === 'Verified') {
          setAntiFraudMessage(t('scanner.gpsSuccess', { defaultValue: 'GPS match verified. Rewards instantly credited!' }));
        } else {
          setAntiFraudMessage(t('scanner.gpsWarning', { defaultValue: 'GPS mismatch: marked as Pending verification.' }));
        }
      } else {
        setVerificationStatus('Pending');
        setAntiFraudMessage('');
      }
      
      // Save scan record
      if (isSupabaseConfigured() && supabase && scanResult) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase
            .from('scans')
            .insert({
              user_id: session.user.id,
              detected_items: scanResult.items,
              total_weight_kg: scanResult.totalEstimatedWeightKg,
              estimated_coins: scanResult.estimatedEcoCoins,
              project_pledged: selectedProject,
              verification_status: status
            });
            
          if (status === 'Verified') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('ecopoints')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              await supabase
                .from('profiles')
                .update({ ecopoints: (profile.ecopoints || 0) + scanResult.estimatedEcoCoins })
                .eq('id', session.user.id);
            }
          }
        }
      }

      // Update local storage progress
      const local = loadUserProgress();
      if (status === 'Verified') {
        local.ecoCoins += scanResult.estimatedEcoCoins;
        local.ecoPoints += scanResult.estimatedEcoCoins * 10;
      }
      local.wasteCollected += 0.25; // add simulation weight
      saveUserProgress(local);
      
      setState('result');
    } catch (err: any) {
      setError('SCAN_ERROR');
      setState('error');
    }
  }, [capturedImage, i18n.language, selectedProject, selectedPoint]);

  // Preload ML model when switching to offline mode
  useEffect(() => {
    if (scanMode === 'offline' && !isModelReady()) {
      setMlModelLoading(true);
      loadClassifierModel().then((ready) => {
        setMlModelReady(ready);
        setMlModelLoading(false);
      });
    }
  }, [scanMode]);

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

  // Extract unique detected material categories for material-aware EcoMap entry
  const detectedMaterials = useMemo(() => {
    if (!result?.items) return [];
    const set = new Set<string>();
    result.items.forEach(i => {
      if (i.wasteType && i.wasteType !== 'Unknown') set.add(i.wasteType);
    });
    return Array.from(set);
  }, [result]);

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
                        className="w-full h-12 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-95 transition-all duration-200"
                      >
                        <Camera className="h-4.5 w-4.5" /> {t('scanner.takePhoto')}
                      </button>
                      <button
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute('capture');
                            fileInputRef.current.click();
                            fileInputRef.current.setAttribute('capture', 'environment');
                          }
                        }}
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-200"
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
                          <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-emerald-400/50 rounded-tl-xl" />
                          <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-emerald-400/50 rounded-tr-xl" />
                          <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-emerald-400/50 rounded-bl-xl" />
                          <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-emerald-400/50 rounded-br-xl" />
                          <motion.div
                            className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.3)]"
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
                    <div className="flex items-center justify-center gap-8 mt-6">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-12 w-12 rounded-full border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-300 hover:text-white hover:border-white/20 active:scale-95 transition-all flex items-center justify-center shadow-lg hover:shadow-white/5"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="h-20 w-20 rounded-full border-2 border-white/20 flex items-center justify-center p-1.5 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        <div className="h-full w-full rounded-full transition-all duration-300 flex items-center justify-center bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                          <div className="h-7 w-7 rounded-full border-2 border-white/90" />
                        </div>
                      </button>

                      <button
                        onClick={flipCamera}
                        className="h-12 w-12 rounded-full border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-300 hover:text-white hover:border-white/20 active:scale-95 transition-all flex items-center justify-center shadow-lg hover:shadow-white/5"
                      >
                        <SwitchCamera className="h-5 w-5" />
                      </button>
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
                  
                  {/* ML Pre-classification overlay */}
                  {mlResult && scanMode === 'offline' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 pt-10">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">ML Pre-scan ({mlResult.processingTimeMs}ms)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {mlResult.predictions.slice(0, 3).map((pred, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border" style={{
                            backgroundColor: pred.binColor + '15',
                            borderColor: pred.binColor + '40',
                            color: pred.binColor,
                          }}>
                            {pred.icon} {pred.category} {pred.confidence}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={resetScanner} 
                    className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-xs font-bold tracking-wider uppercase hover:bg-white/10 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> {t('scanner.retake')}
                  </button>
                  <button 
                    onClick={analyzeImage} 
                    className="flex-1 h-12 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/10 font-bold text-xs tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2 border-none"
                  >
                    <Zap className="h-4 w-4" /> {t('scanner.analyze')}
                  </button>
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

                {/* Anti-Fraud Validation Badge */}
                {antiFraudMessage && selectedPoint && (
                  <div className={cn(
                    "rounded-2xl p-3 border flex items-start gap-2.5 shadow-lg",
                    verificationStatus === 'Verified'
                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/35 text-amber-400"
                  )}>
                    {verificationStatus === 'Verified' ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5 text-left">
                      <div className="text-[10px] font-black uppercase tracking-wider">
                        {verificationStatus === 'Verified' 
                          ? t('scanner.gpsPassed', { defaultValue: 'GPS Verification: Passed' }) 
                          : t('scanner.gpsMismatch', { defaultValue: 'GPS Verification: Mismatch' })}
                      </div>
                      <p className="text-[10px] opacity-90 leading-tight">
                        {antiFraudMessage}
                      </p>
                    </div>
                  </div>
                )}

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
                              <span className="text-xs font-black text-white">
                                {item.quantity} × {t(`scanner.items.${item.name.replace(/\s+/g, '')}`, { defaultValue: item.name })}
                              </span>
                              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", color.bg, color.text, color.border)}>
                                {t(`scanner.wasteTypes.${item.wasteType}`, { defaultValue: item.wasteType })}
                              </span>
                              <span className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded border", statusColor.bg)}>
                                {t(`scanner.status.${item.status.replace(' ', '')}`, { defaultValue: item.status })}
                              </span>
                            </div>
                            {item.instructions && (
                              <p className="text-[10px] text-slate-400 leading-normal flex items-start gap-1 text-left">
                                <span className="text-emerald-400/80">•</span> {t(`scanner.instructions.${item.wasteType}`, { defaultValue: item.instructions })}
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
                    <p className="text-[9px] text-amber-500/70 leading-snug">{t('scanner.walletAwaiting', { defaultValue: 'Начисляется только после подтверждённой передачи материала в пункте приёма.' })}</p>
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
                   <div className="flex items-start justify-between gap-3">
                     <div className="space-y-1 text-left flex-1">
                       <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                         <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                         {selectedPoint
                           ? t('scanner.nearestPoint', { defaultValue: 'Ближайший пункт сбора' })
                           : t('scanner.noVerifiedPointsTitle', { defaultValue: 'Подтверждённых пунктов приёма рядом пока нет' })}
                       </h4>
                       {selectedPoint ? (
                         <>
                           <p className="text-[10px] font-semibold text-slate-300">
                             {selectedPoint.name}
                             {userCoords && (
                               <span className="text-emerald-400 ml-1.5 font-extrabold">
                                 ({getProximityCheck(selectedPoint).distance?.toFixed(2)} km)
                               </span>
                             )}
                           </p>
                           <p className="text-[9px] text-slate-400">
                             {selectedPoint.accepted_materials || selectedPoint.type}
                           </p>
                         </>
                       ) : (
                         <p className="text-[10px] text-slate-400 leading-relaxed">
                           {t('scanner.noVerifiedPointsDesc', {
                             defaultValue: 'ZAMINAT развивает сеть партнёрских пунктов. На карте будут отображаться только проверенные места, которые действительно принимают выбранные материалы.'
                           })}
                         </p>
                       )}
                     </div>
                     {selectedPoint ? (
                       <a
                         href={`https://maps.google.com/?q=${selectedPoint.latitude || selectedPoint.lat},${selectedPoint.longitude || selectedPoint.lng}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                       >
                         <NavIcon className="h-4 w-4" />
                       </a>
                     ) : (
                       <Link
                         to={`/map?source=ecoscan${detectedMaterials.length > 0 ? `&materials=${encodeURIComponent(detectedMaterials.join(','))}` : ''}`}
                         className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                         title={t('scanner.openEcoMap', { defaultValue: 'Открыть EcoMap' })}
                       >
                         <ExternalLink className="h-4 w-4" />
                       </Link>
                     )}
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
                  <Link
                    to={`/map?source=ecoscan${detectedMaterials.length > 0 ? `&materials=${encodeURIComponent(detectedMaterials.join(','))}` : ''}`}
                    className="w-full"
                  >
                    <button className="w-full h-12 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 border-none">
                      <MapPin className="h-4 w-4" />
                      {t('scanner.btnDropoff', { defaultValue: 'Найти ближайший пункт и сдать' })}
                    </button>
                  </Link>

                  <button 
                    onClick={resetScanner} 
                    className="w-full h-11 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold text-xs tracking-wider uppercase hover:bg-white/10 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {t('scanner.btnScanMore', { defaultValue: 'Сканировать другие материалы' })}
                  </button>
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
