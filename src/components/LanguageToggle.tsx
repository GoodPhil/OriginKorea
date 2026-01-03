'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
      <button
        type="button"
        onClick={() => setLanguage('ko')}
        className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
          language === 'ko'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
        }`}
        aria-label="한국어"
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
