import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { BAIDU_ANALYTICS_HOSTNAME, isBaiduAnalyticsHostname } from '@/lib/analytics/baidu';

const nginxTemplate = readFileSync(
  new URL('../../../../nginx.prod.conf.template', import.meta.url),
  'utf8',
);

describe('Baidu Analytics production guard', () => {
  it('allows only the canonical public hostname', () => {
    expect(isBaiduAnalyticsHostname(BAIDU_ANALYTICS_HOSTNAME)).toBe(true);
    expect(isBaiduAnalyticsHostname('WWW.JSSNGYL.CN')).toBe(true);

    expect(isBaiduAnalyticsHostname('jssngyl.cn')).toBe(false);
    expect(isBaiduAnalyticsHostname('127.0.0.1')).toBe(false);
    expect(isBaiduAnalyticsHostname('localhost')).toBe(false);
    expect(isBaiduAnalyticsHostname('www.jssngyl.cn.example.com')).toBe(false);
    expect(isBaiduAnalyticsHostname(undefined)).toBe(false);
  });

  it('allows Baidu script loading and reporting only on the public website CSP', () => {
    const publicServerStart = nginxTemplate.indexOf('server_name ${DOMAIN};');
    const adminServerStart = nginxTemplate.indexOf(
      'server_name ${ADMIN_DOMAIN};',
      publicServerStart,
    );
    const publicServer = nginxTemplate.slice(publicServerStart, adminServerStart);
    const adminServer = nginxTemplate.slice(adminServerStart);

    expect(publicServerStart).toBeGreaterThanOrEqual(0);
    expect(adminServerStart).toBeGreaterThan(publicServerStart);
    expect(publicServer).toMatch(/script-src[^;]*https:\/\/hm\.baidu\.com/);
    expect(publicServer).toMatch(/connect-src[^;]*https:\/\/hm\.baidu\.com/);
    expect(adminServer).not.toContain('https://hm.baidu.com');
    expect(nginxTemplate.match(/https:\/\/hm\.baidu\.com/g)).toHaveLength(2);
  });
});
