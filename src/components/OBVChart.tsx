'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend,
} from 'recharts';
import { Volume2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';

interface OBVChartProps {
  priceData: { date: string; price: number; volume?: number }[];
  maPeriod?: number;
  loading?: boolean;
}

// Calculate OBV (On-Balance Volume)
// OBV adds volume on up days and subtracts volume on down days
function calculateOBV(
  data: { price: number; volume?: number }[]
): number[] {
  const obvValues: number[] = [];
  let obv = 0;

  for (let i = 0; i < data.length; i++) {
    const volume = data[i].volume || Math.random() * 100000 + 50000; // Simulated volume if not provided

    if (i === 0) {
      obv = volume;
    } else {
      const priceChange = data[i].price - data[i - 1].price;
      if (priceChange > 0) {
        obv += volume;
      } else if (priceChange < 0) {
        obv -= volume;
      }
      // If price unchanged, OBV stays the same
    }
    obvValues.push(obv);
  }

  return obvValues;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(0);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }

  return sma;
}

export function OBVChart({ priceData, maPeriod = 20, loading }: OBVChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'OBV (거래량 균형 지표)',
      subtitle: `${maPeriod}일 이동평균선 포함 - 가격과 거래량 관계 분석`,
      obv: 'OBV',
      obvMA: `OBV MA(${maPeriod})`,
      bullish: '상승',
      bearish: '하락',
      neutral: '중립',
      bullishSignal: '매수 신호',
      bearishSignal: '매도 신호',
      trend: '추세',
      interpretation: '해석',
      buySignal: 'OBV가 MA 위로 상승 시 매수 신호',
      sellSignal: 'OBV가 MA 아래로 하락 시 매도 신호',
      divergence: '다이버전스',
      bullishDiv: '상승 다이버전스: 가격 하락 + OBV 상승 = 상승 반전 가능',
      bearishDiv: '하락 다이버전스: 가격 상승 + OBV 하락 = 하락 반전 가능',
      loading: '로딩 중...',
      currentValue: '현재 OBV',
      maValue: 'MA 값',
      changeRate: '변화율',
      volumeFlow: '거래량 흐름',
      accumulation: '축적',
      distribution: '분산',
    },
    en: {
      title: 'OBV (On-Balance Volume)',
      subtitle: `With ${maPeriod}-Day Moving Average - Price-Volume Relationship Analysis`,
      obv: 'OBV',
      obvMA: `OBV MA(${maPeriod})`,
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      bullishSignal: 'Buy Signal',
      bearishSignal: 'Sell Signal',
      trend: 'Trend',
      interpretation: 'Interpretation',
      buySignal: 'Buy when OBV crosses above MA',
      sellSignal: 'Sell when OBV crosses below MA',
      divergence: 'Divergence',
      bullishDiv: 'Bullish: Price falls + OBV rises = Potential reversal up',
      bearishDiv: 'Bearish: Price rises + OBV falls = Potential reversal down',
      loading: 'Loading...',
      currentValue: 'Current OBV',
      maValue: 'MA Value',
      changeRate: 'Change Rate',
      volumeFlow: 'Volume Flow',
      accumulation: 'Accumulation',
      distribution: 'Distribution',
    },
  };

  const t = texts[language];

  // Calculate OBV data
  const obvData = useMemo(() => {
    if (!priceData || priceData.length < maPeriod + 5) return [];

    const dataWithVolume = priceData.map(d => ({
      price: d.price,
      volume: d.volume || Math.abs(d.price * 10000 + Math.random() * 50000),
    }));

    const obvValues = calculateOBV(dataWithVolume);
    const obvMA = calculateSMA(obvValues, maPeriod);

    return priceData.map((item, i) => ({
      date: item.date,
      obv: obvValues[i],
      obvMA: obvMA[i] || null,
      price: item.price,
    })).filter((d, i) => i >= maPeriod - 1);
  }, [priceData, maPeriod]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (obvData.length < 2) {
      return { trend: 'neutral', signal: 'neutral', value: 0, maValue: 0, changeRate: 0 };
    }

    const current = obvData[obvData.length - 1];
    const previous = obvData[obvData.length - 2];
    const weekAgo = obvData[Math.max(0, obvData.length - 7)];

    // Trend based on OBV direction
    let trend = 'neutral';
    if (current.obv > previous.obv) trend = 'bullish';
    else if (current.obv < previous.obv) trend = 'bearish';

    // Signal based on OBV vs MA
    let signal = 'neutral';
    if (current.obvMA) {
      // Crossover detection
      if (previous.obvMA && previous.obv <= previous.obvMA && current.obv > current.obvMA) {
        signal = 'bullish';
      } else if (previous.obvMA && previous.obv >= previous.obvMA && current.obv < current.obvMA) {
        signal = 'bearish';
      }
    }

    // Calculate change rate
    const changeRate = weekAgo.obv !== 0
      ? ((current.obv - weekAgo.obv) / Math.abs(weekAgo.obv)) * 100
      : 0;

    return {
      trend,
      signal,
      value: current.obv,
      maValue: current.obvMA || 0,
      changeRate,
      current,
      previous,
    };
  }, [obvData]);

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

  if (obvData.length === 0) {
    return null;
  }

  const formatLargeNumber = (num: number) => {
    const absNum = Math.abs(num);
    if (absNum >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (absNum >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (absNum >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(0);
  };

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
                  {entry.dataKey === 'obv' && `${t.obv}: ${formatLargeNumber(entry.value)}`}
                  {entry.dataKey === 'obvMA' && `${t.obvMA}: ${formatLargeNumber(entry.value)}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
      case 'bearish': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      default: return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
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
              <Volume2 className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Trend Badge */}
            <Badge variant="outline" className={getTrendColor(currentStatus.trend)}>
              {getTrendIcon(currentStatus.trend)}
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

            {/* Volume Flow Badge */}
            <Badge variant="secondary">
              {currentStatus.value > currentStatus.maValue ? t.accumulation : t.distribution}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={obvData.slice(-60)}>
              <defs>
                <linearGradient id="obvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
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
                tickFormatter={(value) => formatLargeNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* OBV Area */}
              <Area
                type="monotone"
                dataKey="obv"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#obvGradient)"
                name={t.obv}
              />

              {/* OBV MA Line */}
              <Line
                type="monotone"
                dataKey="obvMA"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name={t.obvMA}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.currentValue}</p>
            <p className={`text-lg font-bold ${
              currentStatus.value > currentStatus.maValue ? 'text-cyan-500' : 'text-orange-500'
            }`}>
              {formatLargeNumber(currentStatus.value)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.maValue}</p>
            <p className="text-lg font-bold text-amber-500">
              {formatLargeNumber(currentStatus.maValue)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.changeRate} (7D)</p>
            <p className={`text-lg font-bold ${
              currentStatus.changeRate >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {currentStatus.changeRate >= 0 ? '+' : ''}{currentStatus.changeRate.toFixed(2)}%
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.volumeFlow}</p>
            <p className={`text-lg font-bold ${
              currentStatus.value > currentStatus.maValue ? 'text-green-500' : 'text-red-500'
            }`}>
              {currentStatus.value > currentStatus.maValue ? t.accumulation : t.distribution}
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
