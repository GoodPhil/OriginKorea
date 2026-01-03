'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const texts = {
    ko: {
      title: 'Origin Korea 앱 설치',
      description: '홈 화면에 추가하여 더 빠르게 접속하세요',
      install: '설치하기',
      later: '나중에',
      iosTitle: 'iOS에서 앱 설치하기',
      iosStep1: '하단의 공유 버튼을 탭하세요',
      iosStep2: '"홈 화면에 추가"를 선택하세요',
      gotIt: '알겠습니다',
    },
    en: {
      title: 'Install Origin Korea',
      description: 'Add to home screen for quick access',
      install: 'Install',
      later: 'Later',
      iosTitle: 'Install on iOS',
      iosStep1: 'Tap the share button below',
      iosStep2: 'Select "Add to Home Screen"',
      gotIt: 'Got it',
    },
  };

  const t = texts[language];

  useEffect(() => {
    // Check if already dismissed recently (24 hours)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setDismissed(true);
        return;
      }
    }

    // Check if running as standalone (already installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay (3 seconds after page load)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after delay if not installed
    if (isIOSDevice && !isStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([20]);
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }

    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed, dismissed, or no prompt available (and not iOS)
  if (isStandalone || dismissed || (!showPrompt)) {
    return null;
  }

  // iOS-specific prompt
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-zinc-900/95 backdrop-blur-lg border border-zinc-700/50 rounded-2xl shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">{t.iosTitle}</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Share className="h-4 w-4 text-primary" />
                  <span>{t.iosStep1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  <span>{t.iosStep2}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5 text-zinc-500" />
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleDismiss}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {t.gotIt}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt (Chrome, Edge, etc.)
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/95 backdrop-blur-lg border border-zinc-700/50 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-0.5">{t.title}</h3>
            <p className="text-sm text-zinc-400">{t.description}</p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-foreground"
          >
            {t.later}
          </Button>
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-1.5" />
            {t.install}
          </Button>
        </div>
      </div>
    </div>
  );
}
