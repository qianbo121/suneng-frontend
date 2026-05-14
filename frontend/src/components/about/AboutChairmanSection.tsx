import Image from 'next/image';

import { EmptyState } from '@/components/ui/EmptyState';
import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';

type AboutChairmanSectionProps = {
  locale: 'zh' | 'en';
  title: string;
  content: string;
  image: string;
};

function splitParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AboutChairmanSection({
  locale,
  title,
  content,
  image,
}: AboutChairmanSectionProps) {
  const paragraphs = splitParagraphs(content);

  if (!title && !paragraphs.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'Chairman message is not available yet' : '董事长致辞暂未配置'}
        description={
          locale === 'en'
            ? 'No chairman message was returned from /api/v1/about.'
            : '当前接口未返回董事长致辞内容。'
        }
      />
    );
  }

  return (
    <section className="overflow-hidden bg-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="relative min-h-[360px] bg-[#e7ecf3] lg:min-h-[540px]">
          <Image
            src={image}
            alt={joinImageAlt(locale, [
              buildBrandImageAlt(locale, 'full'),
              locale === 'en' ? 'chairman message portrait' : '董事长致辞照片',
            ])}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 360px, 100vw"
          />
        </div>
        <div className="px-8 py-9 lg:px-12 lg:py-12">
          <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
            {locale === 'en' ? 'Message from Chairman' : '董事长致辞'}
          </p>
          <h2 className="mt-4 text-[30px] font-semibold leading-tight text-[#202020] lg:text-[38px]">
            {title}
          </h2>
          <div className="mt-6 space-y-5 text-[15px] leading-8 text-neutral-700 lg:text-base">
            {paragraphs.length
              ? paragraphs.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)
              : <p>{content}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
