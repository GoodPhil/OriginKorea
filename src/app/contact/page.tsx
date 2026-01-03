'use client';

import { ProtectedPage } from '@/hooks/usePagePermission';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

// Web3Forms access key - get your free key at https://web3forms.com/
// Enter your email (goodphil@gmail.com) and you'll receive an access key
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';

// Target email for receiving form submissions
const TARGET_EMAIL = 'goodphil@gmail.com';

export default function ContactPage() {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // If no API key is configured, fall back to mailto
    if (!WEB3FORMS_ACCESS_KEY) {
      const mailtoLink = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(`[Origin Korea] ${formData.subject}`)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;
      window.location.href = mailtoLink;
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    try {
      // Submit to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          subject: `[Origin Korea] ${formData.subject}`,
          message: formData.message,
          from_name: 'Origin Korea',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 5000);
      } else {
        throw new Error(result.message || 'Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      setErrorMessage(
        language === 'ko'
          ? '전송에 실패했습니다. 직접 이메일을 보내주세요.'
          : 'Submission failed. Please send an email directly.'
      );

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProtectedPage>
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <Navigation />

      {/* Hero */}
      <section className="py-12 sm:py-16 md:py-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 neon-glow mb-4 sm:mb-6">
            <Mail className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">
              {language === 'ko' ? '문의' : 'Contact'}
            </span>{' '}
            {language === 'ko' ? '및 상담' : 'Us'}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {language === 'ko'
              ? 'Origin Korea에 대해 궁금한 점이 있으시면 언제든지 연락주세요'
              : 'Feel free to contact us if you have any questions about Origin Korea'}
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-8 sm:py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="bg-card border-border/60 text-center">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 neon-glow w-fit mx-auto mb-3 sm:mb-4">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                  {language === 'ko' ? '관리자' : 'Administrator'}
                </div>
                <div className="text-xl sm:text-2xl font-bold gradient-text">PHIL</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 text-center">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 neon-glow w-fit mx-auto mb-3 sm:mb-4">
                  <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Email</div>
                <a
                  href="mailto:goodphil@gmail.com"
                  className="text-sm sm:text-lg font-bold text-primary hover:underline break-all"
                >
                  goodphil@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 text-center">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 neon-glow w-fit mx-auto mb-3 sm:mb-4">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                  {language === 'ko' ? '응답 시간' : 'Response Time'}
                </div>
                <div className="text-base sm:text-lg font-bold">
                  {language === 'ko' ? '24-48시간' : '24-48 hours'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-border/60">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl">
                  {language === 'ko' ? '문의 양식' : 'Contact Form'}
                </CardTitle>
                <CardDescription>
                  {language === 'ko'
                    ? '아래 양식을 작성해주시면 이메일로 답변드리겠습니다'
                    : 'Fill out the form below and we will respond via email'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status === 'success' ? (
                  <div className="text-center py-12 animate-fade-in">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'ko' ? '문의가 전송되었습니다!' : 'Message Sent!'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'ko'
                        ? '24-48시간 내에 이메일로 답변드리겠습니다.'
                        : 'We will respond via email within 24-48 hours.'}
                    </p>
                  </div>
                ) : status === 'error' ? (
                  <div className="text-center py-12 animate-fade-in">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'ko' ? '전송 실패' : 'Submission Failed'}
                    </h3>
                    <p className="text-muted-foreground mb-4">{errorMessage}</p>
                    <a
                      href="mailto:goodphil@gmail.com"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {language === 'ko' ? '직접 이메일 보내기' : 'Send Email Directly'}
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        {language === 'ko' ? '이름' : 'Name'} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        placeholder={language === 'ko' ? '홍길동' : 'John Doe'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        {language === 'ko' ? '이메일' : 'Email'} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        {language === 'ko' ? '제목' : 'Subject'} *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        placeholder={
                          language === 'ko'
                            ? '문의 제목을 입력하세요'
                            : 'Enter your subject'
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        {language === 'ko' ? '메시지' : 'Message'} *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        rows={6}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                        placeholder={
                          language === 'ko'
                            ? '문의 내용을 상세히 작성해주세요'
                            : 'Please describe your inquiry in detail'
                        }
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {language === 'ko' ? '전송 중...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          {language === 'ko' ? '문의 보내기' : 'Send Message'}
                        </>
                      )}
                    </button>

                    <p className="text-xs text-muted-foreground text-center">
                      {language === 'ko'
                        ? '* 필수 입력 항목입니다. 문의 내용은 관리자 이메일로 직접 전송됩니다.'
                        : '* Required fields. Your message will be sent directly to the administrator.'}
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 bg-card/20 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold mb-8 text-center">
            {language === 'ko' ? '자주 묻는 질문' : 'Frequently Asked Questions'}
          </h3>

          <div className="space-y-4">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ko'
                    ? 'Origin은 어떤 프로젝트인가요?'
                    : 'What is Origin?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {language === 'ko'
                    ? 'Origin은 알고리즘 통화 LGNS를 기반으로 한 탈중앙화 금융 운영 시스템입니다. 화폐 자유와 프라이버시 보호를 목표로 합니다.'
                    : 'Origin is a decentralized financial operating system based on algorithmic currency LGNS, aiming for monetary freedom and privacy protection.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ko'
                    ? '스테이킹은 어떻게 시작하나요?'
                    : 'How do I start staking?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {language === 'ko'
                    ? '계산기 페이지에서 예상 수익을 확인하신 후, QuickSwap DEX에서 LGNS를 구매하여 스테이킹을 시작할 수 있습니다.'
                    : 'Check expected returns on the calculator page, then purchase LGNS on QuickSwap DEX to start staking.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ko'
                    ? '문의 응답은 얼마나 걸리나요?'
                    : 'How long does it take to get a response?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {language === 'ko'
                    ? '일반적으로 24-48시간 내에 이메일로 답변드립니다. 긴급한 경우 제목에 [긴급]을 표시해주세요.'
                    : 'We typically respond within 24-48 hours via email. For urgent matters, please mark [URGENT] in the subject.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </ProtectedPage>
  );
}
