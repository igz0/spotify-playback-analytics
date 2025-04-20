// Spotifyの再生履歴エントリの型定義
export interface SpotifyHistoryEntry {
  ts: string; // タイムスタンプ（UTC、トラックの再生が停止した時間）
  username?: string; // Spotifyのユーザー名
  platform: string; // 再生に使用されたプラットフォーム（AndroidやGoogle Chromecastなど）
  ms_played: number; // 再生時間（ミリ秒）
  conn_country: string; // 再生された国のコード（例：SE - スウェーデン）
  ip_addr_decrypted?: string; // 再生時に記録されたIPアドレス
  user_agent_decrypted?: string; // 再生時に使用されたユーザーエージェント
  ip_addr?: string; // 旧フォーマットとの互換性のためのフィールド
  master_metadata_track_name: string | null; // トラック名
  master_metadata_album_artist_name: string | null; // アーティスト名、バンド名、またはポッドキャスト名
  master_metadata_album_album_name: string | null; // トラックのアルバム名
  spotify_track_uri: string | null; // トラックを一意に識別するSpotify URI
  episode_name: string | null; // ポッドキャストのエピソード名
  episode_show_name: string | null; // ポッドキャストの番組名
  spotify_episode_uri: string | null; // ポッドキャストのエピソードを一意に識別するSpotify URI
  reason_start: string; // トラックが開始した理由（例：「trackdone」）
  reason_end: string; // トラックが終了した理由（例：「endplay」）
  shuffle: boolean | null; // シャッフルモードが使用されたかどうか
  skipped: boolean | null; // ユーザーが次の曲にスキップしたかどうか
  offline: boolean | null; // オフラインモードで再生されたかどうか
  offline_timestamp: string | null; // オフラインモードが使用された場合のタイムスタンプ
  incognito_mode: boolean | null; // プライベートセッションで再生されたかどうか
}

// 集計データの型定義
export interface AggregatedData {
  totalTracks: number; // 総トラック数
  totalListeningTimeMs: number; // 総再生時間（ミリ秒）
  uniqueArtists: number; // ユニークなアーティスト数
  uniqueTracks: number; // ユニークなトラック数
  topArtists: ArtistCount[]; // 上位アーティスト
  topTracks: TrackCount[]; // 上位トラック
  listeningByMonth: TimeSeriesData[]; // 月別再生時間
  listeningByDay: TimeSeriesData[]; // 日別再生時間
  listeningByHour: TimeSeriesData[]; // 時間別再生時間
  platformUsage: PlatformUsage[]; // プラットフォーム別使用状況
}

// アーティストのカウント
export interface ArtistCount {
  name: string; // アーティスト名
  count: number; // 再生回数
  totalMs: number; // 総再生時間（ミリ秒）
}

// トラックのカウント
export interface TrackCount {
  name: string; // トラック名
  artist: string; // アーティスト名
  count: number; // 再生回数
  totalMs: number; // 総再生時間（ミリ秒）
}

// 時系列データ
export interface TimeSeriesData {
  date: string; // 日付または時間
  count: number; // 再生回数
  totalMs: number; // 総再生時間（ミリ秒）
}

// プラットフォーム別使用状況
export interface PlatformUsage {
  platform: string; // プラットフォーム名
  count: number; // 再生回数
  totalMs: number; // 総再生時間（ミリ秒）
}
