'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Locale } from './i18n';
import { defaultLocale, isValidLocale } from './i18n';

// 現在のロケールを取得する関数（クライアントサイドでのみ使用）
export const getLocale = (): Locale => {
  // ブラウザ環境でのみ実行
  if (typeof window !== 'undefined') {
    // URLからロケールを取得
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const firstSegment = segments[0];
      if (isValidLocale(firstSegment)) {
        return firstSegment;
      }
    }
    
    // クッキーからロケールを取得
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => cookie.trim().startsWith('NEXT_LOCALE='));
    if (localeCookie) {
      const locale = localeCookie.split('=')[1] as Locale;
      if (isValidLocale(locale)) {
        return locale;
      }
    }
    
    // ブラウザの言語設定を取得
    const browserLocale = navigator.language.split('-')[0] as Locale;
    if (isValidLocale(browserLocale)) {
      return browserLocale;
    }
  }
  
  return defaultLocale;
};

// クライアントサイドで辞書を取得する関数
export const getClientDictionary = async (locale?: Locale) => {
  const currentLocale = locale || getLocale();
  // 動的インポートを使用して辞書を取得
  const dictionary = await import(`@/locales/${currentLocale}.json`);
  return dictionary.default;
};

// useTranslationフック
export function useTranslation() {
  const params = useParams();
  const lang = params?.lang as string || defaultLocale;
  const [dictionary, setDictionary] = useState<any>(null);
  
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getClientDictionary(isValidLocale(lang) ? lang : defaultLocale);
      setDictionary(dict);
    };
    
    loadDictionary();
  }, [lang]);
  
  return {
    t: (key: string) => {
      if (!dictionary) return key;
      
      // ドット記法でネストされたキーにアクセス
      const keys = key.split('.');
      let value = dictionary;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }
      
      return typeof value === 'string' ? value : key;
    },
    dictionary,
    lang
  };
}
