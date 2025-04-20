// サーバーとクライアントの両方で使用できる共通の型と関数

export type Locale = 'ja' | 'en';

export const defaultLocale: Locale = 'ja';
export const locales: Locale[] = ['ja', 'en'];

// 辞書ファイルを読み込む関数
const dictionaries = {
  ja: () => import('@/locales/ja.json').then((module) => module.default),
  en: () => import('@/locales/en.json').then((module) => module.default),
};

// ロケールが有効かどうかをチェックする関数
export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

// 辞書を取得する関数
export const getDictionary = async (locale: Locale = defaultLocale) => {
  return dictionaries[locale]();
};
