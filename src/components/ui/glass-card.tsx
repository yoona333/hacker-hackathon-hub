import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'purple' | 'blue' | 'cyan' | 'pink' | 'green';
}

export function GlassCard({ children, className, hover = true, glow }: GlassCardProps) {
  const glowClasses = {
    purple: 'hover:shadow-neon-purple',
    blue: 'hover:shadow-neon-blue',
    cyan: 'hover:shadow-neon-cyan',
    pink: 'hover:shadow-[0_0_30px_hsl(330_91%_60%/0.5)]',
    green: 'hover:shadow-[0_0_30px_hsl(142_76%_45%/0.5)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      className={cn(
        'glass-card p-6 transition-all duration-300',
        glow && glowClasses[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface NeonBorderCardProps {
  children: ReactNode;
  className?: string;
}

export function NeonBorderCard({ children, className }: NeonBorderCardProps) {
  return (
    <div className={cn('neon-border p-[2px]', className)}>
      <div className="glass-card p-6 h-full">
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down';
  glow?: 'purple' | 'blue' | 'cyan' | 'pink' | 'green';
}

export function StatCard({ title, value, subtitle, icon, glow = 'purple' }: StatCardProps) {
  return (
    <GlassCard glow={glow} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <motion.p 
            className="text-3xl font-bold neon-text mt-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg gradient-purple-blue opacity-80">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
