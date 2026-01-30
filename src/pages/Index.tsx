import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, Shield, FileText, History, Snowflake, Zap } from 'lucide-react';
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
    description: '2/3 threshold multi-signature wallet for enhanced security',
    color: 'purple',
    href: '/dashboard',
  },
  {
    icon: Snowflake,
    title: 'Freeze Control',
    description: 'Freeze suspicious addresses to protect your assets',
    color: 'cyan',
    href: '/freeze',
  },
  {
    icon: FileText,
    title: 'Proposal System',
    description: 'Create, confirm and execute multi-sig proposals',
    color: 'blue',
    href: '/proposals',
  },
] as const;

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
            <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold neon-text">AgentPayGuard</span>
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
                  <Wallet className="w-4 h-4" />
                  Dashboard
                </NeonButton>
              </Link>
            ) : (
              <NeonButton onClick={() => open()} pulse>
                <Wallet className="w-4 h-4" />
                Connect Wallet
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
            <div className="w-32 h-32 mx-auto rounded-3xl gradient-purple-blue p-1 shadow-neon-purple animate-float">
              <div className="w-full h-full rounded-3xl bg-background/80 backdrop-blur-xl flex items-center justify-center">
                <Shield className="w-16 h-16 text-primary" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="neon-text">Agent</span>
            <span className="text-foreground">Pay</span>
            <span className="neon-text">Guard</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Secure your DeFi assets with{' '}
            <span className="text-primary">multi-signature</span> protection and{' '}
            <span className="text-accent">freeze</span> capabilities on Kite Testnet
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            {isConnected ? (
              <>
                <Link to="/dashboard">
                  <NeonButton size="lg" pulse>
                    <Zap className="w-5 h-5" />
                    Enter Dashboard
                  </NeonButton>
                </Link>
                <Link to="/freeze">
                  <NeonButton size="lg" variant="secondary">
                    <Snowflake className="w-5 h-5" />
                    Freeze Control
                  </NeonButton>
                </Link>
              </>
            ) : (
              <NeonButton size="lg" onClick={() => open()} pulse>
                <Wallet className="w-5 h-5" />
                Connect Wallet to Start
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
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link to={feature.href}>
                  <GlassCard 
                    glow={feature.color as 'purple' | 'blue' | 'cyan'} 
                    className="h-full cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl gradient-${feature.color === 'purple' ? 'purple-blue' : feature.color === 'cyan' ? 'blue-cyan' : 'purple-blue'} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 neon-text">{feature.title}</h3>
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
          <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Built on <span className="text-foreground font-medium">Kite Testnet</span> (Chain ID: 2368)
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            🚀 Built for Hackathon 2024 | Powered by{' '}
            <span className="neon-text">Kite Testnet</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
