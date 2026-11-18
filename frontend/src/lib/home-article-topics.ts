import {
  NEWS_DECISION_TOPICS,
  getNewsDecisionTopic,
  type NewsDecisionTopicId,
} from '@/lib/news-decision-center';
import type { NewsListCardItem } from '@/types/news';
import type { Locale } from '@/types/site';
import { getNewsListCardHref } from '@/lib/news-list-resources';

export const HOME_ARTICLE_TOPICS = NEWS_DECISION_TOPICS.filter((topic) => topic.id !== 'all');
export type HomeArticleTopic = Exclude<NewsDecisionTopicId, 'all'>;

// Homepage-specific compositions preserve the complete illustration in a wide cover.
const HOME_ARTICLE_COVERS: Partial<Record<number, string>> = {
  129: '/images/home/mesh-belt-oil-fume-cover-16x9-20261118.png',
};

export type HomeTopicArticle = {
  id: number;
  title: string;
  summary: string;
  coverImage: string;
  publishDate: string;
  href: string;
  topic: NewsDecisionTopicId;
};

export function mapNewsToHomeTopicArticles(
  items: NewsListCardItem[],
  locale: Locale,
): HomeTopicArticle[] {
  // The homepage promotes articles only; infographics stay in the resource center.
  return items
    .filter((item) => item.contentType !== 'infographic')
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date) || left.id - right.id)
    .map((item) => ({
      id: item.id,
      title:
        locale === 'zh' && item.title.zh === '热处理生产线报价需要哪些参数？先准备11组输入再比价'
          ? '热处理生产线报价前，需要准备哪些参数？'
          : item.title[locale],
      summary: item.summary[locale],
      coverImage: HOME_ARTICLE_COVERS[item.id] ?? item.image,
      publishDate: item.date,
      href: getNewsListCardHref(item, locale),
      topic: getNewsDecisionTopic(item),
    }));
}

export function selectHomeArticlesForTopic(
  articles: readonly HomeTopicArticle[],
  topic: HomeArticleTopic,
  limit = 4,
) {
  // Keep each tab faithful to the resource center, even when it has fewer cards.
  return articles.filter((article) => article.topic === topic).slice(0, limit);
}
