import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const readSource = (path: string) => fs.readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
describe('Home facts retained during migration', () => {
  it('keeps both home heroes and the profile on the approved project and area scope', () => {
    const home = readSource('../../components/home/HomeHero.tsx');
    const englishHome = readSource('../../components/home/EnglishHomeHero.tsx');
    const profile = readSource('../../components/about/AboutProfileSection.tsx');
    expect(home).toContain('1000+');
    expect(home).toContain('工业炉新建与改造项目');
    expect(home).toContain("value: '14700 m²', label: '生产基地面积'");
    expect(englishHome).toContain('<HomeHero locale="en" />');
    expect(home).toContain('1,000+');
    expect(home).toContain('Furnace builds and retrofits');
    expect(home).not.toContain("prefix: '≈'");
    expect(home).toContain('14,700 m²');
    expect(home).toContain('Production site area');
    expect(home).toContain('company-reported');
    expect(profile).toContain("value: { zh: '1000+', en: '1000+' }");
    for (const source of [home, englishHome, profile]) {
      expect(source).not.toMatch(/(?:value:\s*150\b|['"]150\+['"]|label:\s*['"]Employees['"])/);
    }
  });

});
