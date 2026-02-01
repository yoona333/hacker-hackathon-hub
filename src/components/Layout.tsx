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
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
            <Link to={backTo} className="shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-1.5 sm:p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30 touch-target"
                style={{ borderRadius: '2px' }}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 hex-clip gradient-amber flex items-center justify-center shrink-0">
                {icon}
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-bold font-mono terminal-text uppercase truncate">
                {title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {rightSlot}
            <WalletButton />
            <div className="hidden sm:block">
              <NetworkBadge connected={isCorrectNetwork} chainName={kiteTestnet.name} />
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
