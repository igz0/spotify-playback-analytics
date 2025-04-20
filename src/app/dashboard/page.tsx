'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { hasTrackHistory } from '@/utils/indexedDB';
import { getClientDictionary } from '@/utils/i18n-client';
import type { Dictionary } from '@/types/dictionary';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dict, setDict] = useState<Dictionary | null>(null);

  // 辞書データを読み込む
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

  if (!dict) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
          <p className="mt-4 text-lg">{dict.common.loading}</p>
        </div>
      </div>
    );
  }

  return <Dashboard dict={dict} />;
}
