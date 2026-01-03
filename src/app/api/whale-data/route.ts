import { NextResponse } from 'next/server';

// LGNS Token Contract Address on Polygon (correct address)
const LGNS_CONTRACT = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';
const POLYGONSCAN_API_URL = 'https://api.polygonscan.com/api';

// Whale threshold: 50,000 LGNS (with 18 decimals)
const WHALE_THRESHOLD = 50000;

interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

interface WhaleTransaction {
  id: string;
  hash: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  amountUSD: number;
  from: string;
  to: string;
  timestamp: Date;
  blockNumber: number;
}

interface WhaleWallet {
  address: string;
  totalIn: number;
  totalOut: number;
  netFlow: number;
  transactionCount: number;
  lastActivity: Date;
}

// Known DEX/Exchange addresses on Polygon
const DEX_ADDRESSES = [
  '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch
  '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff', // QuickSwap Router
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap V3 Router
  '0xdef171fe48cf0115b1d80b88dc8eab59176fee57', // ParaSwap
  '0x0000000000000000000000000000000000000000', // Null/Burn address
];

// Cache for API responses
let cachedData: {
  transactions: WhaleTransaction[];
  wallets: WhaleWallet[];
  lastFetch: number;
  lgnsPrice: number;
} | null = null;
const CACHE_TTL = 60000; // 1 minute cache

// Fetch LGNS price from DexScreener
async function fetchLGNSPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
      { next: { revalidate: 60 } }
    );
    const data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      return parseFloat(data.pairs[0].priceUsd) || 6.36;
    }
    return 6.36; // Default fallback price
  } catch {
    return 6.36;
  }
}

// Determine transaction type based on addresses
function getTransactionType(from: string, to: string): 'buy' | 'sell' | 'transfer' {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  const isFromDex = DEX_ADDRESSES.some(addr => fromLower === addr.toLowerCase());
  const isToDex = DEX_ADDRESSES.some(addr => toLower === addr.toLowerCase());

  if (isFromDex && !isToDex) return 'buy';
  if (isToDex && !isFromDex) return 'sell';
  return 'transfer';
}

// Fetch token transfers from Polygonscan
async function fetchTokenTransfers(): Promise<TokenTransfer[]> {
  if (!POLYGONSCAN_API_KEY) {
    console.log('Polygonscan API key not configured');
    return [];
  }

  try {
    const url = `${POLYGONSCAN_API_URL}?module=account&action=tokentx&contractaddress=${LGNS_CONTRACT}&page=1&offset=1000&sort=desc&apikey=${POLYGONSCAN_API_KEY}`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();

    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result;
    }

    console.log('Polygonscan response:', data.message || 'No data');
    return [];
  } catch (error) {
    console.error('Error fetching from Polygonscan:', error);
    return [];
  }
}

// Process transfers into whale transactions
function processTransfers(transfers: TokenTransfer[], lgnsPrice: number): WhaleTransaction[] {
  const whaleTransactions: WhaleTransaction[] = [];

  for (const tx of transfers) {
    const decimals = parseInt(tx.tokenDecimal) || 18;
    const amount = parseFloat(tx.value) / Math.pow(10, decimals);

    // Only include transactions >= WHALE_THRESHOLD
    if (amount >= WHALE_THRESHOLD) {
      whaleTransactions.push({
        id: `${tx.hash}-${tx.from}-${tx.to}`,
        hash: tx.hash,
        type: getTransactionType(tx.from, tx.to),
        amount,
        amountUSD: amount * lgnsPrice,
        from: tx.from,
        to: tx.to,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000),
        blockNumber: parseInt(tx.blockNumber),
      });
    }
  }

  return whaleTransactions;
}

// Aggregate wallet statistics
function aggregateWallets(transactions: WhaleTransaction[]): WhaleWallet[] {
  const walletMap = new Map<string, WhaleWallet>();

  for (const tx of transactions) {
    // Process sender
    if (!walletMap.has(tx.from)) {
      walletMap.set(tx.from, {
        address: tx.from,
        totalIn: 0,
        totalOut: 0,
        netFlow: 0,
        transactionCount: 0,
        lastActivity: tx.timestamp,
      });
    }
    const sender = walletMap.get(tx.from)!;
    sender.totalOut += tx.amount;
    sender.netFlow -= tx.amount;
    sender.transactionCount++;
    if (tx.timestamp > sender.lastActivity) {
      sender.lastActivity = tx.timestamp;
    }

    // Process receiver
    if (!walletMap.has(tx.to)) {
      walletMap.set(tx.to, {
        address: tx.to,
        totalIn: 0,
        totalOut: 0,
        netFlow: 0,
        transactionCount: 0,
        lastActivity: tx.timestamp,
      });
    }
    const receiver = walletMap.get(tx.to)!;
    receiver.totalIn += tx.amount;
    receiver.netFlow += tx.amount;
    receiver.transactionCount++;
    if (tx.timestamp > receiver.lastActivity) {
      receiver.lastActivity = tx.timestamp;
    }
  }

  // Sort by absolute net flow and return top 20
  return Array.from(walletMap.values())
    .filter(w => !DEX_ADDRESSES.some(addr => w.address.toLowerCase() === addr.toLowerCase()))
    .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
    .slice(0, 20);
}

// Generate fallback data when API is not available
function generateFallbackData(lgnsPrice: number): { transactions: WhaleTransaction[]; wallets: WhaleWallet[] } {
  const now = Date.now();
  const transactions: WhaleTransaction[] = [];
  const types: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer'];

  for (let i = 0; i < 20; i++) {
    const amount = Math.floor(Math.random() * 450000) + 50000;
    const type = types[Math.floor(Math.random() * types.length)];
    transactions.push({
      id: `fallback-${i}`,
      hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      type,
      amount,
      amountUSD: amount * lgnsPrice,
      from: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      to: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
      blockNumber: 50000000 - i * 1000,
    });
  }

  const wallets: WhaleWallet[] = [];
  for (let i = 0; i < 10; i++) {
    const totalIn = Math.floor(Math.random() * 2000000) + 100000;
    const totalOut = Math.floor(Math.random() * totalIn);
    wallets.push({
      address: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      totalIn,
      totalOut,
      netFlow: totalIn - totalOut,
      transactionCount: Math.floor(Math.random() * 50) + 5,
      lastActivity: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }

  return {
    transactions: transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    wallets: wallets.sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
  };
}

export async function GET() {
  try {
    // Check cache
    const now = Date.now();
    if (cachedData && (now - cachedData.lastFetch) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        ...cachedData,
      });
    }

    // Fetch current LGNS price
    const lgnsPrice = await fetchLGNSPrice();

    // Fetch token transfers from Polygonscan
    const transfers = await fetchTokenTransfers();

    let transactions: WhaleTransaction[];
    let wallets: WhaleWallet[];
    let source: string;

    if (transfers.length > 0) {
      transactions = processTransfers(transfers, lgnsPrice);
      wallets = aggregateWallets(transactions);
      source = 'polygonscan';
    } else {
      // Use fallback data
      const fallback = generateFallbackData(lgnsPrice);
      transactions = fallback.transactions;
      wallets = fallback.wallets;
      source = 'fallback';
    }

    // Update cache
    cachedData = {
      transactions,
      wallets,
      lastFetch: now,
      lgnsPrice,
    };

    return NextResponse.json({
      success: true,
      source,
      lgnsPrice,
      transactions,
      wallets,
      stats: {
        totalTransactions: transactions.length,
        buyCount: transactions.filter(t => t.type === 'buy').length,
        sellCount: transactions.filter(t => t.type === 'sell').length,
        transferCount: transactions.filter(t => t.type === 'transfer').length,
        totalVolumeUSD: transactions.reduce((sum, t) => sum + t.amountUSD, 0),
        buyVolumeUSD: transactions.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.amountUSD, 0),
        sellVolumeUSD: transactions.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.amountUSD, 0),
      },
    });
  } catch (error) {
    console.error('Whale data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale data' },
      { status: 500 }
    );
  }
}
