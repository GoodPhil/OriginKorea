'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Coins, Users, FileCode, Droplets, Copy, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// LGNS Token and Pool addresses
const TOKEN_ADDRESS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01';
const POOL_ADDRESS = '0x882df4B0fB50a229C3B4124EB18c759911485bFb';

interface TokenInfo {
  maxTotalSupply: string;
  holders: number;
  holdersSource: string;
  totalSupplySource: string;
  decimals: number;
}

interface TokenInfoCardProps {
  showTitle?: boolean;
  compact?: boolean;
}

export function TokenInfoCard({ showTitle = true, compact = false }: TokenInfoCardProps) {
  const { language } = useLanguage();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

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
        setLoading(false);
      }
    };

    fetchTokenInfo();
    const interval = setInterval(fetchTokenInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const texts = {
    ko: {
      tokenInfo: '토큰 정보',
      maxSupply: 'MAX TOTAL SUPPLY',
      holders: 'HOLDERS',
      tokenContract: '토큰 계약 주소',
      liquidityPool: '유동성 풀 주소',
      copyAddress: '주소 복사',
      viewOnPolygonScan: 'PolygonScan에서 보기',
      viewOnDexScreener: 'DexScreener에서 보기',
      estimated: '추정값',
      source: '데이터',
    },
    en: {
      tokenInfo: 'Token Info',
      maxSupply: 'MAX TOTAL SUPPLY',
      holders: 'HOLDERS',
      tokenContract: 'TOKEN CONTRACT',
      liquidityPool: 'LIQUIDITY POOL',
      copyAddress: 'Copy address',
      viewOnPolygonScan: 'View on PolygonScan',
      viewOnDexScreener: 'View on DexScreener',
      estimated: 'Estimated',
      source: 'Source',
    },
  };

  const t = texts[language];

  const content = (
    <div className="space-y-2 sm:space-y-3">
      {/* Max Total Supply & Holders Row */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2'} gap-1.5 sm:gap-3`}>
        <div className="bg-secondary/30 border border-border/40 rounded-lg p-2 sm:p-4">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
              {t.maxSupply}
            </div>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
          </div>
          {loading ? (
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
          {tokenInfo?.totalSupplySource && tokenInfo.totalSupplySource !== 'fallback' && (
            <div className="text-[12px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {t.source}: {tokenInfo.totalSupplySource}
            </div>
          )}
        </div>

        <div className="bg-secondary/30 border border-border/40 rounded-lg p-2 sm:p-4">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              {t.holders}
            </div>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500 flex-shrink-0" />
          </div>
          {loading ? (
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
                  <div className="text-[12px] sm:text-xs text-muted-foreground">
                    {tokenInfo.holdersSource}
                  </div>
                )}
                {(tokenInfo?.holdersSource === 'estimate' || tokenInfo?.holdersSource === 'fallback' || tokenInfo?.holdersSource === 'error-fallback') && (
                  <div className="text-[12px] sm:text-xs text-orange-500">
                    {t.estimated}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract & Pool Address Row */}
      <div className="grid grid-cols-1 gap-1.5 sm:gap-3">
        {/* Token Contract Address */}
        <div className="bg-secondary/30 border border-border/40 rounded-lg p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <FileCode className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
                {t.tokenContract}
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(TOKEN_ADDRESS, 'token')}
                className="p-1 sm:p-1.5 rounded-md hover:bg-secondary/80 transition-colors active:scale-95"
                title={t.copyAddress}
              >
                {copiedAddress === 'token' ? (
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
              <a
                href={`https://polygonscan.com/token/${TOKEN_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 sm:p-1.5 rounded-md hover:bg-secondary/80 transition-colors active:scale-95"
                title={t.viewOnPolygonScan}
              >
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <code className="text-[12px] sm:text-sm font-mono text-primary bg-background/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded block overflow-x-auto whitespace-nowrap">
              <span className="hidden sm:inline">{TOKEN_ADDRESS}</span>
              <span className="sm:hidden">{shortenAddress(TOKEN_ADDRESS)}</span>
            </code>
          </div>
        </div>

        {/* Pool/Pair Address */}
        <div className="bg-secondary/30 border border-border/40 rounded-lg p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
                {t.liquidityPool}
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(POOL_ADDRESS, 'pool')}
                className="p-1 sm:p-1.5 rounded-md hover:bg-secondary/80 transition-colors active:scale-95"
                title={t.copyAddress}
              >
                {copiedAddress === 'pool' ? (
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
              <a
                href={`https://dexscreener.com/polygon/${POOL_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 sm:p-1.5 rounded-md hover:bg-secondary/80 transition-colors active:scale-95"
                title={t.viewOnDexScreener}
              >
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <code className="text-[12px] sm:text-sm font-mono text-blue-400 bg-background/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded block overflow-x-auto whitespace-nowrap">
              <span className="hidden sm:inline">{POOL_ADDRESS}</span>
              <span className="sm:hidden">{shortenAddress(POOL_ADDRESS)}</span>
            </code>
          </div>
          <div className="mt-1 sm:mt-2 text-[12px] sm:text-xs text-muted-foreground">
            QuickSwap V2 • LGNS/DAI
          </div>
        </div>
      </div>
    </div>
  );

  if (showTitle) {
    return (
      <Card className="bg-card border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            {t.tokenInfo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
