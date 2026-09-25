import { expect, it } from 'vitest';
import { getPriorityNews } from './priority-news';
import type { NewsListCardItem } from '@/types/news';

it('never invents links to records missing from the current public language list', () => {
  const available = { slug: 'shuju-news-17', title: { en: 'Approved English Title', zh: '原标题' } } as NewsListCardItem;
  expect(getPriorityNews([available, { slug: 'other' } as NewsListCardItem])).toEqual([available]);
  expect(getPriorityNews([])).toEqual([]);
});
