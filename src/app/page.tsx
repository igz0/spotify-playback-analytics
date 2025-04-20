'use client';

import { useEffect, useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { getClientDictionary } from '@/utils/i18n-client';
import type { Dictionary } from '@/types/dictionary';

export default function Home() {
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getClientDictionary();
      setDict(dictionary);
    };
    loadDictionary();
  }, []);

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

  return (
    <FileUpload dict={dict} />
  );
}
