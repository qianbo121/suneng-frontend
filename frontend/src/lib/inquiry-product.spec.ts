import { describe, expect, it } from 'vitest';
import { resolveInquiryProduct } from './inquiry-product';

describe('inquiry product context', () => {
  it('recognizes catalogue identifiers and earlier name-based links', () => {
    expect(resolveInquiryProduct('shovel-furnace', 'zh')).toBe('叉车炉');
    expect(resolveInquiryProduct('叉车炉', 'en')).toBe('Fork-Handling Furnace');
    expect(resolveInquiryProduct('铲齿炉', 'zh')).toBe('叉车炉');
    expect(resolveInquiryProduct('铲齿炉', 'en')).toBe('Fork-Handling Furnace');
    expect(resolveInquiryProduct('Walking Beam Furnace', 'zh')).toBe('步进炉');
  });

  it('does not prefill arbitrary or ambiguous query values', () => {
    expect(resolveInquiryProduct('不是本站设备', 'zh')).toBeUndefined();
    expect(resolveInquiryProduct(['shovel-furnace', 'walking-beam-furnace'], 'zh')).toBeUndefined();
    expect(resolveInquiryProduct(undefined, 'en')).toBeUndefined();
  });
});
