import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ReactNode, useState, useEffect } from 'react';
import { kiteTestnet, REOWN_PROJECT_ID } from './config';

// Metadata for the app
const metadata = {
  name: 'AgentPayGuard',
  description: '3D Cyberpunk Multi-sig & Freeze Contract Manager for Kite Testnet',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://agentpayguard.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Create Wagmi Adapter - defined outside component but initialized only once
let wagmiAdapter: WagmiAdapter | null = null;
let appKitInitialized = false;

function getWagmiAdapter() {
  if (!wagmiAdapter) {
    wagmiAdapter = new WagmiAdapter({
      networks: [kiteTestnet],
      projectId: REOWN_PROJECT_ID,
      ssr: false,
    });
  }
  return wagmiAdapter;
}

function initializeAppKit(adapter: WagmiAdapter) {
  if (!appKitInitialized && typeof window !== 'undefined') {
    createAppKit({
      adapters: [adapter],
      networks: [kiteTestnet],
      projectId: REOWN_PROJECT_ID,
      metadata,
      features: {
        analytics: true,
        email: false,
        socials: false,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#a855f7',
        '--w3m-color-mix': '#3b82f6',
        '--w3m-color-mix-strength': 20,
        '--w3m-border-radius-master': '12px',
      },
    });
    appKitInitialized = true;
  }
}

// Provider component
interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Use useState to ensure QueryClient is stable across re-renders
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  
  // Get or create the adapter
  const adapter = getWagmiAdapter();
  
  // Initialize AppKit only on client side after mount
  useEffect(() => {
    initializeAppKit(adapter);
    setMounted(true);
  }, [adapter]);

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="neon-spinner" />
      </div>
    );
  }

  return (
    <WagmiProvider config={adapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
