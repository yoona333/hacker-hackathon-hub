import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { kiteTestnet } from './config';

// Hook to get wallet connection status and info
export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { data: balance } = useBalance({
    address,
  });

  const isCorrectNetwork = chainId === kiteTestnet.id;

  const switchToKite = () => {
    if (switchChain) {
      switchChain({ chainId: kiteTestnet.id });
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    balance: balance?.formatted ?? '0',
    symbol: balance?.symbol ?? 'ETH',
    chainId,
    isCorrectNetwork,
    switchToKite,
    chain: kiteTestnet,
  };
}

// Hook for checking if an address is frozen (mock for now)
export function useFreezeStatus(address?: string) {
  // In real implementation, this would call the contract
  // For demo, we'll use mock data
  const isFrozen = address ? 
    address.toLowerCase().includes('dead') : 
    false;

  return {
    isFrozen,
    isLoading: false,
    error: null,
  };
}

// Hook for getting proposal data (mock for now)
export function useProposals() {
  // Mock implementation
  return {
    proposals: [],
    isLoading: false,
    error: null,
  };
}
