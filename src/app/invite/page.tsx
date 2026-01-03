'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Sparkles,
  BarChart3,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Calculator,
  BookOpen,
  ArrowRight,
  Lock,
  CheckCircle,
  Gift,
  Rocket,
  ExternalLink,
  Activity,
  X,
  UserCheck,
  KeyRound,
} from 'lucide-react';

export default function InvitePage() {
  const { language } = useLanguage();
  const [showNewYearPopup, setShowNewYearPopup] = useState(false);

  // Show popup on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewYearPopup(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const texts = {
    ko: {
      badge: '프라이빗 초대장',
      title: 'ORIGIN KOREA',
      subtitle: '금융 주권의 시대를 열다',
      description: '이 사이트는 운영자가 직접 초대한 분들만 이용할 수 있는 프라이빗 커뮤니티입니다.',
      privateNotice: '초대 전용 프라이빗 사이트',
      privateDescription: '본 사이트는 운영자(PHIL)가 직접 초대한 분들만 접근할 수 있습니다. 초대받지 않은 분은 이용이 제한됩니다.',
      exclusive: '독점 기능',
      features: [
        {
          icon: Brain,
          title: 'AI 시장 분석',
          description: '실시간 AI 기반 LGNS 시장 감성 분석 및 점수 시스템',
        },
        {
          icon: BarChart3,
          title: '심층 분석 대시보드',
          description: '가격, 유동성, 거래량, 고래 추적 등 종합 온체인 데이터',
        },
        {
          icon: Calculator,
          title: '스테이킹 계산기',
          description: '복리 수익 시뮬레이션 및 투자 수익률 계산',
        },
        {
          icon: TrendingUp,
          title: '토큰 비교 분석',
          description: '최대 10개 토큰의 실시간 데이터 비교 및 레이더 차트',
        },
        {
          icon: BookOpen,
          title: '전문 가이드',
          description: '지갑 설정, 스왑, 스테이킹 등 단계별 가이드 제공',
        },
        {
          icon: Users,
          title: '커뮤니티',
          description: '이벤트, 포럼, 북마크 등 커뮤니티 기능',
        },
      ],
      whyJoin: '왜 ORIGIN KOREA인가?',
      reasons: [
        '실시간 온체인 데이터 기반 분석',
        'AI 기반 시장 감성 점수',
        '한국어/영어 완벽 지원',
        '프라이빗 커뮤니티 접근',
        '독점 가이드 및 리소스',
      ],
      cta: '사이트 입장하기',
      ctaDescription: '초대받은 분들만 이용 가능한 프라이빗 커뮤니티입니다.',
      visitSite: '사이트 입장',
      limitedAccess: '초대 전용 접근',
      limitedDescription: '이 사이트는 운영자가 직접 초대한 분들만 이용할 수 있습니다. 모든 기능은 승인된 회원에게만 제공됩니다.',
      invitedBy: '운영자 초대 전용',
      footer: '© 2026 Origin Korea. 금융 주권의 시대를 깨우다.',
      version: 'v296',
      newYearTitle: '2026 병오년',
      newYearSubtitle: '붉은 말의 해',
      newYearMessage: '새해 복 많이 받으세요',
      closePopup: '확인',
    },
    en: {
      badge: 'Private Invitation',
      title: 'ORIGIN KOREA',
      subtitle: 'Awakening the Era of Financial Sovereignty',
      description: 'This is a private community accessible only to those personally invited by the operator.',
      privateNotice: 'Invitation-Only Private Site',
      privateDescription: 'This site is accessible only to those personally invited by the operator (PHIL). Uninvited visitors will have limited access.',
      exclusive: 'Exclusive Features',
      features: [
        {
          icon: Brain,
          title: 'AI Market Analysis',
          description: 'Real-time AI-based LGNS market sentiment analysis and scoring system',
        },
        {
          icon: BarChart3,
          title: 'Deep Analysis Dashboard',
          description: 'Comprehensive on-chain data including price, liquidity, volume, and whale tracking',
        },
        {
          icon: Calculator,
          title: 'Staking Calculator',
          description: 'Compound interest simulation and ROI calculation',
        },
        {
          icon: TrendingUp,
          title: 'Token Comparison',
          description: 'Real-time data comparison of up to 10 tokens with radar charts',
        },
        {
          icon: BookOpen,
          title: 'Expert Guides',
          description: 'Step-by-step guides for wallet setup, swaps, staking, and more',
        },
        {
          icon: Users,
          title: 'Community',
          description: 'Events, forums, bookmarks, and community features',
        },
      ],
      whyJoin: 'Why ORIGIN KOREA?',
      reasons: [
        'Real-time on-chain data analysis',
        'AI-powered market sentiment scoring',
        'Full Korean/English support',
        'Private community access',
        'Exclusive guides and resources',
      ],
      cta: 'Enter Site',
      ctaDescription: 'This is a private community available only to invited members.',
      visitSite: 'Enter Site',
      limitedAccess: 'Invitation-Only Access',
      limitedDescription: 'This site is accessible only to those personally invited by the operator. All features are available only to approved members.',
      invitedBy: 'By Invitation Only',
      footer: '© 2026 Origin Korea. Awakening the Era of Financial Sovereignty.',
      version: 'v296',
      newYearTitle: '2026',
      newYearSubtitle: 'Year of the Horse',
      newYearMessage: 'Happy New Year',
      closePopup: 'Continue',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* New Year Popup Modal - Elegant & Sophisticated */}
      {showNewYearPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-amber-500/20 shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowNewYearPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
            >
              <X className="h-4 w-4 text-zinc-400" />
            </button>

            {/* Gold accent line at top */}
            <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            {/* Content */}
            <div className="p-8 sm:p-10 text-center">
              {/* Elegant Horse Image from GitHub */}
              <div className="mb-8">
                <img
                  src="https://raw.githubusercontent.com/GoodPhil/OriginKorea/main/public/images/red-horse.png"
                  alt="2026 Year of the Horse"
                  className="w-full max-w-sm mx-auto rounded-xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Year */}
              <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-2">
                {t.newYearSubtitle}
              </p>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl font-light text-white mb-2 tracking-wide">
                {t.newYearTitle}
              </h2>

              {/* Message */}
              <p className="text-lg sm:text-xl text-zinc-400 font-light mb-8">
                {t.newYearMessage}
              </p>

              {/* Elegant divider */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowNewYearPopup(false)}
                className="bg-transparent border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 font-medium px-10 py-3 rounded-full transition-colors"
              >
                {t.closePopup}
              </Button>
            </div>

            {/* Gold accent line at bottom */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          </div>
        </div>
      )}

      {/* Language Toggle */}
      <div className="fixed top-6 right-6 z-40">
        <LanguageToggle />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-zinc-950 to-cyan-950/20" />
        <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-12 sm:py-20 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Private Badge - Emphasized */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-red-500/30 to-amber-500/20 border-2 border-red-500/50 mb-6 sm:mb-8 shadow-lg shadow-red-500/20">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              <span className="text-sm sm:text-base font-bold text-red-300">{t.badge}</span>
              <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>

            {/* Logo */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4">
              <span className="text-red-500">ORIGIN</span>{' '}
              <span className="text-white">KOREA</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 mb-4 sm:mb-6">
              {t.subtitle}
            </p>

            {/* Private Notice - New Prominent Section */}
            <div className="max-w-2xl mx-auto mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/30">
              <div className="flex items-center justify-center gap-3 mb-3">
                <UserCheck className="h-6 w-6 text-red-400" />
                <span className="text-lg sm:text-xl font-bold text-red-400">{t.privateNotice}</span>
                <Shield className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-sm sm:text-base text-zinc-400">
                {t.privateDescription}
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
              {t.description}
            </p>

            {/* CTA Button - Single button only */}
            <div className="flex justify-center">
              <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl rounded-xl shadow-lg shadow-red-500/25">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  {t.visitSite}
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Live Stats Preview */}
            <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="px-4 py-2.5 bg-zinc-800/80 backdrop-blur rounded-xl border border-zinc-700/50 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium">LGNS</span>
                <span className="text-cyan-400 font-bold">$6.41</span>
              </div>
              <div className="px-4 py-2.5 bg-zinc-800/80 backdrop-blur rounded-xl border border-zinc-700/50 flex items-center gap-2">
                <Brain className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium">AI Score</span>
                <span className="text-teal-400 font-bold">+10</span>
              </div>
              <div className="px-4 py-2.5 bg-zinc-800/80 backdrop-blur rounded-xl border border-zinc-700/50 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">24H</span>
                <span className="text-green-400 font-bold">+1.27%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-3 sm:mb-4">
              <Zap className="h-3 w-3 mr-1" />
              {t.exclusive}
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t.exclusive}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {t.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-zinc-800/50 border-zinc-700/50 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="p-2.5 sm:p-3 w-fit rounded-xl bg-gradient-to-br from-red-500/20 to-cyan-500/20 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-zinc-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{t.whyJoin}</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {t.reasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-green-500/30 transition-colors">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <span className="text-base sm:text-lg">{reason}</span>
                </div>
              ))}
            </div>

            {/* Limited Access Notice - Emphasized */}
            <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-500/15 to-amber-500/15 border-2 border-red-500/40 shadow-lg shadow-red-500/10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500/20 shrink-0">
                  <Lock className="h-7 w-7 text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-red-400">{t.limitedAccess}</h3>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
                      {t.invitedBy}
                    </Badge>
                  </div>
                  <p className="text-base sm:text-lg text-zinc-300">{t.limitedDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/40 mb-6">
              <Gift className="h-4 w-4 text-red-400" />
              <span className="text-sm sm:text-base font-bold text-red-300">{t.badge}</span>
              <Lock className="h-4 w-4 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{t.cta}</h2>
            <p className="text-base sm:text-lg text-zinc-400 mb-8">{t.ctaDescription}</p>

            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-10 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl rounded-xl shadow-lg shadow-red-500/25">
                <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                {t.visitSite}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-zinc-800">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm sm:text-base text-zinc-400 font-medium">{t.footer}</p>
          <p className="text-xs text-zinc-600">Origin Korea {t.version} | Private Invitation Only</p>
        </div>
      </footer>
    </div>
  );
}
