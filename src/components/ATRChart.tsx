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
  ReferenceLine,
} from 'recharts';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Minus, Activity } from 'lucide-react';

interface ATRDataPoint {
  date: string;
  atr: number;
  atrPercent: number;
  price: number;
  tr: number;
}

interface ATRChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  period?: number;
  loading?: boolean;
}

// Calculate True Range
function calculateTR(
  current: { price: number; high?: number; low?: number },
  previous: { price: number }
): number {
  const high = current.high || current.price * 1.01;
  const low = current.low || current.price * 0.99;
  const prevClose = previous.price;

  // True Range is the greatest of:
  // 1. Current High - Current Low
  // 2. |Current High - Previous Close|
  // 3. |Current Low - Previous Close|
  return Math.max(
    high - low,
    Math.abs(high - prevClose),
    Math.abs(low - prevClose)
  );
}

// Calculate ATR (Average True Range)
function calculateATR(
  data: { price: number; high?: number; low?: number }[],
  period: number = 14
): { atr: number[]; tr: number[] } {
  const tr: number[] = [];
  const atr: number[] = [];

  // Calculate True Range for each day
  for (let i = 1; i < data.length; i++) {
    tr[i] = calculateTR(data[i], data[i - 1]);
  }

  // Calculate initial ATR (simple average of first 'period' TRs)
  let sum = 0;
  for (let i = 1; i <= period && i < tr.length; i++) {
    sum += tr[i];
  }
  atr[period] = sum / period;

  // Calculate subsequent ATRs using smoothed moving average
  for (let i = period + 1; i < data.length; i++) {
    atr[i] = ((atr[i - 1] * (period - 1)) + tr[i]) / period;
  }

  return { atr, tr };
}

export function ATRChart({ priceData, period = 14, loading }: ATRChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'ATR (Average True Range)',
      subtitle: `${period}일 평균 진폭 - 변동성 측정 지표`,
      atr: 'ATR',
      atrPercent: 'ATR %',
      trueRange: 'True Range',
      volatility: '변동성',
      high: '높음',
      medium: '보통',
      low: '낮음',
      increasing: '증가 중',
      decreasing: '감소 중',
      stable: '안정',
      interpretation: '해석',
      highVolatility: '높은 변동성: 가격 급등/급락 가능, 손절매 확대 권장',
      lowVolatility: '낮은 변동성: 횡보장, 돌파 시 큰 움직임 예상',
      avgVolatility: '평균 변동성: 정상적인 시장 상태',
      stopLoss: '손절매 설정',
      stopLossDesc: 'ATR x 2 ~ 3 배수로 손절매 거리 설정 권장',
      positionSize: '포지션 사이징',
      positionSizeDesc: '높은 ATR = 작은 포지션, 낮은 ATR = 큰 포지션',
      loading: '로딩 중...',
      avgATR: '평균 ATR',
      currentATR: '현재 ATR',
      trend: '추세',
    },
    en: {
      title: 'ATR (Average True Range)',
      subtitle: `${period}-Day Average Range - Volatility Indicator`,
      atr: 'ATR',
      atrPercent: 'ATR %',
      trueRange: 'True Range',
      volatility: 'Volatility',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      increasing: 'Increasing',
      decreasing: 'Decreasing',
      stable: 'Stable',
      interpretation: 'Interpretation',
      highVolatility: 'High volatility: Potential sharp moves, widen stop-loss',
      lowVolatility: 'Low volatility: Consolidation, expect breakout',
      avgVolatility: 'Average volatility: Normal market conditions',
      stopLoss: 'Stop Loss Setting',
      stopLossDesc: 'Recommended: ATR x 2-3 multiplier for stop distance',
      positionSize: 'Position Sizing',
      positionSizeDesc: 'High ATR = Smaller position, Low ATR = Larger position',
      loading: 'Loading...',
      avgATR: 'Avg ATR',
      currentATR: 'Current ATR',
      trend: 'Trend',
    },
  };

  const t = texts[language];

  // Calculate ATR data
  const atrData = useMemo(() => {
    if (!priceData || priceData.length < period + 5) return [];

    const dataWithHighLow = priceData.map(d => ({
      price: d.price,
      high: d.high || d.price * 1.01,
      low: d.low || d.price * 0.99,
    }));

    const { atr, tr } = calculateATR(dataWithHighLow, period);

    return priceData.map((item, i) => ({
      date: item.date,
      atr: atr[i] !== undefined ? atr[i] : null,
      atrPercent: atr[i] !== undefined && item.price > 0 ? (atr[i] / item.price) * 100 : null,
      price: item.price,
      tr: tr[i] || null,
    })).filter(d => d.atr !== null);
  }, [priceData, period]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (atrData.length < 5) {
      return { volatility: 'medium', trend: 'stable', currentATR: 0, avgATR: 0, atrPercent: 0 };
    }

    const current = atrData[atrData.length - 1];
    const recent = atrData.slice(-20);
    const avgATR = recent.reduce((sum, d) => sum + (d.atr || 0), 0) / recent.length;

    // Volatility level
    let volatility = 'medium';
    if (current.atr! > avgATR * 1.3) volatility = 'high';
    else if (current.atr! < avgATR * 0.7) volatility = 'low';

    // Trend (is ATR increasing or decreasing?)
    const recentTrend = atrData.slice(-5);
    const firstHalf = recentTrend.slice(0, 2).reduce((sum, d) => sum + (d.atr || 0), 0) / 2;
    const secondHalf = recentTrend.slice(-2).reduce((sum, d) => sum + (d.atr || 0), 0) / 2;

    let trend = 'stable';
    if (secondHalf > firstHalf * 1.1) trend = 'increasing';
    else if (secondHalf < firstHalf * 0.9) trend = 'decreasing';

    return {
      volatility,
      trend,
      currentATR: current.atr || 0,
      avgATR,
      atrPercent: current.atrPercent || 0,
      current,
    };
  }, [atrData]);

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

  if (atrData.length === 0) {
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
                  {entry.dataKey === 'atr' && `${t.atr}: $${entry.value?.toFixed(4)}`}
                  {entry.dataKey === 'atrPercent' && `${t.atrPercent}: ${entry.value?.toFixed(2)}%`}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getVolatilityColor = (vol: string) => {
    switch (vol) {
      case 'high': return 'border-red-500/50 text-red-500 bg-red-500/10';
      case 'low': return 'border-green-500/50 text-green-500 bg-green-500/10';
      default: return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
      case 'decreasing': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      default: return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Volatility Badge */}
            <Badge variant="outline" className={getVolatilityColor(currentStatus.volatility)}>
              {currentStatus.volatility === 'high' && <AlertTriangle className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.volatility === 'low' && <Minus className="h-3.5 w-3.5 mr-1" />}
              {currentStatus.volatility === 'medium' && <Activity className="h-3.5 w-3.5 mr-1" />}
              {t.volatility}: {t[currentStatus.volatility as 'high' | 'medium' | 'low']}
            </Badge>

            {/* Trend Badge */}
            <Badge variant="secondary">
              {getTrendIcon(currentStatus.trend)}
              {t[currentStatus.trend as 'increasing' | 'decreasing' | 'stable']}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={atrData.slice(-60)}>
              <defs>
                <linearGradient id="atrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
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
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Average ATR line */}
              <ReferenceLine
                y={currentStatus.avgATR}
                stroke="#f97316"
                strokeDasharray="5 5"
                strokeOpacity={0.7}
              />

              {/* ATR Area */}
              <Area
                type="monotone"
                dataKey="atr"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#atrGradient)"
                name={t.atr}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.currentATR}</p>
            <p className={`text-lg font-bold ${
              currentStatus.volatility === 'high' ? 'text-red-500' :
              currentStatus.volatility === 'low' ? 'text-green-500' :
              'text-purple-500'
            }`}>
              ${currentStatus.currentATR.toFixed(4)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.atrPercent}</p>
            <p className="text-lg font-bold text-cyan-500">
              {currentStatus.atrPercent.toFixed(2)}%
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.avgATR}</p>
            <p className="text-lg font-bold text-orange-500">
              ${currentStatus.avgATR.toFixed(4)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.trend}</p>
            <p className={`text-lg font-bold ${
              currentStatus.trend === 'increasing' ? 'text-red-500' :
              currentStatus.trend === 'decreasing' ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {t[currentStatus.trend as 'increasing' | 'decreasing' | 'stable']}
            </p>
          </div>
        </div>

        {/* Volatility Meter */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.volatility} Meter</span>
            <span className={`text-sm font-bold ${
              currentStatus.volatility === 'high' ? 'text-red-500' :
              currentStatus.volatility === 'low' ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {(currentStatus.currentATR / currentStatus.avgATR * 100).toFixed(0)}% of Avg
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Zone indicators */}
            <div className="absolute left-0 top-0 h-full w-1/3 bg-green-500/30" />
            <div className="absolute left-1/3 top-0 h-full w-1/3 bg-yellow-500/20" />
            <div className="absolute right-0 top-0 h-full w-1/3 bg-red-500/30" />
            {/* Current position */}
            <div
              className="absolute top-0 h-full w-1 bg-purple-500 transition-all duration-300"
              style={{
                left: `${Math.min(100, Math.max(0, (currentStatus.currentATR / currentStatus.avgATR) * 50))}%`
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{t.low}</span>
            <span>{t.medium}</span>
            <span>{t.high}</span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {t.interpretation}
          </h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            {currentStatus.volatility === 'high' && (
              <p className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                {t.highVolatility}
              </p>
            )}
            {currentStatus.volatility === 'low' && (
              <p className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-green-500" />
                {t.lowVolatility}
              </p>
            )}
            {currentStatus.volatility === 'medium' && (
              <p className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-yellow-500" />
                {t.avgVolatility}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/30">
              <div>
                <p className="font-medium text-foreground">{t.stopLoss}</p>
                <p className="text-xs">{t.stopLossDesc}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{t.positionSize}</p>
                <p className="text-xs">{t.positionSizeDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
