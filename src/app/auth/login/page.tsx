'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const { language } = useLanguage();
  const { signIn, signInWithGoogle, isConfigured, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/';

  // Check for success message from registration
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setSuccess(language === 'ko'
        ? '회원가입이 완료되었습니다. 이메일을 확인해주세요.'
        : 'Registration successful. Please check your email.');
    }
  }, [searchParams, language]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const texts = {
    ko: {
      back: '홈으로',
      title: '로그인',
      subtitle: 'Origin Korea 계정에 로그인하세요',
      email: '이메일',
      emailPlaceholder: 'example@email.com',
      password: '비밀번호',
      passwordPlaceholder: '비밀번호를 입력하세요',
      login: '로그인',
      loggingIn: '로그인 중...',
      or: '또는',
      googleLogin: 'Google로 로그인',
      noAccount: '계정이 없으신가요?',
      signUp: '회원가입',
      forgotPassword: '비밀번호 찾기',
      rememberMe: '로그인 상태 유지',
      notConfigured: 'Supabase가 설정되지 않았습니다',
      notConfiguredDesc: '.env.local 파일에 Supabase 환경 변수를 설정해주세요.',
      errorInvalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
      errorEmailNotConfirmed: '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
      errorGeneric: '로그인 중 오류가 발생했습니다.',
      welcomeBack: '다시 만나서 반갑습니다!',
      secureLogin: '안전한 로그인',
    },
    en: {
      back: 'Home',
      title: 'Login',
      subtitle: 'Sign in to your Origin Korea account',
      email: 'Email',
      emailPlaceholder: 'example@email.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      login: 'Login',
      loggingIn: 'Logging in...',
      or: 'or',
      googleLogin: 'Continue with Google',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      notConfigured: 'Supabase not configured',
      notConfiguredDesc: 'Please set Supabase environment variables in .env.local file.',
      errorInvalidCredentials: 'Invalid email or password.',
      errorEmailNotConfirmed: 'Email confirmation required. Please check your email.',
      errorGeneric: 'An error occurred during login.',
      welcomeBack: 'Welcome back!',
      secureLogin: 'Secure Login',
    },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError(t.errorInvalidCredentials);
        } else if (signInError.message.includes('Email not confirmed')) {
          setError(t.errorEmailNotConfirmed);
        } else {
          setError(signInError.message || t.errorGeneric);
        }
        return;
      }

      router.push(redirectTo);
    } catch (err) {
      setError(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message || t.errorGeneric);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Login Form */}
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
          ) : (
            <Card className="bg-card border-border/60 shadow-xl">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                  <LogIn className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                <CardDescription className="text-base">{t.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {success}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        {t.password}
                      </label>
                      <Link
                        href="/auth/reset-password"
                        className="text-xs text-primary hover:underline"
                      >
                        {t.forgotPassword}
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 pr-12 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                      {t.rememberMe}
                    </label>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className="w-full py-6 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {t.loggingIn}
                      </>
                    ) : (
                      <>
                        {t.login}
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">{t.or}</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || authLoading}
                  className="w-full py-6 text-base font-medium rounded-xl border-2 hover:bg-secondary/50 transition-all"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t.googleLogin}
                </Button>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.noAccount}{' '}
                    <Link href="/auth/register" className="text-primary hover:underline font-semibold">
                      {t.signUp}
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
