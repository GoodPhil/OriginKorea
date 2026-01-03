'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MaintenanceScreen } from './MaintenanceScreen';

interface MaintenanceSettings {
  maintenance_mode: boolean;
  maintenance_message_ko: string;
  maintenance_message_en: string;
  maintenance_end_time: string | null;
  updated_by?: string;
}

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  settings: MaintenanceSettings | null;
  refreshSettings: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceMode: false,
  settings: null,
  refreshSettings: async () => {},
});

export function useMaintenanceMode() {
  return useContext(MaintenanceContext);
}

interface MaintenanceProviderProps {
  children: ReactNode;
}

export function MaintenanceProvider({ children }: MaintenanceProviderProps) {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const fetchSettings = async () => {
    try {
      // Add timeout to prevent hanging - increased to 5 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/settings', {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Non-OK response - assume no maintenance
        setSettings({
          maintenance_mode: false,
          maintenance_message_ko: '',
          maintenance_message_en: '',
          maintenance_end_time: null,
        });
      }
    } catch (error) {
      // On error, assume no maintenance mode - don't block the site
      console.log('Maintenance check:', error instanceof Error ? error.message : 'failed');
      setSettings({
        maintenance_mode: false,
        maintenance_message_ko: '',
        maintenance_message_en: '',
        maintenance_end_time: null,
      });
    } finally {
      setIsChecked(true);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Refresh settings every 30 seconds
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Don't block initial render - show children immediately
  // Only show maintenance screen after we've checked and confirmed maintenance mode
  const showMaintenanceScreen = isChecked &&
    settings?.maintenance_mode === true &&
    !authLoading &&
    !isAdmin;

  if (showMaintenanceScreen) {
    return <MaintenanceScreen settings={settings} />;
  }

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenanceMode: settings?.maintenance_mode ?? false,
        settings,
        refreshSettings
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}
