import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ABOUT_ANCHORS, ABOUT_BOUNDARIES, ABOUT_FAQS } from './about-page-data';

const heroSource = readFileSync(new URL('./AboutCompanyHero.tsx', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('./AboutZhContent.tsx', import.meta.url), 'utf8');
const interactiveSource = readFileSync(
  new URL('./AboutPageInteractive.tsx', import.meta.url),
  'utf8',
);
const videoSource = readFileSync(new URL('./AboutHeroVideo.tsx', import.meta.url), 'utf8');
const styleSource = readFileSync(new URL('./AboutZhContent.module.css', import.meta.url), 'utf8');
const wechatButtonSource = readFileSync(
  new URL('../lead/WechatContactButton.tsx', import.meta.url),
  'utf8',
);

describe('中文关于苏能页', () => {
  it('保留 6 个页内导航模块和单一 H1', () => {
    expect(ABOUT_ANCHORS.map((item) => item.id)).toEqual([
      'manufacturer',
      'delivery',
      'scope',
      'qualifications',
      'projects',
      'faq',
    ]);
    expect((pageSource + heroSource).match(/<h1(?:\s[^>]*)?>/g)).toHaveLength(1);
    expect(interactiveSource).toContain('IntersectionObserver');
    expect(styleSource).toContain('scroll-margin-top');
  });

  it('保留既定视频与制造图片', () => {
    expect(videoSource).toContain('/videos/about/suneng-factory-20260808.mp4');
    expect(videoSource).toContain('/videos/about/suneng-factory-20260808-poster.jpg');
    expect(videoSource).toContain('aria-describedby="about-video-description"');
    expect(videoSource).toContain('视频展示生产基地外景、连续炉设备、车间制造装配及人员检查等画面');

    [
      '/images/about/about-requirement-office.jpg',
      '/images/about/about-furnace-fabrication.jpg',
      '/images/about/about-production-line.jpg',
      '/images/about/about-process-inspection.jpg',
      '/images/about/about-furnace-delivery.jpg',
    ].forEach((image) => expect(pageSource).toContain(image));
  });

  it('保持 8 个可见 FAQ 与结构化数据同源', () => {
    expect(ABOUT_FAQS).toHaveLength(8);
    expect(pageSource).toContain('mainEntity: ABOUT_FAQS.map');
    expect(pageSource).toContain('<AboutFaq items={ABOUT_FAQS} />');
  });

  it("保留业务边界与产品入口并撤下旧方案入口", () => {
    expect(ABOUT_BOUNDARIES).toHaveLength(11);
    expect(pageSource).toContain('/zh/strength/honors');
    expect(pageSource).not.toMatch(/\/zh\/case\//);
  });

  it('关键弹窗交互包含 ESC、焦点锁定与触发器焦点返回', () => {
    expect(interactiveSource).toContain("event.key === 'Escape'");
    expect(interactiveSource).toContain("event.key !== 'Tab'");
    expect(interactiveSource).toContain('const trigger = triggerRef.current');
    expect(interactiveSource).toContain('trigger?.focus()');
    expect(interactiveSource).toContain('aria-modal="true"');
  });

  it('区分三处转化按钮并让移动端锚点跟随当前模块', () => {
    expect(wechatButtonSource).toContain("label = '加企微，发工况初判'");
    expect(pageSource).toContain('label="联系业务顾问"');
    expect(pageSource).toContain('label="提交工况资料"');
    expect(interactiveSource).toContain("window.matchMedia('(max-width: 767px)')");
    expect(interactiveSource).toContain('scroller.scrollTo');
  });

  it('移除模块主标题上方的小标题', () => {
    expect(pageSource).not.toContain('styles.eyebrow');
    expect(interactiveSource).not.toContain('styles.eyebrowOnDark');
    expect(pageSource).not.toContain('开始技术沟通');
    expect(styleSource).not.toContain('.eyebrow');
  });
});
