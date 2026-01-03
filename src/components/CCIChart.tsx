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
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, BarChart3 } from 'lucide-react';

interface CCIChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  period?: number;
  loading?: boolean;
}

// Calculate Typical Price (TP) = (High + Low + Close) / 3
function calculateTypicalPrice(high: number, low: number, close: number): number {
  return (high + low + close) / 3;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return 0;
  const sum = data.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// Calculate Mean Deviation
function calculateMeanDeviation(data: number[], sma: number, period: number): number {
  if (data.length < period) return 0;
  const recentData = data.slice(-period);
  const sumDeviations = recentData.reduce((sum, val) => sum + Math.abs(val - sma), 0);
  return sumDeviations / period;
}

// Calculate CCI
// CCI = (Typical Price - SMA of TP) / (0.015 × Mean Deviation)
function calculateCCI(
  data: { price: number; high?: number; low?: number }[],
  period: number = 20
): number[] {
  const cciValues: number[] = [];
  const typicalPrices: number[] = [];

  // Calculate typical prices for all data points
  for (let i = 0; i < data.length; i++) {
    const high = data[i].high || data[i].price * 1.01;
    const low = data[i].low || data[i].price * 0.99;
    const close = data[i].price;
    typicalPrices.push(calculateTypicalPrice(high, low, close));
  }

  // Calculate CCI for each point after we have enough data
  for (let i = period - 1; i < data.length; i++) {
    const relevantTPs = typicalPrices.slice(i - period + 1, i + 1);
    const sma = calculateSMA(relevantTPs, period);
    const meanDeviation = calculateMeanDeviation(relevantTPs, sma, period);

    // CCI formula
    if (meanDeviation !== 0) {
      cciValues[i] = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
    } else {
      cciValues[i] = 0;
    }
  }

  return cciValues;
}

export function CCIChart({ priceData, period = 20, loading }: CCIChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'CCI (상품 채널 지수)',
      subtitle: `${period}일 기간 - 가격 편차 기반 모멘텀 지표`,
      cci: 'CCI',
      overbought: '과매수',
      oversold: '과매도',
      neutral: '중립',
      extreme: '극단',
      bullishSignal: '매수 신호',
      bearishSignal: '매도 신호',
      trend: '상태',
      bullish: '상승',
      bearish: '하락',
      interpretation: '해석',
      buySignal: 'CCI가 -100 이하에서 상승 시 매수 신호',
      sellSignal: 'CCI가 +100 이상에서 하락 시 매도 신호',
      divergence: '다이버전스',
      bullishDiv: '상승 다이버전스: 가격 하락 + CCI 상승',
      bearishDiv: '하락 다이버전스: 가격 상승 + CCI 하락',
      loading: '로딩 중...',
      currentValue: '현재 값',
      avgValue: '평균 값',
      extremeOverbought: '+200 이상: 극단적 과매수',
      extremeOversold: '-200 이하: 극단적 과매도',
    },
    en: {
      title: 'CCI (Commodity Channel Index)',
      subtitle: `${period}-Day Period - Price Deviation Momentum Indicator`,
      cci: 'CCI',
      overbought: 'Overbought',
      oversold: 'Oversold',
      neutral: 'Neutral',
      extreme: 'Extreme',
      bullishSignal: 'Buy Signal',
      bearishSignal: 'Sell Signal',
      trend: 'Status',
      bullish: 'Bullish',
      bearish: 'Bearish',
      interpretation: 'Interpretation',
      buySignal: 'Buy when CCI rises from below -100',
      sellSignal: 'Sell when CCI falls from above +100',
      divergence: 'Divergence',
      bullishDiv: 'Bullish: Price falls + CCI rises',
      bearishDiv: 'Bearish: Price rises + CCI falls',
      loading: 'Loading...',
      currentValue: 'Current Value',
      avgValue: 'Avg Value',
      extremeOverbought: '+200+: Extreme Overbought',
      extremeOversold: '-200-: Extreme Oversold',
    },
  };

  const t = texts[language];

  // Calculate CCI data
  const cciData = useMemo(() => {
    if (!priceData || priceData.length < period + 5) return [];

    const dataWithHighLow = priceData.map(d => ({
      price: d.price,
      high: d.high || d.price * 1.01,
      low: d.low || d.price * 0.99,
    }));

    const cciValues = calculateCCI(dataWithHighLow, period);

    return priceData.map((item, i) => ({
      date: item.date,
      cci: cciValues[i] !== undefined ? cciValues[i] : null,
      price: item.price,
    })).filter(d => d.cci !== null);
  }, [priceData, period]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (cciData.length < 2) {
      return { zone: 'neutral', trend: 'neutral', value: 0, avgValue: 0 };
    }

    const current = cciData[cciData.length - 1];
    const previous = cciData[cciData.length - 2];
    const recent = cciData.slice(-20);
    const avgValue = recent.reduce((sum, d) => sum + (d.cci || 0), 0) / recent.length;

    // Zone based on CCI value
    let zone = 'neutral';
    if (current.cci !== null) {
      if (current.cci > 200) zone = 'extreme_overbought';
      else if (current.cci > 100) zone = 'overbought';
      else if (current.cci < -200) zone = 'extreme_oversold';
      else if (current.cci < -100) zone = 'oversold';
    }

    // Trend direction
    let trend = 'neutral';
    if (current.cci !== null && previous.cci !== null) {
      if (current.cci > previous.cci) trend = 'bullish';
      else if (current.cci < previous.cci) trend = 'bearish';
    }

    // Signal detection
    let signal = 'neutral';
    if (previous.cci !== null && current.cci !== null) {
      // Buy signal: crossing above -100 from below
      if (previous.cci < -100 && current.cci > -100) signal = 'bullish';
      // Sell signal: crossing below +100 from above
      if (previous.cci > 100 && current.cci < 100) signal = 'bearish';
    }

    return {
      zone,
      trend,
      signal,
      value: current.cci || 0,
      avgValue,
      current,
      previous,
    };
  }, [cciData]);

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

  if (cciData.length === 0) {
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
                  {entry.dataKey === 'cci' && `${t.cci}: ${entry.value?.toFixed(2)}`}
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
      case 'extreme_overbought': return 'border-red-600/50 text-red-600 bg-red-600/10';
      case 'overbought': return 'border-red-500/50 text-red-500 bg-red-500/10';
      case 'extreme_oversold': return 'border-green-600/50 text-green-600 bg-green-600/10';
      case 'oversold': return 'border-green-500/50 text-green-500 bg-green-500/10';
      default: return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
    }
  };

  const getZoneText = (zone: string) => {
    switch (zone) {
      case 'extreme_overbought': return `${t.extreme} ${t.overbought}`;
      case 'overbought': return t.overbought;
      case 'extreme_oversold': return `${t.extreme} ${t.oversold}`;
      case 'oversold': return t.oversold;
      default: return t.neutral;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
      case 'bearish': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      default: return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };

  // Get min/max for Y axis
  const minCCI = Math.min(...cciData.slice(-60).map(d => d.cci || 0), -200);
  const maxCCI = Math.max(...cciData.slice(-60).map(d => d.cci || 0), 200);
  const yAxisDomain = [Math.floor(minCCI / 50) * 50 - 50, Math.ceil(maxCCI / 50) * 50 + 50];

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Zone Badge */}
            <Badge variant="outline" className={getZoneColor(currentStatus.zone)}>
              {currentStatus.zone.includes('overbought') && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.zone.includes('oversold') && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.zone === 'neutral' && <Minus className="h-3.5 w-3.5 mr-1" />}
              {getZoneText(currentStatus.zone)}
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
            <ComposedChart data={cciData.slice(-60)}>
              <defs>
                <linearGradient id="cciGradientPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#eab308" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
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
                domain={yAxisDomain}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference lines */}
              <ReferenceLine y={200} stroke="#dc2626" strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" strokeOpacity={0.5} />
              <ReferenceLine y={-100} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={-200} stroke="#16a34a" strokeDasharray="3 3" strokeOpacity={0.4} />

              {/* CCI Line with Area */}
              <Area
                type="monotone"
                dataKey="cci"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#cciGradientPositive)"
                name={t.cci}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.currentValue}</p>
            <p className={`text-lg font-bold ${
              currentStatus.value > 100 ? 'text-red-500' :
              currentStatus.value < -100 ? 'text-green-500' :
              'text-cyan-500'
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
            <p className="text-lg font-bold text-red-500">+100</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.oversold}</p>
            <p className="text-lg font-bold text-green-500">-100</p>
          </div>
        </div>

        {/* CCI Gauge */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.cci} Position</span>
            <span className={`text-sm font-bold ${
              currentStatus.value > 100 ? 'text-red-500' :
              currentStatus.value < -100 ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {currentStatus.value.toFixed(1)}
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Zone indicators */}
            <div className="absolute left-0 top-0 h-full w-[12.5%] bg-green-600/40" /> {/* -200 to -150 = extreme oversold */}
            <div className="absolute left-[12.5%] top-0 h-full w-[12.5%] bg-green-500/30" /> {/* -150 to -100 = oversold */}
            <div className="absolute left-[25%] top-0 h-full w-[50%] bg-yellow-500/20" /> {/* -100 to +100 = neutral */}
            <div className="absolute right-[12.5%] top-0 h-full w-[12.5%] bg-red-500/30" /> {/* +100 to +150 = overbought */}
            <div className="absolute right-0 top-0 h-full w-[12.5%] bg-red-600/40" /> {/* +150 to +200 = extreme overbought */}
            {/* Current position (map -200 to +200 to 0% to 100%) */}
            <div
              className="absolute top-0 h-full w-1 bg-cyan-500 transition-all duration-300"
              style={{ left: `${Math.max(0, Math.min(100, ((currentStatus.value + 200) / 400) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>-200</span>
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
            <span>+200</span>
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
          <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p>{t.extremeOverbought}</p>
            <p>{t.extremeOversold}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
