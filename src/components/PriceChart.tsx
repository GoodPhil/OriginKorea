'use client';

import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useTheme } from '@/contexts/ThemeContext';
import { RefreshCw } from 'lucide-react';

interface PriceChartProps {
  pairAddress: string;
}

interface ChartDataPoint {
  time: string;
  date: string;
  price: number;
  timestamp: number;
}

type Period = '1d' | '7d' | '30d';

const PERIOD_LABELS: Record<Period, { ko: string; en: string }> = {
  '1d': { ko: '1일', en: '1D' },
  '7d': { ko: '7일', en: '7D' },
  '30d': { ko: '30일', en: '30D' },
};

export function PriceChart({ pairAddress }: PriceChartProps) {
  const { t, language } = useLanguage();
  const { rate: exchangeRate } = useExchangeRate();
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [period, setPeriod] = useState<Period>('7d');

  // Theme-aware colors
  const isDark = theme === 'dark';
  const colors = {
    grid: isDark ? '#374151' : '#e5e7eb',
    axis: isDark ? '#9ca3af' : '#4b5563',
    stroke: isDark ? '#ef4444' : '#dc2626',
    gradientStart: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.3)',
    gradientEnd: isDark ? 'rgba(239, 68, 68, 0)' : 'rgba(220, 38, 38, 0.05)',
    tooltipBg: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    tooltipText: isDark ? '#f3f4f6' : '#1f2937',
    tooltipLabel: isDark ? '#9ca3af' : '#6b7280',
  };

  const fetchChartData = useCallback(async (selectedPeriod: Period) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chart?period=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const result = await response.json();
      setChartData(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Chart fetch error:', err);
      setError(language === 'ko' ? '차트 데이터를 불러올 수 없습니다' : 'Unable to load chart data');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchChartData(period);

    // Refresh every 5 minutes
    const interval = setInterval(() => fetchChartData(period), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [period, fetchChartData]);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  // Format price based on language
  const formatPrice = (usdPrice: number) => {
    if (language === 'ko') {
      const krwPrice = usdPrice * exchangeRate;
      return `₩${krwPrice.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
    }
    return `$${usdPrice.toFixed(2)}`;
  };

  // Format tooltip price
  const formatTooltipPrice = (usdPrice: number) => {
    if (language === 'ko') {
      const krwPrice = usdPrice * exchangeRate;
      return `$${usdPrice.toFixed(4)} (₩${krwPrice.toLocaleString('ko-KR', { maximumFractionDigits: 0 })})`;
    }
    return `$${usdPrice.toFixed(4)}`;
  };

  if (loading && chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t('stats.loading')}
        </div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">{error}</div>
      </div>
    );
  }

  // Calculate min/max for Y-axis
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  // Get period label
  const periodLabel = language === 'ko'
    ? `최근 ${PERIOD_LABELS[period].ko}`
    : `Last ${PERIOD_LABELS[period].en}`;

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        {/* Period Selection Buttons */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriodChange(p)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {PERIOD_LABELS[p][language]}
            </button>
          ))}
        </div>

        {/* Update Info */}
        <div className="flex items-center gap-2">
          {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {language === 'ko' ? '업데이트: ' : 'Updated: '}
              {lastUpdated.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchChartData(period)}
            disabled={loading}
            className="p-1 rounded hover:bg-secondary/50 transition-colors disabled:opacity-50"
            title={language === 'ko' ? '새로고침' : 'Refresh'}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Currency Info for Korean */}
      {language === 'ko' && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-2">
          <span>1 USD = ₩{exchangeRate.toLocaleString('ko-KR')}</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.stroke} stopOpacity={isDark ? 0.4 : 0.3}/>
              <stop offset="95%" stopColor={colors.stroke} stopOpacity={isDark ? 0 : 0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="date"
            stroke={colors.axis}
            style={{ fontSize: '11px' }}
            tickFormatter={(value, index) => {
              // Adjust tick interval based on period
              const interval = period === '1d' ? 4 : period === '7d' ? 4 : 3;
              if (index % interval === 0) return value;
              return '';
            }}
            interval={0}
          />
          <YAxis
            stroke={colors.axis}
            style={{ fontSize: '10px' }}
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(value) => formatPrice(value)}
            width={language === 'ko' ? 70 : 50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: '8px',
              color: colors.tooltipText,
              padding: '12px',
              boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: colors.tooltipLabel, marginBottom: '4px' }}
            formatter={(value) => [
              formatTooltipPrice(Number(value)),
              language === 'ko' ? '가격' : 'Price'
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                const data = payload[0].payload as ChartDataPoint;
                if (period === '1d') {
                  return `${data.date} ${data.time}`;
                }
                return data.time ? `${data.date} ${data.time}` : data.date;
              }
              return label;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={colors.stroke}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        {language === 'ko'
          ? `* ${periodLabel} 가격 추이입니다. 실시간 가격은 상단 통계를 참고하세요.`
          : `* ${periodLabel} price trend. Please refer to the stats above for real-time prices.`}
      </div>
    </div>
  );
}
