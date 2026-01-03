'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Twitter, Send, Github, Mail, ExternalLink,
  LogIn, UserPlus, LogOut, User, Shield,
  BarChart3, Brain, Calculator, BookOpen, Users, Crown
} from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();
  const { user, profile, isAdmin, isConfigured, signOut } = useAuth();

  const texts = {
    ko: {
      analysis: '분석',
      tools: '도구',
      resources: '리소스',
      community: '커뮤니티',
      admin: '관리자',
      login: '로그인',
      signup: '가입 신청',
      logout: '로그아웃',
      copyright: '© 2025 Origin Korea. 화폐 주권의 시대를 깨우다.',
      dataProvider: '실시간 데이터: DexScreener',
      disclaimer: '투자는 본인의 판단과 책임하에 이루어져야 합니다.',
    },
    en: {
      analysis: 'Analysis',
      tools: 'Tools',
      resources: 'Resources',
      community: 'Community',
      admin: 'Admin',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      copyright: '© 2025 Origin Korea. Awakening the Era of Financial Sovereignty.',
      dataProvider: 'Real-time data: DexScreener',
      disclaimer: 'Investments should be made at your own judgment and responsibility.',
    },
  };

  const t = texts[language];

  // Simplified link groups
  const analysisLinks = language === 'ko' ? [
    { name: 'AI 분석', href: '/ai-analysis', icon: Brain },
    { name: '기술 분석', href: '/analysis', icon: BarChart3 },
    { name: '온체인 분석', href: '/whale-monitor' },
    { name: '비교 분석', href: '/comparison' },
  ] : [
    { name: 'AI Analysis', href: '/ai-analysis', icon: Brain },
    { name: 'Technical', href: '/analysis', icon: BarChart3 },
    { name: 'On-Chain', href: '/whale-monitor' },
    { name: 'Compare', href: '/comparison' },
  ];

  const toolsLinks = language === 'ko' ? [
    { name: '계산기', href: '/calculator', icon: Calculator },
    { name: '문서', href: '/docs', icon: BookOpen },
    { name: '참고링크', href: '/bookmarks' },
    { name: '공지사항', href: '/announcements' },
  ] : [
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Docs', href: '/docs', icon: BookOpen },
    { name: 'Bookmarks', href: '/bookmarks' },
    { name: 'Announcements', href: '/announcements' },
  ];

  const resources = [
    { name: language === 'ko' ? '공식 사이트' : 'Official Site', href: 'https://originworld.org/' },
    { name: 'Medium', href: 'https://originworld.medium.com/' },
    { name: 'Whitepaper', href: 'https://origin-3.gitbook.io/origin-fearless-contract' },
    { name: 'Polygon', href: 'https://polygonscan.com/' },
  ];

  const communityLinks = language === 'ko' ? [
    { name: '커뮤니티', href: '/community', icon: Users },
    { name: '멤버십', href: '/membership', icon: Crown },
  ] : [
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Membership', href: '/membership', icon: Crown },
  ];

  const socialLinks = [
    { name: 'X', href: 'https://x.com/SaluteOrigin', icon: Twitter },
    { name: 'Telegram', href: 'https://t.me/+i7ysEedPAuVmZjJl', icon: Send },
    { name: 'GitHub', href: 'https://github.com/OriginBank', icon: Github },
    { name: 'Email', href: 'mailto:goodphil@gmail.com', icon: Mail },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      window.location.href = '/';
    }
  };

  return (
    <footer className="border-t border-border bg-background relative z-10 pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-6">

          {/* Analysis */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">{t.analysis}</h3>
            <ul className="space-y-2">
              {analysisLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">{t.tools}</h3>
            <ul className="space-y-2">
              {toolsLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">{t.resources}</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground text-sm">{t.community}</h3>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
                    title={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auth Section */}
        {isConfigured && (
          <div className="flex flex-wrap items-center justify-center gap-2 py-4 border-t border-border/30">
            {user ? (
              <>
                <Link
                  href="/auth/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  {profile?.display_name || user.email?.split('@')[0]}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    {t.admin}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {t.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  {t.signup}
                </Link>
              </>
            )}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-border/40 pt-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {t.copyright} | {t.dataProvider}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mb-2">{t.disclaimer}</p>
          <p className="text-[10px] text-muted-foreground/40">v377 | 2026.01.03</p>
        </div>
      </div>
    </footer>
  );
}
