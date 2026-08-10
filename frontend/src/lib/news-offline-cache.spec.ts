import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';


describe('news offline cache contract', () => {
  it('keeps detail data and full routes out of persistent caches', () => {
    const apiSource = readFileSync(resolve(process.cwd(), 'src/lib/api/news.ts'), 'utf8');
    const pageSource = readFileSync(
      resolve(process.cwd(), 'src/app/[locale]/news/[slug]/page.tsx'),
      'utf8',
    );

    expect(apiSource).toMatch(/getNewsDetail[\s\S]*cache:\s*'no-store'/);
    expect(apiSource).toMatch(/getNewsPrevNext[\s\S]*cache:\s*'no-store'/);
    expect(pageSource).toContain("export const dynamic = 'force-dynamic'");
    expect(pageSource).toContain('export const revalidate = 0');
  });
});
