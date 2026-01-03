'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

interface PriceAlertSettings {
  enabled: boolean;
  threshold: number; // Percentage change to trigger alert
  lastAlertPrice: number | null;
  lastAlertTime: number | null;
}

interface PriceData {
  price: number;
  change24h: number;
}

const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes between alerts
const PRICE_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export function usePriceAlert() {
  const { sendPriceAlert, permission } = usePushNotifications();
  const [settings, setSettings] = useState<PriceAlertSettings>({
    enabled: false,
    threshold: 5, // 5% default
    lastAlertPrice: null,
    lastAlertTime: null,
  });
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{ price: number; time: number }>>([]);
  const previousPriceRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('priceAlertSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('priceAlertSettings', JSON.stringify(settings));
  }, [settings]);

  // Fetch current price
  const fetchPrice = useCallback(async (): Promise<PriceData | null> => {
    try {
      const response = await fetch('/api/dex');
      const data = await response.json();

      if (data.pair) {
        const price = parseFloat(data.pair.priceUsd);
        const change24h = data.pair.priceChange24h || 0;

        setCurrentPrice(price);
        setPriceHistory(prev => {
          const newHistory = [...prev, { price, time: Date.now() }];
          // Keep only last 100 entries
          return newHistory.slice(-100);
        });

        return { price, change24h };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch price:', error);
      return null;
    }
  }, []);

  // Check if we should send an alert
  const checkPriceAlert = useCallback(async () => {
    if (!settings.enabled || permission !== 'granted') return;

    const priceData = await fetchPrice();
    if (!priceData) return;

    const { price } = priceData;
    const previousPrice = previousPriceRef.current;

    if (previousPrice === null) {
      previousPriceRef.current = price;
      return;
    }

    // Calculate percentage change
    const changePercent = ((price - previousPrice) / previousPrice) * 100;
    const absChange = Math.abs(changePercent);

    // Check if change exceeds threshold
    if (absChange >= settings.threshold) {
      const now = Date.now();

      // Check cooldown
      if (settings.lastAlertTime && (now - settings.lastAlertTime) < ALERT_COOLDOWN) {
        return;
      }

      // Send alert
      const direction = changePercent > 0 ? 'up' : 'down';
      sendPriceAlert(price, changePercent, direction);

      // Update settings
      setSettings(prev => ({
        ...prev,
        lastAlertPrice: price,
        lastAlertTime: now,
      }));

      // Update previous price to current
      previousPriceRef.current = price;
    }
  }, [settings, permission, fetchPrice, sendPriceAlert]);

  // Start/stop price monitoring
  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      // Initial fetch
      fetchPrice().then(data => {
        if (data) {
          previousPriceRef.current = data.price;
        }
      });

      // Set up interval
      intervalRef.current = setInterval(checkPriceAlert, PRICE_CHECK_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings.enabled, permission, checkPriceAlert, fetchPrice]);

  const enableAlerts = useCallback((threshold?: number) => {
    setSettings(prev => ({
      ...prev,
      enabled: true,
      threshold: threshold ?? prev.threshold,
    }));
  }, []);

  const disableAlerts = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      enabled: false,
    }));
  }, []);

  const setThreshold = useCallback((threshold: number) => {
    setSettings(prev => ({
      ...prev,
      threshold: Math.max(0.1, Math.min(50, threshold)), // 0.1% to 50%
    }));
  }, []);

  const testAlert = useCallback(() => {
    if (currentPrice) {
      sendPriceAlert(currentPrice, settings.threshold, 'up');
    }
  }, [currentPrice, settings.threshold, sendPriceAlert]);

  return {
    settings,
    currentPrice,
    priceHistory,
    enableAlerts,
    disableAlerts,
    setThreshold,
    testAlert,
    fetchPrice,
  };
}
