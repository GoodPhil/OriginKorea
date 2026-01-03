'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CloudSun, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';

interface IchimokuChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  tenkanPeriod?: number;
  kijunPeriod?: number;
  senkouBPeriod?: number;
  displacement?: number;
  loading?: boolean;
}

// Calculate period high/low average (Donchian midline)
function calculateMidline(
  data: { high: number; low: number }[],
  startIdx: number,
  period: number
): number {
  if (startIdx < period - 1) return 0;

  let highest = -Infinity;
  let lowest = Infinity;

  for (let i = startIdx - period + 1; i <= startIdx; i++) {
    highest = Math.max(highest, data[i].high);
    lowest = Math.min(lowest, data[i].low);
  }

  return (highest + lowest) / 2;
}

// Calculate Ichimoku components
function calculateIchimoku(
  data: { price: number; high?: number; low?: number }[],
  tenkanPeriod: number = 9,
  kijunPeriod: number = 26,
  senkouBPeriod: number = 52,
  displacement: number = 26
): {
  tenkanSen: (number | null)[];
  kijunSen: (number | null)[];
  senkouSpanA: (number | null)[];
  senkouSpanB: (number | null)[];
  chikouSpan: (number | null)[];
} {
  const dataWithHighLow = data.map(d => ({
    high: d.high || d.price * 1.01,
    low: d.low || d.price * 0.99,
    close: d.price,
  }));

  const tenkanSen: (number | null)[] = [];
  const kijunSen: (number | null)[] = [];
  const senkouSpanA: (number | null)[] = [];
  const senkouSpanB: (number | null)[] = [];
  const chikouSpan: (number | null)[] = [];

  // Calculate Tenkan-sen and Kijun-sen
  for (let i = 0; i < data.length; i++) {
    // Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
    if (i >= tenkanPeriod - 1) {
      tenkanSen.push(calculateMidline(dataWithHighLow, i, tenkanPeriod));
    } else {
      tenkanSen.push(null);
    }

    // Kijun-sen (Base Line): (26-period high + 26-period low) / 2
    if (i >= kijunPeriod - 1) {
      kijunSen.push(calculateMidline(dataWithHighLow, i, kijunPeriod));
    } else {
      kijunSen.push(null);
    }
  }

  // Calculate Senkou Span A and B (displaced forward by 26 periods)
  // Initialize with nulls
  for (let i = 0; i < data.length + displacement; i++) {
    senkouSpanA.push(null);
    senkouSpanB.push(null);
  }

  for (let i = 0; i < data.length; i++) {
    // Senkou Span A: (Tenkan-sen + Kijun-sen) / 2, displaced forward
    if (tenkanSen[i] !== null && kijunSen[i] !== null) {
      const spanA = (tenkanSen[i]! + kijunSen[i]!) / 2;
      if (i + displacement < senkouSpanA.length) {
        senkouSpanA[i + displacement] = spanA;
      }
    }

    // Senkou Span B: (52-period high + 52-period low) / 2, displaced forward
    if (i >= senkouBPeriod - 1) {
      const spanB = calculateMidline(dataWithHighLow, i, senkouBPeriod);
      if (i + displacement < senkouSpanB.length) {
        senkouSpanB[i + displacement] = spanB;
      }
    }
  }

  // Calculate Chikou Span (Lagging Span): Close price displaced backward by 26 periods
  for (let i = 0; i < data.length; i++) {
    if (i >= displacement) {
      chikouSpan.push(data[i].price);
    } else {
      chikouSpan.push(null);
    }
  }

  return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan };
}

export function IchimokuChart({
  priceData,
  tenkanPeriod = 9,
  kijunPeriod = 26,
  senkouBPeriod = 52,
  displacement = 26,
  loading
}: IchimokuChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: '일목균형표 (Ichimoku Cloud)',
      subtitle: '추세, 지지/저항, 모멘텀을 한눈에 파악하는 복합 지표',
      tenkanSen: '전환선 (9)',
      kijunSen: '기준선 (26)',
      senkouSpanA: '선행스팬 A',
      senkouSpanB: '선행스팬 B',
      chikouSpan: '후행스팬',
      cloud: '구름대',
      price: '가격',
      bullish: '상승',
      bearish: '하락',
      neutral: '중립',
      bullishSignal: '매수 신호',
      bearishSignal: '매도 신호',
      trend: '추세',
      aboveCloud: '구름대 위',
      belowCloud: '구름대 아래',
      inCloud: '구름대 내',
      interpretation: '해석',
      tkCross: '전환선/기준선 교차',
      tkBullish: '전환선이 기준선 위로 = 상승 신호',
      tkBearish: '전환선이 기준선 아래로 = 하락 신호',
      cloudBreakout: '구름대 돌파',
      cloudBullish: '가격이 구름대 위 = 상승 추세',
      cloudBearish: '가격이 구름대 아래 = 하락 추세',
      loading: '로딩 중...',
      greenCloud: '녹색 구름 (상승)',
      redCloud: '적색 구름 (하락)',
    },
    en: {
      title: 'Ichimoku Cloud',
      subtitle: 'Comprehensive indicator for trend, support/resistance, and momentum',
      tenkanSen: 'Tenkan-sen (9)',
      kijunSen: 'Kijun-sen (26)',
      senkouSpanA: 'Senkou Span A',
      senkouSpanB: 'Senkou Span B',
      chikouSpan: 'Chikou Span',
      cloud: 'Cloud',
      price: 'Price',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      bullishSignal: 'Buy Signal',
      bearishSignal: 'Sell Signal',
      trend: 'Trend',
      aboveCloud: 'Above Cloud',
      belowCloud: 'Below Cloud',
      inCloud: 'In Cloud',
      interpretation: 'Interpretation',
      tkCross: 'Tenkan/Kijun Cross',
      tkBullish: 'Tenkan above Kijun = Bullish signal',
      tkBearish: 'Tenkan below Kijun = Bearish signal',
      cloudBreakout: 'Cloud Breakout',
      cloudBullish: 'Price above cloud = Bullish trend',
      cloudBearish: 'Price below cloud = Bearish trend',
      loading: 'Loading...',
      greenCloud: 'Green Cloud (Bullish)',
      redCloud: 'Red Cloud (Bearish)',
    },
  };

  const t = texts[language];

  // Calculate Ichimoku data
  const ichimokuData = useMemo(() => {
    if (!priceData || priceData.length < senkouBPeriod + 10) return [];

    const { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan } = calculateIchimoku(
      priceData,
      tenkanPeriod,
      kijunPeriod,
      senkouBPeriod,
      displacement
    );

    // Create chart data with extended future for cloud
    const chartData = [];
    const totalLength = Math.max(priceData.length, senkouSpanA.length);

    for (let i = 0; i < totalLength; i++) {
      const date = i < priceData.length
        ? priceData[i].date
        : `Future ${i - priceData.length + 1}`;

      chartData.push({
        date,
        price: i < priceData.length ? priceData[i].price : null,
        tenkanSen: i < tenkanSen.length ? tenkanSen[i] : null,
        kijunSen: i < kijunSen.length ? kijunSen[i] : null,
        senkouSpanA: i < senkouSpanA.length ? senkouSpanA[i] : null,
        senkouSpanB: i < senkouSpanB.length ? senkouSpanB[i] : null,
        chikouSpan: i < chikouSpan.length ? chikouSpan[i] : null,
      });
    }

    return chartData.filter((d, i) => i >= kijunPeriod - 1);
  }, [priceData, tenkanPeriod, kijunPeriod, senkouBPeriod, displacement]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (ichimokuData.length < 2) {
      return { trend: 'neutral', position: 'neutral', signal: 'neutral' };
    }

    // Find the last data point with price
    const currentIdx = ichimokuData.findIndex((d, i) =>
      i === ichimokuData.length - 1 || ichimokuData[i + 1].price === null
    );
    const current = ichimokuData[currentIdx] || ichimokuData[ichimokuData.length - 1];
    const previous = ichimokuData[currentIdx - 1] || ichimokuData[ichimokuData.length - 2];

    // Determine trend based on Tenkan/Kijun relationship
    let trend = 'neutral';
    if (current.tenkanSen !== null && current.kijunSen !== null) {
      if (current.tenkanSen > current.kijunSen) trend = 'bullish';
      else if (current.tenkanSen < current.kijunSen) trend = 'bearish';
    }

    // Determine position relative to cloud
    let position = 'neutral';
    if (current.price !== null && current.senkouSpanA !== null && current.senkouSpanB !== null) {
      const cloudTop = Math.max(current.senkouSpanA, current.senkouSpanB);
      const cloudBottom = Math.min(current.senkouSpanA, current.senkouSpanB);

      if (current.price > cloudTop) position = 'aboveCloud';
      else if (current.price < cloudBottom) position = 'belowCloud';
      else position = 'inCloud';
    }

    // Detect TK cross signal
    let signal = 'neutral';
    if (previous.tenkanSen !== null && previous.kijunSen !== null &&
        current.tenkanSen !== null && current.kijunSen !== null) {
      if (previous.tenkanSen <= previous.kijunSen && current.tenkanSen > current.kijunSen) {
        signal = 'bullish';
      } else if (previous.tenkanSen >= previous.kijunSen && current.tenkanSen < current.kijunSen) {
        signal = 'bearish';
      }
    }

    return { trend, position, signal, current };
  }, [ichimokuData]);

  if (loading) {
    return (
      <Card className="bg-card border-border/60">
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ichimokuData.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
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

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'aboveCloud': return 'border-green-500/50 text-green-500 bg-green-500/10';
      case 'belowCloud': return 'border-red-500/50 text-red-500 bg-red-500/10';
      default: return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
    }
  };

  const getPositionText = (position: string) => {
    switch (position) {
      case 'aboveCloud': return t.aboveCloud;
      case 'belowCloud': return t.belowCloud;
      default: return t.inCloud;
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Trend Badge */}
            <Badge variant="outline" className={getTrendColor(currentStatus.trend)}>
              {currentStatus.trend === 'bullish' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.trend === 'bearish' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.trend === 'neutral' && <Minus className="h-3.5 w-3.5 mr-1" />}
              {t[currentStatus.trend as 'bullish' | 'bearish' | 'neutral']}
            </Badge>

            {/* Position Badge */}
            <Badge variant="outline" className={getPositionColor(currentStatus.position)}>
              {getPositionText(currentStatus.position)}
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[350px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ichimokuData.slice(-80)}>
              <defs>
                <linearGradient id="cloudGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="cloudRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                interval="preserveStartEnd"
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

              {/* Cloud (Kumo) - Area between Senkou Span A and B */}
              <Area
                type="monotone"
                dataKey="senkouSpanA"
                stroke="transparent"
                fill="url(#cloudGreen)"
                fillOpacity={0.5}
                name={t.senkouSpanA}
              />
              <Area
                type="monotone"
                dataKey="senkouSpanB"
                stroke="transparent"
                fill="url(#cloudRed)"
                fillOpacity={0.3}
                name={t.senkouSpanB}
              />

              {/* Tenkan-sen (Conversion Line) - Fast */}
              <Line
                type="monotone"
                dataKey="tenkanSen"
                stroke="#06b6d4"
                strokeWidth={1.5}
                dot={false}
                name={t.tenkanSen}
              />

              {/* Kijun-sen (Base Line) - Slow */}
              <Line
                type="monotone"
                dataKey="kijunSen"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name={t.kijunSen}
              />

              {/* Chikou Span (Lagging Line) */}
              <Line
                type="monotone"
                dataKey="chikouSpan"
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name={t.chikouSpan}
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                name={t.price}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Explanation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="p-2 bg-secondary/30 rounded-lg text-center">
            <div className="w-full h-1 bg-cyan-500 rounded mb-1" />
            <p className="text-xs text-muted-foreground">{t.tenkanSen}</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg text-center">
            <div className="w-full h-1 bg-amber-500 rounded mb-1" />
            <p className="text-xs text-muted-foreground">{t.kijunSen}</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg text-center">
            <div className="w-full h-1 bg-green-500/50 rounded mb-1" />
            <p className="text-xs text-muted-foreground">{t.greenCloud}</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg text-center">
            <div className="w-full h-1 bg-red-500/50 rounded mb-1" />
            <p className="text-xs text-muted-foreground">{t.redCloud}</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg text-center">
            <div className="w-full h-1 bg-purple-500 rounded mb-1 border-dashed border border-purple-500" />
            <p className="text-xs text-muted-foreground">{t.chikouSpan}</p>
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
              <p className="text-xs font-medium text-foreground mb-1">{t.tkCross}</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {t.tkBullish}
                </p>
                <p className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  {t.tkBearish}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-1">{t.cloudBreakout}</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  {t.cloudBullish}
                </p>
                <p className="flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  {t.cloudBearish}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
