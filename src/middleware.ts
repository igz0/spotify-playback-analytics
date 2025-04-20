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
  
  // ユーザーの優先ロケールを取得
  const locale = getLocale(request);
  
  // 新しいURLを作成し、パスの先頭にロケールを追加
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  // リダイレクト
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    /*
     * 以下で始まるパス以外のすべてのリクエストパスにマッチ:
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico, sitemap.xml, robots.txt (メタデータファイル)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
