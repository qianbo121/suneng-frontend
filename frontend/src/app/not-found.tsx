import { NotFoundState } from '@/components/common/NotFoundState';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { BaiduAnalytics } from '@/components/seo/BaiduAnalytics';

export default function RootNotFoundPage() {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen text-neutral-900">
          <Header locale="zh" />
          <main className="min-h-[calc(100vh-520px)] pt-[78px] lg:pt-[88px]">
            <NotFoundState locale="zh" />
          </main>
          <Footer locale="zh" />
        </div>
        <BaiduAnalytics />
      </body>
    </html>
  );
}
