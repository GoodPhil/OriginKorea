'use client';

import { ProtectedPage } from '@/hooks/usePagePermission';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PriceChart } from '@/components/PriceChart';
import { TokenInfoCard } from '@/components/TokenInfoCard';
// OnChainAnalysis moved to whale-monitor page
import { RSIGauge } from '@/components/RSIGauge';
import { MACDChart } from '@/components/MACDChart';
import { BollingerBandsChart } from '@/components/BollingerBandsChart';
import { StochasticChart } from '@/components/StochasticChart';
import { ATRChart } from '@/components/ATRChart';
import { WilliamsRChart } from '@/components/WilliamsRChart';
import { CCIChart } from '@/components/CCIChart';
import { OBVChart } from '@/components/OBVChart';
import { ADXChart } from '@/components/ADXChart';
import { IchimokuChart } from '@/components/IchimokuChart';
import { ParabolicSARChart } from '@/components/ParabolicSARChart';

import { useLanguage } from '@/contexts/LanguageContext';
import { useExchangeRate, formatKRW } from '@/hooks/useExchangeRate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  BarChart3,
  Activity,
  Calendar,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Waves,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Gauge,

  PieChartIcon,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
  liquidityHistory?: LiquidityDataPoint[];
  volumeStats?: VolumeStats;
  liquidityAlerts?: LiquidityAlert[];
  correlationData?: CorrelationData[];
  technicalIndicators?: TechnicalIndicators;
  pairInfo: {
    baseToken: string;
    quoteToken: string;
    dexId: string;
    pairAddress: string;
    poolAddress?: string;
    createdAt: number;
  };
  dataSource?: string;
  liquidityDataSource?: string;
  theGraphApiKeyConfigured?: boolean;
  isEstimatedLiquidity?: boolean;
  cached?: boolean;
  fallback?: boolean;
}

type ChartType = 'price' | 'volume' | 'liquidity' | 'correlation' | 'range' | 'all' | 'technical';
type TimeRange = 'all' | '6m' | '3m' | '1m';
type VolumeView = 'daily' | 'weekly' | 'monthly';

// Auto-refresh interval (30 seconds)
const AUTO_REFRESH_INTERVAL = 30 * 1000;

export default function AnalysisPage() {
  const { language } = useLanguage();
  const { rate: exchangeRate } = useExchangeRate();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('price');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [volumeView, setVolumeView] = useState<VolumeView>('daily');
  const [showDetails, setShowDetails] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);



  const texts = {
    ko: {
      title: '기술 분석',
      subtitle: 'LGNS/DAI 가격 차트 및 기술적 지표 분석',
      currentStats: '현재 상태',
      liquidity: '유동성',
      price: '가격',
      volume: '24시간 거래량',
      marketCap: '시가총액',
      fdv: '완전희석가치',
      priceChange24h: '24시간 변동',
      priceChange7d: '7일 변동',
      transactions: '거래 (24h)',
      buys: '매수',
      sells: '매도',
      historicalChart: '히스토리 차트 (실시간 온체인 데이터)',
      priceChart: '가격',
      volumeChart: '거래량',
      liquidityChart: '유동성',
      correlationChart: '상관관계',
      rangeChart: '범위',
      allCharts: '종합',
      technicalChart: '기술적 지표',
      timeRangeAll: '전체',
      timeRange6m: '6개월',
      timeRange3m: '3개월',
      timeRange1m: '1개월',
      refresh: '새로고침',
      loading: '데이터 로딩 중...',
      error: '데이터를 불러오는데 실패했습니다.',
      retry: '다시 시도',
      pairInfo: '페어 정보',
      baseToken: '기본 토큰',
      quoteToken: '견적 토큰',
      dex: '거래소',
      createdAt: '생성일',
      viewOnDexScreener: 'DexScreener에서 보기',
      viewOnPolygonScan: 'PolygonScan에서 보기',
      dataDisclaimer: '* GeckoTerminal API에서 제공하는 실제 온체인 OHLCV 데이터입니다.',
      showDetails: '상세 정보 보기',
      hideDetails: '상세 정보 숨기기',
      growthAnalysis: '가격 분석',
      liquidityAnalysis: '유동성 분석',
      volumeAnalysis: '거래량 분석',
      liquidityAlerts: '유동성 변동 알림',
      correlationAnalysis: '가격-유동성 상관관계',
      initialPrice: '시작 가격',
      currentPrice: '현재 가격',
      priceChange: '가격 변동',
      periodStart: '분석 시작일',
      periodEnd: '분석 종료일',
      dataSource: '데이터 출처',
      liquidityDataSource: '유동성 데이터 출처',
      totalDays: '총 데이터 일수',
      highestPrice: '최고가',
      lowestPrice: '최저가',
      initialLiquidity: '시작 유동성',
      currentLiquidity: '현재 유동성',
      liquidityChange: '유동성 변동',
      highestLiquidity: '최고 유동성',
      lowestLiquidity: '최저 유동성',
      theGraphIntegration: 'The Graph 서브그래프 연동',
      totalVolume: '총 거래량',
      avgDailyVolume: '일 평균 거래량',
      highestDayVolume: '최고 거래일',
      lowestDayVolume: '최저 거래일',
      daily: '일별',
      weekly: '주별',
      monthly: '월별',
      alertHigh: '대규모',
      alertMedium: '중간',
      alertLow: '소규모',
      increase: '증가',
      decrease: '감소',
      noAlerts: '감지된 알림이 없습니다.',
      apiKeyConfigured: 'The Graph API 키 설정됨',
      apiKeyNotConfigured: 'The Graph API 키 미설정 (시뮬레이션 데이터 사용)',
      lastUpdated: '마지막 업데이트',
      autoRefresh: '자동 갱신',
      liveData: '실시간',
      insightTitle: '시장 인사이트',
      insightPriceUp: '가격이 상승 추세입니다. 매수세가 우위를 보이고 있습니다.',
      insightPriceDown: '가격이 하락 추세입니다. 매도 압력이 증가하고 있습니다.',
      insightPriceStable: '가격이 안정적인 횡보 구간에 있습니다.',
      insightVolumeHigh: '거래량이 평균 대비 높습니다. 시장 관심도가 증가하고 있습니다.',
      insightVolumeLow: '거래량이 평균 대비 낮습니다. 관망세가 지속되고 있습니다.',
      insightLiquidityHealthy: '유동성이 건전한 수준을 유지하고 있어 거래가 원활합니다.',
      insightBuyPressure: '매수 거래가 매도보다 우세합니다.',
      insightSellPressure: '매도 거래가 매수보다 우세합니다.',
      analysisDepth: '심층 분석',
      analysisDepthDesc: 'LGNS 토큰의 온체인 데이터를 기반으로 한 분석입니다.',
      // Technical Indicators
      movingAverages: '이동평균선',
      rsi: 'RSI(14)',
      volatility: '변동성',
      support: '지지선',
      resistance: '저항선',
      trend: '추세',
      bullish: '상승',
      bearish: '하락',
      neutral: '중립',
    },
    en: {
      title: 'Technical Analysis',
      subtitle: 'LGNS/DAI Price Charts and Technical Indicator Analysis',
      currentStats: 'Current Status',
      liquidity: 'Liquidity',
      price: 'Price',
      volume: '24h Volume',
      marketCap: 'Market Cap',
      fdv: 'Fully Diluted Value',
      priceChange24h: '24h Change',
      priceChange7d: '7d Change',
      transactions: 'Transactions (24h)',
      buys: 'Buys',
      sells: 'Sells',
      historicalChart: 'Historical Chart (Real On-Chain Data)',
      priceChart: 'Price',
      volumeChart: 'Volume',
      liquidityChart: 'Liquidity',
      correlationChart: 'Correlation',
      rangeChart: 'Range',
      allCharts: 'Combined',
      technicalChart: 'Technical Indicators',
      timeRangeAll: 'All',
      timeRange6m: '6 Months',
      timeRange3m: '3 Months',
      timeRange1m: '1 Month',
      refresh: 'Refresh',
      loading: 'Loading data...',
      error: 'Failed to load data.',
      retry: 'Retry',
      pairInfo: 'Pair Info',
      baseToken: 'Base Token',
      quoteToken: 'Quote Token',
      dex: 'DEX',
      createdAt: 'Created At',
      viewOnDexScreener: 'View on DexScreener',
      viewOnPolygonScan: 'View on PolygonScan',
      dataDisclaimer: '* Real on-chain OHLCV data from GeckoTerminal API.',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      growthAnalysis: 'Price Analysis',
      liquidityAnalysis: 'Liquidity Analysis',
      volumeAnalysis: 'Volume Analysis',
      liquidityAlerts: 'Liquidity Change Alerts',
      correlationAnalysis: 'Price-Liquidity Correlation',
      initialPrice: 'Initial Price',
      currentPrice: 'Current Price',
      priceChange: 'Price Change',
      periodStart: 'Period Start',
      periodEnd: 'Period End',
      dataSource: 'Data Source',
      liquidityDataSource: 'Liquidity Data Source',
      totalDays: 'Total Data Days',
      highestPrice: 'Highest Price',
      lowestPrice: 'Lowest Price',
      initialLiquidity: 'Initial Liquidity',
      currentLiquidity: 'Current Liquidity',
      liquidityChange: 'Liquidity Change',
      highestLiquidity: 'Highest Liquidity',
      lowestLiquidity: 'Lowest Liquidity',
      theGraphIntegration: 'The Graph Subgraph Integration',
      totalVolume: 'Total Volume',
      avgDailyVolume: 'Avg Daily Volume',
      highestDayVolume: 'Highest Day',
      lowestDayVolume: 'Lowest Day',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      alertHigh: 'High',
      alertMedium: 'Medium',
      alertLow: 'Low',
      increase: 'Increase',
      decrease: 'Decrease',
      noAlerts: 'No alerts detected.',
      apiKeyConfigured: 'The Graph API Key Configured',
      apiKeyNotConfigured: 'The Graph API Key Not Configured (Using Simulated Data)',
      lastUpdated: 'Last Updated',
      autoRefresh: 'Auto Refresh',
      liveData: 'Live',
      insightTitle: 'Market Insights',
      insightPriceUp: 'Price is in an upward trend. Buying pressure is dominant.',
      insightPriceDown: 'Price is in a downward trend. Selling pressure is increasing.',
      insightPriceStable: 'Price is in a stable consolidation phase.',
      insightVolumeHigh: 'Volume is above average. Market interest is increasing.',
      insightVolumeLow: 'Volume is below average. Market is in wait-and-see mode.',
      insightLiquidityHealthy: 'Liquidity is at a healthy level, ensuring smooth trading.',
      insightBuyPressure: 'Buy transactions are dominating over sells.',
      insightSellPressure: 'Sell transactions are dominating over buys.',
      analysisDepth: 'Deep Analysis',
      analysisDepthDesc: 'Analysis based on on-chain data of LGNS token.',
      // Technical Indicators
      movingAverages: 'Moving Averages',
      rsi: 'RSI(14)',
      volatility: 'Volatility',
      support: 'Support',
      resistance: 'Resistance',
      trend: 'Trend',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
    },
  };

  const t = texts[language];

  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch('/api/analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      setError(t.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t.error]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh effect
  useEffect(() => {
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, AUTO_REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh, fetchData]);

  const handleManualRefresh = () => {
    fetchData(true);
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return `${num.toFixed(2)}`;
  };

  const getFilteredData = () => {
    if (!data?.historical) return [];

    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      all: 0,
      '6m': 6 * 30 * 24 * 60 * 60 * 1000,
      '3m': 3 * 30 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
    };

    if (timeRange === 'all') {
      return data.historical;
    }

    const cutoff = now - ranges[timeRange];
    return data.historical.filter((d) => d.timestamp >= cutoff);
  };

  const getFilteredLiquidityData = () => {
    if (!data?.liquidityHistory) return [];

    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      all: 0,
      '6m': 6 * 30 * 24 * 60 * 60 * 1000,
      '3m': 3 * 30 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
    };

    if (timeRange === 'all') {
      return data.liquidityHistory;
    }

    const cutoff = now - ranges[timeRange];
    return data.liquidityHistory.filter((d) => d.timestamp >= cutoff);
  };

  const getFilteredCorrelationData = () => {
    if (!data?.correlationData) return [];

    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      all: 0,
      '6m': 6 * 30 * 24 * 60 * 60 * 1000,
      '3m': 3 * 30 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
    };

    if (timeRange === 'all') {
      return data.correlationData;
    }

    const cutoff = now - ranges[timeRange];
    return data.correlationData.filter((d) => new Date(d.date).getTime() >= cutoff);
  };

  const filteredData = getFilteredData();
  const filteredLiquidityData = getFilteredLiquidityData();
  const filteredCorrelationData = getFilteredCorrelationData();

  const calculatePriceAnalysis = () => {
    if (!filteredData.length) return { initial: 0, current: 0, rate: 0, highest: 0, lowest: 0 };
    const initial = filteredData[0]?.price || 0;
    const current = filteredData[filteredData.length - 1]?.price || 0;
    const rate = initial > 0 ? ((current - initial) / initial) * 100 : 0;
    const highest = Math.max(...filteredData.map((d) => d.high || d.price));
    const lowest = Math.min(...filteredData.map((d) => d.low || d.price));
    return { initial, current, rate, highest, lowest };
  };

  const calculateLiquidityAnalysis = () => {
    if (!filteredLiquidityData.length) return { initial: 0, current: 0, rate: 0, highest: 0, lowest: 0 };
    const initial = filteredLiquidityData[0]?.liquidity || 0;
    const current = filteredLiquidityData[filteredLiquidityData.length - 1]?.liquidity || 0;
    const rate = initial > 0 ? ((current - initial) / initial) * 100 : 0;
    const highest = Math.max(...filteredLiquidityData.map((d) => d.liquidity));
    const lowest = Math.min(...filteredLiquidityData.map((d) => d.liquidity));
    return { initial, current, rate, highest, lowest };
  };

  const priceAnalysis = calculatePriceAnalysis();
  const liquidityAnalysis = calculateLiquidityAnalysis();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-semibold mb-3 text-foreground/80 border-b border-border/40 pb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={`item-${entry.dataKey}-${index}`} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <p className="text-sm font-medium" style={{ color: entry.color }}>
                  {entry.dataKey === 'price' && `${t.price}: ${entry.value.toFixed(4)}`}
                  {entry.dataKey === 'high' && `${t.highestPrice}: ${entry.value.toFixed(4)}`}
                  {entry.dataKey === 'low' && `${t.lowestPrice}: ${entry.value.toFixed(4)}`}
                  {entry.dataKey === 'volume24h' && `${t.volume}: ${formatLargeNumber(entry.value)}`}
                  {entry.dataKey === 'volume' && `${t.volume}: ${formatLargeNumber(entry.value)}`}
                  {entry.dataKey === 'liquidity' && `${t.liquidity}: ${formatLargeNumber(entry.value)}`}
                  {entry.dataKey === 'priceChange' && `${t.priceChange}: ${entry.value.toFixed(2)}%`}
                  {entry.dataKey === 'liquidityChange' && `${t.liquidityChange}: ${entry.value.toFixed(2)}%`}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return t.alertHigh;
      case 'medium':
        return t.alertMedium;
      case 'low':
        return t.alertLow;
      default:
        return severity;
    }
  };

  if (loading) {
    return (
      <ProtectedPage>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      </ProtectedPage>
    );
  }

  if (error || !data) {
    return (
      <ProtectedPage>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
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
      </ProtectedPage>
    );
  }

  // Sort liquidity alerts by date descending (most recent first)
  const sortedLiquidityAlerts = data.liquidityAlerts
    ? [...data.liquidityAlerts].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order
      })
    : [];

  return (
    <ProtectedPage>
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t.title}</h1>
                {/* Live indicator */}
                {isAutoRefresh && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 text-cyan-500 text-xs font-medium rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                    {t.liveData}
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-xl text-muted-foreground mt-1">{t.subtitle}</p>
              {/* API Key Status */}
              <p className={`text-sm mt-2 ${data.theGraphApiKeyConfigured ? 'text-green-600' : 'text-orange-500'}`}>
                {data.theGraphApiKeyConfigured ? t.apiKeyConfigured : t.apiKeyNotConfigured}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {/* Last Updated Time */}
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t.lastUpdated}: {formatLastUpdated(lastUpdated)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* Auto Refresh Toggle */}
                <Button
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                  variant={isAutoRefresh ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                >
                  {isAutoRefresh ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      {t.autoRefresh} ON
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      {t.autoRefresh} OFF
                    </>
                  )}
                </Button>
                {/* Manual Refresh Button */}
                <Button
                  onClick={handleManualRefresh}
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {t.refresh}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Token & Pair Info (Combined) */}
        <Card className="bg-card border-border/60 mb-6 sm:mb-8">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {language === 'ko' ? '토큰 & 페어 정보' : 'Token & Pair Info'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8"
              >
                {showDetails ? (
                  <>
                    {t.hideDetails}
                    <ChevronUp className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    {t.showDetails}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Token Info Section */}
            <TokenInfoCard showTitle={false} />

            {/* Pair Info Section */}
            <div className="border-t border-border/50 pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                {t.pairInfo}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-secondary/30 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[12px] sm:text-xs text-muted-foreground mb-0.5">{t.baseToken}</p>
                  <p className="text-sm sm:text-base font-medium">{data.pairInfo.baseToken}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[12px] sm:text-xs text-muted-foreground mb-0.5">{t.quoteToken}</p>
                  <p className="text-sm sm:text-base font-medium">{data.pairInfo.quoteToken}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[12px] sm:text-xs text-muted-foreground mb-0.5">{t.dex}</p>
                  <p className="text-sm sm:text-base font-medium capitalize">{data.pairInfo.dexId}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[12px] sm:text-xs text-muted-foreground mb-0.5">{t.createdAt}</p>
                  <p className="text-sm sm:text-base font-medium">
                    {new Date(data.pairInfo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Extended Details (Addresses) */}
            {showDetails && (
              <div className="border-t border-border/50 pt-4">
                <p className="text-sm text-muted-foreground mb-2">Pair Address:</p>
                <code className="text-xs sm:text-sm bg-secondary/50 p-2 rounded block overflow-x-auto font-mono">
                  {data.pairInfo.pairAddress}
                </code>
                {data.pairInfo.poolAddress && (
                  <>
                    <p className="text-sm text-muted-foreground mb-2 mt-3">Pool Address:</p>
                    <code className="text-xs sm:text-sm bg-secondary/50 p-2 rounded block overflow-x-auto font-mono">
                      {data.pairInfo.poolAddress}
                    </code>
                  </>
                )}
              </div>
            )}

            {/* External Links */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`https://dexscreener.com/polygon/${data.pairInfo.pairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-8">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  {t.viewOnDexScreener}
                </Button>
              </a>
              <a
                href={`https://polygonscan.com/address/${data.pairInfo.pairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-8">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  {t.viewOnPolygonScan}
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 2. Current Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-card border-border/60">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.liquidity}</span>
                <Droplets className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary">
                ${formatLargeNumber(data.current.liquidity)}
              </p>
              <p className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                {formatKRW(data.current.liquidity, exchangeRate)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.price}</span>
                <DollarSign className="h-3.5 w-3.5 text-green-500" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary">
                ${data.current.price.toFixed(4)}
              </p>
              <p className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                ₩{(data.current.price * exchangeRate).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.volume}</span>
                <BarChart3 className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary">
                ${formatLargeNumber(data.current.volume24h)}
              </p>
              <p className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                {formatKRW(data.current.volume24h, exchangeRate)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.marketCap}</span>
                <Activity className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary">
                ${formatLargeNumber(data.current.marketCap)}
              </p>
              <p className="text-sm font-semibold text-cyan-500 dark:text-cyan-400">
                {formatKRW(data.current.marketCap, exchangeRate)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.priceChange24h}</span>
                {data.current.priceChange24h >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
              <p
                className={`text-lg sm:text-xl font-bold ${
                  data.current.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {data.current.priceChange24h >= 0 ? '+' : ''}
                {data.current.priceChange24h.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.transactions}</span>
                <Activity className="h-3.5 w-3.5 text-cyan-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-500">
                  {t.buys}: {data.current.txns24h.buys}
                </span>
                <span className="text-sm text-red-500">
                  {t.sells}: {data.current.txns24h.sells}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2.5. Real-time Price Chart */}
        <Card className="bg-card border-border/60 mb-6 sm:mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {language === 'ko' ? '실시간 가격 차트' : 'Real-time Price Chart'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PriceChart pairAddress={data.pairInfo.pairAddress} />
          </CardContent>
        </Card>

        {/* 3. Price Analysis */}
        <Card className="bg-card border-border/60 mb-6 sm:mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t.growthAnalysis}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t.totalDays}</p>
                <p className="text-base font-medium">{filteredData.length} {language === 'ko' ? '일' : 'days'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t.initialPrice}</p>
                <p className="text-base font-medium">${priceAnalysis.initial.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t.currentPrice}</p>
                <p className="text-base font-medium">${priceAnalysis.current.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t.priceChange}</p>
                <p
                  className={`text-base font-bold ${
                    priceAnalysis.rate >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {priceAnalysis.rate >= 0 ? '+' : ''}
                  {priceAnalysis.rate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t.highestPrice}</p>
                <p className="text-base font-medium text-green-600">${priceAnalysis.highest.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t.lowestPrice}</p>
                <p className="text-base font-medium text-red-600">${priceAnalysis.lowest.toFixed(4)}</p>
              </div>
            </div>
            {data?.dataSource && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  {t.dataSource}: <span className="text-primary">{data.dataSource}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Chart Controls (Historical Chart) */}
        <Card className="bg-card border-border/60 mb-6 sm:mb-8">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl">{t.historicalChart}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {/* Time Range Buttons */}
                <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                  {(['all', '6m', '3m', '1m'] as TimeRange[]).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                      className="h-8 px-3 text-sm"
                    >
                      {range === 'all' && t.timeRangeAll}
                      {range === '6m' && t.timeRange6m}
                      {range === '3m' && t.timeRange3m}
                      {range === '1m' && t.timeRange1m}
                    </Button>
                  ))}
                </div>

                {/* Chart Type Buttons */}
                <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                  {(['price', 'liquidity', 'correlation', 'volume', 'range', 'all', 'technical'] as ChartType[]).map((type) => (
                    <Button
                      key={type}
                      variant={chartType === type ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setChartType(type)}
                      className="h-8 px-3 text-sm"
                    >
                      {type === 'price' && t.priceChart}
                      {type === 'liquidity' && t.liquidityChart}
                      {type === 'correlation' && t.correlationChart}
                      {type === 'volume' && t.volumeChart}
                      {type === 'range' && t.rangeChart}
                      {type === 'all' && t.allCharts}
                      {type === 'technical' && t.technicalChart}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'price' ? (
                  <AreaChart data={filteredData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#priceGradient)"
                      name={t.price}
                    />
                  </AreaChart>
                ) : chartType === 'liquidity' ? (
                  <AreaChart data={filteredLiquidityData}>
                    <defs>
                      <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${formatLargeNumber(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="liquidity"
                      stroke="#3b82f6"
                      fill="url(#liquidityGradient)"
                      strokeWidth={2}
                      name={t.liquidity}
                    />
                  </AreaChart>
                ) : chartType === 'correlation' ? (
                  <ComposedChart data={filteredCorrelationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                      domain={[-20, 20]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="priceChange"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name={t.priceChange}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="liquidityChange"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name={t.liquidityChange}
                    />
                  </ComposedChart>
                ) : chartType === 'volume' ? (
                  <ComposedChart data={filteredData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `${formatLargeNumber(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume24h" fill="url(#volumeGradient)" radius={[4, 4, 0, 0]} name={t.volume} />
                  </ComposedChart>
                ) : chartType === 'range' ? (
                  <AreaChart data={filteredData}>
                    <defs>
                      <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="high"
                      stroke="#22c55e"
                      fill="url(#rangeGradient)"
                      name={t.highestPrice}
                    />
                    <Area
                      type="monotone"
                      dataKey="low"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      name={t.lowestPrice}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name={t.price}
                    />
                  </AreaChart>
                ) : chartType === 'technical' && data.technicalIndicators ? (
                  <LineChart data={filteredData.map((d, i) => ({
                    ...d,
                    ma7: data.technicalIndicators?.ma7?.[i],
                    ma30: data.technicalIndicators?.ma30?.[i],
                    ma90: data.technicalIndicators?.ma90?.[i],
                    rsi14: data.technicalIndicators?.rsi14?.[i],
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name={t.price}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ma7"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      dot={false}
                      name="MA7"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ma30"
                      stroke="#f59e42"
                      strokeWidth={1.5}
                      dot={false}
                      name="MA30"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ma90"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      dot={false}
                      name="MA90"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rsi14"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      dot={false}
                      name="RSI(14)"
                    />
                  </LineChart>
                ) : (
                  <ComposedChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${value.toFixed(1)}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${formatLargeNumber(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="right"
                      dataKey="volume24h"
                      fill="#f97316"
                      opacity={0.5}
                      name={t.volume}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name={t.price}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">{t.dataDisclaimer}</p>
          </CardContent>
        </Card>

        {/* 5. Volume Analysis (거래량 분석) */}
        {data.volumeStats && (
          <Card className="bg-card border-border/60 mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  {t.volumeAnalysis}
                </CardTitle>
                <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                  {(['daily', 'weekly', 'monthly'] as VolumeView[]).map((view) => (
                    <Button
                      key={view}
                      variant={volumeView === view ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setVolumeView(view)}
                      className="h-8 px-4 text-sm"
                    >
                      {view === 'daily' && t.daily}
                      {view === 'weekly' && t.weekly}
                      {view === 'monthly' && t.monthly}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Volume Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.totalVolume}</p>
                  <p className="text-base font-medium">${formatLargeNumber(data.volumeStats.totalVolume)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.avgDailyVolume}</p>
                  <p className="text-base font-medium">${formatLargeNumber(data.volumeStats.avgDailyVolume)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.highestDayVolume}</p>
                  <p className="text-base font-medium text-green-600">
                    ${formatLargeNumber(data.volumeStats.highestDayVolume.volume)}
                  </p>
                  <p className="text-sm text-muted-foreground">{data.volumeStats.highestDayVolume.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.lowestDayVolume}</p>
                  <p className="text-base font-medium text-red-600">
                    ${formatLargeNumber(data.volumeStats.lowestDayVolume.volume)}
                  </p>
                  <p className="text-sm text-muted-foreground">{data.volumeStats.lowestDayVolume.date}</p>
                </div>
              </div>

              {/* Volume Chart */}
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={
                      volumeView === 'daily'
                        ? data.volumeStats.daily.slice(-30)
                        : volumeView === 'weekly'
                          ? data.volumeStats.weekly
                          : data.volumeStats.monthly
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey={volumeView === 'daily' ? 'date' : volumeView === 'weekly' ? 'week' : 'month'}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${formatLargeNumber(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill="#f97316" opacity={0.7} name={t.volume} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. Market Overview (시장 개요) */}
        {data && (
          <Card className="bg-card border-border/60 mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                {language === 'ko' ? '시장 개요' : 'Market Overview'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Buy/Sell Ratio Pie Chart */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">
                    {language === 'ko' ? '24시간 매수/매도 비율' : '24h Buy/Sell Ratio'}
                  </h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: language === 'ko' ? '매수' : 'Buys', value: data.current.txns24h.buys, color: '#22c55e' },
                            { name: language === 'ko' ? '매도' : 'Sells', value: data.current.txns24h.sells, color: '#ef4444' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip
                          formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : String(value), '']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">{language === 'ko' ? '매수' : 'Buys'}: {data.current.txns24h.buys.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">{language === 'ko' ? '매도' : 'Sells'}: {data.current.txns24h.sells.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">
                    {language === 'ko' ? '성능 요약' : 'Performance Summary'}
                  </h4>
                  <div className="space-y-4">
                    {/* Buy/Sell Pressure Indicator */}
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {language === 'ko' ? '매수 압력' : 'Buying Pressure'}
                        </span>
                        <span className={`text-sm font-bold ${
                          data.current.txns24h.buys > data.current.txns24h.sells ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {((data.current.txns24h.buys / (data.current.txns24h.buys + data.current.txns24h.sells)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                          style={{
                            width: `${(data.current.txns24h.buys / (data.current.txns24h.buys + data.current.txns24h.sells)) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Market Sentiment */}
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === 'ko' ? '시장 심리' : 'Market Sentiment'}
                        </span>
                        <span className={`text-sm font-bold px-2 py-1 rounded ${
                          data.current.priceChange24h > 2 ? 'bg-green-500/20 text-green-500' :
                          data.current.priceChange24h > 0 ? 'bg-green-500/10 text-green-400' :
                          data.current.priceChange24h > -2 ? 'bg-red-500/10 text-red-400' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {data.current.priceChange24h > 2 ? (language === 'ko' ? '매우 긍정적' : 'Very Bullish') :
                           data.current.priceChange24h > 0 ? (language === 'ko' ? '긍정적' : 'Bullish') :
                           data.current.priceChange24h > -2 ? (language === 'ko' ? '부정적' : 'Bearish') :
                           (language === 'ko' ? '매우 부정적' : 'Very Bearish')}
                        </span>
                      </div>
                    </div>

                    {/* Volume to Liquidity Ratio */}
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === 'ko' ? '거래량/유동성 비율' : 'Volume/Liquidity Ratio'}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {((data.current.volume24h / data.current.liquidity) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ko'
                          ? '높을수록 활발한 거래 활동을 의미합니다'
                          : 'Higher ratio indicates more active trading'}
                      </p>
                    </div>

                    {/* Price Performance */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">24H</p>
                        <p className={`text-lg font-bold ${data.current.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.current.priceChange24h >= 0 ? '+' : ''}{data.current.priceChange24h.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">7D</p>
                        <p className={`text-lg font-bold ${data.current.priceChange7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.current.priceChange7d >= 0 ? '+' : ''}{data.current.priceChange7d.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* 8. Key Metrics Summary (핵심 지표 요약) */}
        {data && (
          <Card className="bg-card border-border/60 mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {language === 'ko' ? '핵심 지표 요약' : 'Key Metrics Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                  <p className="text-xs text-green-500 mb-1">{language === 'ko' ? '시가총액 순위' : 'Market Cap Rank'}</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${formatLargeNumber(data.current.marketCap)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-500 mb-1">{language === 'ko' ? '유동성 풀' : 'Liquidity Pool'}</p>
                  <p className="text-2xl font-bold text-blue-500">
                    ${formatLargeNumber(data.current.liquidity)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
                  <p className="text-xs text-orange-500 mb-1">{language === 'ko' ? '일일 거래량' : 'Daily Volume'}</p>
                  <p className="text-2xl font-bold text-orange-500">
                    ${formatLargeNumber(data.current.volume24h)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-purple-500 mb-1">{language === 'ko' ? '완전희석가치' : 'Fully Diluted Value'}</p>
                  <p className="text-2xl font-bold text-purple-500">
                    ${formatLargeNumber(data.current.fdv)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* 9. Liquidity Analysis (유동성 분석) */}
        {filteredLiquidityData.length > 0 && (
          <Card className="bg-card border-border/60 mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Waves className="h-5 w-5 text-blue-500" />
                {t.liquidityAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.totalDays}</p>
                  <p className="text-base font-medium">{filteredLiquidityData.length} {language === 'ko' ? '일' : 'days'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.initialLiquidity}</p>
                  <p className="text-base font-medium">${formatLargeNumber(liquidityAnalysis.initial)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.currentLiquidity}</p>
                  <p className="text-base font-medium">${formatLargeNumber(liquidityAnalysis.current)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.liquidityChange}</p>
                  <p
                    className={`text-base font-bold ${
                      liquidityAnalysis.rate >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {liquidityAnalysis.rate >= 0 ? '+' : ''}
                    {liquidityAnalysis.rate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.highestLiquidity}</p>
                  <p className="text-base font-medium text-green-600">${formatLargeNumber(liquidityAnalysis.highest)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.lowestLiquidity}</p>
                  <p className="text-base font-medium text-red-600">${formatLargeNumber(liquidityAnalysis.lowest)}</p>
                </div>
              </div>
              {data?.liquidityDataSource && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    {t.liquidityDataSource}: <span className={data.isEstimatedLiquidity ? "text-orange-500" : "text-blue-500"}>{data.liquidityDataSource}</span>
                  </p>
                  {data.isEstimatedLiquidity && (
                    <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {language === 'ko'
                          ? '* 히스토리 유동성 데이터는 가격/거래량 패턴을 기반으로 추정된 값입니다. 정확한 온체인 데이터를 위해 The Graph API 키를 설정하세요.'
                          : '* Historical liquidity data is estimated based on price/volume patterns. Set up The Graph API key for accurate on-chain data.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}



        {/* 10. Liquidity Alerts (유동성 변동 알림) */}
        {sortedLiquidityAlerts.length > 0 && (
          <Card className="bg-card border-border/60 mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {t.liquidityAlerts}
                  {data?.isEstimatedLiquidity && (
                    <span className="text-xs font-normal text-orange-500 ml-2">
                      ({language === 'ko' ? '추정 데이터' : 'Estimated'})
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="h-8"
                >
                  {showAlerts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showAlerts && (
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {sortedLiquidityAlerts.slice(0, 10).map((alert, index) => (
                    <div
                      key={`alert-${alert.date}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        {alert.type === 'increase' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-base font-medium">
                            {alert.type === 'increase' ? t.increase : t.decrease}: {alert.percentage.toFixed(2)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${formatLargeNumber(alert.fromValue)} → ${formatLargeNumber(alert.toValue)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {getSeverityLabel(alert.severity)}
                        </span>
                        <span className="text-sm text-muted-foreground">{alert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}



        {/* 11. Technical Indicators (기술적 지표) */}
        {data.technicalIndicators && (
          <Card className="bg-card border-border/60 mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                {t.technicalChart}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.movingAverages}</p>
                  <p className="text-base font-medium">
                    MA7: ${data.technicalIndicators.ma7?.[data.technicalIndicators.ma7.length - 1]?.toFixed(4) || '-'}
                  </p>
                  <p className="text-base font-medium">
                    MA30: ${data.technicalIndicators.ma30?.[data.technicalIndicators.ma30.length - 1]?.toFixed(4) || '-'}
                  </p>
                  <p className="text-base font-medium">
                    MA90: ${data.technicalIndicators.ma90?.[data.technicalIndicators.ma90.length - 1]?.toFixed(4) || '-'}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-2">{t.rsi}</p>
                  <RSIGauge
                    value={data.technicalIndicators.rsi14?.[data.technicalIndicators.rsi14.length - 1] || 50}
                    size="sm"
                    showLabels={true}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.volatility}</p>
                  <p className="text-base font-medium">
                    {t.daily}: {data.technicalIndicators.volatility.daily?.toFixed(2) || '-'}%
                  </p>
                  <p className="text-base font-medium">
                    {t.weekly}: {data.technicalIndicators.volatility.weekly?.toFixed(2) || '-'}%
                  </p>
                  <p className="text-base font-medium">
                    {t.monthly}: {data.technicalIndicators.volatility.monthly?.toFixed(2) || '-'}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.support}</p>
                  <p className="text-base font-medium">
                    ${data.technicalIndicators.support?.toFixed(4) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.resistance}</p>
                  <p className="text-base font-medium">
                    ${data.technicalIndicators.resistance?.toFixed(4) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t.trend}</p>
                  <p className={`text-base font-bold ${
                    data.technicalIndicators.trend === 'bullish'
                      ? 'text-green-500'
                      : data.technicalIndicators.trend === 'bearish'
                        ? 'text-red-500'
                        : 'text-gray-500'
                  }`}>
                    {data.technicalIndicators.trend === 'bullish'
                      ? t.bullish
                      : data.technicalIndicators.trend === 'bearish'
                        ? t.bearish
                        : t.neutral}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 12. MACD Chart */}
        {filteredData.length >= 35 && (
          <div className="mb-6 sm:mb-8">
            <MACDChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price }))}
              loading={loading}
            />
          </div>
        )}

        {/* 13. Bollinger Bands Chart */}
        {filteredData.length >= 25 && (
          <div className="mb-6 sm:mb-8">
            <BollingerBandsChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price }))}
              period={20}
              stdDev={2}
              loading={loading}
            />
          </div>
        )}

        {/* 14. Stochastic Oscillator Chart */}
        {filteredData.length >= 20 && (
          <div className="mb-6 sm:mb-8">
            <StochasticChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              kPeriod={14}
              dPeriod={3}
              loading={loading}
            />
          </div>
        )}

        {/* 15. ATR Chart */}
        {filteredData.length >= 20 && (
          <div className="mb-6 sm:mb-8">
            <ATRChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              period={14}
              loading={loading}
            />
          </div>
        )}

        {/* 16. Williams %R Chart */}
        {filteredData.length >= 20 && (
          <div className="mb-6 sm:mb-8">
            <WilliamsRChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              period={14}
              loading={loading}
            />
          </div>
        )}

        {/* 17. CCI Chart */}
        {filteredData.length >= 25 && (
          <div className="mb-6 sm:mb-8">
            <CCIChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              period={20}
              loading={loading}
            />
          </div>
        )}

        {/* 18. OBV Chart */}
        {filteredData.length >= 25 && (
          <div className="mb-6 sm:mb-8">
            <OBVChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, volume: d.volume24h }))}
              maPeriod={20}
              loading={loading}
            />
          </div>
        )}

        {/* 19. ADX Chart */}
        {filteredData.length >= 35 && (
          <div className="mb-6 sm:mb-8">
            <ADXChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              period={14}
              loading={loading}
            />
          </div>
        )}

        {/* 20. Ichimoku Cloud Chart */}
        {filteredData.length >= 60 && (
          <div className="mb-6 sm:mb-8">
            <IchimokuChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              tenkanPeriod={9}
              kijunPeriod={26}
              senkouBPeriod={52}
              displacement={26}
              loading={loading}
            />
          </div>
        )}

        {/* 21. Parabolic SAR Chart */}
        {filteredData.length >= 15 && (
          <div className="mb-6 sm:mb-8">
            <ParabolicSARChart
              priceData={filteredData.map(d => ({ date: d.date, price: d.price, high: d.high, low: d.low }))}
              afStart={0.02}
              afIncrement={0.02}
              afMax={0.2}
              loading={loading}
            />
          </div>
        )}

      </main>

      <Footer />
    </div>
    </ProtectedPage>
  );
}
