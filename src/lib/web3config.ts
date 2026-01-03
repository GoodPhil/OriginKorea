'use client';

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { polygon } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';

// Get projectId from WalletConnect Cloud (https://cloud.walletconnect.com)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Metadata for the dApp
const metadata = {
  name: 'Origin Korea',
  description: 'LGNS Token Analysis & Membership Platform',
  url: 'https://originkorea.kr',
  icons: ['https://originkorea.kr/icons/icon-192x192.png'],
};

// Supported chains
const chains = [polygon] as const;

// Create a minimal config for SSR, full config for client
const createWagmiConfig = () => {
  // On server, return a minimal config without Web3Modal features
  if (typeof window === 'undefined') {
    return createConfig({
      chains,
      transports: {
        [polygon.id]: http(),
      },
      ssr: true,
    });
  }

  // On client, use the full Web3Modal config
  return defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,
    enableCoinbase: false,
    enableInjected: true,
    enableWalletConnect: true,
  });
};

// Create wagmiConfig
export const wagmiConfig = createWagmiConfig();

// LGNS Token Contract Address
export const LGNS_CONTRACT = '0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb' as const;
export const POLYGON_CHAIN_ID = 137;
