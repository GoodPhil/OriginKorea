import { NextResponse } from 'next/server';

// LGNS Token address on Polygon
const TOKEN_ADDRESS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';
const POOL_ADDRESS = '0x882df4B0fB50a229C3B4124EB18c759911485bFb';
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';

interface TokenInfoCache {
  data: {
    maxTotalSupply: string;
    holders: number;
    decimals: number;
    holdersSource: string;
    totalSupplySource: string;
  };
  timestamp: number;
}

// Cache for 5 minutes (shorter for more real-time data)
let cachedTokenInfo: TokenInfoCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  try {
    // Check cache
    if (cachedTokenInfo && Date.now() - cachedTokenInfo.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedTokenInfo.data,
        cached: true,
      });
    }

    // LGNS token uses 9 decimals (not 18)
    const decimals = 9;
    let maxTotalSupply = '791,940,729'; // Default fallback based on GeckoTerminal data
    let totalSupplySource = 'fallback';
    let holders = 0;
    let holdersSource = 'fallback';

    // Method 1: Try GeckoTerminal API first (most reliable for this token)
    try {
      const geckoResponse = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/polygon_pos/tokens/${TOKEN_ADDRESS}`,
        {
          headers: { 'Accept': 'application/json;version=20230302' },
          next: { revalidate: 300 },
        }
      );

      if (geckoResponse.ok) {
        const geckoData = await geckoResponse.json();
        const attributes = geckoData.data?.attributes;

        if (attributes) {
          // Get normalized total supply (already divided by decimals)
          if (attributes.normalized_total_supply) {
            const normalizedSupply = parseFloat(attributes.normalized_total_supply);
            maxTotalSupply = Math.floor(normalizedSupply).toLocaleString();
            totalSupplySource = 'GeckoTerminal';
          } else if (attributes.total_supply) {
            // Fallback: calculate from raw total supply
            const rawSupply = parseFloat(attributes.total_supply);
            const normalizedSupply = rawSupply / Math.pow(10, decimals);
            maxTotalSupply = Math.floor(normalizedSupply).toLocaleString();
            totalSupplySource = 'GeckoTerminal';
          }

          // Get holders if available
          if (attributes.holders && attributes.holders > 0) {
            holders = attributes.holders;
            holdersSource = 'GeckoTerminal';
          }
        }
      }
    } catch (error) {
      console.error('GeckoTerminal fetch error:', error);
    }

    // Method 2: Try PolygonScan API for total supply (as backup)
    if (totalSupplySource === 'fallback' && POLYGONSCAN_API_KEY) {
      try {
        const supplyUrl = `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${TOKEN_ADDRESS}&apikey=${POLYGONSCAN_API_KEY}`;
        const supplyResponse = await fetch(supplyUrl, {
          next: { revalidate: 300 },
        });

        if (supplyResponse.ok) {
          const supplyData = await supplyResponse.json();
          if (supplyData.status === '1' && supplyData.result) {
            const supplyInWei = BigInt(supplyData.result);
            const supplyInTokens = Number(supplyInWei) / Math.pow(10, decimals);
            maxTotalSupply = Math.floor(supplyInTokens).toLocaleString();
            totalSupplySource = 'PolygonScan';
          }
        }
      } catch (error) {
        console.error('PolygonScan supply fetch error:', error);
      }
    }

    // Method 3: Try Moralis API for holders
    if (holders === 0 && MORALIS_API_KEY) {
      try {
        const moralisResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${TOKEN_ADDRESS}/owners?chain=polygon`,
          {
            headers: {
              'Accept': 'application/json',
              'X-API-Key': MORALIS_API_KEY,
            },
            next: { revalidate: 300 },
          }
        );

        if (moralisResponse.ok) {
          const moralisData = await moralisResponse.json();
          if (moralisData.total) {
            holders = moralisData.total;
            holdersSource = 'Moralis';
          }
        }
      } catch (error) {
        console.error('Moralis API error:', error);
      }
    }

    // Method 4: Try PolygonScan token info API for holders
    if (holders === 0 && POLYGONSCAN_API_KEY) {
      try {
        const tokenInfoUrl = `https://api.polygonscan.com/api?module=token&action=tokeninfo&contractaddress=${TOKEN_ADDRESS}&apikey=${POLYGONSCAN_API_KEY}`;
        const tokenInfoResponse = await fetch(tokenInfoUrl, {
          next: { revalidate: 600 },
        });

        if (tokenInfoResponse.ok) {
          const tokenInfoData = await tokenInfoResponse.json();
          if (tokenInfoData.status === '1' && tokenInfoData.result?.[0]?.holdersCount) {
            holders = parseInt(tokenInfoData.result[0].holdersCount, 10);
            holdersSource = 'PolygonScan';
          }
        }
      } catch (error) {
        console.error('PolygonScan token info API error:', error);
      }
    }

    // Fallback: Use known estimate based on DexScreener data
    // This should be updated periodically based on actual holder count
    if (holders === 0) {
      holders = 1812961; // Updated from DexScreener (Jan 2026)
      holdersSource = 'estimate';
    }

    const tokenInfo = {
      maxTotalSupply,
      holders,
      decimals,
      holdersSource,
      totalSupplySource,
    };

    // Update cache
    cachedTokenInfo = {
      data: tokenInfo,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      ...tokenInfo,
      cached: false,
      apiKeyConfigured: {
        polygonscan: !!POLYGONSCAN_API_KEY,
        moralis: !!MORALIS_API_KEY,
      },
    });
  } catch (error) {
    console.error('Token info API error:', error);

    // Return fallback data based on DexScreener known values
    return NextResponse.json({
      maxTotalSupply: '791,940,729',
      holders: 1812961,
      decimals: 9,
      holdersSource: 'error-fallback',
      totalSupplySource: 'error-fallback',
      error: true,
    });
  }
}
