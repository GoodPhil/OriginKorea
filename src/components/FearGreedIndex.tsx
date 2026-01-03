'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Skull,
  AlertTriangle,
  Meh,
  Smile,
  Sparkles,
  TrendingUp,
  BarChart3,
  Activity,
  Droplets,
  Gauge,
} from 'lucide-react';

interface MarketData {
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

interface FearGreedResult {
  score: number;
  level: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  factors: {
    volatility: { score: number; label: string };
    momentum: { score: number; label: string };
    volume: { score: number; label: string };
    buyPressure: { score: number; label: string };
  };
}

function calculateFearGreed(data: MarketData): FearGreedResult {
  const priceChange24h = data.priceChange24h || 0;
  const priceChange1h = data.priceChange?.h1 || 0;
  const priceChange6h = data.priceChange?.h6 || 0;
  const volume24h = data.volume?.h24 || 0;
  const buys = data.txns?.h24?.buys || 0;
  const sells = data.txns?.h24?.sells || 0;
  const totalTxns = buys + sells;
  const buyRatio = totalTxns > 0 ? buys / totalTxns : 0.5;

  // 1. Volatility (High volatility = Fear, Low = Neutral)
  const volatility = Math.abs(priceChange24h);
  let volatilityScore: number;
  let volatilityLabel: string;
  if (volatility > 15) {
    volatilityScore = priceChange24h > 0 ? 80 : 20;
    volatilityLabel = priceChange24h > 0 ? 'high_positive' : 'high_negative';
  } else if (volatility > 8) {
    volatilityScore = priceChange24h > 0 ? 65 : 35;
    volatilityLabel = priceChange24h > 0 ? 'moderate_positive' : 'moderate_negative';
  } else if (volatility > 3) {
    volatilityScore = priceChange24h > 0 ? 55 : 45;
    volatilityLabel = 'low';
  } else {
    volatilityScore = 50;
    volatilityLabel = 'stable';
  }

  // 2. Momentum (Short-term vs medium-term)
  const momentum = priceChange1h - (priceChange6h / 6);
  let momentumScore: number;
  let momentumLabel: string;
  if (momentum > 1) {
    momentumScore = 85;
    momentumLabel = 'strong_bullish';
  } else if (momentum > 0.3) {
    momentumScore = 65;
    momentumLabel = 'bullish';
  } else if (momentum > -0.3) {
    momentumScore = 50;
    momentumLabel = 'neutral';
  } else if (momentum > -1) {
    momentumScore = 35;
    momentumLabel = 'bearish';
  } else {
    momentumScore = 15;
    momentumLabel = 'strong_bearish';
  }

  // 3. Volume (High = Greed, Low = Fear)
  const avgVolume = 40000000;
  const volumeRatio = volume24h / avgVolume;
  let volumeScore: number;
  let volumeLabel: string;
  if (volumeRatio > 1.5) {
    volumeScore = 80;
    volumeLabel = 'very_high';
  } else if (volumeRatio > 1.2) {
    volumeScore = 65;
    volumeLabel = 'high';
  } else if (volumeRatio > 0.8) {
    volumeScore = 50;
    volumeLabel = 'normal';
  } else if (volumeRatio > 0.5) {
    volumeScore = 35;
    volumeLabel = 'low';
  } else {
    volumeScore = 20;
    volumeLabel = 'very_low';
  }

  // 4. Buy Pressure
  let buyPressureScore: number;
  let buyPressureLabel: string;
  if (buyRatio > 0.65) {
    buyPressureScore = 90;
    buyPressureLabel = 'extreme_buy';
  } else if (buyRatio > 0.55) {
    buyPressureScore = 70;
    buyPressureLabel = 'strong_buy';
  } else if (buyRatio > 0.45) {
    buyPressureScore = 50;
    buyPressureLabel = 'balanced';
  } else if (buyRatio > 0.35) {
    buyPressureScore = 30;
    buyPressureLabel = 'strong_sell';
  } else {
    buyPressureScore = 10;
    buyPressureLabel = 'extreme_sell';
  }

  // Calculate final score (0-100, 0=Extreme Fear, 100=Extreme Greed)
  const finalScore = Math.round(
    volatilityScore * 0.25 +
    momentumScore * 0.25 +
    volumeScore * 0.25 +
    buyPressureScore * 0.25
  );

  let level: FearGreedResult['level'];
  if (finalScore >= 80) level = 'extreme_greed';
  else if (finalScore >= 60) level = 'greed';
  else if (finalScore >= 40) level = 'neutral';
  else if (finalScore >= 20) level = 'fear';
  else level = 'extreme_fear';

  return {
    score: finalScore,
    level,
    factors: {
      volatility: { score: volatilityScore, label: volatilityLabel },
      momentum: { score: momentumScore, label: momentumLabel },
      volume: { score: volumeScore, label: volumeLabel },
      buyPressure: { score: buyPressureScore, label: buyPressureLabel },
    },
  };
}

interface FearGreedIndexProps {
  data: MarketData | null;
  loading?: boolean;
}

export function FearGreedIndex({ data, loading }: FearGreedIndexProps) {
  const { language } = useLanguage();

  const result = useMemo(() => {
    if (!data) return null;
    return calculateFearGreed(data);
  }, [data]);

  const texts = {
    ko: {
      title: '공포 & 탐욕 지수',
      subtitle: '시장 심리 종합 분석',
      extreme_fear: '극심한 공포',
      fear: '공포',
      neutral: '중립',
      greed: '탐욕',
      extreme_greed: '극심한 탐욕',
      volatility: '변동성',
      momentum: '모멘텀',
      volume: '거래량',
      buyPressure: '매수세',
      loading: '분석 중...',
      interpretation: '해석',
      extreme_fear_desc: '시장 참여자들이 극도로 두려워하고 있습니다. 매수 기회일 수 있습니다.',
      fear_desc: '투자자들이 우려하고 있습니다. 신중한 접근이 필요합니다.',
      neutral_desc: '시장이 균형 상태입니다. 방향성을 관찰하세요.',
      greed_desc: '투자자들이 낙관적입니다. 과매수 가능성에 주의하세요.',
      extreme_greed_desc: '시장이 과열되어 있습니다. 조정 가능성을 고려하세요.',
    },
    en: {
      title: 'Fear & Greed Index',
      subtitle: 'Comprehensive market sentiment analysis',
      extreme_fear: 'Extreme Fear',
      fear: 'Fear',
      neutral: 'Neutral',
      greed: 'Greed',
      extreme_greed: 'Extreme Greed',
      volatility: 'Volatility',
      momentum: 'Momentum',
      volume: 'Volume',
      buyPressure: 'Buy Pressure',
      loading: 'Analyzing...',
      interpretation: 'Interpretation',
      extreme_fear_desc: 'Market participants are extremely fearful. Could be a buying opportunity.',
      fear_desc: 'Investors are worried. Cautious approach recommended.',
      neutral_desc: 'Market is balanced. Watch for directional signals.',
      greed_desc: 'Investors are optimistic. Watch for overbought conditions.',
      extreme_greed_desc: 'Market is overheated. Consider potential corrections.',
    },
  };

  const t = texts[language];

  if (loading || !result) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Gauge className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-zinc-400 font-medium">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLevelIcon = (level: FearGreedResult['level']) => {
    switch (level) {
      case 'extreme_fear': return Skull;
      case 'fear': return AlertTriangle;
      case 'neutral': return Meh;
      case 'greed': return Smile;
      case 'extreme_greed': return Sparkles;
    }
  };

  const getLevelColor = (level: FearGreedResult['level']) => {
    switch (level) {
      case 'extreme_fear': return '#ef4444';
      case 'fear': return '#f97316';
      case 'neutral': return '#fbbf24';
      case 'greed': return '#22c55e';
      case 'extreme_greed': return '#10b981';
    }
  };

  const getLevelGradient = (level: FearGreedResult['level']) => {
    switch (level) {
      case 'extreme_fear': return 'from-red-500/30 to-red-500/10';
      case 'fear': return 'from-orange-500/30 to-orange-500/10';
      case 'neutral': return 'from-yellow-500/30 to-yellow-500/10';
      case 'greed': return 'from-green-500/30 to-green-500/10';
      case 'extreme_greed': return 'from-emerald-500/30 to-emerald-500/10';
    }
  };

  const getDescription = (level: FearGreedResult['level']) => {
    switch (level) {
      case 'extreme_fear': return t.extreme_fear_desc;
      case 'fear': return t.fear_desc;
      case 'neutral': return t.neutral_desc;
      case 'greed': return t.greed_desc;
      case 'extreme_greed': return t.extreme_greed_desc;
    }
  };

  const Icon = getLevelIcon(result.level);
  const levelColor = getLevelColor(result.level);

  const factorIcons = {
    volatility: TrendingUp,
    momentum: Activity,
    volume: BarChart3,
    buyPressure: Droplets,
  };

  const getFactorColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${getLevelGradient(result.level)} pointer-events-none`} />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Gauge className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Main Score Display */}
        <div className="flex flex-col items-center py-4">
          {/* Circular Gauge */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#3f3f46"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={levelColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${result.score * 2.64} ${264 - result.score * 2.64}`}
                className="transition-all duration-1000"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Icon className="h-8 w-8 mb-1" style={{ color: levelColor }} />
              <span className="text-4xl font-black" style={{ color: levelColor }}>
                {result.score}
              </span>
            </div>
          </div>

          {/* Level Badge */}
          <Badge
            className="mt-4 text-sm px-4 py-1"
            style={{ backgroundColor: `${levelColor}30`, color: levelColor }}
          >
            {t[result.level]}
          </Badge>

          {/* Scale */}
          <div className="flex justify-between w-full mt-4 px-4">
            <span className="text-xs text-red-400">0</span>
            <span className="text-xs text-orange-400">25</span>
            <span className="text-xs text-yellow-400">50</span>
            <span className="text-xs text-green-400">75</span>
            <span className="text-xs text-emerald-400">100</span>
          </div>
          <div className="flex w-full h-2 rounded-full overflow-hidden mt-1 px-4">
            <div className="flex-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
            <div className="flex-1 bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-500" />
          </div>
        </div>

        {/* Factors */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(result.factors) as Array<keyof typeof result.factors>).map((key) => {
            const factor = result.factors[key];
            const FactorIcon = factorIcons[key];
            return (
              <div key={key} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FactorIcon className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs text-zinc-400">{t[key]}</span>
                  </div>
                  <span className={`text-sm font-bold ${getFactorColor(factor.score)}`}>
                    {factor.score}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${factor.score}%`,
                      backgroundColor: factor.score >= 50 ? '#22c55e' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interpretation */}
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <h4 className="text-xs font-medium text-zinc-400 mb-2">{t.interpretation}</h4>
          <p className="text-sm text-zinc-300">{getDescription(result.level)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
