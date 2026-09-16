import {
  buildPublicNewsIdentifier,
  getCanonicalLegacyNewsSlug,
  parsePublicNewsIdentifier,
} from '@/modules/news/news-public-identifier';

describe('public news identifier', () => {
  it('preserves the existing public slug instead of generating a new numeric address', () => {
    expect(buildPublicNewsIdentifier('tai-che-lu')).toBe('tai-che-lu');
    expect(buildPublicNewsIdentifier('shuju-news-31')).toBe('shuju-news-31');
  });

  it('accepts positive integer identifiers only', () => {
    expect(parsePublicNewsIdentifier('80')).toBe(80);
    expect(parsePublicNewsIdentifier('0')).toBeNull();
    expect(parsePublicNewsIdentifier('08')).toBeNull();
    expect(parsePublicNewsIdentifier('tai-che-lu')).toBeNull();
  });

  it('keeps the known duplicate route on its canonical article', () => {
    expect(
      getCanonicalLegacyNewsSlug(
        'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1',
      ),
    ).toBe(
      'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong',
    );
  });
});
