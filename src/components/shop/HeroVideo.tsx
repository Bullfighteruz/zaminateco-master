/**
 * HeroVideo Component - Professional Grade
 * World-class video background implementation
 * Based on industry standards: Tesla, Apple, Nike, etc.
 * 
 * Features:
 * - Adaptive quality based on network
 * - Reduced motion support (accessibility)
 * - Page visibility handling (pause when hidden)
 * - Intersection Observer lazy loading
 * - Progressive enhancement
 * - Error recovery
 * - Performance optimized
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useReducedMotion as useReducedMotionPreference } from '@/hooks/useReducedMotion';
import { usePageVisibility } from '@/hooks/usePageVisibility';

interface HeroVideoProps {
  videoSrc: string;
  posterSrc?: string;
  title: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    onClick: () => void;
  };
  secondaryCTA?: {
    text: string;
    onClick: () => void;
  };
  onVideoReady?: () => void;
  className?: string;
}

export default function HeroVideo({
  videoSrc,
  posterSrc,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  onVideoReady,
  className
}: HeroVideoProps) {
  const isMobile = useIsMobile();
  const networkQuality = useNetworkQuality();
  const prefersReducedMotion = useReducedMotionPreference();
  const isPageVisible = usePageVisibility();
  const reducedMotion = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoErrorRef = useRef<boolean>(false);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Smart video source selection - adaptive based on network quality
  const videoSource = useMemo(() => {
    const basePath = videoSrc.replace('/images/', '/videos/').replace('.mp4', '');
    
    // If reduced motion is preferred, return empty array (will use poster image)
    if (prefersReducedMotion || reducedMotion) {
      return [];
    }

    // Network quality-based selection
    if (networkQuality === 'slow' || (isMobile && networkQuality === 'medium')) {
      // Slow network: Use mobile version or skip video
      return [
        { src: `${basePath}-mobile.mp4`, type: 'video/mp4' },
        { src: videoSrc, type: 'video/mp4' }, // Fallback
      ];
    }
    
    // Fast network: Use optimized versions
    if (isMobile) {
      return [
        { src: `${basePath}-mobile.mp4`, type: 'video/mp4' },
        { src: videoSrc, type: 'video/mp4' },
        { src: `${basePath}.webm`, type: 'video/webm' },
      ];
    }
    
    // Desktop with good connection
    return [
      { src: `${basePath}.webm`, type: 'video/webm' },
      { src: `${basePath}-optimized.mp4`, type: 'video/mp4' },
      { src: videoSrc, type: 'video/mp4' },
    ];
  }, [videoSrc, isMobile, networkQuality, prefersReducedMotion, reducedMotion]);

  // Handle video loading with retry logic
  const loadVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoSource.length === 0) {
      setIsLoading(false);
      return;
    }

    // Reset error state
    videoErrorRef.current = false;
    setVideoError(false);
    setIsLoading(true);

    // Load video
    video.load();
  }, [videoSource]);

  // Intersection Observer for lazy loading (professional standard)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoSource.length === 0 || prefersReducedMotion) {
      return;
    }

    // Only use Intersection Observer on mobile or slow networks
    if (isMobile || networkQuality === 'slow') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is in viewport, start loading
              loadVideo();
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before entering viewport
          threshold: 0.1,
        }
      );

      observer.observe(video);
      intersectionObserverRef.current = observer;

      return () => {
        observer.disconnect();
      };
    } else {
      // Desktop with good connection: Load immediately
      loadVideo();
    }
  }, [isMobile, networkQuality, loadVideo, videoSource, prefersReducedMotion]);

  // Video event handlers - professional error handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoSource.length === 0) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      setBuffering(false);
      
      if (!videoLoaded) {
      setVideoLoaded(true);
      setVideoError(false);
      onVideoReady?.();
      
        // Auto-play if page is visible and not reduced motion
        if (isPageVisible && !prefersReducedMotion && !reducedMotion) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
              .catch(() => {
                // Autoplay blocked - this is normal
            setIsPlaying(false);
          });
      }
        }
      }
    };

    const handleLoadedMetadata = () => {
      // Video metadata loaded
      if (video.readyState >= 2 && isPageVisible && !prefersReducedMotion) {
        // Try early play if possible
        video.play().catch(() => {
          // Silent fail
        });
      }
    };

    const handleWaiting = () => {
      setBuffering(true);
    };

    const handlePlaying = () => {
      setBuffering(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      videoErrorRef.current = true;
      setVideoError(true);
      setIsLoading(false);
      setBuffering(false);
      setIsPlaying(false);

      // Retry logic (professional error recovery)
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          loadVideo();
        }, 2000 * retryCountRef.current); // Exponential backoff
      }
    };

    const handleEnded = () => {
      // Seamless loop
      if (video.loop) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Silent fail
        });
      }
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [videoLoaded, isPageVisible, prefersReducedMotion, reducedMotion, loadVideo, onVideoReady, videoSource]);

  // Page visibility handling (pause when tab is hidden - saves resources)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoSource.length === 0) return;

    if (!isPageVisible && isPlaying) {
      video.pause();
    } else if (isPageVisible && !isPlaying && videoLoaded && !prefersReducedMotion) {
      // Resume when page becomes visible (if user hasn't manually paused)
      video.play().catch(() => {
        // Silent fail
      });
    }
  }, [isPageVisible, isPlaying, videoLoaded, prefersReducedMotion, videoSource]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Error playing video:', error);
          });
      }
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Show poster image if reduced motion or no video sources
  const showPosterOnly = prefersReducedMotion || reducedMotion || videoSource.length === 0;

  return (
    <section
      className={cn(
        "relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden",
        className
      )}
      aria-label="Hero section"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {!videoError && !showPosterOnly ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                !videoLoaded && "opacity-0",
                videoLoaded && "opacity-100"
              )}
              poster={posterSrc}
              preload={isMobile || networkQuality === 'slow' ? 'none' : 'auto'}
              aria-label="Background video"
              disablePictureInPicture
              disableRemotePlayback
              controls={false}
            >
              {videoSource.map((source, index) => (
                <source
                  key={`${source.src}-${index}`}
                  src={source.src}
                  type={source.type}
                />
              ))}
              Your browser does not support the video tag.
            </video>
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}

            {/* Buffering indicator */}
            {buffering && videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                <Loader2 className="h-6 w-6 text-white/80 animate-spin" />
              </div>
            )}

            {/* Fallback poster while loading */}
            {!videoLoaded && posterSrc && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
                style={{ backgroundImage: `url(${posterSrc})` }}
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          // Fallback: Poster image (for reduced motion, errors, or slow network)
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${posterSrc || '/images/green-city_5994274.webp'})` }}
            aria-hidden="true"
          />
        )}
        
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 158, 96, 0.85) 0%, rgba(232, 196, 104, 0.65) 100%)'
          }}
          aria-hidden="true"
        />
      </div>

      {/* Video Controls - Professional UI */}
      {videoLoaded && !videoError && !showPosterOnly && !isMobile && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <Play className={cn("h-5 w-5", isPlaying && "hidden")} />
          </Button>
        </div>
      )}

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.8, 
          ease: "easeOut" 
        }}
        className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center"
      >
        <motion.div
          initial={{ scale: prefersReducedMotion ? 1 : 0.95 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.6, 
            delay: prefersReducedMotion ? 0 : 0.2 
          }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: prefersReducedMotion ? 0 : 0.8, 
              delay: prefersReducedMotion ? 0 : 0.4 
            }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg leading-tight"
          >
            {title}
          </motion.h1>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 0.8, 
                delay: prefersReducedMotion ? 0 : 0.6 
              }}
              className="text-lg md:text-xl lg:text-2xl text-white/95 drop-shadow-md max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 0.8, 
                delay: prefersReducedMotion ? 0 : 0.8 
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              {primaryCTA && (
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl transition-all"
                  onClick={primaryCTA.onClick}
                >
                  {primaryCTA.text}
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6 transition-all"
                  onClick={secondaryCTA.onClick}
                >
                  {secondaryCTA.text}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      {!prefersReducedMotion && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-white/50 rounded-full"
          />
        </motion.div>
      </motion.div>
      )}
    </section>
  );
}
