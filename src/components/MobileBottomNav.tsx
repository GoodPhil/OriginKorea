'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Home,
  BarChart3,
  Brain,
  Calculator,
  Menu,
  X,
  BookOpen,
  Users,
  BookmarkCheck,
  GitCompare,
  Bell,
  Fish,
  Crown,
  Wrench,
  Info,
} from 'lucide-react';

// Primary navigation items (always visible) - 5 items max
const primaryNavItems = [
  { key: 'home', href: '/', icon: Home, label_ko: '홈', label_en: 'Home' },
  { key: 'ai', href: '/ai-analysis', icon: Brain, label_ko: 'AI분석', label_en: 'AI' },
  { key: 'analysis', href: '/analysis', icon: BarChart3, label_ko: '분석', label_en: 'Analysis' },
  { key: 'calculator', href: '/calculator', icon: Calculator, label_ko: '계산기', label_en: 'Calc' },
  { key: 'more', href: '#more', icon: Menu, label_ko: '더보기', label_en: 'More' },
];

// Secondary navigation items - Grouped by category
const secondaryNavGroups = {
  ko: [
    {
      key: 'analysis-group',
      label: '분석 도구',
      items: [
        { key: 'comparison', href: '/comparison', icon: GitCompare, label: '비교 분석' },
        { key: 'whale-monitor', href: '/whale-monitor', icon: Fish, label: '고래 추적' },
      ]
    },
    {
      key: 'tools-group',
      label: '도구 & 정보',
      items: [
        { key: 'bookmarks', href: '/bookmarks', icon: BookmarkCheck, label: '참고링크' },
        { key: 'docs', href: '/docs', icon: BookOpen, label: '문서' },
        { key: 'announcements', href: '/announcements', icon: Bell, label: '공지사항' },
      ]
    },
    {
      key: 'community-group',
      label: '커뮤니티',
      items: [
        { key: 'community', href: '/community', icon: Users, label: '커뮤니티' },
        { key: 'membership', href: '/membership', icon: Crown, label: '멤버십' },
      ]
    },
  ],
  en: [
    {
      key: 'analysis-group',
      label: 'Analysis Tools',
      items: [
        { key: 'comparison', href: '/comparison', icon: GitCompare, label: 'Compare' },
        { key: 'whale-monitor', href: '/whale-monitor', icon: Fish, label: 'Whale Tracker' },
      ]
    },
    {
      key: 'tools-group',
      label: 'Tools & Info',
      items: [
        { key: 'bookmarks', href: '/bookmarks', icon: BookmarkCheck, label: 'Bookmarks' },
        { key: 'docs', href: '/docs', icon: BookOpen, label: 'Docs' },
        { key: 'announcements', href: '/announcements', icon: Bell, label: 'Announcements' },
      ]
    },
    {
      key: 'community-group',
      label: 'Community',
      items: [
        { key: 'community', href: '/community', icon: Users, label: 'Community' },
        { key: 'membership', href: '/membership', icon: Crown, label: 'Membership' },
      ]
    },
  ]
};

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
};

interface MobileBottomNavProps {
  notificationCount?: number;
}

export function MobileBottomNav({ notificationCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastNavigationTime = useRef<number>(0);

  const NAVIGATION_COOLDOWN = 300;
  const groups = secondaryNavGroups[language];

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close expanded menu when route changes
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleNavigation = useCallback((href: string, e?: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastNavigationTime.current < NAVIGATION_COOLDOWN) {
      e?.preventDefault();
      return false;
    }
    if (isActive(href)) {
      return false;
    }
    lastNavigationTime.current = now;
    triggerHaptic('light');
    return true;
  }, [pathname]);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic('light');
    setIsExpanded(!isExpanded);
  };

  const handleTouchStart = (key: string) => {
    setPressedKey(key);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setPressedKey(null);
    }, 100);
  };

  return (
    <>
      {/* Backdrop for expanded menu */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
          onTouchEnd={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded menu - Grouped */}
      <div
        className={`
          fixed bottom-[76px] left-0 right-0 z-40 lg:hidden
          transition-all duration-300 ease-out
          ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <div className="mx-3 mb-2 p-3 bg-zinc-900/98 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto">
          {groups.map((group, groupIndex) => (
            <div key={group.key}>
              {/* Group Label */}
              <div className="px-2 py-1.5 text-xs font-semibold text-primary/80 uppercase tracking-wider">
                {group.label}
              </div>

              {/* Group Items */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const isPressed = pressedKey === item.key;

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={(e) => {
                        if (!handleNavigation(item.href, e)) {
                          e.preventDefault();
                        }
                      }}
                      onTouchStart={() => handleTouchStart(item.key)}
                      onTouchEnd={handleTouchEnd}
                      className={`
                        relative flex items-center gap-2.5 p-3 rounded-xl transition-all select-none
                        ${active
                          ? 'bg-primary/20 text-primary'
                          : isPressed
                            ? 'bg-zinc-700/80 text-foreground scale-95'
                            : 'text-zinc-400 hover:text-foreground hover:bg-zinc-800/50 active:bg-zinc-700/80 active:scale-95'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Divider between groups */}
              {groupIndex < groups.length - 1 && (
                <div className="border-t border-zinc-700/30 mb-3" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation bar */}
      <nav
        ref={containerRef}
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="bg-zinc-900/98 backdrop-blur-xl border-t border-zinc-700/50">
          <div className="flex items-center justify-around px-1 py-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isMoreButton = item.key === 'more';
              const active = isMoreButton ? isExpanded : isActive(item.href);
              const isPressed = pressedKey === item.key;

              if (isMoreButton) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={handleMoreClick}
                    onTouchStart={() => handleTouchStart(item.key)}
                    onTouchEnd={handleTouchEnd}
                    className={`
                      flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all select-none
                      ${active
                        ? 'text-primary'
                        : isPressed
                          ? 'text-foreground scale-90'
                          : 'text-zinc-500 hover:text-foreground active:scale-90'
                      }
                    `}
                  >
                    <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-primary/20' : isPressed ? 'bg-zinc-700' : ''}`}>
                      {active ? <X className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className="text-[10px] font-medium">
                      {active
                        ? (language === 'ko' ? '닫기' : 'Close')
                        : (language === 'ko' ? item.label_ko : item.label_en)
                      }
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    if (!handleNavigation(item.href, e)) {
                      e.preventDefault();
                    }
                  }}
                  onTouchStart={() => handleTouchStart(item.key)}
                  onTouchEnd={handleTouchEnd}
                  className={`
                    flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all select-none
                    ${active
                      ? 'text-primary'
                      : isPressed
                        ? 'text-foreground scale-90'
                        : 'text-zinc-500 hover:text-foreground active:scale-90'
                    }
                  `}
                >
                  <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-primary/20' : isPressed ? 'bg-zinc-700' : ''}`}>
                    <Icon className="h-5 w-5" />
                    {item.key === 'announcements' && notificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">
                    {language === 'ko' ? item.label_ko : item.label_en}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-[72px] lg:hidden" />
    </>
  );
}
