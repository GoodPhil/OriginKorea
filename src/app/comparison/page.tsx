'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProtectedPage } from '@/hooks/usePagePermission';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  BarChart3,
  Clock,
  ExternalLink,
  GitCompare,
  Activity,
  Plus,
  X,
  Search,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

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

interface ComparisonData {
  tokens: TokenData[];
  cached: boolean;
  timestamp: number;
}

interface SearchResult {
  chainId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd: string;
  volume24h: number;
  liquidity: number;
  priceChange24h: number;
  dexId: string;
}

interface CustomToken {
  id: string;
  chain: string;
  address: string;
  name: string;
}

// Default tokens - LGNS, Trump, wkeyDAO, ARK, GOT, AS, $NGP
// BSC tokens use PAIR addresses, others use TOKEN addresses
// Default tokens - LGNS, Trump, wkeyDAO, ARK, GOT, AS, $NGP (7 tokens)
// Order: LGNS first, then alphabetically important tokens
const DEFAULT_TOKENS: CustomToken[] = [
  { id: 'lgns', chain: 'polygon', address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01', name: 'LGNS' },
  { id: 'trump', chain: 'solana', address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', name: 'Trump' },
  { id: 'wkeydao', chain: 'bsc', address: '0x8665a78ccc84d6df2acaa4b207d88c6bc9b70ec5', name: 'wkeyDAO' },
  { id: 'ark', chain: 'bsc', address: '0xcaaf3c41a40103a23eeaa4bba468af3cf5b0e0d8', name: 'ARK' },
  { id: 'got', chain: 'bsc', address: '0x1831bb2723ced46e1b6c08d2f3ae50b2ab9427b9', name: 'GOT' },
  { id: 'as', chain: 'polygon', address: '0x1A9221261dC445D773E66075B9e9E52f40e15AB1', name: 'AS' },
  { id: 'ngp', chain: 'bsc', address: '0xf6389f23764ee56f0bd5c3494200fe2f79f243aa', name: '$NGP' },
];

// Colors for each token
const COLORS = [
  '#ef4444', // LGNS - red (primary)
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#14b8a6', // teal
];

const CHAIN_NAMES: Record<string, string> = {
  polygon: 'Polygon',
  bsc: 'BSC',
  solana: 'Solana',
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  avalanche: 'Avalanche',
  base: 'Base',
  optimism: 'Optimism',
};

// Storage key - v5 forces refresh (7 tokens: LGNS, Trump, wkeyDAO, ARK, GOT, AS, $NGP)
const STORAGE_KEY = 'originkorea_custom_tokens_v5';

export default function ComparisonPage() {
  const { language } = useLanguage();
  const { rate: exchangeRate } = useExchangeRate();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Token management state
  const [customTokens, setCustomTokens] = useState<CustomToken[]>(DEFAULT_TOKENS);
  const [showAddToken, setShowAddToken] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const texts = {
    ko: {
      title: '토큰 비교 분석',
      subtitle: '여러 토큰의 실시간 데이터 비교',
      loading: '데이터 로딩 중...',
      error: '데이터를 불러오는데 실패했습니다.',
      retry: '다시 시도',
      refresh: '새로고침',
      autoRefresh: '자동 갱신',
      lastUpdated: '마지막 업데이트',
      liveData: '실시간',
      token: '토큰',
      chain: '체인',
      price: '가격',
      priceChange: '24시간 변동',
      volume: '24시간 거래량',
      liquidity: '유동성',
      marketCap: '시가총액',
      txns: '거래 수',
      makers: '트레이더',
      age: '생성일',
      viewOnDex: 'DEX에서 보기',
      comparisonChart: '비교 차트',
      priceComparison: '가격 비교',
      volumeComparison: '거래량 비교',
      liquidityComparison: '유동성 비교',
      marketCapComparison: '시가총액 비교',
      txnsComparison: '거래 수 비교',
      makersComparison: '트레이더 비교',
      radarAnalysis: '종합 레이더 분석',
      dataTable: '상세 데이터',
      addToken: '토큰 추가',
      removeToken: '제거',
      searchPlaceholder: '토큰 이름 또는 주소 검색...',
      noResults: '검색 결과가 없습니다',
      searching: '검색 중...',
      resetTokens: '초기화',
      saveTokens: '저장됨',
      manageTokens: '토큰 관리',
      maxTokens: '최대 10개 토큰',
      tokenAdded: '토큰이 추가되었습니다',
      tokenRemoved: '토큰이 제거되었습니다',
    },
    en: {
      title: 'Token Comparison',
      subtitle: 'Real-time data comparison of multiple tokens',
      loading: 'Loading data...',
      error: 'Failed to load data.',
      retry: 'Retry',
      refresh: 'Refresh',
      autoRefresh: 'Auto Refresh',
      lastUpdated: 'Last Updated',
      liveData: 'Live',
      token: 'Token',
      chain: 'Chain',
      price: 'Price',
      priceChange: '24h Change',
      volume: '24h Volume',
      liquidity: 'Liquidity',
      marketCap: 'Market Cap',
      txns: 'Transactions',
      makers: 'Makers',
      age: 'Age',
      viewOnDex: 'View on DEX',
      comparisonChart: 'Comparison Charts',
      priceComparison: 'Price Comparison',
      volumeComparison: 'Volume Comparison',
      liquidityComparison: 'Liquidity Comparison',
      marketCapComparison: 'Market Cap Comparison',
      txnsComparison: 'Transactions Comparison',
      makersComparison: 'Makers Comparison',
      radarAnalysis: 'Radar Analysis',
      dataTable: 'Detailed Data',
      addToken: 'Add Token',
      removeToken: 'Remove',
      searchPlaceholder: 'Search token name or address...',
      noResults: 'No results found',
      searching: 'Searching...',
      resetTokens: 'Reset',
      saveTokens: 'Saved',
      manageTokens: 'Manage Tokens',
      maxTokens: 'Max 10 tokens',
      tokenAdded: 'Token added',
      tokenRemoved: 'Token removed',
    },
  };

  const t = texts[language];

  // Load custom tokens from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomTokens(parsed);
        }
      } catch {
        console.error('Failed to parse saved tokens');
      }
    }
  }, []);

  // Save custom tokens to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTokens));
  }, [customTokens]);

  // Search tokens
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-token?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Build query string with custom tokens
      const tokenParams = customTokens.map(t => `${t.chain}:${t.address}`).join(',');
      const response = await fetch(`/api/comparison?tokens=${encodeURIComponent(tokenParams)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(t.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customTokens, t.error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  const addToken = (result: SearchResult) => {
    if (customTokens.length >= 10) {
      return;
    }

    const newToken: CustomToken = {
      id: `custom_${Date.now()}`,
      chain: result.chainId,
      address: result.pairAddress,
      name: result.baseToken.symbol,
    };

    // Check if already exists
    const exists = customTokens.some(
      t => t.chain === newToken.chain && t.address.toLowerCase() === newToken.address.toLowerCase()
    );

    if (!exists) {
      setCustomTokens([...customTokens, newToken]);
      setSearchQuery('');
      setSearchResults([]);
      setShowAddToken(false);
    }
  };

  const removeToken = (tokenId: string) => {
    // Don't allow removing LGNS
    if (tokenId === 'lgns') return;
    setCustomTokens(customTokens.filter(t => t.id !== tokenId));
  };

  const resetTokens = () => {
    setCustomTokens(DEFAULT_TOKENS);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatKRW = (usdValue: number) => {
    const krwValue = usdValue * exchangeRate;
    if (krwValue >= 1e12) return `₩${(krwValue / 1e12).toFixed(2)}조`;
    if (krwValue >= 1e8) return `₩${(krwValue / 1e8).toFixed(2)}억`;
    if (krwValue >= 1e4) return `₩${(krwValue / 1e4).toFixed(1)}만`;
    return `₩${krwValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
  };

  const formatPriceKRW = (usdValue: number) => {
    const krwValue = usdValue * exchangeRate;
    return `₩${krwValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || t.error}</p>
              <Button onClick={() => fetchData()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.retry}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare chart data
  const volumeChartData = data.tokens.map((token, index) => ({
    name: token.symbol,
    value: token.volume24h,
    color: COLORS[index % COLORS.length],
  }));

  const liquidityChartData = data.tokens.map((token, index) => ({
    name: token.symbol,
    value: token.liquidity,
    color: COLORS[index % COLORS.length],
  }));

  const marketCapChartData = data.tokens.map((token, index) => ({
    name: token.symbol,
    value: token.marketCap,
    color: COLORS[index % COLORS.length],
  }));

  const txnsChartData = data.tokens.map((token, index) => ({
    name: token.symbol,
    value: token.txns24h,
    color: COLORS[index % COLORS.length],
  }));

  const priceChangeChartData = data.tokens.map((token, index) => ({
    name: token.symbol,
    value: token.priceChange24h,
    color: token.priceChange24h >= 0 ? '#22c55e' : '#ef4444',
    isLGNS: token.id === 'lgns',
  }));

  // Normalize data for radar chart
  const maxVolume = Math.max(...data.tokens.map(t => t.volume24h));
  const maxLiquidity = Math.max(...data.tokens.map(t => t.liquidity));
  const maxMcap = Math.max(...data.tokens.map(t => t.marketCap));
  const maxTxns = Math.max(...data.tokens.map(t => t.txns24h));
  const maxMakers = Math.max(...data.tokens.map(t => t.makers24h));

  const radarData = [
    { metric: language === 'ko' ? '거래량' : 'Volume', ...Object.fromEntries(data.tokens.map(t => [t.symbol, maxVolume > 0 ? (t.volume24h / maxVolume) * 100 : 0])) },
    { metric: language === 'ko' ? '유동성' : 'Liquidity', ...Object.fromEntries(data.tokens.map(t => [t.symbol, maxLiquidity > 0 ? (t.liquidity / maxLiquidity) * 100 : 0])) },
    { metric: language === 'ko' ? '시가총액' : 'MCap', ...Object.fromEntries(data.tokens.map(t => [t.symbol, maxMcap > 0 ? (t.marketCap / maxMcap) * 100 : 0])) },
    { metric: language === 'ko' ? '거래 수' : 'Txns', ...Object.fromEntries(data.tokens.map(t => [t.symbol, maxTxns > 0 ? (t.txns24h / maxTxns) * 100 : 0])) },
    { metric: language === 'ko' ? '트레이더' : 'Makers', ...Object.fromEntries(data.tokens.map(t => [t.symbol, maxMakers > 0 ? (t.makers24h / maxMakers) * 100 : 0])) },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-lg">
          <p className="text-sm sm:text-base font-medium mb-1">{label}</p>
          <p className="text-base sm:text-xl font-bold" style={{ color: payload[0]?.color }}>
            {formatLargeNumber(payload[0]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  const PriceChangeTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string; payload: { color: string } }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value || 0;
      const color = payload[0]?.payload?.color || (value >= 0 ? '#22c55e' : '#ef4444');
      return (
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-lg">
          <p className="text-sm sm:text-base font-medium mb-1">{label}</p>
          <p className="text-base sm:text-xl font-bold" style={{ color }}>
            {value >= 0 ? '+' : ''}{value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedPage>
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <GitCompare className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
                  <h1 className="text-xl sm:text-3xl font-bold gradient-text">{t.title}</h1>
                  {autoRefresh && (
                    <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/10 text-green-500 text-[12px] sm:text-xs font-medium rounded-full">
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
                      </span>
                      {t.liveData}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-lg text-muted-foreground mt-1">{t.subtitle}</p>
              </div>

              {/* Control Buttons - Mobile Optimized */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {lastUpdated && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t.lastUpdated}: {formatLastUpdated(lastUpdated)}</span>
                  </div>
                )}
                <Button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  variant={autoRefresh ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 sm:h-8 text-[12px] sm:text-xs px-2 sm:px-3"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{t.autoRefresh}</span> {autoRefresh ? 'ON' : 'OFF'}
                </Button>
                <Button
                  onClick={() => fetchData(true)}
                  variant="outline"
                  size="sm"
                  className="h-7 sm:h-8 text-[12px] sm:text-xs px-2 sm:px-3"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-1">{t.refresh}</span>
                </Button>
              </div>
            </div>

            {/* Token Management Section */}
            <Card className="bg-card/50 border-border/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t.manageTokens}</span>
                    <span className="text-xs text-muted-foreground">({customTokens.length}/10 {t.maxTokens})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={resetTokens}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {t.resetTokens}
                    </Button>
                    <Button
                      onClick={() => setShowAddToken(!showAddToken)}
                      variant={showAddToken ? 'secondary' : 'default'}
                      size="sm"
                      className="h-7 text-xs"
                      disabled={customTokens.length >= 10}
                    >
                      {showAddToken ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                      {t.addToken}
                    </Button>
                  </div>
                </div>

                {/* Token Pills */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {customTokens.map((token, index) => (
                    <div
                      key={token.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all"
                      style={{
                        backgroundColor: `${COLORS[index % COLORS.length]}15`,
                        borderColor: `${COLORS[index % COLORS.length]}50`,
                        color: COLORS[index % COLORS.length],
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="max-w-[60px] sm:max-w-none truncate">{token.name}</span>
                      <span className="text-[12px] opacity-70 uppercase hidden sm:inline">
                        {CHAIN_NAMES[token.chain] || token.chain}
                      </span>
                      {token.id !== 'lgns' && (
                        <button
                          onClick={() => removeToken(token.id)}
                          className="hover:opacity-70 transition-opacity p-0.5"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Search UI */}
                {showAddToken && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    {/* Search Results */}
                    {searching && (
                      <div className="mt-2 p-3 text-center text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin inline-block mr-2" />
                        {t.searching}
                      </div>
                    )}

                    {!searching && searchResults.length > 0 && (
                      <div className="mt-2 max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border/50">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.chainId}-${result.pairAddress}`}
                            onClick={() => addToken(result)}
                            className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-secondary/50 transition-colors text-left"
                            type="button"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{result.baseToken.symbol}</span>
                                <span className="text-[12px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                                  {CHAIN_NAMES[result.chainId] || result.chainId}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground truncate mt-0.5">
                                {result.baseToken.name} / {result.quoteToken.symbol}
                              </div>
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <div className="text-sm font-mono">${Number(result.priceUsd).toFixed(6)}</div>
                              <div className="text-xs text-muted-foreground">Vol: ${formatLargeNumber(result.volume24h)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="mt-2 p-3 text-center text-sm text-muted-foreground">
                        {t.noResults}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Cards - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-3 mb-4 sm:mb-8">
          {data.tokens.map((token, index) => {
            const isLGNS = token.id === 'lgns' || token.symbol === 'LGNS';
            return (
              <Card
                key={token.id}
                className={`border-border/60 transition-all ${
                  isLGNS
                    ? 'bg-primary/10 border-primary/50 ring-1 sm:ring-2 ring-primary/30 shadow-lg shadow-primary/10'
                    : 'bg-card hover:bg-secondary/30'
                }`}
                style={{ borderLeftColor: COLORS[index % COLORS.length], borderLeftWidth: isLGNS ? '4px' : '3px' }}
              >
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {isLGNS && (
                        <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded font-bold flex-shrink-0">
                          MAIN
                        </span>
                      )}
                      <span className={`text-sm sm:text-base font-bold truncate ${isLGNS ? 'text-primary' : ''}`} style={{ color: isLGNS ? undefined : COLORS[index % COLORS.length] }}>
                        {token.symbol}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground uppercase flex-shrink-0 ml-1">
                      {CHAIN_NAMES[token.chain] || token.chain}
                    </span>
                  </div>
                  <p className={`text-base sm:text-xl font-bold ${isLGNS ? 'text-primary' : ''}`}>
                    ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(4) : token.priceUsd.toFixed(2)}
                  </p>
                  <p className="text-sm sm:text-base font-medium text-cyan-500 truncate">
                    {formatPriceKRW(token.priceUsd)}
                  </p>
                  <div className={`text-sm sm:text-base font-medium ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Table - Mobile Scroll */}
        <Card className="bg-card border-border/60 mb-3 sm:mb-6">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-lg">{t.dataTable}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-sm sm:text-base lg:text-lg min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">{t.token}</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden sm:table-cell">{t.chain}</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">{t.price}</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">{t.priceChange}</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">{t.volume}</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">{t.liquidity}</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">{t.marketCap}</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden lg:table-cell">{t.txns}</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.tokens.map((token, index) => (
                    <tr key={token.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium truncate">{token.symbol}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-sm lg:text-base uppercase hidden sm:table-cell">
                        {CHAIN_NAMES[token.chain] || token.chain}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-sm lg:text-base">
                          ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
                        </div>
                        <div className="text-sm lg:text-base text-cyan-500">
                          {formatPriceKRW(token.priceUsd)}
                        </div>
                      </td>
                      <td className={`py-3 px-3 text-right font-medium ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {token.priceChange24h >= 0 ? <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" /> : <TrendingDown className="h-4 w-4 lg:h-5 lg:w-5" />}
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-sm lg:text-base">{formatLargeNumber(token.volume24h)}</div>
                        <div className="text-sm lg:text-base text-cyan-500">{formatKRW(token.volume24h)}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-sm lg:text-base">{formatLargeNumber(token.liquidity)}</div>
                        <div className="text-sm lg:text-base text-cyan-500">{formatKRW(token.liquidity)}</div>
                      </td>
                      <td className="py-3 px-3 text-right hidden md:table-cell">
                        <div className="font-mono text-sm lg:text-base">{formatLargeNumber(token.marketCap)}</div>
                        <div className="text-sm lg:text-base text-cyan-500">{formatKRW(token.marketCap)}</div>
                      </td>
                      <td className="py-3 px-3 text-right hidden lg:table-cell font-mono text-base">{formatNumber(token.txns24h)}</td>
                      <td className="py-2 px-2 text-center">
                        <a
                          href={`https://dexscreener.com/${token.chain}/${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-secondary transition-colors inline-flex"
                          title={t.viewOnDex}
                        >
                          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Price Change Chart */}
        <Card className="bg-card border-border/60 mb-3 sm:mb-6">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              {language === 'ko' ? '24시간 가격 변동률' : '24h Price Change'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <div className="h-[140px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceChangeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`}
                    tick={{ fontSize: 9 }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={45} />
                  <Tooltip content={<PriceChangeTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {priceChangeChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        stroke={entry.isLGNS ? '#ef4444' : 'transparent'}
                        strokeWidth={entry.isLGNS ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid - Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
          {/* Volume Chart */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                {t.volumeComparison}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[160px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={(v) => formatLargeNumber(v)} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {volumeChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Liquidity Chart */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                {t.liquidityComparison}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[160px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liquidityChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={(v) => formatLargeNumber(v)} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {liquidityChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Cap Chart */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                {t.marketCapComparison}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[160px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketCapChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={(v) => formatLargeNumber(v)} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {marketCapChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Chart */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                {t.txnsComparison}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[160px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={txnsChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {txnsChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Radar Chart */}
        <Card className="bg-card border-border/60 mb-4 sm:mb-8">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              {t.radarAnalysis}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === 'ko' ? '각 지표의 상대적 비교 (최대값 대비 %)' : 'Relative comparison of each metric (% of max)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <div className="h-[250px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  {data.tokens.slice(0, 5).map((token, index) => (
                    <Radar
                      key={token.symbol}
                      name={token.symbol}
                      dataKey={token.symbol}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
    </ProtectedPage>
  );
}
