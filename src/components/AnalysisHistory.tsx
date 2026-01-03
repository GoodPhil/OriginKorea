'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalysisHistory, type AnalysisSnapshot } from '@/hooks/useAnalysisHistory';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Bar,
} from 'recharts';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  BarChart3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  Zap,
  Filter,
} from 'lucide-react';

interface AnalysisHistoryProps {
  currentData?: {
    score: number;
    level: AnalysisSnapshot['level'];
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    buyRatio: number;
    signals: {
      priceChange: string;
      volume: string;
      buyRatio: string;
      liquidity: string;
    };
  };
  onSave?: () => void;
}

type PeriodFilter = '1d' | '7d' | '14d' | '30d' | 'all';

export function AnalysisHistory({ currentData, onSave }: AnalysisHistoryProps) {
  const { language } = useLanguage();
  const {
    history,
    loading,
    addSnapshot,
    getDailyAverages,
    getTrendAnalysis,
    getStatistics,
    clearHistory,
  } = useAnalysisHistory();

  const [showAllHistory, setShowAllHistory] = useState(false);
  const [chartView, setChartView] = useState<'score' | 'price' | 'combined'>('score');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('7d');

  const texts = {
    ko: {
      title: '분석 히스토리',
      subtitle: 'AI 점수 및 가격 변화 추적',
      noHistory: '저장된 히스토리가 없습니다',
      saveNow: '현재 분석 저장',
      saved: '저장됨',
      clearHistory: '히스토리 삭제',
      confirmClear: '정말로 모든 히스토리를 삭제하시겠습니까?',
      statistics: '통계',
      totalSnapshots: '총 스냅샷',
      avgScore: '평균 점수',
      maxScore: '최고 점수',
      minScore: '최저 점수',
      avgPrice: '평균 가격',
      maxPrice: '최고 가격',
      minPrice: '최저 가격',
      mostCommonLevel: '가장 많은 상태',
      trendAnalysis: '추세 분석',
      scoreTrend: '점수 추세',
      priceTrend: '가격 추세',
      up: '상승',
      down: '하락',
      stable: '안정',
      recentHistory: '최근 히스토리',
      viewAll: '전체 보기',
      showLess: '접기',
      scoreChart: '점수',
      priceChart: '가격',
      combinedChart: '종합',
      score: '점수',
      price: '가격',
      veryBullish: '매우 강세',
      bullish: '상승세',
      neutral: '중립',
      bearish: '하락세',
      veryBearish: '매우 약세',
      dailyAverage: '일별 평균',
      snapshotCount: '스냅샷 수',
      period1d: '1일',
      period7d: '7일',
      period14d: '14일',
      period30d: '30일',
      periodAll: '전체',
      periodLabel: '기간',
    },
    en: {
      title: 'Analysis History',
      subtitle: 'Track AI score and price changes',
      noHistory: 'No history saved yet',
      saveNow: 'Save Current Analysis',
      saved: 'Saved',
      clearHistory: 'Clear History',
      confirmClear: 'Are you sure you want to clear all history?',
      statistics: 'Statistics',
      totalSnapshots: 'Total Snapshots',
      avgScore: 'Avg Score',
      maxScore: 'Max Score',
      minScore: 'Min Score',
      avgPrice: 'Avg Price',
      maxPrice: 'Max Price',
      minPrice: 'Min Price',
      mostCommonLevel: 'Most Common Level',
      trendAnalysis: 'Trend Analysis',
      scoreTrend: 'Score Trend',
      priceTrend: 'Price Trend',
      up: 'Up',
      down: 'Down',
      stable: 'Stable',
      recentHistory: 'Recent History',
      viewAll: 'View All',
      showLess: 'Show Less',
      scoreChart: 'Score',
      priceChart: 'Price',
      combinedChart: 'Combined',
      score: 'Score',
      price: 'Price',
      veryBullish: 'Very Bullish',
      bullish: 'Bullish',
      neutral: 'Neutral',
      bearish: 'Bearish',
      veryBearish: 'Very Bearish',
      dailyAverage: 'Daily Average',
      snapshotCount: 'Snapshot Count',
      period1d: '1D',
      period7d: '7D',
      period14d: '14D',
      period30d: '30D',
      periodAll: 'All',
      periodLabel: 'Period',
    },
  };

  const t = texts[language];

  // Auto-save current data when available
  useEffect(() => {
    if (currentData && currentData.score !== undefined) {
      addSnapshot(currentData);
    }
  }, [currentData, addSnapshot]);

  // Filter history by period
  const filteredHistory = useMemo(() => {
    if (periodFilter === 'all') return history;

    const now = Date.now();
    const periodMs: Record<PeriodFilter, number> = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '14d': 14 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': 0,
    };

    const cutoff = now - periodMs[periodFilter];
    return history.filter(snapshot => snapshot.timestamp >= cutoff);
  }, [history, periodFilter]);

  const dailyAverages = getDailyAverages();
  const trendAnalysis = getTrendAnalysis();
  const statistics = getStatistics();

  const getLevelLabel = (level: AnalysisSnapshot['level']) => {
    const labels: Record<AnalysisSnapshot['level'], { ko: string; en: string }> = {
      very_bullish: { ko: '매우 강세', en: 'Very Bullish' },
      bullish: { ko: '상승세', en: 'Bullish' },
      neutral: { ko: '중립', en: 'Neutral' },
      bearish: { ko: '하락세', en: 'Bearish' },
      very_bearish: { ko: '매우 약세', en: 'Very Bearish' },
    };
    return labels[level]?.[language] || level;
  };

  const getLevelColor = (level: AnalysisSnapshot['level']) => {
    const colors: Record<AnalysisSnapshot['level'], string> = {
      very_bullish: 'bg-cyan-500',
      bullish: 'bg-teal-500',
      neutral: 'bg-amber-500',
      bearish: 'bg-orange-500',
      very_bearish: 'bg-red-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-cyan-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-amber-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const chartData = filteredHistory.slice(0, showAllHistory ? 100 : 30).reverse().map(snapshot => ({
    time: new Date(snapshot.timestamp).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: new Date(snapshot.timestamp).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: snapshot.score,
    price: snapshot.price,
    level: snapshot.level,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-zinc-300 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.dataKey === 'score' ? `${t.score}: ${entry.value}` : `${t.price}: $${entry.value.toFixed(4)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <History className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-zinc-400">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t.title}</CardTitle>
              <CardDescription className="text-sm">{t.subtitle}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(t.confirmClear)) {
                    clearHistory();
                  }
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t.clearHistory}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {history.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t.noHistory}</p>
            <p className="text-sm mt-2 text-zinc-600">
              {language === 'ko'
                ? '분석 페이지를 방문하면 자동으로 저장됩니다.'
                : 'Visit the analysis page to automatically save snapshots.'}
            </p>
          </div>
        ) : (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{t.totalSnapshots}</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{statistics.totalSnapshots}</p>
              </div>
              <div className="p-2 sm:p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{t.avgScore}</p>
                <p className={`text-lg sm:text-xl font-bold ${
                  statistics.avgScore > 0 ? 'text-cyan-400' : statistics.avgScore < 0 ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {statistics.avgScore > 0 ? '+' : ''}{statistics.avgScore}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{t.maxScore}</p>
                <p className="text-lg sm:text-xl font-bold text-cyan-400">+{statistics.maxScore}</p>
              </div>
              <div className="p-2 sm:p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{t.minScore}</p>
                <p className="text-lg sm:text-xl font-bold text-red-400">{statistics.minScore}</p>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{t.trendAnalysis}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-xs text-zinc-500">{t.scoreTrend}:</span>
                    {getTrendIcon(trendAnalysis.scoreTrend)}
                    <span className={`text-xs sm:text-sm font-medium ${
                      trendAnalysis.scoreChange > 0 ? 'text-cyan-400' : trendAnalysis.scoreChange < 0 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {trendAnalysis.scoreChange > 0 ? '+' : ''}{trendAnalysis.scoreChange}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-xs text-zinc-500">{t.priceTrend}:</span>
                    {getTrendIcon(trendAnalysis.priceTrend)}
                    <span className={`text-xs sm:text-sm font-medium ${
                      trendAnalysis.priceChange > 0 ? 'text-cyan-400' : trendAnalysis.priceChange < 0 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {trendAnalysis.priceChange > 0 ? '+' : ''}{trendAnalysis.priceChange}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <Badge className={`${getLevelColor(statistics.mostCommonLevel)} text-foreground`}>
                  {getLevelLabel(statistics.mostCommonLevel)}
                </Badge>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">{t.mostCommonLevel}</p>
              </div>
            </div>

            {/* Period Filter & Chart View Selector */}
            <div className="flex flex-col gap-3">
              {/* Period Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  <span className="text-[10px] sm:text-xs text-zinc-500">{t.periodLabel}:</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-800/50 rounded-lg p-0.5 sm:p-1 overflow-x-auto">
                  {(['1d', '7d', '14d', '30d', 'all'] as PeriodFilter[]).map((period) => (
                    <Button
                      key={period}
                      variant={periodFilter === period ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPeriodFilter(period)}
                      className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs min-w-[28px] sm:min-w-[32px]"
                    >
                      {t[`period${period.charAt(0).toUpperCase()}${period.slice(1)}` as keyof typeof t]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chart View Selector */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-800/50 rounded-lg p-0.5 sm:p-1 w-fit">
                <Button
                  variant={chartView === 'score' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartView('score')}
                  className="h-5 sm:h-6 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  {t.scoreChart}
                </Button>
                <Button
                  variant={chartView === 'price' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartView('price')}
                  className="h-5 sm:h-6 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  {t.priceChart}
                </Button>
                <Button
                  variant={chartView === 'combined' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartView('combined')}
                  className="h-5 sm:h-6 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  {t.combinedChart}
                </Button>
              </div>
            </div>

            {/* Data count indicator */}
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                {language === 'ko'
                  ? `${filteredHistory.length}개의 스냅샷 표시 중`
                  : `Showing ${filteredHistory.length} snapshots`}
              </span>
              <span>
                {language === 'ko' ? '차트 데이터: ' : 'Chart data: '}
                {chartData.length} {language === 'ko' ? '개' : 'points'}
              </span>
            </div>

            {/* Chart */}
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'score' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#71717a" />
                    <YAxis domain={[-100, 100]} tick={{ fontSize: 10 }} stroke="#71717a" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#22d3ee"
                      fill="url(#scoreGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : chartView === 'price' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#71717a" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#71717a" tickFormatter={(v) => `$${v.toFixed(2)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      fill="url(#priceGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#71717a" />
                    <YAxis yAxisId="left" domain={[-100, 100]} tick={{ fontSize: 10 }} stroke="#71717a" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#71717a" tickFormatter={(v) => `$${v.toFixed(2)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="score"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={false}
                      name={t.score}
                    />
                    <Line
                      yAxisId="right"
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

            {/* Recent History List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {t.recentHistory}
                </h4>
                {filteredHistory.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="h-7 text-xs"
                  >
                    {showAllHistory ? t.showLess : t.viewAll}
                    {showAllHistory ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredHistory.slice(0, showAllHistory ? 30 : 5).map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getLevelColor(snapshot.level)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            snapshot.score > 0 ? 'text-cyan-400' : snapshot.score < 0 ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {snapshot.score > 0 ? '+' : ''}{snapshot.score}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getLevelLabel(snapshot.level)}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500">{formatDate(snapshot.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${snapshot.price.toFixed(4)}</p>
                      <p className={`text-xs ${snapshot.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {snapshot.priceChange24h >= 0 ? '+' : ''}{snapshot.priceChange24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
