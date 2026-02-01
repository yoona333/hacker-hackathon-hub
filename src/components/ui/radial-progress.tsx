import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadialProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function RadialProgress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = true,
  label,
  className
}: RadialProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const colorClasses = {
    primary: 'text-primary stroke-primary',
    success: 'text-success stroke-success',
    warning: 'text-warning stroke-warning',
    danger: 'text-destructive stroke-destructive',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', sizeClasses[size], className)}>
      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colorClasses[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('text-lg font-bold font-mono', colorClasses[color])}>
            {Math.round(percentage)}%
          </div>
          {label && (
            <div className="text-xs text-muted-foreground font-mono uppercase mt-1">
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
