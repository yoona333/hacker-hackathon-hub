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
import { useLanguage } from '@/lib/i18n';

export default function FreezePage() {
  const { isConnected } = useWallet();
  const { isOwner } = useIsMultiSigOwner();
  const { t } = useLanguage();
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
      title={t('freeze.title')}
      icon={<Snowflake className="w-4 h-4 text-background" />}
      backTo="/"
    >
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
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
                {t('freeze.addressCheck')}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('freeze.placeholder')}
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
                <p className="text-xs text-destructive font-mono mt-2">{t('freeze.invalidAddress')}</p>
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
                        {isFrozen ? t('freeze.frozen') : t('freeze.activeLabel')}
                      </StatusBadge>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 mb-3 ${
                        isFrozen 
                          ? 'border-destructive/50 bg-destructive/10 shadow-glow-red' 
                          : 'border-success/50 bg-success/10 shadow-glow-emerald'
                      }`}
                    >
                      {isFrozen ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 rounded-full gradient-danger flex items-center justify-center flex-shrink-0"
                          >
                            <XCircle className="w-8 h-8 text-background" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold text-destructive font-mono uppercase text-lg mb-1">{t('freeze.blocked')}</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {t('freeze.blockedDesc')}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0"
                          >
                            <CheckCircle className="w-8 h-8 text-background" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold text-success font-mono uppercase text-lg mb-1">{t('freeze.activeStatus')}</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {t('freeze.activeDesc')}
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>

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
                            {t('freeze.submitUnfreeze')}
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            {t('freeze.submitFreeze')}
                          </>
                        )}
                      </NeonButton>
                    ) : isConnected ? (
                      <div className="text-xs text-muted-foreground font-mono p-2 border border-border/50 text-center" style={{ borderRadius: '2px' }}>
                        {t('freeze.ownerOnly')}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground font-mono p-2 border border-border/50 text-center" style={{ borderRadius: '2px' }}>
                        {t('freeze.connectFirst')}
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
                        <span className="uppercase">{t('freeze.proposalSubmitted')}</span>
                        <a
                          href={getExplorerUrl('tx', proposalHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline"
                        >
                          {t('freeze.viewTx')} <ExternalLink className="w-3 h-3" />
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
                        {(submitError as Error).message?.slice(0, 200) || t('freeze.txFailed')}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Warning - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="control-panel border-warning/50 bg-warning/5"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-lg gradient-amber flex items-center justify-center flex-shrink-0"
                >
                  <AlertTriangle className="w-5 h-5 text-background" />
                </motion.div>
                <div className="flex-1">
                  <div className="font-bold text-warning font-mono uppercase text-sm mb-2">{t('freeze.multisigRequired')}</div>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                    {t('freeze.multisigDesc')}
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
                <motion.div
                  className="w-8 h-8 rounded-lg gradient-danger flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Snowflake className="w-4 h-4 text-background" />
                </motion.div>
                {t('freeze.howItWorks')}
              </div>

            <div className="space-y-3">
              {[
                { num: 1, text: t('freeze.step1') },
                { num: 2, text: t('freeze.step2') },
                { num: 3, text: t('freeze.step3') },
                { num: 4, text: t('freeze.step4') },
              ].map((step, idx) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ x: 4, borderColor: 'hsl(var(--primary) / 0.5)' }}
                  className="p-3 rounded-lg border border-border/50 bg-muted/20 transition-all"
                >
                  <span className="text-primary font-bold font-mono mr-2">{step.num}.</span>
                  <span className="text-xs font-mono text-muted-foreground">{step.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <Link to="/proposals">
                <NeonButton variant="secondary" size="sm" className="w-full">
                  {t('freeze.viewAllProposals')}
                </NeonButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}
