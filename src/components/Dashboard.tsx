'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSpotifyHistory } from '@/hooks/useSpotifyHistory';
import { formatDuration } from '@/utils/dataAnalysis';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { clearTrackHistory } from '@/utils/indexedDB';
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


// 日付フォーマット関数
const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'yyyy年MM月dd日', { locale: ja });
  } catch (e) {
    return dateStr;
  }
};

// 時間フォーマット関数
const formatHour = (hour: string) => {
  return `${hour}時`;
};

export default function Dashboard() {
  const router = useRouter();
  const [topItemsLimit, setTopItemsLimit] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    isLoading,
    error,
    trackHistory,
    aggregatedData,
    dateRange,
    setDateRange,
  } = useSpotifyHistory(topItemsLimit);
  
  // データ削除ハンドラー
  const handleClearData = async () => {
    if (window.confirm('ブラウザに保存されたSpotifyの再生履歴データを削除しますか？この操作は元に戻せません。')) {
      try {
        setIsDeleting(true);
        const success = await clearTrackHistory();
        if (success) {
          alert('データが正常に削除されました。ホームページにリダイレクトします。');
          router.push('/');
        } else {
          alert('データの削除中にエラーが発生しました。');
          setIsDeleting(false);
        }
      } catch (error) {
        console.error('データ削除中にエラーが発生しました:', error);
        alert('データの削除中にエラーが発生しました。');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
          <p className="mt-4 text-lg">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!aggregatedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">データがありません</p>
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
    date: format(parseISO(item.date), 'yyyy年MM月', { locale: ja }),
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
        <h1 className="text-3xl font-bold mb-2 text-center">Spotify再生履歴分析</h1>
        <a 
          href="/" 
          className="text-green-600 hover:text-green-800 transition-colors duration-200"
        >
          トップページに戻る
        </a>
      </div>

      {/* フィルターセクション */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">フィルター</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label 
              htmlFor="start-date" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              開始日
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
              終了日
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
              ランキング表示数
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
            </select>
          </div>
        </div>
      </div>

      {/* 概要統計 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">概要統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">総再生曲数</p>
            <p className="text-2xl font-bold">{totalTracks.toLocaleString()}曲</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">総再生時間</p>
            <p className="text-2xl font-bold">{formatDuration(totalListeningTimeMs)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">ユニークアーティスト数</p>
            <p className="text-2xl font-bold">{uniqueArtists.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">ユニークトラック数</p>
            <p className="text-2xl font-bold">{uniqueTracks.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* トップアーティスト & トップトラック */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* トップアーティスト */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">トップアーティスト</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アーティスト
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    再生回数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    再生時間
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
                        {artist.count.toLocaleString()}回
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
          <h2 className="text-xl font-semibold mb-4">トップトラック</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順位
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    トラック
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アーティスト
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    再生回数
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
                        {track.count.toLocaleString()}回
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
        <h2 className="text-xl font-semibold mb-4">月別再生時間</h2>
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
                  value: '時間',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: number) => [`${value}時間`, '再生時間']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar
                dataKey="hours"
                name="再生時間（時間）"
                fill="#1DB954"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 時間帯別再生時間 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">時間帯別再生時間</h2>
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
                  value: '時間',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: number) => [`${value}時間`, '再生時間']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar
                dataKey="hours"
                name="再生時間（時間）"
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
          データ範囲: {trackHistory.length > 0
            ? (() => {
                // 日付でソートして最古と最新の日付を取得
                const sortedTracks = [...trackHistory].sort(
                  (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
                );
                return `${formatDate(sortedTracks[0].ts)} 〜 ${formatDate(
                  sortedTracks[sortedTracks.length - 1].ts
                )}`;
              })()
            : 'データなし'}
        </p>
        <p className="mt-2">
          総トラック数: {trackHistory.length.toLocaleString()}
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
              削除中...
            </>
          ) : (
            'あなたのブラウザ上に保存された情報を削除する'
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          この操作を行うと、あなたのブラウザに保存されたSpotifyの再生履歴データが完全に削除されます。
          <br />
          データを再度分析するには、ZIPファイルを再度アップロードする必要があります。
        </p>
      </div>
    </div>
  );
}
