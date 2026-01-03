'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Brain, TrendingUp, TrendingDown, BarChart3, Droplets,
  Users, ArrowRight, Info, Calculator, Zap
} from 'lucide-react';
import Link from 'next/link';

export default function ScoreExplanationPage() {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: 'AI 점수 계산 방식',
      subtitle: 'LGNS AI 시장 분석 점수가 어떻게 산출되는지 알아보세요',
      backToHome: '홈으로',
      overview: '개요',
      overviewDesc: 'AI 점수는 -100점부터 +100점까지의 범위로, 4가지 핵심 지표를 분석하여 산출됩니다. 각 지표는 시장 상황을 종합적으로 반영합니다.',
      factors: '점수 산출 요소',
      priceChange: '가격 변동',
      priceChangeDesc: '24시간 가격 변동률과 단기 모멘텀을 분석합니다.',
      priceWeight: '가중치: 30%',
      volume: '거래량',
      volumeDesc: '24시간 거래량을 평균 거래량과 비교하여 시장 활성도를 측정합니다.',
      volumeWeight: '가중치: 25%',
      buyRatio: '매수/매도 비율',
      buyRatioDesc: '24시간 동안의 매수 거래와 매도 거래 비율을 분석합니다.',
      buyRatioWeight: '가중치: 25%',
      liquidity: '유동성',
      liquidityDesc: '풀의 유동성 상태를 건강한 기준치와 비교합니다.',
      liquidityWeight: '가중치: 20%',
      scoreRanges: '점수 범위 및 상태',
      veryBullish: '매우 강세',
      veryBullishRange: '+40 ~ +100점',
      veryBullishDesc: '강한 상승 신호. 가격, 거래량, 매수세가 모두 긍정적입니다.',
      bullish: '상승세',
      bullishRange: '+15 ~ +39점',
      bullishDesc: '긍정적인 시장 흐름. 전반적인 지표가 상승 추세를 보입니다.',
      neutral: '중립',
      neutralRange: '-14 ~ +14점',
      neutralDesc: '시장 균형 상태. 매수와 매도 압력이 비슷합니다.',
      bearish: '하락세',
      bearishRange: '-39 ~ -15점',
      bearishDesc: '약세 신호. 매도 압력이 있어 주의가 필요합니다.',
      veryBearish: '매우 약세',
      veryBearishRange: '-100 ~ -40점',
      veryBearishDesc: '강한 하락 압력. 리스크 관리에 주의하세요.',
      calculationExample: '계산 예시',
      exampleTitle: '현재 시장 상황 예시',
      disclaimer: '* 이 점수는 참고용이며, 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.',
      priceScore: '가격 변동 점수',
      volumeScore: '거래량 점수',
      buyRatioScore: '매수세 점수',
      liquidityScore: '유동성 점수',
      totalScore: '총점',
      detailedLogic: '상세 로직',
    },
    en: {
      title: 'AI Score Calculation',
      subtitle: 'Learn how the LGNS AI Market Analysis score is calculated',
      backToHome: 'Back to Home',
      overview: 'Overview',
      overviewDesc: 'The AI score ranges from -100 to +100 and is calculated by analyzing 4 key indicators. Each indicator reflects a comprehensive view of market conditions.',
      factors: 'Score Factors',
      priceChange: 'Price Change',
      priceChangeDesc: 'Analyzes 24-hour price change rate and short-term momentum.',
      priceWeight: 'Weight: 30%',
      volume: 'Volume',
      volumeDesc: 'Measures market activity by comparing 24-hour volume to average volume.',
      volumeWeight: 'Weight: 25%',
      buyRatio: 'Buy/Sell Ratio',
      buyRatioDesc: 'Analyzes the ratio of buy to sell transactions over 24 hours.',
      buyRatioWeight: 'Weight: 25%',
      liquidity: 'Liquidity',
      liquidityDesc: 'Compares pool liquidity status to healthy benchmark levels.',
      liquidityWeight: 'Weight: 20%',
      scoreRanges: 'Score Ranges & Status',
      veryBullish: 'Very Bullish',
      veryBullishRange: '+40 to +100',
      veryBullishDesc: 'Strong bullish signals. Price, volume, and buying pressure all positive.',
      bullish: 'Bullish',
      bullishRange: '+15 to +39',
      bullishDesc: 'Positive market trend. Overall indicators showing upward momentum.',
      neutral: 'Neutral',
      neutralRange: '-14 to +14',
      neutralDesc: 'Market in balance. Buy and sell pressure are similar.',
      bearish: 'Bearish',
      bearishRange: '-39 to -15',
      bearishDesc: 'Bearish signals. Selling pressure exists, caution advised.',
      veryBearish: 'Very Bearish',
      veryBearishRange: '-100 to -40',
      veryBearishDesc: 'Strong bearish pressure. Pay attention to risk management.',
      calculationExample: 'Calculation Example',
      exampleTitle: 'Current Market Situation Example',
      disclaimer: '* This score is for reference only. Investment decisions should be made at your own judgment and responsibility.',
      priceScore: 'Price Change Score',
      volumeScore: 'Volume Score',
      buyRatioScore: 'Buy Ratio Score',
      liquidityScore: 'Liquidity Score',
      totalScore: 'Total Score',
      detailedLogic: 'Detailed Logic',
    },
  };

  const t = texts[language];

  const priceLogic = [
    { condition: language === 'ko' ? '24시간 변동 > +10%' : '24H Change > +10%', score: '+25' },
    { condition: language === 'ko' ? '24시간 변동 > +5%' : '24H Change > +5%', score: '+20' },
    { condition: language === 'ko' ? '24시간 변동 > +2%' : '24H Change > +2%', score: '+15' },
    { condition: language === 'ko' ? '24시간 변동 > 0%' : '24H Change > 0%', score: '+10' },
    { condition: language === 'ko' ? '24시간 변동 > -2%' : '24H Change > -2%', score: '0' },
    { condition: language === 'ko' ? '24시간 변동 > -5%' : '24H Change > -5%', score: '-10' },
    { condition: language === 'ko' ? '24시간 변동 > -10%' : '24H Change > -10%', score: '-20' },
    { condition: language === 'ko' ? '24시간 변동 ≤ -10%' : '24H Change ≤ -10%', score: '-25' },
  ];

  const volumeLogic = [
    { condition: language === 'ko' ? '거래량 비율 > 1.5x' : 'Volume Ratio > 1.5x', score: '+15' },
    { condition: language === 'ko' ? '거래량 비율 > 1.2x' : 'Volume Ratio > 1.2x', score: '+10' },
    { condition: language === 'ko' ? '거래량 비율 > 0.8x' : 'Volume Ratio > 0.8x', score: '+5' },
    { condition: language === 'ko' ? '거래량 비율 > 0.5x' : 'Volume Ratio > 0.5x', score: '-5' },
    { condition: language === 'ko' ? '거래량 비율 ≤ 0.5x' : 'Volume Ratio ≤ 0.5x', score: '-10' },
  ];

  const buyRatioLogic = [
    { condition: language === 'ko' ? '매수 비율 > 60%' : 'Buy Ratio > 60%', score: '+20' },
    { condition: language === 'ko' ? '매수 비율 > 55%' : 'Buy Ratio > 55%', score: '+15' },
    { condition: language === 'ko' ? '매수 비율 > 50%' : 'Buy Ratio > 50%', score: '+5' },
    { condition: language === 'ko' ? '매수 비율 > 45%' : 'Buy Ratio > 45%', score: '-5' },
    { condition: language === 'ko' ? '매수 비율 > 40%' : 'Buy Ratio > 40%', score: '-15' },
    { condition: language === 'ko' ? '매수 비율 ≤ 40%' : 'Buy Ratio ≤ 40%', score: '-20' },
  ];

  const liquidityLogic = [
    { condition: language === 'ko' ? '유동성 비율 > 1.1x' : 'Liquidity Ratio > 1.1x', score: '+15' },
    { condition: language === 'ko' ? '유동성 비율 > 0.9x' : 'Liquidity Ratio > 0.9x', score: '+10' },
    { condition: language === 'ko' ? '유동성 비율 > 0.7x' : 'Liquidity Ratio > 0.7x', score: '0' },
    { condition: language === 'ko' ? '유동성 비율 ≤ 0.7x' : 'Liquidity Ratio ≤ 0.7x', score: '-10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t.backToHome}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Overview */}
        <Card className="bg-card border-border/60 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {t.overview}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t.overviewDesc}</p>

            {/* Score Range Visual */}
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-400">-100</span>
                <span className="text-sm font-medium text-zinc-400">0</span>
                <span className="text-sm font-medium text-cyan-400">+100</span>
              </div>
              <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500" />
              <div className="flex justify-between mt-2 text-xs text-zinc-500">
                <span>{language === 'ko' ? '매우 약세' : 'Very Bearish'}</span>
                <span>{language === 'ko' ? '중립' : 'Neutral'}</span>
                <span>{language === 'ko' ? '매우 강세' : 'Very Bullish'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Factors */}
        <Card className="bg-card border-border/60 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              {t.factors}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Change */}
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    <span className="font-semibold">{t.priceChange}</span>
                  </div>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                    {t.priceWeight}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">{t.priceChangeDesc}</p>
              </div>

              {/* Volume */}
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-teal-400" />
                    <span className="font-semibold">{t.volume}</span>
                  </div>
                  <Badge variant="outline" className="text-teal-400 border-teal-400/50">
                    {t.volumeWeight}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">{t.volumeDesc}</p>
              </div>

              {/* Buy Ratio */}
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold">{t.buyRatio}</span>
                  </div>
                  <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                    {t.buyRatioWeight}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">{t.buyRatioDesc}</p>
              </div>

              {/* Liquidity */}
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold">{t.liquidity}</span>
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                    {t.liquidityWeight}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">{t.liquidityDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Logic */}
        <Card className="bg-card border-border/60 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t.detailedLogic}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Price Logic */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  {t.priceChange}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {priceLogic.map((item, index) => (
                    <div key={index} className="p-2 bg-zinc-800/50 rounded text-center">
                      <div className="text-xs text-zinc-400 mb-1">{item.condition}</div>
                      <div className={`text-sm font-bold ${
                        item.score.startsWith('+') ? 'text-cyan-400' :
                        item.score.startsWith('-') ? 'text-red-400' : 'text-zinc-400'
                      }`}>{item.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume Logic */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-teal-400" />
                  {t.volume}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {volumeLogic.map((item, index) => (
                    <div key={index} className="p-2 bg-zinc-800/50 rounded text-center">
                      <div className="text-xs text-zinc-400 mb-1">{item.condition}</div>
                      <div className={`text-sm font-bold ${
                        item.score.startsWith('+') ? 'text-teal-400' :
                        item.score.startsWith('-') ? 'text-red-400' : 'text-zinc-400'
                      }`}>{item.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Ratio Logic */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  {t.buyRatio}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {buyRatioLogic.map((item, index) => (
                    <div key={index} className="p-2 bg-zinc-800/50 rounded text-center">
                      <div className="text-xs text-zinc-400 mb-1">{item.condition}</div>
                      <div className={`text-sm font-bold ${
                        item.score.startsWith('+') ? 'text-amber-400' :
                        item.score.startsWith('-') ? 'text-red-400' : 'text-zinc-400'
                      }`}>{item.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liquidity Logic */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  {t.liquidity}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {liquidityLogic.map((item, index) => (
                    <div key={index} className="p-2 bg-zinc-800/50 rounded text-center">
                      <div className="text-xs text-zinc-400 mb-1">{item.condition}</div>
                      <div className={`text-sm font-bold ${
                        item.score.startsWith('+') ? 'text-blue-400' :
                        item.score.startsWith('-') ? 'text-red-400' : 'text-zinc-400'
                      }`}>{item.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Ranges */}
        <Card className="bg-card border-border/60 mb-6">
          <CardHeader>
            <CardTitle>{t.scoreRanges}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Very Bullish */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cyan-400">{t.veryBullish}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{t.veryBullishRange}</Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{t.veryBullishDesc}</p>
                </div>
              </div>

              {/* Bullish */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teal-400">{t.bullish}</span>
                    <Badge className="bg-teal-500/20 text-teal-400 text-xs">{t.bullishRange}</Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{t.bullishDesc}</p>
                </div>
              </div>

              {/* Neutral */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-400">{t.neutral}</span>
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">{t.neutralRange}</Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{t.neutralDesc}</p>
                </div>
              </div>

              {/* Bearish */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-400">{t.bearish}</span>
                    <Badge className="bg-orange-500/20 text-orange-400 text-xs">{t.bearishRange}</Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{t.bearishDesc}</p>
                </div>
              </div>

              {/* Very Bearish */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-400">{t.veryBearish}</span>
                    <Badge className="bg-red-500/20 text-red-400 text-xs">{t.veryBearishRange}</Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{t.veryBearishDesc}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-zinc-500 text-center">
          {t.disclaimer}
        </p>
      </main>

      <Footer />
    </div>
  );
}
