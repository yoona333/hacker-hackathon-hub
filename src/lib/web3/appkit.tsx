import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type ReactNode } from 'react';
import { kiteTestnet, REOWN_PROJECT_ID } from './config';

// Set up queryClient outside of component
const queryClient = new QueryClient();

// Metadata for the app
const metadata = {
  name: 'AgentPayGuard',
  description: '3D Cyberpunk Multi-sig & Freeze Contract Manager for Kite Testnet',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://agentpayguard.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [kiteTestnet],
  projectId: REOWN_PROJECT_ID,
  ssr: false,
});

// Initialize AppKit - must be called outside of React component
createAppKit({
  adapters: [wagmiAdapter],
  networks: [kiteTestnet],
  projectId: REOWN_PROJECT_ID,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#a855f7',
    '--w3m-color-mix': '#3b82f6',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '12px',
  },
});

// Provider component
interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
