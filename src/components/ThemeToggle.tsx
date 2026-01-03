'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function ThemeToggle() {
  const { mode, theme, toggleTheme, isTransitioning } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTooltipText = () => {
    switch (mode) {
      case 'dark':
        return language === 'ko' ? '라이트 모드로 전환' : 'Switch to Light';
      case 'light':
        return language === 'ko' ? '시스템 설정 사용' : 'Use System';
      case 'system':
        return language === 'ko' ? '다크 모드로 전환' : 'Switch to Dark';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'dark':
        return language === 'ko' ? '다크' : 'Dark';
      case 'light':
        return language === 'ko' ? '라이트' : 'Light';
      case 'system':
        return language === 'ko' ? '시스템' : 'System';
    }
  };

  const getIcon = () => {
    if (mode === 'system') {
      return <Monitor className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]" />;
    }
    if (theme === 'dark') {
      return <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    }
    return <Moon className="h-5 w-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]" />;
  };

  const getBackgroundStyle = () => {
    if (mode === 'system') {
      return theme === 'dark'
        ? 'bg-zinc-800 hover:bg-zinc-700 border border-cyan-500/30'
        : 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-300';
    }
    if (theme === 'dark') {
      return 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700';
    }
    return 'bg-amber-50 hover:bg-amber-100 border border-amber-200';
  };

  const getGlowStyle = () => {
    if (mode === 'system') {
      return 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20';
    }
    if (theme === 'dark') {
      return 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20';
    }
    return 'bg-gradient-to-br from-amber-300/30 to-orange-300/30';
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className="relative p-2.5 rounded-xl bg-secondary/80 hover:bg-secondary transition-all duration-300"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={toggleTheme}
        disabled={isTransitioning}
        className={`
          relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden
          ${getBackgroundStyle()}
          ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100 hover:scale-105'}
          focus:outline-none focus:ring-2 focus:ring-primary/50
          disabled:cursor-wait
        `}
        aria-label={getTooltipText()}
      >
        {/* Background glow effect */}
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${getGlowStyle()}`} />

        {/* Icon container with rotation animation */}
        <div className={`
          relative z-10 transition-all duration-300
          ${isTransitioning ? 'rotate-180 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}>
          {getIcon()}
        </div>

        {/* Mode indicator dot */}
        <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
          <span className={`
            w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300
            ${mode === 'dark' ? 'bg-zinc-600 border-zinc-800' :
              mode === 'light' ? 'bg-amber-400 border-amber-50' :
              'bg-cyan-400 border-zinc-800'}
          `} />
        </div>

        {/* Sparkle effects for dark mode */}
        {theme === 'dark' && mode !== 'system' && (
          <>
            <span className="absolute top-1 right-1 w-1 h-1 bg-amber-300 rounded-full animate-pulse" />
            <span className="absolute bottom-2 left-1.5 w-0.5 h-0.5 bg-amber-200 rounded-full animate-pulse delay-100" />
          </>
        )}

        {/* System mode indicator */}
        {mode === 'system' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-8 h-8 border border-cyan-400/30 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
        )}

        {/* Sun rays for light mode */}
        {theme === 'light' && mode !== 'system' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-8 h-8 border border-amber-300/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        )}
      </button>

      {/* Tooltip with mode label */}
      <div className={`
        absolute -bottom-12 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50
        ${theme === 'dark'
          ? 'bg-zinc-700 text-zinc-200 border border-zinc-600'
          : 'bg-white text-zinc-700 border border-zinc-200 shadow-md'
        }
      `}>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-zinc-400">{getModeLabel()}</span>
          <span>{getTooltipText()}</span>
        </div>
        {/* Tooltip arrow */}
        <div className={`
          absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
          ${theme === 'dark' ? 'bg-zinc-700 border-l border-t border-zinc-600' : 'bg-white border-l border-t border-zinc-200'}
        `} />
      </div>
    </div>
  );
}

// Compact version for navigation
export function ThemeToggleCompact() {
  const { mode, theme, setMode } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const getIcon = () => {
    if (mode === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    if (theme === 'dark') {
      return <Sun className="h-4 w-4" />;
    }
    return <Moon className="h-4 w-4" />;
  };

  const modes = [
    { key: 'dark' as const, icon: Moon, label: language === 'ko' ? '다크' : 'Dark' },
    { key: 'light' as const, icon: Sun, label: language === 'ko' ? '라이트' : 'Light' },
    { key: 'system' as const, icon: Monitor, label: language === 'ko' ? '시스템' : 'System' },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          p-1.5 rounded-lg transition-all duration-200
          ${mode === 'system'
            ? theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-cyan-400' : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-600'
            : theme === 'dark'
              ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
              : 'bg-amber-50 hover:bg-amber-100 text-indigo-600'
          }
        `}
        aria-label="Theme settings"
      >
        {getIcon()}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className={`
            absolute right-0 top-full mt-2 py-1 rounded-lg shadow-lg z-50 min-w-[120px]
            ${theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-200'}
          `}>
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMode(m.key);
                    setShowDropdown(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                    ${isActive
                      ? theme === 'dark' ? 'bg-zinc-700 text-primary' : 'bg-zinc-100 text-primary'
                      : theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
