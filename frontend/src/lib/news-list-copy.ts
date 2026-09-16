import copy from './news-list-copy.json';
import { richTextToPlainText } from '@/lib/sanitize';
import type { NewsListCardItem } from '@/types/news';
import type { NewsDecisionTopicId, NewsFurnaceFilterId } from '@/lib/news-decision-center';

type ListCopy = {
  title: string;
  summary: string;
  sourceTitle: string;
  sourceDate: string;
  topic: NewsDecisionTopicId;
  furnaces: NewsFurnaceFilterId[];
  equipmentLabel?: string;
  image?: string;
};

export function cleanNewsListSummary(value: string) {
  const text = richTextToPlainText(value).replace(/\s*#{1,6}\s*/g, ' ');
  return (text.match(/[^。！？]+[。！？]?/g) || [])
    .map((s) => s.trim())
    .filter((s) => s && !/画面|配图|图片|封面|示意图|只表达本文/.test(s))
    .slice(0, 2)
    .join('');
}

// Editorial presentation only: never alters source bodies, canonical identifiers,
// dates or counts. An edited source automatically falls back to its current CMS copy.
export function applyNewsListCopy(item: NewsListCardItem): NewsListCardItem {
  const entry = (copy as Record<string, ListCopy>)[String(item.id)];
  const matches =
    entry?.sourceTitle === item.title.zh && entry.sourceDate === (item.updatedAt || item.date);
  if (!matches)
    return {
      ...item,
      summary: {
        ...item.summary,
        zh:
          cleanNewsListSummary(item.summary.zh) ||
          cleanNewsListSummary(item.source?.contentZh || ''),
      },
    };
  return {
    ...item,
    title: { ...item.title, zh: entry.title },
    summary: { ...item.summary, zh: entry.summary },
    image: entry.image || item.image,
    listTopic: entry.topic,
    listFurnaces: entry.furnaces,
    listEquipmentLabel: entry.equipmentLabel,
  };
}
