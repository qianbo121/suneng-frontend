import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

describe('unprefixed public route governance', () => {
  it('permanently sends public non-localized routes to Chinese equivalents', () => {
    expect(middlewareSource).toContain('NextResponse.redirect(target, 308)');
    expect(middlewareSource).toContain('permanentRedirect(request, `/zh${pathname}`)');
  });

  it('returns real permanent redirects for leaked and duplicate fixed routes', () => {
    expect(middlewareSource).toContain("pathname === '/en/news'");
    expect(middlewareSource).toContain("pathname === '/en/partner'");
    expect(middlewareSource).toContain("pathname === '/zh/strength'");
    expect(middlewareSource).toContain("pathname === '/zh/strength/certificates'");
    expect(middlewareSource).toContain('DUPLICATE_NEWS_PATH');
  });
});
