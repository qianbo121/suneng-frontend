import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DOMPurify from 'isomorphic-dompurify';
import { describe, expect, it } from 'vitest';
import HomeHero from '../../components/home/HomeHero';
import EnglishHomeHero from '../../components/home/EnglishHomeHero';

describe('Home facts retained during migration', () => {
  it.each([
    { component: HomeHero, values: ['2006 年', '5080 万元', '1000+ 项', '14700 m²'],
      labels: ['公司成立', '注册资本', '累计工业炉新建与改造项目', '生产基地面积'] },
    { component: EnglishHomeHero, values: ['2006', '50.8 million', '1,000+', '14,700 m²'],
      labels: ['Year founded', 'Registered capital (RMB)', 'Furnace builds and retrofits', 'Production site area (company-reported)'] },
  ])('renders the approved project and area figures before animation ($values)', ({ component, values, labels }) => {
    const html = renderToStaticMarkup(createElement(component));
    const hero = DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
    expect([...hero.querySelectorAll('dt')].map(node => node.textContent)).toEqual(labels);
    expect([...hero.querySelectorAll('dd')].map(node => node.textContent)).toEqual(values);
    expect([...hero.querySelectorAll('dd')].map(node => node.getAttribute('aria-label'))).toEqual(values);
  });

  it('keeps the profile on the approved project count', () => {
    const profile = fs.readFileSync(fileURLToPath(new URL('../../components/about/AboutProfileSection.tsx', import.meta.url)), 'utf8');
    expect(profile).toContain("value: { zh: '1000+', en: '1000+' }");
    expect(profile).not.toMatch(/(?:value:\s*150\b|['"]150\+['"]|label:\s*['"]Employees['"])/);
  });
});
