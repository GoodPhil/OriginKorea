'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Users, Clock, CheckCircle2, XCircle, AlertCircle,
  Loader2, RefreshCw, Search, Mail, Phone, FileText, Calendar,
  UserCheck, UserX, Eye, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface RegistrationRequest {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  reason: string;
  referral_source: string | null;
  additional_info: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminRegistrationsPage() {
  const { language } = useLanguage();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<{ id: string; email: string; password: string } | null>(null);

  const texts = {
    ko: {
      title: '회원가입 신청 관리',
      subtitle: '가입 신청을 검토하고 승인/거절합니다',
      back: '관리자 대시보드',
      loading: '로딩 중...',
      refresh: '새로고침',
      all: '전체',
      pending: '대기 중',
      approved: '승인됨',
      rejected: '거절됨',
      searchPlaceholder: '이메일 또는 이름 검색...',
      noRequests: '가입 신청이 없습니다.',
      email: '이메일',
      name: '이름',
      phone: '연락처',
      reason: '가입 사유',
      referral: '경로',
      additionalInfo: '추가 정보',
      submittedAt: '신청일',
      reviewedAt: '처리일',
      approve: '승인',
      reject: '거절',
      approving: '승인 중...',
      rejecting: '거절 중...',
      adminNotes: '관리자 메모',
      adminNotesPlaceholder: '거절 사유 또는 메모를 입력하세요',
      approvalSuccess: '승인 완료!',
      tempPassword: '임시 비밀번호',
      copyPassword: '비밀번호 복사',
      copied: '복사됨!',
      passwordNotice: '이 비밀번호를 사용자에게 안전하게 전달해주세요.',
      unauthorized: '관리자 권한이 필요합니다.',
    },
    en: {
      title: 'Registration Request Management',
      subtitle: 'Review and approve/reject registration requests',
      back: 'Admin Dashboard',
      loading: 'Loading...',
      refresh: 'Refresh',
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      searchPlaceholder: 'Search by email or name...',
      noRequests: 'No registration requests.',
      email: 'Email',
      name: 'Name',
      phone: 'Phone',
      reason: 'Reason',
      referral: 'Referral',
      additionalInfo: 'Additional Info',
      submittedAt: 'Submitted',
      reviewedAt: 'Reviewed',
      approve: 'Approve',
      reject: 'Reject',
      approving: 'Approving...',
      rejecting: 'Rejecting...',
      adminNotes: 'Admin Notes',
      adminNotesPlaceholder: 'Enter rejection reason or notes',
      approvalSuccess: 'Approved!',
      tempPassword: 'Temporary Password',
      copyPassword: 'Copy Password',
      copied: 'Copied!',
      passwordNotice: 'Please securely share this password with the user.',
      unauthorized: 'Admin access required.',
    },
  };

  const t = texts[language];

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/registrations?status=${filter}`);
      const data = await response.json();

      if (response.ok) {
        setRegistrations(data.registrations || []);
        setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchRegistrations();
    }
  }, [authLoading, isAdmin, fetchRegistrations]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setApprovalResult(null);

    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          admin_notes: adminNotes[id] || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === 'approve' && data.temp_password) {
          setApprovalResult({
            id,
            email: data.email,
            password: data.temp_password,
          });
        }
        fetchRegistrations();
      } else {
        alert(data.error || 'Error processing request');
      }
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(text);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const filteredRegistrations = registrations.filter(r => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return r.email.toLowerCase().includes(query) ||
           r.display_name.toLowerCase().includes(query);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />{t.pending}</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />{t.approved}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />{t.rejected}</Badge>;
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.unauthorized}</h1>
          <Link href="/" className="text-primary hover:underline">
            {language === 'ko' ? '홈으로 돌아가기' : 'Go to Home'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground mt-1">{t.subtitle}</p>
            </div>
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border/60">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{t.all}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-xs text-yellow-500/80">{t.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
              <div className="text-xs text-green-500/80">{t.approved}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
              <div className="text-xs text-red-500/80">{t.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {t[status]}
                {status === 'pending' && stats.pending > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-500 text-yellow-950 text-xs">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Approval Success Modal */}
        {approvalResult && (
          <Card className="bg-green-500/10 border-green-500/20 mb-6">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-500 mb-2">{t.approvalSuccess}</h3>
                  <p className="text-sm mb-3">{approvalResult.email}</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                    <span className="text-sm font-medium">{t.tempPassword}:</span>
                    <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">
                      {approvalResult.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(approvalResult.password)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                    >
                      {copiedPassword === approvalResult.password ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{t.passwordNotice}</p>
                </div>
                <button
                  onClick={() => setApprovalResult(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noRequests}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((request) => (
              <Card key={request.id} className="bg-card border-border/60">
                <CardContent className="py-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{request.display_name}</div>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <button
                        onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                      >
                        {expandedId === request.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t.submittedAt}: {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    {request.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.phone}
                      </div>
                    )}
                  </div>

                  {/* Reason Preview */}
                  <div className="p-3 rounded-lg bg-secondary/30 mb-3">
                    <div className="text-xs text-muted-foreground mb-1">{t.reason}</div>
                    <p className="text-sm">{request.reason}</p>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === request.id && (
                    <div className="space-y-3 border-t border-border/40 pt-3 mt-3">
                      {request.referral_source && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t.referral}</div>
                          <p className="text-sm">{request.referral_source}</p>
                        </div>
                      )}
                      {request.additional_info && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t.additionalInfo}</div>
                          <p className="text-sm">{request.additional_info}</p>
                        </div>
                      )}
                      {request.admin_notes && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t.adminNotes}</div>
                          <p className="text-sm text-yellow-500">{request.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions for Pending */}
                  {request.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-border/40">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder={t.adminNotesPlaceholder}
                          value={adminNotes[request.id] || ''}
                          onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(request.id, 'approve')}
                          disabled={processingId === request.id}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          {t.approve}
                        </button>
                        <button
                          onClick={() => handleAction(request.id, 'reject')}
                          disabled={processingId === request.id}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
