import { JsonLd } from '@/components/JsonLd';
import { getBreadcrumbJsonLd, getOrganizationJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl } from '@/lib/seo/metadata';

export function AboutSubpageJsonLd({
  title,
  description,
  path,
  type = 'WebPage',
  locale = 'zh',
}: {
  title: string;
  description: string;
  path: string;
  type?: 'WebPage' | 'CollectionPage' | 'ContactPage';
  locale?: 'zh' | 'en';
}) {
  const url = absoluteUrl(path);
  const organization = getOrganizationJsonLd(locale);
  return (
    <JsonLd
      data={[
        {
          '@context': 'https://schema.org',
          '@type': type,
          '@id': `${url}#webpage`,
          name: title,
          description,
          url,
          inLanguage: locale === 'en' ? 'en-US' : 'zh-CN',
          about: { '@id': organization['@id'] },
          isPartOf: { '@id': `${absoluteUrl('/')}#website` },
        },
        getBreadcrumbJsonLd([
          { name: locale === 'en' ? 'Home' : '首页', url: `/${locale}` },
          { name: locale === 'en' ? 'About Suneng' : '关于苏能', url: `/${locale}/about` },
          { name: title, url: path },
        ]),
      ]}
    />
  );
}
