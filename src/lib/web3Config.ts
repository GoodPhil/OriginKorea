// Contract addresses
export const CONTRACT_ADDRESSES = {
  LGNS_TOKEN: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
  STAKING: '0x1964Ca90474b11FFD08af387b110ba6C96251Bfc',
  sLGNS: '0x1964Ca90474b11FFD08af387b110ba6C96251Bfc', // sLGNS is the staking contract
  TREASURY: '0x7B9B7d4F870A38e92c9a181B00f9b33cc8Ef5321',
  TURBINE: '0x07Ff4e06865de4934409Aa6eCea503b08Cc1C78d',
  LP: '0x882df4b0fb50a229c3b4124eb18c759911485bfb',
} as const;

// ERC20 ABI for balance queries
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// sLGNS / Staking Contract ABI
export const STAKING_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'index',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'epoch',
    outputs: [
      { name: 'length', type: 'uint256' },
      { name: 'number', type: 'uint256' },
      { name: 'endBlock', type: 'uint256' },
      { name: 'distribute', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Helper to format token amounts
export function formatTokenAmount(amount: bigint, decimals: number = 18): number {
  return Number(amount) / Math.pow(10, decimals);
}
