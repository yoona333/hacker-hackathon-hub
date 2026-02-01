import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number | string;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info';
  pulse?: boolean;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  trend, 
  icon, 
  color = 'primary',
  pulse = false,
  className 
}: StatCardProps) {
  const colorClasses = {
    primary: 'border-primary/30 bg-primary/5 text-primary',
    success: 'border-success/30 bg-success/5 text-success',
    warning: 'border-warning/30 bg-warning/5 text-warning',
    info: 'border-info/30 bg-info/5 text-info',
  };

  const trendColor = typeof trend === 'number' 
    ? trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
    : 'text-muted-foreground';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'terminal-card p-4 border',
        colorClasses[color],
        pulse && 'animate-pulse',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs font-mono uppercase text-muted-foreground">{label}</div>
        {icon && <div className="w-4 h-4 opacity-60">{icon}</div>}
      </div>
      <div className="text-2xl font-bold font-mono mb-1">{value}</div>
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-mono', trendColor)}>
          {typeof trend === 'number' ? (
            <>
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>{Math.abs(trend)}{typeof trend === 'number' && trend !== 0 ? '%' : ''}</span>
            </>
          ) : (
            <span>{trend}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
