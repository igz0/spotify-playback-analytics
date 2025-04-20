
# Spotify再生履歴分析

Spotifyの再生履歴データを分析・可視化するWebアプリケーションです。

## 機能

- Spotifyの再生履歴データの読み込みと解析
- 総再生曲数、総再生時間、ユニークアーティスト数、ユニークトラック数などの概要統計
- トップアーティストとトップトラックのランキング
- 月別・時間帯別の再生時間グラフ
- 日付範囲によるフィルタリング

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク（App Router）
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [Recharts](https://recharts.org/) - Reactベースのグラフライブラリ
- [date-fns](https://date-fns.org/) - 日付操作ライブラリ
- [Biome](https://biomejs.dev/) - リンター・フォーマッター

## セットアップ方法

1. リポジトリをクローンする
   ```bash
   git clone <repository-url>
   cd spotify-history-analyzer
   ```

2. 依存関係をインストールする
   ```bash
   npm install
   ```

3. 開発サーバーを起動する
   ```bash
   npm run dev
   ```

4. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスする

## Spotifyの再生履歴データについて

このアプリケーションは、Spotifyからダウンロードした拡張再生履歴データを使用します。データは以下の形式のJSONファイルである必要があります：

```json
[
  {
    "ts": "2020-01-01T12:00:00Z",
    "platform": "Android",
    "ms_played": 180000,
    "master_metadata_track_name": "曲名",
    "master_metadata_album_artist_name": "アーティスト名",
    "master_metadata_album_album_name": "アルバム名",
    ...
  },
  ...
]
```

## 使い方

1. Spotifyから拡張再生履歴データをダウンロードする
   - [Spotify](https://spotify.com)にログインします
   - [お客様のデータの管理](https://www.spotify.com/jp/account/privacy/)ページを開き、「長期ストリーミング履歴」のチェックを選択し、それ以外のチェックを外します
   - 「データをリクエスト」ボタンをクリックします
   - 30日以内にデータが記載されたメールが届きます
   - メールの内容をもとに`my_spotify_data.zip`をダウンロードします
2. アプリケーションを起動する
   ```bash
   npm run dev
   ```

3. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスする

4. ダウンロードしたZIPファイル（my_spotify_data.zip）をアップロードする
   - ファイルはブラウザ上で処理され、サーバーにアップロードされません
   - 処理が完了すると、自動的にダッシュボードページにリダイレクトされます

5. ダッシュボードでデータを分析する
   - 日付範囲でフィルタリングできます
   - トップアーティストやトップトラックを確認できます
   - 月別・時間帯別の再生時間を確認できます
   - プラットフォーム別使用状況を確認できます

## ライセンス

MIT
