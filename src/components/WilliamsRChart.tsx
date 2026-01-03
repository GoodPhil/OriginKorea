'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { Percent, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';

interface WilliamsRChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  period?: number;
  loading?: boolean;
}

// Calculate Williams %R
function calculateWilliamsR(
  data: { price: number; high?: number; low?: number }[],
  period: number = 14
): number[] {
  const williamsR: number[] = [];

  for (let i = period - 1; i < data.length; i++) {
    // Get highest high and lowest low for the period
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < period; j++) {
      const idx = i - j;
      const high = data[idx].high || data[idx].price * 1.01;
      const low = data[idx].low || data[idx].price * 0.99;
      highestHigh = Math.max(highestHigh, high);
      lowestLow = Math.min(lowestLow, low);
    }

    // Calculate Williams %R
    // %R = (Highest High - Close) / (Highest High - Lowest Low) x -100
    const currentClose = data[i].price;
    if (highestHigh - lowestLow !== 0) {
      williamsR[i] = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
    } else {
      williamsR[i] = -50;
    }
  }

  return williamsR;
}

export function WilliamsRChart({ priceData, period = 14, loading }: WilliamsRChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'Williams %R',
      subtitle: `${period}일 기간 - 과매수/과매도 모멘텀 지표`,
      williamsR: '%R',
      overbought: '과매수',
      oversold: '과매도',
      neutral: '중립',
      bullishSignal: '매수 신호',
      bearishSignal: '매도 신호',
      trend: '상태',
      bullish: '상승',
      bearish: '하락',
      interpretation: '해석',
      buySignal: '%R이 -80 이하에서 상승 시 매수 신호',
      sellSignal: '%R이 -20 이상에서 하락 시 매도 신호',
      divergence: '다이버전스',
      bullishDiv: '상승 다이버전스: 가격 하락 + %R 상승',
      bearishDiv: '하락 다이버전스: 가격 상승 + %R 하락',
      loading: '로딩 중...',
      currentValue: '현재 값',
      avgValue: '평균 값',
    },
    en: {
      title: 'Williams %R',
      subtitle: `${period}-Day Period - Overbought/Oversold Momentum Indicator`,
      williamsR: '%R',
      overbought: 'Overbought',
      oversold: 'Oversold',
      neutral: 'Neutral',
      bullishSignal: 'Buy Signal',
      bearishSignal: 'Sell Signal',
      trend: 'Status',
      bullish: 'Bullish',
      bearish: 'Bearish',
      interpretation: 'Interpretation',
      buySignal: 'Buy when %R rises from below -80',
      sellSignal: 'Sell when %R falls from above -20',
      divergence: 'Divergence',
      bullishDiv: 'Bullish: Price falls + %R rises',
      bearishDiv: 'Bearish: Price rises + %R falls',
      loading: 'Loading...',
      currentValue: 'Current Value',
      avgValue: 'Avg Value',
    },
  };

  const t = texts[language];

  // Calculate Williams %R data
  const williamsRData = useMemo(() => {
    if (!priceData || priceData.length < period + 5) return [];

    const dataWithHighLow = priceData.map(d => ({
      price: d.price,
      high: d.high || d.price * 1.01,
      low: d.low || d.price * 0.99,
    }));

    const williamsR = calculateWilliamsR(dataWithHighLow, period);

    return priceData.map((item, i) => ({
      date: item.date,
      williamsR: williamsR[i] !== undefined ? williamsR[i] : null,
      price: item.price,
    })).filter(d => d.williamsR !== null);
  }, [priceData, period]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (williamsRData.length < 2) {
      return { zone: 'neutral', trend: 'neutral', value: -50, avgValue: -50 };
    }

    const current = williamsRData[williamsRData.length - 1];
    const previous = williamsRData[williamsRData.length - 2];
    const recent = williamsRData.slice(-20);
    const avgValue = recent.reduce((sum, d) => sum + (d.williamsR || -50), 0) / recent.length;

    // Zone based on %R value
    let zone = 'neutral';
    if (current.williamsR !== null) {
      if (current.williamsR > -20) zone = 'overbought';
      else if (current.williamsR < -80) zone = 'oversold';
    }

    // Trend direction
    let trend = 'neutral';
    if (current.williamsR !== null && previous.williamsR !== null) {
      if (current.williamsR > previous.williamsR) trend = 'bullish';
      else if (current.williamsR < previous.williamsR) trend = 'bearish';
    }

    // Signal detection
    let signal = 'neutral';
    if (previous.williamsR !== null && current.williamsR !== null) {
      // Buy signal: crossing above -80
      if (previous.williamsR < -80 && current.williamsR > -80) signal = 'bullish';
      // Sell signal: crossing below -20
      if (previous.williamsR > -20 && current.williamsR < -20) signal = 'bearish';
    }

    return {
      zone,
      trend,
      signal,
      value: current.williamsR || -50,
      avgValue,
      current,
      previous,
    };
  }, [williamsRData]);

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

  if (williamsRData.length === 0) {
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
                  {entry.dataKey === 'williamsR' && `${t.williamsR}: ${entry.value?.toFixed(2)}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'overbought': return 'border-red-500/50 text-red-500 bg-red-500/10';
      case 'oversold': return 'border-green-500/50 text-green-500 bg-green-500/10';
      default: return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
      case 'bearish': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      default: return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Zone Badge */}
            <Badge variant="outline" className={getZoneColor(currentStatus.zone)}>
              {currentStatus.zone === 'overbought' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.zone === 'oversold' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.zone === 'neutral' && <Minus className="h-3.5 w-3.5 mr-1" />}
              {t[currentStatus.zone as 'overbought' | 'oversold' | 'neutral']}
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

            {/* Trend Badge */}
            <Badge variant="secondary">
              {getTrendIcon(currentStatus.trend)}
              {t[currentStatus.trend as 'bullish' | 'bearish' | 'neutral']}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={williamsRData.slice(-60)}>
              <defs>
                <linearGradient id="williamsRGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#eab308" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
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
                domain={[-100, 0]}
                ticks={[-100, -80, -50, -20, 0]}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Overbought/Oversold zones */}
              <ReferenceLine y={-20} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={-80} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={-50} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" strokeOpacity={0.3} />

              {/* Williams %R Line with Area */}
              <Area
                type="monotone"
                dataKey="williamsR"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#williamsRGradient)"
                name={t.williamsR}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.currentValue}</p>
            <p className={`text-lg font-bold ${
              currentStatus.value > -20 ? 'text-red-500' :
              currentStatus.value < -80 ? 'text-green-500' :
              'text-purple-500'
            }`}>
              {currentStatus.value.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.avgValue}</p>
            <p className="text-lg font-bold text-cyan-500">
              {currentStatus.avgValue.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.overbought}</p>
            <p className="text-lg font-bold text-red-500">-20+</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.oversold}</p>
            <p className="text-lg font-bold text-green-500">-80-</p>
          </div>
        </div>

        {/* Williams %R Gauge */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.williamsR} Position</span>
            <span className={`text-sm font-bold ${
              currentStatus.value > -20 ? 'text-red-500' :
              currentStatus.value < -80 ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {currentStatus.value.toFixed(1)}
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Zone indicators (inverted because Williams %R is 0 to -100) */}
            <div className="absolute left-0 top-0 h-full w-[20%] bg-red-500/30" /> {/* 0 to -20 = overbought */}
            <div className="absolute left-[20%] top-0 h-full w-[60%] bg-yellow-500/20" /> {/* -20 to -80 = neutral */}
            <div className="absolute right-0 top-0 h-full w-[20%] bg-green-500/30" /> {/* -80 to -100 = oversold */}
            {/* Current position */}
            <div
              className="absolute top-0 h-full w-1 bg-purple-500 transition-all duration-300"
              style={{ left: `${Math.abs(currentStatus.value)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0 ({t.overbought})</span>
            <span>-50</span>
            <span>-100 ({t.oversold})</span>
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
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs font-medium text-foreground mb-1">{t.divergence}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {t.bullishDiv}
              </p>
              <p className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                {t.bearishDiv}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
