'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Megaphone,
  Calendar,
  ChevronRight,
  Pin,
  AlertCircle,
  Info,
  CheckCircle,
  Sparkles,
  Clock,
  Eye,
  Plus,
  Loader2,
} from 'lucide-react';

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
  views: number;
}

// Sample announcements data (in production, fetch from API)
const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title_ko: 'Origin Korea v3.0 업데이트 안내',
    title_en: 'Origin Korea v3.0 Update Notice',
    content_ko: 'Origin Korea 웹사이트가 v3.0으로 업데이트되었습니다. 새로운 AI 분석 기능, 고래 추적 시스템, 그리고 개선된 UI/UX를 경험해 보세요.',
    content_en: 'Origin Korea website has been updated to v3.0. Experience new AI analysis features, whale tracking system, and improved UI/UX.',
    type: 'update',
    is_pinned: true,
    is_popup: false,
    created_at: '2026-01-01T00:00:00Z',
    views: 1234,
  },
  {
    id: '2',
    title_ko: '테스트중이므로 불안전합니다.',
    title_en: 'New Member Registration Event',
    content_ko: '2026년 1월 중 모든 작업이 완료됩니다.',
    content_en: 'Special benefits for new members during January 2026. Sign up now!',
    type: 'event',
    is_pinned: true,
    is_popup: true,
    created_at: '2025-12-28T10:00:00Z',
    views: 892,
  },
  {
    id: '3',
    title_ko: '서비스 점검 안내',
    title_en: 'Service Maintenance Notice',
    content_ko: '2026년 1월 5일 02:00-04:00 (KST) 서버 점검이 예정되어 있습니다. 해당 시간 동안 서비스 이용이 제한될 수 있습니다.',
    content_en: 'Server maintenance is scheduled for January 5, 2026, 02:00-04:00 (KST). Service may be limited during this time.',
    type: 'important',
    is_pinned: false,
    is_popup: false,
    created_at: '2025-12-25T08:00:00Z',
    views: 567,
  },
  {
    id: '4',
    title_ko: 'LGNS 토큰 스테이킹 가이드 업데이트',
    title_en: 'LGNS Token Staking Guide Updated',
    content_ko: '스테이킹 가이드가 최신 정보로 업데이트되었습니다. 문서 페이지에서 확인하세요.',
    content_en: 'The staking guide has been updated with the latest information. Check it out on the Docs page.',
    type: 'notice',
    is_pinned: false,
    is_popup: false,
    created_at: '2025-12-20T14:00:00Z',
    views: 423,
  },
  {
    id: '5',
    title_ko: '커뮤니티 포럼 오픈',
    title_en: 'Community Forum Open',
    content_ko: 'Origin Korea 커뮤니티 포럼이 오픈되었습니다. 다른 회원들과 소통하고 정보를 공유하세요!',
    content_en: 'Origin Korea community forum is now open. Connect with other members and share information!',
    type: 'notice',
    is_pinned: false,
    is_popup: false,
    created_at: '2025-12-15T09:00:00Z',
    views: 789,
  },
];

export default function AnnouncementsPage() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'notice' | 'update' | 'event' | 'important'>('all');

  const texts = {
    ko: {
      title: '공지사항',
      subtitle: '사이트 공지 및 이벤트 안내',
      all: '전체',
      notice: '공지',
      update: '업데이트',
      event: '이벤트',
      important: '중요',
      pinned: '고정',
      popup: '팝업',
      views: '조회',
      new: 'NEW',
      noAnnouncements: '공지사항이 없습니다.',
      backToList: '목록으로',
      createNew: '새 공지 작성',
      postedOn: '게시일',
    },
    en: {
      title: 'Announcements',
      subtitle: 'Site notices and event information',
      all: 'All',
      notice: 'Notice',
      update: 'Update',
      event: 'Event',
      important: 'Important',
      pinned: 'Pinned',
      popup: 'Popup',
      views: 'Views',
      new: 'NEW',
      noAnnouncements: 'No announcements.',
      backToList: 'Back to List',
      createNew: 'Create New',
      postedOn: 'Posted on',
    },
  };

  const t = texts[language];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notice':
        return <Info className="h-4 w-4" />;
      case 'update':
        return <Sparkles className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'important':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notice':
        return 'bg-blue-500';
      case 'update':
        return 'bg-green-500';
      case 'event':
        return 'bg-purple-500';
      case 'important':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'notice':
        return t.notice;
      case 'update':
        return t.update;
      case 'event':
        return t.event;
      case 'important':
        return t.important;
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Filter and sort announcements
  const filteredAnnouncements = announcements
    .filter(a => filter === 'all' || a.type === filter)
    .sort((a, b) => {
      // Pinned first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then by date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (selectedAnnouncement) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedAnnouncement(null)}
            className="mb-6 gap-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            {t.backToList}
          </Button>

          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getTypeColor(selectedAnnouncement.type)} text-white`}>
                  {getTypeIcon(selectedAnnouncement.type)}
                  <span className="ml-1">{getTypeLabel(selectedAnnouncement.type)}</span>
                </Badge>
                {selectedAnnouncement.is_pinned && (
                  <Badge variant="outline" className="gap-1">
                    <Pin className="h-3 w-3" />
                    {t.pinned}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">
                {language === 'ko' ? selectedAnnouncement.title_ko : selectedAnnouncement.title_en}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t.postedOn}: {formatDate(selectedAnnouncement.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedAnnouncement.views} {t.views}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {language === 'ko' ? selectedAnnouncement.content_ko : selectedAnnouncement.content_en}
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Megaphone className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          {isAdmin && (
            <Link href="/admin/announcements">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t.createNew}
              </Button>
            </Link>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'notice', 'update', 'event', 'important'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className="gap-2"
            >
              {type !== 'all' && getTypeIcon(type)}
              {type === 'all' ? t.all : getTypeLabel(type)}
            </Button>
          ))}
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="space-y-3">
            {filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`bg-card border-border/60 hover:border-primary/30 transition-all cursor-pointer ${
                  announcement.is_pinned ? 'border-l-4 border-l-amber-500' : ''
                }`}
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`${getTypeColor(announcement.type)} text-white`}>
                        {getTypeIcon(announcement.type)}
                        <span className="ml-1">{getTypeLabel(announcement.type)}</span>
                      </Badge>
                      {announcement.is_pinned && (
                        <Pin className="h-4 w-4 text-amber-500" />
                      )}
                      {announcement.is_popup && (
                        <Badge variant="outline" className="text-xs">
                          {t.popup}
                        </Badge>
                      )}
                      {isNew(announcement.created_at) && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {t.new}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {language === 'ko' ? announcement.title_ko : announcement.title_en}
                      </h3>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {announcement.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(announcement.created_at)}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border/60">
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t.noAnnouncements}</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
