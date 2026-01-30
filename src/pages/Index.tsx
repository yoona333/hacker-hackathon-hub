import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, Shield, FileText, Snowflake, Zap, Terminal, Lock } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { NeonButton } from '@/components/ui/neon-button';
import { GlassCard } from '@/components/ui/glass-card';
import { NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { kiteTestnet } from '@/lib/web3/config';

const features = [
  {
    icon: Shield,
    title: 'Multi-Sig Security',
    description: '2/3 threshold multi-signature wallet for maximum asset protection',
    color: 'amber',
    href: '/dashboard',
  },
  {
    icon: Snowflake,
    title: 'Freeze Control',
    description: 'Emergency freeze capabilities for suspicious addresses',
    color: 'emerald',
    href: '/freeze',
  },
  {
    icon: FileText,
    title: 'Proposal System',
    description: 'Create, confirm and execute multi-sig proposals securely',
    color: 'amber',
    href: '/proposals',
  },
] as const;

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
        className="inline-block w-3 h-6 bg-primary ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.span>
  );
}

export default function Index() {
  const { open } = useAppKit();
  const { isConnected, address } = useWallet();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 hex-clip gradient-amber flex items-center justify-center">
              <Terminal className="w-5 h-5 text-background" />
            </div>
            <span className="text-xl font-bold font-mono terminal-text">AGENT_PAY_GUARD</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
            {isConnected ? (
              <Link to="/dashboard">
                <NeonButton size="sm">
                  <Lock className="w-4 h-4" />
                  DASHBOARD
                </NeonButton>
              </Link>
            ) : (
              <NeonButton onClick={() => open()} pulse>
                <Wallet className="w-4 h-4" />
                CONNECT
              </NeonButton>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto hex-clip gradient-amber p-1 shadow-terminal-amber animate-float">
              <div className="w-full h-full hex-clip bg-background/90 flex items-center justify-center">
                <Shield className="w-14 h-14 text-primary" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-mono">
              <span className="terminal-text">AGENT</span>
              <span className="text-foreground">_PAY_</span>
              <span className="terminal-text">GUARD</span>
            </h1>
            <div className="mt-4 text-sm font-mono text-muted-foreground">
              <TypewriterText text=">> INITIALIZING SECURITY PROTOCOL..." />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-mono"
          >
            Military-grade security for your DeFi assets with{' '}
            <span className="text-primary">multi-signature</span> protection and{' '}
            <span className="text-accent">freeze</span> capabilities
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            {isConnected ? (
              <>
                <Link to="/dashboard">
                  <NeonButton size="lg" pulse>
                    <Zap className="w-5 h-5" />
                    ACCESS TERMINAL
                  </NeonButton>
                </Link>
                <Link to="/freeze">
                  <NeonButton size="lg" variant="secondary">
                    <Snowflake className="w-5 h-5" />
                    FREEZE CONTROL
                  </NeonButton>
                </Link>
              </>
            ) : (
              <NeonButton size="lg" onClick={() => open()} pulse>
                <Wallet className="w-5 h-5" />
                CONNECT WALLET
              </NeonButton>
            )}
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Link to={feature.href}>
                  <GlassCard 
                    glow={feature.color} 
                    className="h-full cursor-pointer"
                  >
                    <div className={`w-12 h-12 hex-clip ${feature.color === 'amber' ? 'gradient-amber' : 'gradient-emerald'} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-background" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-mono terminal-text uppercase">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 terminal-card px-6 py-3">
            <div className="w-2 h-2 bg-success animate-pulse" style={{ borderRadius: '1px' }} />
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
              Network: <span className="text-foreground font-medium">{kiteTestnet.name}</span> | Chain ID: 2368
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            🛡️ Built for Hackathon 2024 | Powered by{' '}
            <span className="terminal-text">{kiteTestnet.name}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
