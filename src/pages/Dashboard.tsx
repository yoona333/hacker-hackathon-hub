import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet, Shield, Snowflake, FileText, History,
  ExternalLink, LogOut, Terminal, Loader2, ListFilter, Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard } from '@/components/ui/glass-card';
import { Layout } from '@/components/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { AddressDisplay } from '@/components/ui/address-display';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { RadialProgress } from '@/components/ui/radial-progress';
import { useWallet, useMultiSigOwners, useProposals, useIsMultiSigOwner } from '@/lib/web3/hooks';
import { CONTRACTS, getExplorerUrl, kiteTestnet, shortenAddress } from '@/lib/web3/config';
import { useLanguage } from '@/lib/i18n';
import { useConnect } from 'wagmi';

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
  const { connect, connectors, isPending: isConnecting } = useConnect();

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
          <NeonButton 
            onClick={() => {
              const c = connectors[0];
              if (c) {
                connect({ connector: c });
              }
            }}
            disabled={isConnecting || connectors.length === 0}
            pulse 
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                {t('dash.connectWallet')}
              </>
            )}
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
            {/* Multi-Sig Wallet Panel - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="control-panel group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="panel-title flex items-center gap-2 border-0 pb-0 mb-0">
                  <motion.div
                    className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Shield className="w-4 h-4 text-background" />
                  </motion.div>
                  {t('dash.multisigWallet')}
                </div>
                <StatusBadge status="active" pulse>{t('dash.active')}</StatusBadge>
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

            {/* Freeze Contract Panel - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="control-panel group border-danger/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="panel-title flex items-center gap-2 border-0 pb-0 mb-0">
                  <motion.div
                    className="w-8 h-8 rounded-lg gradient-danger flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Snowflake className="w-4 h-4 text-background" />
                  </motion.div>
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
            {/* Quick Status - Enhanced with StatCards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label={t('dash.proposalCount')}
                  value={proposalsLoading ? '...' : totalCount}
                  icon={<FileText className="w-4 h-4" />}
                  color="primary"
                />
                <StatCard
                  label={t('dash.pending')}
                  value={proposalsLoading ? '...' : pendingCount}
                  icon={<AlertCircle className="w-4 h-4" />}
                  color="warning"
                  pulse={pendingCount > 0}
                />
              </div>
              
              {/* Threshold Visualization */}
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'hsl(var(--primary) / 0.5)' }}
                className="control-panel p-4 border border-primary/30 bg-primary/5 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-muted-foreground">{t('dash.threshold')}</span>
                  <span className="text-sm font-bold text-primary">{REQUIRED}/{owners ? owners.length : 3}</span>
                </div>
                <RadialProgress 
                  value={(REQUIRED / (owners ? owners.length : 3)) * 100} 
                  size="sm" 
                  color="success" 
                  showLabel={false} 
                  className="mx-auto"
                />
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {isOwner ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span className="text-success font-mono">{t('dash.youAreOwner')}: {t('dash.yes')}</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground font-mono">{t('dash.youAreOwner')}: {t('dash.no')}</span>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Policy (Backend API) - Enhanced */}
            {policy != null && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.01 }}
                className="control-panel group"
              >
                <div className="panel-title flex items-center gap-2">
                  <motion.div
                    className="w-6 h-6 rounded gradient-terminal flex items-center justify-center"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListFilter className="w-3 h-3 text-background" />
                  </motion.div>
                  {t('dash.policyApi')}
                </div>
                <div className="space-y-2 mt-3">
                  <motion.div 
                    whileHover={{ x: 4, borderColor: 'hsl(var(--primary) / 0.5)' }}
                    className="p-2 rounded border border-border/50 bg-muted/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{t('dash.allowlist')}</span>
                      <span className="text-sm font-bold text-primary font-mono">{policy.allowlistCount ?? 0} {t('dash.addresses')}</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 4, borderColor: 'hsl(var(--primary) / 0.5)' }}
                    className="p-2 rounded border border-border/50 bg-muted/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{t('dash.maxAmount')}</span>
                      <span className="text-sm font-bold text-primary font-mono">{policy.maxAmount ?? '—'}</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 4, borderColor: 'hsl(var(--primary) / 0.5)' }}
                    className="p-2 rounded border border-border/50 bg-muted/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{t('dash.dailyLimit')}</span>
                      <span className="text-sm font-bold text-primary font-mono">{policy.dailyLimit ?? '—'}</span>
                    </div>
                  </motion.div>
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
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <NeonButton variant="danger" size="sm" className="w-full justify-start">
                      <Snowflake className="w-4 h-4" />
                      {t('dash.freezeAddress')}
                    </NeonButton>
                  </motion.div>
                </Link>
                <Link to="/proposals">
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <NeonButton variant="secondary" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4" />
                      {t('dash.viewProposals')}
                    </NeonButton>
                  </motion.div>
                </Link>
                <Link to="/pay">
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <NeonButton variant="secondary" size="sm" className="w-full justify-start">
                      <Wallet className="w-4 h-4" />
                      {t('dash.pay')}
                    </NeonButton>
                  </motion.div>
                </Link>
                <Link to="/history">
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <NeonButton variant="secondary" size="sm" className="w-full justify-start">
                      <History className="w-4 h-4" />
                      {t('dash.viewHistory')}
                    </NeonButton>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
