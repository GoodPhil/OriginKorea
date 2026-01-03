'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Lock, UserPlus, Eye, EyeOff, AlertCircle, Loader2, CheckCircle, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function SignupPage() {
  const { language } = useLanguage();
  const { signUp, signInWithGoogle, isConfigured, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const texts = {
    ko: {
      back: '홈으로',
      title: '회원가입',
      subtitle: 'Origin 커뮤니티 계정을 만들어 보세요',
      displayName: '닉네임',
      displayNamePlaceholder: '닉네임을 입력하세요',
      email: '이메일',
      emailPlaceholder: '이메일을 입력하세요',
      password: '비밀번호',
      passwordPlaceholder: '8자 이상 비밀번호',
      confirmPassword: '비밀번호 확인',
      confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',
      signup: '회원가입',
      signingUp: '가입 중...',
      or: '또는',
      googleSignup: 'Google로 가입',
      hasAccount: '이미 계정이 있으신가요?',
      login: '로그인',
      notConfigured: 'Supabase가 설정되지 않았습니다',
      notConfiguredDesc: '.env.local 파일에 Supabase 환경 변수를 설정해주세요.',
      successTitle: '가입 완료!',
      successDesc: '이메일로 확인 링크가 전송되었습니다. 이메일을 확인해주세요.',
      goToLogin: '로그인하러 가기',
      errorPasswordMismatch: '비밀번호가 일치하지 않습니다.',
      errorPasswordTooShort: '비밀번호는 8자 이상이어야 합니다.',
      errorEmailExists: '이미 사용 중인 이메일입니다.',
      errorGeneric: '가입 중 오류가 발생했습니다.',
    },
    en: {
      back: 'Home',
      title: 'Sign Up',
      subtitle: 'Create your Origin community account',
      displayName: 'Display Name',
      displayNamePlaceholder: 'Enter your display name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Enter password again',
      signup: 'Sign Up',
      signingUp: 'Signing up...',
      or: 'or',
      googleSignup: 'Sign up with Google',
      hasAccount: 'Already have an account?',
      login: 'Login',
      notConfigured: 'Supabase not configured',
      notConfiguredDesc: 'Please set Supabase environment variables in .env.local file.',
      successTitle: 'Registration Complete!',
      successDesc: 'A confirmation link has been sent to your email. Please check your inbox.',
      goToLogin: 'Go to Login',
      errorPasswordMismatch: 'Passwords do not match.',
      errorPasswordTooShort: 'Password must be at least 8 characters.',
      errorEmailExists: 'This email is already in use.',
      errorGeneric: 'An error occurred during sign up.',
    },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError(t.errorPasswordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, displayName);

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError(t.errorEmailExists);
        } else {
          setError(signUpError.message || t.errorGeneric);
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message || t.errorGeneric);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <Navigation />

      {/* Signup Form */}
      <section className="py-12 md:py-20 px-4 relative z-10">
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
              <CardContent>
                <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs">
                  <p className="text-muted-foreground mb-2"># .env.local</p>
                  <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
                </div>
              </CardContent>
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
                  <UserPlus className="h-8 w-8 text-primary" />
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

                  {/* Password */}
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

                  {/* Signup Button */}
                  <button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t.signingUp}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        {t.signup}
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">{t.or}</span>
                    </div>
                  </div>

                  {/* Google Signup */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isLoading || authLoading}
                    className="w-full py-3 bg-secondary border border-border rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t.googleSignup}
                  </button>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm">
                  <p className="text-muted-foreground">
                    {t.hasAccount}{' '}
                    <Link href="/auth/login" className="text-primary hover:underline font-medium">
                      {t.login}
                    </Link>
                  </p>
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
