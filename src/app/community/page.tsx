'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedPage } from '@/hooks/usePagePermission';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Twitter, Send, Github, BookOpen, Users, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function CommunityPage() {
  const { language } = useLanguage();

  // 소셜 채널 순서: 트위터, 텔레그램, 디스코드, 깃허브
  const socialChannels = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      description: {
        ko: '최신 소식과 공지사항',
        en: 'Latest news and announcements',
      },
      link: 'https://x.com/SaluteOrigin',
      color: 'text-blue-500',
    },
    {
      name: 'Telegram',
      icon: Send,
      description: {
        ko: 'Awake Korea Community',
        en: 'Awake Korea Community',
      },
      link: 'https://t.me/+i7ysEedPAuVmZjJl',
      color: 'text-cyan-500',
    },
    {
      name: 'Discord',
      icon: MessageCircle,
      description: {
        ko: '실시간 채팅과 커뮤니티 이벤트 (Coming Soon)',
        en: 'Real-time chat and community events (Coming Soon)',
      },
      link: '#',
      color: 'text-purple-500',
    },
    {
      name: 'GitHub',
      icon: Github,
      description: {
        ko: 'Origin Bank 공식 저장소',
        en: 'Origin Bank Official Repository',
      },
      link: 'https://github.com/OriginBank',
      color: 'text-gray-500',
    },
  ];

  return (
    <ProtectedPage>
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <Navigation />

      {/* Hero */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 neon-glow mb-4 sm:mb-6">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">
              {language === 'ko' ? '커뮤니티' : 'Community'}
            </span>
            {language === 'ko' ? '에 참여하세요' : ''}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {language === 'ko'
              ? '전 세계 Origin 커뮤니티와 함께 금융 혁명을 이끌어가세요'
              : 'Join the global Origin community to lead the financial revolution'}
          </p>
        </div>
      </section>

      {/* Social Channels */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            {language === 'ko' ? '소셜 채널' : 'Social Channels'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {socialChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card
                  key={channel.name}
                  className="bg-card border-border/60 hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <CardHeader className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-lg bg-secondary ${channel.color}`}>
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl">{channel.name}</CardTitle>
                          <CardDescription className="text-sm">{channel.description[language]}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="flex items-center justify-end">
                      <a
                        href={channel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 sm:px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors ${
                          channel.link === '#' ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        {channel.link === '#'
                          ? (language === 'ko' ? '준비중' : 'Coming Soon')
                          : (language === 'ko' ? '참여하기' : 'Join')}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Resources: 문서 및 가이드, 포럼, 이벤트, 거버넌스 */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            {language === 'ko' ? '커뮤니티 리소스' : 'Community Resources'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* 1. 문서 및 가이드 */}
            <Card className="bg-card border-border/60 hover:border-primary/30 transition-colors">
              <CardHeader className="px-4 sm:px-6">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 w-fit mb-2 sm:mb-3">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  {language === 'ko' ? '문서 및 가이드' : 'Docs & Guides'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {language === 'ko'
                    ? 'Origin 사용법과 기술 문서'
                    : 'Origin usage and technical documentation'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Link
                  href="/docs"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {language === 'ko' ? '문서 보기 →' : 'View Docs →'}
                </Link>
              </CardContent>
            </Card>

            {/* 2. 포럼 */}
            <Card className="bg-card border-border/60 hover:border-primary/30 transition-colors">
              <CardHeader className="px-4 sm:px-6">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 w-fit mb-2 sm:mb-3">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  {language === 'ko' ? '포럼' : 'Forum'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {language === 'ko'
                    ? '커뮤니티 토론 및 질문'
                    : 'Community discussions and questions'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Link
                  href="/community/forum"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {language === 'ko' ? '포럼 바로가기 →' : 'Go to Forum →'}
                </Link>
              </CardContent>
            </Card>

            {/* 3. 이벤트 */}
            <Card className="bg-card border-border/60 hover:border-primary/30 transition-colors">
              <CardHeader className="px-4 sm:px-6">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 w-fit mb-2 sm:mb-3">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  {language === 'ko' ? '이벤트' : 'Events'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {language === 'ko'
                    ? '커뮤니티 이벤트 및 워크샵'
                    : 'Community events and workshops'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Link
                  href="/community/events"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {language === 'ko' ? '이벤트 보기 →' : 'View Events →'}
                </Link>
              </CardContent>
            </Card>


          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </ProtectedPage>
  );
}
