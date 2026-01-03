'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MACDDataPoint {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
  price?: number;
}

interface MACDChartProps {
  priceData: { date: string; price: number }[];
  loading?: boolean;
}

// Calculate EMA (Exponential Moving Average)
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA for first EMA value
  let sum = 0;
  for (let i = 0; i < period && i < prices.length; i++) {
    sum += prices[i];
  }
  ema[period - 1] = sum / period;

  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }

  return ema;
}

// Calculate MACD from price data
function calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  const macd: number[] = [];
  for (let i = 25; i < prices.length; i++) {
    if (ema12[i] !== undefined && ema26[i] !== undefined) {
      macd[i] = ema12[i] - ema26[i];
    }
  }

  // Signal line (9-period EMA of MACD)
  const macdValues = macd.filter(v => v !== undefined);
  const signalEMA = calculateEMA(macdValues, 9);

  const signal: number[] = [];
  let signalIdx = 0;
  for (let i = 25; i < prices.length; i++) {
    if (macd[i] !== undefined && signalIdx < signalEMA.length) {
      signal[i] = signalEMA[signalIdx] || 0;
      signalIdx++;
    }
  }

  // Histogram (MACD - Signal)
  const histogram: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (macd[i] !== undefined && signal[i] !== undefined) {
      histogram[i] = macd[i] - signal[i];
    }
  }

  return { macd, signal, histogram };
}

export function MACDChart({ priceData, loading }: MACDChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'MACD 지표',
      subtitle: 'Moving Average Convergence Divergence - 추세 모멘텀 분석',
      macd: 'MACD',
      signal: 'Signal',
      histogram: '히스토그램',
      bullishCross: '골든 크로스',
      bearishCross: '데드 크로스',
      bullishDivergence: '상승 다이버전스',
      bearishDivergence: '하락 다이버전스',
      neutral: '중립',
      trend: '추세',
      bullish: '상승',
      bearish: '하락',
      increasing: '증가',
      decreasing: '감소',
      interpretation: '해석',
      buySignal: '매수 신호: MACD가 Signal선 위로 상향 돌파',
      sellSignal: '매도 신호: MACD가 Signal선 아래로 하향 돌파',
      momentum: '모멘텀',
      strong: '강함',
      weak: '약함',
      loading: '로딩 중...',
    },
    en: {
      title: 'MACD Indicator',
      subtitle: 'Moving Average Convergence Divergence - Trend Momentum Analysis',
      macd: 'MACD',
      signal: 'Signal',
      histogram: 'Histogram',
      bullishCross: 'Golden Cross',
      bearishCross: 'Death Cross',
      bullishDivergence: 'Bullish Divergence',
      bearishDivergence: 'Bearish Divergence',
      neutral: 'Neutral',
      trend: 'Trend',
      bullish: 'Bullish',
      bearish: 'Bearish',
      increasing: 'Increasing',
      decreasing: 'Decreasing',
      interpretation: 'Interpretation',
      buySignal: 'Buy Signal: MACD crosses above Signal line',
      sellSignal: 'Sell Signal: MACD crosses below Signal line',
      momentum: 'Momentum',
      strong: 'Strong',
      weak: 'Weak',
      loading: 'Loading...',
    },
  };

  const t = texts[language];

  // Calculate MACD data
  const macdData = useMemo(() => {
    if (!priceData || priceData.length < 35) return [];

    const prices = priceData.map(d => d.price);
    const { macd, signal, histogram } = calculateMACD(prices);

    return priceData.map((item, i) => ({
      date: item.date,
      macd: macd[i] || null,
      signal: signal[i] || null,
      histogram: histogram[i] || null,
      price: item.price,
    })).filter(d => d.macd !== null);
  }, [priceData]);

  // Get current MACD status
  const currentStatus = useMemo(() => {
    if (macdData.length < 2) return { trend: 'neutral', signal: 'neutral', momentum: 'weak' };

    const current = macdData[macdData.length - 1];
    const previous = macdData[macdData.length - 2];

    // Trend: MACD above/below signal
    const trend = current.macd! > current.signal! ? 'bullish' : current.macd! < current.signal! ? 'bearish' : 'neutral';

    // Signal: Crossover detection
    let signalType = 'neutral';
    if (previous.macd! <= previous.signal! && current.macd! > current.signal!) {
      signalType = 'bullish';
    } else if (previous.macd! >= previous.signal! && current.macd! < current.signal!) {
      signalType = 'bearish';
    }

    // Momentum: Histogram increasing or decreasing
    const histogramChange = current.histogram! - previous.histogram!;
    const momentum = Math.abs(current.histogram!) > 0.01 ? 'strong' : 'weak';
    const momentumDirection = histogramChange > 0 ? 'increasing' : 'decreasing';

    return { trend, signal: signalType, momentum, momentumDirection, current, previous };
  }, [macdData]);

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

  if (macdData.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-semibold mb-2 text-foreground/80">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={`item-${entry.dataKey}-${index}`} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <p className="text-sm" style={{ color: entry.color }}>
                  {entry.dataKey === 'macd' && `${t.macd}: ${entry.value?.toFixed(4)}`}
                  {entry.dataKey === 'signal' && `${t.signal}: ${entry.value?.toFixed(4)}`}
                  {entry.dataKey === 'histogram' && `${t.histogram}: ${entry.value?.toFixed(4)}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Trend Badge */}
            <Badge
              variant="outline"
              className={`${
                currentStatus.trend === 'bullish'
                  ? 'border-green-500/50 text-green-500 bg-green-500/10'
                  : currentStatus.trend === 'bearish'
                  ? 'border-red-500/50 text-red-500 bg-red-500/10'
                  : 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
              }`}
            >
              {currentStatus.trend === 'bullish' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.trend === 'bearish' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.trend === 'neutral' && <Minus className="h-3.5 w-3.5 mr-1" />}
              {t.trend}: {t[currentStatus.trend as 'bullish' | 'bearish' | 'neutral']}
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
                  <><ArrowUpRight className="h-3.5 w-3.5 mr-1" />{t.bullishCross}</>
                ) : (
                  <><ArrowDownRight className="h-3.5 w-3.5 mr-1" />{t.bearishCross}</>
                )}
              </Badge>
            )}

            {/* Momentum Badge */}
            <Badge variant="secondary" className="text-xs">
              {t.momentum}: {t[currentStatus.momentum as 'strong' | 'weak']}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={macdData.slice(-60)}>
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
                tickFormatter={(value) => value.toFixed(3)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />

              {/* Histogram */}
              <Bar
                dataKey="histogram"
                fill="#8884d8"
                name={t.histogram}
              >
                {macdData.slice(-60).map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.histogram !== null && entry.histogram >= 0 ? '#22c55e' : '#ef4444'}
                  />
                ))}
              </Bar>

              {/* MACD Line */}
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name={t.macd}
              />

              {/* Signal Line */}
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name={t.signal}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.macd}</p>
            <p className={`text-lg font-bold ${currentStatus.current?.macd && currentStatus.current.macd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currentStatus.current?.macd?.toFixed(4) || '-'}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.signal}</p>
            <p className="text-lg font-bold text-orange-500">
              {currentStatus.current?.signal?.toFixed(4) || '-'}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.histogram}</p>
            <p className={`text-lg font-bold ${currentStatus.current?.histogram && currentStatus.current.histogram >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currentStatus.current?.histogram?.toFixed(4) || '-'}
            </p>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {t.interpretation}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              {t.buySignal}
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              {t.sellSignal}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
