'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Users,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  User,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading, isConfigured } = useAuth();
  const { language } = useLanguage();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const texts = {
    ko: {
      title: '회원 관리',
      subtitle: '등록된 회원을 관리합니다',
      back: '대시보드로',
      totalUsers: '전체 회원',
      admins: '관리자',
      regularUsers: '일반 회원',
      search: '이메일 또는 닉네임으로 검색...',
      joined: '가입일',
      noUsers: '회원이 없습니다.',
      loading: '로딩 중...',
      refresh: '새로고침',
      makeAdmin: '관리자 지정',
      removeAdmin: '권한 해제',
      cannotChangeSelf: '자신의 권한은 변경할 수 없습니다',
      confirmChange: '관리자 권한을 변경하시겠습니까?',
      updateSuccess: '권한이 변경되었습니다',
      updateError: '권한 변경에 실패했습니다',
      notConfigured: 'Supabase가 설정되지 않았습니다',
      noAccess: '관리자 권한이 필요합니다',
      delete: '삭제',
      confirmDelete: '정말 이 회원을 삭제하시겠습니까?',
      deleteSuccess: '회원이 삭제되었습니다',
      deleteError: '회원 삭제에 실패했습니다',
    },
    en: {
      title: 'User Management',
      subtitle: 'Manage registered users',
      back: 'Back to Dashboard',
      totalUsers: 'Total Users',
      admins: 'Admins',
      regularUsers: 'Regular Users',
      search: 'Search by email or nickname...',
      joined: 'Joined',
      noUsers: 'No users found.',
      loading: 'Loading...',
      refresh: 'Refresh',
      makeAdmin: 'Make Admin',
      removeAdmin: 'Remove Admin',
      cannotChangeSelf: 'Cannot change your own privileges',
      confirmChange: 'Change admin privileges?',
      updateSuccess: 'Privileges updated',
      updateError: 'Failed to update privileges',
      notConfigured: 'Supabase not configured',
      noAccess: 'Admin access required',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this user?',
      deleteSuccess: 'User deleted',
      deleteError: 'Failed to delete user',
    },
  };

  const t = texts[language];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.error && data.users.length === 0) {
        setError(data.error);
      }
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (!confirm(t.confirmChange)) return;

    setUpdating(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, is_admin: !currentIsAdmin }),
      });

      if (response.ok) {
        setSuccess(t.updateSuccess);
        setTimeout(() => setSuccess(null), 3000);
        await fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || t.updateError);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(t.updateError);
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(t.confirmDelete)) return;

    setUpdating(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(t.deleteSuccess);
        setTimeout(() => setSuccess(null), 3000);
        await fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || t.deleteError);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(t.deleteError);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{t.noAccess}</p>
            </div>
          </div>
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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-3">
                  <Users className="h-8 w-8" />
                  {t.title}
                </h1>
                <p className="text-base text-muted-foreground mt-1">{t.subtitle}</p>
              </div>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/30 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="bg-green-500/10 border-green-500/30 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-500">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-sm text-muted-foreground">{t.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {users.filter(u => u.is_admin).length}
                  </div>
                  <p className="text-sm text-muted-foreground">{t.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {users.filter(u => !u.is_admin).length}
                  </div>
                  <p className="text-sm text-muted-foreground">{t.regularUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t.noUsers}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((userItem) => {
              const isSelf = userItem.id === user?.id;
              const isUpdating = updating === userItem.id;

              return (
                <Card key={userItem.id} className="bg-card border-border/60 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full ${userItem.is_admin ? 'bg-green-500/10' : 'bg-secondary'}`}>
                          {userItem.is_admin ? (
                            <Shield className="h-5 w-5 text-green-500" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {userItem.display_name || userItem.email.split('@')[0]}
                            </span>
                            {userItem.is_admin && (
                              <Badge className="bg-green-500/20 text-green-500 text-xs">
                                Admin
                              </Badge>
                            )}
                            {isSelf && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <Mail className="h-3.5 w-3.5" />
                            {userItem.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {t.joined}: {formatDate(userItem.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          variant={userItem.is_admin ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleAdmin(userItem.id, userItem.is_admin)}
                          disabled={isSelf || isUpdating}
                          className={isSelf ? 'opacity-50 cursor-not-allowed' : ''}
                          title={isSelf ? t.cannotChangeSelf : ''}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : userItem.is_admin ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-1" />
                              {t.removeAdmin}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-1" />
                              {t.makeAdmin}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
