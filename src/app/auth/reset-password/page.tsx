'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, KeyRound, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const texts = {
    ko: {
      back: '홈으로',
      title: '비밀번호 재설정',
      subtitle: '가입한 이메일 주소를 입력하세요',
      email: '이메일',
      emailPlaceholder: '이메일을 입력하세요',
      submit: '재설정 링크 전송',
      submitting: '전송 중...',
      successTitle: '이메일 전송 완료!',
      successDesc: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
      backToLogin: '로그인으로 돌아가기',
      notConfigured: 'Supabase가 설정되지 않았습니다',
      notConfiguredDesc: '.env.local 파일에 Supabase 환경 변수를 설정해주세요.',
      errorNotFound: '등록되지 않은 이메일입니다.',
      errorGeneric: '오류가 발생했습니다. 다시 시도해주세요.',
    },
    en: {
      back: 'Home',
      title: 'Reset Password',
      subtitle: 'Enter your registered email address',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      submit: 'Send Reset Link',
      submitting: 'Sending...',
      successTitle: 'Email Sent!',
      successDesc: 'A password reset link has been sent to your email. Please check your inbox.',
      backToLogin: 'Back to Login',
      notConfigured: 'Supabase not configured',
      notConfiguredDesc: 'Please set Supabase environment variables in .env.local file.',
      errorNotFound: 'Email not registered.',
      errorGeneric: 'An error occurred. Please try again.',
    },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!supabase) {
      setError(t.notConfigured);
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (resetError) {
        setError(resetError.message || t.errorGeneric);
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
      {/* Navigation */}
      <Navigation />

      {/* Reset Password Form */}
      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="container mx-auto max-w-md">
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
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToLogin}
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border/60">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-primary/10 neon-glow mb-4">
                  <KeyRound className="h-8 w-8 text-primary" />
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

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
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
                        <Mail className="h-5 w-5" />
                        {t.submit}
                      </>
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backToLogin}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
