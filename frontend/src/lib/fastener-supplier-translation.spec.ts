import { expect, it } from 'vitest';
import type { NewsApiItem } from '@/types/news';
import { applyEnglishNewsCopy } from './english-news';
import revisions from './news-reviewed-copy.json';

it('serves the reviewed supplier article in English with the two agreement rows', async () => {
  const revision = revisions['98'];
  const title = '国内做紧固件热处理网带炉的厂家有哪些？采购前怎么筛选？';
  const reviewed = {
    id: 98,
    slug: revision.slug,
    status: 'published',
    isPublished: true,
    titleZh: title,
    seoTitleZh: title,
    summaryZh: revision.summaryZh,
    seoDescriptionZh: revision.seoDescriptionZh,
    contentZh: revision.contentZh,
  } as NewsApiItem;

  const translated = await applyEnglishNewsCopy(reviewed);
  expect(translated.titleEn).toBeTruthy();
  const rows = translated.contentEn?.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const bolts = rows.find(row => row.includes('400 × 3200 mm'));
  expect(bolts).toContain('approximately 150 kg/h');
  expect(bolts).toContain('1000 × 12000 mm');
  expect(bolts).toContain('maximum of approximately 1,500 kg/h');
  const carburizing = rows.find(row => row.includes('RCWT-160/105-9/6'));
  expect(carburizing).toContain('carburizing throughput of 150 kg/h');
});
