'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, BarChart, Bar
} from 'recharts';
import {
  Calculator, TrendingUp, TrendingDown, Calendar, Plus, Minus,
  DollarSign, Coins, RefreshCw, History, ChevronDown, ChevronUp,
  Trash2, BarChart3, Clock, Zap,
  ArrowUpRight, ArrowDownRight, PiggyBank, Target, Info,
  Loader2, Database, Filter, SortAsc, SortDesc, ArrowUp, ArrowDown,
  Activity, Layers, TrendingUp as TrendUp
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExchangeRate, formatKRW } from '@/hooks/useExchangeRate';

// Types
interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'stake_reward';
  date: string;
  amount: number;
  priceAtTime: number;
  note?: string;
}

interface HistoricalPrice {
  date: string;
  price: number;
}

interface CalculationResult {
  initialTokens: number;
  currentTokens: number;
  stakingRewards: number;
  totalInvestedUSD: number;
  currentValueUSD: number;
  profitUSD: number;
  profitPercent: number;
  chartData: Array<{
    date: string;
    tokens: number;
    value: number;
    invested: number;
    rewards: number;
    price: number;
  }>;
}

// LocalStorage key
const STORAGE_KEY = 'originkorea_investment_transactions';

// Manual historical price data (fallback)
const MANUAL_PRICE_DATA: HistoricalPrice[] = [
  { date: '2024-03-01', price: 5.20 },
  { date: '2024-03-15', price: 5.35 },
  { date: '2024-04-01', price: 5.50 },
  { date: '2024-04-15', price: 5.45 },
  { date: '2024-05-01', price: 5.60 },
  { date: '2024-05-15', price: 5.75 },
  { date: '2024-06-01', price: 5.80 },
  { date: '2024-06-15', price: 5.90 },
  { date: '2024-07-01', price: 6.00 },
  { date: '2024-07-15', price: 6.10 },
  { date: '2024-08-01', price: 6.15 },
  { date: '2024-08-15', price: 6.20 },
  { date: '2024-09-01', price: 6.25 },
  { date: '2024-09-15', price: 6.30 },
  { date: '2024-10-01', price: 6.35 },
  { date: '2024-10-15', price: 6.40 },
  { date: '2024-11-01', price: 6.45 },
  { date: '2024-11-15', price: 6.50 },
  { date: '2024-12-01', price: 6.55 },
  { date: '2024-12-15', price: 6.60 },
  { date: '2024-12-31', price: 6.57 },
];

// Helper to get price for a specific date
const getPriceForDate = (date: string, priceData: HistoricalPrice[]): number => {
  const targetDate = new Date(date);
  let closestPrice = priceData[0]?.price || 6.57;
  let closestDiff = Infinity;

  for (const item of priceData) {
    const diff = Math.abs(new Date(item.date).getTime() - targetDate.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closestPrice = item.price;
    }
  }

  return closestPrice;
};

// Calculate compound staking rewards
const calculateStakingRewards = (
  startDate: string,
  endDate: string,
  initialTokens: number,
  yieldPer8Hours: number = 0.2
): { finalTokens: number; rewards: number; periods: number } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const periods = Math.floor(hoursDiff / 8);

  const rate = yieldPer8Hours / 100;
  const finalTokens = initialTokens * Math.pow(1 + rate, periods);
  const rewards = finalTokens - initialTokens;

  return { finalTokens, rewards, periods };
};

// Load transactions from localStorage
const loadTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load transactions from localStorage:', error);
  }
  return [];
};

// Save transactions to localStorage
const saveTransactions = (transactions: Transaction[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions to localStorage:', error);
  }
};

export function InvestmentCalculator() {
  const { language } = useLanguage();
  const { rate: exchangeRate } = useExchangeRate();

  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'buy' as 'buy' | 'sell',
    date: new Date().toISOString().split('T')[0],
    amountUSD: '',
    amountLGNS: '',
    priceAtTime: '',
    note: '',
  });
  const [inputMode, setInputMode] = useState<'usd' | 'lgns'>('usd');
  const [calculationMode, setCalculationMode] = useState<'auto' | 'manual'>('auto');
  const [yieldPer8Hours, setYieldPer8Hours] = useState(0.2);
  const [currentPrice, setCurrentPrice] = useState(6.57);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<HistoricalPrice[]>(MANUAL_PRICE_DATA);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [priceDataSource, setPriceDataSource] = useState<'manual' | 'coingecko'>('manual');

  // New filter/sort states
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chartView, setChartView] = useState<'value' | 'tokens' | 'rewards'>('value');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  const texts = {
    ko: {
      title: '투자 수익률 계산기',
      subtitle: '실제 투자 내역을 기반으로 스테이킹 복리 수익과 ROI를 계산합니다',
      addTransaction: '거래 추가',
      transactionHistory: '거래 내역',
      buy: '매수',
      sell: '매도',
      date: '날짜',
      amountUSD: '투자금액 (USD)',
      amountLGNS: '수량 (LGNS)',
      priceAtTime: '당시 가격 (USD)',
      note: '메모',
      add: '추가',
      cancel: '취소',
      inputMode: '입력 방식',
      byUSD: 'USD 금액으로',
      byLGNS: 'LGNS 수량으로',
      calculationMode: '계산 모드',
      auto: '자동 (0.2%/8h)',
      manual: '수동 설정',
      yieldSetting: '8시간당 수익률 (%)',
      currentPrice: '현재 가격',
      summary: '투자 요약',
      totalInvested: '총 투자금',
      currentValue: '현재 가치',
      totalProfit: '총 수익',
      roi: '수익률 (ROI)',
      initialTokens: '최초 토큰',
      stakingRewards: '스테이킹 보상',
      currentTokens: '현재 토큰',
      noTransactions: '거래 내역이 없습니다',
      addFirst: '첫 번째 거래를 추가해보세요',
      chartTitle: '투자 가치 추이',
      valueLabel: '가치 (USD)',
      investedLabel: '투자금',
      tokensLabel: '토큰 수량',
      rewardsLabel: '누적 보상',
      delete: '삭제',
      priceNote: '* 가격 데이터는 CoinGecko 또는 수동 입력 데이터를 사용합니다',
      compoundNote: '* 스테이킹 보상은 8시간마다 {rate}%의 복리로 계산됩니다',
      periods: '복리 적용 횟수',
      daysStaked: '스테이킹 일수',
      avgBuyPrice: '평균 매수가',
      breakeven: '손익분기점',
      refreshPrice: '현재가 새로고침',
      fetchHistoricalPrices: 'CoinGecko 가격 불러오기',
      fetchingPrices: '가격 로딩 중...',
      priceSource: '가격 데이터 소스',
      manualData: '수동 데이터',
      coingeckoData: 'CoinGecko API',
      dataSaved: '거래 내역이 자동 저장됩니다',
      clearAll: '전체 삭제',
      confirmClear: '모든 거래 내역을 삭제하시겠습니까?',
      // New texts
      filterAll: '전체',
      filterBuy: '매수만',
      filterSell: '매도만',
      sortByDate: '날짜순',
      sortByAmount: '수량순',
      sortByValue: '금액순',
      ascending: '오름차순',
      descending: '내림차순',
      chartValue: '가치',
      chartTokens: '토큰',
      chartRewards: '보상',
      dateRange: '기간 필터',
      from: '시작',
      to: '종료',
      resetFilter: '필터 초기화',
      advancedStats: '상세 통계',
      totalBuys: '총 매수',
      totalSells: '총 매도',
      netTokens: '순 토큰',
      maxValue: '최고 가치',
      minValue: '최저 가치',
      avgPrice: '평균 거래가',
      dailyAvgReturn: '일평균 수익',
      priceAtBuy: '매수 시 평균가',
      priceChange: '가격 변동률',
      txCount: '거래 횟수',
    },
    en: {
      title: 'Investment ROI Calculator',
      subtitle: 'Calculate staking compound rewards and ROI based on your actual investments',
      addTransaction: 'Add Transaction',
      transactionHistory: 'Transaction History',
      buy: 'Buy',
      sell: 'Sell',
      date: 'Date',
      amountUSD: 'Amount (USD)',
      amountLGNS: 'Amount (LGNS)',
      priceAtTime: 'Price at Time (USD)',
      note: 'Note',
      add: 'Add',
      cancel: 'Cancel',
      inputMode: 'Input Mode',
      byUSD: 'By USD Amount',
      byLGNS: 'By LGNS Amount',
      calculationMode: 'Calculation Mode',
      auto: 'Auto (0.2%/8h)',
      manual: 'Manual Setting',
      yieldSetting: 'Yield per 8 hours (%)',
      currentPrice: 'Current Price',
      summary: 'Investment Summary',
      totalInvested: 'Total Invested',
      currentValue: 'Current Value',
      totalProfit: 'Total Profit',
      roi: 'ROI',
      initialTokens: 'Initial Tokens',
      stakingRewards: 'Staking Rewards',
      currentTokens: 'Current Tokens',
      noTransactions: 'No transactions yet',
      addFirst: 'Add your first transaction to get started',
      chartTitle: 'Investment Value Over Time',
      valueLabel: 'Value (USD)',
      investedLabel: 'Invested',
      tokensLabel: 'Token Amount',
      rewardsLabel: 'Cumulative Rewards',
      delete: 'Delete',
      priceNote: '* Price data from CoinGecko or manual entry',
      compoundNote: '* Staking rewards calculated at {rate}% compound every 8 hours',
      periods: 'Compound Periods',
      daysStaked: 'Days Staked',
      avgBuyPrice: 'Avg Buy Price',
      breakeven: 'Breakeven',
      refreshPrice: 'Refresh Price',
      fetchHistoricalPrices: 'Fetch CoinGecko Prices',
      fetchingPrices: 'Loading prices...',
      priceSource: 'Price Data Source',
      manualData: 'Manual Data',
      coingeckoData: 'CoinGecko API',
      dataSaved: 'Transactions are auto-saved',
      clearAll: 'Clear All',
      confirmClear: 'Delete all transactions?',
      // New texts
      filterAll: 'All',
      filterBuy: 'Buy Only',
      filterSell: 'Sell Only',
      sortByDate: 'By Date',
      sortByAmount: 'By Amount',
      sortByValue: 'By Value',
      ascending: 'Ascending',
      descending: 'Descending',
      chartValue: 'Value',
      chartTokens: 'Tokens',
      chartRewards: 'Rewards',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      resetFilter: 'Reset Filter',
      advancedStats: 'Advanced Stats',
      totalBuys: 'Total Buys',
      totalSells: 'Total Sells',
      netTokens: 'Net Tokens',
      maxValue: 'Max Value',
      minValue: 'Min Value',
      avgPrice: 'Avg Trade Price',
      dailyAvgReturn: 'Daily Avg Return',
      priceAtBuy: 'Avg Buy Price',
      priceChange: 'Price Change',
      txCount: 'Transactions',
    },
  };

  const t = texts[language];

  // Load transactions from localStorage on mount
  useEffect(() => {
    const loaded = loadTransactions();
    if (loaded.length > 0) {
      setTransactions(loaded);
    }
  }, []);

  // Save transactions to localStorage when they change
  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions]);

  // Fetch current price from DexScreener
  const fetchCurrentPrice = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://api.dexscreener.com/latest/dex/pairs/polygon/0x882df4b0fb50a229c3b4124eb18c759911485bfb'
      );
      const data = await response.json();
      if (data?.pair?.priceUsd) {
        setCurrentPrice(parseFloat(data.pair.priceUsd));
      }
    } catch (error) {
      console.error('Failed to fetch current price:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch historical prices from CoinGecko
  const fetchHistoricalPrices = useCallback(async () => {
    setIsFetchingHistory(true);
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/origin-lgns/market_chart?vs_currency=usd&days=365&interval=daily',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.prices && Array.isArray(data.prices)) {
          const historicalPrices: HistoricalPrice[] = data.prices.map((item: [number, number]) => ({
            date: new Date(item[0]).toISOString().split('T')[0],
            price: item[1],
          }));
          setPriceData(historicalPrices);
          setPriceDataSource('coingecko');
          return;
        }
      }

      console.log('CoinGecko API not available for LGNS, using manual data');
      setPriceDataSource('manual');
    } catch (error) {
      console.error('Failed to fetch historical prices:', error);
      setPriceDataSource('manual');
    } finally {
      setIsFetchingHistory(false);
    }
  }, []);

  // Auto-fetch price on mount
  useEffect(() => {
    fetchCurrentPrice();
  }, [fetchCurrentPrice]);

  // Get price for date when date changes
  const handleDateChange = (date: string) => {
    setNewTransaction(prev => {
      const price = getPriceForDate(date, priceData);
      return { ...prev, date, priceAtTime: price.toFixed(2) };
    });
  };

  // Calculate from input
  const calculateFromInput = () => {
    const price = parseFloat(newTransaction.priceAtTime) || currentPrice;

    if (inputMode === 'usd') {
      const usd = parseFloat(newTransaction.amountUSD) || 0;
      const lgns = usd / price;
      return { usd, lgns, price };
    } else {
      const lgns = parseFloat(newTransaction.amountLGNS) || 0;
      const usd = lgns * price;
      return { usd, lgns, price };
    }
  };

  // Add transaction
  const addTransaction = () => {
    const { lgns, price } = calculateFromInput();

    if (lgns <= 0) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      date: newTransaction.date,
      amount: newTransaction.type === 'sell' ? -lgns : lgns,
      priceAtTime: price,
      note: newTransaction.note,
    };

    const newTransactions = [...transactions, transaction].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setTransactions(newTransactions);

    // Reset form
    setNewTransaction({
      type: 'buy',
      date: new Date().toISOString().split('T')[0],
      amountUSD: '',
      amountLGNS: '',
      priceAtTime: currentPrice.toFixed(2),
      note: '',
    });
    setShowTransactionForm(false);
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    if (newTransactions.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Clear all transactions
  const clearAllTransactions = () => {
    if (confirm(t.confirmClear)) {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType('all');
    setSortBy('date');
    setSortOrder('desc');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by date range
    if (dateRangeStart) {
      filtered = filtered.filter(tx => tx.date >= dateRangeStart);
    }
    if (dateRangeEnd) {
      filtered = filtered.filter(tx => tx.date <= dateRangeEnd);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'value':
          comparison = (Math.abs(a.amount) * a.priceAtTime) - (Math.abs(b.amount) * b.priceAtTime);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterType, sortBy, sortOrder, dateRangeStart, dateRangeEnd]);

  // Calculate results
  const results = useMemo((): CalculationResult | null => {
    if (transactions.length === 0) return null;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const rate = calculationMode === 'auto' ? 0.2 : yieldPer8Hours;

    let totalInvestedUSD = 0;
    let runningTokens = 0;
    let totalStakingRewards = 0;

    const chartData: CalculationResult['chartData'] = [];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sortedTransactions.length; i++) {
      const tx = sortedTransactions[i];

      if (i > 0 && runningTokens > 0) {
        const prevDate = sortedTransactions[i - 1].date;
        const { rewards } = calculateStakingRewards(prevDate, tx.date, runningTokens, rate);
        runningTokens += rewards;
        totalStakingRewards += rewards;
      }

      if (tx.type === 'buy') {
        runningTokens += tx.amount;
        totalInvestedUSD += tx.amount * tx.priceAtTime;
      } else if (tx.type === 'sell') {
        runningTokens += tx.amount;
        totalInvestedUSD += tx.amount * tx.priceAtTime;
      }

      chartData.push({
        date: tx.date,
        tokens: runningTokens,
        value: runningTokens * tx.priceAtTime,
        invested: totalInvestedUSD,
        rewards: totalStakingRewards,
        price: tx.priceAtTime,
      });
    }

    if (sortedTransactions.length > 0 && runningTokens > 0) {
      const lastTxDate = sortedTransactions[sortedTransactions.length - 1].date;
      const { rewards } = calculateStakingRewards(lastTxDate, todayStr, runningTokens, rate);
      runningTokens += rewards;
      totalStakingRewards += rewards;
    }

    chartData.push({
      date: todayStr,
      tokens: runningTokens,
      value: runningTokens * currentPrice,
      invested: totalInvestedUSD,
      rewards: totalStakingRewards,
      price: currentPrice,
    });

    const currentValueUSD = runningTokens * currentPrice;
    const profitUSD = currentValueUSD - totalInvestedUSD;
    const profitPercent = totalInvestedUSD > 0 ? (profitUSD / totalInvestedUSD) * 100 : 0;

    const initialTokens = transactions
      .filter(tx => tx.type === 'buy')
      .reduce((sum, tx) => sum + tx.amount, 0) +
      transactions
      .filter(tx => tx.type === 'sell')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      initialTokens,
      currentTokens: runningTokens,
      stakingRewards: totalStakingRewards,
      totalInvestedUSD,
      currentValueUSD,
      profitUSD,
      profitPercent,
      chartData,
    };
  }, [transactions, currentPrice, calculationMode, yieldPer8Hours]);

  // Calculate additional stats
  const advancedStats = useMemo(() => {
    if (!results || transactions.length === 0) return null;

    const buyTransactions = transactions.filter(tx => tx.type === 'buy');
    const sellTransactions = transactions.filter(tx => tx.type === 'sell');

    const totalBought = buyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSold = Math.abs(sellTransactions.reduce((sum, tx) => sum + tx.amount, 0));
    const netTokens = totalBought - totalSold;

    const totalBoughtValue = buyTransactions.reduce((sum, tx) => sum + tx.amount * tx.priceAtTime, 0);
    const avgBuyPrice = totalBought > 0 ? totalBoughtValue / totalBought : 0;

    const firstTxDate = new Date(transactions[0].date);
    const now = new Date();
    const daysStaked = Math.floor((now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24));

    const rate = calculationMode === 'auto' ? 0.2 : yieldPer8Hours;
    const periods = daysStaked * 3;

    const breakeven = results.currentTokens > 0
      ? results.totalInvestedUSD / results.currentTokens
      : 0;

    // Chart data stats
    const values = results.chartData.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values.filter(v => v > 0));

    // Price change
    const firstPrice = transactions[0].priceAtTime;
    const priceChangePercent = ((currentPrice - firstPrice) / firstPrice) * 100;

    // Daily average return
    const dailyAvgReturn = daysStaked > 0 ? results.profitUSD / daysStaked : 0;

    return {
      totalBought,
      totalSold,
      netTokens,
      avgBuyPrice,
      daysStaked,
      periods,
      breakeven,
      maxValue,
      minValue,
      priceChangePercent,
      dailyAvgReturn,
      txCount: transactions.length,
    };
  }, [results, transactions, currentPrice, calculationMode, yieldPer8Hours]);

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  // Render chart based on view
  const renderChart = () => {
    if (!results) return null;

    const dataKey = chartView === 'value' ? 'value' : chartView === 'tokens' ? 'tokens' : 'rewards';
    const color = chartView === 'value' ? '#ef4444' : chartView === 'tokens' ? '#22c55e' : '#3b82f6';
    const label = chartView === 'value' ? t.valueLabel : chartView === 'tokens' ? t.tokensLabel : t.rewardsLabel;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={results.chartData}>
          <defs>
            <linearGradient id={`gradient-${chartView}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => {
              const date = new Date(value);
              if (language === 'ko') {
                return `${date.getMonth() + 1}월 ${date.getDate()}일`;
              }
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[date.getMonth()]} ${date.getDate()}`;
            }}
          />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              if (language === 'ko') {
                return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
              }
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
            }}
            formatter={(value) => {
              const numValue = typeof value === 'number' ? value : 0;
              if (chartView === 'value' || chartView === 'rewards') {
                return [`${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label];
              }
              return [`${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LGNS`, label];
            }}
          />
          <Legend />
          {chartView === 'value' && (
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#666"
              fill="#666"
              fillOpacity={0.2}
              name={t.investedLabel}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#gradient-${chartView})`}
            name={label}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">{t.title}</CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              {t.dataSaved}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calculation Mode */}
        <Card className="bg-card border-border/60">
          <CardContent className="pt-4">
            <label className="text-sm font-medium mb-2 block">{t.calculationMode}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCalculationMode('auto')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  calculationMode === 'auto'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {t.auto}
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode('manual')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  calculationMode === 'manual'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {t.manual}
              </button>
            </div>
            {calculationMode === 'manual' && (
              <div className="mt-3">
                <Input
                  type="number"
                  step="0.01"
                  value={yieldPer8Hours}
                  onChange={(e) => setYieldPer8Hours(parseFloat(e.target.value) || 0)}
                  className="text-sm"
                  placeholder={t.yieldSetting}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Price */}
        <Card className="bg-card border-border/60">
          <CardContent className="pt-4">
            <label className="text-sm font-medium mb-2 block">{t.currentPrice}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-secondary rounded-lg">
                <span className="text-lg font-bold text-primary">${currentPrice.toFixed(4)}</span>
              </div>
              <button
                type="button"
                onClick={fetchCurrentPrice}
                disabled={isLoading}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                title={t.refreshPrice}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Price Data Source */}
        <Card className="bg-card border-border/60">
          <CardContent className="pt-4">
            <label className="text-sm font-medium mb-2 block">{t.priceSource}</label>
            <div className="flex items-center gap-2">
              <Badge variant={priceDataSource === 'coingecko' ? 'default' : 'secondary'}>
                {priceDataSource === 'coingecko' ? t.coingeckoData : t.manualData}
              </Badge>
              <button
                type="button"
                onClick={fetchHistoricalPrices}
                disabled={isFetchingHistory}
                className="flex-1 px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {isFetchingHistory ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {isFetchingHistory ? t.fetchingPrices : t.fetchHistoricalPrices}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Add Transaction Button */}
        <Card className="bg-card border-border/60">
          <CardContent className="pt-4 flex flex-col justify-center h-full">
            <button
              type="button"
              onClick={() => setShowTransactionForm(!showTransactionForm)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {showTransactionForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showTransactionForm ? t.cancel : t.addTransaction}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form */}
      {showTransactionForm && (
        <Card className="bg-card border-border/60 border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {t.addTransaction}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Transaction Type */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewTransaction(prev => ({ ...prev, type: 'buy' }))}
                className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  newTransaction.type === 'buy'
                    ? 'bg-green-500 text-foreground shadow-lg shadow-green-500/20'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <ArrowUp className="h-4 w-4" />
                {t.buy}
              </button>
              <button
                type="button"
                onClick={() => setNewTransaction(prev => ({ ...prev, type: 'sell' }))}
                className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  newTransaction.type === 'sell'
                    ? 'bg-red-500 text-foreground shadow-lg shadow-red-500/20'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <ArrowDown className="h-4 w-4" />
                {t.sell}
              </button>
            </div>

            {/* Date & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.date}</label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.priceAtTime}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTransaction.priceAtTime}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, priceAtTime: e.target.value }))}
                  placeholder="6.57"
                />
              </div>
            </div>

            {/* Input Mode */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t.inputMode}</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setInputMode('usd')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    inputMode === 'usd'
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-secondary border-2 border-transparent'
                  }`}
                >
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  {t.byUSD}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('lgns')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    inputMode === 'lgns'
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-secondary border-2 border-transparent'
                  }`}
                >
                  <Coins className="h-4 w-4 inline mr-1" />
                  {t.byLGNS}
                </button>
              </div>
            </div>

            {/* Amount Input */}
            {inputMode === 'usd' ? (
              <div>
                <label className="text-sm font-medium mb-1 block">{t.amountUSD}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTransaction.amountUSD}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amountUSD: e.target.value }))}
                  placeholder="1000"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setNewTransaction(prev => ({ ...prev, amountUSD: amount.toString() }))}
                      className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                {newTransaction.amountUSD && newTransaction.priceAtTime && (
                  <p className="text-sm text-primary mt-2 font-medium">
                    = {(parseFloat(newTransaction.amountUSD) / parseFloat(newTransaction.priceAtTime)).toFixed(2)} LGNS
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">{t.amountLGNS}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTransaction.amountLGNS}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amountLGNS: e.target.value }))}
                  placeholder="1000"
                />
                {newTransaction.amountLGNS && newTransaction.priceAtTime && (
                  <p className="text-sm text-primary mt-2 font-medium">
                    = ${(parseFloat(newTransaction.amountLGNS) * parseFloat(newTransaction.priceAtTime)).toFixed(2)} USD
                  </p>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="text-sm font-medium mb-1 block">{t.note}</label>
              <Input
                type="text"
                value={newTransaction.note}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, note: e.target.value }))}
                placeholder={language === 'ko' ? '메모 (선택사항)' : 'Note (optional)'}
              />
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={addTransaction}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t.add}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border/60">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t.totalInvested}</span>
                </div>
                <div className="text-xl font-bold">${results.totalInvestedUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground">
                  {formatKRW(results.totalInvestedUSD, exchangeRate)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{t.currentValue}</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  ${results.currentValueUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatKRW(results.currentValueUSD, exchangeRate)}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-border/60 ${results.profitUSD >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  {results.profitUSD >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">{t.totalProfit}</span>
                </div>
                <div className={`text-xl font-bold ${results.profitUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {results.profitUSD >= 0 ? '+' : ''}${Math.abs(results.profitUSD).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatKRW(Math.abs(results.profitUSD), exchangeRate)}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-border/60 ${results.profitPercent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t.roi}</span>
                </div>
                <div className={`text-2xl font-bold ${results.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {results.profitPercent >= 0 ? '+' : ''}{results.profitPercent.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Token Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border/60">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{t.initialTokens}</div>
                    <div className="text-lg font-bold">{results.initialTokens.toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS</div>
                  </div>
                  <Coins className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{t.stakingRewards}</div>
                    <div className="text-lg font-bold text-green-500">
                      +{results.stakingRewards.toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS
                    </div>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{t.currentTokens}</div>
                    <div className="text-lg font-bold text-primary">
                      {results.currentTokens.toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Stats */}
          {advancedStats && (
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {t.advancedStats}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">{t.daysStaked}</div>
                    <div className="text-lg font-bold">{advancedStats.daysStaked}</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">{t.periods}</div>
                    <div className="text-lg font-bold">{advancedStats.periods.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">{t.avgBuyPrice}</div>
                    <div className="text-lg font-bold">${advancedStats.avgBuyPrice.toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">{t.breakeven}</div>
                    <div className={`text-lg font-bold ${currentPrice >= advancedStats.breakeven ? 'text-green-500' : 'text-red-500'}`}>
                      ${advancedStats.breakeven.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">{t.priceChange}</div>
                    <div className={`text-lg font-bold ${advancedStats.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {advancedStats.priceChangePercent >= 0 ? '+' : ''}{advancedStats.priceChangePercent.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">{t.txCount}</div>
                    <div className="text-lg font-bold">{advancedStats.txCount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t.chartTitle}
                </CardTitle>
                {/* Chart View Toggle */}
                <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setChartView('value')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      chartView === 'value'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <DollarSign className="h-3 w-3 inline mr-1" />
                    {t.chartValue}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView('tokens')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      chartView === 'tokens'
                        ? 'bg-green-500 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Coins className="h-3 w-3 inline mr-1" />
                    {t.chartTokens}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView('rewards')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      chartView === 'rewards'
                        ? 'bg-blue-500 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Zap className="h-3 w-3 inline mr-1" />
                    {t.chartRewards}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {renderChart()}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Empty State */
        <Card className="bg-card border-border/60">
          <CardContent className="py-12 text-center">
            <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.noTransactions}</h3>
            <p className="text-muted-foreground mb-4">{t.addFirst}</p>
            <button
              type="button"
              onClick={() => setShowTransactionForm(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              {t.addTransaction}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Transaction History with Filters */}
      {transactions.length > 0 && (
        <Card className="bg-card border-border/60">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2"
              >
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  {t.transactionHistory} ({filteredTransactions.length}/{transactions.length})
                </CardTitle>
                {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 p-3 bg-secondary/30 rounded-lg">
                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {(['all', 'buy', 'sell'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFilterType(type)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          filterType === type
                            ? type === 'buy' ? 'bg-green-500 text-foreground'
                              : type === 'sell' ? 'bg-red-500 text-foreground'
                              : 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {type === 'all' ? t.filterAll : type === 'buy' ? t.filterBuy : t.filterSell}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  {sortOrder === 'desc' ? (
                    <SortDesc className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <SortAsc className="h-4 w-4 text-muted-foreground" />
                  )}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'value')}
                    className="px-2 py-1 text-xs bg-secondary rounded-md border-none focus:outline-none"
                  >
                    <option value="date">{t.sortByDate}</option>
                    <option value="amount">{t.sortByAmount}</option>
                    <option value="value">{t.sortByValue}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md"
                  >
                    {sortOrder === 'asc' ? t.ascending : t.descending}
                  </button>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="px-2 py-1 text-xs bg-secondary rounded-md border-none focus:outline-none"
                    placeholder={t.from}
                  />
                  <span className="text-xs text-muted-foreground">~</span>
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="px-2 py-1 text-xs bg-secondary rounded-md border-none focus:outline-none"
                    placeholder={t.to}
                  />
                </div>

                {/* Reset */}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t.resetFilter}
                </button>
              </div>

              {/* Transaction List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      tx.type === 'buy'
                        ? 'bg-green-500/10 hover:bg-green-500/20'
                        : 'bg-red-500/10 hover:bg-red-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {tx.type === 'buy' ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {tx.type === 'buy' ? '+' : ''}{tx.amount.toFixed(2)} LGNS
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.date} @ ${tx.priceAtTime.toFixed(2)}
                          <span className="ml-2 text-xs">
                            (${(Math.abs(tx.amount) * tx.priceAtTime).toFixed(2)})
                          </span>
                          {tx.note && <span className="ml-2">• {tx.note}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear All Button */}
              <div className="pt-4 border-t border-border/40 flex justify-between items-center">
                <button
                  type="button"
                  onClick={clearAllTransactions}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {t.clearAll}
                </button>
                <span className="text-xs text-muted-foreground">
                  {filteredTransactions.length} / {transactions.length} {language === 'ko' ? '건' : 'items'}
                </span>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Notes */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground p-4 bg-secondary/30 rounded-lg">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p>{t.priceNote}</p>
          <p>{t.compoundNote.replace('{rate}', (calculationMode === 'auto' ? 0.2 : yieldPer8Hours).toString())}</p>
        </div>
      </div>
    </div>
  );
}
