import { EmptyState } from '@/components/ui/EmptyState';
import { Locale } from '@/types/site';

type HomeSectionFallbackProps = {
  locale: Locale;
  type: 'empty' | 'error';
};

export function HomeSectionFallback({ locale, type }: HomeSectionFallbackProps) {
  const copy =
    type === 'error'
      ? locale === 'en'
        ? {
            title: 'Fallback content is displayed',
            description: 'The live data request failed, so the section is rendered with placeholder content.',
          }
        : {
            title: '当前显示占位内容',
            description: '真实数据请求失败，当前区块已自动降级为占位内容展示。',
          }
      : locale === 'en'
        ? {
            title: 'No data available',
            description: 'The current section has no published content yet.',
          }
        : {
            title: '暂无数据',
            description: '当前区块暂时没有可展示的已发布内容。',
          };

  return <EmptyState title={copy.title} description={copy.description} />;
}
