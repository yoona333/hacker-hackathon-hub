import { useAccount, useBalance, useChainId, useSwitchChain, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { encodeFunctionData, formatUnits } from 'viem';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { kiteTestnet, CONTRACTS, KITE_TESTNET_ID, KITE_TESTNET_ERC20 } from './config';
import { simpleFreezeAbi, simpleMultiSigAbi, erc20BalanceAbi } from './abis';

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

export type WalletBalanceItem = { symbol: string; formatted: string };

/** Real chain balances: native (KITE on Kite testnet) + ERC20 (USDC/USDT etc.). Only items with balance > 0. */
export function useWalletBalances(
  walletAddress: `0x${string}` | undefined,
  chainId: number,
  extraTokenAddresses: `0x${string}`[] = []
) {
  const { data: nativeBalance } = useBalance({ address: walletAddress });
  const tokenAddresses = useMemo(
    () => [...KITE_TESTNET_ERC20.map((t) => t.address), ...extraTokenAddresses].filter((a, i, arr) => arr.indexOf(a) === i),
    [extraTokenAddresses]
  );
  const contracts = useMemo(
    () =>
      tokenAddresses.length && walletAddress
        ? tokenAddresses.flatMap((addr) => [
            { address: addr, abi: erc20BalanceAbi, functionName: 'balanceOf' as const, args: [walletAddress] as const },
            { address: addr, abi: erc20BalanceAbi, functionName: 'decimals' as const },
            { address: addr, abi: erc20BalanceAbi, functionName: 'symbol' as const },
          ])
        : [],
    [walletAddress, tokenAddresses]
  );
  const { data: tokenResults } = useReadContracts({ contracts, query: { enabled: contracts.length > 0 } });

  return useMemo(() => {
    const items: WalletBalanceItem[] = [];
    if (nativeBalance && parseFloat(nativeBalance.formatted) > 0) {
      const symbol = chainId === KITE_TESTNET_ID ? 'KITE' : nativeBalance.symbol;
      items.push({ symbol, formatted: parseFloat(nativeBalance.formatted).toFixed(4) });
    }
    if (tokenResults && tokenResults.length >= 3) {
      const n = tokenAddresses.length;
      for (let i = 0; i < n; i++) {
        const balanceR = tokenResults[i * 3];
        const decimalsR = tokenResults[i * 3 + 1];
        const symbolR = tokenResults[i * 3 + 2];
        if (balanceR?.status === 'success' && decimalsR?.status === 'success' && symbolR?.status === 'success') {
          const balance = balanceR.result as bigint;
          if (balance > 0n) {
            const decimals = decimalsR.result as number;
            const symbol = (symbolR.result as string) || 'TOKEN';
            const formatted = formatUnits(balance, decimals);
            const num = parseFloat(formatted);
            items.push({ symbol, formatted: num >= 1e6 ? num.toExponential(2) : num.toFixed(num < 0.01 ? 4 : 2) });
          }
        }
      }
    }
    return items;
  }, [nativeBalance, chainId, tokenResults, tokenAddresses.length]);
}

// Hook for checking if an address is frozen (real contract call)
export function useFreezeStatus(address?: string) {
  const isValidAddress = address ? /^0x[a-fA-F0-9]{40}$/.test(address) : false;

  const { data: isFrozen, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.FREEZE,
    abi: simpleFreezeAbi,
    functionName: 'isFrozen',
    args: isValidAddress ? [address as `0x${string}`] : undefined,
    query: { enabled: isValidAddress },
  });

  return {
    isFrozen: isFrozen ?? false,
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting multi-sig owners
export function useMultiSigOwners() {
  const { data: owners, isLoading, error } = useReadContract({
    address: CONTRACTS.MULTISIG,
    abi: simpleMultiSigAbi,
    functionName: 'getOwners',
  });

  return {
    owners: owners as readonly [`0x${string}`, `0x${string}`, `0x${string}`] | undefined,
    isLoading,
    error,
  };
}

// Hook for checking if connected wallet is a multi-sig owner
export function useIsMultiSigOwner() {
  const { address } = useAccount();

  const { data: isOwner, isLoading } = useReadContract({
    address: CONTRACTS.MULTISIG,
    abi: simpleMultiSigAbi,
    functionName: 'isOwner',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return { isOwner: isOwner ?? false, isLoading };
}

// Hook for getting transaction count
export function useTransactionCount() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.MULTISIG,
    abi: simpleMultiSigAbi,
    functionName: 'transactionCount',
  });

  return {
    count: data !== undefined ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

// Proposal type parsed from on-chain data
export interface Proposal {
  id: number;
  to: string;
  value: bigint;
  data: string;
  executed: boolean;
  numConfirmations: number;
  // Decoded info
  type: 'freeze' | 'unfreeze' | 'unknown';
  targetAddress?: string;
}

// Decode calldata to determine freeze/unfreeze target
function decodeProposalData(to: string, data: string): { type: 'freeze' | 'unfreeze' | 'unknown'; targetAddress?: string } {
  if (to.toLowerCase() !== CONTRACTS.FREEZE.toLowerCase()) {
    return { type: 'unknown' };
  }
  // freeze(address) selector: 0x8d1fdf2f (first 4 bytes of keccak256("freeze(address)"))
  // unfreeze(address) selector: 0x45c2badf (first 4 bytes of keccak256("unfreeze(address)"))
  const selector = data.slice(0, 10).toLowerCase();
  if (selector === '0x8d1fdf2f') {
    const addr = '0x' + data.slice(34, 74);
    return { type: 'freeze', targetAddress: addr };
  }
  if (selector === '0x45c2badf') {
    const addr = '0x' + data.slice(34, 74);
    return { type: 'unfreeze', targetAddress: addr };
  }
  return { type: 'unknown' };
}

// Hook for getting proposals list from on-chain data
export function useProposals() {
  const { count, isLoading: countLoading, refetch: refetchCount } = useTransactionCount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Build read calls for all transactions
  const txIds = Array.from({ length: Math.min(count, 50) }, (_, i) => count - 1 - i).filter(id => id >= 0);

  const contracts = txIds.map(id => ({
    address: CONTRACTS.MULTISIG as `0x${string}`,
    abi: simpleMultiSigAbi,
    functionName: 'getTransaction' as const,
    args: [BigInt(id)] as const,
  }));

  const { data: results, isLoading: txLoading, refetch: refetchTxs } = useReadContracts({
    contracts: contracts.length > 0 ? contracts : undefined,
    query: { enabled: contracts.length > 0 },
  });

  useEffect(() => {
    if (!results) {
      if (!countLoading && !txLoading) setIsLoading(false);
      return;
    }
    const parsed: Proposal[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status !== 'success' || !r.result) continue;
      const [to, value, data, executed, numConfirmations] = r.result as [string, bigint, string, boolean, bigint];
      const decoded = decodeProposalData(to, data);
      parsed.push({
        id: txIds[i],
        to,
        value,
        data,
        executed,
        numConfirmations: Number(numConfirmations),
        type: decoded.type,
        targetAddress: decoded.targetAddress,
      });
    }
    setProposals(parsed);
    setIsLoading(false);
  }, [results, countLoading, txLoading]);

  const refetch = useCallback(() => {
    refetchCount();
    refetchTxs();
  }, [refetchCount, refetchTxs]);

  return {
    proposals,
    totalCount: count,
    isLoading: isLoading || countLoading || txLoading,
    refetch,
  };
}

// Hook for submitting a freeze/unfreeze proposal via multi-sig
export function useSubmitProposal() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitFreeze = (targetAddress: `0x${string}`) => {
    const calldata = encodeFunctionData({
      abi: simpleFreezeAbi,
      functionName: 'freeze',
      args: [targetAddress],
    });
    writeContract({
      address: CONTRACTS.MULTISIG,
      abi: simpleMultiSigAbi,
      functionName: 'submitAndConfirm',
      args: [CONTRACTS.FREEZE, 0n, calldata],
    });
  };

  const submitUnfreeze = (targetAddress: `0x${string}`) => {
    const calldata = encodeFunctionData({
      abi: simpleFreezeAbi,
      functionName: 'unfreeze',
      args: [targetAddress],
    });
    writeContract({
      address: CONTRACTS.MULTISIG,
      abi: simpleMultiSigAbi,
      functionName: 'submitAndConfirm',
      args: [CONTRACTS.FREEZE, 0n, calldata],
    });
  };

  return {
    submitFreeze,
    submitUnfreeze,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook for confirming a multi-sig transaction
export function useConfirmTransaction() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const confirm = (txId: number) => {
    writeContract({
      address: CONTRACTS.MULTISIG,
      abi: simpleMultiSigAbi,
      functionName: 'confirmTransaction',
      args: [BigInt(txId)],
    });
  };

  return { confirm, hash, isPending, isConfirming, isSuccess, error, reset };
}

// Hook for executing a multi-sig transaction
export function useExecuteTransaction() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = (txId: number) => {
    writeContract({
      address: CONTRACTS.MULTISIG,
      abi: simpleMultiSigAbi,
      functionName: 'executeTransaction',
      args: [BigInt(txId)],
    });
  };

  return { execute, hash, isPending, isConfirming, isSuccess, error, reset };
}

// Hook for checking if current user has confirmed a specific transaction
export function useHasConfirmed(txId: number) {
  const { address } = useAccount();

  const { data: confirmed, isLoading, refetch } = useReadContract({
    address: CONTRACTS.MULTISIG,
    abi: simpleMultiSigAbi,
    functionName: 'isConfirmed',
    args: address ? [BigInt(txId), address] : undefined,
    query: { enabled: !!address },
  });

  return { confirmed: confirmed ?? false, isLoading, refetch };
}
