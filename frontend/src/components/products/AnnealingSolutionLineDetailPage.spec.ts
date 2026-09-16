import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { ANNEALING_LINE_FAQS } from '@/lib/annealing-line-inquiry';

const pageSource = readFileSync(
  new URL('./AnnealingSolutionLineDetailPage.tsx', import.meta.url),
  'utf8',
);
const formSource = readFileSync(new URL('./AnnealingLineInquiryForm.tsx', import.meta.url), 'utf8');
const faqSource = readFileSync(new URL('./AnnealingLineFaq.tsx', import.meta.url), 'utf8');
const styleSource = readFileSync(
  new URL('./AnnealingSolutionLineDetailPage.module.css', import.meta.url),
  'utf8',
);

describe('金属带材连续退火与固溶热处理生产线专属页', () => {
  it('保留单一 H1、5 项锚点和最终模块顺序', () => {
    expect(pageSource.match(/<h1\b/g)).toHaveLength(1);
    expect(pageSource).toContain('金属带材连续退火与固溶热处理生产线');
    expect(pageSource).toContain("['fit', '适用判断']");
    expect(pageSource).toContain("['acceptance', '验收与提交工况']");

    const titles = [
      '先区分连续退火与连续固溶，再讨论生产线配置',
      '先判断是否适合连续式生产，再确定工艺路线与机组配置',
      '根据材料、目标性能与表面要求选择典型工艺路线',
      '方案由六类基础条件共同确定',
      '线速度、停留时间与年产能必须在同一工况下核算',
      '“生产线”必须说明苏能供什么、配合什么、由谁完成',
      '设备功能验收、工艺性能验收与产品质量验证',
      '连续退火与固溶生产线选型常见问题',
    ];
    const positions = titles.map((title) => pageSource.indexOf(title));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(pageSource.indexOf('id="faq"')).toBeLessThan(pageSource.indexOf('id="evaluation"'));
  });

  it('只展示批准的企业事实与项目边界', () => {
    ['2006 年成立', '约 14700 m²', '河南项目', '泰州・姜堰'].forEach((text) =>
      expect(pageSource).toContain(text),
    );
    ['5080 万元', '150+ 项目'].forEach((text) => expect(pageSource).not.toContain(text));
    expect(pageSource).not.toMatch(/href="\/zh\/case\//);
  });

  it("保留产能核算条件并撤下历史项目固定参数", () => {
    for(const term of ['有效工艺段长度 ÷ 线速度','年有效生产小时','理论处理量或合格产能','不能把全炉停留时间当作有效保温时间'])expect(pageSource).toContain(term);
    expect(pageSource).not.toContain('带宽 480–750 mm，厚度 1.6–4.0 mm');
  });

  it('FAQ 可访问且结构化数据共用可见数据源', () => {
    expect(ANNEALING_LINE_FAQS).toHaveLength(6);
    expect(pageSource).toContain('getFaqJsonLd([...ANNEALING_LINE_FAQS])');
    expect(pageSource).toContain('items={ANNEALING_LINE_FAQS}');
    expect(faqSource).toContain('aria-expanded={isOpen}');
    expect(faqSource).toContain("event.key === 'ArrowDown'");
  });

  it('复用真实询盘接口并保留近场错误、隐私与提交状态', () => {
    expect(formSource).toContain('submitHomepageRequirement');
    expect(formSource).toContain("trackLeadEvent('form_success'");
    expect(formSource).toContain('aria-invalid={Boolean(error)}');
    expect(formSource).toContain('您提交的信息仅用于本次项目需求沟通与选型初判');
    expect(formSource).toContain('提交带材参数，获取初步路线判断');
    expect(formSource).not.toContain('type="file"');
  });

  it('覆盖电脑、平板、手机和低动态偏好', () => {
    expect(styleSource).toContain('@media (max-width: 1023px)');
    expect(styleSource).toContain('@media (max-width: 767px)');
    expect(styleSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styleSource).toContain('overflow-x: clip');
    expect(styleSource).not.toContain('transition: all');
  });
});
