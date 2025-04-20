import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { locales } from "@/utils/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spotify Playback Analytics",
  description: "An application to analyze and visualize your Spotify listening history",
};

// 静的生成時にサポートする言語を指定
export async function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Readonly<LayoutProps>) {
  // パラメータから言語を取得
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
