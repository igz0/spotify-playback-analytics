/**
 * IndexedDBを使用してSpotifyの再生履歴データを保存・取得するためのユーティリティ関数
 */

import type { SpotifyHistoryEntry } from '@/types/spotify';

const DB_NAME = 'spotify-history-analyzer';
const STORE_NAME = 'track-history';
const DB_VERSION = 1;

/**
 * IndexedDBを開く
 * @returns IndexedDBのデータベース接続
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDBを開くのに失敗しました:', event);
      reject(new Error('データベースを開くのに失敗しました'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // オブジェクトストアが存在しない場合は作成
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Spotifyの再生履歴データを保存する
 * @param tracks 保存するトラックデータ
 */
export async function saveTrackHistory(tracks: SpotifyHistoryEntry[]): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // 既存のデータを削除
    store.clear();

    // チャンクに分割して保存（一度に大量のデータを保存するとブラウザがフリーズする可能性があるため）
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < tracks.length; i += CHUNK_SIZE) {
      const chunk = tracks.slice(i, i + CHUNK_SIZE);
      
      // 各チャンクをひとつのオブジェクトとして保存
      store.add({
        id: `chunk_${Math.floor(i / CHUNK_SIZE)}`,
        tracks: chunk,
        timestamp: new Date().toISOString()
      });
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`${tracks.length}件のトラックデータを保存しました`);
        db.close();
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('トラックデータの保存に失敗しました:', event);
        db.close();
        reject(new Error('データの保存に失敗しました'));
      };
    });
  } catch (error) {
    console.error('IndexedDBへの保存中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * Spotifyの再生履歴データを取得する
 * @returns 保存されているトラックデータ
 */
export async function getTrackHistory(): Promise<SpotifyHistoryEntry[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const chunks = request.result;
        let allTracks: SpotifyHistoryEntry[] = [];
        
        // 全てのチャンクからトラックデータを結合
        for (const chunk of chunks) {
          allTracks = [...allTracks, ...chunk.tracks];
        }
        
        console.log(`${allTracks.length}件のトラックデータを読み込みました`);
        db.close();
        resolve(allTracks);
      };

      request.onerror = (event) => {
        console.error('トラックデータの取得に失敗しました:', event);
        db.close();
        reject(new Error('データの取得に失敗しました'));
      };
    });
  } catch (error) {
    console.error('IndexedDBからの読み込み中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * IndexedDBにデータが存在するかどうかを確認する
 * @returns データが存在する場合はtrue、存在しない場合はfalse
 */
export async function hasTrackHistory(): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    return new Promise((resolve, reject) => {
      countRequest.onsuccess = () => {
        const count = countRequest.result;
        db.close();
        resolve(count > 0);
      };

      countRequest.onerror = (event) => {
        console.error('データ数の取得に失敗しました:', event);
        db.close();
        reject(new Error('データ数の取得に失敗しました'));
      };
    });
  } catch (error) {
    console.error('IndexedDBの確認中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * IndexedDBのデータを全て削除する
 * @returns 削除が成功した場合はtrue、失敗した場合はfalse
 */
export async function clearTrackHistory(): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // 全てのデータを削除
    const clearRequest = store.clear();

    return new Promise((resolve, reject) => {
      clearRequest.onsuccess = () => {
        console.log('全てのトラックデータを削除しました');
        db.close();
        resolve(true);
      };

      clearRequest.onerror = (event) => {
        console.error('トラックデータの削除に失敗しました:', event);
        db.close();
        reject(new Error('データの削除に失敗しました'));
      };
    });
  } catch (error) {
    console.error('IndexedDBの削除中にエラーが発生しました:', error);
    return false;
  }
}
