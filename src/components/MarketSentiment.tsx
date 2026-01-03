'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, Minus, Zap, Activity, Brain,
  Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Flame, Snowflake, Sun, Cloud, CloudRain, ThermometerSun,
  Share2, Twitter, Send, Copy, Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

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

interface SentimentAnalysis {
  score: number;
  level: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  signals: {
    name: string;
    nameEn: string;
    value: string;
    valueEn: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
  summary: string;
  summaryEn: string;
}

// AI-style sentiment analysis function
function analyzeSentiment(data: MarketData): SentimentAnalysis {
  let score = 0;
  const signals: SentimentAnalysis['signals'] = [];

  // 1. Price Change Analysis (Weight: 30%)
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

  signals.push({
    name: '24시간',
    nameEn: '24H Change',
    value: `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
    valueEn: `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
    sentiment: priceChange24h > 1 ? 'positive' : priceChange24h < -1 ? 'negative' : 'neutral',
  });

  // Short-term momentum
  const momentum = priceChange1h - (priceChange6h / 6);
  if (momentum > 0.5) score += 10;
  else if (momentum < -0.5) score -= 10;

  // 2. Volume Analysis (Weight: 25%)
  const volume24h = data.volume?.h24 || 0;
  const avgDailyVolume = 40000000;

  const volumeRatio = volume24h / avgDailyVolume;
  if (volumeRatio > 1.5) score += 15;
  else if (volumeRatio > 1.2) score += 10;
  else if (volumeRatio > 0.8) score += 5;
  else if (volumeRatio > 0.5) score -= 5;
  else score -= 10;

  const volumeLabel = volumeRatio > 1.2 ? '높음' : volumeRatio > 0.8 ? '보통' : '낮음';
  const volumeLabelEn = volumeRatio > 1.2 ? 'High' : volumeRatio > 0.8 ? 'Normal' : 'Low';

  signals.push({
    name: '거래량',
    nameEn: 'Volume',
    value: volumeLabel,
    valueEn: volumeLabelEn,
    sentiment: volumeRatio > 1.2 ? 'positive' : volumeRatio < 0.7 ? 'negative' : 'neutral',
  });

  // 3. Buy/Sell Ratio Analysis (Weight: 25%)
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

  signals.push({
    name: '매수세',
    nameEn: 'Buy Ratio',
    value: `${buyRatio.toFixed(0)}%`,
    valueEn: `${buyRatio.toFixed(0)}%`,
    sentiment: buyRatio > 55 ? 'positive' : buyRatio < 45 ? 'negative' : 'neutral',
  });

  // 4. Liquidity Analysis (Weight: 20%)
  const liquidity = data.liquidity?.usd || 0;
  const healthyLiquidity = 350000000;

  const liquidityRatio = liquidity / healthyLiquidity;
  if (liquidityRatio > 1.1) score += 15;
  else if (liquidityRatio > 0.9) score += 10;
  else if (liquidityRatio > 0.7) score += 0;
  else score -= 10;

  const liquidityLabel = liquidityRatio > 1 ? '양호' : liquidityRatio > 0.8 ? '보통' : '주의';
  const liquidityLabelEn = liquidityRatio > 1 ? 'Good' : liquidityRatio > 0.8 ? 'Normal' : 'Caution';

  signals.push({
    name: '유동성',
    nameEn: 'Liquidity',
    value: liquidityLabel,
    valueEn: liquidityLabelEn,
    sentiment: liquidityRatio > 0.95 ? 'positive' : liquidityRatio < 0.8 ? 'negative' : 'neutral',
  });

  score = Math.max(-100, Math.min(100, score));

  let level: SentimentAnalysis['level'];
  if (score >= 40) level = 'very_bullish';
  else if (score >= 15) level = 'bullish';
  else if (score >= -15) level = 'neutral';
  else if (score >= -40) level = 'bearish';
  else level = 'very_bearish';

  let summary: string;
  let summaryEn: string;

  if (level === 'very_bullish') {
    summary = '강한 상승 신호! 매수세가 우세하고 거래량이 증가하고 있습니다.';
    summaryEn = 'Strong bullish signals! Buying pressure is dominant with increasing volume.';
  } else if (level === 'bullish') {
    summary = '긍정적인 시장 흐름입니다. 가격과 거래량이 상승 추세를 보이고 있습니다.';
    summaryEn = 'Positive market trend. Price and volume showing upward momentum.';
  } else if (level === 'neutral') {
    summary = '시장이 균형 상태입니다. 매수와 매도가 비슷한 수준입니다.';
    summaryEn = 'Market is in balance. Buy and sell pressure are similar.';
  } else if (level === 'bearish') {
    summary = '약세 신호가 감지됩니다. 매도 압력이 있으니 신중한 접근이 필요합니다.';
    summaryEn = 'Bearish signals detected. Selling pressure exists, cautious approach recommended.';
  } else {
    summary = '강한 하락 압력이 감지됩니다. 리스크 관리에 주의하세요.';
    summaryEn = 'Strong bearish pressure detected. Pay attention to risk management.';
  }

  return { score, level, signals, summary, summaryEn };
}

interface MarketSentimentProps {
  data: MarketData | null;
  loading?: boolean;
  compact?: boolean;
}

export function MarketSentiment({ data, loading, compact = false }: MarketSentimentProps) {
  const { language } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => {
    if (!data) return null;
    return analyzeSentiment(data);
  }, [data]);

  useEffect(() => {
    if (analysis) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [analysis?.score]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showShareMenu && !target.closest('[data-share-menu]')) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  const texts = {
    ko: {
      title: 'LGNS AI 분석',
      tokenName: 'LGNS',
      poweredBy: 'AI 실시간 분석',
      very_bullish: '매우 강세',
      bullish: '상승세',
      neutral: '중립',
      bearish: '하락세',
      very_bearish: '매우 약세',
      todayOutlook: 'LGNS 전망',
      loading: 'AI 분석 중...',
      disclaimer: '* LGNS 거래 데이터 기반 AI 분석 참고 자료',
      score: '점수',
      scoreRange: '-100 ~ +100',
      howItWorks: '계산 방식',
      share: '공유',
      shareToTwitter: 'X(트위터)에 공유',
      shareToTelegram: '텔레그램에 공유',
      copyLink: '링크 복사',
      copied: '복사됨!',
    },
    en: {
      title: 'LGNS AI Analysis',
      tokenName: 'LGNS',
      poweredBy: 'AI Real-time Analysis',
      very_bullish: 'Very Bullish',
      bullish: 'Bullish',
      neutral: 'Neutral',
      bearish: 'Bearish',
      very_bearish: 'Very Bearish',
      todayOutlook: 'LGNS Outlook',
      loading: 'AI Analyzing...',
      disclaimer: '* AI analysis based on LGNS trading data',
      score: 'Score',
      scoreRange: '-100 ~ +100',
      howItWorks: 'How it works',
      share: 'Share',
      shareToTwitter: 'Share on X',
      shareToTelegram: 'Share on Telegram',
      copyLink: 'Copy Link',
      copied: 'Copied!',
    },
  };

  // Generate share text
  const getShareText = () => {
    if (!analysis) return '';
    const levelText = t[analysis.level];
    const scoreText = analysis.score > 0 ? `+${analysis.score}` : analysis.score;
    const priceText = data?.priceUsd ? `${parseFloat(data.priceUsd).toFixed(2)}` : '';

    if (language === 'ko') {
      return `🔮 LGNS AI 시장 분석\n\n📊 현재 상태: ${levelText} (${scoreText}점)\n💰 가격: ${priceText}\n\n#LGNS #Origin #DeFi #Crypto`;
    }
    return `🔮 LGNS AI Market Analysis\n\n📊 Status: ${levelText} (Score: ${scoreText})\n💰 Price: ${priceText}\n\n#LGNS #Origin #DeFi #Crypto`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://originkorea.vercel.app';

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
    setShowShareMenu(false);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=550,height=420');
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${getShareText()}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${getShareText()}\n\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const t = texts[language];

  // Clean, high-contrast visual elements - Cyan/Teal theme for bullish
  const getVisuals = (level: SentimentAnalysis['level']) => {
    switch (level) {
      case 'very_bullish':
        return {
          icon: Flame,
          iconColor: 'text-cyan-400',
          borderColor: 'border-cyan-500',
          badgeBg: 'bg-cyan-500',
          scoreColor: 'text-cyan-400',
          gaugeColor: 'bg-cyan-500',
          emoji: '🚀',
        };
      case 'bullish':
        return {
          icon: TrendingUp,
          iconColor: 'text-teal-400',
          borderColor: 'border-teal-500',
          badgeBg: 'bg-teal-500',
          scoreColor: 'text-teal-400',
          gaugeColor: 'bg-teal-500',
          emoji: '📈',
        };
      case 'neutral':
        return {
          icon: Minus,
          iconColor: 'text-amber-400',
          borderColor: 'border-amber-500',
          badgeBg: 'bg-amber-500',
          scoreColor: 'text-amber-400',
          gaugeColor: 'bg-amber-500',
          emoji: '⚖️',
        };
      case 'bearish':
        return {
          icon: TrendingDown,
          iconColor: 'text-orange-400',
          borderColor: 'border-orange-500',
          badgeBg: 'bg-orange-500',
          scoreColor: 'text-orange-400',
          gaugeColor: 'bg-orange-500',
          emoji: '📉',
        };
      case 'very_bearish':
        return {
          icon: Snowflake,
          iconColor: 'text-red-400',
          borderColor: 'border-red-500',
          badgeBg: 'bg-red-500',
          scoreColor: 'text-red-400',
          gaugeColor: 'bg-red-500',
          emoji: '🔻',
        };
    }
  };

  if (loading || !analysis) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3 py-8">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-zinc-400 font-medium">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visuals = getVisuals(analysis.level);
  const Icon = visuals.icon;
  const gaugePosition = ((analysis.score + 100) / 200) * 100;

  return (
    <Card className={`relative overflow-hidden border-2 ${visuals.borderColor} bg-zinc-900 transition-all duration-300`}>
      <CardContent className={`relative ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            {/* Left: Icon and Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 flex-shrink-0">
                <Icon className={`h-6 w-6 ${visuals.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Token Badge */}
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded">
                    {t.tokenName}
                  </span>
                  <h3 className="font-bold text-lg text-foreground">{t.title}</h3>
                  <span className="text-xl">{visuals.emoji}</span>
                  {/* LIVE indicator inline */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 rounded-full">
                    <span className="text-[10px] text-zinc-400 font-semibold">LIVE</span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75" />
                      <div className="relative w-2 h-2 bg-cyan-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Brain className="h-3 w-3" />
                  <span>{t.poweredBy}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">Polygon</span>
                </div>
              </div>
            </div>

            {/* Right: Score and Share */}
            <div className="flex items-start gap-3 flex-shrink-0">
              {/* Score Display */}
              <div className="text-right">
                <div className={`text-3xl sm:text-4xl font-black ${visuals.scoreColor}`}>
                  {analysis.score > 0 ? '+' : ''}{analysis.score}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium uppercase">{t.score}</div>
                <Link
                  href="/docs/guide/score"
                  className="text-[9px] text-zinc-500 hover:text-primary mt-0.5 inline-block underline decoration-dotted underline-offset-2"
                >
                  {t.howItWorks} →
                </Link>
              </div>

              {/* Share Button */}
              {!compact && (
                <div className="relative" data-share-menu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareMenu(!showShareMenu);
                    }}
                  >
                    <Share2 className="h-4 w-4 text-zinc-400" />
                  </Button>

                  {/* Share Dropdown */}
                  {showShareMenu && (
                    <div className="absolute right-0 top-10 z-20 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-700 transition-colors text-left"
                        onClick={handleShareTwitter}
                      >
                        <Twitter className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-200">{t.shareToTwitter}</span>
                      </button>
                      <button
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-700 transition-colors text-left"
                        onClick={handleShareTelegram}
                      >
                        <Send className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-200">{t.shareToTelegram}</span>
                      </button>
                      <button
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-700 transition-colors text-left"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-zinc-400" />
                        )}
                        <span className="text-sm text-zinc-200">
                          {copied ? t.copied : t.copyLink}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sentiment Badge & Gauge */}
          <div className="space-y-3">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className={`${visuals.badgeBg} text-foreground font-bold text-sm px-5 py-1.5`}>
                {t[analysis.level]}
              </Badge>
            </div>

            {/* Visual Gauge - Clean thin bar */}
            <div className="relative pt-1">
              {/* Track */}
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                {/* Active bar */}
                <div
                  className={`h-full ${visuals.gaugeColor} transition-all duration-700 ease-out rounded-full`}
                  style={{ width: `${gaugePosition}%` }}
                />
              </div>

              {/* Thumb indicator */}
              <div
                className="absolute top-0 w-3 h-3 -mt-[3px] rounded-full bg-white shadow-md transition-all duration-700 ease-out"
                style={{ left: `calc(${gaugePosition}% - 6px)` }}
              />

              {/* Gauge labels */}
              <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-medium">
                <span>{language === 'ko' ? '약세' : 'Bear'}</span>
                <span>{language === 'ko' ? '중립' : 'Neutral'}</span>
                <span>{language === 'ko' ? '강세' : 'Bull'}</span>
              </div>

              {/* Score Legend */}
              <div className="flex justify-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[9px] text-zinc-500">-100~-40</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-[9px] text-zinc-500">-39~-15</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[9px] text-zinc-500">-14~+14</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-[9px] text-zinc-500">+15~+39</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-[9px] text-zinc-500">+40~+100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signals Grid */}
          <div className="grid grid-cols-4 gap-2">
            {analysis.signals.map((signal, index) => (
              <div
                key={index}
                className={`px-2 py-2.5 rounded-lg text-center border ${
                  signal.sentiment === 'positive'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : signal.sentiment === 'negative'
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="text-[10px] text-zinc-500 font-medium mb-0.5">
                  {language === 'ko' ? signal.name : signal.nameEn}
                </div>
                <div className="text-sm font-bold">
                  {language === 'ko' ? signal.value : signal.valueEn}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {!compact && (
            <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700">
              <div className="flex items-start gap-2">
                <Sparkles className={`h-4 w-4 ${visuals.iconColor} flex-shrink-0 mt-0.5`} />
                <div>
                  <div className="text-xs font-bold text-foreground mb-1">{t.todayOutlook}</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {language === 'ko' ? analysis.summary : analysis.summaryEn}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compact mode score legend */}
          {compact && (
            <div className="flex justify-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[8px] text-zinc-500">-100~-40</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-[8px] text-zinc-500">-39~-15</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[8px] text-zinc-500">-14~+14</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span className="text-[8px] text-zinc-500">+15~+39</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span className="text-[8px] text-zinc-500">+40~+100</span>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[9px] text-zinc-600 text-center">
            {t.disclaimer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
