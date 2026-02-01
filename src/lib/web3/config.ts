import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Kite Testnet Chain Definition
export const kiteTestnet = defineChain({
  id: 2368,
  name: 'Kite Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.gokite.ai/'],
    },
    public: {
      http: ['https://rpc-testnet.gokite.ai/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kite Scan',
      url: 'https://testnet.kitescan.ai',
    },
  },
  testnet: true,
});

// Contract Addresses
export const CONTRACTS = {
  MULTISIG: '0xA247e042cAE22F0CDab2a197d4c194AfC26CeECA' as const,
  FREEZE: '0x3168a2307a3c272ea6CE2ab0EF1733CA493aa719' as const,
} as const;

/** Kite testnet chain id - native token is displayed as KITE */
export const KITE_TESTNET_ID = 2368;

/** ERC20 tokens to show in wallet modal on Kite testnet. Only non-zero balances are shown. Settlement token is also loaded from /api/policy. */
export const KITE_TESTNET_ERC20: { address: `0x${string}`; symbol: string }[] = [
  // Add USDC/USDT etc. when Kite testnet addresses are known, e.g.:
  // { address: '0x...' as `0x${string}`, symbol: 'USDC' },
];

// Reown Project ID
export const REOWN_PROJECT_ID = '20c1782053296c95e5af2263d0d3560d';

// Wagmi Config (injected = MetaMask etc.; no AppKit dependency)
export const wagmiConfig = createConfig({
  chains: [kiteTestnet],
  connectors: [injected()],
  transports: {
    [kiteTestnet.id]: http(),
  },
});

// Explorer URLs
export const getExplorerUrl = (type: 'address' | 'tx', value: string) => {
  return `${kiteTestnet.blockExplorers.default.url}/${type}/${value}`;
};

// Shorten address for display
export const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Mock data for visual demonstration
export const MOCK_DATA = {
  owners: [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x9876543210987654321098765432109876543210',
  ],
  threshold: 2,
  frozenAddresses: [
    '0xdead000000000000000000000000000000000001',
    '0xdead000000000000000000000000000000000002',
    '0xdead000000000000000000000000000000000003',
  ],
  proposals: [
    {
      id: 1,
      type: 'freeze',
      target: '0xdead000000000000000000000000000000000004',
      confirmations: 1,
      executed: false,
      timestamp: Date.now() - 3600000,
    },
    {
      id: 2,
      type: 'unfreeze',
      target: '0xdead000000000000000000000000000000000001',
      confirmations: 2,
      executed: true,
      timestamp: Date.now() - 86400000,
    },
  ],
  transactions: [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      type: 'freeze',
      status: 'success',
      timestamp: Date.now() - 3600000,
      target: '0xdead000000000000000000000000000000000001',
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      type: 'confirm',
      status: 'success',
      timestamp: Date.now() - 7200000,
      target: '0xdead000000000000000000000000000000000002',
    },
    {
      hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
      type: 'execute',
      status: 'pending',
      timestamp: Date.now() - 1800000,
      target: '0xdead000000000000000000000000000000000003',
    },
  ],
};
