'use client';

import type { Locale } from './i18n';
import { defaultLocale, isValidLocale } from './i18n';

// 現在のロケールを取得する関数（クライアントサイドでのみ使用）
export const getLocale = (): Locale => {
  // ブラウザ環境でのみ実行
  if (typeof window !== 'undefined') {
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
  const { getDictionary } = await import('./i18n');
  const currentLocale = locale || getLocale();
  return getDictionary(currentLocale);
};
