import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  History, ArrowLeft, ExternalLink, Clock, 
  Filter, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { AddressDisplay } from '@/components/ui/address-display';
import { StatusBadge, TypeBadge, NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { MOCK_DATA, getExplorerUrl, kiteTestnet, shortenAddress } from '@/lib/web3/config';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'freeze' | 'unfreeze' | 'confirm' | 'execute';
type StatusType = 'all' | 'success' | 'pending' | 'failed';

export default function HistoryPage() {
  const { isConnected } = useWallet();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');

  const filteredTransactions = MOCK_DATA.transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    return true;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const formatFullTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const filterButtons: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'freeze', label: '❄️ Freeze' },
    { value: 'unfreeze', label: '🔓 Unfreeze' },
    { value: 'confirm', label: '✅ Confirm' },
    { value: 'execute', label: '⚡ Execute' },
  ];

  const statusButtons: { value: StatusType; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg hover:bg-muted/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold neon-text">Transaction History</span>
            </div>
          </div>
          <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Filters */}
          <GlassCard className="mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTypeFilter(value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      typeFilter === value
                        ? 'gradient-purple-blue text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      statusFilter === value
                        ? 'gradient-blue-cyan text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

            {/* Transactions */}
            <div className="space-y-6">
              {filteredTransactions.length === 0 ? (
                <GlassCard className="ml-16 text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-bold mb-2">No Transactions Found</h3>
                  <p className="text-muted-foreground">
                    {typeFilter !== 'all' || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Your transaction history will appear here'}
                  </p>
                </GlassCard>
              ) : (
                filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.hash}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center',
                      tx.status === 'success' && 'bg-success/20 ring-2 ring-success',
                      tx.status === 'pending' && 'bg-primary/20 ring-2 ring-primary',
                      tx.status === 'failed' && 'bg-destructive/20 ring-2 ring-destructive',
                    )}>
                      <StatusIcon status={tx.status} />
                    </div>

                    {/* Transaction Card */}
                    <GlassCard 
                      className="flex-1"
                      glow={tx.status === 'success' ? 'green' : tx.status === 'pending' ? 'purple' : 'pink'}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TypeBadge type={tx.type as 'freeze' | 'unfreeze' | 'confirm' | 'execute'} />
                          <StatusBadge 
                            status={tx.status as 'success' | 'pending' | 'failed'}
                            pulse={tx.status === 'pending'}
                          >
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </StatusBadge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span title={formatFullTime(tx.timestamp)}>
                            {formatTime(tx.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tx Hash</span>
                          <div className="flex items-center gap-2">
                            <span className="address-gradient font-mono text-sm">
                              {shortenAddress(tx.hash, 8)}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => window.open(getExplorerUrl('tx', tx.hash), '_blank')}
                              className="p-1 rounded hover:bg-muted/50"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Target</span>
                          <AddressDisplay address={tx.target} />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Load More */}
          {filteredTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <NeonButton variant="outline">
                Load More Transactions
              </NeonButton>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
