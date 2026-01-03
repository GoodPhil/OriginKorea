'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsGrid } from '@/components/StatsGrid';
import { Roadmap } from '@/components/Roadmap';
import { CompactAISentiment } from '@/components/CompactAISentiment';
import { Navigation } from '@/components/Navigation';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Users, Calculator, BookmarkCheck, Bell, BarChart3, GitCompare, Fish, Brain } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AnnouncementPopup } from '@/components/AnnouncementPopup';

// Icon mapping for dynamic menu items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  BookOpen,
  BookmarkCheck,
  Calculator,
  Users,
  Bell,
  GitCompare,
  Fish,
  Brain,
};

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
  pairAddress: string;
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

export default function Home() {
  const { t, language } = useLanguage();
  const { footerItems } = useMenuItems();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Use API proxy to avoid CORS issues
        const response = await fetch('/api/dex');
        const data = await response.json();
        if (data.pair) {
          setTokenData(data.pair);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Announcement Popup */}
      <AnnouncementPopup />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 sm:py-20 md:py-28 px-4 relative z-10 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-1/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto text-center">
          {/* Main Title with gradient */}
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 sm:mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              ORIGIN
            </span>
            <span className="text-foreground"> KOREA</span>
          </h2>

          {/* Subtitle with emphasis */}
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/90 mb-4 max-w-3xl mx-auto px-2 font-medium">
            {t('hero.subtitle')}
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 mb-8">
            {t('hero.description')}
          </p>

          {/* Compact AI Sentiment - Click to go to AI Analysis page */}
          <Link href="/ai-analysis" className="block max-w-md mx-auto mb-8 hover:scale-[1.02] transition-transform">
            <CompactAISentiment data={tokenData} loading={loading} />
          </Link>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/analysis"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              <BarChart3 className="h-5 w-5" />
              {language === 'ko' ? '기술 분석 보기' : 'View Technical Analysis'}
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-all hover:scale-105 border border-border"
            >
              <Calculator className="h-5 w-5" />
              {language === 'ko' ? '스테이킹 계산기' : 'Calculator'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-12 px-4 relative z-10">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">{t('stats.loading')}</div>
          ) : tokenData ? (
            <StatsGrid tokenData={tokenData} formatNumber={formatNumber} />
          ) : (
            <div className="text-center text-muted-foreground">{t('stats.error')}</div>
          )}
        </div>
      </section>

      {/* Token Info Section */}
      <section className="py-12 px-4 relative z-10">
        <div className="container mx-auto">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle>{t('token.name')}</CardTitle>
              <CardDescription>
                {t('token.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2 text-primary">{t('token.intro.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('token.intro.content')}
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">{t('token.features.title')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {t('token.features.1')}</li>
                    <li>• {t('token.features.2')}</li>
                    <li>• {t('token.features.3')}</li>
                    <li>• {t('token.features.4')}</li>
                    <li>• {t('token.features.5')}</li>
                  </ul>
                </div>
                <div className="border-l-4 border-chart-2 pl-4">
                  <h3 className="font-semibold mb-2">{t('token.participate.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('token.participate.content')}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-border/40">
                <div className="flex gap-2 flex-wrap">
                  <Badge>Polygon Network</Badge>
                  <Badge variant="outline">QuickSwap DEX</Badge>
                  <Badge variant="outline">DeFi</Badge>
                  <Badge variant="outline">Algorithmic</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmap */}
      <Roadmap />

      {/* Quick Links Section - Dynamic from menu items */}
      <section className="py-12 sm:py-16 px-4 bg-secondary/30 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
              {t('links.title')}
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground">
              {t('links.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
            {footerItems.map((item) => {
              const Icon = iconMap[item.icon];
              // Get description from translations based on item key
              const descKey = `links.${item.key}.desc`;
              return (
                <Link key={item.key} href={item.href}>
                  <Card className="bg-card border-border/60 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader className="p-2 sm:p-4">
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 w-fit mb-1 sm:mb-2">
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />}
                      </div>
                      <CardTitle className="text-xs sm:text-sm md:text-base leading-tight">
                        {language === 'ko' ? item.label_ko : item.label_en}
                      </CardTitle>
                      <CardDescription className="hidden sm:block text-xs">
                        {t(descKey) !== descKey ? t(descKey) : (language === 'ko' ? item.label_ko : item.label_en)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
