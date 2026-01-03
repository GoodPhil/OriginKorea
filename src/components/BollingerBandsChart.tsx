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
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Target,
  Minus,
} from 'lucide-react';

interface BollingerDataPoint {
  date: string;
  price: number;
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
}

interface BollingerBandsChartProps {
  priceData: { date: string; price: number }[];
  period?: number;
  stdDev?: number;
  loading?: boolean;
}

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    sma[i] = sum / period;
  }
  return sma;
}

// Calculate Standard Deviation
function calculateStdDev(prices: number[], period: number, sma: number[]): number[] {
  const stdDev: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    let sumSquares = 0;
    for (let j = 0; j < period; j++) {
      const diff = prices[i - j] - sma[i];
      sumSquares += diff * diff;
    }
    stdDev[i] = Math.sqrt(sumSquares / period);
  }
  return stdDev;
}

// Calculate Bollinger Bands
function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  multiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[]; percentB: number[] } {
  const middle = calculateSMA(prices, period);
  const stdDev = calculateStdDev(prices, period, middle);

  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];
  const percentB: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (middle[i] !== undefined && stdDev[i] !== undefined) {
      upper[i] = middle[i] + (multiplier * stdDev[i]);
      lower[i] = middle[i] - (multiplier * stdDev[i]);
      bandwidth[i] = ((upper[i] - lower[i]) / middle[i]) * 100;
      percentB[i] = ((prices[i] - lower[i]) / (upper[i] - lower[i])) * 100;
    }
  }

  return { upper, middle, lower, bandwidth, percentB };
}

export function BollingerBandsChart({ priceData, period = 20, stdDev = 2, loading }: BollingerBandsChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: '볼린저 밴드',
      subtitle: `${period}일 이동평균 ± ${stdDev}σ 표준편차`,
      upperBand: '상단 밴드',
      middleBand: '중간 밴드 (SMA)',
      lowerBand: '하단 밴드',
      price: '현재 가격',
      bandwidth: '밴드 폭',
      percentB: '%B',
      squeeze: '스퀴즈 (압축)',
      expansion: '확장',
      overbought: '과매수 영역',
      oversold: '과매도 영역',
      neutral: '중립 영역',
      nearUpper: '상단 근접',
      nearLower: '하단 근접',
      interpretation: '해석',
      squeezeDesc: '변동성 감소 - 급등/급락 예상',
      overboughtDesc: '가격이 상단 밴드 근처 - 하락 가능성',
      oversoldDesc: '가격이 하단 밴드 근처 - 상승 가능성',
      walkingBands: '밴드 타기 중 - 추세 지속',
      loading: '로딩 중...',
      trend: '상태',
      volatility: '변동성',
      high: '높음',
      low: '낮음',
      normal: '보통',
    },
    en: {
      title: 'Bollinger Bands',
      subtitle: `${period}-day SMA ± ${stdDev}σ Standard Deviation`,
      upperBand: 'Upper Band',
      middleBand: 'Middle Band (SMA)',
      lowerBand: 'Lower Band',
      price: 'Current Price',
      bandwidth: 'Bandwidth',
      percentB: '%B',
      squeeze: 'Squeeze (Compression)',
      expansion: 'Expansion',
      overbought: 'Overbought Zone',
      oversold: 'Oversold Zone',
      neutral: 'Neutral Zone',
      nearUpper: 'Near Upper',
      nearLower: 'Near Lower',
      interpretation: 'Interpretation',
      squeezeDesc: 'Low volatility - Sharp move expected',
      overboughtDesc: 'Price near upper band - Possible decline',
      oversoldDesc: 'Price near lower band - Possible rise',
      walkingBands: 'Walking the bands - Trend continuation',
      loading: 'Loading...',
      trend: 'Status',
      volatility: 'Volatility',
      high: 'High',
      low: 'Low',
      normal: 'Normal',
    },
  };

  const t = texts[language];

  // Calculate Bollinger Bands data
  const bollingerData = useMemo(() => {
    if (!priceData || priceData.length < period + 5) return [];

    const prices = priceData.map(d => d.price);
    const { upper, middle, lower, bandwidth, percentB } = calculateBollingerBands(prices, period, stdDev);

    return priceData.map((item, i) => ({
      date: item.date,
      price: item.price,
      upper: upper[i] || null,
      middle: middle[i] || null,
      lower: lower[i] || null,
      bandwidth: bandwidth[i] || null,
      percentB: percentB[i] || null,
    })).filter(d => d.middle !== null);
  }, [priceData, period, stdDev]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (bollingerData.length < 2) {
      return {
        zone: 'neutral',
        volatility: 'normal',
        squeeze: false,
        walkingBands: false,
        percentB: 50,
        bandwidth: 0,
      };
    }

    const current = bollingerData[bollingerData.length - 1];
    const avgBandwidth = bollingerData.slice(-20).reduce((sum, d) => sum + (d.bandwidth || 0), 0) / 20;

    // Determine zone based on %B
    let zone = 'neutral';
    if (current.percentB !== null) {
      if (current.percentB > 80) zone = 'overbought';
      else if (current.percentB < 20) zone = 'oversold';
      else if (current.percentB > 60) zone = 'nearUpper';
      else if (current.percentB < 40) zone = 'nearLower';
    }

    // Volatility analysis
    let volatility = 'normal';
    if (current.bandwidth !== null) {
      if (current.bandwidth < avgBandwidth * 0.7) volatility = 'low';
      else if (current.bandwidth > avgBandwidth * 1.3) volatility = 'high';
    }

    // Squeeze detection (bandwidth below 20-period average significantly)
    const squeeze = current.bandwidth !== null && current.bandwidth < avgBandwidth * 0.6;

    // Walking the bands (price consistently near upper or lower)
    const recentData = bollingerData.slice(-5);
    const walkingUpper = recentData.every(d => d.percentB !== null && d.percentB > 70);
    const walkingLower = recentData.every(d => d.percentB !== null && d.percentB < 30);
    const walkingBands = walkingUpper || walkingLower;

    return {
      zone,
      volatility,
      squeeze,
      walkingBands,
      walkingDirection: walkingUpper ? 'up' : walkingLower ? 'down' : null,
      percentB: current.percentB || 50,
      bandwidth: current.bandwidth || 0,
      current,
    };
  }, [bollingerData]);

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

  if (bollingerData.length === 0) {
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
                  {entry.dataKey === 'price' && `${t.price}: $${entry.value?.toFixed(4)}`}
                  {entry.dataKey === 'upper' && `${t.upperBand}: $${entry.value?.toFixed(4)}`}
                  {entry.dataKey === 'middle' && `${t.middleBand}: $${entry.value?.toFixed(4)}`}
                  {entry.dataKey === 'lower' && `${t.lowerBand}: $${entry.value?.toFixed(4)}`}
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
      case 'nearUpper': return 'border-orange-500/50 text-orange-500 bg-orange-500/10';
      case 'nearLower': return 'border-cyan-500/50 text-cyan-500 bg-cyan-500/10';
      default: return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
    }
  };

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'overbought': return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
      case 'oversold': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      case 'nearUpper': return <ArrowUpRight className="h-3.5 w-3.5 mr-1" />;
      case 'nearLower': return <ArrowDownRight className="h-3.5 w-3.5 mr-1" />;
      default: return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Zone Badge */}
            <Badge variant="outline" className={getZoneColor(currentStatus.zone)}>
              {getZoneIcon(currentStatus.zone)}
              {t[currentStatus.zone as keyof typeof t]}
            </Badge>

            {/* Squeeze Alert */}
            {currentStatus.squeeze && (
              <Badge className="bg-purple-500 text-white">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                {t.squeeze}
              </Badge>
            )}

            {/* Walking Bands */}
            {currentStatus.walkingBands && (
              <Badge className={currentStatus.walkingDirection === 'up' ? 'bg-green-500' : 'bg-red-500'}>
                {currentStatus.walkingDirection === 'up' ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                {t.walkingBands}
              </Badge>
            )}

            {/* Volatility Badge */}
            <Badge variant="secondary" className="text-xs">
              {t.volatility}: {t[currentStatus.volatility as 'high' | 'low' | 'normal']}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={bollingerData.slice(-60)}>
              <defs>
                <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
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
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Band Area */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#bandGradient)"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#1f2937"
                connectNulls
              />

              {/* Upper Band Line */}
              <Line
                type="monotone"
                dataKey="upper"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
                name={t.upperBand}
              />

              {/* Middle Band (SMA) */}
              <Line
                type="monotone"
                dataKey="middle"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name={t.middleBand}
              />

              {/* Lower Band Line */}
              <Line
                type="monotone"
                dataKey="lower"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
                name={t.lowerBand}
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                name={t.price}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.upperBand}</p>
            <p className="text-lg font-bold text-red-500">
              ${currentStatus.current?.upper?.toFixed(4) || '-'}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.middleBand}</p>
            <p className="text-lg font-bold text-blue-500">
              ${currentStatus.current?.middle?.toFixed(4) || '-'}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.lowerBand}</p>
            <p className="text-lg font-bold text-green-500">
              ${currentStatus.current?.lower?.toFixed(4) || '-'}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.percentB}</p>
            <p className={`text-lg font-bold ${
              currentStatus.percentB > 80 ? 'text-red-500' :
              currentStatus.percentB < 20 ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {currentStatus.percentB.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* %B Gauge */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.percentB}</span>
            <span className="text-sm text-muted-foreground">{t.bandwidth}: {currentStatus.bandwidth.toFixed(2)}%</span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Zone indicators */}
            <div className="absolute left-0 top-0 h-full w-[20%] bg-green-500/30" />
            <div className="absolute left-[20%] top-0 h-full w-[60%] bg-yellow-500/20" />
            <div className="absolute right-0 top-0 h-full w-[20%] bg-red-500/30" />
            {/* Current position */}
            <div
              className="absolute top-0 h-full w-1 bg-orange-500 transition-all duration-300"
              style={{ left: `${Math.min(100, Math.max(0, currentStatus.percentB))}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{t.oversold}</span>
            <span>{t.neutral}</span>
            <span>{t.overbought}</span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t.interpretation}
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {currentStatus.squeeze && (
              <p className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-purple-500" />
                {t.squeezeDesc}
              </p>
            )}
            {currentStatus.zone === 'overbought' && (
              <p className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                {t.overboughtDesc}
              </p>
            )}
            {currentStatus.zone === 'oversold' && (
              <p className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {t.oversoldDesc}
              </p>
            )}
            {currentStatus.walkingBands && (
              <p className="flex items-center gap-2">
                {currentStatus.walkingDirection === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {t.walkingBands}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
