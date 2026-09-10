import { describe, expect, it } from 'vitest';
import { partnerIndustryGroup } from './partner-industry-groups';

describe('public partner industry filters', () => {
  it('keeps automotive and energy equipment out of broader material or mechanical groups', () => {
    expect(partnerIndustryGroup('汽车零部件（铝合金轮毂）')).toBe('汽车零部件');
    expect(partnerIndustryGroup('压力容器与石化装备')).toBe('能源装备');
    expect(partnerIndustryGroup('钛及钛合金材料')).toBe('金属材料');
    expect(partnerIndustryGroup('热工与输送装备')).toBe('机械与装备');
    expect(partnerIndustryGroup('金属加工与热处理')).toBe('加工与热处理');
    expect(partnerIndustryGroup('工程设计与咨询')).toBe('其他行业');
  });
  it('does not assign a category when the public industry is absent', () => {
    expect(partnerIndustryGroup(null)).toBeNull();
  });
});
