import { NextResponse } from 'next/server';

interface SearchResult {
  chainId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  volume24h: number;
  liquidity: { usd: number };
  priceChange24h: number;
  dexId: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], message: 'Query too short' });
  }

  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error('DexScreener API error');
    }

    const data = await response.json();
    const pairs = data.pairs || [];

    // Filter and format results - limit to top 20
    const results = pairs.slice(0, 20).map((pair: SearchResult) => ({
      chainId: pair.chainId,
      pairAddress: pair.pairAddress,
      baseToken: pair.baseToken,
      quoteToken: pair.quoteToken,
      priceUsd: pair.priceUsd,
      volume24h: pair.volume24h || 0,
      liquidity: pair.liquidity?.usd || 0,
      priceChange24h: pair.priceChange24h || 0,
      dexId: pair.dexId,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Token search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
