import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// LGNS Token Contract Address on Polygon
const LGNS_TOKEN_ADDRESS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';

// Known staking-related contract addresses (from Origin DeFi)
// These may need to be updated if you have the correct addresses
const STAKING_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder - needs real address
const TREASURY_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder - needs real address

// Polygon RPC endpoints
const RPC_ENDPOINTS = [
  'https://polygon-rpc.com',
  'https://rpc-mainnet.matic.network',
  'https://rpc-mainnet.maticvigil.com',
  'https://polygon.llamarpc.com',
];

// ERC20 ABI for balance and supply queries
const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];

// Generic staking contract ABI (common functions)
const STAKING_ABI = [
  'function totalStaked() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function periodFinish() view returns (uint256)',
  'function stakingToken() view returns (address)',
  'function rewardsToken() view returns (address)',
];

async function getProvider() {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber(); // Test connection
      return provider;
    } catch {
      continue;
    }
  }
  throw new Error('All RPC endpoints failed');
}

export async function GET() {
  try {
    const provider = await getProvider();

    // Get LGNS token data
    const lgnsContract = new ethers.Contract(LGNS_TOKEN_ADDRESS, ERC20_ABI, provider);

    const [totalSupply, decimals, name, symbol] = await Promise.all([
      lgnsContract.totalSupply(),
      lgnsContract.decimals(),
      lgnsContract.name(),
      lgnsContract.symbol(),
    ]);

    const formattedTotalSupply = Number(ethers.formatUnits(totalSupply, decimals));

    // Get current LGNS price from DexScreener
    let lgnsPrice = 6.36;
    try {
      const dexResponse = await fetch(
        'https://api.dexscreener.com/latest/dex/pairs/polygon/0x882df4b0fb50a229c3b4124eb18c759911485bfb',
        { next: { revalidate: 60 } }
      );
      const dexData = await dexResponse.json();
      if (dexData?.pair?.priceUsd) {
        lgnsPrice = parseFloat(dexData.pair.priceUsd);
      }
    } catch (e) {
      console.error('Failed to fetch LGNS price:', e);
    }

    // Calculate market cap
    const marketCap = formattedTotalSupply * lgnsPrice;

    // Try to get staking data if contract address is configured
    let stakingData = null;
    if (STAKING_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      try {
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);
        const totalStaked = await stakingContract.totalStaked();
        const formattedStaked = Number(ethers.formatUnits(totalStaked, decimals));

        stakingData = {
          totalStaked: formattedStaked,
          totalStakedUSD: formattedStaked * lgnsPrice,
          stakingRatio: (formattedStaked / formattedTotalSupply) * 100,
        };
      } catch (e) {
        console.error('Failed to fetch staking data:', e);
      }
    }

    // Calculate estimated APY based on LGNS DeFi system (0.2% per 8 hours compound)
    const yieldPer8Hours = 0.2 / 100; // 0.2%
    const compoundsPerYear = 365 * 3; // 3 times per day
    const estimatedAPY = (Math.pow(1 + yieldPer8Hours, compoundsPerYear) - 1) * 100;

    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      token: {
        name,
        symbol,
        address: LGNS_TOKEN_ADDRESS,
        decimals: Number(decimals),
        totalSupply: formattedTotalSupply,
        price: lgnsPrice,
        marketCap,
      },
      staking: stakingData || {
        // Estimated data when staking contract is not configured
        totalStaked: null,
        totalStakedUSD: null,
        stakingRatio: null,
        note: 'Staking contract address not configured. Set STAKING_CONTRACT_ADDRESS in the API route.',
      },
      yields: {
        per8Hours: 0.2,
        daily: 0.6,
        weekly: 4.2,
        monthly: 18,
        estimatedAPY: estimatedAPY.toFixed(2),
        compoundFrequency: '8 hours',
      },
      network: {
        name: 'Polygon',
        chainId: 137,
        rpc: 'polygon-rpc.com',
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Staking data API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch staking data',
        message: error instanceof Error ? error.message : 'Unknown error',
        // Return fallback data
        fallback: {
          token: {
            symbol: 'LGNS',
            totalSupply: 792110000,
            price: 6.36,
            marketCap: 5037819600,
          },
          yields: {
            per8Hours: 0.2,
            daily: 0.6,
            weekly: 4.2,
            monthly: 18,
            estimatedAPY: '866.46',
            compoundFrequency: '8 hours',
          },
        },
      },
      { status: 500 }
    );
  }
}
