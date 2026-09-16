import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landingSource = readFileSync(
  new URL('./ChineseProductsLanding.tsx', import.meta.url),
  'utf8',
);
const carouselSource = readFileSync(
  new URL('./ProductCenterLineCarousel.tsx', import.meta.url),
  'utf8',
);
const landingStyles = readFileSync(
  new URL('./ChineseProductsLanding.module.css', import.meta.url),
  'utf8',
);
const formSource = readFileSync(new URL('../home/HomepageLeadForm.tsx', import.meta.url), 'utf8');

describe('Chinese products landing structure', () => {
  it('keeps the confirmed one-page order without the duplicate sticky lead bar', () => {
    expect(landingSource).toContain('ProductCenterLineCarousel');
    expect(landingSource).toContain('title="周期式工业炉"');
    expect(landingSource).toContain('title="连续式工业炉"');
    expect(landingSource).toContain('现有设备需要维修、改造或增加配套？');
    expect(landingSource).not.toContain('HomepageBottomLeadBar');
  });

  it('reuses the homepage page scope for the shared header and footer', () => {
    expect(landingSource).toContain('home-page-scope');
  });

  it('renders every production line in initial markup with real controls and status', () => {
    expect(carouselSource).toContain('items.slice');
    expect(carouselSource).toContain('group.map');
    expect(carouselSource).toContain('href={product.href}');
    expect(carouselSource).toContain('查看上一组生产线');
    expect(carouselSource).toContain('查看下一组生产线');
    expect(carouselSource).toContain('aria-live="polite"');
    expect(landingStyles).toContain('overflow-x: auto');
    expect(landingStyles).toContain('scroll-snap-type: x mandatory');
    expect(carouselSource).not.toContain('role="progressbar"');
    expect(landingSource).not.toContain('→');
    expect(carouselSource).toContain('product.compositionHref');
  });

  it('keeps the shared homepage inquiry flow', () => {
    expect(formSource).toContain('手机号、微信号或邮箱');
    expect(formSource).toContain('submitHomepageRequirement');
  });
});
