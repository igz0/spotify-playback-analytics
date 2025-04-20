'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import type { SpotifyHistoryEntry } from '@/types/spotify';
import type { Dictionary } from '@/types/dictionary';
import { saveTrackHistory } from '@/utils/indexedDB';

export default function FileUpload({ dict }: { dict: Dictionary }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const processZipFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(10);

      // ZIPファイルを読み込む
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      setProgress(30);

      // Spotifyの再生履歴JSONファイルを探す
      const historyFiles: { filename: string; content: unknown[] }[] = [];
      let filesProcessed = 0;
      const totalFiles = Object.keys(zipContent.files).length;
      
      console.log('ZIPファイル内のファイル一覧:', Object.keys(zipContent.files));

      // 処理対象のファイルを抽出
      const jsonFiles = Object.entries(zipContent.files).filter(([filename, zipEntry]) => {
        console.log(`ファイル ${filename} の検証:`, 
          `zipEntry存在: ${Boolean(zipEntry)}`, 
          `ディレクトリではない: ${zipEntry && !zipEntry.dir}`, 
          `JSONファイル: ${filename.endsWith('.json')}`, 
          `StreamingHistoryを含む: ${filename.includes('StreamingHistory')}`
        );
        
        return zipEntry && 
               !zipEntry.dir && 
               filename.endsWith('.json') && 
               (filename.includes('Streaming_History') || filename.includes('StreamingHistory'));
      });
      
      console.log(`処理対象のJSONファイル数: ${jsonFiles.length}`);
      
      for (const [filename, zipEntry] of jsonFiles) {
        try {
          console.log(`処理中のファイル: ${filename}`);
          const content = await zipEntry.async('string');
          
          // JSONデータの検証
          try {
            const jsonData = JSON.parse(content) as unknown[];
            
            // 配列であることを確認
            if (Array.isArray(jsonData)) {
              historyFiles.push({ filename, content: jsonData });
              console.log(`ファイル ${filename} を正常に処理しました。エントリ数: ${jsonData.length}`);
            } else {
              console.warn(`ファイル ${filename} は配列ではありません。スキップします。`);
            }
          } catch (jsonError) {
            console.error(`ファイル ${filename} のJSON解析に失敗しました:`, jsonError);
          }
        } catch (err) {
          console.error(`ファイル ${filename} の読み込みに失敗しました:`, err);
        }
        
        filesProcessed++;
        setProgress(30 + Math.floor((filesProcessed / totalFiles) * 40));
      }

      if (historyFiles.length === 0) {
        throw new Error('ZIPファイル内にSpotifyの再生履歴データが見つかりませんでした。');
      }

      setProgress(70);

      // すべての再生履歴データを結合
      let allTracks: SpotifyHistoryEntry[] = [];
      for (const { content } of historyFiles) {
        if (Array.isArray(content)) {
          allTracks = [...allTracks, ...(content as SpotifyHistoryEntry[])];
        }
      }

      if (allTracks.length === 0) {
        throw new Error('有効な再生履歴データが見つかりませんでした。');
      }

      setProgress(80);

      // データをIndexedDBに保存
      setProgress(90);
      console.log(`IndexedDBに${allTracks.length}件のトラックデータを保存します...`);
      await saveTrackHistory(allTracks);

      // 処理完了後、ダッシュボードページにリダイレクト
      setProgress(100);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error processing ZIP file:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      setIsProcessing(false);
    }
  }, [router]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        processZipFile(file);
      } else {
        setError('ZIPファイルをアップロードしてください。');
      }
    }
  }, [processZipFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        processZipFile(file);
      } else {
        setError('ZIPファイルをアップロードしてください。');
      }
    }
  }, [processZipFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      document.getElementById('file-upload')?.click();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            {dict.fileUpload.title}
          </h1>

          <p className="text-gray-600 mb-4">
            {dict.fileUpload.description.split('\n').map((line, index) => (
              <span key={`desc-${index}`}>
                {line}
                {index < dict.fileUpload.description.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {dict.fileUpload.step1.title}
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>
                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  Spotify
                </a>
                {' - '}{dict.fileUpload.step1.login}
              </li>
              <li>
                <a
                  href="https://www.spotify.com/jp/account/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {dict.fileUpload.step1.openPrivacy.includes('お客様のデータの管理') 
                    ? 'お客様のデータの管理' 
                    : 'Manage Your Data'}
                </a>
                {dict.fileUpload.step1.openPrivacy.includes('ページを開き') 
                  ? dict.fileUpload.step1.openPrivacy.split('ページを開き')[1] 
                  : dict.fileUpload.step1.openPrivacy.replace('Open the \'Manage Your Data\' page', '')}
              </li>
              <li>
                <strong>{dict.fileUpload.step1.requestData}</strong>
              </li>
              <li>
                {dict.fileUpload.step1.receiveEmail}
              </li>
              <li>
                {dict.fileUpload.step1.downloadZip}
              </li>
            </ol>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {dict.fileUpload.step2.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {dict.fileUpload.step2.privacy}
            </p>

            <button
              type="button"
              className={`w-full border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              } transition-colors duration-200 ease-in-out cursor-pointer`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              aria-label="ファイルをアップロード"
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
                  </div>
                  <p className="text-gray-600">
                    {dict.fileUpload.step2.processing} {progress}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg text-gray-600">
                      {dict.fileUpload.step2.uploadButton}
                    </p>
                  </div>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error === 'ZIPファイルをアップロードしてください。' 
                  ? dict.fileUpload.step2.zipError 
                  : error}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 mt-8">
            <p>
              {dict.fileUpload.footer.description.split('\n').map((line, index) => (
                <span key={`footer-${index}`}>
                  {line}
                  {index < dict.fileUpload.footer.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
