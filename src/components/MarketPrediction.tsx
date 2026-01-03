'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Brain,
  Shield,
  Activity,
  BarChart3,
  Calendar,
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

interface MarketPredictionProps {
  data: PredictionData | null;
  loading?: boolean;
}

interface TimeframePrediction {
  timeframe: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  priceTarget: number;
  supportLevel: number;
  resistanceLevel: number;
  riskReward: number;
}

export function MarketPrediction({ data, loading }: MarketPredictionProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'AI 시장 예측',
      description: '머신러닝 기반 가격 예측 분석',
      shortTerm: '단기 (1-4시간)',
      mediumTerm: '중기 (1-7일)',
      longTerm: '장기 (1-4주)',
      confidence: '신뢰도',
      priceTarget: '목표가',
      support: '지지선',
      resistance: '저항선',
      riskReward: '손익비',
      bullish: '강세',
      bearish: '약세',
      neutral: '중립',
      recommendation: '추천',
      hold: '홀드',
      buy: '매수 검토',
      sell: '매도 검토',
      strongBuy: '강력 매수',
      strongSell: '강력 매도',
      marketCondition: '시장 상태',
      volatility: '변동성',
      high: '높음',
      medium: '보통',
      low: '낮음',
      disclaimer: '이 분석은 참고용이며 투자 조언이 아닙니다.',
      loading: '로딩 중...',
      scenarios: '시나리오 분석',
      bestCase: '낙관적',
      baseCase: '기본',
      worstCase: '비관적',
      probability: '확률',
      keyFactors: '주요 영향 요인',
      positiveFactor: '긍정 요인',
      negativeFactor: '부정 요인',
      overallScore: '종합 점수',
    },
    en: {
      title: 'AI Market Prediction',
      description: 'ML-based price prediction analysis',
      shortTerm: 'Short-term (1-4h)',
      mediumTerm: 'Medium-term (1-7d)',
      longTerm: 'Long-term (1-4w)',
      confidence: 'Confidence',
      priceTarget: 'Price Target',
      support: 'Support',
      resistance: 'Resistance',
      riskReward: 'Risk/Reward',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      recommendation: 'Recommendation',
      hold: 'Hold',
      buy: 'Consider Buy',
      sell: 'Consider Sell',
      strongBuy: 'Strong Buy',
      strongSell: 'Strong Sell',
      marketCondition: 'Market Condition',
      volatility: 'Volatility',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      disclaimer: 'This analysis is for reference only, not investment advice.',
      loading: 'Loading...',
      scenarios: 'Scenario Analysis',
      bestCase: 'Best Case',
      baseCase: 'Base Case',
      worstCase: 'Worst Case',
      probability: 'Probability',
      keyFactors: 'Key Factors',
      positiveFactor: 'Positive',
      negativeFactor: 'Negative',
      overallScore: 'Overall Score',
    },
  };

  const t = texts[language];

  const predictions = useMemo(() => {
    if (!data) return null;

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

    // Calculate momentum
    const momentum = priceChange1h - (priceChange6h / 6);

    // Volume analysis
    const avgVolume = 40000000;
    const volumeRatio = volume24h / avgVolume;

    // Trend strength
    const trendStrength = (
      (priceChange1h > 0 ? 1 : -1) +
      (priceChange6h > 0 ? 1 : -1) +
      (priceChange24h > 0 ? 1 : -1)
    ) / 3;

    // Short-term prediction (1-4 hours)
    let shortTermScore = 0;
    shortTermScore += momentum > 0.5 ? 25 : momentum > 0 ? 15 : momentum > -0.5 ? -15 : -25;
    shortTermScore += (buyRatio - 0.5) * 50;
    shortTermScore += priceChange1h * 3;
    shortTermScore += volumeRatio > 1.3 ? 10 : volumeRatio < 0.7 ? -10 : 0;

    const shortTermDirection = shortTermScore > 15 ? 'bullish' : shortTermScore < -15 ? 'bearish' : 'neutral';
    const shortTermConfidence = Math.min(85, Math.max(35, 50 + Math.abs(shortTermScore) * 0.5));
    const shortTermChange = shortTermDirection === 'bullish' ? Math.min(3, Math.abs(shortTermScore) * 0.05) :
                            shortTermDirection === 'bearish' ? -Math.min(3, Math.abs(shortTermScore) * 0.05) : 0;

    // Medium-term prediction (1-7 days)
    let mediumTermScore = 0;
    mediumTermScore += trendStrength * 20;
    mediumTermScore += priceChange24h > 5 ? 20 : priceChange24h > 0 ? 10 : priceChange24h > -5 ? -10 : -20;
    mediumTermScore += (buyRatio - 0.5) * 30;
    mediumTermScore += volumeRatio > 1.2 ? 10 : volumeRatio < 0.8 ? -10 : 0;
    mediumTermScore += liquidity > 400000000 ? 10 : liquidity < 300000000 ? -10 : 0;

    const mediumTermDirection = mediumTermScore > 15 ? 'bullish' : mediumTermScore < -15 ? 'bearish' : 'neutral';
    const mediumTermConfidence = Math.min(80, Math.max(30, 45 + Math.abs(mediumTermScore) * 0.4));
    const mediumTermChange = mediumTermDirection === 'bullish' ? Math.min(10, Math.abs(mediumTermScore) * 0.15) :
                             mediumTermDirection === 'bearish' ? -Math.min(10, Math.abs(mediumTermScore) * 0.15) : 0;

    // Long-term prediction (1-4 weeks)
    let longTermScore = 0;
    longTermScore += trendStrength * 15;
    longTermScore += priceChange24h > 0 ? 15 : -15;
    longTermScore += liquidity > 350000000 ? 15 : liquidity < 300000000 ? -15 : 0;
    longTermScore += volumeRatio > 1 ? 10 : -10;

    const longTermDirection = longTermScore > 10 ? 'bullish' : longTermScore < -10 ? 'bearish' : 'neutral';
    const longTermConfidence = Math.min(70, Math.max(25, 40 + Math.abs(longTermScore) * 0.3));
    const longTermChange = longTermDirection === 'bullish' ? Math.min(20, Math.abs(longTermScore) * 0.3) :
                           longTermDirection === 'bearish' ? -Math.min(20, Math.abs(longTermScore) * 0.3) : 0;

    // Calculate support and resistance levels
    const volatility = Math.abs(priceChange24h) * 0.5;
    const shortSupport = currentPrice * (1 - volatility / 100 - 0.01);
    const shortResistance = currentPrice * (1 + volatility / 100 + 0.01);
    const mediumSupport = currentPrice * (1 - volatility / 100 - 0.03);
    const mediumResistance = currentPrice * (1 + volatility / 100 + 0.03);
    const longSupport = currentPrice * (1 - volatility / 100 - 0.08);
    const longResistance = currentPrice * (1 + volatility / 100 + 0.08);

    // Overall recommendation
    const overallScore = (shortTermScore * 0.3 + mediumTermScore * 0.4 + longTermScore * 0.3);
    let recommendation = 'hold';
    if (overallScore > 30) recommendation = 'strongBuy';
    else if (overallScore > 15) recommendation = 'buy';
    else if (overallScore < -30) recommendation = 'strongSell';
    else if (overallScore < -15) recommendation = 'sell';

    // Volatility assessment
    const volatilityLevel = Math.abs(priceChange24h) > 10 ? 'high' : Math.abs(priceChange24h) > 5 ? 'medium' : 'low';

    // Scenario analysis
    const scenarios = {
      best: {
        probability: shortTermDirection === 'bullish' ? 35 : 20,
        priceChange: Math.abs(shortTermChange) * 2 + 5,
      },
      base: {
        probability: 45,
        priceChange: shortTermChange,
      },
      worst: {
        probability: shortTermDirection === 'bearish' ? 35 : 20,
        priceChange: -Math.abs(shortTermChange) * 2 - 5,
      },
    };

    // Key factors
    const positiveFactors = [];
    const negativeFactors = [];

    if (buyRatio > 0.55) positiveFactors.push(language === 'ko' ? '매수 우위' : 'Buy dominance');
    if (volumeRatio > 1.2) positiveFactors.push(language === 'ko' ? '거래량 증가' : 'Volume increase');
    if (momentum > 0.5) positiveFactors.push(language === 'ko' ? '상승 모멘텀' : 'Upward momentum');
    if (liquidity > 350000000) positiveFactors.push(language === 'ko' ? '높은 유동성' : 'High liquidity');
    if (priceChange24h > 5) positiveFactors.push(language === 'ko' ? '강한 상승세' : 'Strong uptrend');

    if (buyRatio < 0.45) negativeFactors.push(language === 'ko' ? '매도 우위' : 'Sell dominance');
    if (volumeRatio < 0.8) negativeFactors.push(language === 'ko' ? '거래량 감소' : 'Volume decrease');
    if (momentum < -0.5) negativeFactors.push(language === 'ko' ? '하락 모멘텀' : 'Downward momentum');
    if (priceChange24h < -5) negativeFactors.push(language === 'ko' ? '강한 하락세' : 'Strong downtrend');

    return {
      currentPrice,
      shortTerm: {
        direction: shortTermDirection as 'bullish' | 'bearish' | 'neutral',
        confidence: shortTermConfidence,
        priceTarget: currentPrice * (1 + shortTermChange / 100),
        support: shortSupport,
        resistance: shortResistance,
        riskReward: Math.abs(shortTermChange) > 0 ? Math.abs((shortResistance - currentPrice) / (currentPrice - shortSupport)) : 1,
      },
      mediumTerm: {
        direction: mediumTermDirection as 'bullish' | 'bearish' | 'neutral',
        confidence: mediumTermConfidence,
        priceTarget: currentPrice * (1 + mediumTermChange / 100),
        support: mediumSupport,
        resistance: mediumResistance,
        riskReward: Math.abs(mediumTermChange) > 0 ? Math.abs((mediumResistance - currentPrice) / (currentPrice - mediumSupport)) : 1,
      },
      longTerm: {
        direction: longTermDirection as 'bullish' | 'bearish' | 'neutral',
        confidence: longTermConfidence,
        priceTarget: currentPrice * (1 + longTermChange / 100),
        support: longSupport,
        resistance: longResistance,
        riskReward: Math.abs(longTermChange) > 0 ? Math.abs((longResistance - currentPrice) / (currentPrice - longSupport)) : 1,
      },
      recommendation,
      volatilityLevel,
      overallScore: Math.round((overallScore + 50) / 100 * 100),
      scenarios,
      positiveFactors,
      negativeFactors,
    };
  }, [data, language]);

  const getDirectionColor = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getDirectionBg = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish': return 'bg-green-500/10 border-green-500/20';
      case 'bearish': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getDirectionIcon = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strongBuy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'buy': return 'bg-green-500/10 text-green-300 border-green-500/20';
      case 'strongSell': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'sell': return 'bg-red-500/10 text-red-300 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  if (loading || !predictions) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">{t.loading}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeframePredictions = [
    { key: 'shortTerm', label: t.shortTerm, data: predictions.shortTerm, icon: <Clock className="h-4 w-4" /> },
    { key: 'mediumTerm', label: t.mediumTerm, data: predictions.mediumTerm, icon: <Calendar className="h-4 w-4" /> },
    { key: 'longTerm', label: t.longTerm, data: predictions.longTerm, icon: <Target className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Score & Recommendation */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                {t.title}
              </CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={getRecommendationColor(predictions.recommendation)}
            >
              {(t as Record<string, string>)[predictions.recommendation]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Overall Score */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t.overallScore}</span>
              </div>
              <div className="text-3xl font-bold text-primary">{predictions.overallScore}</div>
              <Progress value={predictions.overallScore} className="mt-2 h-2" />
            </div>

            {/* Volatility */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t.volatility}</span>
              </div>
              <div className={`text-xl font-bold ${
                predictions.volatilityLevel === 'high' ? 'text-red-400' :
                predictions.volatilityLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {t[predictions.volatilityLevel as keyof typeof t]}
              </div>
            </div>

            {/* Current Price */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{language === 'ko' ? '현재가' : 'Current'}</span>
              </div>
              <div className="text-xl font-bold">${predictions.currentPrice.toFixed(6)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeframe Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeframePredictions.map(({ key, label, data, icon }) => (
          <Card key={key} className={`border ${getDirectionBg(data.direction)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {icon}
                  {label}
                </CardTitle>
                <div className={`flex items-center gap-1 ${getDirectionColor(data.direction)}`}>
                  {getDirectionIcon(data.direction)}
                  <span className="text-sm font-medium">
                    {data.direction === 'bullish' ? t.bullish : data.direction === 'bearish' ? t.bearish : t.neutral}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-zinc-800/50">
                  <div className="text-muted-foreground">{t.priceTarget}</div>
                  <div className="font-medium">${data.priceTarget.toFixed(6)}</div>
                </div>
                <div className="p-2 rounded bg-zinc-800/50">
                  <div className="text-muted-foreground">{t.confidence}</div>
                  <div className="font-medium">{data.confidence.toFixed(0)}%</div>
                </div>
                <div className="p-2 rounded bg-zinc-800/50">
                  <div className="text-muted-foreground">{t.support}</div>
                  <div className="font-medium text-red-400">${data.support.toFixed(6)}</div>
                </div>
                <div className="p-2 rounded bg-zinc-800/50">
                  <div className="text-muted-foreground">{t.resistance}</div>
                  <div className="font-medium text-green-400">${data.resistance.toFixed(6)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t.riskReward}</span>
                <span className="font-medium">1:{data.riskReward.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Factors */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            {t.keyFactors}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t.positiveFactor}
              </div>
              {predictions.positiveFactors.length > 0 ? (
                predictions.positiveFactors.map((factor, i) => (
                  <div key={i} className="text-sm p-2 rounded bg-green-500/10 border border-green-500/20">
                    {factor}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-2">-</div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-400 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                {t.negativeFactor}
              </div>
              {predictions.negativeFactors.length > 0 ? (
                predictions.negativeFactors.map((factor, i) => (
                  <div key={i} className="text-sm p-2 rounded bg-red-500/10 border border-red-500/20">
                    {factor}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-2">-</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        {t.disclaimer}
      </div>
    </div>
  );
}
