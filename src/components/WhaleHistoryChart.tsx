'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface WhaleTransaction {
  id: string;
  hash: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  amountUSD: number;
  from: string;
  to: string;
  timestamp: Date;
  blockNumber?: number;
}

interface ChartDataPoint {
  date: string;
  buyVolume: number;
  sellVolume: number;
  transferVolume: number;
  totalVolume: number;
  netFlow: number;
  transactionCount: number;
}

interface WhaleHistoryChartProps {
  transactions: WhaleTransaction[];
  timeframe: '24h' | '7d' | '30d';
}

export function WhaleHistoryChart({ transactions, timeframe }: WhaleHistoryChartProps) {
  const { language } = useLanguage();

  const texts = {
    ko: {
      title: '거래량 추이',
      buyVolume: '매수',
      sellVolume: '매도',
      transferVolume: '전송',
      netFlow: '순유입',
      noData: '데이터가 없습니다',
      last24h: '최근 24시간',
      last7d: '최근 7일',
      last30d: '최근 30일',
    },
    en: {
      title: 'Volume Trend',
      buyVolume: 'Buy',
      sellVolume: 'Sell',
      transferVolume: 'Transfer',
      netFlow: 'Net Flow',
      noData: 'No data available',
      last24h: 'Last 24 Hours',
      last7d: 'Last 7 Days',
      last30d: 'Last 30 Days',
    },
  };

  const t = texts[language];

  // Process transactions into chart data
  const chartData = useMemo(() => {
    const now = new Date();
    let startTime: Date;
    let intervalMs: number;
    let intervals: number;
    let dateFormat: (d: Date) => string;

    switch (timeframe) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        intervalMs = 2 * 60 * 60 * 1000; // 2 hours
        intervals = 12;
        dateFormat = (d: Date) => `${d.getHours()}:00`;
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        intervals = 7;
        dateFormat = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        intervalMs = 3 * 24 * 60 * 60 * 1000; // 3 days
        intervals = 10;
        dateFormat = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
        break;
    }

    // Create empty data points
    const data: ChartDataPoint[] = [];
    for (let i = 0; i < intervals; i++) {
      const periodStart = new Date(startTime.getTime() + i * intervalMs);
      data.push({
        date: dateFormat(periodStart),
        buyVolume: 0,
        sellVolume: 0,
        transferVolume: 0,
        totalVolume: 0,
        netFlow: 0,
        transactionCount: 0,
      });
    }

    // Aggregate transactions into periods
    for (const tx of transactions) {
      const txTime = new Date(tx.timestamp).getTime();
      if (txTime < startTime.getTime()) continue;

      const periodIndex = Math.floor((txTime - startTime.getTime()) / intervalMs);
      if (periodIndex >= 0 && periodIndex < intervals) {
        const point = data[periodIndex];
        point.transactionCount++;
        point.totalVolume += tx.amountUSD;

        if (tx.type === 'buy') {
          point.buyVolume += tx.amountUSD;
          point.netFlow += tx.amountUSD;
        } else if (tx.type === 'sell') {
          point.sellVolume += tx.amountUSD;
          point.netFlow -= tx.amountUSD;
        } else {
          point.transferVolume += tx.amountUSD;
        }
      }
    }

    return data;
  }, [transactions, timeframe]);

  // Calculate max value for scaling
  const maxVolume = Math.max(...chartData.map(d => d.totalVolume), 1);
  const totalNetFlow = chartData.reduce((sum, d) => sum + d.netFlow, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const timeframeName = {
    '24h': t.last24h,
    '7d': t.last7d,
    '30d': t.last30d,
  }[timeframe];

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t.title}
          </CardTitle>
          <span className="text-sm text-muted-foreground">{timeframeName}</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Net Flow Summary */}
        <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
          totalNetFlow >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          {totalNetFlow >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm">{t.netFlow}:</span>
          <span className={`font-bold ${totalNetFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalNetFlow >= 0 ? '+' : ''}{formatNumber(totalNetFlow)}
          </span>
        </div>

        {/* Chart */}
        <div className="h-48 flex items-end gap-1">
          {chartData.map((point, index) => {
            const buyHeight = (point.buyVolume / maxVolume) * 100;
            const sellHeight = (point.sellVolume / maxVolume) * 100;
            const transferHeight = (point.transferVolume / maxVolume) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                {/* Bars */}
                <div className="w-full flex-1 flex flex-col justify-end gap-0.5">
                  {/* Buy bar */}
                  {buyHeight > 0 && (
                    <div
                      className="w-full bg-green-500 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${Math.max(buyHeight, 2)}%` }}
                      title={`${t.buyVolume}: ${formatNumber(point.buyVolume)}`}
                    />
                  )}
                  {/* Sell bar */}
                  {sellHeight > 0 && (
                    <div
                      className="w-full bg-red-500 transition-all hover:opacity-80"
                      style={{ height: `${Math.max(sellHeight, 2)}%` }}
                      title={`${t.sellVolume}: ${formatNumber(point.sellVolume)}`}
                    />
                  )}
                  {/* Transfer bar */}
                  {transferHeight > 0 && (
                    <div
                      className="w-full bg-blue-500 rounded-b-sm transition-all hover:opacity-80"
                      style={{ height: `${Math.max(transferHeight, 2)}%` }}
                      title={`${t.transferVolume}: ${formatNumber(point.transferVolume)}`}
                    />
                  )}
                  {/* Empty state */}
                  {point.totalVolume === 0 && (
                    <div className="w-full bg-secondary/30 rounded-sm" style={{ height: '4px' }} />
                  )}
                </div>
                {/* Label */}
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">{t.buyVolume}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-muted-foreground">{t.sellVolume}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground">{t.transferVolume}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
