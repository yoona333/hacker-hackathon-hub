import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'frozen' | 'active' | 'pending' | 'success' | 'failed';
  children: React.ReactNode;
  pulse?: boolean;
}

export function StatusBadge({ status, children, pulse = false }: StatusBadgeProps) {
  const statusStyles = {
    frozen: 'bg-destructive/20 text-destructive border-destructive/50',
    active: 'bg-accent/20 text-accent border-accent/50',
    pending: 'bg-primary/20 text-primary border-primary/50',
    success: 'bg-success/20 text-success border-success/50',
    failed: 'bg-destructive/20 text-destructive border-destructive/50',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-mono font-medium border uppercase tracking-wider',
        statusStyles[status],
        pulse && 'animate-pulse'
      )}
      style={{ borderRadius: '2px' }}
    >
      <span className={cn(
        'w-1.5 h-1.5 mr-2',
        status === 'frozen' && 'bg-destructive',
        status === 'active' && 'bg-accent',
        status === 'pending' && 'bg-primary',
        status === 'success' && 'bg-success',
        status === 'failed' && 'bg-destructive',
      )} style={{ borderRadius: '1px' }} />
      {children}
    </motion.span>
  );
}

interface TypeBadgeProps {
  type: 'freeze' | 'unfreeze' | 'confirm' | 'execute' | 'transfer';
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const typeStyles = {
    freeze: 'gradient-danger text-foreground',
    unfreeze: 'gradient-emerald text-background',
    confirm: 'gradient-amber text-background',
    execute: 'gradient-terminal text-background',
    transfer: 'bg-secondary text-foreground',
  };

  const typeLabels = {
    freeze: '❄️ FREEZE',
    unfreeze: '🔓 UNFREEZE',
    confirm: '✓ CONFIRM',
    execute: '⚡ EXECUTE',
    transfer: '→ TRANSFER',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider',
        typeStyles[type]
      )}
      style={{ 
        borderRadius: '2px',
        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
      }}
    >
      {typeLabels[type]}
    </span>
  );
}

interface NetworkBadgeProps {
  connected?: boolean;
  chainName?: string;
}

export function NetworkBadge({ connected = false, chainName = 'Kite Testnet' }: NetworkBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.05, borderColor: connected ? 'hsl(var(--success) / 0.5)' : undefined }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium border transition-all',
        connected 
          ? 'bg-success/10 text-success border-success/30' 
          : 'bg-muted text-muted-foreground border-border'
      )}
      style={{ borderRadius: '2px' }}
    >
      <span className={cn(
        'w-2 h-2',
        connected ? 'bg-success animate-pulse' : 'bg-muted-foreground'
      )} style={{ borderRadius: '1px' }} />
      <span className="uppercase tracking-wider">{chainName}</span>
    </motion.div>
  );
}
