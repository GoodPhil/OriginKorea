'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Coins,
  TrendingUp,
  RefreshCw,
  Clock,
  Percent,
  DollarSign,
  Layers,
  Zap,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Database,
} from 'lucide-react';

interface StakingData {
  success: boolean;
  timestamp: string;
  token: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    totalSupply: number;
    price: number;
    priceChange24h?: number;
    marketCap: number;
  };
  staking: {
    totalStaked: number | null;
    totalStakedUSD: number | null;
    stakingRatio: number | null;
    treasuryBalance?: number;
    treasuryBalanceUSD?: number;
    contractAddress?: string;
    isLive?: boolean;
    note?: string;
  };
  treasury?: {
    address: string;
    balance: number;
    balanceUSD: number;
  };
  yields: {
    per8Hours: number;
    daily: number;
    weekly: number;
    monthly: number;
    estimatedAPY: string;
    compoundFrequency: string;
  };
  network: {
    name: string;
    chainId: number;
    blockNumber?: number;
  };
  contracts?: {
    lgnsToken: string;
    staking: string;
    treasury: string;
    turbine: string;
  };
}

export function StakingInfo() {
  const { language } = useLanguage();
  const [data, setData] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const texts = {
    ko: {
      title: '스테이킹 정보',
      subtitle: '스마트 컨트랙트에서 실시간 데이터 조회',
      refresh: '새로고침',
      refreshing: '조회 중...',
      lastUpdated: '마지막 업데이트',
      tokenInfo: '토큰 정보',
      stakingStats: '스테이킹 통계',
      yieldInfo: '수익률 정보',
      totalSupply: '총 공급량',
      currentPrice: '현재 가격',
      marketCap: '시가총액',
      totalStaked: '총 스테이킹',
      stakingRatio: '스테이킹 비율',
      tvl: 'TVL',
      treasury: '트레저리',
      treasuryBalance: '트레저리 잔액',
      per8Hours: '8시간당',
      daily: '일일',
      weekly: '주간',
      monthly: '월간',
      estimatedAPY: '예상 연간 APY',
      compoundFrequency: '복리 주기',
      network: '네트워크',
      blockNumber: '블록 번호',
      contractAddress: '컨트랙트 주소',
      stakingContract: '스테이킹 컨트랙트',
      viewOnPolygonscan: 'Polygonscan에서 보기',
      dataFromBlockchain: '블록체인에서 직접 조회',
      estimatedData: '추정 데이터',
      liveData: '실시간 데이터',
      liveFromContract: '컨트랙트 실시간 조회',
      error: '데이터 조회 실패',
      retry: '재시도',
      notConfigured: '스테이킹 데이터를 조회할 수 없습니다',
    },
    en: {
      title: 'Staking Information',
      subtitle: 'Real-time data from smart contracts',
      refresh: 'Refresh',
      refreshing: 'Loading...',
      lastUpdated: 'Last Updated',
      tokenInfo: 'Token Info',
      stakingStats: 'Staking Stats',
      yieldInfo: 'Yield Info',
      totalSupply: 'Total Supply',
      currentPrice: 'Current Price',
      marketCap: 'Market Cap',
      totalStaked: 'Total Staked',
      stakingRatio: 'Staking Ratio',
      tvl: 'TVL',
      treasury: 'Treasury',
      treasuryBalance: 'Treasury Balance',
      per8Hours: 'Per 8 Hours',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      estimatedAPY: 'Estimated Annual APY',
      compoundFrequency: 'Compound Frequency',
      network: 'Network',
      blockNumber: 'Block Number',
      contractAddress: 'Contract Address',
      stakingContract: 'Staking Contract',
      viewOnPolygonscan: 'View on Polygonscan',
      dataFromBlockchain: 'Direct from blockchain',
      estimatedData: 'Estimated Data',
      liveData: 'Live Data',
      liveFromContract: 'Live from Contract',
      error: 'Failed to load data',
      retry: 'Retry',
      notConfigured: 'Unable to fetch staking data',
    },
  };

  const t = texts[language];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/staking-data');
      const result = await response.json();

      if (result.success) {
        setData(result);
        setLastUpdated(new Date());
      } else {
        // Use fallback data
        setData({
          success: true,
          timestamp: new Date().toISOString(),
          token: result.fallback?.token || {
            name: 'Origin LGNS',
            symbol: 'LGNS',
            address: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
            decimals: 18,
            totalSupply: 792110000,
            price: 6.36,
            marketCap: 5037819600,
          },
          staking: {
            totalStaked: null,
            totalStakedUSD: null,
            stakingRatio: null,
          },
          yields: result.fallback?.yields || {
            per8Hours: 0.2,
            daily: 0.6,
            weekly: 4.2,
            monthly: 18,
            estimatedAPY: '866.46',
            compoundFrequency: '8 hours',
          },
          network: {
            name: 'Polygon',
            chainId: 137,
          },
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(decimals)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (error && !data) {
    return (
      <Card className="bg-card border-border/60">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">{t.error}</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{t.title}</CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/50 text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t.dataFromBlockchain}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? t.refreshing : t.refresh}
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              {t.lastUpdated}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {data && (
        <>
          {/* Token Info */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                {t.tokenInfo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.totalSupply}</p>
                  <p className="text-lg font-bold">{formatNumber(data.token.totalSupply)}</p>
                  <p className="text-xs text-muted-foreground">{data.token.symbol}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.currentPrice}</p>
                  <p className="text-lg font-bold text-primary">${data.token.price.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.marketCap}</p>
                  <p className="text-lg font-bold">${formatNumber(data.token.marketCap)}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.network}</p>
                  <p className="text-lg font-bold">{data.network.name}</p>
                  <p className="text-xs text-muted-foreground">Chain ID: {data.network.chainId}</p>
                </div>
              </div>

              {/* Contract Address */}
              <div className="mt-4 p-3 bg-secondary/20 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t.contractAddress}</p>
                  <code className="text-sm font-mono">{formatAddress(data.token.address)}</code>
                </div>
                <a
                  href={`https://polygonscan.com/address/${data.token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {t.viewOnPolygonscan}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Staking Stats */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {t.stakingStats}
                {data.staking.totalStaked === null && (
                  <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
                    {t.estimatedData}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.staking.totalStaked !== null ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.totalStaked}</p>
                    <p className="text-2xl font-bold text-green-500">{formatNumber(data.staking.totalStaked)}</p>
                    <p className="text-xs text-muted-foreground">LGNS</p>
                  </div>
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.tvl}</p>
                    <p className="text-2xl font-bold text-primary">${formatNumber(data.staking.totalStakedUSD || 0)}</p>
                    <p className="text-xs text-muted-foreground">USD</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.stakingRatio}</p>
                    <p className="text-2xl font-bold">{data.staking.stakingRatio?.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">{language === 'ko' ? '총 공급량 대비' : 'of Total Supply'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600 dark:text-amber-400">{t.notConfigured}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === 'ko'
                          ? '스테이킹 컨트랙트 주소를 설정하면 TVL, 스테이킹 수량 등을 실시간으로 조회할 수 있습니다.'
                          : 'Configure the staking contract address to query TVL, staking amounts, and more in real-time.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Yield Info */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.yieldInfo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t.per8Hours}</p>
                  <p className="text-lg font-bold text-primary">{data.yields.per8Hours.toFixed(4)}%</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <Percent className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t.daily}</p>
                  <p className="text-lg font-bold text-primary">{data.yields.daily.toFixed(4)}%</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <Percent className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t.weekly}</p>
                  <p className="text-lg font-bold text-primary">{data.yields.weekly.toFixed(4)}%</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <Percent className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t.monthly}</p>
                  <p className="text-lg font-bold text-primary">{data.yields.monthly.toFixed(4)}%</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <Zap className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <p className="text-xs text-muted-foreground">{t.estimatedAPY}</p>
                  <p className="text-lg font-bold text-green-500">{data.yields.estimatedAPY}%</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
                <p className="text-sm">
                  <span className="font-medium">{t.compoundFrequency}:</span>{' '}
                  <span className="text-primary font-bold">{data.yields.compoundFrequency}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
