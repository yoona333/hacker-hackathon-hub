import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonProgressProps {
  value: number;
  max: number;
  showLabel?: boolean;
  variant?: 'amber' | 'emerald' | 'danger' | 'purple' | 'blue' | 'cyan' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function NeonProgress({ 
  value, 
  max, 
  showLabel = true, 
  variant = 'amber',
  size = 'md' 
}: NeonProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const variants: Record<string, string> = {
    amber: 'gradient-amber',
    emerald: 'gradient-emerald',
    danger: 'gradient-danger',
    success: 'gradient-emerald',
    // Legacy support
    purple: 'gradient-amber',
    blue: 'gradient-amber',
    cyan: 'gradient-emerald',
  };

  const glowColors: Record<string, string> = {
    amber: 'shadow-terminal-amber',
    emerald: 'shadow-terminal-emerald',
    danger: 'shadow-[0_0_20px_hsl(0_72%_51%/0.5)]',
    success: 'shadow-terminal-emerald',
    purple: 'shadow-terminal-amber',
    blue: 'shadow-terminal-amber',
    cyan: 'shadow-terminal-emerald',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div 
        className={cn('relative bg-muted overflow-hidden border border-border/50', sizes[size])}
        style={{ borderRadius: '1px' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0',
            variants[variant],
            glowColors[variant]
          )}
          style={{ borderRadius: '1px' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs font-mono text-muted-foreground">
          <span className="uppercase tracking-wider">{value} / {max}</span>
          <span className="terminal-text font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

interface ThresholdProgressProps {
  current: number;
  threshold: number;
  total: number;
  className?: string;
}

export function ThresholdProgress({ current, threshold, total, className }: ThresholdProgressProps) {
  const isComplete = current >= threshold;
  const percentage = (current / total) * 100;
  const thresholdPercentage = (threshold / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm font-mono">
        <span className="text-muted-foreground uppercase tracking-wider">Confirmations</span>
        <span className={cn(
          'font-bold',
          isComplete ? 'text-success' : 'terminal-text'
        )}>
          {current} / {threshold}
        </span>
      </div>
      
      <div 
        className="relative h-2 bg-muted border border-border/50" 
        style={{ borderRadius: '1px' }}
      >
        {/* Progress bar */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'absolute left-0 top-0 h-full transition-all duration-500',
            isComplete ? 'gradient-emerald' : 'gradient-amber'
          )}
          style={{ 
            borderRadius: '1px',
            boxShadow: isComplete 
              ? '0 0 10px hsl(var(--terminal-emerald) / 0.5)' 
              : '0 0 10px hsl(var(--terminal-amber) / 0.5)'
          }}
        />
        
        {/* Threshold marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-foreground/50"
          style={{ left: `${thresholdPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span className="uppercase tracking-wider">Required: {threshold} of {total}</span>
        {isComplete && (
          <span className="text-success uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-success" style={{ borderRadius: '1px' }} />
            Ready to execute
          </span>
        )}
      </div>
    </div>
  );
}
