'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  subscription: PushSubscription | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    subscription: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

    if (isSupported) {
      setState(prev => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
      }));

      // Check existing subscription
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
      }));
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!state.isSupported) return null;

    setLoading(true);
    try {
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const registration = await navigator.serviceWorker.ready;

      // For demo purposes, using a placeholder VAPID key
      // In production, generate your own VAPID keys
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
      }));

      // Save subscription to localStorage (in production, send to server)
      localStorage.setItem('pushSubscription', JSON.stringify(subscription.toJSON()));

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.subscription) return false;

    setLoading(true);
    try {
      await state.subscription.unsubscribe();

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }));

      localStorage.removeItem('pushSubscription');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = useCallback(() => {
    if (Notification.permission === 'granted') {
      new Notification('Origin Korea 테스트', {
        body: '푸시 알림이 정상적으로 작동합니다!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-notification',
      });
    }
  }, []);

  const sendPriceAlert = useCallback((price: number, changePercent: number, direction: 'up' | 'down') => {
    if (Notification.permission === 'granted') {
      const emoji = direction === 'up' ? '📈' : '📉';
      const sign = direction === 'up' ? '+' : '';

      new Notification(`${emoji} LGNS 가격 알림`, {
        body: `LGNS 가격이 ${sign}${changePercent.toFixed(2)}% 변동했습니다.\n현재 가격: $${price.toFixed(4)}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'price-alert',
        requireInteraction: true,
      });
    }
  }, []);

  return {
    ...state,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    sendPriceAlert,
    checkSubscription,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
