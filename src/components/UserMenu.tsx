'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut, Settings, Shield, ChevronDown, Loader2 } from 'lucide-react';

export function UserMenu() {
  const { user, profile, isAdmin, isLoading, isConfigured, signOut } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const texts = {
    ko: {
      login: '로그인',
      signup: '가입 신청',
      profile: '프로필',
      settings: '설정',
      admin: '관리자',
      logout: '로그아웃',
    },
    en: {
      login: 'Login',
      signup: 'Sign Up',
      profile: 'Profile',
      settings: 'Settings',
      admin: 'Admin',
      logout: 'Logout',
    },
  };

  const t = texts[language];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    // Use full page reload to ensure complete session cleanup
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // If Supabase is not configured, don't show anything
  if (!isConfigured) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-9 w-9 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in - show login button
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.login}
        </Link>
        <Link
          href="/auth/register"
          className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t.signup}
        </Link>
      </div>
    );
  }

  // Logged in - show user menu
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-medium text-primary">
          {initials}
        </div>
        <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-lg py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[12px] font-medium bg-primary/10 text-primary rounded">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/auth/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              {t.profile}
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              {t.settings}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                {t.admin}
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-secondary transition-colors text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
