import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet, Shield, Snowflake, FileText, History,
  ExternalLink, LogOut, Terminal, Loader2, ListFilter
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard } from '@/components/ui/glass-card';
import { Layout } from '@/components/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { AddressDisplay } from '@/components/ui/address-display';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/skeleton';
import { useWallet, useMultiSigOwners, useProposals, useIsMultiSigOwner } from '@/lib/web3/hooks';
import { CONTRACTS, getExplorerUrl, kiteTestnet, shortenAddress } from '@/lib/web3/config';
import { useLanguage } from '@/lib/i18n';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type PolicyResponse = {
  allowlistCount?: number;
  maxAmount?: string | null;
  dailyLimit?: string | null;
  settlementToken?: string;
  chainId?: number;
};

const REQUIRED = 2;

export default function Dashboard() {
  const { isConnected, address, balance, symbol, isCorrectNetwork, switchToKite } = useWallet();
  const { owners, isLoading: ownersLoading } = useMultiSigOwners();
  const { isOwner } = useIsMultiSigOwner();
  const { proposals, totalCount, isLoading: proposalsLoading } = useProposals();
  const { t } = useLanguage();
  const [policy, setPolicy] = useState<PolicyResponse | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/policy`)
      .then((res) => res.json())
      .then((data) => setPolicy(data))
      .catch(() => setPolicy(null));
  }, []);

  const pendingCount = useMemo(() => proposals.filter(p => !p.executed).length, [proposals]);

  if (!isConnected) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <GlassCard className="max-w-md text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2 font-mono terminal-text uppercase">{t('dash.accessDenied')}</h2>
          <p className="text-muted-foreground mb-6 font-mono text-sm">
            {t('dash.connectPrompt')}
          </p>
          <NeonButton onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))} pulse className="w-full">
            <Wallet className="w-5 h-5" />
            {t('dash.connectWallet')}
          </NeonButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <Layout
      title={t('dash.title')}
      icon={<Terminal className="w-4 h-4 text-background" />}
      backTo="/"
      rightSlot={
        <>
          <div className="hidden md:flex items-center gap-2 terminal-card px-3 py-1.5">
            <span className="text-xs text-primary font-mono">{shortenAddress(address!)}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {parseFloat(balance).toFixed(3)} {symbol}
            </span>
            {isOwner && (
              <span className="text-[10px] text-success font-mono uppercase">{t('dash.owner')}</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))}
            className="p-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            style={{ borderRadius: '2px' }}
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </>
      }
    >
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Network Warning */}
        {!isCorrectNetwork && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="control-panel border-destructive flex items-center justify-between">
              <div>
                <span className="font-bold text-destructive font-mono uppercase text-sm">{t('dash.networkMismatch')}</span>
                <span className="text-xs text-muted-foreground font-mono ml-4">
                  {`${t('dash.switchTo')} ${kiteTestnet.name}`}
                </span>
              </div>
              <NeonButton onClick={switchToKite} variant="danger" size="sm">
                {t('dash.switch')}
              </NeonButton>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4">

          {/* Left Column */}
          <div className="space-y-4">
            {/* Multi-Sig Wallet Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="control-panel"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="panel-title flex items-center gap-2 border-0 pb-0 mb-0">
                  <Shield className="w-4 h-4" />
                  {t('dash.multisigWallet')}
                </div>
                <StatusBadge status="active">{t('dash.active')}</StatusBadge>
              </div>

              <div className="space-y-4">
                {/* Contract Info */}
                <div className="data-row">
                  <span className="data-label">{t('dash.contract')}</span>
                  <AddressDisplay address={CONTRACTS.MULTISIG} short={false} />
                </div>

                {/* Threshold */}
                <div>
                  <div className="data-label mb-2">{t('dash.threshold')}</div>
                  <ThresholdProgress
                    current={REQUIRED}
                    threshold={REQUIRED}
                    total={owners ? owners.length : 3}
                  />
                </div>

                {/* Owners - from chain */}
                <div>
                  <div className="data-label mb-2">{t('dash.owners')}</div>
                  {ownersLoading ? (
                    <SkeletonText lines={3} className="space-y-2" />
                  ) : owners ? (
                    <div className="tree-list">
                      {owners.map((owner, index) => (
                        <div key={owner} className="tree-item">
                          <span className="text-muted-foreground">#{index + 1}</span>
                          <a
                            href={getExplorerUrl('address', owner)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {shortenAddress(owner)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {owner.toLowerCase() === address?.toLowerCase() && (
                            <span className="text-[10px] text-success font-mono">(YOU)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground font-mono">{t('dash.failedOwners')}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link to="/proposals" className="flex-1">
                    <NeonButton variant="secondary" size="sm" className="w-full">
                      <FileText className="w-4 h-4" />
                      {t('dash.proposals')}
                    </NeonButton>
                  </Link>
                  <NeonButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl('address', CONTRACTS.MULTISIG), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </NeonButton>
                </div>
              </div>
            </motion.div>

            {/* Freeze Contract Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="control-panel"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="panel-title flex items-center gap-2 border-0 pb-0 mb-0">
                  <Snowflake className="w-4 h-4" />
                  {t('dash.freezeContract')}
                </div>
              </div>

              {/* Contract Info */}
              <div className="data-row">
                <span className="data-label">{t('dash.contract')}</span>
                <AddressDisplay address={CONTRACTS.FREEZE} short={false} />
              </div>

              <p className="text-xs text-muted-foreground font-mono mt-3">
                {t('dash.freezeDesc')}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Link to="/freeze" className="flex-1">
                  <NeonButton variant="danger" size="sm" className="w-full">
                    <Snowflake className="w-4 h-4" />
                    {t('dash.freezeControl')}
                  </NeonButton>
                </Link>
                <NeonButton
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(getExplorerUrl('address', CONTRACTS.FREEZE), '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </NeonButton>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-4 lg:gap-0">
            {/* Quick Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="control-panel"
            >
              <div className="panel-title">{t('dash.quickStatus')}</div>
              <div className="space-y-0">
                <div className="inline-stat">
                  <span className="inline-stat-label">{t('dash.threshold')}</span>
                  <span className="inline-stat-value">{REQUIRED}/{owners ? owners.length : 3}</span>
                </div>
                <div className="inline-stat">
                  <span className="inline-stat-label">{t('dash.proposalCount')}</span>
                  <span className="inline-stat-value">
                    {proposalsLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : totalCount}
                  </span>
                </div>
                <div className="inline-stat">
                  <span className="inline-stat-label">{t('dash.pending')}</span>
                  <span className="inline-stat-value">
                    {proposalsLoading ? <Skeleton className="h-5 w-8 inline-block" /> : pendingCount}
                  </span>
                </div>
                <div className="inline-stat">
                  <span className="inline-stat-label">{t('dash.youAreOwner')}</span>
                  <span className={`inline-stat-value ${isOwner ? 'text-success' : 'text-muted-foreground'}`}>
                    {isOwner ? t('dash.yes') : t('dash.no')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Policy (Backend API) */}
            {policy != null && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="control-panel"
              >
                <div className="panel-title flex items-center gap-2">
                  <ListFilter className="w-4 h-4" />
                  {t('dash.policyApi')}
                </div>
                <div className="space-y-0">
                  <div className="inline-stat">
                    <span className="inline-stat-label">{t('dash.allowlist')}</span>
                    <span className="inline-stat-value">{policy.allowlistCount ?? 0} {t('dash.addresses')}</span>
                  </div>
                  <div className="inline-stat">
                    <span className="inline-stat-label">{t('dash.maxAmount')}</span>
                    <span className="inline-stat-value">{policy.maxAmount ?? '—'}</span>
                  </div>
                  <div className="inline-stat">
                    <span className="inline-stat-label">{t('dash.dailyLimit')}</span>
                    <span className="inline-stat-value">{policy.dailyLimit ?? '—'}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="control-panel"
            >
              <div className="panel-title">{t('dash.quickActions')}</div>
              <div className="button-stack">
                <Link to="/freeze">
                  <NeonButton variant="danger" size="sm" className="w-full justify-start">
                    <Snowflake className="w-4 h-4" />
                    {t('dash.freezeAddress')}
                  </NeonButton>
                </Link>
                <Link to="/proposals">
                  <NeonButton variant="secondary" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4" />
                    {t('dash.viewProposals')}
                  </NeonButton>
                </Link>
                <Link to="/pay">
                  <NeonButton variant="secondary" size="sm" className="w-full justify-start">
                    <Wallet className="w-4 h-4" />
                    {t('dash.pay')}
                  </NeonButton>
                </Link>
                <Link to="/history">
                  <NeonButton variant="secondary" size="sm" className="w-full justify-start">
                    <History className="w-4 h-4" />
                    {t('dash.viewHistory')}
                  </NeonButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
