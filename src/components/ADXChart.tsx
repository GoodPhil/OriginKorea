'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Compass, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Activity, Zap } from 'lucide-react';

interface ADXChartProps {
  priceData: { date: string; price: number; high?: number; low?: number }[];
  period?: number;
  loading?: boolean;
}

// Calculate True Range
function calculateTR(high: number, low: number, prevClose: number): number {
  const tr1 = high - low;
  const tr2 = Math.abs(high - prevClose);
  const tr3 = Math.abs(low - prevClose);
  return Math.max(tr1, tr2, tr3);
}

// Calculate +DM and -DM
function calculateDM(
  high: number,
  low: number,
  prevHigh: number,
  prevLow: number
): { plusDM: number; minusDM: number } {
  const upMove = high - prevHigh;
  const downMove = prevLow - low;

  let plusDM = 0;
  let minusDM = 0;

  if (upMove > downMove && upMove > 0) {
    plusDM = upMove;
  }
  if (downMove > upMove && downMove > 0) {
    minusDM = downMove;
  }

  return { plusDM, minusDM };
}

// Wilder's Smoothing (similar to EMA but with different factor)
function wilderSmooth(data: number[], period: number): number[] {
  const smoothed: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smoothed.push(0);
    } else if (i === period - 1) {
      // Initial value is simple sum
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      smoothed.push(sum);
    } else {
      // Wilder smoothing: previous value - (previous value / period) + current value
      smoothed.push(smoothed[i - 1] - (smoothed[i - 1] / period) + data[i]);
    }
  }

  return smoothed;
}

// Calculate ADX, +DI, -DI
function calculateADX(
  data: { price: number; high?: number; low?: number }[],
  period: number = 14
): { adx: number[]; plusDI: number[]; minusDI: number[] } {
  const trValues: number[] = [];
  const plusDMValues: number[] = [];
  const minusDMValues: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const high = data[i].high || data[i].price * 1.01;
    const low = data[i].low || data[i].price * 0.99;

    if (i === 0) {
      trValues.push(high - low);
      plusDMValues.push(0);
      minusDMValues.push(0);
    } else {
      const prevHigh = data[i - 1].high || data[i - 1].price * 1.01;
      const prevLow = data[i - 1].low || data[i - 1].price * 0.99;
      const prevClose = data[i - 1].price;

      trValues.push(calculateTR(high, low, prevClose));
      const dm = calculateDM(high, low, prevHigh, prevLow);
      plusDMValues.push(dm.plusDM);
      minusDMValues.push(dm.minusDM);
    }
  }

  // Smooth TR, +DM, -DM
  const smoothedTR = wilderSmooth(trValues, period);
  const smoothedPlusDM = wilderSmooth(plusDMValues, period);
  const smoothedMinusDM = wilderSmooth(minusDMValues, period);

  // Calculate +DI and -DI
  const plusDI: number[] = [];
  const minusDI: number[] = [];
  const dxValues: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (smoothedTR[i] !== 0 && i >= period - 1) {
      plusDI.push((smoothedPlusDM[i] / smoothedTR[i]) * 100);
      minusDI.push((smoothedMinusDM[i] / smoothedTR[i]) * 100);

      const diSum = plusDI[plusDI.length - 1] + minusDI[minusDI.length - 1];
      if (diSum !== 0) {
        dxValues.push(Math.abs(plusDI[plusDI.length - 1] - minusDI[minusDI.length - 1]) / diSum * 100);
      } else {
        dxValues.push(0);
      }
    } else {
      plusDI.push(0);
      minusDI.push(0);
      dxValues.push(0);
    }
  }

  // Smooth DX to get ADX
  const adx = wilderSmooth(dxValues, period);

  // Normalize ADX values
  const normalizedADX = adx.map((val, i) => i >= period * 2 - 2 ? val / period : 0);

  return { adx: normalizedADX, plusDI, minusDI };
}

export function ADXChart({ priceData, period = 14, loading }: ADXChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'ADX (평균 방향성 지수)',
      subtitle: `${period}일 기간 - 추세 강도 측정 지표`,
      adx: 'ADX',
      plusDI: '+DI',
      minusDI: '-DI',
      strong: '강한 추세',
      moderate: '보통 추세',
      weak: '약한 추세',
      noTrend: '추세 없음',
      bullishSignal: '매수 신호',
      bearishSignal: '매도 신호',
      trend: '추세',
      bullish: '상승',
      bearish: '하락',
      neutral: '중립',
      interpretation: '해석',
      adxAbove25: 'ADX > 25: 추세가 강함',
      adxBelow20: 'ADX < 20: 추세 없음 (횡보)',
      buySignal: '+DI가 -DI 위로 교차 시 매수',
      sellSignal: '-DI가 +DI 위로 교차 시 매도',
      trendStrength: '추세 강도',
      loading: '로딩 중...',
      currentADX: '현재 ADX',
      diDiff: 'DI 차이',
      veryStrong: '매우 강함',
      direction: '방향',
    },
    en: {
      title: 'ADX (Average Directional Index)',
      subtitle: `${period}-Day Period - Trend Strength Indicator`,
      adx: 'ADX',
      plusDI: '+DI',
      minusDI: '-DI',
      strong: 'Strong Trend',
      moderate: 'Moderate Trend',
      weak: 'Weak Trend',
      noTrend: 'No Trend',
      bullishSignal: 'Buy Signal',
      bearishSignal: 'Sell Signal',
      trend: 'Trend',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      interpretation: 'Interpretation',
      adxAbove25: 'ADX > 25: Strong trend',
      adxBelow20: 'ADX < 20: No trend (ranging)',
      buySignal: 'Buy when +DI crosses above -DI',
      sellSignal: 'Sell when -DI crosses above +DI',
      trendStrength: 'Trend Strength',
      loading: 'Loading...',
      currentADX: 'Current ADX',
      diDiff: 'DI Difference',
      veryStrong: 'Very Strong',
      direction: 'Direction',
    },
  };

  const t = texts[language];

  // Calculate ADX data
  const adxData = useMemo(() => {
    if (!priceData || priceData.length < period * 2 + 5) return [];

    const dataWithHighLow = priceData.map(d => ({
      price: d.price,
      high: d.high || d.price * 1.01,
      low: d.low || d.price * 0.99,
    }));

    const { adx, plusDI, minusDI } = calculateADX(dataWithHighLow, period);

    return priceData.map((item, i) => ({
      date: item.date,
      adx: adx[i] > 0 ? adx[i] : null,
      plusDI: plusDI[i] > 0 ? plusDI[i] : null,
      minusDI: minusDI[i] > 0 ? minusDI[i] : null,
      price: item.price,
    })).filter(d => d.adx !== null);
  }, [priceData, period]);

  // Get current status
  const currentStatus = useMemo(() => {
    if (adxData.length < 2) {
      return { strength: 'noTrend', direction: 'neutral', adxValue: 0, plusDI: 0, minusDI: 0 };
    }

    const current = adxData[adxData.length - 1];
    const previous = adxData[adxData.length - 2];

    // Trend strength based on ADX value
    let strength = 'noTrend';
    if (current.adx !== null) {
      if (current.adx >= 50) strength = 'veryStrong';
      else if (current.adx >= 25) strength = 'strong';
      else if (current.adx >= 20) strength = 'moderate';
      else strength = 'weak';
    }

    // Direction based on +DI vs -DI
    let direction = 'neutral';
    if (current.plusDI !== null && current.minusDI !== null) {
      if (current.plusDI > current.minusDI) direction = 'bullish';
      else if (current.minusDI > current.plusDI) direction = 'bearish';
    }

    // Signal detection (crossovers)
    let signal = 'neutral';
    if (previous.plusDI !== null && previous.minusDI !== null &&
        current.plusDI !== null && current.minusDI !== null) {
      // +DI crosses above -DI = buy signal
      if (previous.plusDI <= previous.minusDI && current.plusDI > current.minusDI) {
        signal = 'bullish';
      }
      // -DI crosses above +DI = sell signal
      if (previous.minusDI <= previous.plusDI && current.minusDI > current.plusDI) {
        signal = 'bearish';
      }
    }

    return {
      strength,
      direction,
      signal,
      adxValue: current.adx || 0,
      plusDI: current.plusDI || 0,
      minusDI: current.minusDI || 0,
    };
  }, [adxData]);

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

  if (adxData.length === 0) {
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
                  {entry.dataKey === 'adx' && `${t.adx}: ${entry.value?.toFixed(2)}`}
                  {entry.dataKey === 'plusDI' && `${t.plusDI}: ${entry.value?.toFixed(2)}`}
                  {entry.dataKey === 'minusDI' && `${t.minusDI}: ${entry.value?.toFixed(2)}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'veryStrong': return 'border-purple-500/50 text-purple-500 bg-purple-500/10';
      case 'strong': return 'border-green-500/50 text-green-500 bg-green-500/10';
      case 'moderate': return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
      case 'weak': return 'border-orange-500/50 text-orange-500 bg-orange-500/10';
      default: return 'border-gray-500/50 text-gray-500 bg-gray-500/10';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'veryStrong': return t.veryStrong;
      case 'strong': return t.strong;
      case 'moderate': return t.moderate;
      case 'weak': return t.weak;
      default: return t.noTrend;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="h-3.5 w-3.5 mr-1" />;
      case 'bearish': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      default: return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish': return 'border-green-500/50 text-green-500 bg-green-500/10';
      case 'bearish': return 'border-red-500/50 text-red-500 bg-red-500/10';
      default: return 'border-gray-500/50 text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Strength Badge */}
            <Badge variant="outline" className={getStrengthColor(currentStatus.strength)}>
              <Zap className="h-3.5 w-3.5 mr-1" />
              {getStrengthText(currentStatus.strength)}
            </Badge>

            {/* Direction Badge */}
            <Badge variant="outline" className={getDirectionColor(currentStatus.direction)}>
              {getDirectionIcon(currentStatus.direction)}
              {t[currentStatus.direction as 'bullish' | 'bearish' | 'neutral']}
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
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={adxData.slice(-60)}>
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
                domain={[0, 60]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Reference lines */}
              <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />

              {/* ADX Line (main trend strength) */}
              <Line
                type="monotone"
                dataKey="adx"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                name={t.adx}
              />

              {/* +DI Line */}
              <Line
                type="monotone"
                dataKey="plusDI"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot={false}
                name={t.plusDI}
              />

              {/* -DI Line */}
              <Line
                type="monotone"
                dataKey="minusDI"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={false}
                name={t.minusDI}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Current Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.currentADX}</p>
            <p className={`text-lg font-bold ${
              currentStatus.adxValue >= 25 ? 'text-purple-500' :
              currentStatus.adxValue >= 20 ? 'text-yellow-500' :
              'text-gray-500'
            }`}>
              {currentStatus.adxValue.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.plusDI}</p>
            <p className="text-lg font-bold text-green-500">
              {currentStatus.plusDI.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.minusDI}</p>
            <p className="text-lg font-bold text-red-500">
              {currentStatus.minusDI.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.diDiff}</p>
            <p className={`text-lg font-bold ${
              currentStatus.plusDI > currentStatus.minusDI ? 'text-green-500' : 'text-red-500'
            }`}>
              {(currentStatus.plusDI - currentStatus.minusDI).toFixed(2)}
            </p>
          </div>
        </div>

        {/* ADX Gauge */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.trendStrength}</span>
            <span className={`text-sm font-bold ${
              currentStatus.adxValue >= 25 ? 'text-purple-500' :
              currentStatus.adxValue >= 20 ? 'text-yellow-500' :
              'text-gray-500'
            }`}>
              {currentStatus.adxValue.toFixed(1)}
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Zone indicators */}
            <div className="absolute left-0 top-0 h-full w-[33%] bg-gray-500/30" /> {/* 0-20: No trend */}
            <div className="absolute left-[33%] top-0 h-full w-[8%] bg-yellow-500/30" /> {/* 20-25: Weak */}
            <div className="absolute left-[41%] top-0 h-full w-[42%] bg-green-500/30" /> {/* 25-50: Strong */}
            <div className="absolute right-0 top-0 h-full w-[17%] bg-purple-500/30" /> {/* 50+: Very Strong */}
            {/* Current position (map 0-60 to 0%-100%) */}
            <div
              className="absolute top-0 h-full w-1 bg-white transition-all duration-300"
              style={{ left: `${Math.min(100, (currentStatus.adxValue / 60) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0</span>
            <span>20</span>
            <span>25</span>
            <span>50</span>
            <span>60+</span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {t.interpretation}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              {t.adxAbove25}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500/50" />
              {t.adxBelow20}
            </div>
          </div>
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
