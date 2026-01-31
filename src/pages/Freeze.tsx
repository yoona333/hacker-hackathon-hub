import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Snowflake, Search,
  CheckCircle, XCircle, AlertTriangle, Lock, Unlock, Loader2, ExternalLink
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useWallet, useFreezeStatus, useSubmitProposal, useIsMultiSigOwner } from '@/lib/web3/hooks';
import { shortenAddress, getExplorerUrl } from '@/lib/web3/config';

export default function FreezePage() {
  const { isConnected } = useWallet();
  const { isOwner } = useIsMultiSigOwner();
  const [searchAddress, setSearchAddress] = useState('');
  const [checkedAddress, setCheckedAddress] = useState<string | undefined>();

  const { isFrozen, isLoading: freezeLoading, refetch: refetchFreeze } = useFreezeStatus(checkedAddress);
  const {
    submitFreeze, submitUnfreeze,
    hash: proposalHash, isPending, isConfirming, isSuccess,
    error: submitError, reset: resetSubmit,
  } = useSubmitProposal();

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(searchAddress);

  const handleSearch = () => {
    if (!isValidAddress) return;
    setCheckedAddress(searchAddress);
  };

  const handleAction = () => {
    if (!checkedAddress || !isValidAddress) return;
    resetSubmit();
    if (isFrozen) {
      submitUnfreeze(checkedAddress as `0x${string}`);
    } else {
      submitFreeze(checkedAddress as `0x${string}`);
    }
  };

  // Refetch freeze status after successful proposal submission
  useEffect(() => {
    if (isSuccess) {
      refetchFreeze();
    }
  }, [isSuccess, refetchFreeze]);

  return (
    <Layout
      title="Freeze"
      icon={<Snowflake className="w-4 h-4 text-background" />}
      backTo="/dashboard"
    >
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">

          {/* Left - Search & Result */}
          <div className="space-y-4">
            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="control-panel"
            >
              <div className="panel-title flex items-center gap-2">
                <Search className="w-4 h-4" />
                Address Status Check (On-Chain)
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... Enter address to check on-chain"
                  value={searchAddress}
                  onChange={(e) => {
                    setSearchAddress(e.target.value);
                    setCheckedAddress(undefined);
                    resetSubmit();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="glow-input flex-1 text-sm"
                />
                <NeonButton
                  onClick={handleSearch}
                  disabled={freezeLoading || !isValidAddress}
                  size="sm"
                >
                  {freezeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      SCAN
                    </>
                  )}
                </NeonButton>
              </div>

              {!isValidAddress && searchAddress.length > 0 && (
                <p className="text-xs text-destructive font-mono mt-2">Invalid Ethereum address format</p>
              )}

              {/* Search Result */}
              <AnimatePresence mode="wait">
                {checkedAddress && !freezeLoading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-primary">{shortenAddress(checkedAddress, 8)}</span>
                      <StatusBadge
                        status={isFrozen ? 'frozen' : 'active'}
                        pulse
                      >
                        {isFrozen ? 'FROZEN' : 'ACTIVE'}
                      </StatusBadge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 mb-3" style={{ borderRadius: '2px' }}>
                      {isFrozen ? (
                        <>
                          <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                          <div>
                            <div className="font-bold text-destructive font-mono uppercase text-sm">Blocked</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              On-chain freeze detected. All AgentPayGuard transfers blocked.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-8 h-8 text-success flex-shrink-0" />
                          <div>
                            <div className="font-bold text-success font-mono uppercase text-sm">Active</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              Address is not frozen on-chain. Transactions allowed.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {isConnected && isOwner ? (
                      <NeonButton
                        variant={isFrozen ? 'success' : 'danger'}
                        onClick={handleAction}
                        disabled={isPending || isConfirming}
                        className="w-full"
                        size="sm"
                      >
                        {(isPending || isConfirming) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isFrozen ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            SUBMIT UNFREEZE PROPOSAL
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            SUBMIT FREEZE PROPOSAL
                          </>
                        )}
                      </NeonButton>
                    ) : isConnected ? (
                      <div className="text-xs text-muted-foreground font-mono p-2 border border-border/50 text-center" style={{ borderRadius: '2px' }}>
                        Only multi-sig owners can submit proposals.
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground font-mono p-2 border border-border/50 text-center" style={{ borderRadius: '2px' }}>
                        Connect wallet to submit proposals.
                      </div>
                    )}

                    {isSuccess && proposalHash && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-2 bg-success/20 border border-success/30 flex items-center gap-2 text-success font-mono text-xs"
                        style={{ borderRadius: '2px' }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="uppercase">Proposal submitted & confirmed.</span>
                        <a
                          href={getExplorerUrl('tx', proposalHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline"
                        >
                          View TX <ExternalLink className="w-3 h-3" />
                        </a>
                      </motion.div>
                    )}

                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-2 bg-destructive/20 border border-destructive/30 text-destructive font-mono text-xs"
                        style={{ borderRadius: '2px' }}
                      >
                        {(submitError as Error).message?.slice(0, 200) || 'Transaction failed'}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="control-panel border-primary/30"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-primary font-mono uppercase text-xs mb-1">Multi-Sig Required</div>
                  <p className="text-xs text-muted-foreground font-mono">
                    All freeze/unfreeze operations require 2/3 multi-sig confirmations.
                    Proposals are submitted via SimpleMultiSig and auto-confirmed by the submitter.
                    A second owner must confirm before execution.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right - Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="control-panel"
          >
            <div className="panel-title flex items-center gap-2 border-0 pb-0 mb-3">
              <Snowflake className="w-4 h-4" />
              How It Works
            </div>

            <div className="space-y-3 text-xs font-mono text-muted-foreground">
              <div className="p-2 border border-border/50" style={{ borderRadius: '2px' }}>
                <span className="text-primary font-bold">1.</span> Enter an address above to check its on-chain freeze status via the SimpleFreeze contract.
              </div>
              <div className="p-2 border border-border/50" style={{ borderRadius: '2px' }}>
                <span className="text-primary font-bold">2.</span> If you are a multi-sig owner, you can submit a freeze or unfreeze proposal. This calls <code className="text-primary">submitAndConfirm()</code> on the MultiSig.
              </div>
              <div className="p-2 border border-border/50" style={{ borderRadius: '2px' }}>
                <span className="text-primary font-bold">3.</span> Once 2 of 3 owners confirm, any owner can execute. The MultiSig then calls <code className="text-primary">freeze()</code> or <code className="text-primary">unfreeze()</code> on the Freeze contract.
              </div>
              <div className="p-2 border border-border/50" style={{ borderRadius: '2px' }}>
                <span className="text-primary font-bold">4.</span> Frozen addresses are automatically blocked by AgentPayGuard's policy engine when processing payments.
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <Link to="/proposals">
                <NeonButton variant="secondary" size="sm" className="w-full">
                  VIEW ALL PROPOSALS
                </NeonButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}
