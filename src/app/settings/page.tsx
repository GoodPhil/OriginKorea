'use client';

import { ProtectedPage } from '@/hooks/usePagePermission';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, TrendingUp, AlertTriangle, CheckCircle, Smartphone, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePriceAlert } from '@/hooks/usePriceAlert';

export default function SettingsPage() {
  const { language } = useLanguage();
  const {
    isSupported,
    isSubscribed,
    permission,
    loading: pushLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const {
    settings: priceSettings,
    currentPrice,
    enableAlerts,
    disableAlerts,
    setThreshold,
    testAlert,
  } = usePriceAlert();

  const [thresholdInput, setThresholdInput] = useState(priceSettings.threshold.toString());

  useEffect(() => {
    setThresholdInput(priceSettings.threshold.toString());
  }, [priceSettings.threshold]);

  const texts = {
    ko: {
      back: '홈으로',
      title: '설정',
      heroTitle: '알림 설정',
      heroSubtitle: '푸시 알림 및 가격 알림을 설정하세요',
      pushNotifications: '푸시 알림',
      pushDesc: '중요 공지사항을 푸시 알림으로 받습니다',
      notSupported: '이 브라우저는 푸시 알림을 지원하지 않습니다',
      permissionDenied: '알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.',
      enable: '알림 활성화',
      disable: '알림 비활성화',
      testNotification: '테스트 알림 보내기',
      priceAlerts: '가격 알림',
      priceDesc: 'LGNS 가격이 설정한 비율 이상 변동하면 알림을 받습니다',
      threshold: '변동 임계값',
      thresholdDesc: '이 비율 이상 변동 시 알림',
      currentPrice: '현재 가격',
      enablePriceAlert: '가격 알림 활성화',
      disablePriceAlert: '가격 알림 비활성화',
      testPriceAlert: '테스트 가격 알림',
      status: '상태',
      active: '활성',
      inactive: '비활성',
      enabled: '활성화됨',
      disabled: '비활성화됨',
      save: '저장',
      installPWA: 'PWA 설치',
      installPWADesc: '홈 화면에 앱을 설치하면 더 나은 알림 경험을 제공합니다',
      howToInstall: '설치 방법',
      iosInstall: 'iOS: Safari에서 공유 버튼 → "홈 화면에 추가"',
      androidInstall: 'Android: Chrome 메뉴 → "홈 화면에 추가"',
      desktopInstall: 'Desktop: 주소창 오른쪽 설치 아이콘 클릭',
      notificationHistory: '알림 기록',
      noHistory: '알림 기록이 없습니다',
    },
    en: {
      back: 'Home',
      title: 'Settings',
      heroTitle: 'Notification Settings',
      heroSubtitle: 'Configure push notifications and price alerts',
      pushNotifications: 'Push Notifications',
      pushDesc: 'Receive important announcements via push notifications',
      notSupported: 'Push notifications are not supported in this browser',
      permissionDenied: 'Notification permission denied. Please allow in browser settings.',
      enable: 'Enable Notifications',
      disable: 'Disable Notifications',
      testNotification: 'Send Test Notification',
      priceAlerts: 'Price Alerts',
      priceDesc: 'Get notified when LGNS price changes beyond your threshold',
      threshold: 'Change Threshold',
      thresholdDesc: 'Alert when price changes by this percentage',
      currentPrice: 'Current Price',
      enablePriceAlert: 'Enable Price Alerts',
      disablePriceAlert: 'Disable Price Alerts',
      testPriceAlert: 'Test Price Alert',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      save: 'Save',
      installPWA: 'Install PWA',
      installPWADesc: 'Install the app to your home screen for better notification experience',
      howToInstall: 'How to Install',
      iosInstall: 'iOS: Tap Share button in Safari → "Add to Home Screen"',
      androidInstall: 'Android: Chrome menu → "Add to Home Screen"',
      desktopInstall: 'Desktop: Click install icon in address bar',
      notificationHistory: 'Notification History',
      noHistory: 'No notification history',
    },
  };

  const t = texts[language];

  const handleThresholdChange = () => {
    const value = parseFloat(thresholdInput);
    if (!isNaN(value) && value > 0 && value <= 50) {
      setThreshold(value);
    }
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
            <Bell className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="gradient-text">{t.heroTitle}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Settings Cards */}
      <section className="py-8 sm:py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Push Notifications Card */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">{t.pushNotifications}</CardTitle>
                    <CardDescription>{t.pushDesc}</CardDescription>
                  </div>
                </div>
                <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                  {isSubscribed ? t.enabled : t.disabled}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSupported ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">{t.notSupported}</span>
                </div>
              ) : permission === 'denied' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                  <BellOff className="h-5 w-5" />
                  <span className="text-sm">{t.permissionDenied}</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {isSubscribed ? (
                    <>
                      <button
                        type="button"
                        onClick={unsubscribe}
                        disabled={pushLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        <BellOff className="h-4 w-4" />
                        {t.disable}
                      </button>
                      <button
                        type="button"
                        onClick={sendTestNotification}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                      >
                        <Volume2 className="h-4 w-4" />
                        {t.testNotification}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={subscribe}
                      disabled={pushLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Bell className="h-4 w-4" />
                      {t.enable}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Alerts Card */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">{t.priceAlerts}</CardTitle>
                    <CardDescription>{t.priceDesc}</CardDescription>
                  </div>
                </div>
                <Badge variant={priceSettings.enabled ? 'default' : 'secondary'}>
                  {priceSettings.enabled ? t.active : t.inactive}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {permission !== 'granted' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">
                    {language === 'ko'
                      ? '가격 알림을 받으려면 먼저 푸시 알림을 활성화하세요'
                      : 'Enable push notifications first to receive price alerts'}
                  </span>
                </div>
              )}

              {/* Current Price Display */}
              {currentPrice && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-sm text-muted-foreground">{t.currentPrice}</div>
                  <div className="text-2xl font-bold gradient-text">${currentPrice.toFixed(4)}</div>
                </div>
              )}

              {/* Threshold Setting */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.threshold}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <button
                    type="button"
                    onClick={handleThresholdChange}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                  >
                    {t.save}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{t.thresholdDesc}</p>
              </div>

              {/* Enable/Disable Buttons */}
              <div className="flex flex-wrap gap-3">
                {priceSettings.enabled ? (
                  <>
                    <button
                      type="button"
                      onClick={disableAlerts}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <BellOff className="h-4 w-4" />
                      {t.disablePriceAlert}
                    </button>
                    <button
                      type="button"
                      onClick={testAlert}
                      disabled={!currentPrice}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Volume2 className="h-4 w-4" />
                      {t.testPriceAlert}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => enableAlerts()}
                    disabled={permission !== 'granted'}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-500/90 transition-colors disabled:opacity-50"
                  >
                    <TrendingUp className="h-4 w-4" />
                    {t.enablePriceAlert}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PWA Install Guide */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">{t.installPWA}</CardTitle>
                  <CardDescription>{t.installPWADesc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium">{t.howToInstall}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {t.iosInstall}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {t.androidInstall}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {t.desktopInstall}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </ProtectedPage>
  );
}
