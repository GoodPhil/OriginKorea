'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Menu, X, BarChart3, BookOpen, BookmarkCheck, Calculator, Users,
  Bell, GitCompare, Fish, Brain, ChevronDown, Wrench, Info
} from 'lucide-react';

// Grouped menu structure
const menuGroups = {
  ko: [
    {
      key: 'analysis',
      label: '분석',
      icon: BarChart3,
      items: [
        { key: 'ai-analysis', href: '/ai-analysis', label: 'AI 분석', icon: Brain, desc: 'AI 기반 시장 분석' },
        { key: 'analysis', href: '/analysis', label: '기술 분석', icon: BarChart3, desc: '차트 및 지표 분석' },
        { key: 'whale-monitor', href: '/whale-monitor', label: '온체인 분석', icon: Fish, desc: '온체인 데이터 분석' },
        { key: 'comparison', href: '/comparison', label: '비교 분석', icon: GitCompare, desc: '토큰 비교' },
      ]
    },
    {
      key: 'tools',
      label: '도구',
      icon: Wrench,
      items: [
        { key: 'calculator', href: '/calculator', label: '스테이킹', icon: Calculator, desc: '스테이킹 정보 및 계산' },
        { key: 'bookmarks', href: '/bookmarks', label: '참고링크', icon: BookmarkCheck, desc: '유용한 링크 모음' },
      ]
    },
    {
      key: 'info',
      label: '정보',
      icon: Info,
      items: [
        { key: 'docs', href: '/docs', label: '문서', icon: BookOpen, desc: '가이드 및 백서' },
        { key: 'announcements', href: '/announcements', label: '공지사항', icon: Bell, desc: '최신 공지' },
      ]
    },
    {
      key: 'community',
      label: '커뮤니티',
      icon: Users,
      items: [
        { key: 'community', href: '/community', label: '커뮤니티', icon: Users, desc: '포럼 및 이벤트' },
      ]
    },
  ],
  en: [
    {
      key: 'analysis',
      label: 'Analysis',
      icon: BarChart3,
      items: [
        { key: 'ai-analysis', href: '/ai-analysis', label: 'AI Analysis', icon: Brain, desc: 'AI-powered market analysis' },
        { key: 'analysis', href: '/analysis', label: 'Technical', icon: BarChart3, desc: 'Charts & indicators' },
        { key: 'whale-monitor', href: '/whale-monitor', label: 'On-Chain', icon: Fish, desc: 'On-chain data analysis' },
        { key: 'comparison', href: '/comparison', label: 'Compare', icon: GitCompare, desc: 'Token comparison' },
      ]
    },
    {
      key: 'tools',
      label: 'Tools',
      icon: Wrench,
      items: [
        { key: 'calculator', href: '/calculator', label: 'Staking', icon: Calculator, desc: 'Staking info & calc' },
        { key: 'bookmarks', href: '/bookmarks', label: 'Bookmarks', icon: BookmarkCheck, desc: 'Useful links' },
      ]
    },
    {
      key: 'info',
      label: 'Info',
      icon: Info,
      items: [
        { key: 'docs', href: '/docs', label: 'Docs', icon: BookOpen, desc: 'Guides & whitepapers' },
        { key: 'announcements', href: '/announcements', label: 'Announcements', icon: Bell, desc: 'Latest updates' },
      ]
    },
    {
      key: 'community',
      label: 'Community',
      icon: Users,
      items: [
        { key: 'community', href: '/community', label: 'Community', icon: Users, desc: 'Forum & events' },
      ]
    },
  ]
};

// Dropdown Menu Component
function DropdownMenu({ group, isOpen, onToggle, onClose }: {
  group: typeof menuGroups.ko[0];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const Icon = group.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isOpen
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        }`}
      >
        <Icon className="h-4 w-4" />
        {group.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 py-2 bg-zinc-900/95 backdrop-blur-lg border border-zinc-700/50 rounded-xl shadow-xl z-50">
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-colors"
              >
                <ItemIcon className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const groups = menuGroups[language];

  const handleDropdownToggle = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-primary">ORIGIN</span>
              <span className="text-foreground"> KOREA</span>
            </span>
          </Link>

          {/* Desktop Menu Links - Grouped Dropdowns */}
          <div className="hidden lg:flex items-center gap-1">
            {groups.map((group) => (
              <DropdownMenu
                key={group.key}
                group={group}
                isOpen={openDropdown === group.key}
                onToggle={() => handleDropdownToggle(group.key)}
                onClose={handleDropdownClose}
              />
            ))}
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Grouped */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-4 border-t border-border pt-4 max-h-[70vh] overflow-y-auto">
            {groups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.key} className="space-y-1">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary">
                    <GroupIcon className="h-4 w-4" />
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="flex items-center gap-3 px-6 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ItemIcon className="h-4 w-4" />
                        <div>
                          <span>{item.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground/70">- {item.desc}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
