'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Target, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Activity, RotateCcw } from 'lucide-react';

interface ParabolicSARChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  afStart?: number;
  afIncrement?: number;
  afMax?: number;
  loading?: boolean;
}

// Calculate Parabolic SAR
function calculateParabolicSAR(
  data: { price: number; high?: number; low?: number }[],
  afStart: number = 0.02,
  afIncrement: number = 0.02,
  afMax: number = 0.2
): { sar: number[]; trend: ('up' | 'down')[]; reversalPoints: number[] } {
  const sarValues: number[] = [];
  const trends: ('up' | 'down')[] = [];
  const reversalPoints: number[] = [];

  if (data.length < 2) {
    return { sar: [], trend: [], reversalPoints: [] };
  }

  // Initialize
  let isUpTrend = true;
  let af = afStart;
  let ep = data[0].high || data[0].price * 1.01; // Extreme Point
  let sar = data[0].low || data[0].price * 0.99;

  for (let i = 0; i < data.length; i++) {
    const high = data[i].high || data[i].price * 1.01;
    const low = data[i].low || data[i].price * 0.99;
    const prevHigh = i > 0 ? (data[i - 1].high || data[i - 1].price * 1.01) : high;
    const prevLow = i > 0 ? (data[i - 1].low || data[i - 1].price * 0.99) : low;

    if (i === 0) {
      sarValues.push(sar);
      trends.push(isUpTrend ? 'up' : 'down');
      continue;
    }

    // Calculate new SAR
    let newSar = sar + af * (ep - sar);

    // Ensure SAR doesn't cross into the price
    if (isUpTrend) {
      newSar = Math.min(newSar, prevLow, i > 1 ? (data[i - 2].low || data[i - 2].price * 0.99) : prevLow);
    } else {
      newSar = Math.max(newSar, prevHigh, i > 1 ? (data[i - 2].high || data[i - 2].price * 1.01) : prevHigh);
    }

    // Check for reversal
    let reversed = false;
    if (isUpTrend) {
      if (low < newSar) {
        // Reversal to downtrend
        isUpTrend = false;
        reversed = true;
        newSar = ep; // SAR becomes the previous EP
        ep = low;
        af = afStart;
        reversalPoints.push(i);
      }
    } else {
      if (high > newSar) {
        // Reversal to uptrend
        isUpTrend = true;
        reversed = true;
        newSar = ep; // SAR becomes the previous EP
        ep = high;
        af = afStart;
        reversalPoints.push(i);
      }
    }

    // Update EP and AF if not reversed
    if (!reversed) {
      if (isUpTrend) {
        if (high > ep) {
          ep = high;
          af = Math.min(af + afIncrement, afMax);
        }
      } else {
        if (low < ep) {
          ep = low;
          af = Math.min(af + afIncrement, afMax);
        }
      }
    }

    sar = newSar;
    sarValues.push(sar);
    trends.push(isUpTrend ? 'up' : 'down');
  }

  return { sar: sarValues, trend: trends, reversalPoints };
}

export function ParabolicSARChart({
  priceData,
  afStart = 0.02,
  afIncrement = 0.02,
  afMax = 0.2,
  loading
}: ParabolicSARChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'Parabolic SAR (파라볼릭 스탑 앤 리버스)',
      subtitle: '추세 추종 및 손절/익절 포인트 지표',
      sar: 'SAR',
      price: '가격',
      bullish: '상승 추세',
      bearish: '하락 추세',
      neutral: '중립',
      bullishSignal: '매수 신호',
      bearishSignal: '매도 신호',
      reversal: '반전',
      trend: '추세',
      uptrend: '상승',
      downtrend: '하락',
      interpretation: '해석',
      sarAbove: 'SAR이 가격 위 = 하락 추세 (매도/관망)',
      sarBelow: 'SAR이 가격 아래 = 상승 추세 (매수/보유)',
      stopLoss: '손절 설정',
      stopLossDesc: 'SAR 값을 손절 가격으로 활용',
      reversalSignal: '반전 신호',
      reversalDesc: '가격이 SAR을 돌파하면 추세 반전',
      loading: '로딩 중...',
      currentSAR: '현재 SAR',
      distance: '가격과 거리',
      reversalCount: '반전 횟수',
      trendDuration: '추세 지속',
      days: '일',
      af: '가속계수 (AF)',
    },
    en: {
      title: 'Parabolic SAR (Stop and Reverse)',
      subtitle: 'Trend following and stop-loss/take-profit indicator',
      sar: 'SAR',
      price: 'Price',
      bullish: 'Uptrend',
      bearish: 'Downtrend',
      neutral: 'Neutral',
      bullishSignal: 'Buy Signal',
      bearishSignal: 'Sell Signal',
      reversal: 'Reversal',
      trend: 'Trend',
      uptrend: 'Up',
      downtrend: 'Down',
      interpretation: 'Interpretation',
      sarAbove: 'SAR above price = Downtrend (Sell/Wait)',
      sarBelow: 'SAR below price = Uptrend (Buy/Hold)',
      stopLoss: 'Stop Loss',
      stopLossDesc: 'Use SAR value as stop-loss price',
      reversalSignal: 'Reversal Signal',
      reversalDesc: 'Trend reversal when price crosses SAR',
      loading: 'Loading...',
      currentSAR: 'Current SAR',
      distance: 'Distance from Price',
      reversalCount: 'Reversals',
      trendDuration: 'Trend Duration',
      days: 'days',
      af: 'Acceleration Factor',
    },
  };

  const t = texts[language];

  // Calculate SAR data
  const sarData = useMemo(() => {
    if (!priceData || priceData.length < 10) return { chartData: [], reversalCount: 0, trendDuration: 0 };

    const { sar, trend, reversalPoints } = calculateParabolicSAR(
      priceData,
      afStart,
      afIncrement,
      afMax
    );

    const chartData = priceData.map((item, i) => ({
      date: item.date,
      price: item.price,
      sar: sar[i],
      sarUp: trend[i] === 'up' ? sar[i] : null,
      sarDown: trend[i] === 'down' ? sar[i] : null,
      trend: trend[i],
      isReversal: reversalPoints.includes(i),
    }));

    // Calculate trend duration (days since last reversal)
    const lastReversalIdx = reversalPoints.length > 0
      ? reversalPoints[reversalPoints.length - 1]
      : 0;
    const trendDuration = priceData.length - lastReversalIdx;

    return { chartData, reversalCount: reversalPoints.length, trendDuration };
  }, [priceData, afStart, afIncrement, afMax]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (sarData.chartData.length < 2) {
      return { trend: 'neutral', signal: 'neutral', sarValue: 0, distance: 0, distancePercent: 0 };
    }

    const current = sarData.chartData[sarData.chartData.length - 1];
    const previous = sarData.chartData[sarData.chartData.length - 2];

    const trend = current.trend === 'up' ? 'bullish' : 'bearish';

    // Detect reversal signal
    let signal = 'neutral';
    if (previous.trend !== current.trend) {
      signal = current.trend === 'up' ? 'bullish' : 'bearish';
    }

    const distance = current.price - current.sar;
    const distancePercent = (distance / current.price) * 100;

    return {
      trend,
      signal,
      sarValue: current.sar,
      distance,
      distancePercent,
      currentTrend: current.trend,
    };
  }, [sarData.chartData]);

  if (loading) {
    return (
      <Card className="bg-card border-border/60">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sarData.chartData.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const dataPoint = sarData.chartData.find(d => d.date === label);
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-semibold mb-2 text-foreground/80">{label}</p>
          <div className="space-y-1">
            {payload.filter(p => p.value !== null).map((entry, index) => (
              <div key={`item-${entry.dataKey}-${index}`} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <p className="text-sm" style={{ color: entry.color }}>
                  {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
                </p>
              </div>
            ))}
            {dataPoint?.isReversal && (
              <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                {t.reversal}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'border-green-500/50 text-green-500 bg-green-500/10';
      case 'bearish': return 'border-red-500/50 text-red-500 bg-red-500/10';
      default: return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Trend Badge */}
            <Badge variant="outline" className={getTrendColor(currentStatus.trend)}>
              {currentStatus.trend === 'bullish' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.trend === 'bearish' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
              {t[currentStatus.trend as 'bullish' | 'bearish' | 'neutral']}
            </Badge>

            {/* Signal Badge */}
            {currentStatus.signal !== 'neutral' && (
              <Badge
                className={`${
                  currentStatus.signal === 'bullish'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {currentStatus.signal === 'bullish' ? (
                  <><ArrowUpRight className="h-3.5 w-3.5 mr-1" />{t.bullishSignal}</>
                ) : (
                  <><ArrowDownRight className="h-3.5 w-3.5 mr-1" />{t.bearishSignal}</>
                )}
              </Badge>
            )}

            {/* Trend Duration Badge */}
            <Badge variant="secondary">
              {sarData.trendDuration} {t.days}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sarData.chartData.slice(-60)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                domain={['auto', 'auto']}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                name={t.price}
              />

              {/* SAR Up (dots below price - bullish) */}
              <Scatter
                dataKey="sarUp"
                fill="#22c55e"
                name={`${t.sar} (${t.uptrend})`}
                shape="circle"
              />

              {/* SAR Down (dots above price - bearish) */}
              <Scatter
                dataKey="sarDown"
                fill="#ef4444"
                name={`${t.sar} (${t.downtrend})`}
                shape="circle"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.currentSAR}</p>
            <p className={`text-lg font-bold ${
              currentStatus.trend === 'bullish' ? 'text-green-500' : 'text-red-500'
            }`}>
              ${currentStatus.sarValue.toFixed(4)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.distance}</p>
            <p className={`text-lg font-bold ${
              currentStatus.distancePercent >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {currentStatus.distancePercent >= 0 ? '+' : ''}{currentStatus.distancePercent.toFixed(2)}%
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.reversalCount}</p>
            <p className="text-lg font-bold text-yellow-500">
              {sarData.reversalCount}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.trendDuration}</p>
            <p className="text-lg font-bold text-cyan-500">
              {sarData.trendDuration} {t.days}
            </p>
          </div>
        </div>

        {/* SAR Visualization */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.trend}</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${
              currentStatus.trend === 'bullish' ? 'text-green-500' : 'text-red-500'
            }`}>
              {currentStatus.trend === 'bullish' ? (
                <><TrendingUp className="h-4 w-4" /> {t.bullish}</>
              ) : (
                <><TrendingDown className="h-4 w-4" /> {t.bearish}</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">{t.sarBelow}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">{t.sarAbove}</span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {t.interpretation}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-foreground mb-1">{t.stopLoss}</p>
              <p className="text-xs text-muted-foreground">{t.stopLossDesc}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-1">{t.reversalSignal}</p>
              <p className="text-xs text-muted-foreground">{t.reversalDesc}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {t.sarBelow}
            </p>
            <p className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              {t.sarAbove}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
