'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const texts = {
    ko: {
      title: '새 비밀번호 설정',
      subtitle: '새로운 비밀번호를 입력해주세요',
      password: '새 비밀번호',
      passwordPlaceholder: '8자 이상 비밀번호',
      confirmPassword: '비밀번호 확인',
      confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',
      submit: '비밀번호 변경',
      submitting: '변경 중...',
      successTitle: '비밀번호 변경 완료!',
      successDesc: '새 비밀번호로 로그인해주세요.',
      goToLogin: '로그인하러 가기',
      notConfigured: 'Supabase가 설정되지 않았습니다',
      errorPasswordMismatch: '비밀번호가 일치하지 않습니다.',
      errorPasswordTooShort: '비밀번호는 8자 이상이어야 합니다.',
      errorGeneric: '오류가 발생했습니다. 다시 시도해주세요.',
    },
    en: {
      title: 'Set New Password',
      subtitle: 'Enter your new password',
      password: 'New Password',
      passwordPlaceholder: 'At least 8 characters',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Enter password again',
      submit: 'Change Password',
      submitting: 'Changing...',
      successTitle: 'Password Changed!',
      successDesc: 'Please login with your new password.',
      goToLogin: 'Go to Login',
      notConfigured: 'Supabase not configured',
      errorPasswordMismatch: 'Passwords do not match.',
      errorPasswordTooShort: 'Password must be at least 8 characters.',
      errorGeneric: 'An error occurred. Please try again.',
    },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.errorPasswordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      return;
    }

    if (!supabase) {
      setError(t.notConfigured);
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || t.errorGeneric);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = supabase !== null;

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      {/* Update Password Form */}
      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="container mx-auto max-w-md">
          {!isConfigured ? (
            <Card className="bg-card border-border/60">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-yellow-500/10 mb-4">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle>{t.notConfigured}</CardTitle>
              </CardHeader>
            </Card>
          ) : success ? (
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-500/40">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-green-500/10 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-500">{t.successTitle}</CardTitle>
                <CardDescription>{t.successDesc}</CardDescription>
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
                <div className="mx-auto p-3 rounded-full bg-primary/10 neon-glow mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t.title}</CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {t.password}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        required
                        className="w-full px-4 py-3 pr-12 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {t.confirmPassword}
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirmPasswordPlaceholder}
                      required
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        {t.submit}
                      </>
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
