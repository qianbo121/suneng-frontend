import { NEWS_FALLBACK_IMAGE } from '@/constants/news';
import { toAssetUrl } from '@/lib/api/client';
import { filterCanonicalNewsItems } from '@/lib/news-routing';
import newsListCopy from '@/lib/news-list-copy.json';
import type { NewsApiItem } from '@/types/news';

export type ArticleAudience = 'owner' | 'procurement' | 'process' | 'production' | 'engineering';

export type HomeAudienceArticle = {
  id: number;
  title: string;
  summary: string;
  coverImage: string;
  publishDate: string;
  href: string;
  audiences: readonly ArticleAudience[];
};

export const ARTICLE_AUDIENCES = [
  {
    id: 'owner',
    label: '企业 / 项目负责人',
    description: '面向企业与项目负责人，聚焦产线投资、供应商选择、报价边界与项目交付。',
  },
  {
    id: 'procurement',
    label: '采购 / 招标',
    description: '面向采购与招标人员，聚焦报价参数、供货边界、验收条件与供应商比较。',
  },
  {
    id: 'process',
    label: '工艺 / 技术',
    description: '面向工艺与技术人员，聚焦工艺路线、温度制度、材料要求与质量验证。',
  },
  {
    id: 'production',
    label: '设备 / 生产',
    description: '面向设备与生产人员，聚焦运行稳定、产能节拍、维护改造与自动化。',
  },
  {
    id: 'engineering',
    label: '工程 / 设计',
    description: '面向工程与设计人员，聚焦设备选型、系统接口、现场条件与整线协同。',
  },
] as const satisfies ReadonlyArray<{
  id: ArticleAudience;
  label: string;
  description: string;
}>;

export const HOMEPAGE_ARTICLE_AUDIENCES_BY_SLUG: Readonly<
  Record<string, readonly ArticleAudience[]>
> = {
  'shuju-news-30': ['owner', 'process', 'production'],
  'shuju-news-29': ['owner', 'procurement'],
  'shuju-news-28': ['owner', 'procurement'],
  'shuju-news-27': ['process', 'production'],
  'shuju-news-26': ['process', 'engineering'],
  'shuju-news-25': ['process', 'engineering'],
  'shuju-news-24': ['production', 'engineering'],
  'shuju-news-23': ['production', 'engineering'],
  'shuju-news-22': ['owner', 'procurement'],
  'shuju-news-20': ['process', 'engineering'],
  'shuju-news-19': ['procurement', 'process'],
  'shuju-news-18': ['procurement', 'engineering'],
  'shuju-news-17': ['procurement', 'engineering'],
  'shuju-news-16': ['production'],
  'shuju-news-15': ['owner', 'procurement'],
  'shuju-news-14': ['owner', 'procurement'],
  'jiang-su-su-neng-gong-ye-lu-zai-2026-gong-ye-lu-yu-re-chu-li-ji-shu-jiao-liu-hui-shang-fen-xiang-zhi-neng-gong-yi-jing-yan':
    ['owner', 'process'],
  'jiang-su-su-neng-gong-ye-lu-zai-2026-quan-guo-gang-cai-re-chu-li-ji-shu-lun-tan-fen-xiang-gong-yi-chuang-xin':
    ['owner', 'process'],
  'jiang-su-su-neng-gong-ye-lu-zhuan-di-shi-re-chu-li-lu-ji-shu-sheng-ji-ji-ying-yong-an-li': [
    'process',
    'engineering',
  ],
  'tong-si-zi-dong-hua-tui-huo-sheng-chan-xian-zhi-neng-hua-sheng-ji-yu-hang-ye-ying-yong': [
    'production',
    'engineering',
  ],
  'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong': [
    'procurement',
    'production',
    'engineering',
  ],
  'jiang-su-su-neng-gong-ye-lu-xiang-shi-re-chu-li-lu-ti-sheng-zhong-xiao-pi-liang-sheng-chan-xiao-l':
    ['process', 'production'],
  'large-trolley-furnace-delivery': ['owner', 'production', 'engineering'],
  'industry-technology-exchange': ['owner', 'process'],
  'intelligent-control-system-upgrade': ['production', 'engineering'],
  'equipment-upgrade-production-stability': ['owner', 'production', 'engineering'],
  'international-heat-treatment-expo': ['owner', 'procurement'],
  'industrial-furnace-maintenance-sharing': ['production', 'engineering'],
};

const NON_CONTENT_TITLE_PREFIXES = ['联调测试', '示例公司新闻'] as const;

function normalizeCoverImage(value?: string | null) {
  const image = toAssetUrl(value) || NEWS_FALLBACK_IMAGE;

  if (image.startsWith('http://localhost/uploads/')) {
    return image.replace('http://localhost/uploads/', 'http://localhost:3001/uploads/');
  }

  return image;
}

function byNewest(left: HomeAudienceArticle, right: HomeAudienceArticle) {
  return new Date(right.publishDate).getTime() - new Date(left.publishDate).getTime();
}

function getHomeArticleSummary(item: NewsApiItem) {
  // Home cards use plain summary fields; keep rich-text renderer dependencies out of this shared module.
  const reviewed = (newsListCopy as Record<string, { sourceTitle: string; sourceDate: string; summary: string }>)[String(item.id)];
  if (reviewed?.sourceTitle === item.titleZh && reviewed.sourceDate === (item.updatedAt || item.publishDate)) {
    return reviewed.summary;
  }
  const candidates = [item.summaryZh, item.seoDescriptionZh].map((value) => value?.trim() || '');
  return candidates.find((value) => value && !/^(?:画面|配图|图片|封面|示意图|本图|图示)/.test(value)) || item.titleZh;
}

export function mapNewsToHomeAudienceArticles(items: NewsApiItem[]): HomeAudienceArticle[] {
  return filterCanonicalNewsItems(items)
    .filter(
      (item) =>
        !NON_CONTENT_TITLE_PREFIXES.some((prefix) => item.titleZh.trim().startsWith(prefix)),
    )
    .flatMap((item) => {
      const audiences = HOMEPAGE_ARTICLE_AUDIENCES_BY_SLUG[item.slug];
      if (!audiences) return [];

      return [
        {
          id: item.id,
          title: item.titleZh,
          summary: getHomeArticleSummary(item),
          coverImage: normalizeCoverImage(item.coverImage || item.ogImage),
          publishDate: item.publishDate,
          href: `/zh/news/${item.slug}`,
          audiences,
        },
      ];
    })
    .sort(byNewest);
}

export function selectHomeArticlesForAudience(
  articles: readonly HomeAudienceArticle[],
  audience: ArticleAudience,
  limit = 4,
) {
  const directMatches = articles.filter((article) => article.audiences.includes(audience));
  const selectedIds = new Set(directMatches.map((article) => article.id));
  const supplemental = articles.filter((article) => !selectedIds.has(article.id));

  return [...directMatches, ...supplemental].slice(0, limit);
}
