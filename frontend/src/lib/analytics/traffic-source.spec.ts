import { describe, expect, it } from 'vitest';

import { classifyTrafficSource } from '@/lib/analytics/traffic-source';

describe('traffic source classification', () => {
  it('recognizes supported AI referral domains', () => {
    expect(classifyTrafficSource('https://www.doubao.com/chat/123')).toEqual({
      sourceType: 'AI引流',
      sourceDetail: '豆包',
    });
    expect(classifyTrafficSource('https://chat.deepseek.com/a/chat/s/1')).toEqual({
      sourceType: 'AI引流',
      sourceDetail: 'DeepSeek',
    });
    expect(classifyTrafficSource('https://www.perplexity.ai/search/example')).toEqual({
      sourceType: 'AI引流',
      sourceDetail: 'Perplexity',
    });
  });

  it('uses UTM attribution when browsers strip the referrer', () => {
    expect(classifyTrafficSource('', 'chatgpt')).toEqual({
      sourceType: 'AI引流',
      sourceDetail: 'ChatGPT',
    });
  });

  it('keeps non-AI referrers and direct visits separate', () => {
    expect(classifyTrafficSource('https://www.baidu.com/s?wd=test')).toEqual({
      sourceType: '外部链接',
      sourceDetail: 'baidu.com',
    });
    expect(classifyTrafficSource('')).toEqual({ sourceType: '直接访问' });
  });
});
