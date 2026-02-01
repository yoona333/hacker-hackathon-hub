/**
 * Wagmi-only Web3 provider (no Reown AppKit).
 * Uses injected connector (MetaMask etc.); wallet UI is our WalletButton + WalletModal (Connect / Disconnect only).
 */
import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './config';

const queryClient = new QueryClient();

export function SimpleWeb3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
