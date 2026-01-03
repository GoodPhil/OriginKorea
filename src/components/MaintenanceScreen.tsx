'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Settings, Shield, Clock, Mail, Sparkles } from 'lucide-react';

interface MaintenanceSettings {
  maintenance_mode: boolean;
  maintenance_message_ko: string;
  maintenance_message_en: string;
  maintenance_end_time: string | null;
  updated_by?: string;
}

interface MaintenanceScreenProps {
  settings: MaintenanceSettings;
}

export function MaintenanceScreen({ settings }: MaintenanceScreenProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining
  useEffect(() => {
    if (!settings.maintenance_end_time) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(settings.maintenance_end_time!).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft(language === 'ko' ? '곧 완료됩니다' : 'Completing soon');
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (language === 'ko') {
        if (hours > 0) {
          setTimeLeft(`약 ${hours}시간 ${minutes}분 후 완료 예정`);
        } else {
          setTimeLeft(`약 ${minutes}분 후 완료 예정`);
        }
      } else {
        if (hours > 0) {
          setTimeLeft(`Estimated ${hours}h ${minutes}m remaining`);
        } else {
          setTimeLeft(`Estimated ${minutes}m remaining`);
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [settings.maintenance_end_time, language]);

  const texts = {
    ko: {
      title: '시스템 점검 중',
      subtitle: 'System Maintenance',
      description: '더 나은 서비스를 위해 시스템을 점검하고 있습니다.',
      message: settings.maintenance_message_ko,
      apology: '이용에 불편을 드려 죄송합니다.',
      contact: '긴급 문의',
      telegram: '텔레그램',
      twitter: 'X (트위터)',
      email: '이메일',
      footer: '© 2026 Origin Korea. 금융 주권의 시대를 깨우다.',
      upgrading: '서비스 업그레이드 진행 중',
    },
    en: {
      title: 'Under Maintenance',
      subtitle: '시스템 점검 중',
      description: 'We are performing scheduled maintenance to improve our services.',
      message: settings.maintenance_message_en,
      apology: 'We apologize for any inconvenience.',
      contact: 'Emergency Contact',
      telegram: 'Telegram',
      twitter: 'X (Twitter)',
      email: 'Email',
      footer: '© 2026 Origin Korea. Awakening the Era of Financial Sovereignty.',
      upgrading: 'Service Upgrade in Progress',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="text-red-500">ORIGIN</span>
            <span className="text-white"> KOREA</span>
          </h1>
        </div>

        {/* Maintenance Icon with Animation */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-amber-500/30 animate-pulse" />

          {/* Center icon */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-2xl">
            <div className="relative">
              <Settings className="w-14 h-14 sm:w-16 sm:h-16 text-red-500 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 font-medium tracking-wider uppercase">
            {t.subtitle}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">
            {t.upgrading}{dots}
          </span>
        </div>

        {/* Message Card */}
        <div className="max-w-lg w-full mx-auto mb-8">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 sm:p-8">
            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-300 text-center mb-4 leading-relaxed">
              {t.description}
            </p>

            {/* Custom Message */}
            <div className="bg-zinc-800/50 rounded-xl p-4 mb-4">
              <p className="text-sm sm:text-base text-zinc-400 text-center">
                {t.message}
              </p>
            </div>

            {/* Time Remaining */}
            {timeLeft && (
              <div className="flex items-center justify-center gap-2 text-cyan-400 mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{timeLeft}</span>
              </div>
            )}

            {/* Apology */}
            <p className="text-xs sm:text-sm text-zinc-500 text-center">
              {t.apology}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xs w-full mx-auto mb-10">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded-full animate-pulse"
              style={{
                width: '60%',
                animation: 'progress 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Contact Links */}
        <div className="text-center">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">{t.contact}</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:goodphil@gmail.com"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/50 rounded-xl transition-all group"
            >
              <Mail className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
              <span className="text-sm text-zinc-400 group-hover:text-red-400 transition-colors">{t.email}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center">
        <p className="text-xs text-zinc-600">{t.footer}</p>
      </div>

      {/* CSS for progress animation */}
      <style jsx>{`
        @keyframes progress {
          0%, 100% {
            width: 30%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 40%;
          }
        }
      `}</style>
    </div>
  );
}
