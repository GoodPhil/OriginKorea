'use client';

import { useState } from 'react';
import { AlertTriangle, Monitor, LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DuplicateSessionModalProps {
  isOpen: boolean;
  onContinueHere: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function DuplicateSessionModal({
  isOpen,
  onContinueHere,
  onLogout,
}: DuplicateSessionModalProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState<'continue' | 'logout' | null>(null);

  const texts = {
    ko: {
      title: '다른 기기에서 로그인 감지',
      message: '동일한 계정으로 다른 기기에서 로그인이 감지되었습니다. 어떻게 하시겠습니까?',
      continueHere: '이 기기에서 계속',
      continueDesc: '다른 기기의 세션을 종료하고 여기서 계속 사용합니다',
      logout: '로그아웃',
      logoutDesc: '현재 기기에서 로그아웃합니다',
      warning: '한 계정은 한 기기에서만 로그인할 수 있습니다',
    },
    en: {
      title: 'Login Detected on Another Device',
      message: 'A login with the same account has been detected on another device. What would you like to do?',
      continueHere: 'Continue Here',
      continueDesc: 'End the session on the other device and continue here',
      logout: 'Log Out',
      logoutDesc: 'Log out from this device',
      warning: 'Only one device can be logged in per account',
    },
  };

  const t = texts[language];

  const handleContinueHere = async () => {
    setIsLoading('continue');
    try {
      await onContinueHere();
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogout = async () => {
    setIsLoading('logout');
    try {
      await onLogout();
    } finally {
      setIsLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-destructive">{t.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-muted-foreground mb-6">{t.message}</p>

          <div className="space-y-3">
            {/* Continue Here Button */}
            <button
              type="button"
              onClick={handleContinueHere}
              disabled={isLoading !== null}
              className="w-full p-4 rounded-lg border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {isLoading === 'continue' ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Monitor className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t.continueHere}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{t.continueDesc}</div>
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading !== null}
              className="w-full p-4 rounded-lg border-2 border-border hover:border-destructive/30 hover:bg-destructive/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary group-hover:bg-destructive/10 transition-colors">
                  {isLoading === 'logout' ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-destructive transition-colors">{t.logout}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{t.logoutDesc}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-secondary/30 border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <AlertTriangle className="h-3 w-3" />
            {t.warning}
          </p>
        </div>
      </div>
    </div>
  );
}
