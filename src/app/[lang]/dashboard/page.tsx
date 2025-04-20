import { getDictionary } from '@/utils/i18n';
import DashboardClient from './_components/DashboardClient';

type PageProps = {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ params }: PageProps) {
  // 言語パラメータから辞書を取得
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  const dict = await getDictionary(lang);
  
  return <DashboardClient dict={dict} lang={lang} />;
}
