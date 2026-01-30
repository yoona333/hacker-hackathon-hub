import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonProgressProps {
  value: number;
  max: number;
  showLabel?: boolean;
  variant?: 'purple' | 'blue' | 'cyan' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function NeonProgress({ 
  value, 
  max, 
  showLabel = true, 
  variant = 'purple',
  size = 'md' 
}: NeonProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const variants = {
    purple: 'from-neon-purple to-neon-blue',
    blue: 'from-neon-blue to-neon-cyan',
    cyan: 'from-neon-cyan to-neon-green',
    success: 'from-neon-green to-neon-cyan',
    danger: 'from-neon-pink to-neon-purple',
  };

  const glowColors = {
    purple: 'shadow-neon-purple',
    blue: 'shadow-neon-blue',
    cyan: 'shadow-neon-cyan',
    success: 'shadow-[0_0_20px_hsl(142_76%_45%/0.5)]',
    danger: 'shadow-[0_0_20px_hsl(330_91%_60%/0.5)]',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={cn('relative bg-muted rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0 bg-gradient-to-r rounded-full',
            variants[variant],
            glowColors[variant]
          )}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{value} / {max}</span>
          <span className="neon-text font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

interface ThresholdProgressProps {
  current: number;
  threshold: number;
  total: number;
}

export function ThresholdProgress({ current, threshold, total }: ThresholdProgressProps) {
  const isComplete = current >= threshold;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Confirmations</span>
        <span className={cn(
          'font-bold',
          isComplete ? 'status-success' : 'neon-text'
        )}>
          {current} / {threshold}
        </span>
      </div>
      <NeonProgress 
        value={current} 
        max={threshold} 
        showLabel={false}
        variant={isComplete ? 'success' : 'purple'}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Required: {threshold} of {total}</span>
        {isComplete && <span className="status-success">Ready to execute</span>}
      </div>
    </div>
  );
}
