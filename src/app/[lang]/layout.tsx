import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getDictionary, locales } from "@/utils/i18n";
import { siteUrl } from "@/utils/site";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;

	const dict = await getDictionary(lang);

	return {
		title: dict.metadata.title,
		description: dict.metadata.description,
		metadataBase: new URL(siteUrl),
	};
}

// 静的生成時にサポートする言語を指定
export const dynamicParams = false;

export async function generateStaticParams() {
	return locales.map((lang) => ({ lang }));
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
