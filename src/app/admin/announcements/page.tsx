'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Pin,
  Eye,
  EyeOff,
  Megaphone,
  Calendar,
  Sparkles,
  AlertCircle,
  Info,
  Loader2,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Announcement {
  id: string;
  title_ko: string;
  title_en: string;
  content_ko: string;
  content_en: string;
  type: 'notice' | 'update' | 'event' | 'important';
  is_pinned: boolean;
  is_popup: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const emptyAnnouncement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> = {
  title_ko: '',
  title_en: '',
  content_ko: '',
  content_en: '',
  type: 'notice',
  is_pinned: false,
  is_popup: false,
  is_active: true,
};

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<string>('loading');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(emptyAnnouncement);

  const texts = {
    ko: {
      title: '공지사항 관리',
      subtitle: '사이트 공지사항을 관리합니다',
      addNew: '새 공지사항',
      edit: '수정',
      delete: '삭제',
      save: '저장',
      cancel: '취소',
      titleKo: '제목 (한국어)',
      titleEn: '제목 (영어)',
      contentKo: '내용 (한국어)',
      contentEn: '내용 (영어)',
      type: '유형',
      pinned: '상단 고정',
      popup: '팝업 표시',
      active: '활성화',
      notice: '공지',
      update: '업데이트',
      event: '이벤트',
      important: '중요',
      refresh: '새로고침',
      dataSource: '데이터 소스',
      database: '데이터베이스',
      default: '기본값',
      local: '로컬',
      noAnnouncements: '공지사항이 없습니다',
      confirmDelete: '정말 삭제하시겠습니까?',
      saveSuccess: '저장되었습니다',
      deleteSuccess: '삭제되었습니다',
      loading: '로딩 중...',
      noAccess: '관리자 권한이 필요합니다',
    },
    en: {
      title: 'Announcements Management',
      subtitle: 'Manage site announcements',
      addNew: 'New Announcement',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      titleKo: 'Title (Korean)',
      titleEn: 'Title (English)',
      contentKo: 'Content (Korean)',
      contentEn: 'Content (English)',
      type: 'Type',
      pinned: 'Pinned',
      popup: 'Show Popup',
      active: 'Active',
      notice: 'Notice',
      update: 'Update',
      event: 'Event',
      important: 'Important',
      refresh: 'Refresh',
      dataSource: 'Data Source',
      database: 'Database',
      default: 'Default',
      local: 'Local',
      noAnnouncements: 'No announcements',
      confirmDelete: 'Are you sure you want to delete?',
      saveSuccess: 'Saved successfully',
      deleteSuccess: 'Deleted successfully',
      loading: 'Loading...',
      noAccess: 'Admin access required',
    },
  };

  const t = texts[language];

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/announcements?active=false');
      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setSource(data.source || 'default');
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/auth/login');
    } else if (isAdmin) {
      fetchAnnouncements();
    }
  }, [user, isAdmin, authLoading, router]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(emptyAnnouncement);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setIsCreating(false);
    setFormData({
      title_ko: announcement.title_ko,
      title_en: announcement.title_en,
      content_ko: announcement.content_ko,
      content_en: announcement.content_en,
      type: announcement.type,
      is_pinned: announcement.is_pinned,
      is_popup: announcement.is_popup,
      is_active: announcement.is_active,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(emptyAnnouncement);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const method = isCreating ? 'POST' : 'PUT';
      const body = isCreating ? formData : { id: editingId, ...formData };

      const response = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Failed to save');
      }

      setSuccess(t.saveSuccess);
      setTimeout(() => setSuccess(null), 3000);
      handleCancel();
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to save announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    setError(null);
    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Failed to delete');
      }

      setSuccess(t.deleteSuccess);
      setTimeout(() => setSuccess(null), 3000);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notice': return <Info className="h-4 w-4" />;
      case 'update': return <Sparkles className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'important': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg">{t.noAccess}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>{language === 'ko' ? '관리자로 돌아가기' : 'Back to Admin'}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {source === 'database' ? t.database : source === 'local' ? t.local : t.default}
              </Badge>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Megaphone className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnnouncements}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !!editingId}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addNew}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {(isCreating || editingId) && (
          <Card className="bg-card border-border/60 mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {isCreating ? t.addNew : t.edit}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.titleKo}</label>
                  <Input
                    value={formData.title_ko}
                    onChange={(e) => setFormData({ ...formData, title_ko: e.target.value })}
                    placeholder="제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.titleEn}</label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.contentKo}</label>
                  <Textarea
                    value={formData.content_ko}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content_ko: e.target.value })}
                    placeholder="내용을 입력하세요"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.contentEn}</label>
                  <Textarea
                    value={formData.content_en}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content_en: e.target.value })}
                    placeholder="Enter content"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.type}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                  >
                    <option value="notice">{t.notice}</option>
                    <option value="update">{t.update}</option>
                    <option value="event">{t.event}</option>
                    <option value="important">{t.important}</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_pinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                  />
                  <span className="text-sm">{t.pinned}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_popup}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popup: checked })}
                  />
                  <span className="text-sm">{t.popup}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm">{t.active}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t.save}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="bg-card border-border/60">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{t.noAnnouncements}</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`bg-card border-border/60 ${!announcement.is_active ? 'opacity-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)} text-white flex-shrink-0`}>
                      {getTypeIcon(announcement.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold">
                          {language === 'ko' ? announcement.title_ko : announcement.title_en}
                        </h3>
                        {announcement.is_pinned && (
                          <Badge variant="outline" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            {t.pinned}
                          </Badge>
                        )}
                        {announcement.is_popup && (
                          <Badge className="bg-purple-500 text-white text-xs">
                            Popup
                          </Badge>
                        )}
                        {!announcement.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            {language === 'ko' ? '비활성' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {language === 'ko' ? announcement.content_ko : announcement.content_en}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                        disabled={!!editingId || isCreating}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
