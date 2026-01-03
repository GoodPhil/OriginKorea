'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Area,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StochasticDataPoint {
  date: string;
  k: number;
  d: number;
  price: number;
}

interface StochasticChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  kPeriod?: number;
  dPeriod?: number;
  loading?: boolean;
}

// Calculate Stochastic Oscillator
function calculateStochastic(
  data: { price: number; high?: number; low?: number }[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  const k: number[] = [];
  const d: number[] = [];

  for (let i = kPeriod - 1; i < data.length; i++) {
    // Get highest high and lowest low for the period
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < kPeriod; j++) {
      const idx = i - j;
      const high = data[idx].high || data[idx].price;
      const low = data[idx].low || data[idx].price;
      highestHigh = Math.max(highestHigh, high);
      lowestLow = Math.min(lowestLow, low);
    }

    // Calculate %K
    const currentClose = data[i].price;
    if (highestHigh - lowestLow !== 0) {
      k[i] = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    } else {
      k[i] = 50;
    }
  }

  // Calculate %D (SMA of %K)
  for (let i = kPeriod - 1 + dPeriod - 1; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = 0; j < dPeriod; j++) {
      if (k[i - j] !== undefined) {
        sum += k[i - j];
        count++;
      }
    }
    d[i] = count > 0 ? sum / count : 50;
  }

  return { k, d };
}

export function StochasticChart({ priceData, kPeriod = 14, dPeriod = 3, loading }: StochasticChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: '스토캐스틱 오실레이터',
      subtitle: `%K(${kPeriod}) 및 %D(${dPeriod}) - 과매수/과매도 분석`,
      kLine: '%K',
      dLine: '%D',
      overbought: '과매수',
      oversold: '과매도',
      neutral: '중립',
      bullishCross: '골든 크로스',
      bearishCross: '데드 크로스',
      trend: '상태',
      bullish: '상승',
      bearish: '하락',
      interpretation: '해석',
      buySignal: '%K가 %D를 상향 돌파 (20 이하에서 더 강력)',
      sellSignal: '%K가 %D를 하향 돌파 (80 이상에서 더 강력)',
      momentum: '모멘텀',
      strong: '강함',
      weak: '약함',
      loading: '로딩 중...',
    },
    en: {
      title: 'Stochastic Oscillator',
      subtitle: `%K(${kPeriod}) and %D(${dPeriod}) - Overbought/Oversold Analysis`,
      kLine: '%K',
      dLine: '%D',
      overbought: 'Overbought',
      oversold: 'Oversold',
      neutral: 'Neutral',
      bullishCross: 'Golden Cross',
      bearishCross: 'Death Cross',
      trend: 'Status',
      bullish: 'Bullish',
      bearish: 'Bearish',
      interpretation: 'Interpretation',
      buySignal: '%K crosses above %D (stronger when below 20)',
      sellSignal: '%K crosses below %D (stronger when above 80)',
      momentum: 'Momentum',
      strong: 'Strong',
      weak: 'Weak',
      loading: 'Loading...',
    },
  };

  const t = texts[language];

  // Calculate Stochastic data
  const stochasticData = useMemo(() => {
    if (!priceData || priceData.length < kPeriod + dPeriod) return [];

    const dataWithHighLow = priceData.map(d => ({
      price: d.price,
      high: d.high || d.price * 1.01,
      low: d.low || d.price * 0.99,
    }));

    const { k, d } = calculateStochastic(dataWithHighLow, kPeriod, dPeriod);

    return priceData.map((item, i) => ({
      date: item.date,
      k: k[i] !== undefined ? k[i] : null,
      d: d[i] !== undefined ? d[i] : null,
      price: item.price,
    })).filter(item => item.k !== null);
  }, [priceData, kPeriod, dPeriod]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (stochasticData.length < 2) {
      return { zone: 'neutral', signal: 'neutral', k: 50, d: 50 };
    }

    const current = stochasticData[stochasticData.length - 1];
    const previous = stochasticData[stochasticData.length - 2];

    // Zone based on %K
    let zone = 'neutral';
    if (current.k !== null) {
      if (current.k > 80) zone = 'overbought';
      else if (current.k < 20) zone = 'oversold';
    }

    // Signal: Crossover detection
    let signal = 'neutral';
    if (previous.k !== null && previous.d !== null && current.k !== null && current.d !== null) {
      if (previous.k <= previous.d && current.k > current.d) {
        signal = 'bullish';
      } else if (previous.k >= previous.d && current.k < current.d) {
        signal = 'bearish';
      }
    }

    return {
      zone,
      signal,
      k: current.k || 50,
      d: current.d || 50,
      current,
      previous,
    };
  }, [stochasticData]);

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

  if (stochasticData.length === 0) {
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
                  {entry.dataKey === 'k' && `${t.kLine}: ${entry.value?.toFixed(2)}`}
                  {entry.dataKey === 'd' && `${t.dLine}: ${entry.value?.toFixed(2)}`}
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
                  <><ArrowUpRight className="h-3.5 w-3.5 mr-1" />{t.bullishCross}</>
                ) : (
                  <><ArrowDownRight className="h-3.5 w-3.5 mr-1" />{t.bearishCross}</>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={stochasticData.slice(-60)}>
              <defs>
                <linearGradient id="overboughtZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="oversoldZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
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
                domain={[0, 100]}
                ticks={[0, 20, 50, 80, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Overbought/Oversold zones */}
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" strokeOpacity={0.3} />

              {/* %K Line */}
              <Line
                type="monotone"
                dataKey="k"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name={t.kLine}
              />

              {/* %D Line */}
              <Line
                type="monotone"
                dataKey="d"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name={t.dLine}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.kLine}</p>
            <p className={`text-lg font-bold ${
              currentStatus.k > 80 ? 'text-red-500' :
              currentStatus.k < 20 ? 'text-green-500' :
              'text-blue-500'
            }`}>
              {currentStatus.k.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.dLine}</p>
            <p className="text-lg font-bold text-orange-500">
              {currentStatus.d.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.overbought}</p>
            <p className="text-lg font-bold text-red-500">80+</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.oversold}</p>
            <p className="text-lg font-bold text-green-500">20-</p>
          </div>
        </div>

        {/* Stochastic Gauge */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.kLine} Position</span>
            <span className={`text-sm font-bold ${
              currentStatus.k > 80 ? 'text-red-500' :
              currentStatus.k < 20 ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {currentStatus.k.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Zone indicators */}
            <div className="absolute left-0 top-0 h-full w-[20%] bg-green-500/30" />
            <div className="absolute left-[20%] top-0 h-full w-[60%] bg-yellow-500/20" />
            <div className="absolute right-0 top-0 h-full w-[20%] bg-red-500/30" />
            {/* Current position */}
            <div
              className="absolute top-0 h-full w-1 bg-blue-500 transition-all duration-300"
              style={{ left: `${Math.min(100, Math.max(0, currentStatus.k))}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{t.oversold} (0-20)</span>
            <span>{t.neutral} (20-80)</span>
            <span>{t.overbought} (80-100)</span>
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
