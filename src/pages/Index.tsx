import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, Snowflake, Zap, Terminal, ChevronRight, Shield } from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { HolographicShield } from '@/components/HolographicShield';
import { NeonButton } from '@/components/ui/neon-button';
import { NetworkBadge } from '@/components/ui/status-badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { WalletButton } from '@/components/WalletButton';
import { useWallet } from '@/lib/web3/hooks';
import { useLanguage } from '@/lib/i18n';
import { kiteTestnet } from '@/lib/web3/config';

const getCapabilities = (t: (key: string) => string) => [
  {
    id: '00',
    title: t('home.cap.pay'),
    description: t('home.cap.payDesc'),
    href: '/pay',
  },
  {
    id: '01',
    title: t('home.cap.aiChat'),
    description: t('home.cap.aiChatDesc'),
    href: '/ai-chat',
  },
  {
    id: '02',
    title: t('home.cap.multisig'),
    description: t('home.cap.multisigDesc'),
    href: '/dashboard',
  },
  {
    id: '03',
    title: t('home.cap.freeze'),
    description: t('home.cap.freezeDesc'),
    href: '/freeze',
  },
  {
    id: '04',
    title: t('home.cap.proposals'),
    description: t('home.cap.proposalsDesc'),
    href: '/proposals',
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
            <div className="w-8 h-8 hex-clip gradient-amber flex items-center justify-center">
              <Terminal className="w-4 h-4 text-background" />
            </div>
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
          
          {/* Left Side - Holographic Shield Visual (hidden on mobile, shown on lg+) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <HolographicShield />
          </motion.div>

          {/* Right Side - Terminal Console (full width on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 lg:col-start-2"
          >
            {/* Mobile-only mini shield */}
            <div className="flex lg:hidden justify-center mb-4">
              <motion.div 
                className="w-20 h-20 hex-clip gradient-amber p-0.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-full h-full hex-clip bg-background flex items-center justify-center">
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

            {/* Status Console */}
            <div className="control-panel">
              <div className="panel-title">{t('home.status')}</div>
              <div className="space-y-1">
                <StatusLine label={t('home.status.online').split(' ')[0]} value={t('home.status.online')} status="success" />
                <StatusLine label={t('home.status.security')} value={t('home.status.maximum')} status="success" />
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
                    <NeonButton size="lg" pulse className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        {t('home.accessTerminal')}
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </NeonButton>
                  </Link>
                  <Link to="/freeze" className="block">
                    <NeonButton size="lg" variant="secondary" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Snowflake className="w-5 h-5" />
                        {t('home.emergencyFreeze')}
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </NeonButton>
                  </Link>
                </>
              ) : (
                <NeonButton size="lg" onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))} pulse className="w-full">
                  <Wallet className="w-5 h-5" />
                  {t('home.connectWallet')}
                </NeonButton>
              )}
            </div>
          </motion.div>
        </div>

        {/* Capabilities Section - Horizontal List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="control-panel">
            <div className="panel-title">{t('home.capabilities')}</div>
            <div className="space-y-0">
              {capabilities.map((cap, index) => (
                <Link key={cap.id} to={cap.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="inline-stat group cursor-pointer hover:bg-muted/30 px-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-mono text-xs">[{cap.id}]</span>
                      <span className="font-mono font-bold uppercase text-sm group-hover:text-primary transition-colors">
                        {cap.title}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs font-mono">
                      {cap.description}
                    </span>
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
