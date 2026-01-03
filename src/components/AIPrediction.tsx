'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface PredictionData {
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

interface PredictionResult {
  shortTerm: {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    targetPrice: number;
    range: { low: number; high: number };
  };
  mediumTerm: {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    targetPrice: number;
    range: { low: number; high: number };
  };
  keyLevels: {
    support: number;
    resistance: number;
    pivot: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
}

function generatePrediction(data: PredictionData): PredictionResult {
  const currentPrice = parseFloat(data.priceUsd);
  const priceChange24h = data.priceChange24h || 0;
  const priceChange1h = data.priceChange?.h1 || 0;
  const priceChange6h = data.priceChange?.h6 || 0;
  const volume24h = data.volume?.h24 || 0;
  const liquidity = data.liquidity?.usd || 0;
  const buys = data.txns?.h24?.buys || 0;
  const sells = data.txns?.h24?.sells || 0;
  const totalTxns = buys + sells;
  const buyRatio = totalTxns > 0 ? buys / totalTxns : 0.5;

  // Calculate momentum score
  const momentum = priceChange1h - (priceChange6h / 6);

  // Calculate trend strength
  const trendStrength = (
    (priceChange1h > 0 ? 1 : -1) +
    (priceChange6h > 0 ? 1 : -1) +
    (priceChange24h > 0 ? 1 : -1)
  ) / 3;

  // Volume analysis
  const avgVolume = 40000000;
  const volumeRatio = volume24h / avgVolume;

  // Short-term prediction (1-4 hours)
  let shortTermScore = 0;
  shortTermScore += momentum > 0 ? 20 : momentum < 0 ? -20 : 0;
  shortTermScore += (buyRatio - 0.5) * 60;
  shortTermScore += priceChange1h * 5;
  shortTermScore += volumeRatio > 1.2 ? 10 : volumeRatio < 0.8 ? -10 : 0;

  const shortTermDirection: 'up' | 'down' | 'neutral' =
    shortTermScore > 15 ? 'up' : shortTermScore < -15 ? 'down' : 'neutral';
  const shortTermConfidence = Math.min(85, Math.max(40, 50 + Math.abs(shortTermScore)));

  const shortTermChange = shortTermDirection === 'up'
    ? Math.min(5, Math.abs(shortTermScore) * 0.1)
    : shortTermDirection === 'down'
    ? -Math.min(5, Math.abs(shortTermScore) * 0.1)
    : 0;
  const shortTermTarget = currentPrice * (1 + shortTermChange / 100);

  // Medium-term prediction (1-7 days)
  let mediumTermScore = 0;
  mediumTermScore += trendStrength * 30;
  mediumTermScore += (buyRatio - 0.5) * 40;
  mediumTermScore += priceChange24h * 2;
  mediumTermScore += volumeRatio > 1.3 ? 15 : volumeRatio < 0.7 ? -15 : 0;
  mediumTermScore += liquidity > 350000000 ? 10 : liquidity < 300000000 ? -10 : 0;

  const mediumTermDirection: 'up' | 'down' | 'neutral' =
    mediumTermScore > 20 ? 'up' : mediumTermScore < -20 ? 'down' : 'neutral';
  const mediumTermConfidence = Math.min(75, Math.max(35, 45 + Math.abs(mediumTermScore) * 0.5));

  const mediumTermChange = mediumTermDirection === 'up'
    ? Math.min(15, Math.abs(mediumTermScore) * 0.2)
    : mediumTermDirection === 'down'
    ? -Math.min(15, Math.abs(mediumTermScore) * 0.2)
    : 0;
  const mediumTermTarget = currentPrice * (1 + mediumTermChange / 100);

  // Key levels calculation
  const volatility = Math.abs(priceChange24h) / 100;
  const support = currentPrice * (1 - (0.02 + volatility));
  const resistance = currentPrice * (1 + (0.02 + volatility));
  const pivot = (support + resistance + currentPrice) / 3;

  // Risk level
  const riskScore =
    Math.abs(priceChange24h) > 10 ? 30 : 0 +
    volumeRatio < 0.6 ? 25 : 0 +
    liquidity < 300000000 ? 25 : 0 +
    Math.abs(buyRatio - 0.5) > 0.2 ? 20 : 0;

  const riskLevel: 'low' | 'medium' | 'high' =
    riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low';

  return {
    shortTerm: {
      direction: shortTermDirection,
      confidence: shortTermConfidence,
      targetPrice: shortTermTarget,
      range: {
        low: shortTermTarget * 0.98,
        high: shortTermTarget * 1.02,
      },
    },
    mediumTerm: {
      direction: mediumTermDirection,
      confidence: mediumTermConfidence,
      targetPrice: mediumTermTarget,
      range: {
        low: mediumTermTarget * 0.95,
        high: mediumTermTarget * 1.05,
      },
    },
    keyLevels: {
      support,
      resistance,
      pivot,
    },
    riskLevel,
  };
}

interface AIPredictionProps {
  data: PredictionData | null;
  loading?: boolean;
}

export function AIPrediction({ data, loading }: AIPredictionProps) {
  const { language } = useLanguage();

  const prediction = useMemo(() => {
    if (!data) return null;
    return generatePrediction(data);
  }, [data]);

  const texts = {
    ko: {
      title: 'AI 가격 예측',
      subtitle: '시장 데이터 기반 단기/중기 가격 전망',
      shortTerm: '단기 전망',
      shortTermDesc: '1-4시간',
      mediumTerm: '중기 전망',
      mediumTermDesc: '1-7일',
      keyLevels: '주요 가격대',
      support: '지지선',
      resistance: '저항선',
      pivot: '피봇',
      targetPrice: '목표가',
      confidence: '신뢰도',
      range: '예상 범위',
      riskLevel: '리스크',
      low: '낮음',
      medium: '보통',
      high: '높음',
      up: '상승',
      down: '하락',
      neutral: '횡보',
      loading: '예측 생성 중...',
      disclaimer: '* AI 예측은 과거 데이터 기반이며 투자 조언이 아닙니다',
      currentPrice: '현재가',
    },
    en: {
      title: 'AI Price Prediction',
      subtitle: 'Short-term and medium-term price outlook based on market data',
      shortTerm: 'Short Term',
      shortTermDesc: '1-4 Hours',
      mediumTerm: 'Medium Term',
      mediumTermDesc: '1-7 Days',
      keyLevels: 'Key Levels',
      support: 'Support',
      resistance: 'Resistance',
      pivot: 'Pivot',
      targetPrice: 'Target',
      confidence: 'Confidence',
      range: 'Range',
      riskLevel: 'Risk',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      up: 'Bullish',
      down: 'Bearish',
      neutral: 'Neutral',
      loading: 'Generating prediction...',
      disclaimer: '* AI predictions are based on historical data and not investment advice',
      currentPrice: 'Current',
    },
  };

  const t = texts[language];

  if (loading || !prediction || !data) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-zinc-400 font-medium">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = parseFloat(data.priceUsd);

  const getDirectionIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getDirectionColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  const getDirectionBg = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'bg-green-500/20 border-green-500/40';
      case 'down': return 'bg-red-500/20 border-red-500/40';
      default: return 'bg-amber-500/20 border-amber-500/40';
    }
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (target: number, current: number) => {
    const change = ((target - current) / current) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const ShortIcon = getDirectionIcon(prediction.shortTerm.direction);
  const MediumIcon = getDirectionIcon(prediction.mediumTerm.direction);

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Target className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Price */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <span className="text-sm text-zinc-400">{t.currentPrice}</span>
          <span className="text-xl font-bold text-white">{formatPrice(currentPrice)}</span>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Short Term */}
          <div className={`p-4 rounded-lg border ${getDirectionBg(prediction.shortTerm.direction)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span className="font-medium text-sm">{t.shortTerm}</span>
              </div>
              <Badge variant="outline" className={getDirectionColor(prediction.shortTerm.direction)}>
                <ShortIcon className="h-3 w-3 mr-1" />
                {t[prediction.shortTerm.direction]}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mb-3">{t.shortTermDesc}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{t.targetPrice}</span>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getDirectionColor(prediction.shortTerm.direction)}`}>
                    {formatPrice(prediction.shortTerm.targetPrice)}
                  </span>
                  <span className={`text-xs ml-2 ${getDirectionColor(prediction.shortTerm.direction)}`}>
                    {formatChange(prediction.shortTerm.targetPrice, currentPrice)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{t.confidence}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${prediction.shortTerm.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-cyan-400">
                    {prediction.shortTerm.confidence.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{t.range}</span>
                <span className="text-xs text-zinc-400">
                  {formatPrice(prediction.shortTerm.range.low)} - {formatPrice(prediction.shortTerm.range.high)}
                </span>
              </div>
            </div>
          </div>

          {/* Medium Term */}
          <div className={`p-4 rounded-lg border ${getDirectionBg(prediction.mediumTerm.direction)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-zinc-400" />
                <span className="font-medium text-sm">{t.mediumTerm}</span>
              </div>
              <Badge variant="outline" className={getDirectionColor(prediction.mediumTerm.direction)}>
                <MediumIcon className="h-3 w-3 mr-1" />
                {t[prediction.mediumTerm.direction]}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mb-3">{t.mediumTermDesc}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{t.targetPrice}</span>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getDirectionColor(prediction.mediumTerm.direction)}`}>
                    {formatPrice(prediction.mediumTerm.targetPrice)}
                  </span>
                  <span className={`text-xs ml-2 ${getDirectionColor(prediction.mediumTerm.direction)}`}>
                    {formatChange(prediction.mediumTerm.targetPrice, currentPrice)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{t.confidence}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${prediction.mediumTerm.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-400">
                    {prediction.mediumTerm.confidence.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{t.range}</span>
                <span className="text-xs text-zinc-400">
                  {formatPrice(prediction.mediumTerm.range.low)} - {formatPrice(prediction.mediumTerm.range.high)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Levels */}
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t.keyLevels}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-xs text-zinc-500 mb-1">{t.support}</p>
              <p className="text-sm font-bold text-red-400">{formatPrice(prediction.keyLevels.support)}</p>
            </div>
            <div className="text-center p-2 bg-zinc-700/50 rounded-lg border border-zinc-600">
              <p className="text-xs text-zinc-500 mb-1">{t.pivot}</p>
              <p className="text-sm font-bold text-zinc-300">{formatPrice(prediction.keyLevels.pivot)}</p>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-xs text-zinc-500 mb-1">{t.resistance}</p>
              <p className="text-sm font-bold text-green-400">{formatPrice(prediction.keyLevels.resistance)}</p>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">{t.riskLevel}</span>
          </div>
          <Badge className={getRiskColor(prediction.riskLevel)}>
            {t[prediction.riskLevel]}
          </Badge>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-zinc-600 text-center">{t.disclaimer}</p>
      </CardContent>
    </Card>
  );
}
