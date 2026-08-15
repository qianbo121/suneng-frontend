import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const nginxTemplate = readFileSync(
  new URL('../../../../nginx.prod.conf.template', import.meta.url),
  'utf8',
);

function exactLocation(path: string) {
  const marker = `    location = ${path} {`;
  expect(nginxTemplate.split(marker)).toHaveLength(2);
  const start = nginxTemplate.indexOf(marker);
  const end = nginxTemplate.indexOf('\n    }', start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return nginxTemplate.slice(start, end);
}

describe('public inquiry routing', () => {
  it.each(['/api/v2/custom-requirements', '/api/v2/custom-requirements/'])(
    'proxies only the exact V2 inquiry route with submission throttling: %s',
    (path) => {
      const block = exactLocation(path);
      expect(block).toContain('limit_req zone=inquiry_submit burst=2 nodelay;');
      expect(block).toContain('limit_req_status 429;');
      expect(block).toContain('proxy_pass http://backend_upstream;');
    },
  );

  it('does not expose the whole V2 API namespace through the public host', () => {
    expect(nginxTemplate).not.toContain('location ^~ /api/v2/');
    expect(nginxTemplate).not.toContain('location /api/v2/');
  });

  it('marks successful V2 inquiry requests in the access-log evidence stream', () => {
    expect(nginxTemplate).toContain(
      '~^POST:/api/v2/custom-requirements/?$ "custom_requirement_submit";',
    );
  });
});

describe('admin inquiry search privacy', () => {
  it.each(['/api/admin/custom-requirements', '/api/admin/custom-requirements/'])(
    'stops a cached GET search before it can reach the upstream: %s',
    (path) => {
      const block = exactLocation(path);
      expect(block).toContain('return 410;');
      expect(block).not.toContain('proxy_pass');
    },
  );

  it('uses a query-free POST route for current admin inquiry searches', () => {
    expect(nginxTemplate).toContain('location ^~ /api/admin/');
    expect(nginxTemplate).not.toContain('location = /api/admin/custom-requirements/search');
  });
});

describe('Shuju inquiry search privacy', () => {
  it.each(['/api/inquiries', '/api/inquiries/'])(
    'stops a cached GET search before it can reach the Shuju upstream: %s',
    (path) => {
      const block = exactLocation(path);
      expect(block).toContain('return 410;');
      expect(block).not.toContain('proxy_pass');
    },
  );
});
