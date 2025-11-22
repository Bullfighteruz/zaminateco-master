import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'w-full',
    card: 'w-full h-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  );
}

// Pre-built skeleton components
export function CardSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}

export function ProductCardSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className={cn("h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden", isMobile ? "p-2" : "p-5")}>
      {/* Image Skeleton */}
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 aspect-square">
        <Skeleton variant="rectangular" className="w-full h-full rounded-none" />
      </div>
      
      {/* Content Skeleton */}
      <div className={cn("flex flex-col flex-1", isMobile ? "p-2 space-y-1" : "p-5 space-y-4")}>
        {/* Title and Description */}
        <div className="flex-1 space-y-0.5">
          <Skeleton variant="text" width={isMobile ? "80%" : "70%"} height={isMobile ? 14 : 20} />
          <Skeleton variant="text" width={isMobile ? "60%" : "50%"} height={isMobile ? 10 : 16} />
        </div>
        
        {/* Price Skeleton */}
        <div className={cn("border-t border-gray-100", isMobile ? "pt-1 mt-1" : "pt-2")}>
          <Skeleton variant="text" width={isMobile ? "40%" : "35%"} height={isMobile ? 12 : 24} />
        </div>
        
        {/* Actions Skeleton */}
        <div className={cn("flex", isMobile ? "gap-1 pt-1" : "gap-2 pt-2")}>
          <Skeleton variant="rectangular" height={isMobile ? 28 : 36} className="flex-1 rounded-md" />
          <Skeleton variant="rectangular" width={isMobile ? 28 : 36} height={isMobile ? 28 : 36} className="rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="rectangular" height={36} className="rounded-md" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="rectangular" height={80} />
      </div>
    </div>
  );
}

