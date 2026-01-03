'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, Droplets, BarChart3, Activity, Users, Coins, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';



interface TokenData {
  priceUsd: string;
  priceNative?: string;
  priceChange?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  priceChange24h: number;
  liquidity: {
    usd: number;
  };
  volume: {
    h24: number;
    h6?: number;
    h1?: number;
    buyVolume24h?: number;
    sellVolume24h?: number;
  };
  fdv: number;
  marketCap: number;
  txns?: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  makers?: {
    h24: number;
    buyers24h?: number;
    sellers24h?: number;
  };
}

interface TokenInfo {
  maxTotalSupply: string;
  holders: number;
  holdersSource: string;
}

interface StatsGridProps {
  tokenData: TokenData;
  formatNumber: (num: number) => string;
}

export function StatsGrid({ tokenData, formatNumber }: StatsGridProps) {
  const { language } = useLanguage();
  const { rate: exchangeRate, loading: rateLoading } = useExchangeRate();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenInfoLoading, setTokenInfoLoading] = useState(true);

  // Fetch token info (Max Supply, Holders)
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const response = await fetch('/api/token-info');
        if (response.ok) {
          const data = await response.json();
          setTokenInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch token info:', error);
      } finally {
        setTokenInfoLoading(false);
      }
    };

    fetchTokenInfo();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTokenInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format functions
  const formatUSD = (value: number, showSign = false) => {
    const prefix = showSign && value >= 0 ? '+' : '';
    if (Math.abs(value) >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `${prefix}${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${prefix}${(value / 1e3).toFixed(1)}K`;
    return `${prefix}${value.toFixed(2)}`;
  };

  // Format KRW value
  const formatKRW = (usdValue: number) => {
    const krwValue = usdValue * exchangeRate;
    if (krwValue >= 1e12) return `₩${(krwValue / 1e12).toFixed(2)}조`;
    if (krwValue >= 1e8) return `₩${(krwValue / 1e8).toFixed(2)}억`;
    if (krwValue >= 1e4) return `₩${(krwValue / 1e4).toFixed(1)}만`;
    return `₩${krwValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
  };

  // Format price in KRW
  const formatPriceKRW = (usdValue: number) => {
    const krwValue = usdValue * exchangeRate;
    return `₩${krwValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Data calculations
  const priceUsd = Number.parseFloat(tokenData.priceUsd);
  const priceNative = tokenData.priceNative || tokenData.priceUsd;
  const buys = tokenData.txns?.h24?.buys || 0;
  const sells = tokenData.txns?.h24?.sells || 0;
  const totalTxns = buys + sells;
  const buyRatio = totalTxns > 0 ? (buys / totalTxns) * 100 : 50;

  const buyVolume = tokenData.volume.buyVolume24h || tokenData.volume.h24 * 0.47;
  const sellVolume = tokenData.volume.sellVolume24h || tokenData.volume.h24 * 0.53;
  const volumeBuyRatio = (buyVolume / (buyVolume + sellVolume)) * 100;

  const makers = tokenData.makers?.h24 || Math.round(totalTxns / 4);
  const buyers = tokenData.makers?.buyers24h || Math.round(makers * buyRatio / 100);
  const sellers = tokenData.makers?.sellers24h || Math.round(makers * (1 - buyRatio / 100));
  const buyersRatio = makers > 0 ? (buyers / makers) * 100 : 50;

  return (
    <div className="space-y-3">
      {/* Exchange Rate Indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {rateLoading ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <span>1 USD = ₩{exchangeRate.toLocaleString('ko-KR')}</span>
        )}
      </div>

      {/* Price Row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-card border border-border/60 rounded-lg p-2.5 sm:p-4">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-[12px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              PRICE USD
            </div>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">
            ${priceUsd.toFixed(2)}
          </div>
          <div className="text-[12px] sm:text-sm font-semibold text-cyan-500 mt-0.5 sm:mt-1">
            {formatPriceKRW(priceUsd)}
          </div>
          <div className={`text-[12px] sm:text-xs mt-0.5 sm:mt-1 ${tokenData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}% (24H)
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-2.5 sm:p-4">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-[12px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              PRICE
            </div>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
          </div>
          <div className="text-base sm:text-2xl font-bold text-foreground">
            <span className="hidden sm:inline">{Number.parseFloat(priceNative).toFixed(4)}</span>
            <span className="sm:hidden">{Number.parseFloat(priceNative).toFixed(2)}</span>
            {' '}DAI
          </div>
          <div className="text-[12px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Polygon Network
          </div>
        </div>
      </div>

      {/* Liquidity, FDV, Market Cap Row */}
      <div className="grid grid-cols-3 gap-1 sm:gap-3">
        <div className="bg-card border border-border/60 rounded-lg p-1.5 sm:p-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider truncate">
              LIQUIDITY
            </div>
            <Droplets className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-blue-500 flex-shrink-0" />
          </div>
          <div className="text-xs sm:text-lg font-bold text-primary">
            {formatUSD(tokenData.liquidity.usd)}
          </div>
          <div className="text-[12px] sm:text-xs font-medium text-cyan-500 truncate">
            {formatKRW(tokenData.liquidity.usd)}
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-1.5 sm:p-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider">
              FDV
            </div>
            <TrendingUp className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-purple-500 flex-shrink-0" />
          </div>
          <div className="text-xs sm:text-lg font-bold text-foreground">
            {formatUSD(tokenData.fdv)}
          </div>
          <div className="text-[12px] sm:text-xs font-medium text-cyan-500 truncate">
            {formatKRW(tokenData.fdv)}
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-1.5 sm:p-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider truncate">
              MKT CAP
            </div>
            <Activity className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-orange-500 flex-shrink-0" />
          </div>
          <div className="text-xs sm:text-lg font-bold text-foreground">
            {formatUSD(tokenData.marketCap)}
          </div>
          <div className="text-[12px] sm:text-xs font-medium text-cyan-500 truncate">
            {formatKRW(tokenData.marketCap)}
          </div>
        </div>
      </div>

      {/* TXNS Row */}
      <div className="bg-card border border-border/60 rounded-lg p-2 sm:p-4">
        <div className="grid grid-cols-3 gap-1 sm:gap-4 items-center">
          <div>
            <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
              <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider">TXNS</div>
              <BarChart3 className="h-2 w-2 sm:h-3 sm:w-3 text-cyan-500" />
            </div>
            <div className="text-sm sm:text-xl font-bold text-foreground">{formatLargeNumber(totalTxns)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider mb-0.5">BUYS</div>
            <div className="text-xs sm:text-lg font-bold text-green-500">{formatLargeNumber(buys)}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider mb-0.5">SELLS</div>
            <div className="text-xs sm:text-lg font-bold text-red-500">{formatLargeNumber(sells)}</div>
          </div>
        </div>
        {/* Buy/Sell Progress Bar */}
        <div className="flex h-1 sm:h-2 mt-1.5 sm:mt-3 rounded-full overflow-hidden">
          <div className="bg-green-500" style={{ width: `${buyRatio}%` }} />
          <div className="bg-red-500" style={{ width: `${100 - buyRatio}%` }} />
        </div>
      </div>

      {/* Volume Row */}
      <div className="bg-card border border-border/60 rounded-lg p-2 sm:p-4">
        <div className="grid grid-cols-3 gap-1 sm:gap-4 items-center">
          <div>
            <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
              <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider">VOLUME</div>
              <BarChart3 className="h-2 w-2 sm:h-3 sm:w-3 text-orange-500" />
            </div>
            <div className="text-sm sm:text-xl font-bold text-primary">{formatUSD(tokenData.volume.h24)}</div>
            <div className="text-[12px] sm:text-xs font-medium text-cyan-500 truncate">{formatKRW(tokenData.volume.h24)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider mb-0.5">BUY VOL</div>
            <div className="text-xs sm:text-lg font-bold text-green-500">{formatUSD(buyVolume)}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider mb-0.5">SELL VOL</div>
            <div className="text-xs sm:text-lg font-bold text-red-500">{formatUSD(sellVolume)}</div>
          </div>
        </div>
        {/* Buy/Sell Volume Progress Bar */}
        <div className="flex h-1 sm:h-2 mt-1.5 sm:mt-3 rounded-full overflow-hidden">
          <div className="bg-green-500" style={{ width: `${volumeBuyRatio}%` }} />
          <div className="bg-red-500" style={{ width: `${100 - volumeBuyRatio}%` }} />
        </div>
      </div>

      {/* Makers Row */}
      <div className="bg-card border border-border/60 rounded-lg p-2 sm:p-4">
        <div className="grid grid-cols-3 gap-1 sm:gap-4 items-center">
          <div>
            <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
              <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider">MAKERS</div>
              <Users className="h-2 w-2 sm:h-3 sm:w-3 text-purple-500" />
            </div>
            <div className="text-sm sm:text-xl font-bold text-foreground">{formatLargeNumber(makers)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider mb-0.5">BUYERS</div>
            <div className="text-xs sm:text-lg font-bold text-green-500">{formatLargeNumber(buyers)}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] sm:text-[12px] text-muted-foreground uppercase tracking-wider mb-0.5">SELLERS</div>
            <div className="text-xs sm:text-lg font-bold text-red-500">{formatLargeNumber(sellers)}</div>
          </div>
        </div>
        {/* Buyers/Sellers Progress Bar */}
        <div className="flex h-1 sm:h-2 mt-1.5 sm:mt-3 rounded-full overflow-hidden">
          <div className="bg-green-500" style={{ width: `${buyersRatio}%` }} />
          <div className="bg-red-500" style={{ width: `${100 - buyersRatio}%` }} />
        </div>
      </div>

      {/* Max Total Supply & Holders Row - Optimized for mobile */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
        <div className="bg-card border border-border/60 rounded-lg p-2 sm:p-4">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
              MAX SUPPLY
            </div>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
          </div>
          {tokenInfoLoading ? (
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted-foreground" />
              <span className="text-[12px] sm:text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1">
              <div className="text-sm sm:text-xl font-bold text-foreground truncate">
                {tokenInfo?.maxTotalSupply || '791,940,729'}
              </div>
              <div className="text-[12px] sm:text-sm text-muted-foreground flex-shrink-0">
                LGNS
              </div>
            </div>
          )}
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-2 sm:p-4 relative group">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              HOLDERS
            </div>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500 flex-shrink-0" />
          </div>
          {tokenInfoLoading ? (
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted-foreground" />
              <span className="text-[12px] sm:text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {tokenInfo?.holders?.toLocaleString() || '-'}
              </div>
              <div className="text-right flex-shrink-0">
                {tokenInfo?.holdersSource && tokenInfo.holdersSource !== 'fallback' && tokenInfo.holdersSource !== 'error-fallback' && tokenInfo.holdersSource !== 'estimate' && (
                  <div className="text-[12px] sm:text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {tokenInfo.holdersSource}
                  </div>
                )}
                {(tokenInfo?.holdersSource === 'estimate' || tokenInfo?.holdersSource === 'fallback' || tokenInfo?.holdersSource === 'error-fallback') && (
                  <div className="text-[12px] sm:text-xs text-orange-500 cursor-help" title={language === 'ko' ? 'Moralis API 키를 설정하면 실시간 데이터를 볼 수 있습니다' : 'Set Moralis API key to see real-time data'}>
                    {language === 'ko' ? '추정' : 'Est.'}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Tooltip for estimated data */}
          {(tokenInfo?.holdersSource === 'estimate' || tokenInfo?.holdersSource === 'fallback' || tokenInfo?.holdersSource === 'error-fallback') && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
              {language === 'ko' ? 'Moralis API 키 설정 시 실시간 데이터 표시' : 'Set Moralis API key for real-time data'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
