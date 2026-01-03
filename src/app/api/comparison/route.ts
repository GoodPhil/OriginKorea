import { NextResponse } from 'next/server';

// Default token pairs - using PAIR addresses for BSC, TOKEN addresses for others
// Default token pairs - LGNS, Trump, wkeyDAO, ARK, GOT, AS, $NGP (7 tokens)
// Order: LGNS first, then alphabetically important tokens
const DEFAULT_TOKEN_PAIRS = [
  { id: 'lgns', chain: 'polygon', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01', name: 'LGNS', isPair: false },
  { id: 'trump', chain: 'solana', address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', name: 'Trump', isPair: false },
  { id: 'wkeydao', chain: 'bsc', address: '0x8665a78ccc84d6df2acaa4b207d88c6bc9b70ec5', name: 'wkeyDAO', isPair: true },
  { id: 'ark', chain: 'bsc', address: '0xcaaf3c41a40103a23eeaa4bba468af3cf5b0e0d8', name: 'ARK', isPair: true },
  { id: 'got', chain: 'bsc', address: '0x1831bb2723ced46e1b6c08d2f3ae50b2ab9427b9', name: 'GOT', isPair: true },
  { id: 'as', chain: 'polygon', address: '0x1A9221261dC445D773E66075B9e9E52f40e15AB1', name: 'AS', isPair: true },
  { id: 'ngp', chain: 'bsc', address: '0xf6389f23764ee56f0bd5c3494200fe2f79f243aa', name: '$NGP', isPair: true },
];

interface TokenPair {
  id: string;
  chain: string;
  address: string;
  name: string;
  isPair?: boolean;
}

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  address: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  fdv: number;
  txns24h: number;
  buys24h: number;
  sells24h: number;
  makers24h: number;
  pairCreatedAt: number;
  age: string;
  dexId: string;
  baseToken: { name: string; symbol: string };
  quoteToken: { name: string; symbol: string };
}

interface CachedData {
  tokens: TokenData[];
  timestamp: number;
  key: string;
}

// Cache for 30 seconds - keyed by token list
const cache = new Map<string, CachedData>();
const CACHE_DURATION = 30 * 1000;

function calculateAge(createdAt: number): string {
  const now = Date.now();
  const diff = now - createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years}y ${months % 12}m`;
  }
  if (months > 0) {
    return `${months}m ${days % 30}d`;
  }
  return `${days}d`;
}

// Fetch using /pairs endpoint (for pair addresses)
async function fetchFromPairsEndpoint(pair: TokenPair): Promise<TokenData | null> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/pairs/${pair.chain}/${pair.address}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const pairData = data.pair || (data.pairs && data.pairs[0]);

    if (!pairData) {
      return null;
    }

    return {
      id: pair.id,
      name: pairData.baseToken?.name || pair.name,
      symbol: pairData.baseToken?.symbol || pair.id.toUpperCase(),
      chain: pairData.chainId || pair.chain,
      address: pair.address,
      priceUsd: parseFloat(pairData.priceUsd || '0'),
      priceChange24h: pairData.priceChange?.h24 || 0,
      volume24h: pairData.volume?.h24 || 0,
      liquidity: pairData.liquidity?.usd || 0,
      marketCap: pairData.marketCap || pairData.fdv || 0,
      fdv: pairData.fdv || 0,
      txns24h: (pairData.txns?.h24?.buys || 0) + (pairData.txns?.h24?.sells || 0),
      buys24h: pairData.txns?.h24?.buys || 0,
      sells24h: pairData.txns?.h24?.sells || 0,
      makers24h: pairData.makers?.h24 || 0,
      pairCreatedAt: pairData.pairCreatedAt || Date.now(),
      age: calculateAge(pairData.pairCreatedAt || Date.now()),
      dexId: pairData.dexId || 'unknown',
      baseToken: {
        name: pairData.baseToken?.name || pair.name,
        symbol: pairData.baseToken?.symbol || pair.id.toUpperCase(),
      },
      quoteToken: {
        name: pairData.quoteToken?.name || 'Unknown',
        symbol: pairData.quoteToken?.symbol || '???',
      },
    };
  } catch {
    return null;
  }
}

// Fetch using /tokens endpoint (for token addresses)
async function fetchFromTokensEndpoint(pair: TokenPair): Promise<TokenData | null> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${pair.address}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // /tokens endpoint returns pairs array - find the best pair for the specified chain
    let pairData = null;
    if (data.pairs && data.pairs.length > 0) {
      // Try to find a pair on the specified chain first
      pairData = data.pairs.find((p: { chainId: string }) => p.chainId === pair.chain);
      // If not found, use the first pair (highest liquidity usually)
      if (!pairData) {
        pairData = data.pairs[0];
      }
    }

    if (!pairData) {
      return null;
    }

    return {
      id: pair.id,
      name: pairData.baseToken?.name || pair.name,
      symbol: pairData.baseToken?.symbol || pair.id.toUpperCase(),
      chain: pairData.chainId || pair.chain,
      address: pair.address,
      priceUsd: parseFloat(pairData.priceUsd || '0'),
      priceChange24h: pairData.priceChange?.h24 || 0,
      volume24h: pairData.volume?.h24 || 0,
      liquidity: pairData.liquidity?.usd || 0,
      marketCap: pairData.marketCap || pairData.fdv || 0,
      fdv: pairData.fdv || 0,
      txns24h: (pairData.txns?.h24?.buys || 0) + (pairData.txns?.h24?.sells || 0),
      buys24h: pairData.txns?.h24?.buys || 0,
      sells24h: pairData.txns?.h24?.sells || 0,
      makers24h: pairData.makers?.h24 || 0,
      pairCreatedAt: pairData.pairCreatedAt || Date.now(),
      age: calculateAge(pairData.pairCreatedAt || Date.now()),
      dexId: pairData.dexId || 'unknown',
      baseToken: {
        name: pairData.baseToken?.name || pair.name,
        symbol: pairData.baseToken?.symbol || pair.id.toUpperCase(),
      },
      quoteToken: {
        name: pairData.quoteToken?.name || 'Unknown',
        symbol: pairData.quoteToken?.symbol || '???',
      },
    };
  } catch {
    return null;
  }
}

async function fetchTokenData(pair: TokenPair): Promise<TokenData | null> {
  // Try /pairs endpoint first for BSC tokens (which use pair addresses)
  // Then fallback to /tokens endpoint for other chains
  if (pair.isPair || pair.chain === 'bsc') {
    const result = await fetchFromPairsEndpoint(pair);
    if (result) return result;
  }

  // Try /tokens endpoint
  const tokensResult = await fetchFromTokensEndpoint(pair);
  if (tokensResult) return tokensResult;

  // Final fallback: try /pairs endpoint if not already tried
  if (!pair.isPair && pair.chain !== 'bsc') {
    const pairsResult = await fetchFromPairsEndpoint(pair);
    if (pairsResult) return pairsResult;
  }

  console.error(`No data found for ${pair.id} (${pair.chain}:${pair.address})`);
  return null;
}

function parseTokensParam(tokensParam: string | null): TokenPair[] {
  if (!tokensParam) {
    return DEFAULT_TOKEN_PAIRS;
  }

  try {
    const pairs = tokensParam.split(',').map((token, index) => {
      const [chain, address] = token.split(':');
      if (!chain || !address) {
        return null;
      }

      // Check if this is a known pair address
      const lowerAddress = address.toLowerCase();
      const knownPair = DEFAULT_TOKEN_PAIRS.find(
        p => p.address.toLowerCase() === lowerAddress && p.chain.toLowerCase() === chain.toLowerCase()
      );

      if (knownPair) {
        return knownPair;
      }

      // Determine token ID based on known addresses
      let id = `custom_${index}`;
      if (lowerAddress === '0xeb51d9a39ad5eef215dc0bf39a8821ff804a0f01') {
        id = 'lgns';
      } else if (address === '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN') {
        id = 'trump';
      }

      // BSC addresses are typically pair addresses
      const isPair = chain.toLowerCase() === 'bsc';

      return {
        id,
        chain: chain.toLowerCase(),
        address: address,
        name: `Token ${index + 1}`,
        isPair,
      };
    }).filter((p): p is NonNullable<typeof p> => p !== null) as TokenPair[];

    return pairs.length > 0 ? pairs : DEFAULT_TOKEN_PAIRS;
  } catch {
    return DEFAULT_TOKEN_PAIRS;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');
    const tokenPairs = parseTokensParam(tokensParam);

    // Create cache key from token list
    const cacheKey = tokenPairs.map(t => `${t.chain}:${t.address}`).join('|');

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        tokens: cachedData.tokens,
        cached: true,
        timestamp: cachedData.timestamp,
      });
    }

    // Fetch all tokens in parallel
    const tokenPromises = tokenPairs.map(fetchTokenData);
    const results = await Promise.all(tokenPromises);

    // Filter out null results
    const tokens = results.filter((token): token is TokenData => token !== null);

    // Update cache
    cache.set(cacheKey, {
      tokens,
      timestamp: Date.now(),
      key: cacheKey,
    });

    // Cleanup old cache entries (keep max 50)
    if (cache.size > 50) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < entries.length - 50; i++) {
        cache.delete(entries[i][0]);
      }
    }

    return NextResponse.json({
      tokens,
      cached: false,
      timestamp: Date.now(),
      totalPairs: tokenPairs.length,
      successfulFetches: tokens.length,
    });
  } catch (error) {
    console.error('Comparison API error:', error);

    // Return default tokens on error
    return NextResponse.json({
      tokens: [],
      error: true,
      message: 'Failed to fetch comparison data',
    }, { status: 500 });
  }
}
