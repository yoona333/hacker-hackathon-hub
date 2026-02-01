import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  lines?: number;
  width?: string;
  height?: string;
}

export function Skeleton({ 
  className, 
  variant = 'default',
  lines,
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted/50 rounded';
  
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'w-full',
  };

  if (lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 && 'w-3/4', // Last line shorter
              className
            )}
            style={width ? { width } : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('terminal-card p-6 space-y-4', className)}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton 
      className={cn('h-[44px] w-24', className)} 
      variant="rectangular"
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return <Skeleton lines={lines} className={className} />;
}
