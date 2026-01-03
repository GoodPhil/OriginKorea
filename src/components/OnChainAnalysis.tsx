'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Fish,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  PieChart,
  BarChart3,
  Zap,
  Lock,
  Unlock,
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OnChainData {
  current: {
    price: number;
    volume24h: number;
    liquidity: number;
    txns24h?: { buys: number; sells: number };
  };
  holdersData?: {
    total: number;
    topHolders: {
      address: string;
      shortAddress: string;
      balanceFormatted: number;
      percentage: number;
    }[];
    isEstimated: boolean;
  };
  whaleTransactions?: {
    txHash: string;
    timestamp: number;
    date: string;
    type: 'buy' | 'sell';
    amountUSD: number;
    amountToken: number;
    priceAtTrade: number;
    priceImpact: number;
    shortWallet: string;
  }[];
}

interface OnChainAnalysisProps {
  data: OnChainData | null;
  loading?: boolean;
}

export function OnChainAnalysis({ data, loading }: OnChainAnalysisProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: '온체인 분석',
      description: '블록체인 데이터 기반 심층 분석',
      whaleActivity: '고래 활동',
      recentWhales: '최근 대규모 거래',
      holderDistribution: '홀더 분포',
      topHolders: '상위 홀더',
      exchangeFlow: '거래소 흐름',
      netFlow: '순 흐름',
      inflow: '유입',
      outflow: '유출',
      totalHolders: '총 홀더 수',
      concentration: '집중도',
      whaleRatio: '고래 비율',
      buy: '매수',
      sell: '매도',
      noData: '데이터 없음',
      estimated: '추정',
      loading: '로딩 중...',
      whaleBuyPressure: '고래 매수 압력',
      whaleSellPressure: '고래 매도 압력',
      neutral: '중립',
      bullish: '강세',
      bearish: '약세',
      accumulationPhase: '축적 단계',
      distributionPhase: '분배 단계',
      healthyDistribution: '건강한 분포',
      highConcentration: '높은 집중도',
      lockedTokens: '잠긴 토큰',
      circulatingSupply: '유통 공급량',
    },
    en: {
      title: 'On-Chain Analysis',
      description: 'Deep analysis based on blockchain data',
      whaleActivity: 'Whale Activity',
      recentWhales: 'Recent Large Transactions',
      holderDistribution: 'Holder Distribution',
      topHolders: 'Top Holders',
      exchangeFlow: 'Exchange Flow',
      netFlow: 'Net Flow',
      inflow: 'Inflow',
      outflow: 'Outflow',
      totalHolders: 'Total Holders',
      concentration: 'Concentration',
      whaleRatio: 'Whale Ratio',
      buy: 'Buy',
      sell: 'Sell',
      noData: 'No data',
      estimated: 'Estimated',
      loading: 'Loading...',
      whaleBuyPressure: 'Whale Buy Pressure',
      whaleSellPressure: 'Whale Sell Pressure',
      neutral: 'Neutral',
      bullish: 'Bullish',
      bearish: 'Bearish',
      accumulationPhase: 'Accumulation Phase',
      distributionPhase: 'Distribution Phase',
      healthyDistribution: 'Healthy Distribution',
      highConcentration: 'High Concentration',
      lockedTokens: 'Locked Tokens',
      circulatingSupply: 'Circulating Supply',
    },
  };

  const t = texts[language];

  // Calculate whale metrics
  const whaleMetrics = useMemo(() => {
    if (!data?.whaleTransactions || data.whaleTransactions.length === 0) {
      return null;
    }

    const recentTxns = data.whaleTransactions.slice(0, 20);
    const buyTxns = recentTxns.filter(tx => tx.type === 'buy');
    const sellTxns = recentTxns.filter(tx => tx.type === 'sell');

    const totalBuyVolume = buyTxns.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const totalSellVolume = sellTxns.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const netFlow = totalBuyVolume - totalSellVolume;

    const buyCount = buyTxns.length;
    const sellCount = sellTxns.length;
    const buyRatio = recentTxns.length > 0 ? buyCount / recentTxns.length : 0.5;

    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (buyRatio > 0.6) sentiment = 'bullish';
    else if (buyRatio < 0.4) sentiment = 'bearish';

    return {
      buyCount,
      sellCount,
      totalBuyVolume,
      totalSellVolume,
      netFlow,
      buyRatio,
      sentiment,
      recentTxns,
    };
  }, [data?.whaleTransactions]);

  // Calculate holder metrics
  const holderMetrics = useMemo(() => {
    if (!data?.holdersData) {
      return null;
    }

    const { total, topHolders, isEstimated } = data.holdersData;

    // Calculate concentration (top 10 holders)
    const top10Percentage = topHolders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);

    // Determine distribution health
    let distributionHealth: 'healthy' | 'concentrated' = 'healthy';
    if (top10Percentage > 50) distributionHealth = 'concentrated';

    // Estimate whale ratio (holders with > 1% of supply)
    const whaleCount = topHolders.filter(h => h.percentage > 1).length;

    return {
      total,
      top10Percentage,
      distributionHealth,
      whaleCount,
      isEstimated,
      topHolders: topHolders.slice(0, 5),
    };
  }, [data?.holdersData]);

  // Holder distribution chart data
  const holderChartData = useMemo(() => {
    if (!holderMetrics) return [];

    const top5Total = holderMetrics.topHolders.reduce((sum, h) => sum + h.percentage, 0);

    return [
      ...holderMetrics.topHolders.map((h, i) => ({
        name: h.shortAddress,
        value: h.percentage,
        color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i] || '#6b7280',
      })),
      {
        name: language === 'ko' ? '기타' : 'Others',
        value: Math.max(0, 100 - top5Total),
        color: '#374151',
      },
    ];
  }, [holderMetrics, language]);

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
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

  return (
    <div className="space-y-4">
      {/* 1. Token Supply Analysis - 토큰 공급 분석 */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            {language === 'ko' ? '토큰 공급 분석' : 'Token Supply Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Zap className="h-3.5 w-3.5" />
                {language === 'ko' ? '총 공급량' : 'Total Supply'}
              </div>
              <div className="text-sm font-bold">792.11M</div>
              <div className="text-xs text-muted-foreground">LGNS</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Unlock className="h-3.5 w-3.5" />
                {t.circulatingSupply}
              </div>
              <div className="text-sm font-bold">~650M</div>
              <div className="text-xs text-muted-foreground">82%</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Lock className="h-3.5 w-3.5" />
                {t.lockedTokens}
              </div>
              <div className="text-sm font-bold">~142M</div>
              <div className="text-xs text-muted-foreground">18%</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Wallet className="h-3.5 w-3.5" />
                {language === 'ko' ? '팀 할당' : 'Team Allocation'}
              </div>
              <div className="text-sm font-bold">10%</div>
              <div className="text-xs text-muted-foreground">{language === 'ko' ? '베스팅 중' : 'Vesting'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Holder Distribution Section - 홀더 분포 */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                {t.holderDistribution}
              </CardTitle>
              <CardDescription>{t.topHolders}</CardDescription>
            </div>
            {holderMetrics && (
              <Badge
                variant="outline"
                className={
                  holderMetrics.distributionHealth === 'healthy'
                    ? 'border-green-500/50 text-green-400'
                    : 'border-yellow-500/50 text-yellow-400'
                }
              >
                {holderMetrics.isEstimated && `${t.estimated} `}
                {holderMetrics.distributionHealth === 'healthy' ? t.healthyDistribution : t.highConcentration}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {holderMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stats */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Users className="h-3.5 w-3.5" />
                    {t.totalHolders}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {holderMetrics.total.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <PieChart className="h-3.5 w-3.5" />
                    {t.concentration} (Top 10)
                  </div>
                  <div className="text-xl font-bold">
                    {holderMetrics.top10Percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Fish className="h-3.5 w-3.5" />
                    {t.whaleRatio} ({'>'}1%)
                  </div>
                  <div className="text-xl font-bold">{holderMetrics.whaleCount}</div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={holderChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {holderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, '']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t.noData}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Whale Activity Section - 고래 활동 */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Fish className="h-5 w-5 text-primary" />
                {t.whaleActivity}
              </CardTitle>
              <CardDescription>{t.recentWhales}</CardDescription>
            </div>
            {whaleMetrics && (
              <Badge
                variant="outline"
                className={
                  whaleMetrics.sentiment === 'bullish'
                    ? 'border-green-500/50 text-green-400'
                    : whaleMetrics.sentiment === 'bearish'
                      ? 'border-red-500/50 text-red-400'
                      : 'border-yellow-500/50 text-yellow-400'
                }
              >
                {whaleMetrics.sentiment === 'bullish'
                  ? t.bullish
                  : whaleMetrics.sentiment === 'bearish'
                    ? t.bearish
                    : t.neutral}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {whaleMetrics ? (
            <div className="space-y-4">
              {/* Whale Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-1.5 text-green-400 text-xs mb-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {t.buy}
                  </div>
                  <div className="text-lg font-bold text-green-400">{whaleMetrics.buyCount}</div>
                  <div className="text-xs text-muted-foreground">
                    ${(whaleMetrics.totalBuyVolume / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-1.5 text-red-400 text-xs mb-1">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    {t.sell}
                  </div>
                  <div className="text-lg font-bold text-red-400">{whaleMetrics.sellCount}</div>
                  <div className="text-xs text-muted-foreground">
                    ${(whaleMetrics.totalSellVolume / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 col-span-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Activity className="h-3.5 w-3.5" />
                    {t.netFlow}
                  </div>
                  <div className={`text-lg font-bold ${whaleMetrics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {whaleMetrics.netFlow >= 0 ? '+' : ''}${(whaleMetrics.netFlow / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {whaleMetrics.netFlow >= 0 ? t.accumulationPhase : t.distributionPhase}
                  </div>
                </div>
              </div>

              {/* Recent Whale Transactions */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {whaleMetrics.recentTxns.slice(0, 5).map((tx, i) => (
                  <div
                    key={tx.txHash || i}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${tx.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {tx.type === 'buy' ? (
                          <ArrowUpRight className="h-3 w-3 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{tx.shortWallet}</div>
                        <div className="text-xs text-muted-foreground">{tx.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        ${tx.amountUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.amountToken.toLocaleString(undefined, { maximumFractionDigits: 0 })} LGNS
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t.noData}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
