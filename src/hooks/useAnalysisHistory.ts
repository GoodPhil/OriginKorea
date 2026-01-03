'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AnalysisSnapshot {
  id: string;
  timestamp: number;
  date: string;
  score: number;
  level: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  buyRatio: number;
  signals: {
    priceChange: string;
    volume: string;
    buyRatio: string;
    liquidity: string;
  };
}

const STORAGE_KEY = 'originkorea_analysis_history_v1';
const MAX_HISTORY_ITEMS = 100; // Keep last 100 snapshots

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: AnalysisSnapshot[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save analysis history:', error);
    }
  }, []);

  // Add new snapshot
  const addSnapshot = useCallback((snapshot: Omit<AnalysisSnapshot, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const newSnapshot: AnalysisSnapshot = {
      ...snapshot,
      id: `snapshot_${now.getTime()}`,
      timestamp: now.getTime(),
      date: now.toISOString(),
    };

    setHistory(prev => {
      // Check if we already have a snapshot within the last 5 minutes
      const fiveMinutesAgo = now.getTime() - 5 * 60 * 1000;
      const recentSnapshot = prev.find(s => s.timestamp > fiveMinutesAgo);

      if (recentSnapshot) {
        // Update the recent snapshot instead of adding new one
        const updated = prev.map(s =>
          s.id === recentSnapshot.id ? { ...newSnapshot, id: s.id } : s
        );
        saveHistory(updated);
        return updated;
      }

      // Add new snapshot and keep only last MAX_HISTORY_ITEMS
      const newHistory = [newSnapshot, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(newHistory);
      return newHistory;
    });

    return newSnapshot;
  }, [saveHistory]);

  // Get snapshots for a specific time range
  const getSnapshotsInRange = useCallback((hours: number) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return history.filter(s => s.timestamp >= cutoff);
  }, [history]);

  // Get daily averages
  const getDailyAverages = useCallback(() => {
    const dailyMap = new Map<string, AnalysisSnapshot[]>();

    for (const snapshot of history) {
      const dateKey = new Date(snapshot.timestamp).toLocaleDateString('ko-KR');
      const existing = dailyMap.get(dateKey) || [];
      dailyMap.set(dateKey, [...existing, snapshot]);
    }

    return Array.from(dailyMap.entries()).map(([date, snapshots]) => {
      const avgScore = snapshots.reduce((sum, s) => sum + s.score, 0) / snapshots.length;
      const avgPrice = snapshots.reduce((sum, s) => sum + s.price, 0) / snapshots.length;
      const latestSnapshot = snapshots[0];

      return {
        date,
        avgScore: Math.round(avgScore),
        avgPrice,
        count: snapshots.length,
        level: latestSnapshot.level,
      };
    }).slice(0, 30); // Last 30 days
  }, [history]);

  // Get trend analysis
  const getTrendAnalysis = useCallback((): {
    scoreTrend: 'up' | 'down' | 'stable';
    scoreChange: number;
    priceTrend: 'up' | 'down' | 'stable';
    priceChange: number;
  } => {
    if (history.length < 2) {
      return {
        scoreTrend: 'stable',
        scoreChange: 0,
        priceTrend: 'stable',
        priceChange: 0,
      };
    }

    const recent = history.slice(0, 10);
    const older = history.slice(10, 20);

    if (older.length === 0) {
      return {
        scoreTrend: 'stable',
        scoreChange: 0,
        priceTrend: 'stable',
        priceChange: 0,
      };
    }

    const recentAvgScore = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAvgScore = older.reduce((sum, s) => sum + s.score, 0) / older.length;
    const scoreChange = recentAvgScore - olderAvgScore;

    const recentAvgPrice = recent.reduce((sum, s) => sum + s.price, 0) / recent.length;
    const olderAvgPrice = older.reduce((sum, s) => sum + s.price, 0) / older.length;
    const priceChange = olderAvgPrice > 0 ? ((recentAvgPrice - olderAvgPrice) / olderAvgPrice) * 100 : 0;

    const scoreTrend: 'up' | 'down' | 'stable' = scoreChange > 5 ? 'up' : scoreChange < -5 ? 'down' : 'stable';
    const priceTrend: 'up' | 'down' | 'stable' = priceChange > 2 ? 'up' : priceChange < -2 ? 'down' : 'stable';

    return {
      scoreTrend,
      scoreChange: Math.round(scoreChange),
      priceTrend,
      priceChange: Math.round(priceChange * 100) / 100,
    };
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    if (history.length === 0) {
      return {
        totalSnapshots: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        avgPrice: 0,
        maxPrice: 0,
        minPrice: 0,
        mostCommonLevel: 'neutral' as const,
      };
    }

    const scores = history.map(s => s.score);
    const prices = history.map(s => s.price);

    const levelCounts = history.reduce((acc, s) => {
      acc[s.level] = (acc[s.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonLevel = Object.entries(levelCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    return {
      totalSnapshots: history.length,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
      mostCommonLevel: mostCommonLevel as AnalysisSnapshot['level'],
    };
  }, [history]);

  return {
    history,
    loading,
    addSnapshot,
    getSnapshotsInRange,
    getDailyAverages,
    getTrendAnalysis,
    getStatistics,
    clearHistory,
  };
}
