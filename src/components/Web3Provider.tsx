'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';
import { WagmiProvider, type State } from 'wagmi';
import { wagmiConfig, projectId } from '@/lib/web3config';

// Setup queryClient
const queryClient = new QueryClient();

// Track initialization
let isWeb3ModalInitialized = false;

// Function to initialize Web3Modal (only on client)
async function initializeWeb3Modal() {
  if (typeof window === 'undefined' || !projectId || isWeb3ModalInitialized) {
    return;
  }

  try {
    // Dynamic import to prevent SSR issues
    const { createWeb3Modal } = await import('@web3modal/wagmi/react');

    createWeb3Modal({
      wagmiConfig,
      projectId,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#ef4444',
        '--w3m-border-radius-master': '2px',
      },
      featuredWalletIds: [],
      enableAnalytics: false,
    });
    isWeb3ModalInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Web3Modal:', error);
  }
}

interface Web3ProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize Web3Modal after mount
    initializeWeb3Modal();
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export for external use
export { isWeb3ModalInitialized };
