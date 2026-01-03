'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Crosshair,
} from 'lucide-react';

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

interface TradingSignal {
  action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  entryZone: { low: number; high: number };
  stopLoss: number;
  takeProfit: number[];
  riskReward: number;
  signals: {
    name: string;
    status: 'bullish' | 'bearish' | 'neutral';
    weight: number;
  }[];
  timeframe: 'short' | 'medium';
  note: string;
}

function generateTradingSignals(data: MarketData): TradingSignal {
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

  const signals: TradingSignal['signals'] = [];
  let totalScore = 0;

  // 1. Trend Signal (Weight: 25%)
  const trendSignal = (
    (priceChange1h > 0 ? 1 : -1) +
    (priceChange6h > 0 ? 1 : -1) +
    (priceChange24h > 0 ? 1 : -1)
  ) / 3;
  const trendStatus: 'bullish' | 'bearish' | 'neutral' =
    trendSignal > 0.3 ? 'bullish' : trendSignal < -0.3 ? 'bearish' : 'neutral';
  signals.push({ name: 'trend', status: trendStatus, weight: 25 });
  totalScore += trendStatus === 'bullish' ? 25 : trendStatus === 'bearish' ? -25 : 0;

  // 2. Momentum Signal (Weight: 25%)
  const momentum = priceChange1h - (priceChange6h / 6);
  const momentumStatus: 'bullish' | 'bearish' | 'neutral' =
    momentum > 0.5 ? 'bullish' : momentum < -0.5 ? 'bearish' : 'neutral';
  signals.push({ name: 'momentum', status: momentumStatus, weight: 25 });
  totalScore += momentumStatus === 'bullish' ? 25 : momentumStatus === 'bearish' ? -25 : 0;

  // 3. Volume Signal (Weight: 20%)
  const avgVolume = 40000000;
  const volumeRatio = volume24h / avgVolume;
  const volumeStatus: 'bullish' | 'bearish' | 'neutral' =
    volumeRatio > 1.2 ? 'bullish' : volumeRatio < 0.7 ? 'bearish' : 'neutral';
  signals.push({ name: 'volume', status: volumeStatus, weight: 20 });
  totalScore += volumeStatus === 'bullish' ? 20 : volumeStatus === 'bearish' ? -20 : 0;

  // 4. Buy Pressure Signal (Weight: 20%)
  const pressureStatus: 'bullish' | 'bearish' | 'neutral' =
    buyRatio > 0.55 ? 'bullish' : buyRatio < 0.45 ? 'bearish' : 'neutral';
  signals.push({ name: 'pressure', status: pressureStatus, weight: 20 });
  totalScore += pressureStatus === 'bullish' ? 20 : pressureStatus === 'bearish' ? -20 : 0;

  // 5. Liquidity Signal (Weight: 10%)
  const healthyLiquidity = 350000000;
  const liquidityRatio = liquidity / healthyLiquidity;
  const liquidityStatus: 'bullish' | 'bearish' | 'neutral' =
    liquidityRatio > 1.1 ? 'bullish' : liquidityRatio < 0.8 ? 'bearish' : 'neutral';
  signals.push({ name: 'liquidity', status: liquidityStatus, weight: 10 });
  totalScore += liquidityStatus === 'bullish' ? 10 : liquidityStatus === 'bearish' ? -10 : 0;

  // Determine action
  let action: TradingSignal['action'];
  if (totalScore >= 60) action = 'strong_buy';
  else if (totalScore >= 25) action = 'buy';
  else if (totalScore >= -25) action = 'hold';
  else if (totalScore >= -60) action = 'sell';
  else action = 'strong_sell';

  // Calculate confidence
  const confidence = Math.min(90, Math.max(40, 50 + Math.abs(totalScore) * 0.5));

  // Calculate levels
  const volatility = Math.abs(priceChange24h) / 100;
  const baseVolatility = 0.03; // 3% base
  const adjustedVolatility = Math.max(baseVolatility, volatility);

  const stopLoss = action.includes('buy')
    ? currentPrice * (1 - adjustedVolatility - 0.02)
    : currentPrice * (1 + adjustedVolatility + 0.02);

  const entryZone = action.includes('buy')
    ? { low: currentPrice * 0.99, high: currentPrice * 1.01 }
    : { low: currentPrice * 0.99, high: currentPrice * 1.01 };

  const takeProfit = action.includes('buy')
    ? [
        currentPrice * (1 + adjustedVolatility * 1.5),
        currentPrice * (1 + adjustedVolatility * 2.5),
        currentPrice * (1 + adjustedVolatility * 4),
      ]
    : [
        currentPrice * (1 - adjustedVolatility * 1.5),
        currentPrice * (1 - adjustedVolatility * 2.5),
        currentPrice * (1 - adjustedVolatility * 4),
      ];

  // Risk/Reward ratio
  const potentialProfit = Math.abs(takeProfit[0] - currentPrice);
  const potentialLoss = Math.abs(currentPrice - stopLoss);
  const riskReward = potentialProfit / potentialLoss;

  // Generate note
  let note: string;
  if (action === 'strong_buy') {
    note = 'ko_strong_buy_note';
  } else if (action === 'buy') {
    note = 'ko_buy_note';
  } else if (action === 'hold') {
    note = 'ko_hold_note';
  } else if (action === 'sell') {
    note = 'ko_sell_note';
  } else {
    note = 'ko_strong_sell_note';
  }

  return {
    action,
    confidence,
    entryZone,
    stopLoss,
    takeProfit,
    riskReward,
    signals,
    timeframe: 'short',
    note,
  };
}

interface TradingSignalsProps {
  data: MarketData | null;
  loading?: boolean;
}

export function TradingSignals({ data, loading }: TradingSignalsProps) {
  const { language } = useLanguage();

  const signal = useMemo(() => {
    if (!data) return null;
    return generateTradingSignals(data);
  }, [data]);

  const texts = {
    ko: {
      title: '트레이딩 시그널',
      subtitle: 'AI 기반 매매 신호 분석',
      strong_buy: '강력 매수',
      buy: '매수',
      hold: '관망',
      sell: '매도',
      strong_sell: '강력 매도',
      entryZone: '진입 구간',
      stopLoss: '손절가',
      takeProfit: '목표가',
      tp1: 'TP1',
      tp2: 'TP2',
      tp3: 'TP3',
      riskReward: '리스크/보상',
      confidence: '신뢰도',
      signalStrength: '시그널 강도',
      trend: '추세',
      momentum: '모멘텀',
      volume: '거래량',
      pressure: '매수세',
      liquidity: '유동성',
      bullish: '강세',
      bearish: '약세',
      neutral: '중립',
      loading: '시그널 분석 중...',
      note: '분석 참고',
      ko_strong_buy_note: '모든 지표가 강세를 나타내고 있습니다. 분할 매수 전략을 고려하세요.',
      ko_buy_note: '긍정적인 시그널이 우세합니다. 진입 구간에서 매수를 고려해보세요.',
      ko_hold_note: '시장이 불확실합니다. 명확한 방향성이 나타날 때까지 관망하세요.',
      ko_sell_note: '약세 신호가 나타나고 있습니다. 리스크 관리에 주의하세요.',
      ko_strong_sell_note: '강한 하락 압력이 감지됩니다. 손절 라인을 철저히 관리하세요.',
      disclaimer: '* 투자 조언이 아닙니다. 본인의 판단하에 투자하세요.',
    },
    en: {
      title: 'Trading Signals',
      subtitle: 'AI-powered trading signal analysis',
      strong_buy: 'Strong Buy',
      buy: 'Buy',
      hold: 'Hold',
      sell: 'Sell',
      strong_sell: 'Strong Sell',
      entryZone: 'Entry Zone',
      stopLoss: 'Stop Loss',
      takeProfit: 'Take Profit',
      tp1: 'TP1',
      tp2: 'TP2',
      tp3: 'TP3',
      riskReward: 'Risk/Reward',
      confidence: 'Confidence',
      signalStrength: 'Signal Strength',
      trend: 'Trend',
      momentum: 'Momentum',
      volume: 'Volume',
      pressure: 'Buy Pressure',
      liquidity: 'Liquidity',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      loading: 'Analyzing signals...',
      note: 'Analysis Note',
      ko_strong_buy_note: 'All indicators showing bullish signals. Consider a DCA strategy.',
      ko_buy_note: 'Positive signals are dominant. Consider buying in the entry zone.',
      ko_hold_note: 'Market is uncertain. Wait for clearer direction.',
      ko_sell_note: 'Bearish signals detected. Pay attention to risk management.',
      ko_strong_sell_note: 'Strong bearish pressure detected. Manage stop loss carefully.',
      disclaimer: '* Not investment advice. Invest at your own judgment.',
    },
  };

  const t = texts[language];

  if (loading || !signal || !data) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Crosshair className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-zinc-400 font-medium">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = parseFloat(data.priceUsd);

  const getActionIcon = (action: TradingSignal['action']) => {
    switch (action) {
      case 'strong_buy': return ArrowUpCircle;
      case 'buy': return TrendingUp;
      case 'hold': return MinusCircle;
      case 'sell': return TrendingDown;
      case 'strong_sell': return ArrowDownCircle;
    }
  };

  const getActionColor = (action: TradingSignal['action']) => {
    switch (action) {
      case 'strong_buy': return 'text-green-400 bg-green-500/20 border-green-500/40';
      case 'buy': return 'text-teal-400 bg-teal-500/20 border-teal-500/40';
      case 'hold': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'sell': return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'strong_sell': return 'text-red-400 bg-red-500/20 border-red-500/40';
    }
  };

  const getStatusIcon = (status: 'bullish' | 'bearish' | 'neutral') => {
    switch (status) {
      case 'bullish': return CheckCircle;
      case 'bearish': return XCircle;
      case 'neutral': return MinusCircle;
    }
  };

  const getStatusColor = (status: 'bullish' | 'bearish' | 'neutral') => {
    switch (status) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      case 'neutral': return 'text-amber-400';
    }
  };

  const ActionIcon = getActionIcon(signal.action);
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Crosshair className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Signal */}
        <div className={`p-4 rounded-xl border-2 ${getActionColor(signal.action)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ActionIcon className="h-10 w-10" />
              <div>
                <h3 className="text-xl font-bold">{t[signal.action]}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs opacity-70">{t.confidence}:</span>
                  <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/50 rounded-full"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{signal.confidence.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black">{formatPrice(currentPrice)}</span>
            </div>
          </div>
        </div>

        {/* Signal Indicators */}
        <div>
          <h4 className="text-xs font-medium text-zinc-400 mb-2">{t.signalStrength}</h4>
          <div className="grid grid-cols-5 gap-2">
            {signal.signals.map((sig, idx) => {
              const StatusIcon = getStatusIcon(sig.status);
              return (
                <div key={idx} className="text-center p-2 bg-zinc-800/50 rounded-lg">
                  <StatusIcon className={`h-5 w-5 mx-auto ${getStatusColor(sig.status)}`} />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {t[sig.name as keyof typeof t]}
                  </p>
                  <p className="text-xs font-medium mt-0.5 text-zinc-400">{sig.weight}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trading Levels */}
        <div className="grid grid-cols-2 gap-3">
          {/* Entry Zone */}
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-zinc-400">{t.entryZone}</span>
            </div>
            <p className="text-sm font-bold text-cyan-400">
              {formatPrice(signal.entryZone.low)} - {formatPrice(signal.entryZone.high)}
            </p>
          </div>

          {/* Stop Loss */}
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-400" />
              <span className="text-xs text-zinc-400">{t.stopLoss}</span>
            </div>
            <p className="text-sm font-bold text-red-400">{formatPrice(signal.stopLoss)}</p>
          </div>
        </div>

        {/* Take Profit Levels */}
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-xs text-zinc-400">{t.takeProfit}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {signal.takeProfit.map((tp, idx) => (
              <div key={idx} className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-zinc-500">{t[`tp${idx + 1}` as keyof typeof t]}</p>
                <p className="text-sm font-bold text-green-400">{formatPrice(tp)}</p>
                <p className="text-[10px] text-green-400/70">
                  {((tp - currentPrice) / currentPrice * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk/Reward */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-zinc-400">{t.riskReward}</span>
          </div>
          <Badge className={signal.riskReward >= 2 ? 'bg-green-500/20 text-green-400' : signal.riskReward >= 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
            1:{signal.riskReward.toFixed(2)}
          </Badge>
        </div>

        {/* Note */}
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-zinc-400 mt-0.5" />
            <div>
              <span className="text-xs text-zinc-400">{t.note}</span>
              <p className="text-sm text-zinc-300 mt-1">
                {t[signal.note as keyof typeof t]}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-zinc-600 text-center">{t.disclaimer}</p>
      </CardContent>
    </Card>
  );
}
