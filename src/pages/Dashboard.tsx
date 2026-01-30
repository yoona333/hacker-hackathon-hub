import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Wallet, Shield, Snowflake, FileText, History, 
  ExternalLink, Zap, ArrowLeft, LogOut, Terminal
} from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard, StatCard, NeonBorderCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { AddressDisplay, OwnerAvatars } from '@/components/ui/address-display';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { NetworkBadge, StatusBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { CONTRACTS, MOCK_DATA, getExplorerUrl, kiteTestnet } from '@/lib/web3/config';

export default function Dashboard() {
  const { open } = useAppKit();
  const { isConnected, address, balance, symbol, isCorrectNetwork, switchToKite } = useWallet();

  if (!isConnected) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <GlassCard className="max-w-md text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2 font-mono terminal-text uppercase">Access Denied</h2>
          <p className="text-muted-foreground mb-6 font-mono text-sm">
            Connect your wallet to access the security terminal.
          </p>
          <NeonButton onClick={() => open()} pulse className="w-full">
            <Wallet className="w-5 h-5" />
            CONNECT WALLET
          </NeonButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 terminal-card border-x-0 border-t-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                style={{ borderRadius: '2px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 hex-clip gradient-amber flex items-center justify-center">
                <Terminal className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold font-mono terminal-text uppercase">Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NetworkBadge connected={isCorrectNetwork} chainName={kiteTestnet.name} />
            <div className="terminal-card px-4 py-2 flex items-center gap-3">
              <AddressDisplay address={address!} showExplorer={false} />
              <span className="text-sm text-muted-foreground font-mono">
                {parseFloat(balance).toFixed(4)} {symbol}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => open()}
              className="p-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              style={{ borderRadius: '2px' }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Network Warning */}
        {!isCorrectNetwork && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard glow="red" className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-destructive font-mono uppercase">⚠ NETWORK MISMATCH</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Switch to {kiteTestnet.name} to continue operations
                </p>
              </div>
              <NeonButton onClick={switchToKite} variant="danger">
                SWITCH NETWORK
              </NeonButton>
            </GlassCard>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Threshold"
            value={`${MOCK_DATA.threshold}/${MOCK_DATA.owners.length}`}
            subtitle="Required confirmations"
            icon={<Shield className="w-5 h-5 text-background" />}
            glow="amber"
          />
          <StatCard
            title="Frozen"
            value={MOCK_DATA.frozenAddresses.length}
            subtitle="Blocked addresses"
            icon={<Snowflake className="w-5 h-5 text-background" />}
            glow="emerald"
          />
          <StatCard
            title="Pending"
            value={MOCK_DATA.proposals.filter(p => !p.executed).length}
            subtitle="Awaiting action"
            icon={<FileText className="w-5 h-5 text-background" />}
            glow="amber"
          />
          <StatCard
            title="Transactions"
            value={MOCK_DATA.transactions.length}
            subtitle="All time"
            icon={<History className="w-5 h-5 text-background" />}
            glow="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Multi-Sig Wallet Card */}
          <NeonBorderCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 font-mono uppercase">
                <Shield className="w-5 h-5 text-primary" />
                Multi-Sig Wallet
              </h2>
              <StatusBadge status="active">ACTIVE</StatusBadge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Contract Address</label>
                <AddressDisplay address={CONTRACTS.MULTISIG} short={false} className="mt-1" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-mono uppercase tracking-wider">Threshold Progress</label>
                <ThresholdProgress 
                  current={MOCK_DATA.threshold} 
                  threshold={MOCK_DATA.threshold} 
                  total={MOCK_DATA.owners.length} 
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-mono uppercase tracking-wider">Authorized Owners</label>
                <div className="flex items-center gap-4">
                  <OwnerAvatars owners={MOCK_DATA.owners} />
                  <span className="text-sm text-muted-foreground font-mono">
                    {MOCK_DATA.owners.length} registered
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {MOCK_DATA.owners.map((owner, index) => (
                    <div key={owner} className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <AddressDisplay address={owner} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/proposals" className="flex-1">
                <NeonButton variant="secondary" className="w-full">
                  <FileText className="w-4 h-4" />
                  PROPOSALS
                </NeonButton>
              </Link>
              <NeonButton 
                variant="secondary"
                onClick={() => window.open(getExplorerUrl('address', CONTRACTS.MULTISIG), '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </NeonButton>
            </div>
          </NeonBorderCard>

          {/* Freeze Contract Card */}
          <NeonBorderCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 font-mono uppercase">
                <Snowflake className="w-5 h-5 text-accent" />
                Freeze Contract
              </h2>
              <StatusBadge status="active">ACTIVE</StatusBadge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Contract Address</label>
                <AddressDisplay address={CONTRACTS.FREEZE} short={false} className="mt-1" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Frozen Count</label>
                <div className="mt-2 p-4 bg-muted/30 border border-border/50" style={{ borderRadius: '2px' }}>
                  <motion.span 
                    className="text-4xl font-bold terminal-text font-mono"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {MOCK_DATA.frozenAddresses.length}
                  </motion.span>
                  <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">addresses blocked</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-mono uppercase tracking-wider">Recent Frozen</label>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {MOCK_DATA.frozenAddresses.slice(0, 3).map((addr) => (
                    <div key={addr} className="flex items-center justify-between">
                      <AddressDisplay address={addr} />
                      <StatusBadge status="frozen">FROZEN</StatusBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/freeze" className="flex-1">
                <NeonButton variant="danger" className="w-full">
                  <Snowflake className="w-4 h-4" />
                  FREEZE CONTROL
                </NeonButton>
              </Link>
              <NeonButton 
                variant="secondary"
                onClick={() => window.open(getExplorerUrl('address', CONTRACTS.FREEZE), '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </NeonButton>
            </div>
          </NeonBorderCard>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h3 className="text-lg font-bold mb-4 font-mono uppercase tracking-wider">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link to="/freeze">
              <GlassCard glow="red" className="text-center cursor-pointer">
                <Snowflake className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <span className="font-medium font-mono uppercase text-sm">Freeze</span>
              </GlassCard>
            </Link>
            <Link to="/freeze">
              <GlassCard glow="emerald" className="text-center cursor-pointer">
                <Snowflake className="w-8 h-8 mx-auto mb-2 text-success" />
                <span className="font-medium font-mono uppercase text-sm">Unfreeze</span>
              </GlassCard>
            </Link>
            <Link to="/proposals">
              <GlassCard glow="amber" className="text-center cursor-pointer">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <span className="font-medium font-mono uppercase text-sm">New Proposal</span>
              </GlassCard>
            </Link>
            <Link to="/history">
              <GlassCard glow="amber" className="text-center cursor-pointer">
                <History className="w-8 h-8 mx-auto mb-2 text-primary" />
                <span className="font-medium font-mono uppercase text-sm">History</span>
              </GlassCard>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
