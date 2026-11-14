import { absoluteUrl, buildMetadata, getIndexingRobots } from '@/lib/seo/metadata';
import { LOCAL_BUSINESS_ID } from '@/lib/seo/jsonld';

export type CaseSearchContent = {
  title: string;
  description: string;
  path: string;
  locale: 'zh' | 'en';
  datePublished: string;
  image: string;
  imageAlt: string;
  languages: Record<string, string>;
  questions: readonly (readonly string[])[];
};

export function caseSearchMetadata(data: CaseSearchContent, published = false) {
  return {
    ...buildMetadata({
      title: data.title, description: data.description, path: data.path,
      locale: data.locale, image: data.image, type: 'article',
      publishedTime: published ? data.datePublished : undefined,
      alternateLocales: data.languages,
    }),
    // Search metadata is not permission to publish a reviewed draft.
    robots: published ? getIndexingRobots() : { index: false, follow: false },
  };
}

export function caseSearchJsonLd(data: CaseSearchContent) {
  const url = absoluteUrl(data.path);
  const language = data.locale === 'en' ? 'en-US' : 'zh-CN';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', '@id': `${url}#article`, url,
        headline: data.title, description: data.description, inLanguage: language,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: { '@type': 'ImageObject', url: absoluteUrl(data.image), caption: data.imageAlt },
        datePublished: data.datePublished,
        publisher: { '@id': LOCAL_BUSINESS_ID },
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: data.locale === 'en' ? 'Home' : '首页', item: absoluteUrl(`/${data.locale}`) },
          { '@type': 'ListItem', position: 2, name: data.locale === 'en' ? 'Project cases' : '项目案例', item: absoluteUrl(`/${data.locale}/case`) },
          { '@type': 'ListItem', position: 3, name: data.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: language,
        mainEntity: data.questions.map(([question, answer]) => ({
          '@type': 'Question', name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
}
