'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Save, Loader2, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user, profile, isAdmin, isLoading, isConfigured, updateProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const texts = {
    ko: {
      back: '홈으로',
      title: '내 프로필',
      subtitle: '계정 정보를 확인하고 수정하세요',
      notLoggedIn: '로그인이 필요합니다',
      notLoggedInDesc: '프로필을 보려면 먼저 로그인해주세요.',
      goToLogin: '로그인하러 가기',
      displayName: '닉네임',
      displayNamePlaceholder: '닉네임을 입력하세요',
      email: '이메일',
      role: '역할',
      admin: '관리자',
      member: '일반 회원',
      memberSince: '가입일',
      save: '저장',
      saving: '저장 중...',
      saveSuccess: '프로필이 업데이트되었습니다.',
      saveError: '프로필 업데이트 중 오류가 발생했습니다.',
      notConfigured: 'Supabase가 설정되지 않았습니다',
      notConfiguredDesc: '.env.local 파일에 Supabase 환경 변수를 설정해주세요.',
    },
    en: {
      back: 'Home',
      title: 'My Profile',
      subtitle: 'View and edit your account information',
      notLoggedIn: 'Login required',
      notLoggedInDesc: 'Please login to view your profile.',
      goToLogin: 'Go to Login',
      displayName: 'Display Name',
      displayNamePlaceholder: 'Enter your display name',
      email: 'Email',
      role: 'Role',
      admin: 'Administrator',
      member: 'Member',
      memberSince: 'Member Since',
      save: 'Save',
      saving: 'Saving...',
      saveSuccess: 'Profile updated successfully.',
      saveError: 'An error occurred while updating profile.',
      notConfigured: 'Supabase not configured',
      notConfiguredDesc: 'Please set Supabase environment variables in .env.local file.',
    },
  };

  const t = texts[language];

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [profile, user]);

  const handleSave = async () => {
    setMessage(null);
    setIsSaving(true);

    try {
      const { error } = await updateProfile({ display_name: displayName });

      if (error) {
        setMessage({ type: 'error', text: error.message || t.saveError });
      } else {
        setMessage({ type: 'success', text: t.saveSuccess });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t.saveError });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <Navigation />

      {/* Profile Content */}
      <section className="py-12 md:py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-lg">
          {!isConfigured ? (
            <Card className="bg-card border-border/60">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-yellow-500/10 mb-4">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle>{t.notConfigured}</CardTitle>
                <CardDescription>{t.notConfiguredDesc}</CardDescription>
              </CardHeader>
            </Card>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !user ? (
            <Card className="bg-card border-border/60">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-muted mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>{t.notLoggedIn}</CardTitle>
                <CardDescription>{t.notLoggedInDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/auth/login"
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {t.goToLogin}
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border/60">
              <CardHeader className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {(profile?.display_name || user.email || 'U').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-2xl">{t.title}</CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
                {isAdmin && (
                  <Badge className="mt-2 bg-primary/10 text-primary border border-primary/30">
                    <Shield className="h-3 w-3 mr-1" />
                    {t.admin}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {message && (
                  <div
                    className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                      message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                        : 'bg-destructive/10 border border-destructive/30 text-destructive'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {message.text}
                  </div>
                )}

                {/* Display Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {t.displayName}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t.displayNamePlaceholder}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {t.email}
                  </label>
                  <div className="px-4 py-3 bg-secondary/50 border border-border rounded-lg text-muted-foreground">
                    {user.email}
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {t.role}
                  </label>
                  <div className="px-4 py-3 bg-secondary/50 border border-border rounded-lg">
                    {isAdmin ? t.admin : t.member}
                  </div>
                </div>

                {/* Member Since */}
                {profile?.created_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {t.memberSince}
                    </label>
                    <div className="px-4 py-3 bg-secondary/50 border border-border rounded-lg text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t.save}
                    </>
                  )}
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
