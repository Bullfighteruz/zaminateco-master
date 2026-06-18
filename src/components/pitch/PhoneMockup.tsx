import React from 'react';
import { cn } from '@/lib/utils';

interface PhoneMockupProps {
  children: React.ReactNode;
  width?: number;
  className?: string;
}

/**
 * Premium iPhone 17 Pro Max CSS-only mockup frame.
 * Renders a realistic device bezel with Dynamic Island, status bar,
 * titanium rim glare, and glass reflection overlay.
 * 
 * Pass screen content as children — it fills the viewport area.
 */
export default function PhoneMockup({ children, width = 320, className }: PhoneMockupProps) {
  // Maintain iPhone 17 Pro Max aspect ratio (6.9" display ≈ 19.5:9)
  const height = Math.round(width * 2.167);
  const borderRadius = Math.round(width * 0.1375); // ~44px at 320
  const innerRadius = Math.round(borderRadius * 0.77);
  const bezelWidth = Math.round(width * 0.025); // ~8px at 320

  return (
    <div
      className={cn('relative flex flex-col overflow-hidden select-none', className)}
      style={{
        width,
        height,
        backgroundColor: '#0a0a0f',
        borderRadius,
        padding: bezelWidth * 0.75,
        border: `${bezelWidth}px solid #1a1a22`,
        boxShadow: `
          0 ${Math.round(height * 0.04)}px ${Math.round(height * 0.1)}px -${Math.round(height * 0.02)}px rgba(0,0,0,0.4),
          0 ${Math.round(height * 0.01)}px ${Math.round(height * 0.03)}px rgba(0,0,0,0.2),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
      }}
    >
      {/* Titanium Outer Rim Glare */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          inset: -bezelWidth,
          borderRadius,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.12)',
        }}
      />

      {/* Screen Glass Reflection */}
      <div
        className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
        style={{
          borderRadius: innerRadius,
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Screen Viewport — children render here */}
      <div
        className="flex-1 bg-white overflow-hidden relative"
        style={{
          borderTopLeftRadius: innerRadius,
          borderTopRightRadius: innerRadius,
          borderBottomLeftRadius: innerRadius,
          borderBottomRightRadius: innerRadius,
        }}
      >
        {children}

        {/* iPhone 12 Pro Max Camera Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0c0d14] z-30 pointer-events-none flex items-center justify-center"
          style={{
            width: Math.round(width * 0.46), // Classic iPhone 12 Pro Max notch width (~46%)
            height: Math.round(width * 0.083), // Notch height (~25px at 300px)
            borderBottomLeftRadius: Math.round(width * 0.035), // Rounded bottom corners
            borderBottomRightRadius: Math.round(width * 0.035),
            boxShadow: 'inset 0 -1px 2px rgba(255, 255, 255, 0.04), 0 2px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Speaker Slit (centered at the top edge of the notch) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-[#1b1c24] rounded-full"
            style={{
              top: 3,
              width: '38%',
              height: 2.5,
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.8)'
            }}
          />
          {/* Camera Lens (on the right side of the notch) */}
          <div
            className="absolute rounded-full"
            style={{
              right: '22%',
              bottom: '22%',
              width: Math.round(width * 0.024),
              height: Math.round(width * 0.024),
              background: 'radial-gradient(circle, #090f1a 0%, #030408 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Inner camera blue/green glare */}
            <div
              className="w-[45%] h-[45%] rounded-full absolute top-[25%] left-[25%] opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(0,180,255,0.7) 0%, rgba(0,255,150,0.2) 60%, transparent 100%)'
              }}
            />
          </div>
          {/* Face ID sensor (on the left side of the notch) */}
          <div
            className="absolute rounded-full"
            style={{
              left: '22%',
              bottom: '25%',
              width: Math.round(width * 0.016),
              height: Math.round(width * 0.016),
              backgroundColor: '#07080d',
              boxShadow: 'inset 0 0.5px 0.5px rgba(255,255,255,0.05)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
