import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, ArrowLeft, Plus, Check, Play,
  CheckCircle, X, Loader2, ExternalLink, RefreshCw
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { NeonButton } from '@/components/ui/neon-button';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { StatusBadge, TypeBadge, NetworkBadge } from '@/components/ui/status-badge';
import {
  useWallet, useProposals, useIsMultiSigOwner, useSubmitProposal,
  useConfirmTransaction, useExecuteTransaction,
} from '@/lib/web3/hooks';
import { kiteTestnet, shortenAddress, getExplorerUrl } from '@/lib/web3/config';
import { cn } from '@/lib/utils';

const REQUIRED = 2;
const TOTAL_OWNERS = 3;

export default function ProposalsPage() {
  const { isConnected } = useWallet();
  const { isOwner } = useIsMultiSigOwner();
  const { proposals, totalCount, isLoading, refetch } = useProposals();
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

  const pendingCount = proposals.filter(p => !p.executed).length;
  const executedCount = proposals.filter(p => p.executed).length;

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
    <div className="relative min-h-screen">
      <ParticleBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 terminal-card border-x-0 border-t-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                style={{ borderRadius: '2px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 hex-clip gradient-amber flex items-center justify-center">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-background" />
              </div>
              <span className="text-sm sm:text-lg font-bold font-mono terminal-text uppercase">Proposals</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
            </div>
            <NeonButton onClick={() => refetch()} size="sm" variant="secondary">
              <RefreshCw className="w-4 h-4" />
            </NeonButton>
            {isOwner && (
              <NeonButton onClick={() => { setShowNewProposal(true); resetSubmit(); }} size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">NEW</span>
              </NeonButton>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="control-panel mb-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold terminal-text font-mono">{totalCount}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Total</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary font-mono">{pendingCount}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Pending</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-success font-mono">{executedCount}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Executed</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Threshold: {REQUIRED}/{TOTAL_OWNERS} | On-chain data
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
                    Create Proposal (On-Chain)
                  </div>
                  <button onClick={() => setShowNewProposal(false)} className="p-1 hover:bg-muted/50">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="data-label mb-2">Type</div>
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
                        <div className="font-bold text-destructive font-mono uppercase text-xs">FREEZE</div>
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
                        <div className="font-bold text-success font-mono uppercase text-xs">UNFREEZE</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="data-label mb-2">Target Address</div>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                      className="glow-input w-full text-sm"
                    />
                    {!isValidAddress && targetAddress.length > 0 && (
                      <p className="text-xs text-destructive font-mono mt-1">Invalid address format</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground font-mono">
                    This will call <code className="text-primary">submitAndConfirm()</code> on the MultiSig contract,
                    which submits a proposal to {proposalType} the target address and auto-confirms with your signature.
                  </p>

                  {submitSuccess && submitHash && (
                    <div className="p-2 bg-success/20 border border-success/30 text-success font-mono text-xs flex items-center gap-2" style={{ borderRadius: '2px' }}>
                      <CheckCircle className="w-4 h-4" />
                      Proposal submitted!{' '}
                      <a href={getExplorerUrl('tx', submitHash)} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                        View TX <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-2 bg-destructive/20 border border-destructive/30 text-destructive font-mono text-xs" style={{ borderRadius: '2px' }}>
                      {(submitError as Error).message?.slice(0, 200) || 'Transaction failed'}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowNewProposal(false)}
                    >
                      {submitSuccess ? 'CLOSE' : 'CANCEL'}
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
                          'SUBMIT'
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
          <div className="control-panel text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <div className="font-mono uppercase text-sm text-muted-foreground">Loading on-chain proposals...</div>
          </div>
        )}

        {/* Proposals List */}
        {!isLoading && (
          <div className="space-y-2">
            {proposals.length === 0 ? (
              <div className="control-panel text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <div className="font-mono uppercase text-sm mb-3">No Proposals Found</div>
                <p className="text-xs text-muted-foreground font-mono mb-4">
                  No transactions found on the MultiSig contract.
                </p>
                {isOwner && (
                  <NeonButton onClick={() => { setShowNewProposal(true); resetSubmit(); }} size="sm">
                    <Plus className="w-4 h-4" />
                    CREATE FIRST
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
                            <StatusBadge status="success">EXECUTED</StatusBadge>
                          ) : (
                            <StatusBadge status="pending" pulse>PENDING</StatusBadge>
                          )}
                          {proposal.type === 'unknown' && (
                            <span className="text-[10px] text-muted-foreground font-mono">CUSTOM TX</span>
                          )}
                        </div>

                        {proposal.targetAddress && (
                          <div className="data-row py-1 border-0">
                            <span className="data-label">Target</span>
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
                            <span className="data-label">To</span>
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
                              CONFIRM
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
                              EXECUTE
                            </NeonButton>
                          </div>
                        )}

                        {proposal.executed && (
                          <div className="mt-2 flex items-center gap-1 text-success font-mono text-[10px] uppercase">
                            <CheckCircle className="w-3 h-3" />
                            Executed on-chain
                          </div>
                        )}

                        {/* Show tx hash for confirm/execute if this proposal was just acted on */}
                        {isActionTarget && confirmSuccess && confirmHash && activeAction?.type === 'confirm' && (
                          <div className="mt-2 p-2 bg-success/20 border border-success/30 text-success font-mono text-xs flex items-center gap-2" style={{ borderRadius: '2px' }}>
                            <CheckCircle className="w-3 h-3" />
                            Confirmed.{' '}
                            <a href={getExplorerUrl('tx', confirmHash)} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                              TX <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {isActionTarget && executeSuccess && executeHash && activeAction?.type === 'execute' && (
                          <div className="mt-2 p-2 bg-success/20 border border-success/30 text-success font-mono text-xs flex items-center gap-2" style={{ borderRadius: '2px' }}>
                            <CheckCircle className="w-3 h-3" />
                            Executed.{' '}
                            <a href={getExplorerUrl('tx', executeHash)} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                              TX <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {isActionTarget && confirmError && activeAction?.type === 'confirm' && (
                          <div className="mt-2 p-2 bg-destructive/20 border border-destructive/30 text-destructive font-mono text-xs" style={{ borderRadius: '2px' }}>
                            {(confirmError as Error).message?.slice(0, 150) || 'Confirm failed'}
                          </div>
                        )}
                        {isActionTarget && executeError && activeAction?.type === 'execute' && (
                          <div className="mt-2 p-2 bg-destructive/20 border border-destructive/30 text-destructive font-mono text-xs" style={{ borderRadius: '2px' }}>
                            {(executeError as Error).message?.slice(0, 150) || 'Execute failed'}
                          </div>
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
    </div>
  );
}
