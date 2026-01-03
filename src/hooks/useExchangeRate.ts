'use client';

import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rate: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const DEFAULT_RATE = 1450;

export function useExchangeRate(): ExchangeRateData {
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/exchange-rate');

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        setRate(data.rate);
        setLastUpdated(new Date(data.timestamp));
        setError(null);
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError('Failed to fetch exchange rate');
        // Keep using the default or previously fetched rate
      } finally {
        setLoading(false);
      }
    };

    fetchRate();

    // Refresh every hour
    const interval = setInterval(fetchRate, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { rate, loading, error, lastUpdated };
}

// Utility function to format KRW
export function formatKRW(usdValue: number, exchangeRate: number): string {
  const krwValue = usdValue * exchangeRate;

  if (krwValue >= 1e12) return `₩${(krwValue / 1e12).toFixed(2)}조`;
  if (krwValue >= 1e8) return `₩${(krwValue / 1e8).toFixed(2)}억`;
  if (krwValue >= 1e4) return `₩${(krwValue / 1e4).toFixed(2)}만`;
  return `₩${krwValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
}

// Utility function to format USD
export function formatUSD(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}
