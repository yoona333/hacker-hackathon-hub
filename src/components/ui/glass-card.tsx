import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'amber' | 'emerald' | 'red' | 'purple' | 'blue' | 'cyan' | 'pink' | 'green';
}

export function GlassCard({ children, className, hover = true, glow }: GlassCardProps) {
  const glowClasses = {
    amber: 'hover:shadow-terminal-amber hover:border-primary/40',
    emerald: 'hover:shadow-terminal-emerald hover:border-accent/40',
    red: 'hover:shadow-[0_0_30px_hsl(0_55%_48%/0.3)] hover:border-destructive/40',
    // Legacy support
    purple: 'hover:shadow-terminal-amber hover:border-primary/40',
    blue: 'hover:shadow-terminal-amber hover:border-primary/40',
    cyan: 'hover:shadow-terminal-emerald hover:border-accent/40',
    pink: 'hover:shadow-[0_0_30px_hsl(0_55%_48%/0.3)] hover:border-destructive/40',
    green: 'hover:shadow-terminal-emerald hover:border-accent/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={cn(
        'terminal-card p-6 transition-all duration-300',
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
    <div className={cn('neon-border p-[1px]', className)}>
      <div className="terminal-card p-6 h-full">
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
  glow?: 'amber' | 'emerald' | 'red' | 'purple' | 'blue' | 'cyan' | 'pink' | 'green';
}

export function StatCard({ title, value, subtitle, icon, glow = 'amber' }: StatCardProps) {
  return (
    <GlassCard glow={glow} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">{title}</p>
          <motion.p 
            className="text-3xl font-bold terminal-text mt-1 font-mono"
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
          <div className="p-2 hex-clip gradient-amber">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
