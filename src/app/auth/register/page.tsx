'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus, Mail, User, Phone, FileText, HelpCircle,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, Clock,
  Send, Info, Sparkles, ArrowRight, Shield, MapPin, Calendar, Users
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function RegisterPage() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    found: boolean;
    status?: string;
    created_at?: string;
    reviewed_at?: string;
    admin_notes?: string;
  } | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    real_name: '',
    gender: '',
    age: '',
    region: '',
    phone: '',
    reason: '',
    referral_source: '',
    additional_info: '',
  });

  const texts = {
    ko: {
      title: '회원가입 신청',
      subtitle: 'Origin Korea 커뮤니티에 가입하세요',
      step1: '기본 정보',
      step2: '상세 정보',
      step3: '가입 사유',
      email: '이메일',
      emailPlaceholder: 'example@email.com',
      displayName: '닉네임',
      displayNamePlaceholder: '사용할 닉네임을 입력하세요',
      realName: '실명',
      realNamePlaceholder: '실명을 입력하세요',
      gender: '성별',
      genderPlaceholder: '성별을 선택하세요',
      genderMale: '남성',
      genderFemale: '여성',
      genderOther: '기타',
      age: '나이',
      agePlaceholder: '나이를 입력하세요',
      region: '지역',
      regionPlaceholder: '거주 지역을 선택하세요',
      phone: '연락처',
      phonePlaceholder: '010-0000-0000',
      reason: '가입 사유',
      reasonPlaceholder: 'Origin Korea에 가입하고 싶은 이유를 알려주세요. LGNS 토큰에 대한 관심사나 참여 목적 등을 자유롭게 작성해주세요.',
      referralSource: '어떻게 알게 되셨나요?',
      referralSourcePlaceholder: '예: 트위터, 텔레그램, 지인 소개, 검색 등',
      additionalInfo: '추가 정보',
      additionalInfoPlaceholder: '관리자에게 전달하고 싶은 추가 정보가 있다면 작성해주세요',
      submit: '가입 신청하기',
      submitting: '신청 중...',
      checkStatus: '상태 확인',
      checking: '확인 중...',
      backToLogin: '로그인으로',
      required: '필수',
      optional: '선택',
      next: '다음',
      prev: '이전',
      successTitle: '신청이 완료되었습니다!',
      successMessage: '관리자 검토 후 승인 시 이메일로 안내드리겠습니다.',
      pendingStatus: '심사 중',
      approvedStatus: '승인됨',
      rejectedStatus: '거절됨',
      statusNotFound: '신청 내역을 찾을 수 없습니다.',
      submittedAt: '신청일',
      reviewedAt: '심사일',
      rejectionReason: '거절 사유',
      notice: '가입 안내',
      noticeText: '가입 신청 후 관리자가 검토하여 승인 여부를 결정합니다. 승인 시 입력하신 이메일로 임시 비밀번호가 전달됩니다.',
      alreadyHave: '이미 계정이 있으신가요?',
      login: '로그인',
      benefits: '가입 혜택',
      benefit1: '실시간 LGNS 분석 데이터',
      benefit2: '커뮤니티 전용 콘텐츠',
      benefit3: '가격 알림 서비스',
    },
    en: {
      title: 'Join Origin Korea',
      subtitle: 'Apply to join the Origin Korea community',
      step1: 'Basic Info',
      step2: 'Details',
      step3: 'Purpose',
      email: 'Email',
      emailPlaceholder: 'example@email.com',
      displayName: 'Nickname',
      displayNamePlaceholder: 'Enter your preferred nickname',
      realName: 'Real Name',
      realNamePlaceholder: 'Enter your real name',
      gender: 'Gender',
      genderPlaceholder: 'Select your gender',
      genderMale: 'Male',
      genderFemale: 'Female',
      genderOther: 'Other',
      age: 'Age',
      agePlaceholder: 'Enter your age',
      region: 'Region',
      regionPlaceholder: 'Select your region',
      phone: 'Phone',
      phonePlaceholder: '010-0000-0000',
      reason: 'Reason for Joining',
      reasonPlaceholder: 'Tell us why you want to join Origin Korea. Share your interest in LGNS token or your purpose for participating.',
      referralSource: 'How did you find us?',
      referralSourcePlaceholder: 'e.g., Twitter, Telegram, Friend, Search',
      additionalInfo: 'Additional Information',
      additionalInfoPlaceholder: 'Any additional information you would like to share with the admin',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      checkStatus: 'Check Status',
      checking: 'Checking...',
      backToLogin: 'Back to Login',
      required: 'Required',
      optional: 'Optional',
      next: 'Next',
      prev: 'Back',
      successTitle: 'Application Submitted!',
      successMessage: 'We will notify you via email once your application is reviewed.',
      pendingStatus: 'Under Review',
      approvedStatus: 'Approved',
      rejectedStatus: 'Rejected',
      statusNotFound: 'No application found.',
      submittedAt: 'Submitted',
      reviewedAt: 'Reviewed',
      rejectionReason: 'Rejection Reason',
      notice: 'Application Notice',
      noticeText: 'After submitting, an administrator will review and decide on approval. Upon approval, a temporary password will be sent to your email.',
      alreadyHave: 'Already have an account?',
      login: 'Login',
      benefits: 'Member Benefits',
      benefit1: 'Real-time LGNS analytics',
      benefit2: 'Community-exclusive content',
      benefit3: 'Price alert service',
    },
  };

  const t = texts[language];

  const regions = [
    { ko: '서울', en: 'Seoul' },
    { ko: '경기', en: 'Gyeonggi' },
    { ko: '인천', en: 'Incheon' },
    { ko: '강원', en: 'Gangwon' },
    { ko: '충북', en: 'Chungbuk' },
    { ko: '충남', en: 'Chungnam' },
    { ko: '대전', en: 'Daejeon' },
    { ko: '세종', en: 'Sejong' },
    { ko: '전북', en: 'Jeonbuk' },
    { ko: '전남', en: 'Jeonnam' },
    { ko: '광주', en: 'Gwangju' },
    { ko: '경북', en: 'Gyeongbuk' },
    { ko: '경남', en: 'Gyeongnam' },
    { ko: '대구', en: 'Daegu' },
    { ko: '울산', en: 'Ulsan' },
    { ko: '부산', en: 'Busan' },
    { ko: '제주', en: 'Jeju' },
    { ko: '해외', en: 'Overseas' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitResult({ success: true, message: data.message || t.successMessage });
        setFormData({
          email: '',
          display_name: '',
          real_name: '',
          gender: '',
          age: '',
          region: '',
          phone: '',
          reason: '',
          referral_source: '',
          additional_info: '',
        });
        setActiveStep(1);
      } else {
        setSubmitResult({ success: false, message: data.error });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: language === 'ko' ? '오류가 발생했습니다.' : 'An error occurred.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!formData.email) return;

    setCheckingStatus(true);
    setStatusResult(null);

    try {
      const response = await fetch(`/api/registration?email=${encodeURIComponent(formData.email)}`);
      const data = await response.json();
      setStatusResult(data);
    } catch (error) {
      console.error('Status check error:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />{t.pendingStatus}</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />{t.approvedStatus}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" />{t.rejectedStatus}</Badge>;
      default:
        return null;
    }
  };

  const canProceedStep2 = formData.email && formData.display_name && formData.real_name && formData.gender && formData.age && formData.region;
  const canProceedStep3 = formData.reason;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-8 md:py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-2xl">
          {/* Success State */}
          {submitResult?.success ? (
            <Card className="bg-card border-border/60 shadow-xl">
              <CardContent className="py-12 text-center">
                <div className="mx-auto p-4 rounded-full bg-green-500/10 w-fit mb-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t.successTitle}</h2>
                <p className="text-muted-foreground mb-6">{submitResult.message}</p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setSubmitResult(null)}>
                    {language === 'ko' ? '다시 신청' : 'New Application'}
                  </Button>
                  <Button asChild>
                    <Link href="/auth/login">{t.login}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 w-fit mb-4">
                  <UserPlus className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
                <p className="text-muted-foreground">{t.subtitle}</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setActiveStep(step)}
                      disabled={step === 2 && !canProceedStep2 || step === 3 && !canProceedStep3}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                        ${activeStep >= step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'}
                        ${step === 2 && !canProceedStep2 || step === 3 && !canProceedStep3
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:scale-105'}
                      `}
                    >
                      {step}
                    </button>
                    {step < 3 && (
                      <div className={`w-12 sm:w-20 h-1 mx-2 rounded-full transition-colors ${
                        activeStep > step ? 'bg-primary' : 'bg-secondary'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="flex justify-between mb-6 px-2">
                <span className={`text-xs sm:text-sm ${activeStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {t.step1}
                </span>
                <span className={`text-xs sm:text-sm ${activeStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {t.step2}
                </span>
                <span className={`text-xs sm:text-sm ${activeStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {t.step3}
                </span>
              </div>

              {/* Main Card */}
              <Card className="bg-card border-border/60 shadow-xl">
                <CardContent className="pt-6">
                  {/* Error Message */}
                  {submitResult && !submitResult.success && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{submitResult.message}</p>
                    </div>
                  )}

                  {/* Status Result */}
                  {statusResult && (
                    <div className={`p-4 rounded-xl border mb-6 ${
                      statusResult.found
                        ? statusResult.status === 'approved'
                          ? 'bg-green-500/10 border-green-500/20'
                          : statusResult.status === 'rejected'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-yellow-500/10 border-yellow-500/20'
                        : 'bg-secondary/50 border-border'
                    }`}>
                      {statusResult.found ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{formData.email}</span>
                            {getStatusBadge(statusResult.status || '')}
                          </div>
                          {statusResult.created_at && (
                            <p className="text-xs text-muted-foreground">
                              {t.submittedAt}: {new Date(statusResult.created_at).toLocaleDateString()}
                            </p>
                          )}
                          {statusResult.admin_notes && statusResult.status === 'rejected' && (
                            <p className="text-sm text-red-400 mt-2">
                              {t.rejectionReason}: {statusResult.admin_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t.statusNotFound}</p>
                      )}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Step 1: Basic Info */}
                    {activeStep === 1 && (
                      <div className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {t.email}
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder={t.emailPlaceholder}
                              required
                              className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCheckStatus}
                              disabled={!formData.email || checkingStatus}
                              className="shrink-0"
                            >
                              {checkingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : t.checkStatus}
                            </Button>
                          </div>
                        </div>

                        {/* Display Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {t.displayName}
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                          </label>
                          <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            placeholder={t.displayNamePlaceholder}
                            required
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Real Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {t.realName}
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                          </label>
                          <input
                            type="text"
                            value={formData.real_name}
                            onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                            placeholder={t.realNamePlaceholder}
                            required
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {t.gender}
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          >
                            <option value="">{t.genderPlaceholder}</option>
                            <option value="male">{t.genderMale}</option>
                            <option value="female">{t.genderFemale}</option>
                            <option value="other">{t.genderOther}</option>
                          </select>
                        </div>

                        {/* Age and Region in a row */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Age */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {t.age}
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={formData.age}
                              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                              placeholder={t.agePlaceholder}
                              required
                              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                          </div>

                          {/* Region */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {t.region}
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                            </label>
                            <select
                              value={formData.region}
                              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                              required
                              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            >
                              <option value="">{t.regionPlaceholder}</option>
                              {regions.map((r) => (
                                <option key={r.ko} value={r.ko}>{r[language]}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Next Button */}
                        <Button
                          type="button"
                          onClick={() => setActiveStep(2)}
                          disabled={!canProceedStep2}
                          className="w-full py-6 text-base font-semibold rounded-xl"
                        >
                          {t.next}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Contact & Details */}
                    {activeStep === 2 && (
                      <div className="space-y-5">
                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {t.phone}
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t.optional}</Badge>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={t.phonePlaceholder}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {t.reason}
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t.required}</Badge>
                          </label>
                          <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder={t.reasonPlaceholder}
                            required
                            rows={5}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                          />
                        </div>

                        {/* Referral Source */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            {t.referralSource}
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t.optional}</Badge>
                          </label>
                          <input
                            type="text"
                            value={formData.referral_source}
                            onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                            placeholder={t.referralSourcePlaceholder}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep(1)}
                            className="flex-1 py-6 text-base rounded-xl"
                          >
                            {t.prev}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setActiveStep(3)}
                            disabled={!canProceedStep3}
                            className="flex-1 py-6 text-base font-semibold rounded-xl"
                          >
                            {t.next}
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Additional Info & Submit */}
                    {activeStep === 3 && (
                      <div className="space-y-5">
                        {/* Additional Info */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            {t.additionalInfo}
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t.optional}</Badge>
                          </label>
                          <textarea
                            value={formData.additional_info}
                            onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                            placeholder={t.additionalInfoPlaceholder}
                            rows={3}
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                          />
                        </div>

                        {/* Notice */}
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-500 mb-1 text-sm">{t.notice}</p>
                              <p className="text-xs text-muted-foreground">{t.noticeText}</p>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                          <h4 className="font-medium text-sm mb-3">{language === 'ko' ? '신청 정보 확인' : 'Application Summary'}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">{t.email}:</span>
                            <span className="truncate">{formData.email}</span>
                            <span className="text-muted-foreground">{t.displayName}:</span>
                            <span>{formData.display_name}</span>
                            <span className="text-muted-foreground">{t.realName}:</span>
                            <span>{formData.real_name}</span>
                            <span className="text-muted-foreground">{t.gender}:</span>
                            <span>{formData.gender === 'male' ? t.genderMale : formData.gender === 'female' ? t.genderFemale : t.genderOther}</span>
                            <span className="text-muted-foreground">{t.age}:</span>
                            <span>{formData.age}</span>
                            <span className="text-muted-foreground">{t.region}:</span>
                            <span>{formData.region}</span>
                          </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep(2)}
                            className="flex-1 py-6 text-base rounded-xl"
                          >
                            {t.prev}
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-6 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                {t.submitting}
                              </>
                            ) : (
                              <>
                                <Send className="h-5 w-5 mr-2" />
                                {t.submit}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Login Link */}
                  <div className="mt-6 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground">
                      {t.alreadyHave}{' '}
                      <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                        {t.login}
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Card */}
              <Card className="mt-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="py-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {t.benefits}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{t.benefit1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{t.benefit2}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{t.benefit3}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
