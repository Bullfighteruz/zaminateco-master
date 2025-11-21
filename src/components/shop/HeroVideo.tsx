/**
 * HeroVideo Component
 * Fullscreen looping video background with gradient overlay
 * Optimized for performance and mobile devices
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoErrorRef = useRef<boolean>(false);

  // Use the actual video source - don't try to load non-existent optimized versions
  const videoSource = useMemo(() => {
    // Always use the provided videoSrc directly
    // If optimized versions exist, they should be in the same directory
    return [{ src: videoSrc, type: 'video/mp4' }];
  }, [videoSrc]);

  // Video loading and playback management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset video state on mount/remount
    videoErrorRef.current = false;
    setVideoLoaded(false);
    setVideoError(false);
    setIsPlaying(true);

    const handleLoadedData = () => {
      console.log('Video loaded successfully');
      setVideoLoaded(true);
      setVideoError(false);
      onVideoReady?.();
      
      // Try to play video after it's loaded
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully');
            setIsPlaying(true);
          })
          .catch((error) => {
            console.warn('Video autoplay failed:', error);
            // Autoplay failed (likely due to browser policy), but video is loaded
            setIsPlaying(false);
          });
      }
    };

    const handleCanPlay = () => {
      // Video is ready to play
      if (!videoLoaded) {
        setVideoLoaded(true);
      }
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      videoErrorRef.current = true;
      setVideoError(true);
      setVideoLoaded(false);
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      // On mobile, automatically resume if video pauses (for continuous playback)
      if (isMobile) {
        // Small delay to allow browser to finish pause operation
        setTimeout(() => {
          const vid = videoRef.current;
          if (vid && vid.paused && !videoErrorRef.current) {
            vid.play().catch((error) => {
              console.warn('Auto-resume failed on mobile:', error);
            });
          }
        }, 100);
      } else {
        setIsPlaying(false);
      }
    };

    // Add all event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Force reload video on mount/remount to fix refresh issues
    video.load();

    // For mobile, use Intersection Observer for lazy loading
    if (isMobile) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is in viewport, ensure it's loaded
              if (video.readyState === 0) {
                video.load();
              }
              // Try to play if not already playing
              if (video.paused) {
                video.play().catch((error) => {
                  console.warn('Mobile video play failed:', error);
                  setIsPlaying(false);
                });
              }
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' } // Start loading earlier
      );

      observer.observe(video);

      // Continuous play monitoring for mobile - ensure video never stops
      const ensurePlaying = setInterval(() => {
        const vid = videoRef.current;
        if (vid && vid.paused && !videoErrorRef.current && vid.readyState >= 2) {
          vid.play().catch((error) => {
            // Silent fail - video might be loading or browser policy prevents autoplay
            console.warn('Continuous play check failed:', error);
          });
        }
      }, 1000); // Check every second

      return () => {
        observer.disconnect();
        clearInterval(ensurePlaying);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }

    // Desktop: Try to play immediately
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Desktop video autoplay failed:', error);
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onVideoReady, isMobile, videoSrc]); // Add videoSrc to dependencies to reload on source change

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Error playing video:', error);
            setIsPlaying(false);
          });
      }
    }
  }, [isPlaying]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

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
        {!videoError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                !videoLoaded && "opacity-0"
              )}
              poster={posterSrc}
              preload={isMobile ? "metadata" : "auto"}
              aria-label="Background video"
              // Additional performance optimizations
              disablePictureInPicture
              disableRemotePlayback
              // Force reload on source change
              key={videoSrc}
              // Prevent pause on mobile - disable controls
              controls={false}
              // Prevent user interaction from pausing on mobile
              onPause={(e) => {
                if (isMobile && !videoErrorRef.current) {
                  // Auto-resume if paused on mobile - ensure continuous playback
                  const vid = e.target as HTMLVideoElement;
                  setTimeout(() => {
                    if (vid && vid.paused && !videoErrorRef.current) {
                      vid.play().catch(() => {
                        // Silent fail - video might be loading
                      });
                    }
                  }, 100);
                }
              }}
              // Prevent click events from pausing on mobile
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  e.stopPropagation();
                  // Ensure video continues playing
                  const vid = e.target as HTMLVideoElement;
                  if (vid && vid.paused && !videoErrorRef.current) {
                    vid.play().catch(() => {});
                  }
                }
              }}
              // Prevent context menu on mobile (long press)
              onContextMenu={(e) => {
                if (isMobile) {
                  e.preventDefault();
                }
              }}
            >
              {videoSource.map((source, index) => (
                <source
                  key={index}
                  src={source.src}
                  type={source.type}
                />
              ))}
              Your browser does not support the video tag.
            </video>
            {/* Fallback poster image */}
            {!videoLoaded && posterSrc && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${posterSrc})` }}
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          // Fallback if video fails to load
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${posterSrc || '/images/green-city_5994274.png'})` }}
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

      {/* Video Controls - Hidden on mobile */}
      {videoLoaded && !videoError && !isMobile && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
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
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
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
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg leading-tight"
          >
            {title}
          </motion.h1>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl lg:text-2xl text-white/95 drop-shadow-md max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              {primaryCTA && (
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
                  onClick={primaryCTA.onClick}
                >
                  {primaryCTA.text}
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6"
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
    </section>
  );
}

