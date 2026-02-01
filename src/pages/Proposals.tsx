import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Check, Play,
  CheckCircle, X, Loader2, ExternalLink, RefreshCw
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { StatusBadge, TypeBadge } from '@/components/ui/status-badge';
import { SkeletonCard, SkeletonText } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/error-alert';
import {
  useWallet, useProposals, useIsMultiSigOwner, useSubmitProposal,
  useConfirmTransaction, useExecuteTransaction,
} from '@/lib/web3/hooks';
import { shortenAddress, getExplorerUrl } from '@/lib/web3/config';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

const REQUIRED = 2;
const TOTAL_OWNERS = 3;

export default function ProposalsPage() {
  const { isConnected } = useWallet();
  const { isOwner } = useIsMultiSigOwner();
  const { proposals, totalCount, isLoading, refetch } = useProposals();
  const { t } = useLanguage();
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [proposalType, setProposalType] = useState<'freeze' | 'unfreeze'>('freeze');
  const [targetAddress, setTargetAddress] = useState('');

  const {
    submitFreeze, submitUnfreeze,
    hash: submitHash, isPending: submitPending, isConfirming: submitConfirming, isSuccess: submitSuccess,
    error: submitError, reset: resetSubmit,
  } = useSubmitProposal();

  const {
    confirm, hash: confirmHash, isPending: confirmPending, isConfirming: confirmConfirming, isSuccess: confirmSuccess,
    error: confirmError, reset: resetConfirm,
  } = useConfirmTransaction();

  const {
    execute, hash: executeHash, isPending: executePending, isConfirming: executeConfirming, isSuccess: executeSuccess,
    error: executeError, reset: resetExecute,
  } = useExecuteTransaction();

  // Refetch after successful actions
  useEffect(() => {
    if (submitSuccess || confirmSuccess || executeSuccess) {
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, confirmSuccess, executeSuccess, refetch]);

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(targetAddress);

  const handleSubmitProposal = () => {
    if (!isValidAddress) return;
    resetSubmit();
    if (proposalType === 'freeze') {
      submitFreeze(targetAddress as `0x${string}`);
    } else {
      submitUnfreeze(targetAddress as `0x${string}`);
    }
  };

  const pendingCount = useMemo(() => proposals.filter(p => !p.executed).length, [proposals]);
  const executedCount = useMemo(() => proposals.filter(p => p.executed).length, [proposals]);

  // Track which proposal is being acted on
  const [activeAction, setActiveAction] = useState<{ id: number; type: 'confirm' | 'execute' } | null>(null);

  const handleConfirm = (txId: number) => {
    resetConfirm();
    setActiveAction({ id: txId, type: 'confirm' });
    confirm(txId);
  };

  const handleExecute = (txId: number) => {
    resetExecute();
    setActiveAction({ id: txId, type: 'execute' });
    execute(txId);
  };

  return (
    <Layout
      title={t('proposals.title')}
      icon={<FileText className="w-3 h-3 sm:w-4 sm:h-4 text-background" />}
      backTo="/dashboard"
      rightSlot={
        <>
          <NeonButton onClick={() => refetch()} size="sm" variant="secondary">
            <RefreshCw className="w-4 h-4" />
          </NeonButton>
          {isOwner && (
            <NeonButton onClick={() => { setShowNewProposal(true); resetSubmit(); }} size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NEW</span>
            </NeonButton>
          )}
        </>
      }
    >
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="control-panel mb-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-center">
                <div className="stat-number">{totalCount}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase mt-1">{t('proposals.total')}</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <div className="stat-number status-warning">{pendingCount}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase mt-1">{t('proposals.pending')}</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <div className="stat-number status-success">{executedCount}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase mt-1">{t('proposals.executed')}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {`Threshold: ${REQUIRED}/${TOTAL_OWNERS} | ${t('proposals.thresholdInfo')}`}
            </div>
          </div>
        </motion.div>

        {/* New Proposal Modal */}
        <AnimatePresence>
          {showNewProposal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              onClick={() => setShowNewProposal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md mx-4 control-panel"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="panel-title border-0 pb-0 mb-0 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('proposals.createProposal')}
                  </div>
                  <button onClick={() => setShowNewProposal(false)} className="p-1 hover:bg-muted/50">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="data-label mb-2">{t('proposals.type')}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setProposalType('freeze')}
                        className={cn(
                          'p-3 border transition-all text-left',
                          proposalType === 'freeze'
                            ? 'border-destructive bg-destructive/10'
                            : 'border-border hover:border-muted-foreground'
                        )}
                        style={{ borderRadius: '2px' }}
                      >
                        <div className="font-bold text-destructive font-mono uppercase text-xs">{t('proposals.freeze')}</div>
                      </button>
                      <button
                        onClick={() => setProposalType('unfreeze')}
                        className={cn(
                          'p-3 border transition-all text-left',
                          proposalType === 'unfreeze'
                            ? 'border-success bg-success/10'
                            : 'border-border hover:border-muted-foreground'
                        )}
                        style={{ borderRadius: '2px' }}
                      >
                        <div className="font-bold text-success font-mono uppercase text-xs">{t('proposals.unfreeze')}</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="data-label mb-2">{t('proposals.targetAddress')}</div>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                      className="glow-input w-full text-sm"
                    />
                    {!isValidAddress && targetAddress.length > 0 && (
                      <p className="text-xs text-destructive font-mono mt-1">{t('proposals.invalidAddress')}</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground font-mono">
                    {t('proposals.submitDesc1')} {proposalType} {t('proposals.submitDesc2')}
                  </p>

                  {submitSuccess && submitHash && (
                    <div className="p-2 bg-success/20 border border-success/30 text-success font-mono text-xs flex items-center gap-2" style={{ borderRadius: '2px' }}>
                      <CheckCircle className="w-4 h-4" />
                      {t('proposals.submitted')}{' '}
                      <a href={getExplorerUrl('tx', submitHash)} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                        {t('proposals.tx')} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {submitError && (
                    <ErrorAlert
                      message={(submitError as Error).message?.slice(0, 200) || t('common.txFailed')}
                      variant="error"
                      className="mt-2"
                    />
                  )}

                  <div className="flex gap-2 pt-2">
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowNewProposal(false)}
                    >
                      {submitSuccess ? t('proposals.close') : t('proposals.cancel')}
                    </NeonButton>
                    {!submitSuccess && (
                      <NeonButton
                        variant={proposalType === 'freeze' ? 'danger' : 'success'}
                        size="sm"
                        className="flex-1"
                        disabled={!isValidAddress || submitPending || submitConfirming}
                        onClick={handleSubmitProposal}
                      >
                        {(submitPending || submitConfirming) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('proposals.submit')
                        )}
                      </NeonButton>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Proposals List */}
        {!isLoading && (
          <div className="space-y-2">
            {proposals.length === 0 ? (
              <div className="control-panel text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <div className="font-mono uppercase text-sm mb-3">{t('proposals.noProposals')}</div>
                <p className="text-xs text-muted-foreground font-mono mb-4">
                  {t('proposals.noTxFound')}
                </p>
                {isOwner && (
                  <NeonButton onClick={() => { setShowNewProposal(true); resetSubmit(); }} size="sm">
                    <Plus className="w-4 h-4" />
                    {t('proposals.createFirst')}
                  </NeonButton>
                )}
              </div>
            ) : (
              proposals.map((proposal, index) => {
                const isActionTarget = activeAction?.id === proposal.id;
                const isConfirmingThis = isActionTarget && activeAction?.type === 'confirm' && (confirmPending || confirmConfirming);
                const isExecutingThis = isActionTarget && activeAction?.type === 'execute' && (executePending || executeConfirming);

                return (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="control-panel"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* ID Badge */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 hex-clip gradient-amber flex items-center justify-center text-xs sm:text-sm font-bold font-mono text-background flex-shrink-0">
                        #{proposal.id}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {proposal.type !== 'unknown' && (
                            <TypeBadge type={proposal.type} />
                          )}
                          {proposal.executed ? (
                            <StatusBadge status="success">{t('proposals.executedStatus')}</StatusBadge>
                          ) : (
                            <StatusBadge status="pending" pulse>{t('proposals.pendingStatus')}</StatusBadge>
                          )}
                          {proposal.type === 'unknown' && (
                            <span className="text-[10px] text-muted-foreground font-mono">{t('proposals.customTx')}</span>
                          )}
                        </div>

                        {proposal.targetAddress && (
                          <div className="data-row py-1 border-0">
                            <span className="data-label">{t('proposals.target')}</span>
                            <a
                              href={getExplorerUrl('address', proposal.targetAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              {shortenAddress(proposal.targetAddress)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {proposal.type === 'unknown' && (
                          <div className="data-row py-1 border-0">
                            <span className="data-label">{t('proposals.to')}</span>
                            <span className="font-mono text-xs text-primary">{shortenAddress(proposal.to)}</span>
                          </div>
                        )}

                        <ThresholdProgress
                          current={proposal.numConfirmations}
                          threshold={REQUIRED}
                          total={TOTAL_OWNERS}
                          className="mt-2"
                        />

                        {!proposal.executed && isOwner && (
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <NeonButton
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              disabled={proposal.numConfirmations >= REQUIRED || isConfirmingThis}
                              onClick={() => handleConfirm(proposal.id)}
                            >
                              {isConfirmingThis ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              {t('proposals.confirm')}
                            </NeonButton>
                            <NeonButton
                              variant="success"
                              size="sm"
                              className="flex-1"
                              disabled={proposal.numConfirmations < REQUIRED || isExecutingThis}
                              onClick={() => handleExecute(proposal.id)}
                            >
                              {isExecutingThis ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              {t('proposals.execute')}
                            </NeonButton>
                          </div>
                        )}

                        {proposal.executed && (
                          <div className="mt-2 flex items-center gap-1 text-success font-mono text-[10px] uppercase">
                            <CheckCircle className="w-3 h-3" />
                            {t('proposals.executedOnChain')}
                          </div>
                        )}

                        {/* Show tx hash for confirm/execute if this proposal was just acted on */}
                        {isActionTarget && confirmSuccess && confirmHash && activeAction?.type === 'confirm' && (
                          <div className="mt-2 p-2 bg-success/20 border border-success/30 text-success font-mono text-xs flex items-center gap-2" style={{ borderRadius: '2px' }}>
                            <CheckCircle className="w-3 h-3" />
                            {t('proposals.confirmed')}{' '}
                            <a href={getExplorerUrl('tx', confirmHash)} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                              {t('proposals.tx')} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {isActionTarget && executeSuccess && executeHash && activeAction?.type === 'execute' && (
                          <div className="mt-2 p-2 bg-success/20 border border-success/30 text-success font-mono text-xs flex items-center gap-2" style={{ borderRadius: '2px' }}>
                            <CheckCircle className="w-3 h-3" />
                            {t('proposals.executedDone')}{' '}
                            <a href={getExplorerUrl('tx', executeHash)} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                              {t('proposals.tx')} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {isActionTarget && confirmError && activeAction?.type === 'confirm' && (
                          <ErrorAlert
                            message={(confirmError as Error).message?.slice(0, 150) || t('proposals.confirmFailed')}
                            variant="error"
                            className="mt-2"
                          />
                        )}
                        {isActionTarget && executeError && activeAction?.type === 'execute' && (
                          <ErrorAlert
                            message={(executeError as Error).message?.slice(0, 150) || t('proposals.executeFailed')}
                            variant="error"
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </main>
    </Layout>
  );
}
