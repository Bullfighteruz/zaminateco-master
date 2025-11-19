import { LucideIcon } from 'lucide-react';

// Hand-drawn style eco icons using SVG
export const TrashBinIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3 6h18l-2 13H5L3 6zM8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M10 11v6M14 11v6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ 
        strokeDasharray: '1,2',
        filter: 'url(#roughPaper)'
      }}
    />
    <defs>
      <filter id="roughPaper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1"/>
      </filter>
    </defs>
  </svg>
);

export const RecyclingIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-1 16h12l-1-16M10 8v8M14 8v8" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ 
        strokeDasharray: '2,1',
        filter: 'url(#handDrawn)'
      }}
    />
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
    <defs>
      <filter id="handDrawn">
        <feTurbulence baseFrequency="0.02" numOctaves="2" result="noise" seed="2"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5"/>
      </filter>
    </defs>
  </svg>
);

export const TreeIcon = ({ className = "h-6 w-6", animated = false }: { className?: string; animated?: boolean }) => (
  <svg 
    className={`${className} ${animated ? 'animate-grow-sapling' : ''}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 22V12M12 12c0-3 2-5 5-5s3 2 3 5-2 3-5 3M12 12c0-3-2-5-5-5s-3 2-3 5 2 3 5 3" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ 
        filter: 'url(#organic)'
      }}
    />
    <circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.6"/>
    <defs>
      <filter id="organic">
        <feTurbulence baseFrequency="0.03" numOctaves="1" result="noise" seed="3"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
      </filter>
    </defs>
  </svg>
);

export const SaplingIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={`${className} animate-grow-sapling`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 22v-8M12 14c-2-2-4-1-4 1s2 3 4 1M12 14c2-2 4-1 4 1s-2 3-4 1M8 20h8" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.7"/>
  </svg>
);

export const HandIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M18 11V6a2 2 0 00-4 0v5M14 11V4a2 2 0 00-4 0v7M10 11V6a2 2 0 00-4 0v5M6 11v4a6 6 0 0012 0v-4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ 
        strokeDasharray: '3,1',
        filter: 'url(#friendly)'
      }}
    />
    <defs>
      <filter id="friendly">
        <feTurbulence baseFrequency="0.01" numOctaves="1" result="noise" seed="4"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3"/>
      </filter>
    </defs>
  </svg>
);

export const CoinIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="12" 
      cy="12" 
      r="9" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      fill="none"
      style={{ 
        strokeDasharray: '2,1',
        filter: 'url(#coin)'
      }}
    />
    <path d="M12 6v12M8 9l8-2M8 15l8 2" stroke="currentColor" strokeWidth="1.5"/>
    <defs>
      <filter id="coin">
        <feTurbulence baseFrequency="0.02" numOctaves="2" result="noise" seed="5"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.4"/>
      </filter>
    </defs>
  </svg>
);

// Uzbek-inspired decorative pattern component
export const UzbekPattern = ({ className = "w-full h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <pattern id="uzbekPattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
      <path 
        d="M0 10 Q10 0 20 10 Q30 20 40 10" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
        opacity="0.3"
      />
      <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="30" cy="10" r="2" fill="currentColor" opacity="0.2"/>
    </pattern>
    <rect width="200" height="20" fill="url(#uzbekPattern)"/>
  </svg>
);