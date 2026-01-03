'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { Web3Provider } from '@/components/Web3Provider';
import { AuthAlerts } from '@/components/AuthAlerts';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { MaintenanceProvider } from '@/components/MaintenanceProvider';

export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Simulate fetching notification count (replace with actual API call)
    const fetchNotifications = () => {
      // Example: Get unread notifications from localStorage or API
      const unreadCount = localStorage.getItem('unread-notifications');
      if (unreadCount) {
        setNotificationCount(parseInt(unreadCount, 10));
      }
    };

    fetchNotifications();

    // Listen for notification updates
    const handleNotificationUpdate = (e: CustomEvent) => {
      setNotificationCount(e.detail.count);
    };

    window.addEventListener('notification-update' as string, handleNotificationUpdate as EventListener);

    return () => {
      window.removeEventListener('notification-update' as string, handleNotificationUpdate as EventListener);
    };
  }, []);

  // Prevent hydration mismatch by showing a minimal placeholder until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Web3Provider>
            <WalletProvider>
              <MaintenanceProvider>
                <AuthAlerts />
                {children}
                <MobileBottomNav notificationCount={notificationCount} />
                <PWAInstallPrompt />
              </MaintenanceProvider>
            </WalletProvider>
          </Web3Provider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
