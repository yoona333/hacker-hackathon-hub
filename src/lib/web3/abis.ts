// SimpleFreeze contract ABI (deployed at 0x3168a2307a3c272ea6CE2ab0EF1733CA493aa719)
export const simpleFreezeAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'isFrozen',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'frozen',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'freeze',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'unfreeze',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'account', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'Frozen',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'account', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'Unfrozen',
    type: 'event',
  },
] as const;

// SimpleMultiSig contract ABI (deployed at 0xA247e042cAE22F0CDab2a197d4c194AfC26CeECA)
export const simpleMultiSigAbi = [
  {
    inputs: [],
    name: 'REQUIRED',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'transactionCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'owners',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOwners',
    outputs: [{ name: '', type: 'address[3]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_address', type: 'address' }],
    name: 'isOwner',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_txId', type: 'uint256' }],
    name: 'getTransaction',
    outputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'executed', type: 'bool' },
      { name: 'numConfirmations', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    name: 'isConfirmed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
      { name: '_data', type: 'bytes' },
    ],
    name: 'submitTransaction',
    outputs: [{ name: 'txId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_txId', type: 'uint256' }],
    name: 'confirmTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_txId', type: 'uint256' }],
    name: 'executeTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_txId', type: 'uint256' }],
    name: 'revokeConfirmation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
      { name: '_data', type: 'bytes' },
    ],
    name: 'submitAndConfirm',
    outputs: [{ name: 'txId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'txId', type: 'uint256' },
      { indexed: true, name: 'submitter', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
      { indexed: false, name: 'data', type: 'bytes' },
    ],
    name: 'TransactionSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'txId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
    ],
    name: 'TransactionConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'txId', type: 'uint256' },
      { indexed: true, name: 'executor', type: 'address' },
    ],
    name: 'TransactionExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'txId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
    ],
    name: 'TransactionRevoked',
    type: 'event',
  },
] as const;

// ERC20 for balance/symbol/decimals in wallet modal
export const erc20BalanceAbi = [
  { inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
] as const;
