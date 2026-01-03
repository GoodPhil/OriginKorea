import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract Addresses on Polygon
const LGNS_TOKEN_ADDRESS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';
const STAKING_CONTRACT_ADDRESS = '0x1964Ca90474b11FFD08af387b110ba6C96251Bfc';
const TREASURY_ADDRESS = '0x7B9B7d4F870A38e92c9a181B00f9b33cc8Ef5321';
const TURBINE_ADDRESS = '0x07Ff4e06865de4934409Aa6eCea503b08Cc1C78d';
const LP_ADDRESS = '0x882df4b0fb50a229c3b4124eb18c759911485bfb'; // QuickSwap LGNS/USDC LP

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
  // Rebase info
  'function nextRewardAt(uint256 _rate) view returns (uint256)',
  'function rebaseStartTime() view returns (uint256)',
];

// Turbine/Bond Depository ABI
const TURBINE_ABI = [
  'function totalDebt() view returns (uint256)',
  'function currentDebt() view returns (uint256)',
  'function bondPrice() view returns (uint256)',
  'function bondPriceInUSD() view returns (uint256)',
  'function maxPayout() view returns (uint256)',
  'function vestingTerm() view returns (uint256)',
  'function terms() view returns (uint256 controlVariable, uint256 vestingTerm, uint256 minimumPrice, uint256 maxPayout, uint256 fee, uint256 maxDebt)',
];

// QuickSwap LP ABI
const LP_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function totalSupply() view returns (uint256)',
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
      return formatted;
    }
  } catch {
    // Continue to next method
  }

  // Method 2: Try totalStaked()
  try {
    const totalStaked = await stakingContract.totalStaked();
    const formatted = Number(ethers.formatUnits(totalStaked, decimals));
    if (formatted > 0) {
      return formatted;
    }
  } catch {
    // Continue to next method
  }

  // Method 3: Try contractBalance()
  try {
    const contractBalance = await stakingContract.contractBalance();
    const formatted = Number(ethers.formatUnits(contractBalance, decimals));
    if (formatted > 0) {
      return formatted;
    }
  } catch {
    // Continue to next method
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

// Get Epoch data for rebase countdown
async function getEpochData(stakingContract: ethers.Contract, provider: ethers.JsonRpcProvider) {
  try {
    const epoch = await stakingContract.epoch();
    const currentBlock = await provider.getBlockNumber();

    // Polygon average block time is ~2 seconds
    const blocksRemaining = Number(epoch.endBlock) - currentBlock;
    const secondsRemaining = Math.max(0, blocksRemaining * 2);

    return {
      length: Number(epoch.length),
      number: Number(epoch.number),
      endBlock: Number(epoch.endBlock),
      distribute: Number(epoch.distribute),
      currentBlock,
      blocksRemaining: Math.max(0, blocksRemaining),
      secondsRemaining,
      nextRebaseTime: new Date(Date.now() + secondsRemaining * 1000).toISOString(),
      isLive: true,
    };
  } catch {
    // Fallback: Calculate based on 8-hour intervals
    const now = new Date();
    const hours = now.getUTCHours();
    const rebaseHours = [0, 8, 16]; // UTC times for rebases

    let nextRebaseHour = rebaseHours.find(h => h > hours) ?? rebaseHours[0] + 24;
    const nextRebase = new Date(now);
    nextRebase.setUTCHours(nextRebaseHour, 0, 0, 0);
    if (nextRebaseHour <= hours) {
      nextRebase.setDate(nextRebase.getDate() + 1);
    }

    const secondsRemaining = Math.floor((nextRebase.getTime() - now.getTime()) / 1000);

    return {
      length: 28800, // 8 hours in seconds
      number: null,
      endBlock: null,
      distribute: null,
      currentBlock: null,
      blocksRemaining: null,
      secondsRemaining,
      nextRebaseTime: nextRebase.toISOString(),
      isLive: false,
    };
  }
}

// Get Staking Index
async function getStakingIndex(stakingContract: ethers.Contract): Promise<number | null> {
  try {
    const index = await stakingContract.index();
    return Number(ethers.formatUnits(index, 9)); // Usually 9 decimals for index
  } catch {
    return null;
  }
}

// Get Turbine/Bond data
async function getTurbineData(provider: ethers.JsonRpcProvider, lgnsPrice: number) {
  try {
    const turbineContract = new ethers.Contract(TURBINE_ADDRESS, TURBINE_ABI, provider);

    const [bondPrice, totalDebt] = await Promise.allSettled([
      turbineContract.bondPrice(),
      turbineContract.totalDebt(),
    ]);

    // Calculate bond discount
    let discount = null;
    let bondPriceUSD = null;
    if (bondPrice.status === 'fulfilled') {
      bondPriceUSD = Number(ethers.formatUnits(bondPrice.value, 18));
      discount = ((lgnsPrice - bondPriceUSD) / lgnsPrice) * 100;
    }

    return {
      address: TURBINE_ADDRESS,
      bondPrice: bondPriceUSD,
      discount: discount,
      totalDebt: totalDebt.status === 'fulfilled' ? Number(ethers.formatUnits(totalDebt.value, 18)) : null,
      isLive: bondPrice.status === 'fulfilled',
    };
  } catch {
    return {
      address: TURBINE_ADDRESS,
      bondPrice: null,
      discount: null,
      totalDebt: null,
      isLive: false,
    };
  }
}

// Get Liquidity Pool data
async function getLiquidityData(provider: ethers.JsonRpcProvider) {
  try {
    const lpContract = new ethers.Contract(LP_ADDRESS, LP_ABI, provider);

    const [reserves, token0, token1, totalSupply] = await Promise.all([
      lpContract.getReserves(),
      lpContract.token0(),
      lpContract.token1(),
      lpContract.totalSupply(),
    ]);

    // Determine which reserve is LGNS and which is USDC
    const isToken0LGNS = token0.toLowerCase() === LGNS_TOKEN_ADDRESS.toLowerCase();
    const lgnsReserve = isToken0LGNS ? Number(reserves.reserve0) : Number(reserves.reserve1);
    const usdcReserve = isToken0LGNS ? Number(reserves.reserve1) : Number(reserves.reserve0);

    // LGNS has 18 decimals, USDC has 6 decimals
    const lgnsReserveFormatted = lgnsReserve / 1e18;
    const usdcReserveFormatted = usdcReserve / 1e6;

    // Calculate price from reserves
    const priceFromLP = usdcReserveFormatted / lgnsReserveFormatted;

    // Total liquidity in USD (2 * USDC reserve since it's a 50/50 pool)
    const totalLiquidityUSD = usdcReserveFormatted * 2;

    return {
      address: LP_ADDRESS,
      token0,
      token1,
      lgnsReserve: lgnsReserveFormatted,
      usdcReserve: usdcReserveFormatted,
      totalLiquidityUSD,
      priceFromLP,
      totalSupply: Number(ethers.formatUnits(totalSupply, 18)),
      lastUpdate: Number(reserves.blockTimestampLast),
      isLive: true,
    };
  } catch {
    return {
      address: LP_ADDRESS,
      lgnsReserve: null,
      usdcReserve: null,
      totalLiquidityUSD: null,
      priceFromLP: null,
      totalSupply: null,
      isLive: false,
    };
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
    let volume24h = 0;
    try {
      const dexResponse = await fetch(
        'https://api.dexscreener.com/latest/dex/pairs/polygon/0x882df4b0fb50a229c3b4124eb18c759911485bfb',
        { next: { revalidate: 60 } }
      );
      const dexData = await dexResponse.json();
      if (dexData?.pair?.priceUsd) {
        lgnsPrice = parseFloat(dexData.pair.priceUsd);
        priceChange24h = parseFloat(dexData.pair.priceChange?.h24 || '0');
        volume24h = parseFloat(dexData.pair.volume?.h24 || '0');
      }
    } catch (e) {
      console.error('Failed to fetch LGNS price:', e);
    }

    // Calculate market cap
    const marketCap = formattedTotalSupply * lgnsPrice;

    // Get all data in parallel
    const [stakingBalance, treasuryBalance, epochData, stakingIndex, turbineData, liquidityData] = await Promise.all([
      getStakingBalance(stakingContract, lgnsContract, Number(decimals)),
      getTreasuryBalance(lgnsContract, Number(decimals)),
      getEpochData(stakingContract, provider),
      getStakingIndex(stakingContract),
      getTurbineData(provider, lgnsPrice),
      getLiquidityData(provider),
    ]);

    // Calculate Treasury backing ratio
    const treasuryBackingRatio = treasuryBalance > 0 && marketCap > 0
      ? (treasuryBalance * lgnsPrice / marketCap) * 100
      : null;

    // Calculate staking data
    const stakingData = {
      totalStaked: stakingBalance,
      totalStakedUSD: stakingBalance ? stakingBalance * lgnsPrice : null,
      stakingRatio: stakingBalance ? (stakingBalance / formattedTotalSupply) * 100 : null,
      index: stakingIndex,
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
        volume24h,
        marketCap,
      },
      staking: stakingData,
      epoch: epochData,
      treasury: {
        address: TREASURY_ADDRESS,
        balance: treasuryBalance,
        balanceUSD: treasuryBalance * lgnsPrice,
        backingRatio: treasuryBackingRatio,
      },
      turbine: turbineData,
      liquidity: liquidityData,
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
        lp: LP_ADDRESS,
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
          lp: LP_ADDRESS,
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
