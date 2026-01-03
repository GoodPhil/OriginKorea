'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  BookOpen, Code, Shield, Coins, Zap, Gift, ExternalLink, Search,
  BarChart3, Users, Calculator, MessageCircle, Calendar, Play,
  ChevronRight, Sparkles, Rocket, HelpCircle, FileText, Target,
  TrendingUp, Wallet, ArrowRight, CheckCircle2, Clock, Star, Smartphone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProtectedPage } from '@/hooks/usePagePermission';

export default function DocsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const texts = {
    ko: {
      heroTitle: '문서 센터',
      heroSubtitle: 'Origin Korea의 모든 기능을 쉽게 이해하고 활용하세요',
      searchPlaceholder: '문서 검색...',
      tabs: {
        overview: '개요',
        userGuide: '사용자 가이드',
        analysis: '분석 도구',
        community: '커뮤니티',
        advanced: '고급 기능',
      },
      quickStart: {
        title: '빠른 시작',
        subtitle: '5분 안에 Origin 시작하기',
        steps: [
          { title: '사이트 방문', desc: 'originworld.org 접속' },
          { title: '분석 확인', desc: 'LGNS 실시간 데이터 확인' },
          { title: '기능 탐색', desc: '비교분석, 계산기 활용' },
          { title: '커뮤니티 참여', desc: '포럼 및 이벤트 참여' },
        ],
      },
      stats: {
        guides: { value: '30+', label: '가이드 문서' },
        features: { value: '15+', label: '핵심 기능' },
        updated: { value: '실시간', label: '데이터 업데이트' },
        support: { value: '24/7', label: '커뮤니티 지원' },
      },
      featured: {
        title: '주요 가이드',
        items: [
          { title: 'TokenPocket 지갑 설치', desc: 'Polygon 지갑 생성 및 토큰 수신 방법', icon: Wallet, link: '/docs/guide/wallet', tag: '필수' },
          { title: 'DAI/LGNS 스왑 가이드', desc: 'QuickSwap에서 토큰 교환하기', icon: Coins, link: '/docs/guide/swap', tag: '신규' },
          { title: 'LGNS 스테이킹', desc: 'Origin World에서 스테이킹하기', icon: TrendingUp, link: '/docs/guide/staking', tag: '인기' },
          { title: '스테이킹 계산기', desc: 'APY와 복리 수익 계산', icon: Calculator, link: '/calculator', tag: '추천' },
        ],
      },
      userGuide: {
        title: '사용자 가이드',
        subtitle: '단계별로 따라하는 상세 가이드',
        sections: [
          {
            title: '시작하기',
            icon: Rocket,
            items: [
              { title: 'Origin 소개', desc: '프로젝트의 비전과 목표를 알아보세요', time: '3분' },
              { title: '주요 기능 둘러보기', desc: '사이트의 모든 기능을 한눈에', time: '5분' },
              { title: '언어 및 테마 설정', desc: '한국어/영어, 다크/라이트 모드', time: '1분' },
            ],
          },
          {
            title: '지갑 연결하기',
            icon: Wallet,
            items: [
              { title: 'TokenPocket 설치', desc: 'Google Play에서 앱 다운로드', time: '2분', link: '/docs/guide/wallet' },
              { title: '지갑 생성', desc: '새 지갑 만들기 및 비밀번호 설정', time: '2분', link: '/docs/guide/wallet' },
              { title: '니모닉 백업', desc: '복구 문구 안전하게 보관하기', time: '5분', link: '/docs/guide/wallet' },
              { title: 'Polygon 네트워크 선택', desc: 'LGNS가 운영되는 네트워크 설정', time: '1분', link: '/docs/guide/wallet' },
              { title: 'POL 토큰 수신', desc: '지갑 주소 확인 및 토큰 받기', time: '1분', link: '/docs/guide/wallet' },
            ],
          },
          {
            title: '토큰 거래하기',
            icon: Coins,
            items: [
              { title: 'QuickSwap 접속', desc: 'Polygon DEX에서 토큰 교환', time: '1분', link: '/docs/guide/swap' },
              { title: 'DAI로 LGNS 구매', desc: '스테이블코인으로 LGNS 구매하기', time: '3분', link: '/docs/guide/swap' },
              { title: 'LGNS를 DAI로 판매', desc: 'LGNS를 스테이블코인으로 교환', time: '3분', link: '/docs/guide/swap' },
              { title: '슬리피지 설정', desc: '거래 설정 최적화하기', time: '2분', link: '/docs/guide/swap' },
              { title: 'LGNS 스테이킹', desc: 'Origin World에서 스테이킹', time: '5분', link: '/docs/guide/staking' },
            ],
          },
          {
            title: '분석 도구',
            icon: BarChart3,
            items: [
              { title: '실시간 가격 확인', desc: 'LGNS/DAI 가격과 변동률 분석', time: '2분' },
              { title: '유동성 분석', desc: '유동성 현황과 히스토리 확인', time: '3분' },
              { title: '거래량 분석', desc: '일별/주별/월별 거래량 통계', time: '3분' },
              { title: '기술적 지표', desc: 'RSI, 이동평균선, 변동성 분석', time: '5분' },
              { title: '고래 추적', desc: '대규모 거래 모니터링', time: '4분' },
            ],
          },
          {
            title: '비교 분석',
            icon: TrendingUp,
            items: [
              { title: '토큰 비교하기', desc: 'LGNS, AS, ASOL 실시간 비교', time: '3분' },
              { title: '차트 분석', desc: '가격 추이 비교 차트 활용', time: '4분' },
              { title: '데이터 해석', desc: '비교 데이터 올바르게 읽기', time: '5분' },
            ],
          },
          {
            title: '스테이킹 계산기',
            icon: Calculator,
            items: [
              { title: '기본 계산', desc: '스테이킹 금액과 기간 입력', time: '2분' },
              { title: '복리 수익 계산', desc: 'APY 기반 복리 수익 예측', time: '3분' },
              { title: '시나리오 분석', desc: '다양한 조건에서의 수익 비교', time: '4분' },
            ],
          },
        ],
      },
      analysisGuide: {
        title: '분석 도구 가이드',
        subtitle: '데이터 기반 의사결정을 위한 상세 안내',
        features: [
          {
            title: '실시간 가격 분석',
            icon: TrendingUp,
            desc: 'LGNS/DAI 페어의 실시간 가격, 24시간 변동률, USD/KRW 가격을 확인할 수 있습니다.',
            tips: ['가격은 30초마다 자동 업데이트됩니다', '환율은 실시간 반영됩니다', '가격 알림 기능을 활용하세요'],
          },
          {
            title: '유동성 분석',
            icon: Coins,
            desc: '풀의 총 유동성, 유동성 변화 추이, 유동성 알림을 확인합니다.',
            tips: ['유동성 증가는 시장 신뢰도 상승 신호', '급격한 감소 시 주의 필요', '히스토리 차트로 추세 파악'],
          },
          {
            title: '거래량 분석',
            icon: BarChart3,
            desc: '일별/주별/월별 거래량과 매수/매도 비율을 분석합니다.',
            tips: ['높은 거래량은 활발한 시장 활동 의미', '매수 비율이 높으면 상승 압력', '이상 거래량 감지 기능 활용'],
          },
          {
            title: '기술적 지표',
            icon: Target,
            desc: 'RSI, 이동평균선(7일/30일/90일), 지지/저항선을 제공합니다.',
            tips: ['RSI 70 이상은 과매수, 30 이하는 과매도', '이동평균선 교차점 주목', '지지선에서 매수 고려'],
          },
          {
            title: '고래 거래 추적',
            icon: Sparkles,
            desc: '$5,000 이상의 대규모 거래를 실시간으로 추적합니다.',
            tips: ['고래 매수는 상승 신호일 수 있음', '연속적인 매도는 주의 신호', '거래 임계값 조절 가능'],
          },
        ],
      },
      communityGuide: {
        title: '커뮤니티 가이드',
        subtitle: 'Origin Korea 커뮤니티와 함께하세요',
        sections: [
          {
            title: '포럼 활용하기',
            icon: MessageCircle,
            items: [
              { title: '카테고리 탐색', desc: '공지사항, 일반 토론, 기술 지원, 제안 등' },
              { title: '게시글 작성', desc: '질문하고 의견을 공유하세요' },
              { title: '댓글과 소통', desc: '다른 회원들과 활발히 교류하세요' },
            ],
          },
          {
            title: '이벤트 참여',
            icon: Calendar,
            items: [
              { title: '이벤트 확인', desc: '예정된 워크샵과 밋업 정보' },
              { title: '참가 신청', desc: '원하는 이벤트에 참여하세요' },
              { title: '온라인/오프라인', desc: '다양한 형태의 이벤트 제공' },
            ],
          },
          {
            title: '소셜 채널',
            icon: Users,
            items: [
              { title: 'X (Twitter)', desc: '최신 소식과 공지사항' },
              { title: 'Telegram', desc: 'Awake Korea 커뮤니티' },
              { title: 'GitHub', desc: 'Origin Bank 공식 저장소' },
            ],
          },
        ],
      },
      whitePapers: {
        title: '백서 및 문서',
        items: [
          { title: '스토리 백서', desc: 'Origin Fearless Contract', link: 'https://origin-3.gitbook.io/origin-fearless-contract' },
          { title: '경제 백서', desc: 'Origin Eternal Protocol', link: 'https://origin-3.gitbook.io/origin-eternal-protocol' },
          { title: '기술 백서', desc: 'Anubis Free Reels', link: 'https://origin-5.gitbook.io/anubis-free-reels' },
        ],
      },
      faq: {
        title: '자주 묻는 질문',
        items: [
          { q: 'Origin은 무엇인가요?', a: 'Origin은 LGNS 토큰 기반의 탈중앙화 금융 운영 시스템입니다. 이 사이트는 Origin 커뮤니티를 위한 정보와 분석 도구를 제공합니다.' },
          { q: '데이터는 어디서 가져오나요?', a: 'DexScreener, GeckoTerminal, Moralis API 등 신뢰할 수 있는 소스에서 실시간 데이터를 수집합니다.' },
          { q: '스테이킹은 어떻게 하나요?', a: '스테이킹은 Origin 공식 사이트(originworld.org)에서 진행하실 수 있습니다. 계산기로 예상 수익을 먼저 확인해 보세요.' },
          { q: '포럼에 글을 쓰려면 로그인이 필요한가요?', a: '네, 포럼 게시글 작성과 댓글은 로그인 후 이용 가능합니다. Google 계정으로 간편하게 가입하세요.' },
          { q: '모바일에서도 사용할 수 있나요?', a: '네, Origin Korea는 완전히 반응형으로 설계되어 모바일, 태블릿, 데스크톱 모든 기기에서 최적화되어 있습니다.' },
        ],
      },
    },
    en: {
      heroTitle: 'Documentation Center',
      heroSubtitle: 'Understand and utilize all features of Origin Korea easily',
      searchPlaceholder: 'Search documentation...',
      tabs: {
        overview: 'Overview',
        userGuide: 'User Guide',
        analysis: 'Analysis Tools',
        community: 'Community',
        advanced: 'Advanced',
      },
      quickStart: {
        title: 'Quick Start',
        subtitle: 'Get started with Origin Korea in 5 minutes',
        steps: [
          { title: 'Visit Site', desc: 'Go to originkorea.vercel.app' },
          { title: 'Check Analysis', desc: 'View LGNS real-time data' },
          { title: 'Explore Features', desc: 'Use comparison and calculator' },
          { title: 'Join Community', desc: 'Participate in forum and events' },
        ],
      },
      stats: {
        guides: { value: '30+', label: 'Guide Docs' },
        features: { value: '15+', label: 'Core Features' },
        updated: { value: 'Real-time', label: 'Data Updates' },
        support: { value: '24/7', label: 'Community Support' },
      },
      featured: {
        title: 'Featured Guides',
        items: [
          { title: 'TokenPocket Wallet Setup', desc: 'Create Polygon wallet and receive tokens', icon: Wallet, link: '/docs/guide/wallet', tag: 'Essential' },
          { title: 'DAI/LGNS Swap Guide', desc: 'Exchange tokens on QuickSwap', icon: Coins, link: '/docs/guide/swap', tag: 'New' },
          { title: 'LGNS Staking', desc: 'Stake on Origin World', icon: TrendingUp, link: '/docs/guide/staking', tag: 'Popular' },
          { title: 'Staking Calculator', desc: 'Calculate APY and compound interest', icon: Calculator, link: '/calculator', tag: 'Recommended' },
        ],
      },
      userGuide: {
        title: 'User Guide',
        subtitle: 'Step-by-step detailed guides',
        sections: [
          {
            title: 'Getting Started',
            icon: Rocket,
            items: [
              { title: 'Introduction to Origin', desc: 'Learn about the project vision and goals', time: '3 min' },
              { title: 'Feature Overview', desc: 'See all site features at a glance', time: '5 min' },
              { title: 'Language & Theme Settings', desc: 'Korean/English, Dark/Light mode', time: '1 min' },
            ],
          },
          {
            title: 'Connect Wallet',
            icon: Wallet,
            items: [
              { title: 'Install TokenPocket', desc: 'Download app from Google Play', time: '2 min', link: '/docs/guide/wallet' },
              { title: 'Create Wallet', desc: 'Set up new wallet and password', time: '2 min', link: '/docs/guide/wallet' },
              { title: 'Backup Mnemonic', desc: 'Safely store recovery phrase', time: '5 min', link: '/docs/guide/wallet' },
              { title: 'Select Polygon Network', desc: 'Configure network for LGNS', time: '1 min', link: '/docs/guide/wallet' },
              { title: 'Receive POL Token', desc: 'Get wallet address and receive tokens', time: '1 min', link: '/docs/guide/wallet' },
            ],
          },
          {
            title: 'Token Trading',
            icon: Coins,
            items: [
              { title: 'Access QuickSwap', desc: 'Exchange tokens on Polygon DEX', time: '1 min', link: '/docs/guide/swap' },
              { title: 'Buy LGNS with DAI', desc: 'Purchase LGNS with stablecoin', time: '3 min', link: '/docs/guide/swap' },
              { title: 'Sell LGNS for DAI', desc: 'Exchange LGNS for stablecoin', time: '3 min', link: '/docs/guide/swap' },
              { title: 'Slippage Settings', desc: 'Optimize trade settings', time: '2 min', link: '/docs/guide/swap' },
              { title: 'Stake LGNS', desc: 'Stake on Origin World', time: '5 min', link: '/docs/guide/staking' },
            ],
          },
          {
            title: 'Analysis Tools',
            icon: BarChart3,
            items: [
              { title: 'Real-time Price Check', desc: 'Analyze LGNS/DAI price and changes', time: '2 min' },
              { title: 'Liquidity Analysis', desc: 'Check liquidity status and history', time: '3 min' },
              { title: 'Volume Analysis', desc: 'Daily/weekly/monthly volume stats', time: '3 min' },
              { title: 'Technical Indicators', desc: 'RSI, moving averages, volatility', time: '5 min' },
              { title: 'Whale Tracking', desc: 'Monitor large transactions', time: '4 min' },
            ],
          },
          {
            title: 'Comparison Analysis',
            icon: TrendingUp,
            items: [
              { title: 'Compare Tokens', desc: 'Real-time comparison of LGNS, AS, ASOL', time: '3 min' },
              { title: 'Chart Analysis', desc: 'Using price trend comparison charts', time: '4 min' },
              { title: 'Data Interpretation', desc: 'Reading comparison data correctly', time: '5 min' },
            ],
          },
          {
            title: 'Staking Calculator',
            icon: Calculator,
            items: [
              { title: 'Basic Calculation', desc: 'Enter staking amount and period', time: '2 min' },
              { title: 'Compound Interest', desc: 'APY-based compound profit prediction', time: '3 min' },
              { title: 'Scenario Analysis', desc: 'Compare profits under various conditions', time: '4 min' },
            ],
          },
        ],
      },
      analysisGuide: {
        title: 'Analysis Tools Guide',
        subtitle: 'Detailed guide for data-driven decisions',
        features: [
          {
            title: 'Real-time Price Analysis',
            icon: TrendingUp,
            desc: 'Check real-time price, 24h change rate, and USD/KRW price of LGNS/DAI pair.',
            tips: ['Price auto-updates every 30 seconds', 'Exchange rate reflects in real-time', 'Use price alert feature'],
          },
          {
            title: 'Liquidity Analysis',
            icon: Coins,
            desc: 'View total pool liquidity, liquidity change trends, and liquidity alerts.',
            tips: ['Liquidity increase signals market confidence', 'Be cautious of sudden decreases', 'Use history chart for trend analysis'],
          },
          {
            title: 'Volume Analysis',
            icon: BarChart3,
            desc: 'Analyze daily/weekly/monthly volume and buy/sell ratios.',
            tips: ['High volume means active market', 'High buy ratio indicates upward pressure', 'Use anomaly detection'],
          },
          {
            title: 'Technical Indicators',
            icon: Target,
            desc: 'Provides RSI, moving averages (7/30/90 days), and support/resistance levels.',
            tips: ['RSI above 70 is overbought, below 30 is oversold', 'Watch moving average crossovers', 'Consider buying at support levels'],
          },
          {
            title: 'Whale Transaction Tracking',
            icon: Sparkles,
            desc: 'Track large transactions over $5,000 in real-time.',
            tips: ['Whale buys may signal uptrend', 'Consecutive sells are warning signs', 'Threshold can be adjusted'],
          },
        ],
      },
      communityGuide: {
        title: 'Community Guide',
        subtitle: 'Join the Origin Korea community',
        sections: [
          {
            title: 'Using the Forum',
            icon: MessageCircle,
            items: [
              { title: 'Browse Categories', desc: 'Announcements, discussions, support, suggestions' },
              { title: 'Create Posts', desc: 'Ask questions and share opinions' },
              { title: 'Comments & Engagement', desc: 'Actively interact with other members' },
            ],
          },
          {
            title: 'Event Participation',
            icon: Calendar,
            items: [
              { title: 'Check Events', desc: 'Upcoming workshops and meetups' },
              { title: 'Register', desc: 'Join events you are interested in' },
              { title: 'Online/Offline', desc: 'Various event formats available' },
            ],
          },
          {
            title: 'Social Channels',
            icon: Users,
            items: [
              { title: 'X (Twitter)', desc: 'Latest news and announcements' },
              { title: 'Telegram', desc: 'Awake Korea Community' },
              { title: 'GitHub', desc: 'Origin Bank official repository' },
            ],
          },
        ],
      },
      whitePapers: {
        title: 'White Papers & Documents',
        items: [
          { title: 'Story White Paper', desc: 'Origin Fearless Contract', link: 'https://origin-3.gitbook.io/origin-fearless-contract' },
          { title: 'Economic White Paper', desc: 'Origin Eternal Protocol', link: 'https://origin-3.gitbook.io/origin-eternal-protocol' },
          { title: 'Technical White Paper', desc: 'Anubis Free Reels', link: 'https://origin-5.gitbook.io/anubis-free-reels' },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          { q: 'What is Origin?', a: 'Origin is a decentralized financial operating system based on LGNS token. This site provides information and analysis tools for the Origin community.' },
          { q: 'Where does the data come from?', a: 'We collect real-time data from reliable sources such as DexScreener, GeckoTerminal, and Moralis API.' },
          { q: 'How do I stake?', a: 'Staking can be done on the official Origin site (originworld.org). Use our calculator to estimate your expected returns first.' },
          { q: 'Do I need to login to post on the forum?', a: 'Yes, posting and commenting on the forum requires login. You can easily sign up with your Google account.' },
          { q: 'Can I use it on mobile?', a: 'Yes, Origin Korea is fully responsive and optimized for mobile, tablet, and desktop devices.' },
        ],
      },
    },
  };

  const t = texts[language];

  // Search filtering
  const filteredFeatured = useMemo(() => {
    if (!searchQuery) return t.featured.items;
    const query = searchQuery.toLowerCase();
    return t.featured.items.filter(
      item => item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)
    );
  }, [searchQuery, t.featured.items]);

  return (
    <ProtectedPage>
      <div className="min-h-screen gradient-bg">
        <Navigation />

        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {language === 'ko' ? '완벽한 가이드' : 'Complete Guide'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              <span className="gradient-text">{t.heroTitle}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t.heroSubtitle}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-card border-border/60 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(t.stats).map(([key, stat]) => (
                <Card key={key} className="bg-card/50 border-border/40 text-center">
                  <CardContent className="pt-6 pb-4">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content with Tabs */}
        <section className="py-8 sm:py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex flex-wrap justify-start gap-1 bg-card/50 p-1 rounded-xl mb-8 h-auto">
                <TabsTrigger value="overview" className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">
                  {t.tabs.overview}
                </TabsTrigger>
                <TabsTrigger value="userGuide" className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">
                  {t.tabs.userGuide}
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">
                  {t.tabs.analysis}
                </TabsTrigger>
                <TabsTrigger value="community" className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">
                  {t.tabs.community}
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">
                  {t.tabs.advanced}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Quick Start */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Rocket className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{t.quickStart.title}</CardTitle>
                        <CardDescription>{t.quickStart.subtitle}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {t.quickStart.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm mb-1">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Guides */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    {t.featured.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFeatured.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link key={index} href={item.link}>
                          <Card className="bg-card border-border/60 hover:border-primary/30 transition-all group cursor-pointer h-full">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h3>
                                    <Badge variant="secondary" className="text-xs">{item.tag}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                                  <div className="flex items-center text-sm text-primary font-medium">
                                    {language === 'ko' ? '자세히 보기' : 'Learn more'}
                                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* White Papers */}
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {t.whitePapers.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {t.whitePapers.items.map((item, index) => (
                        <a
                          key={index}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                        >
                          <div>
                            <div className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                              {item.title}
                            </div>
                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Guide Tab */}
              <TabsContent value="userGuide" className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{t.userGuide.title}</h2>
                  <p className="text-muted-foreground">{t.userGuide.subtitle}</p>
                </div>

                <div className="space-y-4">
                  {t.userGuide.sections.map((section, sectionIndex) => {
                    const Icon = section.icon;
                    return (
                      <Card key={sectionIndex} className="bg-card border-border/60">
                        <Accordion type="single" collapsible>
                          <AccordionItem value={`section-${sectionIndex}`} className="border-none">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-semibold text-lg">{section.title}</span>
                                <Badge variant="outline" className="ml-2">
                                  {section.items.length} {language === 'ko' ? '항목' : 'items'}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                              <div className="space-y-3 pt-2">
                                {section.items.map((item, itemIndex) => {
                                  const content = (
                                    <div
                                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <div>
                                          <div className="font-medium text-sm group-hover:text-primary transition-colors">
                                            {item.title}
                                          </div>
                                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {item.time}
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                      </div>
                                    </div>
                                  );

                                  return 'link' in item && item.link ? (
                                    <Link key={itemIndex} href={item.link as string}>
                                      {content}
                                    </Link>
                                  ) : (
                                    <div key={itemIndex}>{content}</div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{t.analysisGuide.title}</h2>
                  <p className="text-muted-foreground">{t.analysisGuide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {t.analysisGuide.features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="bg-card border-border/60">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{feature.desc}</p>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-primary">
                              {language === 'ko' ? '팁' : 'Tips'}
                            </div>
                            <ul className="space-y-1.5">
                              {feature.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* CTA to Analysis Page */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/20">
                        <BarChart3 className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {language === 'ko' ? '직접 분석해 보세요' : 'Try it yourself'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ko' ? 'LGNS 실시간 데이터와 고급 분석 도구' : 'LGNS real-time data and advanced analysis tools'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/analysis"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {language === 'ko' ? '분석 페이지로 이동' : 'Go to Analysis'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Community Tab */}
              <TabsContent value="community" className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{t.communityGuide.title}</h2>
                  <p className="text-muted-foreground">{t.communityGuide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {t.communityGuide.sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <Card key={index} className="bg-card border-border/60">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="p-3 rounded-lg bg-secondary/30">
                                <div className="font-medium text-sm mb-1">{item.title}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* CTA to Community Page */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/20">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {language === 'ko' ? '커뮤니티에 참여하세요' : 'Join the Community'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ko' ? '포럼, 이벤트, 소셜 채널에서 만나요' : 'Meet us on forum, events, and social channels'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/community"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {language === 'ko' ? '커뮤니티로 이동' : 'Go to Community'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab - FAQ */}
              <TabsContent value="advanced" className="space-y-6">
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {t.faq.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {t.faq.items.map((item, index) => (
                        <AccordionItem key={index} value={`faq-${index}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{item.q}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">{item.a}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* More Resources */}
                <Card className="bg-card border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {language === 'ko' ? '추가 리소스' : 'Additional Resources'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <a
                        href="https://originworld.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm group-hover:text-primary transition-colors">
                              Origin World
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {language === 'ko' ? '공식 사이트' : 'Official Site'}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                      <a
                        href="https://polygonscan.com/token/0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm group-hover:text-primary transition-colors">
                              PolygonScan
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {language === 'ko' ? '토큰 컨트랙트' : 'Token Contract'}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                      <a
                        href="https://quickswap.exchange/#/swap?currency0=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&currency1=0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Coins className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm group-hover:text-primary transition-colors">
                              QuickSwap
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {language === 'ko' ? 'LGNS 거래' : 'Trade LGNS'}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                      <a
                        href="https://dexscreener.com/polygon/0x882df4b0fb50a229c3b4124eb18c759911485bfb"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium text-sm group-hover:text-primary transition-colors">
                              DexScreener
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {language === 'ko' ? '차트 및 데이터' : 'Charts & Data'}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedPage>
  );
}
