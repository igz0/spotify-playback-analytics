import { format, parseISO, formatDuration as formatDurationDateFns } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import type {
  SpotifyHistoryEntry,
  AggregatedData,
  ArtistCount,
  TrackCount,
  TimeSeriesData,
  PlatformUsage,
} from '@/types/spotify';

/**
 * 再生履歴データを集計する関数
 * @param trackHistory Spotifyの再生履歴データ
 * @param limit 上位アーティストやトラックの表示数
 * @returns 集計されたデータ
 */
export function aggregateData(
  trackHistory: SpotifyHistoryEntry[],
  limit = 10
): AggregatedData {
  // 総トラック数
  const totalTracks = trackHistory.length;

  // 総再生時間
  const totalListeningTimeMs = trackHistory.reduce(
    (sum, playedTrack) => sum + playedTrack.ms_played, 
    0
  );

  // アーティスト別の集計
  const artistMap = new Map<string, { count: number; totalMs: number }>();
  for (const playedTrack of trackHistory) {
    if (playedTrack.master_metadata_album_artist_name) {
      const artist = playedTrack.master_metadata_album_artist_name;
      const artistStats = artistMap.get(artist) || { count: 0, totalMs: 0 };
      artistMap.set(artist, {
        count: artistStats.count + 1,
        totalMs: artistStats.totalMs + playedTrack.ms_played,
      });
    }
  }

  // ユニークなアーティスト数
  const uniqueArtists = artistMap.size;

  // 上位アーティスト
  const topArtists: ArtistCount[] = Array.from(artistMap.entries())
    .map(([name, { count, totalMs }]) => ({ name, count, totalMs }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // トラック別の集計
  const trackMap = new Map<
    string,
    { name: string; artist: string; count: number; totalMs: number }
  >();
  for (const playedTrack of trackHistory) {
    if (
      playedTrack.master_metadata_track_name &&
      playedTrack.master_metadata_album_artist_name
    ) {
      const trackId = `${playedTrack.master_metadata_track_name}-${playedTrack.master_metadata_album_artist_name}`;
      const trackStats = trackMap.get(trackId) || {
        name: playedTrack.master_metadata_track_name,
        artist: playedTrack.master_metadata_album_artist_name,
        count: 0,
        totalMs: 0,
      };
      trackMap.set(trackId, {
        ...trackStats,
        count: trackStats.count + 1,
        totalMs: trackStats.totalMs + playedTrack.ms_played,
      });
    }
  }

  // ユニークなトラック数
  const uniqueTracks = trackMap.size;

  // 上位トラック
  const topTracks: TrackCount[] = Array.from(trackMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // 月別の集計
  const monthMap = new Map<string, { count: number; totalMs: number }>();
  for (const playedTrack of trackHistory) {
    const date = parseISO(playedTrack.ts);
    const monthKey = format(date, 'yyyy-MM');
    const monthStats = monthMap.get(monthKey) || { count: 0, totalMs: 0 };
    monthMap.set(monthKey, {
      count: monthStats.count + 1,
      totalMs: monthStats.totalMs + playedTrack.ms_played,
    });
  }

  // 月別データをソート
  const listeningByMonth: TimeSeriesData[] = Array.from(monthMap.entries())
    .map(([date, { count, totalMs }]) => ({ date, count, totalMs }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 日別の集計
  const dayMap = new Map<string, { count: number; totalMs: number }>();
  for (const playedTrack of trackHistory) {
    const date = parseISO(playedTrack.ts);
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayStats = dayMap.get(dayKey) || { count: 0, totalMs: 0 };
    dayMap.set(dayKey, {
      count: dayStats.count + 1,
      totalMs: dayStats.totalMs + playedTrack.ms_played,
    });
  }

  // 日別データをソート
  const listeningByDay: TimeSeriesData[] = Array.from(dayMap.entries())
    .map(([date, { count, totalMs }]) => ({ date, count, totalMs }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 時間別の集計（ユーザーのローカルタイムゾーンを考慮）
  const hourMap = new Map<string, { count: number; totalMs: number }>();
  for (const playedTrack of trackHistory) {
    // parseISOはUTCとして解析するが、formatはブラウザのローカルタイムゾーンを使用する
    const date = parseISO(playedTrack.ts);
    // ブラウザのローカルタイムゾーンでの時間を取得
    const hourKey = format(date, 'HH');
    const hourStats = hourMap.get(hourKey) || { count: 0, totalMs: 0 };
    hourMap.set(hourKey, {
      count: hourStats.count + 1,
      totalMs: hourStats.totalMs + playedTrack.ms_played,
    });
  }

  // 時間別データをソート
  const listeningByHour: TimeSeriesData[] = Array.from(hourMap.entries())
    .map(([date, { count, totalMs }]) => ({ date, count, totalMs }))
    .sort((a, b) => Number.parseInt(a.date, 10) - Number.parseInt(b.date, 10));

  // プラットフォーム別の集計（プラットフォーム名を簡略化）
  const platformMap = new Map<string, { count: number; totalMs: number }>();
  for (const playedTrack of trackHistory) {
    // platformプロパティがundefinedの場合もあるため、必ずstring型に変換する
    let platform = 'Unknown';
    
    if (playedTrack.platform) {
      platform = playedTrack.platform;
      
      // プラットフォーム名を簡略化
      if (platform.startsWith('iOS')) {
        platform = platform.split(' ')[0]; // "iOS" のみを取得
      } else if (platform.startsWith('OS X')) {
        platform = 'macOS';
      } else if (platform.includes('Android')) {
        platform = 'Android';
      } else if (platform.includes('Windows')) {
        platform = 'Windows';
      } else if (platform.includes('web_player')) {
        platform = 'Web Player';
      } else if (platform.includes('Partner')) {
        platform = 'Partner Device';
      }
    }
    
    const platformStats = platformMap.get(platform) || { count: 0, totalMs: 0 };
    platformMap.set(platform, {
      count: platformStats.count + 1,
      totalMs: platformStats.totalMs + playedTrack.ms_played,
    });
  }

  // プラットフォーム別データをソート
  const platformUsage: PlatformUsage[] = Array.from(platformMap.entries())
    .map(([platform, { count, totalMs }]) => ({ platform, count, totalMs }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTracks,
    totalListeningTimeMs,
    uniqueArtists,
    uniqueTracks,
    topArtists,
    topTracks,
    listeningByMonth,
    listeningByDay,
    listeningByHour,
    platformUsage,
  };
}

/**
 * ミリ秒を人間が読みやすい形式に変換する関数
 * @param ms ミリ秒
 * @param isJapanese 日本語表示するかどうか（デフォルトはfalse）
 * @returns 人間が読みやすい形式の時間（例: "2時間30分" または "2 days 3 hours"）
 */
export function formatDuration(ms: number, isJapanese = false): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return formatDurationDateFns(
    {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60
    },
    {
      format: ['days', 'hours'],
      locale: isJapanese ? ja : enUS,
      zero: false,
      delimiter: ' '
    }
  );
}

/**
 * 日付範囲でデータをフィルタリングする関数
 * @param trackHistory Spotifyの再生履歴データ
 * @param startDate 開始日（ISO 8601形式）
 * @param endDate 終了日（ISO 8601形式）
 * @returns フィルタリングされたデータ
 */
export function filterByDateRange(
  trackHistory: SpotifyHistoryEntry[],
  startDate?: string,
  endDate?: string
): SpotifyHistoryEntry[] {
  let filteredTracks = [...trackHistory];

  if (startDate) {
    const startTimestamp = new Date(startDate).getTime();
    filteredTracks = filteredTracks.filter(
      (playedTrack) => new Date(playedTrack.ts).getTime() >= startTimestamp
    );
  }

  if (endDate) {
    const endTimestamp = new Date(endDate).getTime();
    filteredTracks = filteredTracks.filter(
      (playedTrack) => new Date(playedTrack.ts).getTime() <= endTimestamp
    );
  }

  return filteredTracks;
}
