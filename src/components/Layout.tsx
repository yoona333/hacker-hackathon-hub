import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { LanguageToggle } from '@/components/LanguageToggle';
import { NetworkBadge } from '@/components/ui/status-badge';
import { WalletButton } from '@/components/WalletButton';
import { useWallet } from '@/lib/web3/hooks';
import { kiteTestnet } from '@/lib/web3/config';

type LayoutProps = {
  title: string;
  icon: ReactNode;
  backTo: '/' | '/dashboard';
  children: ReactNode;
  /** Optional right slot (e.g. extra buttons). NetworkBadge + LanguageToggle are always shown. */
  rightSlot?: ReactNode;
  /** Header padding: default py-3; use py-4 for pages that need more (e.g. History). */
  headerClass?: string;
};

export function Layout({ title, icon, backTo, children, rightSlot, headerClass = 'py-3' }: LayoutProps) {
  const { isConnected, isCorrectNetwork } = useWallet();

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <header
        className={`sticky top-0 z-50 terminal-card border-x-0 border-t-0 ${headerClass}`}
        style={{ borderRadius: 0 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to={backTo}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                style={{ borderRadius: '2px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 hex-clip gradient-amber flex items-center justify-center">
                {icon}
              </div>
              <span className="text-sm sm:text-lg font-bold font-mono terminal-text uppercase">
                {title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {rightSlot}
            <WalletButton />
            <NetworkBadge connected={isCorrectNetwork} chainName={kiteTestnet.name} />
            <LanguageToggle />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
