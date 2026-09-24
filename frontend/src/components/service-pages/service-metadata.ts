import type { Locale } from '@/types/site';
import { localizeServiceContent, serviceHref, serviceText } from '@/components/service-pages/service-localization';
import type { Metadata } from 'next';
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getOrganizationJsonLd,
  getWebPageJsonLd,
} from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import {
  serviceHeroAssets,
  servicePages,
  serviceRoutes,
  type ServicePageKind,
} from './service-content';

export function getServiceMetadata(kind: ServicePageKind, locale: Locale = 'zh'): Metadata {
  const page = localizeServiceContent(servicePages[kind], locale);
  return {
    ...buildMetadata({
      title: page.metadataTitle,
      description: page.metadataDescription,
      path: page.path,
      image: serviceHeroAssets[kind].src,
      type: 'website',
      alternateLocales: { 'zh-CN': servicePages[kind].path, 'en-US': serviceHref(servicePages[kind].path, 'en'), 'x-default': servicePages[kind].path },
      locale,
    }),
    ...(process.env.NODE_ENV === 'development' ? { robots: { index: false, follow: true } } : {}),
  };
}
export function getServiceJsonLd(kind: ServicePageKind, locale: Locale = 'zh') {
  const page = localizeServiceContent(servicePages[kind], locale);
  const serviceId = `${absoluteUrl(page.path)}#service`;
  const webPage = getWebPageJsonLd({
    path: page.path,
    name: page.title,
    description: locale === 'en' ? page.description : page.metadataDescription,
    locale,
  });
  const breadcrumbs = [
    { name: locale === 'en' ? 'Home' : '首页', url: `/${locale}` },
    ...(kind === 'overview' ? [] : [{ name: serviceText('改造与服务', locale), url: serviceHref(serviceRoutes.overview, locale) }]),
    { name: page.breadcrumb, url: page.path },
  ];
  return [
    {
      ...webPage,
      '@type': kind === 'overview' ? 'CollectionPage' : 'WebPage',
      ...('modifiedTime' in page ? { dateModified: page.modifiedTime } : {}),
      ...(kind !== 'overview' ? { mainEntity: { '@id': serviceId } } : {}),
    },
    ...(kind === 'overview'
      ? []
      : [
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': serviceId,
            name: page.title,
            description: page.description,
            url: absoluteUrl(page.path),
            provider: { '@id': getOrganizationJsonLd('zh')['@id'] },
          },
        ]),
    getBreadcrumbJsonLd(breadcrumbs),
    getFaqJsonLd([...page.faqs]),
  ];
}
