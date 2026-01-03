'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { LGNS_CONTRACT, POLYGON_CHAIN_ID } from '@/lib/web3config';

// Membership Tiers
export type MembershipTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface MembershipInfo {
  tier: MembershipTier;
  tierName: { ko: string; en: string };
  balance: number;
  balanceUSD: number;
  benefits: string[];
}

const TIER_THRESHOLDS = {
  bronze: 100,
  silver: 1000,
  gold: 10000,
  platinum: 100000,
};

const TIER_NAMES = {
  none: { ko: '없음', en: 'None' },
  bronze: { ko: '브론즈', en: 'Bronze' },
  silver: { ko: '실버', en: 'Silver' },
  gold: { ko: '골드', en: 'Gold' },
  platinum: { ko: '플래티넘', en: 'Platinum' },
};

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  lgnsBalance: number;
  lgnsBalanceUSD: number;
  membership: MembershipInfo;
  error: string | null;
  walletType: 'metamask' | 'walletconnect' | null;
  connect: (type?: 'metamask' | 'walletconnect') => Promise<void>;
  disconnect: () => void;
  switchToPolygon: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  hasAccess: (requiredTier: MembershipTier) => boolean;
  openConnectModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Wagmi hooks
  const { address: wagmiAddress, isConnected: wagmiConnected, isConnecting: wagmiConnecting, connector } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const wagmiChainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Local state
  const [lgnsBalance, setLgnsBalance] = useState(0);
  const [lgnsBalanceUSD, setLgnsBalanceUSD] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lgnsPrice, setLgnsPrice] = useState(6.36);
  const [walletType, setWalletType] = useState<'metamask' | 'walletconnect' | null>(null);

  // Derived state
  const isConnected = wagmiConnected;
  const isConnecting = wagmiConnecting;
  const address = wagmiAddress || null;
  const chainId = wagmiChainId || null;

  // Detect wallet type from connector
  useEffect(() => {
    if (connector) {
      const connectorId = connector.id.toLowerCase();
      if (connectorId.includes('walletconnect')) {
        setWalletType('walletconnect');
      } else if (connectorId.includes('metamask') || connectorId.includes('injected')) {
        setWalletType('metamask');
      } else {
        setWalletType(null);
      }
    } else {
      setWalletType(null);
    }
  }, [connector]);

  // Calculate membership tier based on balance
  const getMembership = useCallback((balance: number): MembershipInfo => {
    let tier: MembershipTier = 'none';
    const benefits: string[] = [];

    if (balance >= TIER_THRESHOLDS.platinum) {
      tier = 'platinum';
      benefits.push('all_features', 'beta_access', 'team_contact', 'summit_invite');
    } else if (balance >= TIER_THRESHOLDS.gold) {
      tier = 'gold';
      benefits.push('ai_premium', 'trading_signals', 'vip_support', 'airdrops');
    } else if (balance >= TIER_THRESHOLDS.silver) {
      tier = 'silver';
      benefits.push('ai_analysis', 'price_alerts', 'whale_monitor', 'dao_voting');
    } else if (balance >= TIER_THRESHOLDS.bronze) {
      tier = 'bronze';
      benefits.push('basic_dashboard', 'community_forum', 'weekly_reports');
    }

    return {
      tier,
      tierName: TIER_NAMES[tier],
      balance,
      balanceUSD: balance * lgnsPrice,
      benefits,
    };
  }, [lgnsPrice]);

  const membership = getMembership(lgnsBalance);

  // Check if user has access to a feature requiring a specific tier
  const hasAccess = useCallback((requiredTier: MembershipTier): boolean => {
    const tierOrder: MembershipTier[] = ['none', 'bronze', 'silver', 'gold', 'platinum'];
    const userTierIndex = tierOrder.indexOf(membership.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    return userTierIndex >= requiredTierIndex;
  }, [membership.tier]);

  // Fetch LGNS price
  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.dexscreener.com/latest/dex/tokens/0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb'
      );
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        setLgnsPrice(parseFloat(data.pairs[0].priceUsd) || 6.36);
      }
    } catch {
      console.log('Failed to fetch LGNS price');
    }
  }, []);

  // Fetch LGNS balance using RPC call
  const fetchBalance = useCallback(async (walletAddress: string) => {
    try {
      const data = `0x70a08231000000000000000000000000${walletAddress.slice(2).toLowerCase()}`;

      const response = await fetch('https://polygon-rpc.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: LGNS_CONTRACT, data }, 'latest'],
          id: 1,
        }),
      });

      const result = await response.json();
      if (result.result) {
        const balance = parseInt(result.result, 16) / Math.pow(10, 18);
        setLgnsBalance(balance);
        setLgnsBalanceUSD(balance * lgnsPrice);
      }
    } catch (err) {
      console.error('Failed to fetch LGNS balance:', err);
      setLgnsBalance(0);
      setLgnsBalanceUSD(0);
    }
  }, [lgnsPrice]);

  // Switch to Polygon network
  const switchToPolygon = useCallback(async () => {
    try {
      if (switchChain) {
        switchChain({ chainId: POLYGON_CHAIN_ID });
      }
    } catch (err) {
      console.error('Failed to switch to Polygon:', err);
      setError('Failed to switch to Polygon network');
    }
  }, [switchChain]);

  // Open Web3Modal for wallet connection
  const openConnectModal = useCallback(() => {
    try {
      // Try to find the w3m-modal element and open it
      const modal = document.querySelector('w3m-modal') as HTMLElement & { open?: () => void };
      if (modal && typeof modal.open === 'function') {
        modal.open();
        return;
      }

      // Alternative: dispatch a custom event that Web3Modal listens to
      window.dispatchEvent(new CustomEvent('w3m-open-modal'));

      // If no modal found, fall back to MetaMask
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_requestAccounts' });
      }
    } catch (err) {
      console.error('Failed to open connect modal:', err);
      setError('Failed to open wallet connection modal');
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async (type?: 'metamask' | 'walletconnect') => {
    setError(null);

    try {
      if (type === 'metamask' && typeof window !== 'undefined' && window.ethereum) {
        // Direct MetaMask connection for faster UX
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];

        if (accounts && accounts.length > 0) {
          // wagmi should pick this up automatically
          console.log('MetaMask connected:', accounts[0]);
        }
      } else {
        // Use Web3Modal for WalletConnect or if MetaMask not available
        openConnectModal();
      }
    } catch (err: unknown) {
      console.error('Failed to connect wallet:', err);
      const errorMessage = (err as { message?: string })?.message || 'Failed to connect wallet';
      setError(errorMessage);
    }
  }, [openConnectModal]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    try {
      wagmiDisconnect();
      setLgnsBalance(0);
      setLgnsBalanceUSD(0);
      setError(null);
      setWalletType(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  }, [wagmiDisconnect]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (address) {
      await fetchPrice();
      await fetchBalance(address);
    }
  }, [address, fetchBalance, fetchPrice]);

  // Fetch balance when address changes
  useEffect(() => {
    if (address) {
      fetchPrice();
      fetchBalance(address);
    } else {
      setLgnsBalance(0);
      setLgnsBalanceUSD(0);
    }
  }, [address, fetchBalance, fetchPrice]);

  // Auto-switch to Polygon if on wrong chain
  useEffect(() => {
    if (isConnected && chainId && chainId !== POLYGON_CHAIN_ID) {
      switchToPolygon();
    }
  }, [isConnected, chainId, switchToPolygon]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        chainId,
        lgnsBalance,
        lgnsBalanceUSD,
        membership,
        error,
        walletType,
        connect,
        disconnect,
        switchToPolygon,
        refreshBalance,
        hasAccess,
        openConnectModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
