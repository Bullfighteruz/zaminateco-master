/**
 * useNetworkQuality Hook
 * Detects network connection quality for adaptive video loading
 * Based on professional standards (Tesla, Apple, etc.)
 */

import { useState, useEffect } from 'react';

export type NetworkQuality = 'slow' | 'medium' | 'fast' | 'unknown';

interface NetworkInformation extends EventTarget {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  saveData?: boolean;
}

export function useNetworkQuality(): NetworkQuality {
  const [quality, setQuality] = useState<NetworkQuality>('unknown');

  useEffect(() => {
    // Check if Network Information API is available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const updateQuality = () => {
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const saveData = connection.saveData;

        // If data saver is enabled, use slow quality
        if (saveData) {
          setQuality('slow');
          return;
        }

        // Determine quality based on effective type and downlink
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setQuality('slow');
        } else if (effectiveType === '3g' || (downlink && downlink < 1.5)) {
          setQuality('medium');
        } else if (effectiveType === '4g' || (downlink && downlink >= 1.5)) {
          setQuality('fast');
        } else {
          setQuality('medium'); // Default to medium if unknown
        }
      } else {
        // Fallback: Use user agent and other heuristics
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        
        // On mobile, assume medium quality unless proven otherwise
        setQuality(isMobile ? 'medium' : 'fast');
      }
    };

    // Initial check
    updateQuality();

    // Listen for connection changes
    if (connection) {
      connection.addEventListener('change', updateQuality);
      return () => {
        connection.removeEventListener('change', updateQuality);
      };
    }
  }, []);

  return quality;
}

