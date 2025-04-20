'use client';

import { useState, useEffect } from 'react';
import type { SpotifyHistoryEntry, AggregatedData } from '@/types/spotify';
import { aggregateData, filterByDateRange } from '@/utils/dataAnalysis';
import { getTrackHistory, hasTrackHistory } from '@/utils/indexedDB';

interface UseSpotifyHistoryResult {
  isLoading: boolean;
  error: string | null;
  trackHistory: SpotifyHistoryEntry[];
  aggregatedData: AggregatedData | null;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  setDateRange: (startDate: string | null, endDate: string | null) => void;
}

/**
 * Spotifyの再生履歴データを取得し、集計するためのカスタムフック
 * @param limit 上位アーティストやトラックの表示数
 * @returns 再生履歴データと集計データ
 */
export function useSpotifyHistory(limit = 10): UseSpotifyHistoryResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackHistory, setTrackHistory] = useState<SpotifyHistoryEntry[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [dateRange, setDateRangeState] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // 日付範囲を設定する関数
  const setDateRange = (startDate: string | null, endDate: string | null) => {
    setDateRangeState({ startDate, endDate });
  };

  // IndexedDBから再生履歴データを取得する
  useEffect(() => {
    const loadTrackHistory = async () => {
      try {
        setIsLoading(true);
        
        // IndexedDBにデータが存在するか確認
        const exists = await hasTrackHistory();
        
        if (!exists) {
          throw new Error('再生履歴データが見つかりません。データをアップロードしてください。');
        }
        
        // IndexedDBからデータを取得
        const tracks = await getTrackHistory();
        
        if (tracks.length === 0) {
          throw new Error('再生履歴データが空です。データをアップロードしてください。');
        }
        
        console.log(`${tracks.length}件のトラックデータを読み込みました`);
        setTrackHistory(tracks);
        setError(null);
      } catch (err) {
        console.error('再生履歴データの読み込み中にエラーが発生しました:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadTrackHistory();
  }, []);

  // 日付範囲でフィルタリングし、データを集計する
  useEffect(() => {
    if (trackHistory.length === 0) return;

    try {
      const filteredHistory = filterByDateRange(
        trackHistory,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      
      const aggregated = aggregateData(filteredHistory, limit);
      setAggregatedData(aggregated);
    } catch (err) {
      console.error('データの集計中にエラーが発生しました:', err);
      setError(err instanceof Error ? err.message : 'データの集計中に不明なエラーが発生しました');
    }
  }, [trackHistory, dateRange, limit]);

  return {
    isLoading,
    error,
    trackHistory,
    aggregatedData,
    dateRange,
    setDateRange,
  };
}
