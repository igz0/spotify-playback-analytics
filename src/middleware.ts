import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { locales, defaultLocale, isValidLocale } from '@/utils/i18n';

// ユーザーの優先ロケールを取得する関数
function getLocale(request: NextRequest): string {
  // Negotiatorはヘッダーオブジェクトを期待するので、NextRequestのheadersからオブジェクトを作成
  const headers = {
    'accept-language': request.headers.get('accept-language') || '',
  };
  
  // Negotiatorを使用して優先言語を取得
  const languages = new Negotiator({ headers }).languages();
  
  // @formatjs/intl-localematcherを使用して最適なロケールを選択
  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // パスの最初のセグメントを取得（例: /en/dashboard -> en）
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathnameSegments[0];
  
  // パスにロケールが含まれているかチェック
  const pathnameHasLocale = firstSegment && isValidLocale(firstSegment);
  
  // ロケールが既にパスに含まれている場合は何もしない
  if (pathnameHasLocale) return;
  
  // _nextや静的ファイルへのリクエストはスキップ
  if (pathname.startsWith('/_next') || pathname.includes('/api/')) {
    return;
  }
  
  // 静的ファイル（画像、フォント、アイコンなど）へのリクエストはスキップ
  if (/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/.test(pathname)) {
    return;
  }
  
  // ユーザーの優先ロケールを取得
  const locale = getLocale(request);
  
  // ロケールをクッキーに保存
  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', locale);
  
  return response;
}

export const config = {
  matcher: [
    // すべてのパスにマッチするが、_nextや静的ファイルは除外
    '/((?!_next|.*\\..*).*)',
  ],
};
