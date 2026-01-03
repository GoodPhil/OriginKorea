import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract Addresses on Polygon
const LGNS_TOKEN_ADDRESS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';
const STAKING_CONTRACT_ADDRESS = '0x1964Ca90474b11FFD08af387b110ba6C96251Bfc';
const TREASURY_ADDRESS = '0x7B9B7d4F870A38e92c9a181B00f9b33cc8Ef5321';
const TURBINE_ADDRESS = '0x07Ff4e06865de4934409Aa6eCea503b08Cc1C78d';

// Polygon RPC endpoints
const RPC_ENDPOINTS = [
  'https://polygon-rpc.com',
  'https://rpc-mainnet.matic.network',
  'https://rpc-mainnet.maticvigil.com',
  'https://polygon.llamarpc.com',
  'https://polygon-mainnet.public.blastapi.io',
];

// ERC20 ABI for balance and supply queries
const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];

// Origin Staking Contract ABI (common staking functions)
const STAKING_ABI = [
  // Common staking functions
  'function totalStaked() view returns (uint256)',
  'function stakingToken() view returns (address)',
  'function rewardRate() view returns (uint256)',
  // OHM-fork style staking
  'function epoch() view returns (uint256 length, uint256 number, uint256 endBlock, uint256 distribute)',
  'function index() view returns (uint256)',
  'function contractBalance() view returns (uint256)',
  // Alternative naming conventions
  'function totalValueLocked() view returns (uint256)',
  'function getTotalStaked() view returns (uint256)',
  'function stakedBalance() view returns (uint256)',
];

// Turbine/Bond Depository ABI
const TURBINE_ABI = [
  'function totalDebt() view returns (uint256)',
  'function currentDebt() view returns (uint256)',
];

async function getProvider() {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber();
      return provider;
    } catch {
      continue;
    }
  }
  throw new Error('All RPC endpoints failed');
}

// Try multiple function calls to get staking balance
async function getStakingBalance(stakingContract: ethers.Contract, lgnsContract: ethers.Contract, decimals: number): Promise<number | null> {
  // Method 1: Try balanceOf on LGNS token for staking contract
  try {
    const balance = await lgnsContract.balanceOf(STAKING_CONTRACT_ADDRESS);
    const formatted = Number(ethers.formatUnits(balance, decimals));
    if (formatted > 0) {
      console.log('Staking balance from balanceOf:', formatted);
      return formatted;
    }
  } catch (e) {
    console.log('balanceOf failed:', e);
  }

  // Method 2: Try totalStaked()
  try {
    const totalStaked = await stakingContract.totalStaked();
    const formatted = Number(ethers.formatUnits(totalStaked, decimals));
    if (formatted > 0) {
      console.log('Staking balance from totalStaked:', formatted);
      return formatted;
    }
  } catch (e) {
    console.log('totalStaked failed:', e);
  }

  // Method 3: Try contractBalance()
  try {
    const contractBalance = await stakingContract.contractBalance();
    const formatted = Number(ethers.formatUnits(contractBalance, decimals));
    if (formatted > 0) {
      console.log('Staking balance from contractBalance:', formatted);
      return formatted;
    }
  } catch (e) {
    console.log('contractBalance failed:', e);
  }

  // Method 4: Try getTotalStaked()
  try {
    const getTotalStaked = await stakingContract.getTotalStaked();
    const formatted = Number(ethers.formatUnits(getTotalStaked, decimals));
    if (formatted > 0) {
      console.log('Staking balance from getTotalStaked:', formatted);
      return formatted;
    }
  } catch (e) {
    console.log('getTotalStaked failed:', e);
  }

  return null;
}

// Get Treasury balance
async function getTreasuryBalance(lgnsContract: ethers.Contract, decimals: number): Promise<number> {
  try {
    const balance = await lgnsContract.balanceOf(TREASURY_ADDRESS);
    return Number(ethers.formatUnits(balance, decimals));
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const provider = await getProvider();

    // Get LGNS token data
    const lgnsContract = new ethers.Contract(LGNS_TOKEN_ADDRESS, ERC20_ABI, provider);
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);

    const [totalSupply, decimals, name, symbol] = await Promise.all([
      lgnsContract.totalSupply(),
      lgnsContract.decimals(),
      lgnsContract.name(),
      lgnsContract.symbol(),
    ]);

    const formattedTotalSupply = Number(ethers.formatUnits(totalSupply, decimals));

    // Get current LGNS price from DexScreener
    let lgnsPrice = 6.36;
    let priceChange24h = 0;
    try {
      const dexResponse = await fetch(
        'https://api.dexscreener.com/latest/dex/pairs/polygon/0x882df4b0fb50a229c3b4124eb18c759911485bfb',
        { next: { revalidate: 60 } }
      );
      const dexData = await dexResponse.json();
      if (dexData?.pair?.priceUsd) {
        lgnsPrice = parseFloat(dexData.pair.priceUsd);
        priceChange24h = parseFloat(dexData.pair.priceChange?.h24 || '0');
      }
    } catch (e) {
      console.error('Failed to fetch LGNS price:', e);
    }

    // Calculate market cap
    const marketCap = formattedTotalSupply * lgnsPrice;

    // Get staking data
    const [stakingBalance, treasuryBalance] = await Promise.all([
      getStakingBalance(stakingContract, lgnsContract, Number(decimals)),
      getTreasuryBalance(lgnsContract, Number(decimals)),
    ]);

    // Calculate staking data
    const stakingData = {
      totalStaked: stakingBalance,
      totalStakedUSD: stakingBalance ? stakingBalance * lgnsPrice : null,
      stakingRatio: stakingBalance ? (stakingBalance / formattedTotalSupply) * 100 : null,
      treasuryBalance,
      treasuryBalanceUSD: treasuryBalance * lgnsPrice,
      contractAddress: STAKING_CONTRACT_ADDRESS,
      isLive: stakingBalance !== null,
    };

    // Calculate estimated APY based on LGNS DeFi system (0.2% per 8 hours compound)
    const yieldPer8Hours = 0.2 / 100;
    const compoundsPerYear = 365 * 3;
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
        priceChange24h,
        marketCap,
      },
      staking: stakingData,
      treasury: {
        address: TREASURY_ADDRESS,
        balance: treasuryBalance,
        balanceUSD: treasuryBalance * lgnsPrice,
      },
      turbine: {
        address: TURBINE_ADDRESS,
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
        blockNumber: await provider.getBlockNumber(),
      },
      contracts: {
        lgnsToken: LGNS_TOKEN_ADDRESS,
        staking: STAKING_CONTRACT_ADDRESS,
        treasury: TREASURY_ADDRESS,
        turbine: TURBINE_ADDRESS,
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
        contracts: {
          lgnsToken: LGNS_TOKEN_ADDRESS,
          staking: STAKING_CONTRACT_ADDRESS,
          treasury: TREASURY_ADDRESS,
          turbine: TURBINE_ADDRESS,
        },
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
