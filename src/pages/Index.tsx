import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, Snowflake, Zap, Terminal, ChevronRight, Shield, TrendingUp, DollarSign, Activity, Send, MessageCircle, FileText } from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { HolographicShield } from '@/components/HolographicShield';
import { NeonButton } from '@/components/ui/neon-button';
import { NetworkBadge } from '@/components/ui/status-badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { WalletButton } from '@/components/WalletButton';
import { StatCard } from '@/components/ui/stat-card';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { RadialProgress } from '@/components/ui/radial-progress';
import { useWallet, useProposals } from '@/lib/web3/hooks';
import { useLanguage } from '@/lib/i18n';
import { kiteTestnet } from '@/lib/web3/config';

const getCapabilities = (t: (key: string) => string) => [
  {
    id: '00',
    title: t('home.cap.pay'),
    description: t('home.cap.payDesc'),
    href: '/pay',
    icon: Send,
    gradient: 'gradient-amber',
  },
  {
    id: '01',
    title: t('home.cap.aiChat'),
    description: t('home.cap.aiChatDesc'),
    href: '/ai-chat',
    icon: MessageCircle,
    gradient: 'gradient-primary',
  },
  {
    id: '02',
    title: t('home.cap.multisig'),
    description: t('home.cap.multisigDesc'),
    href: '/dashboard',
    icon: Shield,
    gradient: 'gradient-emerald',
  },
  {
    id: '03',
    title: t('home.cap.freeze'),
    description: t('home.cap.freezeDesc'),
    href: '/freeze',
    icon: Snowflake,
    gradient: 'gradient-danger',
  },
  {
    id: '04',
    title: t('home.cap.proposals'),
    description: t('home.cap.proposalsDesc'),
    href: '/proposals',
    icon: FileText,
    gradient: 'gradient-terminal',
  },
];

// Typewriter effect component
function TypewriterText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05, duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span 
        className="inline-block w-2 h-4 bg-primary ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.span>
  );
}

// Terminal status line
function StatusLine({ label, value, status = 'normal' }: { 
  label: string; 
  value: string; 
  status?: 'normal' | 'success' | 'warning';
}) {
  return (
    <div className="terminal-line">
      <span className="text-muted-foreground">{label}:</span>
      <span className={
        status === 'success' ? 'text-success' : 
        status === 'warning' ? 'text-primary' : 
        'text-foreground'
      }>
        {value}
      </span>
    </div>
  );
}

export default function Index() {
  const { isConnected } = useWallet();
  const { t } = useLanguage();
  const capabilities = getCapabilities(t);
  const { proposals, totalCount, isLoading: proposalsLoading } = useProposals();
  
  // Calculate statistics with useMemo
  const stats = useMemo(() => {
    const executed = proposals.filter(p => p.executed).length;
    const pending = proposals.filter(p => !p.executed).length;
    // Simple mock: assume 12 transactions today, 3 new
    const todayCount = 12;
    const newToday = 3;
    
    return {
      total: totalCount,
      executed,
      pending,
      todayCount,
      newToday,
    };
  }, [proposals, totalCount]);
  
  // Generate activity timeline from proposals
  const activities = useMemo(() => {
    return proposals.slice(0, 5).map((p, idx) => ({
      id: `activity-${p.id}`,
      type: p.executed ? 'success' as const : 'pending' as const,
      title: p.executed ? 'Transaction Executed' : 'Transaction Pending',
      time: `${idx + 1} hour${idx !== 0 ? 's' : ''} ago`,
      hash: p.to,
    }));
  }, [proposals]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 terminal-card border-x-0 border-t-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Logo - 盾牌图标，符合支付安全主题 */}
            <motion.div
              className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center shadow-glow-emerald"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="w-5 h-5 text-background" />
            </motion.div>
            <span className="text-lg font-bold font-mono terminal-text">{t('home.title')}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <LanguageToggle />
            <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
            <WalletButton />
          </motion.div>
        </div>
      </header>

      {/* Main Content - Split Screen Layout */}
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-12 sm:pb-16 min-h-screen">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center min-h-[calc(100vh-10rem)]">
          
          {/* Left Side - Holographic Shield Visual + Real-time Stats (hidden on mobile, shown on lg+) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:flex flex-col items-center justify-center gap-8"
          >
            <HolographicShield />
            
            {/* Real-time Statistics Panel */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full space-y-4"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Today"
                    value={stats.todayCount}
                    trend={`+${stats.newToday}`}
                    icon={<TrendingUp className="w-4 h-4" />}
                    color="success"
                    pulse={stats.newToday > 0}
                  />
                  <StatCard
                    label="Total"
                    value={stats.total}
                    icon={<DollarSign className="w-4 h-4" />}
                    color="primary"
                  />
                </div>
                
                {/* Recent Activity */}
                <div className="control-panel">
                  <div className="panel-title flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </div>
                  {proposalsLoading ? (
                    <div className="text-center py-4 text-muted-foreground text-sm font-mono">
                      Loading...
                    </div>
                  ) : (
                    <ActivityTimeline items={activities} maxItems={3} />
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Terminal Console (full width on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 lg:col-start-2"
          >
            {/* Mobile-only mini shield - Using circular shape instead of hexagon */}
            <div className="flex lg:hidden justify-center mb-4">
              <motion.div 
                className="w-20 h-20 rounded-full gradient-amber p-0.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
            </div>
            
            {/* Title Block */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-mono mb-2">
                <span className="terminal-text">AGENT</span>
                <span className="text-foreground">_PAY_</span>
                <span className="terminal-text">GUARD</span>
              </h1>
              <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-transparent mb-4" />
              <div className="text-xs font-mono text-muted-foreground">
                <TypewriterText text={`>> ${t('home.subtitle')}`} />
              </div>
            </div>

            {/* Status Console - Enhanced with visual indicators and data visualization */}
            <div className="control-panel">
              <div className="panel-title">{t('home.status')}</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.02, borderColor: 'hsl(var(--success) / 0.5)' }}
                  className="flex items-center gap-2 p-2 rounded-lg border border-success/30 bg-success/5 cursor-pointer transition-all"
                >
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground uppercase">{t('home.status.online').split(' ')[0]}</div>
                    <div className="text-sm font-bold text-success truncate">{t('home.status.online').split(' ')[1] || 'ONLINE'}</div>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, borderColor: 'hsl(var(--success) / 0.5)' }}
                  className="flex items-center gap-2 p-2 rounded-lg border border-success/30 bg-success/5 cursor-pointer transition-all"
                >
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground uppercase">{t('home.status.security')}</div>
                    <div className="text-sm font-bold text-success truncate">{t('home.status.maximum')}</div>
                  </div>
                </motion.div>
              </div>
              
              {/* Security Level Visualization */}
              {isConnected && (
                <motion.div 
                  whileHover={{ scale: 1.02, borderColor: 'hsl(var(--primary) / 0.5)' }}
                  className="mb-4 p-3 rounded-lg border border-primary/30 bg-primary/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-muted-foreground">Security Level</span>
                    <span className="text-sm font-bold text-primary">85%</span>
                  </div>
                  <RadialProgress value={85} size="sm" color="success" showLabel={false} className="mx-auto" />
                </motion.div>
              )}
              
              <div className="space-y-1">
                <StatusLine label={t('home.status.network')} value={kiteTestnet.name.toUpperCase()} />
                <StatusLine label={t('home.status.chainId')} value="2368" />
                <StatusLine label={t('home.status.threshold')} value={t('home.status.multisig')} status="warning" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isConnected ? (
                <>
                  <Link to="/dashboard" className="block">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <NeonButton size="lg" pulse className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          {t('home.accessTerminal')}
                        </span>
                        <ChevronRight className="w-5 h-5" />
                      </NeonButton>
                    </motion.div>
                  </Link>
                  <Link to="/freeze" className="block">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <NeonButton size="lg" variant="secondary" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Snowflake className="w-5 h-5" />
                          {t('home.emergencyFreeze')}
                        </span>
                        <ChevronRight className="w-5 h-5" />
                      </NeonButton>
                    </motion.div>
                  </Link>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <NeonButton size="lg" onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))} pulse className="w-full">
                    <Wallet className="w-5 h-5" />
                    {t('home.connectWallet')}
                  </NeonButton>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Capabilities Section - Card Grid Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="control-panel">
            <div className="panel-title">{t('home.capabilities')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((cap, index) => (
                <Link key={cap.id} to={cap.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="terminal-card group cursor-pointer h-full"
                  >
                    <div className="flex items-start gap-3">
                      {/* Function-specific icons with different gradients */}
                      <motion.div 
                        className={`w-12 h-12 rounded-lg ${cap.gradient} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <cap.icon className="w-6 h-6 text-background" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-primary font-mono text-xs">[{cap.id}]</span>
                          <h3 className="font-mono font-bold uppercase text-sm group-hover:text-primary transition-colors truncate">
                            {cap.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-xs font-mono line-clamp-2">
                          {cap.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 terminal-card border-x-0 border-b-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>{t('home.footer.hackathon')}</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success animate-pulse" />
            <span>{kiteTestnet.name} • {t('home.footer.chain')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
