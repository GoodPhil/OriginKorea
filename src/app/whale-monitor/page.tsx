'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProtectedPage } from '@/hooks/usePagePermission';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { WhaleHistoryChart } from '@/components/WhaleHistoryChart';
import { OnChainAnalysis } from '@/components/OnChainAnalysis';
import {
  Anchor,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Fish,
  Waves,
  Activity,
  Clock,
  Bell,
  Loader2,
  CheckCircle,
  Database,
  Zap,
  ArrowRightLeft,
  DollarSign,
  Target,
  Settings,
  ChevronDown,
  ChevronUp,
  BarChart3,
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
} from 'recharts';

interface WhaleTransaction {
  id: string;
  hash: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  amountUSD: number;
  from: string;
  to: string;
  timestamp: Date;
  blockNumber?: number;
}

interface WhaleWallet {
  address: string;
  totalIn: number;
  totalOut: number;
  netFlow: number;
  transactionCount: number;
  lastActivity: Date;
}

interface WhaleStats {
  totalTransactions: number;
  buyCount: number;
  sellCount: number;
  transferCount: number;
  totalVolumeUSD: number;
  buyVolumeUSD: number;
  sellVolumeUSD: number;
}

export default function WhaleMonitorPage() {
  const { language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [wallets, setWallets] = useState<WhaleWallet[]>([]);
  const [stats, setStats] = useState<WhaleStats | null>(null);
  const [lgnsPrice, setLgnsPrice] = useState(6.36);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'transactions' | 'wallets'>('all');
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [dataSource, setDataSource] = useState<string>('loading');
  const [chartTimeframe, setChartTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [thresholdAmount, setThresholdAmount] = useState(5000);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);

  const texts = {
    ko: {
      pageTitle: '온체인 분석',
      pageSubtitle: 'LGNS 온체인 데이터 분석 - 거래량, 고래 활동, 홀더 분포',
      largeTransactionTitle: '대규모 거래 추적',
      largeTransactionSubtitle: '최근 대규모 거래 내역',
      whaleTrackingTitle: '고래 지갑 추적',
      whaleTrackingSubtitle: '주요 고래 지갑 활동 및 자금 흐름 분석 (지갑 연결 필요)',
      showAll: '전체 보기',
      transactions: '대규모 거래',
      wallets: '고래 지갑',
      chart: '차트',
      refresh: '새로고침',
      refreshing: '갱신 중...',
      enableAlerts: '알림 설정',
      alertsOn: '알림 켜짐',
      buy: '매수',
      sell: '매도',
      transfer: '전송',
      amount: '수량',
      value: '가치',
      threshold: '임계값',
      thresholdSettings: '임계값 설정',
      thresholdDesc: 'LGNS 이상',
      priceImpact: '가격 영향',
      from: '보낸 주소',
      to: '받는 주소',
      timeAgo: '전',
      balance: '순유입',
      totalIn: '총 유입',
      totalOut: '총 유출',
      lastActivity: '최근 활동',
      txCount: '거래 수',
      viewOnExplorer: '익스플로러에서 보기',
      dataSource: '데이터 소스',
      polygonscan: 'Polygonscan API',
      fallback: '추정 데이터',
      showMore: '전체 보기',
      showLess: '접기',
      moreTransactions: '개의 추가 거래가 있습니다.',
      stats: {
        txCount: '대규모 거래 수',
        totalVolume: '총 대규모 거래량',
        avgSize: '평균 거래 크기',
        buySellRatio: '매수/매도 비율',
        activeWhales: '활성 고래 수',
      },
      alertInfo: '고래 거래 알림이 활성화되었습니다.',
      noTransactions: '기준 금액 이상의 거래가 없습니다.',
      requiresWallet: '지갑 연결이 필요합니다',
      dataInfo: '데이터 안내',
      dataInfoNote: '현재 표시되는 데이터는 Polygonscan API가 설정되지 않은 경우 추정 데이터입니다. 실제 데이터를 위해서는 POLYGONSCAN_API_KEY 환경변수 설정이 필요합니다.',
      priceExplanation: 'USD 가치는 거래 시점의 LGNS 가격으로 계산된 예상 금액입니다.',
      priceImpactExplanation: '가격 영향은 해당 거래 규모가 유동성 풀에 미치는 예상 영향도입니다.',
      unitPriceExplanation: '거래 당시 LGNS 단가입니다.',
    },
    en: {
      pageTitle: 'On-Chain Analysis',
      pageSubtitle: 'On-chain data analysis - Volume, Whale Activity, Holder Distribution',
      largeTransactionTitle: 'Large Transaction Tracking',
      largeTransactionSubtitle: 'Recent large transaction history',
      whaleTrackingTitle: 'Whale Wallet Tracking',
      whaleTrackingSubtitle: 'Analysis of major whale wallet activities (Wallet connection required)',
      showAll: 'Show All',
      transactions: 'Large Txs',
      wallets: 'Whale Wallets',
      chart: 'Chart',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',
      enableAlerts: 'Enable Alerts',
      alertsOn: 'Alerts On',
      buy: 'Buy',
      sell: 'Sell',
      transfer: 'Transfer',
      amount: 'Amount',
      value: 'Value',
      threshold: 'Threshold',
      thresholdSettings: 'Threshold Settings',
      thresholdDesc: 'LGNS or more',
      priceImpact: 'Price Impact',
      from: 'From',
      to: 'To',
      timeAgo: 'ago',
      balance: 'Net Flow',
      totalIn: 'Total In',
      totalOut: 'Total Out',
      lastActivity: 'Last Activity',
      txCount: 'Tx Count',
      viewOnExplorer: 'View on Explorer',
      dataSource: 'Data Source',
      polygonscan: 'Polygonscan API',
      fallback: 'Estimated Data',
      showMore: 'Show All',
      showLess: 'Show Less',
      moreTransactions: 'more transactions available.',
      stats: {
        txCount: 'Large Tx Count',
        totalVolume: 'Total Large Volume',
        avgSize: 'Avg Transaction Size',
        buySellRatio: 'Buy/Sell Ratio',
        activeWhales: 'Active Whales',
      },
      alertInfo: 'Whale alerts are enabled.',
      noTransactions: 'No transactions above threshold.',
      requiresWallet: 'Wallet connection required',
      dataInfo: 'Data Info',
      dataInfoNote: 'Displayed data is estimated if Polygonscan API is not configured. Set POLYGONSCAN_API_KEY environment variable for real data.',
      priceExplanation: 'USD value is calculated based on LGNS price at the time of transaction.',
      priceImpactExplanation: 'Price impact shows estimated effect of this transaction on the liquidity pool.',
      unitPriceExplanation: 'Unit price of LGNS at the time of transaction.',
    },
  };

  const t = texts[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whale-data');
      const data = await response.json();

      if (data.success) {
        const parsedTransactions = data.transactions.map((tx: WhaleTransaction) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        }));
        const parsedWallets = data.wallets.map((w: WhaleWallet) => ({
          ...w,
          lastActivity: new Date(w.lastActivity),
        }));

        setTransactions(parsedTransactions);
        setWallets(parsedWallets);
        setStats(data.stats);
        setLgnsPrice(data.lgnsPrice || 6.36);
        setDataSource(data.source);
      }
    } catch (error) {
      console.error('Failed to load whale data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ${t.timeAgo}`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${t.timeAgo}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${t.timeAgo}`;
    return `${Math.floor(seconds / 86400)}d ${t.timeAgo}`;
  };

  // Filter transactions by threshold
  const largeTransactions = transactions.filter(tx => tx.amount >= thresholdAmount);

  // Calculate stats from filtered transactions
  const displayStats = {
    txCount: largeTransactions.length,
    totalVolumeUSD: largeTransactions.reduce((sum, tx) => sum + tx.amountUSD, 0),
    avgSize: largeTransactions.length > 0
      ? largeTransactions.reduce((sum, tx) => sum + tx.amountUSD, 0) / largeTransactions.length
      : 0,
    buyCount: largeTransactions.filter(tx => tx.type === 'buy').length,
    sellCount: largeTransactions.filter(tx => tx.type === 'sell').length,
    transferCount: largeTransactions.filter(tx => tx.type === 'transfer').length,
  };

  // Generate chart data - aggregate by date
  const generateChartData = () => {
    const dateMap = new Map<string, { buy: number; sell: number }>();

    largeTransactions.forEach(tx => {
      const dateStr = tx.timestamp.toISOString().split('T')[0];
      const existing = dateMap.get(dateStr) || { buy: 0, sell: 0 };
      if (tx.type === 'buy') {
        existing.buy += tx.amountUSD;
      } else if (tx.type === 'sell') {
        existing.sell += tx.amountUSD;
      }
      dateMap.set(dateStr, existing);
    });

    return Array.from(dateMap.entries())
      .map(([date, values]) => ({
        date: date.slice(5), // MM-DD format
        buy: values.buy,
        sell: values.sell,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10); // Last 10 days
  };

  const chartData = generateChartData();

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedPage>
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Anchor className="h-8 w-8 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.pageTitle}</h1>
              <p className="text-sm text-muted-foreground">{t.pageSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={dataSource === 'polygonscan' ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'}
            >
              <Database className="h-3 w-3 mr-1" />
              {dataSource === 'polygonscan' ? t.polygonscan : t.fallback}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t.refreshing : t.refresh}
            </Button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <Button
            variant={activeSection === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveSection('all')}
            className="gap-2 flex-shrink-0"
            size="sm"
          >
            <Activity className="h-4 w-4" />
            {t.showAll}
          </Button>
          <Button
            variant={activeSection === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveSection('transactions')}
            className="gap-2 flex-shrink-0"
            size="sm"
          >
            <Waves className="h-4 w-4" />
            {t.transactions}
          </Button>
          <Button
            variant={activeSection === 'wallets' ? 'default' : 'outline'}
            onClick={() => setActiveSection('wallets')}
            className="gap-2 flex-shrink-0"
            size="sm"
          >
            <Fish className="h-4 w-4" />
            {t.wallets}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <>
            {/* ========== SECTION 1: 대규모 거래 추적 (TOP) ========== */}
            {(activeSection === 'all' || activeSection === 'transactions') && (
              <Card className="bg-card border-border/60 mb-8">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <BarChart3 className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {t.largeTransactionTitle}
                          <Badge variant="outline" className="text-xs">
                            {dataSource === 'polygonscan' ? t.polygonscan : t.fallback}
                          </Badge>
                          <Badge className="bg-amber-500 text-white text-xs">
                            {t.threshold}: {formatNumber(thresholdAmount)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{t.largeTransactionSubtitle} ({thresholdAmount / 1000}K+)</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowThresholdSettings(!showThresholdSettings)}
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        {t.thresholdSettings}
                      </Button>
                      <Button
                        variant={showAllTransactions ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                        className="gap-2"
                      >
                        {showAllTransactions ? t.showLess : t.showMore}
                        {showAllTransactions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Threshold Settings */}
                  {showThresholdSettings && (
                    <div className="mt-4 p-4 bg-secondary/30 rounded-lg flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{t.threshold}:</span>
                      <Input
                        type="number"
                        value={thresholdAmount}
                        onChange={(e) => setThresholdAmount(Number(e.target.value) || 0)}
                        className="w-32 h-8 text-sm"
                        min={0}
                        step={1000}
                      />
                      <span className="text-sm text-muted-foreground">{t.thresholdDesc}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Chart */}
                  {chartData.length > 0 && (
                    <div className="h-[200px] mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${formatNumber(v)}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value) => [`${formatNumber(value as number)}`, '']}
                          />
                          <Bar dataKey="sell" stackId="a" fill="#ef4444" name={t.sell} />
                          <Bar dataKey="buy" stackId="a" fill="#22c55e" name={t.buy} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-red-500" />
                          <span className="text-xs text-muted-foreground">{t.sell}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-green-500" />
                          <span className="text-xs text-muted-foreground">{t.buy}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t.stats.txCount}</p>
                      <p className="text-xl font-bold text-primary">{displayStats.txCount}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t.stats.totalVolume}</p>
                      <p className="text-xl font-bold text-green-500">${formatNumber(displayStats.totalVolumeUSD)}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t.stats.avgSize}</p>
                      <p className="text-xl font-bold text-cyan-500">${formatNumber(displayStats.avgSize)}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t.stats.buySellRatio}</p>
                      <p className="text-xl font-bold">
                        <span className="text-green-500">{displayStats.buyCount}</span>
                        {' / '}
                        <span className="text-red-500">{displayStats.sellCount}</span>
                      </p>
                    </div>
                  </div>

                  {/* Data Explanation Notice */}
                  {dataSource !== 'polygonscan' && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-amber-600 dark:text-amber-400">{t.dataInfo}</p>
                          <p className="text-muted-foreground">{t.dataInfoNote}</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li><strong className="text-foreground">$ {language === 'ko' ? '가격' : 'Value'}</strong>: {t.priceExplanation}</li>
                            <li><strong className="text-foreground">@ ${language === 'ko' ? '단가' : 'Unit Price'}</strong>: {t.unitPriceExplanation}</li>
                            <li><strong className="text-foreground">{t.priceImpact}</strong>: {t.priceImpactExplanation}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction List */}
                  {largeTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {(showAllTransactions ? largeTransactions : largeTransactions.slice(0, 10)).map((tx) => (
                        <div
                          key={tx.id}
                          className={`p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-all flex flex-col sm:flex-row sm:items-center gap-3 ${
                            tx.type === 'buy' ? 'border-l-4 border-l-green-500' : tx.type === 'sell' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${tx.type === 'buy' ? 'bg-green-500/20' : tx.type === 'sell' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                              {tx.type === 'buy' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              ) : tx.type === 'sell' ? (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                              ) : (
                                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={tx.type === 'buy' ? 'border-green-500 text-green-500' : tx.type === 'sell' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'}>
                                  {tx.type === 'buy' ? t.buy : tx.type === 'sell' ? t.sell : t.transfer}
                                </Badge>
                                <span className="text-lg font-bold">${formatNumber(tx.amountUSD)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatAddress(tx.from)} • {tx.timestamp.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium">{formatNumber(tx.amount)} LGNS</p>
                              <p className="text-xs text-muted-foreground">@ ${lgnsPrice.toFixed(4)}</p>
                              <p className="text-xs text-muted-foreground">{t.priceImpact}: {((tx.amountUSD / 1000000) * 0.1).toFixed(2)}%</p>
                            </div>
                            <a
                              href={`https://polygonscan.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}

                      {/* Show more indicator */}
                      {!showAllTransactions && largeTransactions.length > 10 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          {largeTransactions.length - 10}{t.moreTransactions}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t.noTransactions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ========== SECTION 2: 고래 지갑 추적 (BOTTOM) ========== */}
            {(activeSection === 'all' || activeSection === 'wallets') && (
              <PremiumFeatureGate
                requiredTier="silver"
                featureName={{ ko: '고래 지갑 추적', en: 'Whale Wallet Tracking' }}
                showPreview
                previewContent={
                  <div className="space-y-3 opacity-50">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 rounded-lg bg-secondary/30">
                        <div className="h-4 w-48 bg-secondary rounded mb-2" />
                        <div className="h-3 w-32 bg-secondary rounded" />
                      </div>
                    ))}
                  </div>
                }
              >
                <Card className="bg-card border-border/60 mb-8">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                        <Fish className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {t.whaleTrackingTitle}
                          <Badge variant="secondary" className="text-xs">
                            {t.requiresWallet}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{t.whaleTrackingSubtitle}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {wallets.map((wallet, index) => (
                        <div key={wallet.address} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <code className="text-sm bg-secondary px-2 py-0.5 rounded font-mono">
                                  {formatAddress(wallet.address)}
                                </code>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t.lastActivity}: {formatTimeAgo(wallet.lastActivity)}
                                </p>
                              </div>
                            </div>

                            <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">{t.totalIn}</p>
                                <p className="font-medium text-green-500">{formatNumber(wallet.totalIn)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{t.totalOut}</p>
                                <p className="font-medium text-red-500">{formatNumber(wallet.totalOut)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{t.balance}</p>
                                <p className={`font-bold ${wallet.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {wallet.netFlow >= 0 ? '+' : ''}{formatNumber(wallet.netFlow)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">{t.txCount}</p>
                                <p className="font-medium">{wallet.transactionCount}</p>
                              </div>
                              <a
                                href={`https://polygonscan.com/address/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </PremiumFeatureGate>
            )}

            {/* Alert Info */}
            {alertsEnabled && (
              <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-500" />
                  <p className="text-sm">{t.alertInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* On-Chain Analysis Component */}
            <div className="mt-8">
              <OnChainAnalysis
                data={{
                  current: {
                    price: lgnsPrice,
                    volume24h: stats?.totalVolumeUSD || 0,
                    liquidity: 380000000,
                    txns24h: {
                      buys: stats?.buyCount || 0,
                      sells: stats?.sellCount || 0,
                    },
                  },
                }}
                loading={isLoading}
              />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
    </ProtectedPage>
  );
}
