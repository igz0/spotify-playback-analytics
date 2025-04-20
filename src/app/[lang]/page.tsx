import { getDictionary } from '@/utils/i18n';
import Link from 'next/link';
import FileUploader from './_components/FileUploader';

type PageProps = {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ params }: PageProps) {
  // 言語パラメータから辞書を取得
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  const dict = await getDictionary(lang);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            {dict.fileUpload.title}
          </h1>

          <p className="text-gray-600 mb-4">
            {/* biome-ignore lint/suspicious/noArrayIndexKey: テキスト行には一意のIDがないため、インデックスを使用 */}
            {dict.fileUpload.description.split('\n').map((line, index) => (
              <span key={`desc-${index}`}>
                {line}
                {index < dict.fileUpload.description.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {dict.fileUpload.step1.title}
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>
                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  Spotify
                </a>
                {' - '}{dict.fileUpload.step1.login}
              </li>
              <li>
                <a
                  href="https://www.spotify.com/jp/account/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {dict.fileUpload.step1.openPrivacy.includes('お客様のデータの管理') 
                    ? 'お客様のデータの管理' 
                    : 'Manage Your Data'}
                </a>
                {dict.fileUpload.step1.openPrivacy.includes('ページを開き') 
                  ? dict.fileUpload.step1.openPrivacy.split('ページを開き')[1] 
                  : dict.fileUpload.step1.openPrivacy.replace('Open the \'Manage Your Data\' page', '')}
              </li>
              <li>
                <strong>{dict.fileUpload.step1.requestData}</strong>
              </li>
              <li>
                {dict.fileUpload.step1.receiveEmail}
              </li>
              <li>
                {dict.fileUpload.step1.downloadZip}
              </li>
            </ol>
          </div>

          {/* ファイルアップローダーコンポーネント（クライアントコンポーネント） */}
          <FileUploader dict={dict} lang={lang} />

          <div className="text-sm text-gray-500 mt-8">
            <p>
              {/* biome-ignore lint/suspicious/noArrayIndexKey: テキスト行には一意のIDがないため、インデックスを使用 */}
              {dict.fileUpload.footer.description.split('\n').map((line, index) => (
                <span key={`footer-${index}`}>
                  {line}
                  {index < dict.fileUpload.footer.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
            <p className="mt-4 text-center">
              <a
                href="https://github.com/igz0/spotify-playback-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
