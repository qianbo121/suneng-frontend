import { NotFoundState } from '@/components/common/NotFoundState';
import { FloatToolbar } from '@/components/layout/FloatToolbar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export default function RootNotFoundPage() {
  return (
    <div className="min-h-screen text-neutral-900">
      <Header locale="zh" />
      <main className="min-h-[calc(100vh-520px)] pb-[88px] pt-[78px] lg:pt-[88px] xl:pb-0">
        <NotFoundState locale="zh" />
      </main>
      <Footer locale="zh" />
      <FloatToolbar locale="zh" />
    </div>
  );
}
