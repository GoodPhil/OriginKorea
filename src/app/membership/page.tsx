'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';
import {
  Crown,
  Star,
  Gem,
  Shield,
  Zap,
  Lock,
  Unlock,
  Wallet,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Bell,
  Fish,
  Brain,
  Gift,
  Users,
  Sparkles,
} from 'lucide-react';

interface MembershipTier {
  id: string;
  name: { ko: string; en: string };
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  minTokens: number;
  maxTokens: number | null;
  benefits: { ko: string[]; en: string[] };
  exclusive: { ko: string[]; en: string[] };
}

const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'bronze',
    name: { ko: '브론즈', en: 'Bronze' },
    icon: Shield,
    color: 'text-amber-600',
    bgGradient: 'from-amber-600/20 to-amber-800/10',
    borderColor: 'border-amber-600/50',
    minTokens: 100,
    maxTokens: 999,
    benefits: {
      ko: ['기본 분석 대시보드 접근', '커뮤니티 포럼 참여', '주간 리포트 이메일'],
      en: ['Basic analysis dashboard access', 'Community forum participation', 'Weekly report emails'],
    },
    exclusive: {
      ko: ['브론즈 뱃지', '전용 채팅방'],
      en: ['Bronze badge', 'Exclusive chat room'],
    },
  },
  {
    id: 'silver',
    name: { ko: '실버', en: 'Silver' },
    icon: Star,
    color: 'text-gray-400',
    bgGradient: 'from-gray-400/20 to-gray-600/10',
    borderColor: 'border-gray-400/50',
    minTokens: 1000,
    maxTokens: 9999,
    benefits: {
      ko: ['브론즈 혜택 전체 포함', 'AI 분석 페이지 접근', '실시간 가격 알림', '고래 활동 모니터'],
      en: ['All Bronze benefits included', 'AI analysis page access', 'Real-time price alerts', 'Whale activity monitor'],
    },
    exclusive: {
      ko: ['실버 뱃지', 'DAO 투표 참여권', '월간 AMA 세션'],
      en: ['Silver badge', 'DAO voting rights', 'Monthly AMA sessions'],
    },
  },
  {
    id: 'gold',
    name: { ko: '골드', en: 'Gold' },
    icon: Crown,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/20 to-yellow-700/10',
    borderColor: 'border-yellow-500/50',
    minTokens: 10000,
    maxTokens: 99999,
    benefits: {
      ko: ['실버 혜택 전체 포함', 'AI 프리미엄 예측 모델', '고급 트레이딩 시그널', '우선 고객 지원'],
      en: ['All Silver benefits included', 'AI premium prediction model', 'Advanced trading signals', 'Priority customer support'],
    },
    exclusive: {
      ko: ['골드 뱃지', 'VIP 이벤트 초대', '독점 에어드랍 자격', '1:1 컨설팅 (분기 1회)'],
      en: ['Gold badge', 'VIP event invitations', 'Exclusive airdrop eligibility', '1:1 consultation (quarterly)'],
    },
  },
  {
    id: 'platinum',
    name: { ko: '플래티넘', en: 'Platinum' },
    icon: Gem,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-400/20 to-cyan-600/10',
    borderColor: 'border-cyan-400/50',
    minTokens: 100000,
    maxTokens: null,
    benefits: {
      ko: ['골드 혜택 전체 포함', '모든 프리미엄 기능 무제한', '화이트리스트 자동 등록', '거버넌스 제안권'],
      en: ['All Gold benefits included', 'Unlimited premium features', 'Automatic whitelist registration', 'Governance proposal rights'],
    },
    exclusive: {
      ko: ['플래티넘 뱃지', 'Origin 팀과 직접 소통', '신규 기능 베타 테스트', '연간 Origin 서밋 초대'],
      en: ['Platinum badge', 'Direct communication with Origin team', 'Beta testing new features', 'Annual Origin Summit invitation'],
    },
  },
];

export default function MembershipPage() {
  const { language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const {
    isConnected,
    isConnecting,
    address: walletAddress,
    lgnsBalance,
    lgnsBalanceUSD,
    membership,
    error: walletError,
    connect,
    disconnect,
    chainId,
    switchToPolygon,
    refreshBalance,
    walletType,
    openConnectModal,
  } = useWallet();
  const [copied, setCopied] = useState(false);

  // Get current tier from wallet context
  const currentTier = MEMBERSHIP_TIERS.slice().reverse().find(t => lgnsBalance >= t.minTokens) || null;

  const texts = {
    ko: {
      title: 'LGNS 멤버십',
      subtitle: 'LGNS 토큰 보유량에 따른 프리미엄 혜택을 누리세요',
      connectWallet: '지갑 연결',
      connecting: '연결 중...',
      disconnect: '연결 해제',
      yourTier: '현재 등급',
      yourBalance: '보유 LGNS',
      noTier: '등급 없음',
      needMoreTokens: '멤버십 자격을 얻으려면 최소 100 LGNS가 필요합니다.',
      upgradeInfo: '더 높은 등급으로 업그레이드하려면 LGNS를 추가로 보유하세요.',
      benefits: '혜택',
      exclusive: '전용 특권',
      tokensRequired: '필요 토큰',
      currentBalance: '현재 보유량',
      howToJoin: '멤버십 가입 방법',
      steps: [
        'MetaMask 또는 Web3 지갑 준비',
        'Polygon 네트워크의 LGNS 토큰 구매',
        '지갑 연결 후 토큰 보유량 확인',
        '보유량에 따라 자동으로 등급 부여',
      ],
      buyLGNS: 'LGNS 구매하기',
      loginRequired: '로그인 필요',
      loginDescription: '멤버십 기능을 이용하려면 먼저 로그인해주세요.',
      login: '로그인',
      signUp: '가입 신청',
      copyAddress: '주소 복사',
      copied: '복사됨!',
      tierComparison: '등급 비교',
      refresh: '잔액 새로고침',
      wrongNetwork: 'Polygon 네트워크로 전환해주세요',
      switchNetwork: '네트워크 전환',
      walletError: '지갑 연결 오류',
      installMetamask: 'MetaMask를 설치해주세요',
    },
    en: {
      title: 'LGNS Membership',
      subtitle: 'Unlock premium benefits based on your LGNS token holdings',
      connectWallet: 'Connect Wallet',
      connecting: 'Connecting...',
      disconnect: 'Disconnect',
      yourTier: 'Your Tier',
      yourBalance: 'Your LGNS',
      noTier: 'No Tier',
      needMoreTokens: 'You need at least 100 LGNS to qualify for membership.',
      upgradeInfo: 'Hold more LGNS to upgrade to a higher tier.',
      benefits: 'Benefits',
      exclusive: 'Exclusive Perks',
      tokensRequired: 'Tokens Required',
      currentBalance: 'Current Balance',
      howToJoin: 'How to Join',
      steps: [
        'Prepare MetaMask or Web3 wallet',
        'Purchase LGNS tokens on Polygon network',
        'Connect wallet to verify token holdings',
        'Tier automatically assigned based on holdings',
      ],
      buyLGNS: 'Buy LGNS',
      loginRequired: 'Login Required',
      loginDescription: 'Please log in to access membership features.',
      login: 'Login',
      signUp: 'Sign Up',
      copyAddress: 'Copy Address',
      copied: 'Copied!',
      tierComparison: 'Tier Comparison',
      refresh: 'Refresh Balance',
      wrongNetwork: 'Please switch to Polygon network',
      switchNetwork: 'Switch Network',
      walletError: 'Wallet Error',
      installMetamask: 'Please install MetaMask',
    },
  };

  const t = texts[language];

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Check if on Polygon network
  const isPolygon = chainId === 137;

  // Login required check
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 mb-6">
              <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">{t.loginRequired}</h1>
              <p className="text-muted-foreground mb-6">{t.loginDescription}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/login">
                  <Button className="gap-2">
                    {t.login}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="gap-2">
                    {t.signUp}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-4">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-yellow-500">LGNS Token Membership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Wallet Connection Card */}
        <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
          <CardContent className="p-6">
            {/* Wallet Error */}
            {walletError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {walletError}
              </div>
            )}

            {isConnected && walletAddress ? (
              <div className="space-y-4">
                {/* Wrong Network Warning */}
                {!isPolygon && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{t.wrongNetwork}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={switchToPolygon}>
                      {t.switchNetwork}
                    </Button>
                  </div>
                )}

                {/* Connected State */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Connected {isPolygon ? '(Polygon)' : ''}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{formatAddress(walletAddress)}</code>
                        <button
                          onClick={copyAddress}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={refreshBalance}>
                      {t.refresh}
                    </Button>
                    <Button variant="outline" size="sm" onClick={disconnect}>
                      {t.disconnect}
                    </Button>
                  </div>
                </div>

                {/* Balance & Tier */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-background/50">
                    <p className="text-sm text-muted-foreground mb-1">{t.yourBalance}</p>
                    <p className="text-2xl font-bold">{formatNumber(lgnsBalance)}</p>
                    <p className="text-sm text-muted-foreground">
                      ≈ ${formatNumber(lgnsBalanceUSD)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-background/50">
                    <p className="text-sm text-muted-foreground mb-1">{t.yourTier}</p>
                    {currentTier ? (
                      <div className="flex items-center gap-2">
                        <currentTier.icon className={`h-6 w-6 ${currentTier.color}`} />
                        <span className={`text-xl font-bold ${currentTier.color}`}>
                          {currentTier.name[language]}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-muted-foreground">{t.noTier}</p>
                    )}
                  </div>
                </div>

                {/* Tier Info */}
                {currentTier && (
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${currentTier.bgGradient} border ${currentTier.borderColor}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className={`h-4 w-4 ${currentTier.color}`} />
                      <span className={`font-medium ${currentTier.color}`}>
                        {t.exclusive}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {currentTier.exclusive[language].map((perk, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-3 w-3 text-green-500" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upgrade Info */}
                {lgnsBalance > 0 && lgnsBalance < 100000 && (
                  <p className="text-sm text-muted-foreground text-center">
                    {t.upgradeInfo}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {language === 'ko'
                    ? '지갑을 연결하여 LGNS 보유량을 확인하고 멤버십 등급을 받으세요.'
                    : 'Connect your wallet to verify your LGNS holdings and receive your membership tier.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => connect('metamask')}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t.connecting}
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
                          <path d="M2.66296 1L15.6563 10.809L13.3545 4.99098L2.66296 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
                          <path d="M28.2295 23.5335L24.7346 28.872L32.2312 30.9323L34.3857 23.6501L28.2295 23.5335Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
                          <path d="M1.24414 23.6501L3.38851 30.9323L10.8752 28.872L7.39015 23.5335L1.24414 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
                        </svg>
                        MetaMask
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => connect('walletconnect')}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 300 185" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M61.4385 36.2562C104.168 -5.42064 175.632 -5.42064 218.362 36.2562L223.552 41.3125C225.776 43.4783 225.776 47.0035 223.552 49.1694L205.277 66.8977C204.165 67.9806 202.367 67.9806 201.255 66.8977L194.054 59.8979C164.577 31.1426 115.223 31.1426 85.7464 59.8979L78.0265 67.4256C76.9146 68.5085 75.1166 68.5085 74.0047 67.4256L55.7298 49.6972C53.5058 47.5314 53.5058 44.0062 55.7298 41.8404L61.4385 36.2562ZM254.364 71.4369L270.627 87.2218C272.851 89.3876 272.851 92.9128 270.627 95.0787L197.295 166.372C195.071 168.538 191.475 168.538 189.251 166.372L136.398 114.708C135.842 114.166 134.943 114.166 134.387 114.708L81.534 166.372C79.31 168.538 75.714 168.538 73.49 166.372L0.158 95.0787C-2.066 92.9128 -2.066 89.3876 0.158 87.2218L16.4215 71.4369C18.6455 69.2711 22.2415 69.2711 24.4655 71.4369L77.3185 123.101C77.8745 123.642 78.7735 123.642 79.3295 123.101L132.183 71.4369C134.407 69.2711 138.003 69.2711 140.227 71.4369L193.08 123.101C193.636 123.642 194.535 123.642 195.091 123.101L247.944 71.4369C250.168 69.2711 253.764 69.2711 255.988 71.4369H254.364Z" fill="#3B99FC"/>
                    </svg>
                    WalletConnect
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {language === 'ko'
                    ? 'WalletConnect로 모바일 지갑 연결 가능'
                    : 'Use WalletConnect for mobile wallet connection'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier Comparison */}
        <h2 className="text-2xl font-bold text-center mb-6">{t.tierComparison}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MEMBERSHIP_TIERS.map((tier) => {
            const TierIcon = tier.icon;
            const isCurrentTier = currentTier?.id === tier.id;
            const isEligible = isConnected && lgnsBalance >= tier.minTokens;

            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden transition-all ${
                  isCurrentTier
                    ? `ring-2 ring-offset-2 ring-offset-background ${tier.borderColor.replace('border-', 'ring-')}`
                    : ''
                } ${isEligible ? '' : 'opacity-70'}`}
              >
                {isCurrentTier && (
                  <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold ${tier.color} bg-background rounded-bl-lg`}>
                    {language === 'ko' ? '현재' : 'Current'}
                  </div>
                )}
                <CardHeader className={`bg-gradient-to-br ${tier.bgGradient}`}>
                  <div className="flex items-center justify-center mb-2">
                    <TierIcon className={`h-12 w-12 ${tier.color}`} />
                  </div>
                  <CardTitle className={`text-center ${tier.color}`}>
                    {tier.name[language]}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {tier.maxTokens
                      ? `${formatNumber(tier.minTokens)} - ${formatNumber(tier.maxTokens)} LGNS`
                      : `${formatNumber(tier.minTokens)}+ LGNS`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Benefits */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {t.benefits}
                      </p>
                      <ul className="space-y-1">
                        {tier.benefits[language].map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exclusive */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {t.exclusive}
                      </p>
                      <ul className="space-y-1">
                        {tier.exclusive[language].map((perk, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <Sparkles className={`h-3 w-3 ${tier.color} mt-0.5 flex-shrink-0`} />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How to Join */}
        <Card className="max-w-3xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              {t.howToJoin}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <a
                href="https://quickswap.exchange/#/swap?inputCurrency=DAI&outputCurrency=0x7a9c42b00c6d8cbbf2f4f3e1d8f4e0b3f8a5d1c2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  {t.buyLGNS}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Feature Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">AI Analysis</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <Fish className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Whale Monitor</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <Bell className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Price Alerts</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">VIP Community</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
