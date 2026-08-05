import { UpdateNewsDto } from '@/modules/news/dto/update-news.dto';

const NEWS_CONTENT_FIELDS = new Set<keyof UpdateNewsDto>([
  'categoryId',
  'titleZh',
  'titleEn',
  'summaryZh',
  'summaryEn',
  'contentZh',
  'contentEn',
  'coverImage',
  'seoTitleZh',
  'seoTitleEn',
  'seoDescriptionZh',
  'seoDescriptionEn',
  'seoKeywordsZh',
  'seoKeywordsEn',
  'ogImage',
]);

export function changesNewsContent(dto: UpdateNewsDto): boolean {
  return Object.keys(dto).some((key) => NEWS_CONTENT_FIELDS.has(key as keyof UpdateNewsDto));
}
