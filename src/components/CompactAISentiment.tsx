'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Minus, Brain,
  Flame, Snowflake, ArrowRight, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExchangeRate, formatKRW } from '@/hooks/useExchangeRate';

interface MarketData {
  priceUsd: string;
  priceChange24h: number;
  priceChange?: {
    h1?: number;
    h6?: number;
    h24?: number;
  };
  volume: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  txns?: {
    h24: {
      buys: number;
      sells: number;
    };
  };
}

interface ChartDataPoint {
  price: number;
  timestamp: number;
}

interface SentimentResult {
  score: number;
  level: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
}

function analyzeSentiment(data: MarketData): SentimentResult {
  let score = 0;

  const priceChange24h = data.priceChange24h || 0;
  const priceChange1h = data.priceChange?.h1 || 0;
  const priceChange6h = data.priceChange?.h6 || 0;

  if (priceChange24h > 10) score += 25;
  else if (priceChange24h > 5) score += 20;
  else if (priceChange24h > 2) score += 15;
  else if (priceChange24h > 0) score += 10;
  else if (priceChange24h > -2) score += 0;
  else if (priceChange24h > -5) score -= 10;
  else if (priceChange24h > -10) score -= 20;
  else score -= 25;

  const momentum = priceChange1h - (priceChange6h / 6);
  if (momentum > 0.5) score += 10;
  else if (momentum < -0.5) score -= 10;

  const volume24h = data.volume?.h24 || 0;
  const avgDailyVolume = 40000000;
  const volumeRatio = volume24h / avgDailyVolume;
  if (volumeRatio > 1.5) score += 15;
  else if (volumeRatio > 1.2) score += 10;
  else if (volumeRatio > 0.8) score += 5;
  else if (volumeRatio > 0.5) score -= 5;
  else score -= 10;

  const buys = data.txns?.h24?.buys || 0;
  const sells = data.txns?.h24?.sells || 0;
  const totalTxns = buys + sells;
  const buyRatio = totalTxns > 0 ? (buys / totalTxns) * 100 : 50;

  if (buyRatio > 60) score += 20;
  else if (buyRatio > 55) score += 15;
  else if (buyRatio > 50) score += 5;
  else if (buyRatio > 45) score -= 5;
  else if (buyRatio > 40) score -= 15;
  else score -= 20;

  const liquidity = data.liquidity?.usd || 0;
  const healthyLiquidity = 350000000;
  const liquidityRatio = liquidity / healthyLiquidity;
  if (liquidityRatio > 1.1) score += 15;
  else if (liquidityRatio > 0.9) score += 10;
  else if (liquidityRatio > 0.7) score += 0;
  else score -= 10;

  score = Math.max(-100, Math.min(100, score));

  let level: SentimentResult['level'];
  if (score >= 40) level = 'very_bullish';
  else if (score >= 15) level = 'bullish';
  else if (score >= -15) level = 'neutral';
  else if (score >= -40) level = 'bearish';
  else level = 'very_bearish';

  return { score, level };
}

function getMarketInsight(score: number, language: 'ko' | 'en'): string {
  if (language === 'ko') {
    if (score >= 60) return "시장에 강한 매수 에너지가 흐르고 있습니다. 상승 모멘텀이 지속될 가능성이 높습니다.";
    if (score >= 30) return "긍정적인 시장 흐름이 감지됩니다. 신중한 매수 접근이 유리할 수 있습니다.";
    if (score >= 10) return "시장이 안정세를 보이고 있습니다. 관망하며 기회를 엿보세요.";
    if (score >= -10) return "시장이 균형점에 있습니다. 명확한 방향성이 나타날 때까지 기다리세요.";
    if (score >= -30) return "약간의 불안정한 기운이 감지됩니다. 리스크 관리에 주의하세요.";
    if (score >= -60) return "하락 압력이 증가하고 있습니다. 보수적인 접근을 권장합니다.";
    return "시장에 강한 매도 압력이 존재합니다. 신중한 판단이 필요한 시점입니다.";
  } else {
    if (score >= 60) return "Strong buying energy flows through the market. Upward momentum likely to continue.";
    if (score >= 30) return "Positive market flow detected. Cautious buying approach may be favorable.";
    if (score >= 10) return "Market showing stability. Watch and wait for opportunities.";
    if (score >= -10) return "Market at equilibrium. Wait for clear direction signals.";
    if (score >= -30) return "Slight instability detected. Pay attention to risk management.";
    if (score >= -60) return "Selling pressure increasing. Conservative approach recommended.";
    return "Strong selling pressure exists. Careful judgment required.";
  }
}

// Mini Sparkline Chart Component
function MiniSparkline({ data, color, height = 40 }: { data: ChartDataPoint[]; color: string; height?: number }) {
  if (!data || data.length < 2) return null;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const width = 200;
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ minHeight: height }}
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-gradient-${color})`}
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Last point dot */}
      {data.length > 0 && (
        <circle
          cx={width - padding}
          cy={padding + chartHeight - ((data[data.length - 1].price - minPrice) / priceRange) * chartHeight}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}

interface CompactAISentimentProps {
  data: MarketData | null;
  loading?: boolean;
}

export function CompactAISentiment({ data, loading }: CompactAISentimentProps) {
  const { language } = useLanguage();
  const { rate: exchangeRate } = useExchangeRate();

  // State for price tracking and animation
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const analysis = useMemo(() => {
    if (!data) return null;
    return analyzeSentiment(data);
  }, [data]);

  const displayScore = useMemo(() => {
    if (!analysis) return '0.0';
    const variation = (Math.random() - 0.5) * 2;
    const scoreWithVariation = analysis.score + variation;
    const clampedScore = Math.max(-100, Math.min(100, scoreWithVariation));
    return clampedScore.toFixed(1);
  }, [analysis]);

  // Fetch price and chart data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current price from /api/dex
        const priceResponse = await fetch('/api/dex');
        const priceData = await priceResponse.json();

        // API returns { pair: { priceUsd, priceChange24h, ... } }
        if (priceData.pair) {
          const newPrice = parseFloat(priceData.pair.priceUsd);
          if (!isNaN(newPrice)) {
            if (currentPrice !== null && newPrice !== currentPrice) {
              setPriceFlash(newPrice > currentPrice ? 'up' : 'down');
              setTimeout(() => setPriceFlash(null), 1000);
            }
            setCurrentPrice(newPrice);
            setPriceChange24h(priceData.pair.priceChange24h || priceData.pair.priceChange?.h24 || 0);
          }
        }

        // Fetch chart data from /api/chart
        const chartResponse = await fetch('/api/chart?period=7d');
        const chartResult = await chartResponse.json();

        // API returns { data: [...], period, ... }
        if (chartResult.data && Array.isArray(chartResult.data) && chartResult.data.length > 0) {
          const formattedData = chartResult.data.map((point: { price: number; timestamp: number }) => ({
            price: point.price,
            timestamp: point.timestamp,
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const texts = {
    ko: {
      title: 'AI 시장 분석',
      subtitle: 'LGNS 토큰 실시간 AI 분석',
      very_bullish: '매우 강세',
      bullish: '상승세',
      neutral: '중립',
      bearish: '하락세',
      very_bearish: '매우 약세',
      loading: 'AI 분석 중...',
      viewDetails: '상세 분석 보기',
      live: '실시간',
      chart7d: '7일 추이',
    },
    en: {
      title: 'AI Market Analysis',
      subtitle: 'Real-time AI Analysis for LGNS',
      very_bullish: 'Very Bullish',
      bullish: 'Bullish',
      neutral: 'Neutral',
      bearish: 'Bearish',
      very_bearish: 'Very Bearish',
      loading: 'AI Analyzing...',
      viewDetails: 'View Details',
      live: 'LIVE',
      chart7d: '7D Trend',
    },
  };

  const t = texts[language];

  const getVisuals = (level: SentimentResult['level']) => {
    switch (level) {
      case 'very_bullish':
        return {
          icon: Flame,
          iconColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/50',
          badgeBg: 'bg-cyan-500',
          scoreColor: 'text-cyan-400',
          bgGlow: 'from-cyan-500/20 to-cyan-500/5',
          scoreBg: 'bg-cyan-500/10',
          chartColor: '#22d3ee',
        };
      case 'bullish':
        return {
          icon: TrendingUp,
          iconColor: 'text-teal-400',
          borderColor: 'border-teal-500/50',
          badgeBg: 'bg-teal-500',
          scoreColor: 'text-teal-400',
          bgGlow: 'from-teal-500/20 to-teal-500/5',
          scoreBg: 'bg-teal-500/10',
          chartColor: '#2dd4bf',
        };
      case 'neutral':
        return {
          icon: Minus,
          iconColor: 'text-amber-400',
          borderColor: 'border-amber-500/50',
          badgeBg: 'bg-amber-500',
          scoreColor: 'text-amber-400',
          bgGlow: 'from-amber-500/20 to-amber-500/5',
          scoreBg: 'bg-amber-500/10',
          chartColor: '#fbbf24',
        };
      case 'bearish':
        return {
          icon: TrendingDown,
          iconColor: 'text-orange-400',
          borderColor: 'border-orange-500/50',
          badgeBg: 'bg-orange-500',
          scoreColor: 'text-orange-400',
          bgGlow: 'from-orange-500/20 to-orange-500/5',
          scoreBg: 'bg-orange-500/10',
          chartColor: '#fb923c',
        };
      case 'very_bearish':
        return {
          icon: Snowflake,
          iconColor: 'text-red-400',
          borderColor: 'border-red-500/50',
          badgeBg: 'bg-red-500',
          scoreColor: 'text-red-400',
          bgGlow: 'from-red-500/20 to-red-500/5',
          scoreBg: 'bg-red-500/10',
          chartColor: '#f87171',
        };
    }
  };

  if (loading || !analysis) {
    return (
      <Card className="bg-zinc-900/80 border-zinc-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3 py-4">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-zinc-400 text-sm">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visuals = getVisuals(analysis.level);
  const Icon = visuals.icon;
  const marketInsight = getMarketInsight(analysis.score, language);

  // Calculate KRW price
  const priceKRW = currentPrice !== null ? currentPrice * exchangeRate : null;

  return (
    <div className="block">
      <Card className={`relative overflow-hidden border-2 ${visuals.borderColor} bg-zinc-900/90 backdrop-blur-sm hover:bg-zinc-800/90 transition-all duration-300 cursor-pointer group`}>
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${visuals.bgGlow} opacity-50`} />

        <CardContent className="relative p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left: AI Icon and Title */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                {/* Live indicator */}
                <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75" />
                    <div className="relative w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-foreground">{t.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{t.subtitle}</p>
                {/* Status Badge */}
                <div className="mt-2">
                  <Badge className={`${visuals.badgeBg} text-white font-semibold text-xs px-2.5 py-1`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {t[analysis.level]}
                  </Badge>
                </div>
                {/* Market Insight */}
                <p className={`mt-2 text-xs ${visuals.scoreColor} leading-relaxed line-clamp-2`}>
                  {marketInsight}
                </p>
              </div>
            </div>

            {/* Right: Score Display */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`${visuals.scoreBg} rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border ${visuals.borderColor}`}>
                <div className={`text-2xl sm:text-3xl font-black ${visuals.scoreColor} leading-none`}>
                  {parseFloat(displayScore) > 0 ? '+' : ''}{displayScore}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium uppercase text-center mt-1">SCORE</div>
                {/* Sentiment Progress Bar */}
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden w-16 sm:w-20">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      analysis.score >= 30 ? 'bg-green-500' :
                      analysis.score >= -30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, (analysis.score + 100) / 2))}%` }}
                  />
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-primary group-hover:translate-x-1 transition-all hidden sm:block" />
            </div>
          </div>

          {/* Price and Mini Chart Section */}
          <div className="mt-4 space-y-3">
            {/* Current Price Display - BIGGER with KRW */}
            {currentPrice !== null && (
              <div className={`p-3 rounded-lg bg-secondary/50 transition-all duration-300 ${
                priceFlash === 'up' ? 'bg-green-500/20 ring-1 ring-green-500' :
                priceFlash === 'down' ? 'bg-red-500/20 ring-1 ring-red-500' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {language === 'ko' ? '현재가' : 'Current Price'}
                  </span>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl sm:text-2xl font-bold ${
                        priceFlash === 'up' ? 'text-green-500' :
                        priceFlash === 'down' ? 'text-red-500' : 'text-foreground'
                      }`}>
                        ${currentPrice.toFixed(4)}
                      </span>
                      {priceChange24h !== null && (
                        <span className={`text-sm font-medium ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    {priceKRW !== null && (
                      <div className="text-sm text-muted-foreground mt-0.5">
                        ≈ {formatKRW(currentPrice, exchangeRate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mini Sparkline Chart - Trend Indicator */}
            {chartData.length > 0 && (
              <div className="p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">{t.chart7d}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: visuals.chartColor }} />
                    <span className="text-[10px] text-zinc-500">LGNS</span>
                  </div>
                </div>
                <MiniSparkline data={chartData} color={visuals.chartColor} height={50} />
                <p className="text-[9px] text-zinc-600 mt-1 text-center">
                  {language === 'ko' ? '추세 기반 시뮬레이션' : 'Trend-based simulation'}
                </p>
              </div>
            )}
          </div>

          {/* View Details Link */}
          <div className="mt-4 pt-3 border-t border-zinc-700/50 flex items-center justify-center sm:justify-end">
            <div className="flex items-center gap-2 text-sm text-zinc-400 group-hover:text-primary transition-colors">
              <Sparkles className="h-4 w-4" />
              <span>{t.viewDetails}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
