import { changesNewsContent } from '@/modules/news/news-content-date';

describe('news content date governance', () => {
  it('updates the content date for substantive editorial changes', () => {
    expect(changesNewsContent({ titleZh: '更新后的标题' })).toBe(true);
    expect(changesNewsContent({ contentZh: '<p>新证据</p>' })).toBe(true);
    expect(changesNewsContent({ seoDescriptionZh: '更新后的描述' })).toBe(true);
  });

  it('does not treat workflow or display-order changes as content updates', () => {
    expect(changesNewsContent({ sortOrder: 2 })).toBe(false);
    expect(changesNewsContent({ isPublished: true })).toBe(false);
    expect(changesNewsContent({ publishDate: '2026-08-04T00:00:00.000Z' })).toBe(false);
  });
});
