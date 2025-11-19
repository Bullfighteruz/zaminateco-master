import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with a safe default based on window size if available
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Use modern addEventListener if available, fallback to addListener
    if (mql.addEventListener) {
      mql.addEventListener('change', checkMobile);
    } else if (mql.addListener) {
      mql.addListener(checkMobile);
    }
    
    // Initial check
    checkMobile();
    
    // Also listen to resize for better responsiveness
    window.addEventListener('resize', checkMobile);
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', checkMobile);
      } else if (mql.removeListener) {
        mql.removeListener(checkMobile);
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}
