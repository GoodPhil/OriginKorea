'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Globe, Lock, Save, CheckCircle, Loader2, AlertCircle, Users, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PagePermission {
  path: string;
  name_ko: string;
  name_en: string;
  isPublic: boolean;
  requireAuth: boolean;
  requireAdmin: boolean;
  description_ko: string;
  description_en: string;
}

// All available pages - ordered by menu structure
const allPages: PagePermission[] = [
  { path: '/', name_ko: '홈페이지', name_en: 'Home', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '메인 대시보드', description_en: 'Main dashboard' },
  { path: '/ai-analysis', name_ko: 'AI 분석', name_en: 'AI Analysis', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: 'AI 기반 시장 분석', description_en: 'AI-powered market analysis' },
  { path: '/analysis', name_ko: '분석', name_en: 'Analysis', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: 'LGNS 분석 데이터', description_en: 'LGNS analysis data' },
  { path: '/comparison', name_ko: '비교 분석', name_en: 'Comparison', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '토큰 비교 분석', description_en: 'Token comparison analysis' },
  { path: '/whale-monitor', name_ko: '추적', name_en: 'Tracking', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '고래 활동 및 대규모 거래 모니터링', description_en: 'Whale activity and large transaction monitoring' },
  { path: '/calculator', name_ko: '계산기', name_en: 'Calculator', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '스테이킹 계산기', description_en: 'Staking calculator' },
  { path: '/bookmarks', name_ko: '참고링크', name_en: 'Bookmarks', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '유용한 링크', description_en: 'Useful links' },
  { path: '/docs', name_ko: '문서', name_en: 'Docs', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '가이드 문서', description_en: 'Guide docs' },
  { path: '/docs/guide/wallet', name_ko: '지갑 가이드', name_en: 'Wallet Guide', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '지갑 설정 가이드', description_en: 'Wallet setup guide' },
  { path: '/docs/guide/swap', name_ko: '스왑 가이드', name_en: 'Swap Guide', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '토큰 스왑 가이드', description_en: 'Token swap guide' },
  { path: '/docs/guide/staking', name_ko: '스테이킹 가이드', name_en: 'Staking Guide', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '스테이킹 가이드', description_en: 'Staking guide' },
  { path: '/community', name_ko: '커뮤니티', name_en: 'Community', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '커뮤니티 허브', description_en: 'Community hub' },
  { path: '/community/forum', name_ko: '포럼', name_en: 'Forum', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '토론 포럼', description_en: 'Discussion forum' },
  { path: '/community/events', name_ko: '이벤트', name_en: 'Events', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '이벤트 목록', description_en: 'Event list' },
  { path: '/membership', name_ko: '멤버십', name_en: 'Membership', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: 'LGNS 토큰 멤버십', description_en: 'LGNS token membership' },
  { path: '/announcements', name_ko: '공지', name_en: 'Announcements', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '사이트 공지사항', description_en: 'Site announcements' },
  { path: '/governance', name_ko: '거버넌스', name_en: 'Governance', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: 'DAO 투표', description_en: 'DAO voting' },
  { path: '/settings', name_ko: '알림 설정', name_en: 'Settings', isPublic: false, requireAuth: true, requireAdmin: false, description_ko: '알림 설정', description_en: 'Notification settings' },
  { path: '/contact', name_ko: '문의', name_en: 'Contact', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '문의 양식', description_en: 'Contact form' },
  { path: '/invite', name_ko: '초대 페이지', name_en: 'Invite', isPublic: true, requireAuth: false, requireAdmin: false, description_ko: '초대 랜딩 페이지', description_en: 'Invite landing page' },
  { path: '/admin', name_ko: '관리자', name_en: 'Admin', isPublic: false, requireAuth: true, requireAdmin: true, description_ko: '관리자 대시보드', description_en: 'Admin dashboard' },
];

// LocalStorage key
const STORAGE_KEY = 'pagePermissions_v2';

// Load from localStorage
function loadFromStorage(): PagePermission[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.error('Failed to load from localStorage');
  }
  return null;
}

// Save to localStorage
function saveToStorage(permissions: PagePermission[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
    // Dispatch event for same-tab listeners
    window.dispatchEvent(new CustomEvent('permissionsUpdated'));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

export default function AdminPagesPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: loading, session } = useAuth();
  const { language } = useLanguage();

  const [permissions, setPermissions] = useState<PagePermission[]>(allPages);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'local' | 'api' | 'default'>('default');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [user, isAdmin, loading, router]);

  // Load permissions - prioritize localStorage, then API
  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);

      // First try localStorage
      const localData = loadFromStorage();
      if (localData && localData.length > 0) {
        setPermissions(localData);
        setDataSource('local');
        setIsLoading(false);
        return;
      }

      // Then try API
      try {
        const response = await fetch('/api/page-permissions');
        const data = await response.json();

        if (data.pages && Object.keys(data.pages).length > 0) {
          // Convert API format to our format
          const mergedPermissions = allPages.map(page => {
            const saved = data.pages[page.path];
            if (saved) {
              return {
                ...page,
                isPublic: saved.public ?? page.isPublic,
                requireAuth: saved.requireAuth ?? page.requireAuth,
                requireAdmin: saved.requireAdmin ?? page.requireAdmin,
              };
            }
            return page;
          });
          setPermissions(mergedPermissions);
          setDataSource('api');
          // Also save to localStorage for persistence
          saveToStorage(mergedPermissions);
        } else {
          setDataSource('default');
        }
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
        setDataSource('default');
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const updatePermission = (path: string, field: 'isPublic' | 'requireAuth' | 'requireAdmin', value: boolean) => {
    setPermissions(prev => prev.map(p => {
      if (p.path === path) {
        const updated = { ...p, [field]: value };
        // Logic: if public, no auth required
        if (field === 'isPublic' && value) {
          updated.requireAuth = false;
          updated.requireAdmin = false;
        }
        // If require admin, must require auth
        if (field === 'requireAdmin' && value) {
          updated.requireAuth = true;
          updated.isPublic = false;
        }
        // If require auth, not public
        if (field === 'requireAuth' && value) {
          updated.isPublic = false;
        }
        return updated;
      }
      return p;
    }));
    setSaveSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Save to localStorage first (ensures persistence)
      saveToStorage(permissions);
      setDataSource('local');

      // Build pages object for API
      const pagesObj: Record<string, { public: boolean; requireAuth: boolean; requireAdmin: boolean }> = {};
      permissions.forEach(p => {
        pagesObj[p.path] = {
          public: p.isPublic,
          requireAuth: p.requireAuth,
          requireAdmin: p.requireAdmin,
        };
      });

      // Try to save to API as well
      try {
        const response = await fetch('/api/page-permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ pages: pagesObj }),
        });

        const data = await response.json();
        if (!data.success && data.error) {
          console.warn('API save warning:', data.error);
        }
      } catch (apiErr) {
        console.warn('API save failed, using localStorage only:', apiErr);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(language === 'ko' ? '저장 중 오류가 발생했습니다' : 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            {language === 'ko' ? '로딩 중...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const publicCount = permissions.filter(p => p.isPublic).length;
  const authCount = permissions.filter(p => p.requireAuth && !p.requireAdmin).length;
  const adminCount = permissions.filter(p => p.requireAdmin).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>{language === 'ko' ? '관리자로 돌아가기' : 'Back to Admin'}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {dataSource === 'local'
                  ? (language === 'ko' ? '로컬 저장소' : 'Local Storage')
                  : dataSource === 'api'
                    ? (language === 'ko' ? 'API' : 'API')
                    : (language === 'ko' ? '기본값' : 'Default')}
              </Badge>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {language === 'ko' ? '페이지 권한 설정' : 'Page Permissions'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ko'
                ? '각 페이지의 접근 권한을 설정합니다'
                : 'Configure access permissions for each page'}
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'ko' ? '저장 중...' : 'Saving...'}
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                {language === 'ko' ? '저장됨!' : 'Saved!'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {language === 'ko' ? '변경사항 저장' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{publicCount}</p>
                <p className="text-xs text-muted-foreground">{language === 'ko' ? '공개' : 'Public'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-500">{authCount}</p>
                <p className="text-xs text-muted-foreground">{language === 'ko' ? '회원 전용' : 'Members'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{adminCount}</p>
                <p className="text-xs text-muted-foreground">{language === 'ko' ? '관리자' : 'Admin'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions List */}
        <div className="space-y-3">
          {permissions.map((page) => (
            <Card
              key={page.path}
              className={`border transition-colors ${
                page.requireAdmin
                  ? 'border-red-500/30 bg-red-500/5'
                  : page.requireAuth
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-green-500/30 bg-green-500/5'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Page Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">
                        {page.path}
                      </code>
                      {page.requireAdmin ? (
                        <Badge className="bg-red-500 text-white text-xs">Admin</Badge>
                      ) : page.requireAuth ? (
                        <Badge className="bg-amber-500 text-white text-xs">
                          {language === 'ko' ? '회원' : 'Members'}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white text-xs">
                          {language === 'ko' ? '공개' : 'Public'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium">
                      {language === 'ko' ? page.name_ko : page.name_en}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ko' ? page.description_ko : page.description_en}
                    </p>
                  </div>

                  {/* Toggle Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => updatePermission(page.path, 'isPublic', true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        page.isPublic
                          ? 'bg-green-500 text-white'
                          : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                      }`}
                    >
                      <Globe className="h-3 w-3 inline mr-1" />
                      {language === 'ko' ? '공개' : 'Public'}
                    </button>
                    <button
                      onClick={() => updatePermission(page.path, 'requireAuth', true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        page.requireAuth && !page.requireAdmin
                          ? 'bg-amber-500 text-white'
                          : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                      }`}
                    >
                      <Users className="h-3 w-3 inline mr-1" />
                      {language === 'ko' ? '회원' : 'Members'}
                    </button>
                    <button
                      onClick={() => updatePermission(page.path, 'requireAdmin', true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        page.requireAdmin
                          ? 'bg-red-500 text-white'
                          : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                      }`}
                    >
                      <Shield className="h-3 w-3 inline mr-1" />
                      Admin
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <h4 className="font-medium mb-2">
            {language === 'ko' ? '권한 설명' : 'Permission Levels'}
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span>{language === 'ko' ? '공개: 누구나 접근 가능' : 'Public: Anyone can access'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              <span>{language === 'ko' ? '회원: 로그인한 회원만 접근 가능' : 'Members: Logged-in members only'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span>{language === 'ko' ? '관리자: 관리자만 접근 가능' : 'Admin: Administrators only'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
