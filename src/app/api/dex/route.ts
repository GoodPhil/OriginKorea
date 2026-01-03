import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use search endpoint which is more reliable
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=LGNS',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from DexScreener');
    }

    const data = await response.json();

    // Find the LGNS/DAI pair on Polygon
    const lgnsPair = data.pairs?.find(
      (pair: { chainId: string; baseToken: { symbol: string }; quoteToken: { symbol: string } }) =>
        pair.chainId === 'polygon' &&
        pair.baseToken?.symbol === 'LGNS' &&
        pair.quoteToken?.symbol === 'DAI'
    );

    if (lgnsPair) {
      // Calculate buy/sell volumes (estimate based on transaction ratio)
      const totalVolume = lgnsPair.volume?.h24 || 0;
      const buys24h = lgnsPair.txns?.h24?.buys || 0;
      const sells24h = lgnsPair.txns?.h24?.sells || 0;
      const totalTxns = buys24h + sells24h;
      const buyRatio = totalTxns > 0 ? buys24h / totalTxns : 0.5;
      const buyVolume = totalVolume * buyRatio;
      const sellVolume = totalVolume * (1 - buyRatio);

      // Transform to match our expected interface
      const transformedData = {
        pair: {
          priceUsd: lgnsPair.priceUsd || '0',
          priceNative: lgnsPair.priceNative || '0', // Price in DAI
          priceChange: {
            m5: lgnsPair.priceChange?.m5 || 0,
            h1: lgnsPair.priceChange?.h1 || 0,
            h6: lgnsPair.priceChange?.h6 || 0,
            h24: lgnsPair.priceChange?.h24 || 0,
          },
          priceChange24h: lgnsPair.priceChange?.h24 || 0,
          liquidity: {
            usd: lgnsPair.liquidity?.usd || 0,
          },
          volume: {
            h24: lgnsPair.volume?.h24 || 0,
            h6: lgnsPair.volume?.h6 || 0,
            h1: lgnsPair.volume?.h1 || 0,
            buyVolume24h: buyVolume,
            sellVolume24h: sellVolume,
          },
          fdv: lgnsPair.fdv || 0,
          marketCap: lgnsPair.marketCap || 0,
          pairAddress: lgnsPair.pairAddress || '',
          // Add transaction data
          txns: {
            h24: {
              buys: lgnsPair.txns?.h24?.buys || 0,
              sells: lgnsPair.txns?.h24?.sells || 0,
            },
            h6: {
              buys: lgnsPair.txns?.h6?.buys || 0,
              sells: lgnsPair.txns?.h6?.sells || 0,
            },
            h1: {
              buys: lgnsPair.txns?.h1?.buys || 0,
              sells: lgnsPair.txns?.h1?.sells || 0,
            },
          },
          // Add makers (unique traders) with buyers/sellers
          makers: {
            h24: lgnsPair.makers?.h24 || 0,
            h6: lgnsPair.makers?.h6 || 0,
            h1: lgnsPair.makers?.h1 || 0,
            // Estimate buyers/sellers based on transaction ratio
            buyers24h: Math.round((lgnsPair.makers?.h24 || 0) * buyRatio),
            sellers24h: Math.round((lgnsPair.makers?.h24 || 0) * (1 - buyRatio)),
          },
        },
      };

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    throw new Error('LGNS pair not found');
  } catch (error) {
    console.error('API Proxy Error:', error);

    // Return mock data on error
    return NextResponse.json({
      pair: {
        priceUsd: '6.56',
        priceChange24h: -1.42,
        liquidity: {
          usd: 402832455,
        },
        volume: {
          h24: 36748917,
        },
        fdv: 5138616172,
        marketCap: 1092576171,
        pairAddress: '0x882df4B0fB50a229C3B4124EB18c759911485bFb',
        txns: {
          h24: { buys: 156, sells: 142 },
          h6: { buys: 45, sells: 38 },
          h1: { buys: 8, sells: 6 },
        },
        makers: {
          h24: 89,
          h6: 32,
          h1: 12,
        },
      },
    });
  }
}
