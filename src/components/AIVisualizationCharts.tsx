'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  BarChart3,
  Droplets,
  Target,
  Signal,
  Gauge,
  PieChartIcon,
} from 'lucide-react';

interface IndicatorsData {
  momentum: { score: number; label: string; value: number };
  volume: { score: number; label: string; ratio: number; value: number };
  pressure: { score: number; label: string; buyRatio: number; buys: number; sells: number; total: number };
  liquidity: { score: number; label: string; ratio: number; value: number };
  marketHealth: { score: number };
  trend: { strength: number; direction: string; consistency: number };
  priceChanges: { h1: number; h6: number; h24: number };
}

interface AIVisualizationChartsProps {
  indicators: IndicatorsData | null;
  aiScore: number;
  aiLevel: string;
}

export function AIVisualizationCharts({ indicators, aiScore, aiLevel }: AIVisualizationChartsProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      radarTitle: '시장 지표 레이더',
      radarDesc: '주요 지표들의 상대적 강도 비교',
      gaugeTitle: 'AI 점수 게이지',
      gaugeDesc: '현재 시장 상태를 나타내는 종합 점수',
      signalsTitle: '실시간 시그널',
      signalsDesc: '각 지표별 현재 신호',
      distributionTitle: '매수/매도 분포',
      distributionDesc: '24시간 거래 분포',
      momentum: '모멘텀',
      volume: '거래량',
      buyPressure: '매수세',
      liquidity: '유동성',
      marketHealth: '건전성',
      trendStrength: '추세',
      buy: '매수',
      sell: '매도',
      bullish: '강세',
      bearish: '약세',
      neutral: '중립',
      strong: '강함',
      weak: '약함',
      veryBullish: '매우 강세',
      veryBearish: '매우 약세',
      signalBullish: '매수 신호',
      signalBearish: '매도 신호',
      signalNeutral: '중립 신호',
      signalCaution: '주의',
    },
    en: {
      radarTitle: 'Market Indicator Radar',
      radarDesc: 'Relative strength comparison of key indicators',
      gaugeTitle: 'AI Score Gauge',
      gaugeDesc: 'Overall score indicating current market state',
      signalsTitle: 'Real-time Signals',
      signalsDesc: 'Current signals for each indicator',
      distributionTitle: 'Buy/Sell Distribution',
      distributionDesc: '24-hour trading distribution',
      momentum: 'Momentum',
      volume: 'Volume',
      buyPressure: 'Buy Pressure',
      liquidity: 'Liquidity',
      marketHealth: 'Health',
      trendStrength: 'Trend',
      buy: 'Buy',
      sell: 'Sell',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      strong: 'Strong',
      weak: 'Weak',
      veryBullish: 'Very Bullish',
      veryBearish: 'Very Bearish',
      signalBullish: 'Buy Signal',
      signalBearish: 'Sell Signal',
      signalNeutral: 'Neutral Signal',
      signalCaution: 'Caution',
    },
  };

  const t = texts[language];

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!indicators) return [];
    return [
      {
        subject: t.momentum,
        value: Math.max(0, (indicators.momentum.score + 100) / 2),
        fullMark: 100,
      },
      {
        subject: t.volume,
        value: indicators.volume.score,
        fullMark: 100,
      },
      {
        subject: t.buyPressure,
        value: Math.max(0, (indicators.pressure.score + 100) / 2),
        fullMark: 100,
      },
      {
        subject: t.liquidity,
        value: indicators.liquidity.score,
        fullMark: 100,
      },
      {
        subject: t.marketHealth,
        value: indicators.marketHealth.score,
        fullMark: 100,
      },
      {
        subject: t.trendStrength,
        value: indicators.trend.strength,
        fullMark: 100,
      },
    ];
  }, [indicators, t]);

  // Pie chart data for buy/sell distribution
  const pieData = useMemo(() => {
    if (!indicators) return [];
    return [
      { name: t.buy, value: indicators.pressure.buys, color: '#22c55e' },
      { name: t.sell, value: indicators.pressure.sells, color: '#ef4444' },
    ];
  }, [indicators, t]);

  // Generate signals based on indicators
  const signals = useMemo(() => {
    if (!indicators) return [];

    const getSignal = (score: number, type: 'both' | 'positive' = 'both') => {
      if (type === 'positive') {
        if (score >= 70) return { type: 'bullish', icon: CheckCircle, color: 'text-green-400' };
        if (score >= 40) return { type: 'neutral', icon: Minus, color: 'text-amber-400' };
        return { type: 'bearish', icon: AlertTriangle, color: 'text-red-400' };
      }
      if (score >= 20) return { type: 'bullish', icon: TrendingUp, color: 'text-green-400' };
      if (score >= -20) return { type: 'neutral', icon: Minus, color: 'text-amber-400' };
      return { type: 'bearish', icon: TrendingDown, color: 'text-red-400' };
    };

    return [
      {
        name: t.momentum,
        icon: Zap,
        signal: getSignal(indicators.momentum.score, 'both'),
        value: `${indicators.momentum.value > 0 ? '+' : ''}${indicators.momentum.value.toFixed(2)}`,
      },
      {
        name: t.volume,
        icon: BarChart3,
        signal: getSignal(indicators.volume.score, 'positive'),
        value: `${indicators.volume.ratio.toFixed(2)}x`,
      },
      {
        name: t.buyPressure,
        icon: Activity,
        signal: getSignal(indicators.pressure.score, 'both'),
        value: `${indicators.pressure.buyRatio.toFixed(0)}%`,
      },
      {
        name: t.liquidity,
        icon: Droplets,
        signal: getSignal(indicators.liquidity.score, 'positive'),
        value: `${indicators.liquidity.ratio.toFixed(2)}x`,
      },
      {
        name: t.marketHealth,
        icon: Target,
        signal: getSignal(indicators.marketHealth.score, 'positive'),
        value: `${indicators.marketHealth.score}`,
      },
    ];
  }, [indicators, t]);

  // Gauge visualization calculation
  const gaugeAngle = useMemo(() => {
    // Convert score (-100 to 100) to angle (0 to 180)
    return ((aiScore + 100) / 200) * 180;
  }, [aiScore]);

  const getGaugeColor = (score: number) => {
    if (score >= 40) return '#22d3ee'; // cyan
    if (score >= 15) return '#14b8a6'; // teal
    if (score >= -15) return '#f59e0b'; // amber
    if (score >= -40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      very_bullish: { ko: '매우 강세', en: 'Very Bullish' },
      bullish: { ko: '상승세', en: 'Bullish' },
      neutral: { ko: '중립', en: 'Neutral' },
      bearish: { ko: '하락세', en: 'Bearish' },
      very_bearish: { ko: '매우 약세', en: 'Very Bearish' },
    };
    return labels[level]?.[language] || level;
  };

  if (!indicators) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Radar Chart */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Signal className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {t.radarTitle}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t.radarDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                />
                <Radar
                  name="Indicators"
                  dataKey="value"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Score Gauge */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {t.gaugeTitle}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t.gaugeDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center h-[220px] sm:h-[280px]">
            {/* Gauge SVG */}
            <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#3f3f46"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Colored segments */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              {/* Needle */}
              <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="35"
                  stroke={getGaugeColor(aiScore)}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="8" fill={getGaugeColor(aiScore)} />
                <circle cx="100" cy="100" r="4" fill="#18181b" />
              </g>
              {/* Score labels */}
              <text x="25" y="115" fill="#71717a" fontSize="10" textAnchor="middle">-100</text>
              <text x="100" y="25" fill="#71717a" fontSize="10" textAnchor="middle">0</text>
              <text x="175" y="115" fill="#71717a" fontSize="10" textAnchor="middle">+100</text>
            </svg>

            {/* Score display */}
            <div className="text-center mt-2 sm:mt-4">
              <div
                className="text-3xl sm:text-5xl font-black"
                style={{ color: getGaugeColor(aiScore) }}
              >
                {aiScore > 0 ? '+' : ''}{aiScore}
              </div>
              <Badge
                className="mt-2"
                style={{
                  backgroundColor: `${getGaugeColor(aiScore)}20`,
                  color: getGaugeColor(aiScore),
                }}
              >
                {getLevelLabel(aiLevel)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Signals */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {t.signalsTitle}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t.signalsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-2 sm:space-y-3">
            {signals.map((signal, index) => {
              const SignalIcon = signal.signal.icon;
              const IndicatorIcon = signal.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-700/50">
                      <IndicatorIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{signal.name}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-zinc-300">{signal.value}</span>
                    <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                      signal.signal.type === 'bullish' ? 'bg-green-500/20' :
                      signal.signal.type === 'bearish' ? 'bg-red-500/20' :
                      'bg-amber-500/20'
                    }`}>
                      <SignalIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${signal.signal.color}`} />
                      <span className={`text-[10px] sm:text-xs font-medium ${signal.signal.color}`}>
                        {signal.signal.type === 'bullish' ? t.bullish :
                         signal.signal.type === 'bearish' ? t.bearish :
                         t.neutral}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Buy/Sell Distribution */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {t.distributionTitle}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t.distributionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : String(value), '']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-zinc-300 text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Stats below pie chart */}
          <div className="flex justify-center gap-6 sm:gap-8 mt-2">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-400">
                {((indicators.pressure.buys / indicators.pressure.total) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500">{t.buy}</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-400">
                {((indicators.pressure.sells / indicators.pressure.total) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500">{t.sell}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
