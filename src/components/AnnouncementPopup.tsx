'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Calendar, Sparkles, AlertCircle, Info, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface Announcement {
  id: string;
  title_ko: string;
  title_en: string;
  content_ko: string;
  content_en: string;
  type: 'notice' | 'update' | 'event' | 'important';
  is_pinned: boolean;
  is_popup: boolean;
  created_at: string;
}

export function AnnouncementPopup() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [popupAnnouncements, setPopupAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch popup announcements from API
  useEffect(() => {
    const fetchPopupAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements?popup=true&active=true');
        const data = await response.json();
        setPopupAnnouncements(data.announcements || []);
      } catch (error) {
        console.error('Failed to fetch popup announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopupAnnouncements();
  }, []);

  // Check if popup should show
  useEffect(() => {
    if (loading || popupAnnouncements.length === 0) return;

    // Check localStorage for dismissed popups
    const dismissedIds = localStorage.getItem('dismissedPopups');
    if (dismissedIds) {
      try {
        setDismissed(JSON.parse(dismissedIds));
      } catch {
        setDismissed([]);
      }
    }

    // Check if there are any popup announcements to show
    const todayDismissed = localStorage.getItem('popupDismissedToday');
    if (todayDismissed) {
      const dismissedDate = new Date(todayDismissed);
      const now = new Date();
      // If dismissed today, don't show
      if (dismissedDate.toDateString() === now.toDateString()) {
        return;
      }
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      const parsedDismissed = dismissedIds ? JSON.parse(dismissedIds) : [];
      const activePopups = popupAnnouncements.filter(
        a => a.is_popup && !parsedDismissed.includes(a.id)
      );
      if (activePopups.length > 0) {
        setIsOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [loading, popupAnnouncements]);

  const activePopups = popupAnnouncements.filter(
    a => a.is_popup && !dismissed.includes(a.id)
  );

  if (loading || !isOpen || activePopups.length === 0) {
    return null;
  }

  const currentAnnouncement = activePopups[currentIndex];

  if (!currentAnnouncement) {
    return null;
  }

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleDismissToday = () => {
    localStorage.setItem('popupDismissedToday', new Date().toISOString());
    setIsOpen(false);
  };

  const handleDismissPermanently = () => {
    const newDismissed = [...dismissed, currentAnnouncement.id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissedPopups', JSON.stringify(newDismissed));

    if (currentIndex < activePopups.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notice': return <Info className="h-5 w-5" />;
      case 'update': return <Sparkles className="h-5 w-5" />;
      case 'event': return <Calendar className="h-5 w-5" />;
      case 'important': return <AlertCircle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notice': return 'bg-blue-500';
      case 'update': return 'bg-green-500';
      case 'event': return 'bg-purple-500';
      case 'important': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      notice: { ko: '공지', en: 'Notice' },
      update: { ko: '업데이트', en: 'Update' },
      event: { ko: '이벤트', en: 'Event' },
      important: { ko: '중요', en: 'Important' },
    };
    return labels[type as keyof typeof labels]?.[language] || type;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`${getTypeColor(currentAnnouncement.type)} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3 text-white">
            {getTypeIcon(currentAnnouncement.type)}
            <span className="font-semibold">{getTypeLabel(currentAnnouncement.type)}</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3">
            {language === 'ko' ? currentAnnouncement.title_ko : currentAnnouncement.title_en}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {language === 'ko' ? currentAnnouncement.content_ko : currentAnnouncement.content_en}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/30 border-t border-border flex flex-col gap-3">
          {/* View more link */}
          <Link
            href="/announcements"
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {language === 'ko' ? '자세히 보기' : 'View Details'}
            <ExternalLink className="h-4 w-4" />
          </Link>

          {/* Dismiss options */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={handleDismissToday}
              className="flex-1 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {language === 'ko' ? '오늘 하루 보지 않기' : "Don't show today"}
            </button>
            <button
              onClick={handleDismissPermanently}
              className="flex-1 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {language === 'ko' ? '다시 보지 않기' : "Don't show again"}
            </button>
          </div>

          {/* Pagination */}
          {activePopups.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {activePopups.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
