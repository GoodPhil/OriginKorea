'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Power,
  AlertTriangle,
  Check,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MaintenanceSettings {
  maintenance_mode: boolean;
  maintenance_message_ko: string;
  maintenance_message_en: string;
  maintenance_end_time: string | null;
  updated_by?: string;
  updated_at?: string;
}

export function MaintenanceToggle() {
  const { session, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [messageKo, setMessageKo] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [endTime, setEndTime] = useState('');

  const texts = {
    ko: {
      title: '사이트 점검 모드',
      description: '점검 모드를 활성화하면 관리자를 제외한 모든 사용자에게 점검 화면이 표시됩니다.',
      enabled: '점검 중',
      disabled: '운영 중',
      turnOn: '점검 모드 켜기',
      turnOff: '점검 모드 끄기',
      updating: '변경 중...',
      messageKo: '점검 메시지 (한국어)',
      messageEn: '점검 메시지 (영어)',
      endTime: '예상 완료 시간',
      endTimePlaceholder: '예: 2026-01-01T15:00',
      lastUpdated: '마지막 변경',
      by: '변경자',
      showDetails: '상세 설정',
      hideDetails: '상세 설정 닫기',
      save: '설정 저장',
      warning: '주의: 점검 모드를 켜면 일반 사용자들이 사이트에 접근할 수 없습니다.',
    },
    en: {
      title: 'Site Maintenance Mode',
      description: 'When enabled, all users except admins will see the maintenance screen.',
      enabled: 'Maintenance',
      disabled: 'Online',
      turnOn: 'Enable Maintenance',
      turnOff: 'Disable Maintenance',
      updating: 'Updating...',
      messageKo: 'Message (Korean)',
      messageEn: 'Message (English)',
      endTime: 'Estimated End Time',
      endTimePlaceholder: 'e.g., 2026-01-01T15:00',
      lastUpdated: 'Last Updated',
      by: 'Updated by',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      save: 'Save Settings',
      warning: 'Warning: Enabling maintenance mode will prevent regular users from accessing the site.',
    },
  };

  const t = texts[language];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
      setMessageKo(data.maintenance_message_ko || '');
      setMessageEn(data.maintenance_message_en || '');
      setEndTime(data.maintenance_end_time || '');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newMode?: boolean) => {
    if (!session?.access_token) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          maintenance_mode: newMode ?? settings?.maintenance_mode,
          maintenance_message_ko: messageKo,
          maintenance_message_en: messageEn,
          maintenance_end_time: endTime || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newMode = !settings?.maintenance_mode;
    await updateSettings(newMode);
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isMaintenanceOn = settings?.maintenance_mode ?? false;

  return (
    <Card className={`border-2 transition-all ${
      isMaintenanceOn
        ? 'bg-red-500/10 border-red-500/50'
        : 'bg-green-500/10 border-green-500/50'
    }`}>
      <CardContent className="p-4 sm:p-6">
        {/* Main Toggle Section - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Info */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isMaintenanceOn ? 'bg-red-500/20' : 'bg-green-500/20'
            }`}>
              {isMaintenanceOn ? (
                <Settings className="h-6 w-6 text-red-400 animate-spin" style={{ animationDuration: '4s' }} />
              ) : (
                <Power className="h-6 w-6 text-green-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{t.title}</h3>
              <div className="flex items-center gap-2">
                <Badge className={isMaintenanceOn
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
                }>
                  {isMaintenanceOn ? t.enabled : t.disabled}
                </Badge>
                {settings?.updated_at && (
                  <span className="text-xs text-zinc-500">
                    {new Date(settings.updated_at).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Big Toggle Button - Easy to tap on mobile */}
          <Button
            onClick={toggleMaintenanceMode}
            disabled={isUpdating}
            size="lg"
            className={`min-w-[160px] h-14 text-base font-bold rounded-xl transition-all ${
              isMaintenanceOn
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {t.updating}
              </>
            ) : isMaintenanceOn ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                {t.turnOff}
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 mr-2" />
                {t.turnOn}
              </>
            )}
          </Button>
        </div>

        {/* Warning Message */}
        {!isMaintenanceOn && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-400">{t.warning}</p>
            </div>
          </div>
        )}

        {/* Expand/Collapse Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t.hideDetails}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t.showDetails}
            </>
          )}
        </button>

        {/* Detailed Settings */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-zinc-700 space-y-4">
            {/* Korean Message */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {t.messageKo}
              </label>
              <textarea
                value={messageKo}
                onChange={(e) => setMessageKo(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="서비스 점검 중입니다..."
              />
            </div>

            {/* English Message */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {t.messageEn}
              </label>
              <textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="We are currently under maintenance..."
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                {t.endTime}
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={() => updateSettings()}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.updating}
                </>
              ) : (
                t.save
              )}
            </Button>

            {/* Last Updated Info */}
            {settings?.updated_by && (
              <p className="text-xs text-zinc-500 text-center">
                {t.by}: {settings.updated_by}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
