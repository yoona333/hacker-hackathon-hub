import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  History, ExternalLink, Clock,
  Filter, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { GlassCard } from '@/components/ui/glass-card';
import { AddressDisplay } from '@/components/ui/address-display';
import { StatusBadge, TypeBadge } from '@/components/ui/status-badge';
import { useWallet, useProposals } from '@/lib/web3/hooks';
import { getExplorerUrl, shortenAddress, CONTRACTS } from '@/lib/web3/config';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

type FilterType = 'all' | 'freeze' | 'unfreeze' | 'confirm' | 'execute';
type StatusType = 'all' | 'success' | 'pending' | 'failed';

export default function HistoryPage() {
  const { isConnected } = useWallet();
  const { proposals, isLoading: proposalsLoading } = useProposals();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const { t } = useLanguage();

  const filteredTransactions = useMemo(() => {
    const list = proposals.map((p) => ({
      id: p.id,
      hash: '', // Multisig contract does not store tx hash per proposal
      type: (p.type === 'freeze' ? 'freeze' : p.type === 'unfreeze' ? 'unfreeze' : 'execute') as FilterType,
      status: p.executed ? ('success' as const) : ('pending' as const),
      timestamp: 0,
      target: p.targetAddress ?? p.to,
    }));
    return list.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    });
  }, [proposals, typeFilter, statusFilter]);

  const formatTime = (_timestamp: number) => {
    return t('history.onChain');
  };

  const formatFullTime = (_timestamp: number) => {
    return t('history.fromMultisig');
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
    { value: 'all', label: t('history.all') },
    { value: 'freeze', label: `❄️ ${t('history.freeze')}` },
    { value: 'unfreeze', label: `🔓 ${t('history.unfreeze')}` },
    { value: 'confirm', label: `✓ ${t('history.confirmFilter')}` },
    { value: 'execute', label: `⚡ ${t('history.executeFilter')}` },
  ];

  const statusButtons: { value: StatusType; label: string }[] = [
    { value: 'all', label: t('history.all') },
    { value: 'success', label: t('history.success') },
    { value: 'pending', label: t('history.pending') },
    { value: 'failed', label: t('history.failed') },
  ];

  return (
    <Layout
      title={t('history.title')}
      icon={<History className="w-4 h-4 text-background" />}
      backTo="/dashboard"
      headerClass="py-4"
    >
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Filters */}
          <GlassCard className="mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{t('history.typeFilter')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTypeFilter(value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-mono font-medium transition-all uppercase tracking-wider',
                      typeFilter === value
                        ? 'gradient-amber text-background'
                        : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                    )}
                    style={{ borderRadius: '2px' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{t('history.statusFilter')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-mono font-medium transition-all uppercase tracking-wider',
                      statusFilter === value
                        ? 'gradient-emerald text-background'
                        : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                    )}
                    style={{ borderRadius: '2px' }}
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
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary" />

            {/* Transactions */}
            <div className="space-y-6">
              {proposalsLoading ? (
                <GlassCard className="ml-16 text-center py-12">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                  <h3 className="text-lg font-bold mb-2 font-mono uppercase">{t('history.loading')}</h3>
                  <p className="text-muted-foreground font-mono text-sm">{t('history.fetchingProposals')}</p>
                </GlassCard>
              ) : filteredTransactions.length === 0 ? (
                <GlassCard className="ml-16 text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-bold mb-2 font-mono uppercase">{t('history.noTransactions')}</h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    {typeFilter !== 'all' || statusFilter !== 'all'
                      ? t('history.adjustFilters')
                      : t('history.historyAppears')}
                  </p>
                </GlassCard>
              ) : (
                filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={`${tx.id}-${tx.target}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                      'relative z-10 w-12 h-12 flex items-center justify-center border-2',
                      tx.status === 'success' && 'bg-success/20 border-success',
                      tx.status === 'pending' && 'bg-primary/20 border-primary',
                      tx.status === 'failed' && 'bg-destructive/20 border-destructive',
                    )} style={{ borderRadius: '2px' }}>
                      <StatusIcon status={tx.status} />
                    </div>

                    {/* Transaction Card */}
                    <GlassCard 
                      className="flex-1"
                      glow={tx.status === 'success' ? 'emerald' : tx.status === 'pending' ? 'amber' : 'red'}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TypeBadge type={tx.type as 'freeze' | 'unfreeze' | 'confirm' | 'execute'} />
                          <StatusBadge 
                            status={tx.status as 'success' | 'pending' | 'failed'}
                            pulse={tx.status === 'pending'}
                          >
                            {tx.status.toUpperCase()}
                          </StatusBadge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <Clock className="w-3 h-3" />
                          <span title={formatFullTime(tx.timestamp)}>
                            {formatTime(tx.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{t('history.proposalId')}</span>
                          <div className="flex items-center gap-2">
                            <span className="terminal-text font-mono text-sm">#{tx.id}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => window.open(getExplorerUrl('address', CONTRACTS.MULTISIG), '_blank')}
                              className="p-1 hover:bg-muted/50"
                              style={{ borderRadius: '2px' }}
                              title={t('history.viewOnExplorer')}
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{t('history.target')}</span>
                          <AddressDisplay address={tx.target} />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </Layout>
  );
}
