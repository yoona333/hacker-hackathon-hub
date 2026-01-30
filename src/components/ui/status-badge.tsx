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
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        statusStyles[status],
        pulse && 'animate-pulse'
      )}
    >
      <span className={cn(
        'w-2 h-2 rounded-full mr-2',
        status === 'frozen' && 'bg-destructive',
        status === 'active' && 'bg-accent',
        status === 'pending' && 'bg-primary',
        status === 'success' && 'bg-success',
        status === 'failed' && 'bg-destructive',
      )} />
      {children}
    </motion.span>
  );
}

interface TypeBadgeProps {
  type: 'freeze' | 'unfreeze' | 'confirm' | 'execute' | 'transfer';
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const typeStyles = {
    freeze: 'gradient-pink-purple',
    unfreeze: 'bg-success',
    confirm: 'gradient-purple-blue',
    execute: 'gradient-blue-cyan',
    transfer: 'bg-secondary',
  };

  const typeLabels = {
    freeze: '❄️ Freeze',
    unfreeze: '🔓 Unfreeze',
    confirm: '✅ Confirm',
    execute: '⚡ Execute',
    transfer: '💸 Transfer',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white',
      typeStyles[type]
    )}>
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
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
        connected 
          ? 'bg-success/10 text-success border-success/30' 
          : 'bg-muted text-muted-foreground border-border'
      )}
    >
      <span className={cn(
        'w-2 h-2 rounded-full',
        connected ? 'bg-success animate-pulse' : 'bg-muted-foreground'
      )} />
      <span>{chainName}</span>
    </motion.div>
  );
}
