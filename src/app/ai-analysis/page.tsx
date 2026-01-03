'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MarketSentiment } from '@/components/MarketSentiment';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { AIVisualizationCharts } from '@/components/AIVisualizationCharts';
import { AIPrediction } from '@/components/AIPrediction';
import { FearGreedIndex } from '@/components/FearGreedIndex';
import { TradingSignals } from '@/components/TradingSignals';
import { MarketPrediction } from '@/components/MarketPrediction';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, RefreshCw, Clock, ArrowLeft, BarChart3, Info, TrendingUp, Activity, Zap, Gauge, Droplets, ArrowUpRight, ArrowDownRight, Target, Waves, Crosshair, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ProtectedPage } from '@/hooks/usePagePermission';

interface TokenData {
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

// Advanced analysis calculations
function calculateAdvancedIndicators(data: TokenData | null) {
  if (!data) return null;

  const priceChange24h = data.priceChange24h || 0;
  const priceChange1h = data.priceChange?.h1 || 0;
  const priceChange6h = data.priceChange?.h6 || 0;
  const volume24h = data.volume?.h24 || 0;
  const liquidity = data.liquidity?.usd || 0;
  const buys = data.txns?.h24?.buys || 0;
  const sells = data.txns?.h24?.sells || 0;
  const totalTxns = buys + sells;

  // Momentum (short-term price acceleration)
  const momentum = priceChange1h - (priceChange6h / 6);
  const momentumScore = Math.max(-100, Math.min(100, momentum * 20));
  const momentumLabel = momentum > 1 ? 'strong_up' : momentum > 0.3 ? 'up' : momentum > -0.3 ? 'neutral' : momentum > -1 ? 'down' : 'strong_down';

  // Volume Strength (compared to average)
  const avgDailyVolume = 40000000;
  const volumeRatio = volume24h / avgDailyVolume;
  const volumeScore = Math.max(0, Math.min(100, volumeRatio * 50));
  const volumeLabel = volumeRatio > 1.5 ? 'very_high' : volumeRatio > 1.2 ? 'high' : volumeRatio > 0.8 ? 'normal' : volumeRatio > 0.5 ? 'low' : 'very_low';

  // Buy/Sell Pressure
  const buyRatio = totalTxns > 0 ? (buys / totalTxns) * 100 : 50;
  const buyPressure = buyRatio - 50; // -50 to +50
  const pressureScore = buyPressure * 2; // -100 to +100
  const pressureLabel = buyPressure > 10 ? 'strong_buy' : buyPressure > 3 ? 'buy' : buyPressure > -3 ? 'neutral' : buyPressure > -10 ? 'sell' : 'strong_sell';

  // Liquidity Health
  const healthyLiquidity = 350000000;
  const liquidityRatio = liquidity / healthyLiquidity;
  const liquidityScore = Math.max(0, Math.min(100, liquidityRatio * 100));
  const liquidityLabel = liquidityRatio > 1.1 ? 'excellent' : liquidityRatio > 0.9 ? 'good' : liquidityRatio > 0.7 ? 'moderate' : 'low';

  // Market Health (composite score)
  const marketHealthScore = Math.round(
    (volumeScore * 0.3) +
    ((buyRatio) * 0.3) +
    (liquidityScore * 0.2) +
    ((priceChange24h > 0 ? Math.min(priceChange24h * 5, 20) : Math.max(priceChange24h * 5, -20)) + 50) * 0.2
  );

  // Trend Strength (based on price consistency across timeframes)
  const trendConsistency =
    (priceChange1h > 0 ? 1 : -1) +
    (priceChange6h > 0 ? 1 : -1) +
    (priceChange24h > 0 ? 1 : -1);
  const trendStrength = Math.abs(trendConsistency) / 3 * 100;
  const trendDirection = trendConsistency > 0 ? 'bullish' : trendConsistency < 0 ? 'bearish' : 'mixed';

  return {
    momentum: { score: momentumScore, label: momentumLabel, value: momentum },
    volume: { score: volumeScore, label: volumeLabel, ratio: volumeRatio, value: volume24h },
    pressure: { score: pressureScore, label: pressureLabel, buyRatio, buys, sells, total: totalTxns },
    liquidity: { score: liquidityScore, label: liquidityLabel, ratio: liquidityRatio, value: liquidity },
    marketHealth: { score: marketHealthScore },
    trend: { strength: trendStrength, direction: trendDirection, consistency: trendConsistency },
    priceChanges: { h1: priceChange1h, h6: priceChange6h, h24: priceChange24h },
  };
}

export default function AIAnalysisPage() {
  const { language } = useLanguage();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const indicators = useMemo(() => calculateAdvancedIndicators(tokenData), [tokenData]);

  // Calculate AI score for visualization
  const aiAnalysis = useMemo(() => {
    if (!tokenData) return { score: 0, level: 'neutral' as const };

    const priceChange24h = tokenData.priceChange24h || 0;
    const priceChange1h = tokenData.priceChange?.h1 || 0;
    const priceChange6h = tokenData.priceChange?.h6 || 0;
    const volume24h = tokenData.volume?.h24 || 0;
    const liquidity = tokenData.liquidity?.usd || 0;
    const buys = tokenData.txns?.h24?.buys || 0;
    const sells = tokenData.txns?.h24?.sells || 0;
    const totalTxns = buys + sells;
    const avgVolume = 40000000;
    const healthyLiquidity = 350000000;

    let score = 0;

    // Price change score
    if (priceChange24h > 10) score += 25;
    else if (priceChange24h > 5) score += 20;
    else if (priceChange24h > 2) score += 15;
    else if (priceChange24h > 0) score += 10;
    else if (priceChange24h > -2) score += 0;
    else if (priceChange24h > -5) score -= 10;
    else if (priceChange24h > -10) score -= 20;
    else score -= 25;

    // Momentum
    const momentum = priceChange1h - (priceChange6h / 6);
    if (momentum > 0.5) score += 10;
    else if (momentum < -0.5) score -= 10;

    // Volume score
    const volumeRatio = volume24h / avgVolume;
    if (volumeRatio > 1.5) score += 15;
    else if (volumeRatio > 1.2) score += 10;
    else if (volumeRatio > 0.8) score += 5;
    else if (volumeRatio > 0.5) score -= 5;
    else score -= 10;

    // Buy ratio score
    const buyRatio = totalTxns > 0 ? (buys / totalTxns) * 100 : 50;
    if (buyRatio > 60) score += 20;
    else if (buyRatio > 55) score += 15;
    else if (buyRatio > 50) score += 5;
    else if (buyRatio > 45) score -= 5;
    else if (buyRatio > 40) score -= 15;
    else score -= 20;

    // Liquidity score
    const liquidityRatio = liquidity / healthyLiquidity;
    if (liquidityRatio > 1.1) score += 15;
    else if (liquidityRatio > 0.9) score += 10;
    else if (liquidityRatio > 0.7) score += 0;
    else score -= 10;

    score = Math.max(-100, Math.min(100, score));

    let level: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
    if (score >= 40) level = 'very_bullish';
    else if (score >= 15) level = 'bullish';
    else if (score >= -15) level = 'neutral';
    else if (score >= -40) level = 'bearish';
    else level = 'very_bearish';

    return { score, level };
  }, [tokenData]);

  const texts = {
    ko: {
      title: 'AI 시장 분석',
      subtitle: 'AI 기반 실시간 시장 분석 및 전망',
      back: '홈으로',
      viewAnalysis: '상세 분석 보기',
      lastUpdated: '마지막 업데이트',
      autoRefresh: '자동 갱신',
      refresh: '새로고침',
      loading: 'AI 분석 중...',
      liveData: '실시간',
      overview: '개요',
      prediction: '예측',
      signals: '시그널',
      sentiment: '심리',
      tabOverview: '개요',
      tabPrediction: 'AI 예측',
      tabSignals: '매매 시그널',
      tabSentiment: '공포/탐욕',
      howItWorks: 'AI 점수 계산 방식',
      howItWorksDesc: '4가지 요소를 분석하여 -100 ~ +100 사이의 점수를 산출합니다',
      factor1Title: '가격 변동률 (30%)',
      factor1Desc: '24시간 가격 변화를 분석하여 시장 추세를 파악합니다.',
      factor2Title: '거래량 (25%)',
      factor2Desc: '평균 대비 현재 거래량을 비교하여 시장 활성도를 측정합니다.',
      factor3Title: '매수/매도 비율 (25%)',
      factor3Desc: '매수와 매도 거래 비율을 분석하여 시장 심리를 파악합니다.',
      factor4Title: '유동성 (20%)',
      factor4Desc: '풀의 유동성 상태를 분석하여 거래 안정성을 평가합니다.',
      scoreRanges: '점수 범위',
      veryBullish: '매우 강세 (+40 ~ +100)',
      bullish: '상승세 (+15 ~ +39)',
      neutral: '중립 (-14 ~ +14)',
      bearish: '하락세 (-39 ~ -15)',
      veryBearish: '매우 약세 (-100 ~ -40)',
      disclaimer: '* 본 분석은 LGNS 온체인 데이터를 기반으로 한 참고 자료이며, 투자 결정은 신중하게 하시기 바랍니다.',
      advancedIndicators: '고급 분석 지표',
      advancedDesc: '실시간 시장 데이터 기반 심층 분석',
      momentum: '모멘텀',
      momentumDesc: '단기 가격 가속도',
      volumeStrength: '거래량 강도',
      volumeStrengthDesc: '평균 대비 거래 활성도',
      buyPressure: '매수 압력',
      buyPressureDesc: '매수/매도 비율 분석',
      liquidityHealth: '유동성 상태',
      liquidityHealthDesc: '거래 안정성 지표',
      marketHealth: '시장 건전성',
      marketHealthDesc: '종합 시장 상태',
      trendStrength: '추세 강도',
      trendStrengthDesc: '가격 방향 일관성',
      priceTimeframes: '시간대별 가격 변동',
      h1: '1시간',
      h6: '6시간',
      h24: '24시간',
      strong_up: '급상승',
      up: '상승',
      down: '하락',
      strong_down: '급하락',
      very_high: '매우 높음',
      high: '높음',
      normal: '보통',
      low: '낮음',
      very_low: '매우 낮음',
      strong_buy: '강한 매수세',
      buy: '매수 우세',
      sell: '매도 우세',
      strong_sell: '강한 매도세',
      excellent: '매우 양호',
      good: '양호',
      moderate: '보통',
      bullishTrend: '상승 추세',
      bearishTrend: '하락 추세',
      mixedTrend: '혼조세',
      transactions: '거래',
      // New AI features
      aiRiskAssessment: 'AI 리스크 평가',
      aiRiskDesc: '시장 데이터 기반 투자 위험도 분석',
      riskLevel: '위험 수준',
      riskLow: '낮음',
      riskMedium: '보통',
      riskHigh: '높음',
      riskVeryHigh: '매우 높음',
      volatilityRisk: '변동성 위험',
      liquidityRisk: '유동성 위험',
      marketRisk: '시장 위험',
      aiPriceTargets: 'AI 가격 예측',
      aiPriceTargetsDesc: 'AI 기반 단기/중기 가격 목표',
      shortTerm: '단기 (24H)',
      mediumTerm: '중기 (7D)',
      supportLevel: '지지선',
      resistanceLevel: '저항선',
      aiConfidence: 'AI 신뢰도',
    },
    en: {
      title: 'AI Market Analysis',
      subtitle: 'AI-powered real-time market analysis and outlook',
      back: 'Home',
      viewAnalysis: 'View Detailed Analysis',
      lastUpdated: 'Last Updated',
      autoRefresh: 'Auto Refresh',
      refresh: 'Refresh',
      loading: 'AI Analyzing...',
      liveData: 'Live',
      overview: 'Overview',
      prediction: 'Prediction',
      signals: 'Signals',
      sentiment: 'Sentiment',
      tabOverview: 'Overview',
      tabPrediction: 'AI Prediction',
      tabSignals: 'Trading Signals',
      tabSentiment: 'Fear/Greed',
      howItWorks: 'How AI Score Works',
      howItWorksDesc: 'We analyze 4 factors to calculate a score between -100 and +100',
      factor1Title: 'Price Change (30%)',
      factor1Desc: 'Analyzes 24h price change to identify market trends.',
      factor2Title: 'Volume (25%)',
      factor2Desc: 'Compares current volume against average to measure market activity.',
      factor3Title: 'Buy/Sell Ratio (25%)',
      factor3Desc: 'Analyzes buy and sell transaction ratio to gauge market sentiment.',
      factor4Title: 'Liquidity (20%)',
      factor4Desc: 'Analyzes pool liquidity to evaluate trading stability.',
      scoreRanges: 'Score Ranges',
      veryBullish: 'Very Bullish (+40 ~ +100)',
      bullish: 'Bullish (+15 ~ +39)',
      neutral: 'Neutral (-14 ~ +14)',
      bearish: 'Bearish (-39 ~ -15)',
      veryBearish: 'Very Bearish (-100 ~ -40)',
      disclaimer: '* This analysis is based on LGNS on-chain data for reference only. Please make investment decisions carefully.',
      advancedIndicators: 'Advanced Indicators',
      advancedDesc: 'In-depth analysis based on real-time market data',
      momentum: 'Momentum',
      momentumDesc: 'Short-term price acceleration',
      volumeStrength: 'Volume Strength',
      volumeStrengthDesc: 'Trading activity vs average',
      buyPressure: 'Buy Pressure',
      buyPressureDesc: 'Buy/Sell ratio analysis',
      liquidityHealth: 'Liquidity Health',
      liquidityHealthDesc: 'Trading stability indicator',
      marketHealth: 'Market Health',
      marketHealthDesc: 'Overall market condition',
      trendStrength: 'Trend Strength',
      trendStrengthDesc: 'Price direction consistency',
      priceTimeframes: 'Price Changes by Timeframe',
      h1: '1 Hour',
      h6: '6 Hours',
      h24: '24 Hours',
      strong_up: 'Strong Up',
      up: 'Up',
      down: 'Down',
      strong_down: 'Strong Down',
      very_high: 'Very High',
      high: 'High',
      normal: 'Normal',
      low: 'Low',
      very_low: 'Very Low',
      strong_buy: 'Strong Buy',
      buy: 'Buy Dominant',
      sell: 'Sell Dominant',
      strong_sell: 'Strong Sell',
      excellent: 'Excellent',
      good: 'Good',
      moderate: 'Moderate',
      bullishTrend: 'Bullish',
      bearishTrend: 'Bearish',
      mixedTrend: 'Mixed',
      transactions: 'Txns',
      // New AI features
      aiRiskAssessment: 'AI Risk Assessment',
      aiRiskDesc: 'Investment risk analysis based on market data',
      riskLevel: 'Risk Level',
      riskLow: 'Low',
      riskMedium: 'Medium',
      riskHigh: 'High',
      riskVeryHigh: 'Very High',
      volatilityRisk: 'Volatility Risk',
      liquidityRisk: 'Liquidity Risk',
      marketRisk: 'Market Risk',
      aiPriceTargets: 'AI Price Targets',
      aiPriceTargetsDesc: 'AI-based short/medium term price targets',
      shortTerm: 'Short-term (24H)',
      mediumTerm: 'Medium-term (7D)',
      supportLevel: 'Support',
      resistanceLevel: 'Resistance',
      aiConfidence: 'AI Confidence',
    },
  };

  const t = texts[language];

  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('/api/dex');
      const data = await response.json();
      if (data.pair) {
        setTokenData(data.pair);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => fetchData(true), 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  // Calculate data for history
  const calculateHistoryData = () => {
    if (!tokenData) return undefined;

    const priceChange24h = tokenData.priceChange24h || 0;
    const volume24h = tokenData.volume?.h24 || 0;
    const liquidity = tokenData.liquidity?.usd || 0;
    const buys = tokenData.txns?.h24?.buys || 0;
    const sells = tokenData.txns?.h24?.sells || 0;
    const totalTxns = buys + sells;
    const buyRatio = totalTxns > 0 ? (buys / totalTxns) * 100 : 50;

    let score = 0;
    const avgVolume = 40000000;
    const healthyLiquidity = 350000000;

    if (priceChange24h > 10) score += 25;
    else if (priceChange24h > 5) score += 20;
    else if (priceChange24h > 2) score += 15;
    else if (priceChange24h > 0) score += 10;
    else if (priceChange24h > -2) score += 0;
    else if (priceChange24h > -5) score -= 10;
    else if (priceChange24h > -10) score -= 20;
    else score -= 25;

    const volumeRatio = volume24h / avgVolume;
    if (volumeRatio > 1.5) score += 15;
    else if (volumeRatio > 1.2) score += 10;
    else if (volumeRatio > 0.8) score += 5;
    else if (volumeRatio > 0.5) score -= 5;
    else score -= 10;

    if (buyRatio > 60) score += 20;
    else if (buyRatio > 55) score += 15;
    else if (buyRatio > 50) score += 5;
    else if (buyRatio > 45) score -= 5;
    else if (buyRatio > 40) score -= 15;
    else score -= 20;

    const liquidityRatio = liquidity / healthyLiquidity;
    if (liquidityRatio > 1.1) score += 15;
    else if (liquidityRatio > 0.9) score += 10;
    else if (liquidityRatio > 0.7) score += 0;
    else score -= 10;

    score = Math.max(-100, Math.min(100, score));

    let level: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
    if (score >= 40) level = 'very_bullish';
    else if (score >= 15) level = 'bullish';
    else if (score >= -15) level = 'neutral';
    else if (score >= -40) level = 'bearish';
    else level = 'very_bearish';

    const volumeLabel = volumeRatio > 1.2 ? (language === 'ko' ? '높음' : 'High') : volumeRatio > 0.8 ? (language === 'ko' ? '보통' : 'Normal') : (language === 'ko' ? '낮음' : 'Low');
    const liquidityLabel = liquidityRatio > 1 ? (language === 'ko' ? '양호' : 'Good') : liquidityRatio > 0.8 ? (language === 'ko' ? '보통' : 'Normal') : (language === 'ko' ? '주의' : 'Caution');

    return {
      score,
      level,
      price: parseFloat(tokenData.priceUsd),
      priceChange24h,
      volume24h,
      liquidity,
      buyRatio,
      signals: {
        priceChange: `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
        volume: volumeLabel,
        buyRatio: `${buyRatio.toFixed(0)}%`,
        liquidity: liquidityLabel,
      },
    };
  };

  // Get indicator color
  const getIndicatorColor = (score: number, type: 'positive' | 'neutral' | 'both' = 'both') => {
    if (type === 'positive') {
      if (score >= 80) return 'text-cyan-400';
      if (score >= 60) return 'text-teal-400';
      if (score >= 40) return 'text-green-400';
      if (score >= 20) return 'text-amber-400';
      return 'text-red-400';
    }
    if (type === 'both') {
      if (score >= 30) return 'text-cyan-400';
      if (score >= 10) return 'text-teal-400';
      if (score >= -10) return 'text-amber-400';
      if (score >= -30) return 'text-orange-400';
      return 'text-red-400';
    }
    return 'text-zinc-400';
  };

  const getIndicatorBg = (score: number, type: 'positive' | 'neutral' | 'both' = 'both') => {
    if (type === 'positive') {
      if (score >= 80) return 'bg-cyan-500/20';
      if (score >= 60) return 'bg-teal-500/20';
      if (score >= 40) return 'bg-green-500/20';
      if (score >= 20) return 'bg-amber-500/20';
      return 'bg-red-500/20';
    }
    if (type === 'both') {
      if (score >= 30) return 'bg-cyan-500/20';
      if (score >= 10) return 'bg-teal-500/20';
      if (score >= -10) return 'bg-amber-500/20';
      if (score >= -30) return 'bg-orange-500/20';
      return 'bg-red-500/20';
    }
    return 'bg-zinc-500/20';
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      {t.back}
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{t.title}</h1>
                  {isAutoRefresh && (
                    <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-cyan-500/10 text-cyan-500 text-[10px] sm:text-xs font-medium rounded-full">
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-cyan-500" />
                      </span>
                      {t.liveData}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-lg text-muted-foreground mt-1 sm:mt-2">{t.subtitle}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t.lastUpdated}: {formatLastUpdated(lastUpdated)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                    variant={isAutoRefresh ? "default" : "outline"}
                    size="sm"
                    className="h-8"
                  >
                    {isAutoRefresh ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        {t.autoRefresh} ON
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        {t.autoRefresh} OFF
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => fetchData(true)}
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {t.refresh}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.tabOverview}</span>
                <span className="sm:hidden">{t.overview}</span>
              </TabsTrigger>
              <TabsTrigger value="prediction" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Target className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.tabPrediction}</span>
                <span className="sm:hidden">{t.prediction}</span>
              </TabsTrigger>
              <TabsTrigger value="signals" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Crosshair className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.tabSignals}</span>
                <span className="sm:hidden">{t.signals}</span>
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.tabSentiment}</span>
                <span className="sm:hidden">{t.sentiment}</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-8">
              {/* Main AI Sentiment */}
              <MarketSentiment data={tokenData} loading={loading} />

              {/* Advanced Indicators Section */}
              {indicators && (
                <Card className="bg-zinc-900 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-primary" />
                      {t.advancedIndicators}
                    </CardTitle>
                    <CardDescription>{t.advancedDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price Timeframes */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-zinc-400 mb-2 sm:mb-3 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {t.priceTimeframes}
                      </h4>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { label: t.h1, value: indicators.priceChanges.h1 },
                          { label: t.h6, value: indicators.priceChanges.h6 },
                          { label: t.h24, value: indicators.priceChanges.h24 },
                        ].map((item, i) => (
                          <div key={i} className="p-2 sm:p-3 bg-zinc-800/50 rounded-lg text-center">
                            <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{item.label}</p>
                            <p className={`text-sm sm:text-lg font-bold ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}%
                            </p>
                            <div className="mt-0.5 sm:mt-1">
                              {item.value >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mx-auto" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mx-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Indicators Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {/* Momentum */}
                      <div className={`p-4 rounded-lg border ${getIndicatorBg(indicators.momentum.score, 'both')} border-zinc-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className={`h-5 w-5 ${getIndicatorColor(indicators.momentum.score, 'both')}`} />
                            <span className="font-medium">{t.momentum}</span>
                          </div>
                          <Badge variant="outline" className={getIndicatorColor(indicators.momentum.score, 'both')}>
                            {t[indicators.momentum.label as keyof typeof t]}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{t.momentumDesc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                indicators.momentum.score >= 0 ? 'bg-cyan-500' : 'bg-red-500'
                              }`}
                              style={{
                                width: `${Math.abs(indicators.momentum.score)}%`,
                                marginLeft: indicators.momentum.score < 0 ? `${100 - Math.abs(indicators.momentum.score)}%` : '0'
                              }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getIndicatorColor(indicators.momentum.score, 'both')}`}>
                            {indicators.momentum.value > 0 ? '+' : ''}{indicators.momentum.value.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Volume Strength */}
                      <div className={`p-4 rounded-lg border ${getIndicatorBg(indicators.volume.score, 'positive')} border-zinc-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className={`h-5 w-5 ${getIndicatorColor(indicators.volume.score, 'positive')}`} />
                            <span className="font-medium">{t.volumeStrength}</span>
                          </div>
                          <Badge variant="outline" className={getIndicatorColor(indicators.volume.score, 'positive')}>
                            {t[indicators.volume.label as keyof typeof t]}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{t.volumeStrengthDesc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all duration-500"
                              style={{ width: `${Math.min(indicators.volume.score, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getIndicatorColor(indicators.volume.score, 'positive')}`}>
                            {indicators.volume.ratio.toFixed(2)}x
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">${formatLargeNumber(indicators.volume.value)}</p>
                      </div>

                      {/* Buy/Sell Pressure */}
                      <div className={`p-4 rounded-lg border ${getIndicatorBg(indicators.pressure.score, 'both')} border-zinc-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className={`h-5 w-5 ${getIndicatorColor(indicators.pressure.score, 'both')}`} />
                            <span className="font-medium">{t.buyPressure}</span>
                          </div>
                          <Badge variant="outline" className={getIndicatorColor(indicators.pressure.score, 'both')}>
                            {t[indicators.pressure.label as keyof typeof t]}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{t.buyPressureDesc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${indicators.pressure.buyRatio}%` }}
                            />
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${100 - indicators.pressure.buyRatio}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-zinc-300">
                            {indicators.pressure.buyRatio.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-green-400">{t.transactions}: {formatLargeNumber(indicators.pressure.buys)}</span>
                          <span className="text-red-400">{formatLargeNumber(indicators.pressure.sells)}</span>
                        </div>
                      </div>

                      {/* Liquidity Health */}
                      <div className={`p-4 rounded-lg border ${getIndicatorBg(indicators.liquidity.score, 'positive')} border-zinc-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Droplets className={`h-5 w-5 ${getIndicatorColor(indicators.liquidity.score, 'positive')}`} />
                            <span className="font-medium">{t.liquidityHealth}</span>
                          </div>
                          <Badge variant="outline" className={getIndicatorColor(indicators.liquidity.score, 'positive')}>
                            {t[indicators.liquidity.label as keyof typeof t]}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{t.liquidityHealthDesc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${Math.min(indicators.liquidity.score, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getIndicatorColor(indicators.liquidity.score, 'positive')}`}>
                            {indicators.liquidity.ratio.toFixed(2)}x
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">${formatLargeNumber(indicators.liquidity.value)}</p>
                      </div>

                      {/* Market Health */}
                      <div className={`p-4 rounded-lg border ${getIndicatorBg(indicators.marketHealth.score, 'positive')} border-zinc-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className={`h-5 w-5 ${getIndicatorColor(indicators.marketHealth.score, 'positive')}`} />
                            <span className="font-medium">{t.marketHealth}</span>
                          </div>
                          <span className={`text-2xl font-black ${getIndicatorColor(indicators.marketHealth.score, 'positive')}`}>
                            {indicators.marketHealth.score}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{t.marketHealthDesc}</p>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              indicators.marketHealth.score >= 60 ? 'bg-cyan-500' :
                              indicators.marketHealth.score >= 40 ? 'bg-teal-500' :
                              indicators.marketHealth.score >= 30 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${indicators.marketHealth.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Trend Strength */}
                      <div className={`p-4 rounded-lg border ${
                        indicators.trend.direction === 'bullish' ? 'bg-cyan-500/10' :
                        indicators.trend.direction === 'bearish' ? 'bg-red-500/10' :
                        'bg-amber-500/10'
                      } border-zinc-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Waves className={`h-5 w-5 ${
                              indicators.trend.direction === 'bullish' ? 'text-cyan-400' :
                              indicators.trend.direction === 'bearish' ? 'text-red-400' :
                              'text-amber-400'
                            }`} />
                            <span className="font-medium">{t.trendStrength}</span>
                          </div>
                          <Badge variant="outline" className={
                            indicators.trend.direction === 'bullish' ? 'text-cyan-400' :
                            indicators.trend.direction === 'bearish' ? 'text-red-400' :
                            'text-amber-400'
                          }>
                            {indicators.trend.direction === 'bullish' ? t.bullishTrend :
                             indicators.trend.direction === 'bearish' ? t.bearishTrend :
                             t.mixedTrend}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{t.trendStrengthDesc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                indicators.trend.direction === 'bullish' ? 'bg-cyan-500' :
                                indicators.trend.direction === 'bearish' ? 'bg-red-500' :
                                'bg-amber-500'
                              }`}
                              style={{ width: `${indicators.trend.strength}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-zinc-300">
                            {indicators.trend.strength.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Visualization Charts */}
              {indicators && (
                <AIVisualizationCharts
                  indicators={indicators}
                  aiScore={aiAnalysis.score}
                  aiLevel={aiAnalysis.level}
                />
              )}

              {/* Analysis History */}
              <AnalysisHistory currentData={calculateHistoryData()} />

              {/* How It Works Section */}
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    {t.howItWorks}
                  </CardTitle>
                  <CardDescription>{t.howItWorksDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-sm">{t.factor1Title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.factor1Desc}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold text-sm">{t.factor2Title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.factor2Desc}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold text-sm">{t.factor3Title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.factor3Desc}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-sm">{t.factor4Title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.factor4Desc}</p>
                    </div>
                  </div>

                  {/* Score Ranges */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t.scoreRanges}</h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-500 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        {t.veryBullish}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-500 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        {t.bullish}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        {t.neutral}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-500 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        {t.bearish}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        {t.veryBearish}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-6">{t.disclaimer}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prediction Tab */}
            <TabsContent value="prediction" className="mt-6">
              <div className="space-y-6">
                {/* Enhanced Market Prediction */}
                <MarketPrediction data={tokenData} loading={loading} />

                {/* AI Price Targets & Risk Assessment */}
                {tokenData && indicators && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Price Targets */}
                    <Card className="bg-zinc-900 border-zinc-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Target className="h-5 w-5 text-cyan-400" />
                          {t.aiPriceTargets}
                        </CardTitle>
                        <CardDescription className="text-xs">{t.aiPriceTargetsDesc}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const price = parseFloat(tokenData.priceUsd);
                          const volatility = Math.abs(tokenData.priceChange24h || 0) / 100;
                          const support24h = price * (1 - Math.max(volatility * 0.5, 0.02));
                          const resistance24h = price * (1 + Math.max(volatility * 0.5, 0.02));
                          const support7d = price * (1 - Math.max(volatility * 1.5, 0.05));
                          const resistance7d = price * (1 + Math.max(volatility * 1.5, 0.05));
                          const confidence = Math.max(40, 85 - volatility * 200);

                          return (
                            <>
                              {/* Short-term (24H) */}
                              <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-zinc-400 mb-2">{t.shortTerm}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-center">
                                    <p className="text-[10px] text-zinc-500">{t.supportLevel}</p>
                                    <p className="text-sm font-bold text-red-400">${support24h.toFixed(4)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-zinc-500">{t.resistanceLevel}</p>
                                    <p className="text-sm font-bold text-green-400">${resistance24h.toFixed(4)}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Medium-term (7D) */}
                              <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-zinc-400 mb-2">{t.mediumTerm}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-center">
                                    <p className="text-[10px] text-zinc-500">{t.supportLevel}</p>
                                    <p className="text-sm font-bold text-red-400">${support7d.toFixed(4)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-zinc-500">{t.resistanceLevel}</p>
                                    <p className="text-sm font-bold text-green-400">${resistance7d.toFixed(4)}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Confidence */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">{t.aiConfidence}</span>
                                <span className={`font-medium ${confidence >= 70 ? 'text-green-400' : confidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {confidence.toFixed(0)}%
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* AI Risk Assessment */}
                    <Card className="bg-zinc-900 border-zinc-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Shield className="h-5 w-5 text-amber-400" />
                          {t.aiRiskAssessment}
                        </CardTitle>
                        <CardDescription className="text-xs">{t.aiRiskDesc}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const volatility = Math.abs(tokenData.priceChange24h || 0);
                          const liquidityRatio = (tokenData.liquidity?.usd || 0) / 350000000;
                          const buyRatio = tokenData.txns?.h24 ? tokenData.txns.h24.buys / (tokenData.txns.h24.buys + tokenData.txns.h24.sells) : 0.5;

                          const volatilityRisk = Math.min(100, volatility * 8);
                          const liqRisk = Math.max(0, 100 - liquidityRatio * 100);
                          const marketRisk = Math.abs(buyRatio - 0.5) * 200;

                          const overallRisk = (volatilityRisk * 0.4 + liqRisk * 0.3 + marketRisk * 0.3);
                          const riskLabel = overallRisk < 25 ? (language === 'ko' ? t.riskLow : t.riskLow) :
                                           overallRisk < 50 ? t.riskMedium :
                                           overallRisk < 75 ? t.riskHigh : t.riskVeryHigh;
                          const riskColor = overallRisk < 25 ? 'text-green-400' :
                                           overallRisk < 50 ? 'text-amber-400' :
                                           overallRisk < 75 ? 'text-orange-400' : 'text-red-400';

                          return (
                            <>
                              {/* Overall Risk */}
                              <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-1">{t.riskLevel}</p>
                                <p className={`text-2xl font-bold ${riskColor}`}>{riskLabel}</p>
                                <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      overallRisk < 25 ? 'bg-green-500' :
                                      overallRisk < 50 ? 'bg-amber-500' :
                                      overallRisk < 75 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${overallRisk}%` }}
                                  />
                                </div>
                              </div>
                              {/* Risk Breakdown */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {t.volatilityRisk}
                                  </span>
                                  <span className={volatilityRisk > 50 ? 'text-red-400' : 'text-green-400'}>
                                    {volatilityRisk.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500 flex items-center gap-1">
                                    <Droplets className="h-3 w-3" />
                                    {t.liquidityRisk}
                                  </span>
                                  <span className={liqRisk > 50 ? 'text-red-400' : 'text-green-400'}>
                                    {liqRisk.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500 flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {t.marketRisk}
                                  </span>
                                  <span className={marketRisk > 50 ? 'text-red-400' : 'text-green-400'}>
                                    {marketRisk.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Original AI Prediction & Fear/Greed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIPrediction data={tokenData} loading={loading} />
                  <FearGreedIndex data={tokenData} loading={loading} />
                </div>
              </div>
            </TabsContent>

            {/* Signals Tab */}
            <TabsContent value="signals" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TradingSignals data={tokenData} loading={loading} />
                <div className="space-y-6">
                  <MarketSentiment data={tokenData} loading={loading} compact />
                  {indicators && (
                    <AIVisualizationCharts
                      indicators={indicators}
                      aiScore={aiAnalysis.score}
                      aiLevel={aiAnalysis.level}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Sentiment Tab */}
            <TabsContent value="sentiment" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FearGreedIndex data={tokenData} loading={loading} />
                <MarketSentiment data={tokenData} loading={loading} />
              </div>
              <div className="mt-6">
                <AnalysisHistory currentData={calculateHistoryData()} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Link to full analysis */}
          <div className="text-center mt-8">
            <Link href="/analysis">
              <Button variant="outline" size="lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                {t.viewAnalysis}
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedPage>
  );
}
