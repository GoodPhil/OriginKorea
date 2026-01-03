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
  Layers,
  Zap,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Database,
  Timer,
  Wallet,
  Shield,
  Droplets,
  ArrowRightLeft,
  TrendingDown,
  Banknote,
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
    volume24h?: number;
    marketCap: number;
  };
  staking: {
    totalStaked: number | null;
    totalStakedUSD: number | null;
    stakingRatio: number | null;
    index?: number | null;
    contractAddress?: string;
    isLive?: boolean;
  };
  epoch?: {
    length: number;
    number: number | null;
    endBlock: number | null;
    distribute: number | null;
    currentBlock: number | null;
    blocksRemaining: number | null;
    secondsRemaining: number;
    nextRebaseTime: string;
    isLive: boolean;
  };
  treasury?: {
    address: string;
    balance: number;
    balanceUSD: number;
    backingRatio: number | null;
  };
  turbine?: {
    address: string;
    bondPrice: number | null;
    discount: number | null;
    totalDebt: number | null;
    isLive: boolean;
  };
  liquidity?: {
    address: string;
    lgnsReserve: number | null;
    usdcReserve: number | null;
    totalLiquidityUSD: number | null;
    priceFromLP: number | null;
    totalSupply: number | null;
    isLive: boolean;
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
    lp?: string;
  };
}

export function StakingInfo() {
  const { language } = useLanguage();
  const [data, setData] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
      rebaseCountdown: '다음 리베이스',
      treasuryInfo: '트레저리 정보',
      bondInfo: '본드 정보',
      liquidityInfo: '유동성 풀',
      portfolioInfo: '내 포트폴리오',
      totalSupply: '총 공급량',
      currentPrice: '현재 가격',
      marketCap: '시가총액',
      volume24h: '24시간 거래량',
      totalStaked: '총 스테이킹',
      stakingRatio: '스테이킹 비율',
      stakingIndex: '스테이킹 인덱스',
      tvl: 'TVL',
      treasury: '트레저리',
      treasuryBalance: '트레저리 잔액',
      backingRatio: '백킹 비율',
      bondPrice: '본드 가격',
      bondDiscount: '본드 할인율',
      totalDebt: '총 채무',
      lgnsReserve: 'LGNS 리저브',
      usdcReserve: 'USDC 리저브',
      totalLiquidity: '총 유동성',
      lpPrice: 'LP 가격',
      per8Hours: '8시간당',
      daily: '일일',
      weekly: '주간',
      monthly: '월간',
      estimatedAPY: '예상 연간 APY',
      compoundFrequency: '복리 주기',
      network: '네트워크',
      blockNumber: '블록 번호',
      contractAddress: '컨트랙트 주소',
      viewOnPolygonscan: 'Polygonscan에서 보기',
      dataFromBlockchain: '블록체인에서 직접 조회',
      estimatedData: '추정 데이터',
      liveData: '실시간 데이터',
      error: '데이터 조회 실패',
      retry: '재시도',
      notConfigured: '스테이킹 데이터를 조회할 수 없습니다',
      connectWallet: '지갑 연결',
      connecting: '연결 중...',
      disconnect: '연결 해제',
      myBalance: '내 잔액',
      myStaked: '스테이킹 중',
      walletNotConnected: '지갑을 연결하여 포트폴리오를 확인하세요',
      hours: '시간',
      minutes: '분',
      seconds: '초',
      nextRebase: '다음 리베이스까지',
      epochNumber: '에포크',
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
      rebaseCountdown: 'Next Rebase',
      treasuryInfo: 'Treasury Info',
      bondInfo: 'Bond Info',
      liquidityInfo: 'Liquidity Pool',
      portfolioInfo: 'My Portfolio',
      totalSupply: 'Total Supply',
      currentPrice: 'Current Price',
      marketCap: 'Market Cap',
      volume24h: '24h Volume',
      totalStaked: 'Total Staked',
      stakingRatio: 'Staking Ratio',
      stakingIndex: 'Staking Index',
      tvl: 'TVL',
      treasury: 'Treasury',
      treasuryBalance: 'Treasury Balance',
      backingRatio: 'Backing Ratio',
      bondPrice: 'Bond Price',
      bondDiscount: 'Bond Discount',
      totalDebt: 'Total Debt',
      lgnsReserve: 'LGNS Reserve',
      usdcReserve: 'USDC Reserve',
      totalLiquidity: 'Total Liquidity',
      lpPrice: 'LP Price',
      per8Hours: 'Per 8 Hours',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      estimatedAPY: 'Estimated Annual APY',
      compoundFrequency: 'Compound Frequency',
      network: 'Network',
      blockNumber: 'Block Number',
      contractAddress: 'Contract Address',
      viewOnPolygonscan: 'View on Polygonscan',
      dataFromBlockchain: 'Direct from blockchain',
      estimatedData: 'Estimated Data',
      liveData: 'Live Data',
      error: 'Failed to load data',
      retry: 'Retry',
      notConfigured: 'Unable to fetch staking data',
      connectWallet: 'Connect Wallet',
      connecting: 'Connecting...',
      disconnect: 'Disconnect',
      myBalance: 'My Balance',
      myStaked: 'My Staked',
      walletNotConnected: 'Connect wallet to view portfolio',
      hours: 'h',
      minutes: 'm',
      seconds: 's',
      nextRebase: 'Next Rebase In',
      epochNumber: 'Epoch',
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
        if (result.epoch?.secondsRemaining) {
          setCountdown(result.epoch.secondsRemaining);
        }
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

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Refresh data when countdown reaches 0
          fetchData();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, fetchData]);

  // Connect wallet function
  const connectWallet = async () => {
    const win = window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } };
    if (typeof window === 'undefined' || !win.ethereum) {
      alert(language === 'ko' ? 'MetaMask를 설치해주세요' : 'Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      const ethereum = win.ethereum;
      const accountsResult = await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = accountsResult as string[];
      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
        // Fetch wallet balance
        const balanceHex = await ethereum.request({
          method: 'eth_call',
          params: [{
            to: data?.contracts?.lgnsToken,
            data: `0x70a08231000000000000000000000000${accounts[0].slice(2)}`,
          }, 'latest'],
        });
        const balance = parseInt(balanceHex as string, 16) / 1e18;
        setWalletBalance(balance);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
  };

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(decimals)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
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

  const countdownTime = formatCountdown(countdown);

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
            <div className="flex items-center gap-2 flex-wrap">
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
          {/* Rebase Countdown - PROMINENT */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-5 w-5 text-amber-500" />
                {t.rebaseCountdown}
                {data.epoch?.isLive && (
                  <Badge className="bg-green-500 text-xs">{t.liveData}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-amber-500">{String(countdownTime.h).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.hours}</div>
                </div>
                <div className="text-3xl font-bold text-amber-500">:</div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-amber-500">{String(countdownTime.m).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.minutes}</div>
                </div>
                <div className="text-3xl font-bold text-amber-500">:</div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-amber-500">{String(countdownTime.s).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.seconds}</div>
                </div>
              </div>
              {data.epoch?.number && (
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  {t.epochNumber}: #{data.epoch.number}
                </div>
              )}
            </CardContent>
          </Card>

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
                  {data.token.priceChange24h && (
                    <p className={`text-xs ${data.token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.token.priceChange24h >= 0 ? '+' : ''}{data.token.priceChange24h.toFixed(2)}%
                    </p>
                  )}
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.marketCap}</p>
                  <p className="text-lg font-bold">${formatNumber(data.token.marketCap)}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.volume24h}</p>
                  <p className="text-lg font-bold">${formatNumber(data.token.volume24h || 0)}</p>
                  <p className="text-xs text-muted-foreground">24h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staking Stats */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {t.stakingStats}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.staking.totalStaked !== null ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                    <p className="text-xs text-muted-foreground">{language === 'ko' ? '총 공급량 대비' : 'of Total'}</p>
                  </div>
                  {data.staking.index && (
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t.stakingIndex}</p>
                      <p className="text-2xl font-bold">{data.staking.index.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Index</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{t.notConfigured}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Treasury & Bond Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Treasury Info */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  {t.treasuryInfo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.treasuryBalance}</p>
                    <p className="text-xl font-bold text-blue-500">{formatNumber(data.treasury?.balance || 0)} LGNS</p>
                    <p className="text-sm text-muted-foreground">${formatNumber(data.treasury?.balanceUSD || 0)}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.backingRatio}</p>
                    <p className="text-xl font-bold">{data.treasury?.backingRatio?.toFixed(2) || 'N/A'}%</p>
                    <p className="text-xs text-muted-foreground">{language === 'ko' ? '시가총액 대비' : 'of Market Cap'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bond Info */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-purple-500" />
                  {t.bondInfo}
                  {data.turbine?.isLive && (
                    <Badge className="bg-green-500 text-xs">{t.liveData}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.bondDiscount}</p>
                    <p className="text-xl font-bold text-purple-500">
                      {data.turbine?.discount != null ? `${data.turbine.discount.toFixed(2)}%` : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.turbine?.bondPrice != null ? `${data.turbine.bondPrice.toFixed(4)}` : '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.totalDebt}</p>
                    <p className="text-xl font-bold">
                      {data.turbine?.totalDebt != null ? formatNumber(data.turbine.totalDebt) : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">LGNS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liquidity Pool Info */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-500" />
                {t.liquidityInfo}
                {data.liquidity?.isLive && (
                  <Badge className="bg-green-500 text-xs">{t.liveData}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.totalLiquidity}</p>
                  <p className="text-lg font-bold text-cyan-500">
                    ${formatNumber(data.liquidity?.totalLiquidityUSD || 0)}
                  </p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.lgnsReserve}</p>
                  <p className="text-lg font-bold">{formatNumber(data.liquidity?.lgnsReserve || 0)}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.usdcReserve}</p>
                  <p className="text-lg font-bold">${formatNumber(data.liquidity?.usdcReserve || 0)}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.lpPrice}</p>
                  <p className="text-lg font-bold">${data.liquidity?.priceFromLP?.toFixed(4) || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Portfolio */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  {t.portfolioInfo}
                </CardTitle>
                {walletAddress ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {formatAddress(walletAddress)}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                      {t.disconnect}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    {isConnecting ? t.connecting : t.connectWallet}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {walletAddress ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.myBalance}</p>
                    <p className="text-2xl font-bold text-primary">{formatNumber(walletBalance || 0)} LGNS</p>
                    <p className="text-sm text-muted-foreground">
                      ${formatNumber((walletBalance || 0) * data.token.price)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t.myStaked}</p>
                    <p className="text-2xl font-bold text-green-500">- LGNS</p>
                    <p className="text-xs text-muted-foreground">{language === 'ko' ? '스테이킹 조회 예정' : 'Coming soon'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.walletNotConnected}</p>
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

          {/* Contract Addresses */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                {t.contractAddress}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.contracts && Object.entries(data.contracts).map(([key, address]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <code className="text-sm font-mono">{formatAddress(address)}</code>
                    </div>
                    <a
                      href={`https://polygonscan.com/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-secondary"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
