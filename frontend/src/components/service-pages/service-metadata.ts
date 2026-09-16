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

export function getServiceMetadata(kind: ServicePageKind): Metadata {
  const page = servicePages[kind];
  return {
    ...buildMetadata({
      title: page.metadataTitle,
      description: page.metadataDescription,
      path: page.path,
      image: serviceHeroAssets[kind].src,
      type: 'website',
      alternateLocales: { 'zh-CN': page.path, 'x-default': page.path },
    }),
    ...(process.env.NODE_ENV === 'development' ? { robots: { index: false, follow: true } } : {}),
  };
}
export function getServiceJsonLd(kind: ServicePageKind) {
  const page = servicePages[kind];
  const serviceId = `${absoluteUrl(page.path)}#service`;
  const webPage = getWebPageJsonLd({
    path: page.path,
    name: page.title,
    description: page.metadataDescription,
  });
  const breadcrumbs = [
    { name: '首页', url: '/zh' },
    ...(kind === 'overview' ? [] : [{ name: '改造与服务', url: serviceRoutes.overview }]),
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
