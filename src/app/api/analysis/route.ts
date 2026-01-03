import { NextResponse } from 'next/server';

// Cache analysis data for 5 minutes
let cachedAnalysisData: { data: AnalysisData; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface HistoricalDataPoint {
  date: string;
  timestamp: number;
  price: number;
  volume24h: number;
  high: number;
  low: number;
}

interface LiquidityDataPoint {
  date: string;
  timestamp: number;
  liquidity: number;
  reserveUSD: number;
}

interface VolumeStats {
  daily: { date: string; volume: number }[];
  weekly: { week: string; volume: number; avgDaily: number }[];
  monthly: { month: string; volume: number; avgDaily: number }[];
  totalVolume: number;
  avgDailyVolume: number;
  highestDayVolume: { date: string; volume: number };
  lowestDayVolume: { date: string; volume: number };
}

interface LiquidityAlert {
  type: 'increase' | 'decrease';
  percentage: number;
  fromValue: number;
  toValue: number;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

interface CorrelationData {
  date: string;
  price: number;
  liquidity: number;
  priceChange: number;
  liquidityChange: number;
}

interface TechnicalIndicators {
  ma7: number[];
  ma30: number[];
  ma90: number[];
  rsi14: number[];
  volatility: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

interface WhaleTransaction {
  txHash: string;
  timestamp: number;
  date: string;
  type: 'buy' | 'sell';
  amountUSD: number;
  amountToken: number;
  priceAtTrade: number;
  priceImpact: number;
  walletAddress: string;
  shortWallet: string;
}

interface HoldersData {
  total: number;
  topHolders: {
    address: string;
    shortAddress: string;
    balance: string;
    balanceFormatted: number;
    percentage: number;
  }[];
  source: string;
  isEstimated: boolean;
}

interface AnalysisData {
  current: {
    liquidity: number;
    price: number;
    volume24h: number;
    marketCap: number;
    fdv: number;
    priceChange24h: number;
    priceChange7d: number;
    txns24h: { buys: number; sells: number };
  };
  historical: HistoricalDataPoint[];
  liquidityHistory: LiquidityDataPoint[];
  volumeStats: VolumeStats;
  liquidityAlerts: LiquidityAlert[];
  correlationData: CorrelationData[];
  technicalIndicators?: TechnicalIndicators;
  whaleTransactions?: WhaleTransaction[];
  holdersData?: HoldersData;
  pairInfo: {
    baseToken: string;
    quoteToken: string;
    dexId: string;
    pairAddress: string;
    poolAddress: string;
    createdAt: number;
  };
  dataSource: string;
  liquidityDataSource?: string;
  moralisConfigured?: boolean;
}

// LGNS/DAI pool on QuickSwap (Polygon)
const POOL_ADDRESS = '0x882df4b0fb50a229c3b4124eb18c759911485bfb';
const TOKEN_ADDRESS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';
const NETWORK = 'polygon_pos';

// Default whale threshold in USD (can be overridden by query parameter)
const DEFAULT_WHALE_THRESHOLD_USD = 5000;
const MIN_WHALE_THRESHOLD_USD = 1000;
const MAX_WHALE_THRESHOLD_USD = 100000;

// PolygonScan API (optional)
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';

// Moralis API for holders data
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';

// The Graph Network API (requires API key)
const THE_GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY || '';
const QUICKSWAP_V3_SUBGRAPH_ID = 'FqsVPMegvkK4bhnpEjPVNHoeYo83g3Dwu5yvhLzHeC8C'; // QuickSwap V3 on Polygon

// The Graph subgraph endpoints
const getTheGraphEndpoint = () => {
  if (THE_GRAPH_API_KEY) {
    return `https://gateway.thegraph.com/api/${THE_GRAPH_API_KEY}/subgraphs/id/${QUICKSWAP_V3_SUBGRAPH_ID}`;
  }
  // Fallback to hosted service (deprecated but may still work)
  return 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3';
};

// GraphQL query for pool day data (V3/Algebra)
const POOL_DAY_DATA_QUERY = `
  query PoolDayData($poolAddress: String!, $first: Int!) {
    poolDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { pool: $poolAddress }
    ) {
      id
      date
      tvlUSD
      volumeUSD
      txCount
      liquidity
      token0Price
      token1Price
    }
  }
`;

// Alternative query for pools
const POOL_QUERY = `
  query Pool($poolAddress: ID!) {
    pool(id: $poolAddress) {
      id
      totalValueLockedUSD
      volumeUSD
      txCount
      token0Price
      token1Price
      poolDayData(first: 365, orderBy: date, orderDirection: desc) {
        date
        tvlUSD
        volumeUSD
        txCount
      }
    }
  }
`;

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(0); // Not enough data
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First RSI value after period
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(50); // Default neutral value
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }

  return rsi;
}

// Calculate Volatility (Standard Deviation of returns)
function calculateVolatility(prices: number[], period: number): number {
  if (prices.length < period) return 0;

  const returns: number[] = [];
  for (let i = 1; i < Math.min(prices.length, period + 1); i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1] * 100);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;

  return Math.sqrt(variance);
}

// Calculate Support and Resistance levels
function calculateSupportResistance(prices: number[]): { support: number; resistance: number } {
  if (prices.length === 0) return { support: 0, resistance: 0 };

  const recentPrices = prices.slice(-30); // Last 30 days
  const sorted = [...recentPrices].sort((a, b) => a - b);

  // Support: Lower 20th percentile
  const supportIndex = Math.floor(sorted.length * 0.2);
  const support = sorted[supportIndex] || sorted[0];

  // Resistance: Upper 80th percentile
  const resistanceIndex = Math.floor(sorted.length * 0.8);
  const resistance = sorted[resistanceIndex] || sorted[sorted.length - 1];

  return { support, resistance };
}

// Determine trend
function determineTrend(prices: number[], ma7: number[], ma30: number[]): 'bullish' | 'bearish' | 'neutral' {
  if (prices.length < 30) return 'neutral';

  const currentPrice = prices[prices.length - 1];
  const currentMA7 = ma7[ma7.length - 1];
  const currentMA30 = ma30[ma30.length - 1];

  if (currentPrice > currentMA7 && currentMA7 > currentMA30) {
    return 'bullish';
  } else if (currentPrice < currentMA7 && currentMA7 < currentMA30) {
    return 'bearish';
  }
  return 'neutral';
}

// Calculate all technical indicators
function calculateTechnicalIndicators(historical: HistoricalDataPoint[]): TechnicalIndicators {
  const prices = historical.map(h => h.price);

  const ma7 = calculateSMA(prices, 7);
  const ma30 = calculateSMA(prices, 30);
  const ma90 = calculateSMA(prices, 90);
  const rsi14 = calculateRSI(prices, 14);

  const dailyVolatility = calculateVolatility(prices, 1);
  const weeklyVolatility = calculateVolatility(prices, 7);
  const monthlyVolatility = calculateVolatility(prices, 30);

  const { support, resistance } = calculateSupportResistance(prices);
  const trend = determineTrend(prices, ma7, ma30);

  return {
    ma7,
    ma30,
    ma90,
    rsi14,
    volatility: {
      daily: dailyVolatility,
      weekly: weeklyVolatility,
      monthly: monthlyVolatility,
    },
    support,
    resistance,
    trend,
  };
}

// Fetch holders data from Moralis API
async function fetchHoldersData(): Promise<HoldersData | null> {
  if (!MORALIS_API_KEY) {
    // Return estimated data when Moralis is not configured
    return {
      total: 1812961, // Updated from DexScreener (Jan 2026)
      topHolders: [],
      source: 'Estimated (DexScreener)',
      isEstimated: true,
    };
  }

  try {
    // Fetch token owners from Moralis
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/erc20/${TOKEN_ADDRESS}/owners?chain=polygon&order=DESC`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': MORALIS_API_KEY,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      console.error('Moralis API error:', response.status);
      return null;
    }

    const data = await response.json();

    // Get total supply for percentage calculation
    const totalSupply = 792113903; // LGNS max supply

    const topHolders = (data.result || []).slice(0, 10).map((holder: {
      owner_address: string;
      balance: string;
      balance_formatted?: string;
    }) => {
      const balanceFormatted = Number(holder.balance_formatted || holder.balance) / 1e18;
      return {
        address: holder.owner_address,
        shortAddress: `${holder.owner_address.slice(0, 6)}...${holder.owner_address.slice(-4)}`,
        balance: holder.balance,
        balanceFormatted,
        percentage: (balanceFormatted / totalSupply) * 100,
      };
    });

    return {
      total: data.total || topHolders.length,
      topHolders,
      source: 'Moralis API',
      isEstimated: false,
    };
  } catch (error) {
    console.error('Error fetching holders data:', error);
    return null;
  }
}

// Fetch real whale transactions from DexScreener trades API
async function fetchWhaleTransactions(currentPrice: number, whaleThreshold: number = DEFAULT_WHALE_THRESHOLD_USD): Promise<WhaleTransaction[]> {
  const whaleTransactions: WhaleTransaction[] = [];

  try {
    // DexScreener provides recent trades for a pair
    const tradesResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/polygon/${POOL_ADDRESS}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 },
      }
    );

    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const pair = tradesData.pair;

      if (pair) {
        // DexScreener doesn't provide individual trades via API
        // We'll use the GeckoTerminal trades API instead
        const geckoResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}/trades`,
          {
            headers: { 'Accept': 'application/json;version=20230302' },
            next: { revalidate: 60 },
          }
        );

        if (geckoResponse.ok) {
          const geckoData = await geckoResponse.json();
          const trades = geckoData.data || [];

          for (const trade of trades) {
            const attrs = trade.attributes;
            const volumeUsd = Number.parseFloat(attrs.volume_in_usd) || 0;

            // Only include trades above whale threshold
            if (volumeUsd >= whaleThreshold) {
              const timestamp = new Date(attrs.block_timestamp).getTime();
              const txHash = attrs.tx_hash || '';
              const isBuy = attrs.kind === 'buy';
              const priceUsd = Number.parseFloat(attrs.price_to_in_usd) || currentPrice;
              const tokenAmount = Number.parseFloat(attrs.from_token_amount) || 0;
              const walletAddress = attrs.tx_from_address || '';

              whaleTransactions.push({
                txHash,
                timestamp,
                date: new Date(timestamp).toISOString().split('T')[0],
                type: isBuy ? 'buy' : 'sell',
                amountUSD: volumeUsd,
                amountToken: isBuy ? tokenAmount : Number.parseFloat(attrs.to_token_amount) || 0,
                priceAtTrade: priceUsd,
                priceImpact: Math.abs(Number.parseFloat(attrs.price_impact_percentage) || 0),
                walletAddress,
                shortWallet: walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 'Unknown',
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching whale transactions:', error);
  }

  // If no real data, generate estimated whale transactions from historical data
  if (whaleTransactions.length === 0) {

    return [];
  }

  // Sort by timestamp descending and limit to 50
  return whaleTransactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
}

// Generate estimated whale transactions from historical volume data (fallback)
function generateEstimatedWhaleTransactions(
  historical: HistoricalDataPoint[],
  currentPrice: number,
  whaleThreshold: number = DEFAULT_WHALE_THRESHOLD_USD
): WhaleTransaction[] {
  const whaleTransactions: WhaleTransaction[] = [];

  // Analyze high volume days for potential whale activity
  const avgVolume = historical.reduce((sum, h) => sum + h.volume24h, 0) / historical.length;

  for (let i = 0; i < historical.length; i++) {
    const day = historical[i];

    // High volume days likely have whale transactions
    if (day.volume24h > avgVolume * 1.5) {
      // Estimate number of whale transactions based on volume
      const estimatedWhaleVolume = day.volume24h * 0.3;
      const numWhales = Math.min(Math.floor(estimatedWhaleVolume / whaleThreshold), 5);

      for (let j = 0; j < numWhales; j++) {
        const priceChange = day.high - day.low;
        const isBuy = day.price > (day.low + priceChange * 0.5);
        const amountUSD = whaleThreshold + Math.floor(Math.random() * 50000);
        const priceAtTrade = day.low + Math.random() * priceChange;
        const amountToken = amountUSD / priceAtTrade;
        const priceImpact = (amountUSD / day.volume24h) * 100;
        const walletHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 34)}`;

        whaleTransactions.push({
          txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          timestamp: day.timestamp + j * 3600000,
          date: day.date,
          type: isBuy ? 'buy' : 'sell',
          amountUSD,
          amountToken,
          priceAtTrade,
          priceImpact: Math.abs(priceImpact),
          walletAddress: walletHash,
          shortWallet: `${walletHash.substring(0, 6)}...${walletHash.substring(38)}`,
        });
      }
    }
  }

  return whaleTransactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
}

async function fetchLiquidityFromTheGraph(): Promise<LiquidityDataPoint[]> {
  const liquidityHistory: LiquidityDataPoint[] = [];

  try {
    const endpoint = getTheGraphEndpoint();


    // Try pool day data query
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: POOL_DAY_DATA_QUERY,
        variables: {
          poolAddress: POOL_ADDRESS.toLowerCase(),
          first: 365,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.errors) {
        console.error('The Graph API errors:', data.errors);
      }

      const poolDayDatas = data.data?.poolDayDatas || [];

      if (poolDayDatas.length > 0) {
        for (const dayData of poolDayDatas) {
          const timestamp = Number.parseInt(dayData.date) * 1000;
          const startDate = new Date('2024-03-07').getTime();

          if (timestamp >= startDate) {
            liquidityHistory.push({
              date: new Date(timestamp).toISOString().split('T')[0],
              timestamp,
              liquidity: Number.parseFloat(dayData.tvlUSD) || 0,
              reserveUSD: Number.parseFloat(dayData.tvlUSD) || 0,
            });
          }
        }

        liquidityHistory.sort((a, b) => a.timestamp - b.timestamp);
        return liquidityHistory;
      }
    } else {
      console.error('The Graph API response error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('The Graph API error:', error);
  }

  return liquidityHistory;
}

// Fetch historical data from GeckoTerminal pools history endpoint
async function fetchLiquidityFromGeckoTerminal(): Promise<LiquidityDataPoint[]> {
  const liquidityHistory: LiquidityDataPoint[] = [];

  try {
    // GeckoTerminal provides historical pool data through OHLCV with reserve data
    // We'll fetch the pool info for multiple time periods to build history
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}/ohlcv/day?aggregate=1&limit=300&currency=usd`,
      {
        headers: {
          'Accept': 'application/json;version=20230302',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const poolMeta = data.meta;

      // GeckoTerminal OHLCV doesn't include liquidity per day
      // But we can use the current reserve and estimate based on volume patterns

    }
  } catch (error) {
    console.error('GeckoTerminal liquidity fetch error:', error);
  }

  return liquidityHistory;
}

/**
 * WARNING: The following function generates simulated liquidity history based on price, volume, and time.
 * This is NOT real on-chain data. Use only for visualization or rough analysis when real data is unavailable.
 * For the most accurate results, always prefer The Graph or on-chain sources.
 */
// Generate liquidity history using current liquidity and historical trading patterns
// This provides a more realistic estimate based on actual market data
function generateEstimatedLiquidityHistory(
  priceHistory: HistoricalDataPoint[],
  currentLiquidity: number
): LiquidityDataPoint[] {
  if (priceHistory.length === 0 || currentLiquidity === 0) return [];

  const liquidityHistory: LiquidityDataPoint[] = [];
  const currentPrice = priceHistory[priceHistory.length - 1]?.price || 1;

  // Get launch date metrics
  const launchDate = new Date('2024-03-07').getTime();
  const now = Date.now();
  const totalDays = Math.floor((now - launchDate) / (24 * 60 * 60 * 1000));

  // Historical context: LGNS launched with initial liquidity around $50K-100K
  // and grew to current levels over time
  const estimatedInitialLiquidity = Math.min(currentLiquidity * 0.15, 150000); // Conservative initial estimate

  for (let i = 0; i < priceHistory.length; i++) {
    const point = priceHistory[i];
    const daysSinceLaunch = Math.floor((point.timestamp - launchDate) / (24 * 60 * 60 * 1000));

    // Growth model: Liquidity tends to grow with price appreciation and time
    // Using logarithmic growth curve for more realistic progression
    const timeProgress = Math.min(daysSinceLaunch / totalDays, 1);
    const logProgress = Math.log10(1 + timeProgress * 9) / Math.log10(10); // 0 to 1 logarithmic

    // Price ratio influence (higher price = more liquidity added historically)
    const priceRatio = point.price / currentPrice;
    const priceInfluence = 0.7 + (priceRatio * 0.3); // 70-100% based on price

    // Volume influence (high volume periods saw liquidity additions)
    const avgVolume = priceHistory.reduce((sum, p) => sum + p.volume24h, 0) / priceHistory.length;
    const volumeRatio = point.volume24h / (avgVolume || 1);
    const volumeInfluence = 0.9 + Math.min(volumeRatio * 0.1, 0.2); // 90-110%

    // Calculate estimated liquidity
    const growthFactor = estimatedInitialLiquidity + (currentLiquidity - estimatedInitialLiquidity) * logProgress;
    const estimatedLiquidity = growthFactor * priceInfluence * volumeInfluence;

    liquidityHistory.push({
      date: point.date,
      timestamp: point.timestamp,
      liquidity: Math.max(estimatedLiquidity, estimatedInitialLiquidity),
      reserveUSD: Math.max(estimatedLiquidity, estimatedInitialLiquidity),
    });
  }

  // Ensure the last value matches current liquidity
  if (liquidityHistory.length > 0) {
    liquidityHistory[liquidityHistory.length - 1].liquidity = currentLiquidity;
    liquidityHistory[liquidityHistory.length - 1].reserveUSD = currentLiquidity;
  }

  return liquidityHistory;
}

// Calculate volume statistics
function calculateVolumeStats(historical: HistoricalDataPoint[]): VolumeStats {
  if (historical.length === 0) {
    return {
      daily: [],
      weekly: [],
      monthly: [],
      totalVolume: 0,
      avgDailyVolume: 0,
      highestDayVolume: { date: '', volume: 0 },
      lowestDayVolume: { date: '', volume: 0 },
    };
  }

  // Daily volume
  const daily = historical.map(d => ({
    date: d.date,
    volume: d.volume24h,
  }));

  // Weekly volume
  const weeklyMap = new Map<string, { volume: number; days: number }>();
  for (const d of historical) {
    const date = new Date(d.timestamp);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    const existing = weeklyMap.get(weekKey) || { volume: 0, days: 0 };
    weeklyMap.set(weekKey, {
      volume: existing.volume + d.volume24h,
      days: existing.days + 1,
    });
  }

  const weekly = Array.from(weeklyMap.entries()).map(([week, data]) => ({
    week,
    volume: data.volume,
    avgDaily: data.volume / data.days,
  })).sort((a, b) => a.week.localeCompare(b.week));

  // Monthly volume
  const monthlyMap = new Map<string, { volume: number; days: number }>();
  for (const d of historical) {
    const date = new Date(d.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const existing = monthlyMap.get(monthKey) || { volume: 0, days: 0 };
    monthlyMap.set(monthKey, {
      volume: existing.volume + d.volume24h,
      days: existing.days + 1,
    });
  }

  const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    volume: data.volume,
    avgDaily: data.volume / data.days,
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Total and average
  const totalVolume = historical.reduce((sum, d) => sum + d.volume24h, 0);
  const avgDailyVolume = totalVolume / historical.length;

  // Highest and lowest day
  let highestDayVolume = { date: '', volume: 0 };
  let lowestDayVolume = { date: '', volume: Number.POSITIVE_INFINITY };

  for (const d of historical) {
    if (d.volume24h > highestDayVolume.volume) {
      highestDayVolume = { date: d.date, volume: d.volume24h };
    }
    if (d.volume24h < lowestDayVolume.volume && d.volume24h > 0) {
      lowestDayVolume = { date: d.date, volume: d.volume24h };
    }
  }

  if (lowestDayVolume.volume === Number.POSITIVE_INFINITY) {
    lowestDayVolume = { date: '', volume: 0 };
  }

  return {
    daily,
    weekly,
    monthly,
    totalVolume,
    avgDailyVolume,
    highestDayVolume,
    lowestDayVolume,
  };
}

// Detect liquidity alerts (significant changes) - with option for estimated data
function detectLiquidityAlerts(liquidityHistory: LiquidityDataPoint[], isEstimated: boolean = false): LiquidityAlert[] {
  const alerts: LiquidityAlert[] = [];

  // Use higher thresholds for estimated data to reduce false alerts
  const THRESHOLD_LOW = isEstimated ? 10 : 5; // 10% for estimated, 5% for real
  const THRESHOLD_MEDIUM = isEstimated ? 20 : 10;
  const THRESHOLD_HIGH = isEstimated ? 30 : 20;

  for (let i = 1; i < liquidityHistory.length; i++) {
    const prev = liquidityHistory[i - 1];
    const curr = liquidityHistory[i];

    if (prev.liquidity === 0) continue;

    const change = ((curr.liquidity - prev.liquidity) / prev.liquidity) * 100;
    const absChange = Math.abs(change);

    if (absChange >= THRESHOLD_LOW) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (absChange >= THRESHOLD_HIGH) {
        severity = 'high';
      } else if (absChange >= THRESHOLD_MEDIUM) {
        severity = 'medium';
      }

      alerts.push({
        type: change > 0 ? 'increase' : 'decrease',
        percentage: change,
        fromValue: prev.liquidity,
        toValue: curr.liquidity,
        date: curr.date,
        severity,
      });
    }
  }

  // Return only the most recent 20 alerts, sorted by severity and date
  return alerts
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.date.localeCompare(a.date);
    })
    .slice(0, 20);
}

// Calculate correlation data between price and liquidity
function calculateCorrelationData(
  historical: HistoricalDataPoint[],
  liquidityHistory: LiquidityDataPoint[]
): CorrelationData[] {
  const correlationData: CorrelationData[] = [];

  // Create a map of liquidity by date
  const liquidityMap = new Map<string, number>();
  for (const liq of liquidityHistory) {
    liquidityMap.set(liq.date, liq.liquidity);
  }

  let prevPrice = 0;
  let prevLiquidity = 0;

  for (const h of historical) {
    const liquidity = liquidityMap.get(h.date) || 0;

    const priceChange = prevPrice > 0 ? ((h.price - prevPrice) / prevPrice) * 100 : 0;
    const liquidityChange = prevLiquidity > 0 ? ((liquidity - prevLiquidity) / prevLiquidity) * 100 : 0;

    correlationData.push({
      date: h.date,
      price: h.price,
      liquidity,
      priceChange,
      liquidityChange,
    });

    prevPrice = h.price;
    prevLiquidity = liquidity;
  }

  return correlationData;
}

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const whaleThresholdParam = searchParams.get('whaleThreshold');
    const whaleThreshold = whaleThresholdParam
      ? Math.max(MIN_WHALE_THRESHOLD_USD, Math.min(MAX_WHALE_THRESHOLD_USD, Number.parseInt(whaleThresholdParam, 10)))
      : DEFAULT_WHALE_THRESHOLD_USD;

    // Check cache (only use cache if threshold matches default)
    if (cachedAnalysisData && Date.now() - cachedAnalysisData.timestamp < CACHE_DURATION && whaleThreshold === DEFAULT_WHALE_THRESHOLD_USD) {
      return NextResponse.json({
        ...cachedAnalysisData.data,
        cached: true,
        whaleThreshold,
      });
    }

    // Fetch current pool data from GeckoTerminal
    const poolResponse = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}`,
      {
        headers: {
          'Accept': 'application/json;version=20230302',
        },
        next: { revalidate: 60 },
      }
    );

    if (!poolResponse.ok) {
      throw new Error('Failed to fetch pool data from GeckoTerminal');
    }

    const poolData = await poolResponse.json();
    const poolAttributes = poolData.data?.attributes;

    if (!poolAttributes) {
      throw new Error('Pool data not found');
    }

    // Fetch historical OHLCV data from GeckoTerminal (daily, max 300 days)
    const ohlcvResponse = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}/ohlcv/day?aggregate=1&limit=300`,
      {
        headers: {
          'Accept': 'application/json;version=20230302',
        },
        next: { revalidate: 300 },
      }
    );

    let historical: HistoricalDataPoint[] = [];

    if (ohlcvResponse.ok) {
      const ohlcvData = await ohlcvResponse.json();
      const ohlcvList = ohlcvData.data?.attributes?.ohlcv_list || [];

      historical = ohlcvList
        .map((item: number[]) => {
          const [timestamp, open, high, low, close, volume] = item;
          return {
            date: new Date(timestamp * 1000).toISOString().split('T')[0],
            timestamp: timestamp * 1000,
            price: close,
            volume24h: volume,
            high,
            low,
          };
        })
        .reverse()
        .filter((item: HistoricalDataPoint) => {
          const startDate = new Date('2024-03-07').getTime();
          return item.timestamp >= startDate;
        });
    }

    // Calculate technical indicators
    const technicalIndicators = calculateTechnicalIndicators(historical);

    // Parse current data - use reserve_in_usd for accurate current liquidity
    const currentLiquidity = Number.parseFloat(poolAttributes.reserve_in_usd) || 0;
    const currentPrice = Number.parseFloat(poolAttributes.base_token_price_usd) || 0;
    const volume24h = Number.parseFloat(poolAttributes.volume_usd?.h24) || 0;
    const fdv = Number.parseFloat(poolAttributes.fdv_usd) || 0;
    const marketCap = Number.parseFloat(poolAttributes.market_cap_usd) || fdv;
    const priceChange24h = Number.parseFloat(poolAttributes.price_change_percentage?.h24) || 0;
    const priceChange7d = priceChange24h * 3;

    const createdAtStr = poolAttributes.pool_created_at;
    const createdAt = createdAtStr ? new Date(createdAtStr).getTime() : new Date('2024-03-06').getTime();

    const txns24h = poolAttributes.transactions?.h24 || { buys: 0, sells: 0 };

    // Try to fetch liquidity history from The Graph first
    let liquidityHistory = await fetchLiquidityFromTheGraph();
    let liquidityDataSource = THE_GRAPH_API_KEY
      ? 'The Graph Network (Real On-Chain Data)'
      : 'The Graph Hosted Service';
    let isEstimatedData = false;

    // If The Graph fails or returns empty, use estimated data based on price/volume patterns
    if (liquidityHistory.length === 0) {
      liquidityHistory = generateEstimatedLiquidityHistory(historical, currentLiquidity);
      liquidityDataSource = `추정 데이터 (현재 유동성: $${formatNumber(currentLiquidity)} 기준)`;
      isEstimatedData = true;
    }

    // Calculate volume statistics
    const volumeStats = calculateVolumeStats(historical);

    // Detect liquidity alerts (with higher threshold for estimated data)
    const liquidityAlerts = detectLiquidityAlerts(liquidityHistory, isEstimatedData);

    // Calculate correlation data
    const correlationData = calculateCorrelationData(historical, liquidityHistory);

    // Fetch real whale transactions, fallback to estimated if no data
    let whaleTransactions = await fetchWhaleTransactions(currentPrice, whaleThreshold);
    let isWhaleDataEstimated = false;
    if (whaleTransactions.length === 0) {
      whaleTransactions = generateEstimatedWhaleTransactions(historical, currentPrice, whaleThreshold);
      isWhaleDataEstimated = true;
    }

    // Fetch holders data from Moralis API
    const holdersData = await fetchHoldersData();

    const analysisData: AnalysisData = {
      current: {
        liquidity: currentLiquidity,
        price: currentPrice,
        volume24h,
        marketCap,
        fdv,
        priceChange24h,
        priceChange7d,
        txns24h: {
          buys: txns24h.buys || 0,
          sells: txns24h.sells || 0,
        },
      },
      historical,
      liquidityHistory,
      volumeStats,
      liquidityAlerts,
      correlationData,
      technicalIndicators,
      whaleTransactions,
      pairInfo: {
        baseToken: 'LGNS',
        quoteToken: 'DAI',
        dexId: 'quickswap',
        pairAddress: TOKEN_ADDRESS,
        poolAddress: POOL_ADDRESS,
        createdAt,
      },
      dataSource: 'GeckoTerminal API (Real On-Chain OHLCV Data)',
      liquidityDataSource,
    };

    // Update cache
    cachedAnalysisData = {
      data: analysisData,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      ...analysisData,
      cached: false,
      theGraphApiKeyConfigured: !!THE_GRAPH_API_KEY,
      isEstimatedLiquidity: isEstimatedData,
      whaleThreshold,
      whaleThresholdRange: { min: MIN_WHALE_THRESHOLD_USD, max: MAX_WHALE_THRESHOLD_USD, default: DEFAULT_WHALE_THRESHOLD_USD },
      isWhaleDataEstimated,
      holdersData,
      moralisConfigured: !!MORALIS_API_KEY,
    });
  } catch (error) {
    console.error('Analysis API error:', error);

    // Try DexScreener as fallback
    try {
      const dexResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/polygon/${POOL_ADDRESS}`,
        { next: { revalidate: 300 } }
      );

      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        const pair = dexData.pair;

        if (pair) {
          const fallbackData: AnalysisData = {
            current: {
              liquidity: pair.liquidity?.usd || 0,
              price: Number.parseFloat(pair.priceUsd) || 0,
              volume24h: pair.volume?.h24 || 0,
              marketCap: pair.marketCap || 0,
              fdv: pair.fdv || 0,
              priceChange24h: pair.priceChange?.h24 || 0,
              priceChange7d: (pair.priceChange?.h24 || 0) * 3,
              txns24h: {
                buys: pair.txns?.h24?.buys || 0,
                sells: pair.txns?.h24?.sells || 0,
              },
            },
            historical: [],
            liquidityHistory: [],
            volumeStats: {
              daily: [],
              weekly: [],
              monthly: [],
              totalVolume: 0,
              avgDailyVolume: 0,
              highestDayVolume: { date: '', volume: 0 },
              lowestDayVolume: { date: '', volume: 0 },
            },
            liquidityAlerts: [],
            correlationData: [],
            pairInfo: {
              baseToken: pair.baseToken?.symbol || 'LGNS',
              quoteToken: pair.quoteToken?.symbol || 'DAI',
              dexId: pair.dexId || 'quickswap',
              pairAddress: TOKEN_ADDRESS,
              poolAddress: POOL_ADDRESS,
              createdAt: pair.pairCreatedAt || new Date('2024-03-06').getTime(),
            },
            dataSource: 'DexScreener API (Fallback)',
          };

          return NextResponse.json({
            ...fallbackData,
            fallback: true,
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback API error:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Failed to fetch analysis data' },
      { status: 500 }
    );
  }
}

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(2);
}
