'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpotifyHistory } from '@/hooks/useSpotifyHistory';
import { formatDuration } from '@/utils/dataAnalysis';
import { format, parseISO } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { clearTrackHistory, hasTrackHistory } from '@/utils/indexedDB';
import { getClientDictionary } from '@/utils/i18n-client';
import { getLocale } from '@/utils/i18n-client';
import type { Locale } from '@/utils/i18n';
import type { Dictionary } from '@/types/dictionary';
import jaDict from '@/locales/ja.json';
import enDict from '@/locales/en.json';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // ロケールに基づいて初期辞書を設定
  const currentLocale = getLocale();
  const initialDict = currentLocale === 'ja' ? jaDict : enDict;
  const isJapanese = currentLocale === 'ja';
  const dateLocale = isJapanese ? ja : enUS;
  
  const [dict, setDict] = useState<Dictionary>(initialDict);
  const [topItemsLimit, setTopItemsLimit] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  // バックグラウンドで辞書を読み込む（初期表示には影響しない）
  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getClientDictionary();
      setDict(dictionary);
    };
    loadDictionary();
  }, []);

  // IndexedDBにデータがない場合はTOPページにリダイレクト
  useEffect(() => {
    const checkData = async () => {
      try {
        const exists = await hasTrackHistory();
        if (!exists) {
          console.log('IndexedDBにデータが見つかりません。TOPページにリダイレクトします。');
          router.push('/');
        } else {
          console.log('IndexedDBにデータが見つかりました。');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('データの確認中にエラーが発生しました:', error);
        router.push('/');
      }
    };

    checkData();
  }, [router]);

  const {
    isLoading: isDataLoading,
    error,
    trackHistory,
    aggregatedData,
    dateRange,
    setDateRange,
  } = useSpotifyHistory(topItemsLimit);

  
  // 日付フォーマット関数
  const formatDate = (dateStr: string) => {
    try {
      return format(
        parseISO(dateStr), 
        isJapanese ? 'yyyy年MM月dd日' : 'MMM d, yyyy', 
        { locale: dateLocale }
      );
    } catch (e) {
      return dateStr;
    }
  };

  // 時間フォーマット関数
  const formatHour = (hour: string) => {
    return isJapanese ? `${hour}時` : `${hour}h`;
  };
  
  // データ削除ハンドラー
  const handleClearData = async () => {
    if (!dict) return;
    
    if (window.confirm(dict.dashboard.deleteData.confirm)) {
      try {
        setIsDeleting(true);
        const success = await clearTrackHistory();
        if (success) {
          alert(dict.dashboard.deleteData.success);
          router.push('/');
        } else {
          alert(dict.dashboard.deleteData.error);
          setIsDeleting(false);
        }
      } catch (error) {
        console.error('データ削除中にエラーが発生しました:', error);
        alert(dict.dashboard.deleteData.error);
        setIsDeleting(false);
      }
    }
  };

  // 日付範囲の変更ハンドラー
  const handleDateRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'start' | 'end'
  ) => {
    const value = e.target.value || null;
    if (type === 'start') {
      setDateRange(value, dateRange.endDate);
    } else {
      setDateRange(dateRange.startDate, value);
    }
  };

  // トップアイテム数の変更ハンドラー
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTopItemsLimit(Number(e.target.value));
  };


  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
          <p className="mt-4 text-lg">{dict.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">{dict.common.error}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!aggregatedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">{dict.common.noData}</p>
        </div>
      </div>
    );
  }

  const {
    totalTracks,
    totalListeningTimeMs,
    uniqueArtists,
    uniqueTracks,
    topArtists,
    topTracks,
    listeningByMonth,
    listeningByHour,
  } = aggregatedData;

  // 月別データの整形
  const formattedMonthlyData = listeningByMonth.map((item) => ({
    ...item,
    date: format(
      parseISO(item.date), 
      isJapanese ? 'yyyy年MM月' : 'MMM yyyy', 
      { locale: dateLocale }
    ),
    hours: Math.round(item.totalMs / 1000 / 60 / 60),
  }));

  // 時間別データの整形
  const formattedHourlyData = listeningByHour.map((item) => ({
    ...item,
    date: formatHour(item.date),
    hours: Math.round(item.totalMs / 1000 / 60 / 60),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center">{dict.dashboard.title}</h1>
        <a 
          href="/"
          className="text-green-600 hover:text-green-800 transition-colors duration-200"
        >
          {dict.common.backToTop}
        </a>
      </div>

      {/* フィルターセクション */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{dict.dashboard.filter.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label 
              htmlFor="start-date" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {dict.dashboard.filter.startDate}
            </label>
            <input
              id="start-date"
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={dateRange.startDate || ''}
              onChange={(e) => handleDateRangeChange(e, 'start')}
            />
          </div>
          <div>
            <label 
              htmlFor="end-date" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {dict.dashboard.filter.endDate}
            </label>
            <input
              id="end-date"
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={dateRange.endDate || ''}
              onChange={(e) => handleDateRangeChange(e, 'end')}
            />
          </div>
          <div>
            <label 
              htmlFor="limit-select" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {dict.dashboard.filter.limitSelect}
            </label>
            <select
              id="limit-select"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={topItemsLimit}
              onChange={handleLimitChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* 概要統計 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{dict.dashboard.summary.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">{dict.dashboard.summary.totalTracks}</p>
            <p className="text-2xl font-bold">{totalTracks.toLocaleString()}{isJapanese ? '曲' : ''}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">{dict.dashboard.summary.totalListeningTime}</p>
            <p className="text-2xl font-bold">{formatDuration(totalListeningTimeMs)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">{dict.dashboard.summary.uniqueArtists}</p>
            <p className="text-2xl font-bold">{uniqueArtists.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">{dict.dashboard.summary.uniqueTracks}</p>
            <p className="text-2xl font-bold">{uniqueTracks.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* トップアーティスト & トップトラック */}
      <div className="flex flex-col gap-8 mb-8">
        {/* トップアーティスト */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{dict.dashboard.topArtists.title}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topArtists.rank}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topArtists.artist}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topArtists.playCount}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topArtists.playTime}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topArtists.map((artist, index) => (
                  <tr key={`artist-${artist.name}`}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {artist.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {artist.count.toLocaleString()}{isJapanese ? '回' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDuration(artist.totalMs)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* トップトラック */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{dict.dashboard.topTracks.title}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topTracks.rank}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topTracks.track}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topTracks.artist}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dict.dashboard.topTracks.playCount}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topTracks.map((track, index) => (
                  <tr key={`track-${track.name}-${track.artist}`}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {track.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{track.artist}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {track.count.toLocaleString()}{isJapanese ? '回' : ''}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 月別再生時間 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{dict.dashboard.monthlyChart.title}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedMonthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
                interval={formattedMonthlyData.length > 24 ? 2 : 0} // データが多い場合は間引いて表示
              />
              <YAxis
                label={{
                  value: dict.dashboard.monthlyChart.hours,
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value}${isJapanese ? '時間' : ' hours'}`, 
                  dict.dashboard.monthlyChart.playTime
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar
                dataKey="hours"
                name={dict.dashboard.monthlyChart.playTime}
                fill="#1DB954"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 時間帯別再生時間 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{dict.dashboard.hourlyChart.title}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedHourlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                label={{
                  value: dict.dashboard.hourlyChart.hours,
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value}${isJapanese ? '時間' : ' hours'}`, 
                  dict.dashboard.hourlyChart.playTime
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar
                dataKey="hours"
                name={dict.dashboard.hourlyChart.playTime}
                fill="#1DB954"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* フッター */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>
          {dict.dashboard.footer.dataRange}: {trackHistory.length > 0
            ? (() => {
                // 日付でソートして最古と最新の日付を取得
                const sortedTracks = [...trackHistory].sort(
                  (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
                );
                return `${formatDate(sortedTracks[0].ts)} ${isJapanese ? '〜' : 'to'} ${formatDate(
                  sortedTracks[sortedTracks.length - 1].ts
                )}`;
              })()
            : dict.dashboard.footer.noData}
        </p>
        <p className="mt-2">
          {dict.dashboard.footer.totalTracks}: {trackHistory.length.toLocaleString()}
        </p>
      </div>
      
      {/* データ削除ボタン */}
      <div className="text-center mt-12 mb-8">
        <button
          type="button"
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={handleClearData}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              {dict.dashboard.deleteData.deleting}
            </>
          ) : (
            dict.dashboard.deleteData.button
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          {/* biome-ignore lint/suspicious/noArrayIndexKey: テキスト行には一意のIDがないため、インデックスを使用 */}
          {dict.dashboard.deleteData.description.split('\n').map((line, index) => (
            <span key={`delete-desc-${index}`}>
              {line}
              {index < dict.dashboard.deleteData.description.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
