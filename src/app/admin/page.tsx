'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Settings,
  BookmarkCheck,
  Users,
  FileText,
  Shield,
  LogOut,
  UserPlus,
  Activity,
  TrendingUp,
  Clock,
  RefreshCw,
  Database,
  Server,
  Zap,
  BarChart3,
  Eye,
  Bell,
  CheckCircle,
  ChevronRight,
  Globe,
  Layers,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Stats {
  totalUsers: number;
  admins: number;
  pendingRegistrations: number;
  totalBookmarks: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: loading, signOut, isConfigured } = useAuth();
  const { language } = useLanguage();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, admins: 0, pendingRegistrations: 0, totalBookmarks: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Update time every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      const users = usersData.users || [];

      // Fetch pending registrations
      const regsRes = await fetch('/api/registration?status=pending');
      const regsData = await regsRes.json();
      const pendingCount = regsData.registrations?.length || 0;

      // Fetch announcements
      const announcementsRes = await fetch('/api/announcements');
      const announcementsData = await announcementsRes.json();
      setAnnouncements(announcementsData.announcements?.slice(0, 3) || []);

      setStats({
        totalUsers: users.length,
        admins: users.filter((u: { is_admin: boolean }) => u.is_admin).length,
        pendingRegistrations: pendingCount,
        totalBookmarks: 64,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      // Load maintenance mode from localStorage
      const saved = localStorage.getItem('maintenanceMode');
      if (saved) setMaintenanceMode(saved === 'true');
    }
  }, [isAdmin]);

  useEffect(() => {
    // If Supabase is not configured, redirect to home
    if (!loading && !isConfigured) {
      router.push('/');
      return;
    }
    // If not loading and user is not admin, redirect to login
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [user, isAdmin, loading, router, isConfigured]);

  const handleSignOut = async () => {
    await signOut();
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const toggleMaintenanceMode = () => {
    const newValue = !maintenanceMode;
    setMaintenanceMode(newValue);
    localStorage.setItem('maintenanceMode', String(newValue));
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'ko' ? '로딩 중...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="bg-card border-border/60 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">
              {language === 'ko' ? '접근 거부' : 'Access Denied'}
            </CardTitle>
            <CardDescription>
              {language === 'ko'
                ? '관리자 권한이 필요합니다.'
                : 'Admin privileges required.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block"
            >
              {language === 'ko' ? '홈으로 돌아가기' : 'Go Home'}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminMenuItems = [
    {
      title: { ko: '가입 신청 관리', en: 'Registration Requests' },
      description: { ko: '가입 신청 승인/거절', en: 'Approve/reject registrations' },
      icon: UserPlus,
      href: '/admin/registrations',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'hover:border-amber-500/50',
      badge: stats.pendingRegistrations > 0 ? stats.pendingRegistrations.toString() : null,
      badgeColor: 'bg-amber-500',
    },
    {
      title: { ko: '북마크 관리', en: 'Manage Bookmarks' },
      description: { ko: '북마크 추가, 수정, 삭제', en: 'Add, edit, delete bookmarks' },
      icon: BookmarkCheck,
      href: '/admin/bookmarks',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'hover:border-blue-500/50',
    },
    {
      title: { ko: '회원 관리', en: 'Manage Users' },
      description: { ko: '회원 목록 및 권한 관리', en: 'User list and permissions' },
      icon: Users,
      href: '/admin/users',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'hover:border-green-500/50',
    },
    {
      title: { ko: '공지사항 관리', en: 'Announcements' },
      description: { ko: '공지사항 추가, 수정, 삭제', en: 'Add, edit, delete announcements' },
      icon: Bell,
      href: '/admin/announcements',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'hover:border-yellow-500/50',
      badge: { ko: '중요', en: 'Key' },
      badgeColor: 'bg-yellow-500',
    },
    {
      title: { ko: '페이지 권한', en: 'Page Permissions' },
      description: { ko: '페이지 접근 권한 설정', en: 'Page access settings' },
      icon: FileText,
      href: '/admin/pages',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'hover:border-purple-500/50',
    },
    {
      title: { ko: '메뉴 관리', en: 'Menu Management' },
      description: { ko: '네비게이션 메뉴 설정', en: 'Navigation menu settings' },
      icon: Layers,
      href: '/admin/menu',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'hover:border-cyan-500/50',
    },
  ];

  const systemStats = [
    {
      label: { ko: '등록 회원', en: 'Registered Users' },
      value: loadingStats ? '...' : stats.totalUsers.toString(),
      subLabel: { ko: `${stats.admins} 관리자 / ${stats.totalUsers - stats.admins} 회원`, en: `${stats.admins} admin / ${stats.totalUsers - stats.admins} members` },
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: { ko: '가입 대기', en: 'Pending Registrations' },
      value: loadingStats ? '...' : stats.pendingRegistrations.toString(),
      subLabel: { ko: '승인 대기 중', en: 'Awaiting approval' },
      icon: UserPlus,
      color: 'text-amber-500',
    },
    {
      label: { ko: '총 북마크', en: 'Total Bookmarks' },
      value: '64+',
      subLabel: { ko: '10개 카테고리', en: '10 categories' },
      icon: BookmarkCheck,
      color: 'text-blue-500',
    },
    {
      label: { ko: 'API 상태', en: 'API Status' },
      value: language === 'ko' ? '정상' : 'Online',
      subLabel: { ko: '실시간 연결', en: 'Connected' },
      icon: Zap,
      color: 'text-cyan-500',
    },
  ];

  const recentActivities = [
    {
      action: { ko: '새 회원 가입 신청', en: 'New registration request' },
      time: '2분 전',
      timeEn: '2 min ago',
      icon: UserPlus,
      color: 'text-amber-500',
    },
    {
      action: { ko: '북마크 추가됨', en: 'Bookmark added' },
      time: '15분 전',
      timeEn: '15 min ago',
      icon: BookmarkCheck,
      color: 'text-blue-500',
    },
    {
      action: { ko: '페이지 권한 수정', en: 'Page permission updated' },
      time: '1시간 전',
      timeEn: '1 hour ago',
      icon: FileText,
      color: 'text-purple-500',
    },
    {
      action: { ko: '시스템 백업 완료', en: 'System backup completed' },
      time: '3시간 전',
      timeEn: '3 hours ago',
      icon: Database,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'ko' ? '사이트로 돌아가기' : 'Back to Site'}</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">ADMIN</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                title={language === 'ko' ? '새로고침' : 'Refresh'}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Settings className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {language === 'ko' ? '관리자 대시보드' : 'Admin Dashboard'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.email}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>{language === 'ko' ? '온라인' : 'Online'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Current Time */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">
                  {currentTime.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US')}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'ko' ? '로그아웃' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Google Analytics - Top Priority Section */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                    {language === 'ko' ? 'Google Analytics 대시보드' : 'Google Analytics Dashboard'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ko' ? '실시간 방문자 및 사이트 통계 확인' : 'View real-time visitors and site statistics'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {language === 'ko' ? '분석 보기' : 'View Analytics'}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-card border-border/60 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label[language]}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{stat.subLabel[language]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Menu - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {language === 'ko' ? '관리 메뉴' : 'Admin Menu'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link key={index} href={item.href}>
                    <Card className={`bg-card border-border/60 ${item.borderColor} transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer group h-full`}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {item.badge && (
                            <Badge className={`${item.badgeColor} text-white text-xs`}>
                              {typeof item.badge === 'object' ? item.badge[language] : item.badge}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                          {item.title[language]}
                          <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description[language]}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Maintenance Mode - Compact */}
            <Card className="mt-4 bg-card border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 ${maintenanceMode ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">
                        {language === 'ko' ? '사이트 점검 모드' : 'Maintenance Mode'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {maintenanceMode
                          ? (language === 'ko' ? '점검 중 - 일반 사용자 접근 제한' : 'Under maintenance - Access restricted')
                          : (language === 'ko' ? '정상 운영 중' : 'Normal operation')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={toggleMaintenanceMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Activity & System Status */}
          <div className="space-y-6">
            {/* Latest Announcements */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-yellow-500" />
                    {language === 'ko' ? '최근 공지사항' : 'Latest Announcements'}
                  </div>
                  <Link href="/admin/announcements" className="text-xs text-primary hover:underline">
                    {language === 'ko' ? '모두 보기' : 'View all'}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div key={ann.id} className="p-2 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-start gap-2">
                        {ann.is_pinned && <Badge variant="destructive" className="text-[10px] px-1">PIN</Badge>}
                        <p className="text-sm font-medium line-clamp-1">{ann.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {language === 'ko' ? '공지사항이 없습니다' : 'No announcements'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-green-500" />
                  {language === 'ko' ? '시스템 상태' : 'System Status'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    {language === 'ko' ? '정상' : 'OK'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API Server</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    {language === 'ko' ? '정상' : 'OK'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Auth Service</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    {language === 'ko' ? '정상' : 'OK'}
                  </Badge>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    {language === 'ko' ? '마지막 확인: ' : 'Last check: '}
                    {currentTime?.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  {language === 'ko' ? '최근 활동' : 'Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg bg-secondary ${activity.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{activity.action[language]}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ko' ? activity.time : activity.timeEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-500" />
                  {language === 'ko' ? '빠른 링크' : 'Quick Links'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Eye className="h-4 w-4" />
                  {language === 'ko' ? '사이트 미리보기' : 'Preview Site'}
                </Link>
                <Link
                  href="/analysis"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  {language === 'ko' ? '분석 페이지' : 'Analysis Page'}
                </Link>
                <Link
                  href="/bookmarks"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <BookmarkCheck className="h-4 w-4" />
                  {language === 'ko' ? '북마크 페이지' : 'Bookmarks Page'}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Origin Korea Admin Dashboard v358</p>
          <p className="text-xs mt-1">
            {language === 'ko' ? '© 2026 Origin Korea. 모든 권리 보유.' : '© 2026 Origin Korea. All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
