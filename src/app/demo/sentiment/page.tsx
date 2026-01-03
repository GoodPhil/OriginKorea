'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MarketSentiment } from '@/components/MarketSentiment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, TrendingUp, TrendingDown, Minus, Flame, Snowflake } from 'lucide-react';

// Mock data generator for different sentiment levels
function generateMockData(level: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish') {
  const baseData = {
    priceUsd: '6.55',
    liquidity: { usd: 399000000 },
  };

  switch (level) {
    case 'very_bullish':
      return {
        ...baseData,
        priceChange24h: 12.5,
        priceChange: { h1: 2.5, h6: 5.0, h24: 12.5 },
        volume: { h24: 65000000 },
        txns: { h24: { buys: 150000, sells: 50000 } },
      };
    case 'bullish':
      return {
        ...baseData,
        priceChange24h: 4.2,
        priceChange: { h1: 0.8, h6: 2.0, h24: 4.2 },
        volume: { h24: 48000000 },
        txns: { h24: { buys: 120000, sells: 80000 } },
      };
    case 'neutral':
      return {
        ...baseData,
        priceChange24h: 0.3,
        priceChange: { h1: 0.1, h6: -0.2, h24: 0.3 },
        volume: { h24: 38000000 },
        txns: { h24: { buys: 95000, sells: 100000 } },
      };
    case 'bearish':
      return {
        ...baseData,
        priceChange24h: -4.8,
        priceChange: { h1: -0.9, h6: -2.5, h24: -4.8 },
        volume: { h24: 52000000 },
        txns: { h24: { buys: 70000, sells: 130000 } },
      };
    case 'very_bearish':
      return {
        ...baseData,
        priceChange24h: -15.2,
        priceChange: { h1: -3.5, h6: -8.0, h24: -15.2 },
        volume: { h24: 75000000 },
        txns: { h24: { buys: 40000, sells: 180000 } },
      };
  }
}

// Custom data generator based on sliders
function generateCustomData(
  priceChange: number,
  volumeRatio: number,
  buyRatio: number,
  liquidityRatio: number
) {
  return {
    priceUsd: '6.55',
    priceChange24h: priceChange,
    priceChange: { h1: priceChange / 24, h6: priceChange / 4, h24: priceChange },
    volume: { h24: 40000000 * volumeRatio },
    liquidity: { usd: 350000000 * liquidityRatio },
    txns: {
      h24: {
        buys: Math.round(200000 * (buyRatio / 100)),
        sells: Math.round(200000 * (1 - buyRatio / 100))
      }
    },
  };
}

export default function SentimentDemoPage() {
  const { language } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish'>('bullish');
  const [customMode, setCustomMode] = useState(false);

  // Custom sliders
  const [priceChange, setPriceChange] = useState(2.5);
  const [volumeRatio, setVolumeRatio] = useState(1.0);
  const [buyRatio, setBuyRatio] = useState(55);
  const [liquidityRatio, setLiquidityRatio] = useState(1.0);

  const levels = [
    { key: 'very_bullish' as const, label: language === 'ko' ? '매우 강세' : 'Very Bullish', icon: Flame, color: 'bg-green-500' },
    { key: 'bullish' as const, label: language === 'ko' ? '상승세' : 'Bullish', icon: TrendingUp, color: 'bg-emerald-500' },
    { key: 'neutral' as const, label: language === 'ko' ? '중립' : 'Neutral', icon: Minus, color: 'bg-amber-500' },
    { key: 'bearish' as const, label: language === 'ko' ? '하락세' : 'Bearish', icon: TrendingDown, color: 'bg-orange-500' },
    { key: 'very_bearish' as const, label: language === 'ko' ? '매우 약세' : 'Very Bearish', icon: Snowflake, color: 'bg-red-500' },
  ];

  const texts = {
    ko: {
      title: 'AI 시장 분석 데모',
      subtitle: '다양한 시장 상황에서의 AI 분석 결과를 확인해보세요',
      selectLevel: '감성 레벨 선택',
      customMode: '커스텀 모드',
      presetMode: '프리셋 모드',
      priceChange: '24시간 가격 변동 (%)',
      volumeRatio: '거래량 비율',
      buyRatio: '매수 비율 (%)',
      liquidityRatio: '유동성 비율',
      allLevels: '모든 레벨 비교',
      description: '이 페이지는 AI 시장 분석 컴포넌트의 다양한 상태를 시뮬레이션합니다. 실제 데이터가 아닌 테스트 데이터입니다.',
    },
    en: {
      title: 'AI Market Analysis Demo',
      subtitle: 'See AI analysis results in various market conditions',
      selectLevel: 'Select Sentiment Level',
      customMode: 'Custom Mode',
      presetMode: 'Preset Mode',
      priceChange: '24H Price Change (%)',
      volumeRatio: 'Volume Ratio',
      buyRatio: 'Buy Ratio (%)',
      liquidityRatio: 'Liquidity Ratio',
      allLevels: 'Compare All Levels',
      description: 'This page simulates various states of the AI Market Sentiment component. This is test data, not real data.',
    },
  };

  const t = texts[language];

  const mockData = customMode
    ? generateCustomData(priceChange, volumeRatio, buyRatio, liquidityRatio)
    : generateMockData(selectedLevel);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Demo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
          <p className="text-xs text-muted-foreground/60 mt-2">{t.description}</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={!customMode ? 'default' : 'outline'}
            onClick={() => setCustomMode(false)}
          >
            {t.presetMode}
          </Button>
          <Button
            variant={customMode ? 'default' : 'outline'}
            onClick={() => setCustomMode(true)}
          >
            {t.customMode}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle>{customMode ? t.customMode : t.selectLevel}</CardTitle>
            </CardHeader>
            <CardContent>
              {!customMode ? (
                /* Preset Level Buttons */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {levels.map((level) => {
                    const Icon = level.icon;
                    return (
                      <Button
                        key={level.key}
                        variant={selectedLevel === level.key ? 'default' : 'outline'}
                        className={`h-auto py-4 flex items-center gap-3 ${
                          selectedLevel === level.key ? level.color : ''
                        }`}
                        onClick={() => setSelectedLevel(level.key)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{level.label}</span>
                      </Button>
                    );
                  })}
                </div>
              ) : (
                /* Custom Sliders */
                <div className="space-y-6">
                  {/* Price Change */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">{t.priceChange}</label>
                      <span className={`text-sm font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={[priceChange]}
                      onValueChange={(v: number[]) => setPriceChange(v[0])}
                      min={-20}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>-20%</span>
                      <span>0%</span>
                      <span>+20%</span>
                    </div>
                  </div>

                  {/* Volume Ratio */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">{t.volumeRatio}</label>
                      <span className="text-sm font-bold">{volumeRatio.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[volumeRatio]}
                      onValueChange={(v: number[]) => setVolumeRatio(v[0])}
                      min={0.3}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.3x (Low)</span>
                      <span>1.0x (Avg)</span>
                      <span>2.0x (High)</span>
                    </div>
                  </div>

                  {/* Buy Ratio */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">{t.buyRatio}</label>
                      <span className={`text-sm font-bold ${buyRatio > 50 ? 'text-green-500' : buyRatio < 50 ? 'text-red-500' : 'text-yellow-500'}`}>
                        {buyRatio}%
                      </span>
                    </div>
                    <Slider
                      value={[buyRatio]}
                      onValueChange={(v: number[]) => setBuyRatio(v[0])}
                      min={20}
                      max={80}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>20% (Sell)</span>
                      <span>50%</span>
                      <span>80% (Buy)</span>
                    </div>
                  </div>

                  {/* Liquidity Ratio */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">{t.liquidityRatio}</label>
                      <span className="text-sm font-bold">{liquidityRatio.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[liquidityRatio]}
                      onValueChange={(v: number[]) => setLiquidityRatio(v[0])}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>1.5x</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <div>
            <MarketSentiment data={mockData} loading={false} />
          </div>
        </div>

        {/* All Levels Comparison */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">{t.allLevels}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {levels.map((level) => (
              <div key={level.key}>
                <div className="text-center mb-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${level.color} text-white`}>
                    {level.label}
                  </span>
                </div>
                <MarketSentiment
                  data={generateMockData(level.key)}
                  loading={false}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
