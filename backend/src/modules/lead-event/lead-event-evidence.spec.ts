import { Request } from 'express';

import { LeadEventService } from '@/modules/lead-event/lead-event.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('@/modules/lead-event/visitor-region', () => ({
  exactIpv4: () => null,
  resolveVisitorRegion: () => ({ province: null, city: null }),
}));

async function capture(properties: Record<string, unknown>, headers: Request['headers'] = {}) {
  const execute = jest.fn().mockResolvedValue(1);
  const service = new LeadEventService({ $executeRaw: execute } as unknown as PrismaService);
  await service.createPublic({ eventType: 'page_view', properties }, {
    ip: '10.0.0.2',
    headers,
  } as Request);
  const stored = execute.mock.calls[0]
    .slice(1)
    .find(
      (value: unknown) =>
        typeof value === 'string' && value.startsWith('{') && value.includes('serverEvidence'),
    );
  return JSON.parse(stored);
}

describe('request-observed collection evidence', () => {
  it('overwrites client impersonation of server evidence and retains bounded client claims', async () => {
    const stored = await capture(
      {
        serverEvidence: { originHost: 'forged', networkCategory: 'residential' },
        ' serverEvidence ': 'forged',
        collectorVersion: '2',
        evidenceVersion: 1,
        interactionType: 'keydown',
        interactionStrength: 'strong',
        browserBrands: 'Client claim 150',
      },
      {
        origin: 'https://www.jssngyl.cn',
        referer: 'https://www.jssngyl.cn/zh/inquiry?email=private@example.com#sensitive',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'sec-ch-ua': '"Chromium";v="150"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
    );
    expect(stored).toMatchObject({
      collectorVersion: '2',
      browserBrands: 'Client claim 150',
      interactionType: 'keydown',
      serverEvidence: {
        version: 1,
        originHost: 'www.jssngyl.cn',
        referrerHost: 'www.jssngyl.cn',
        fetchSite: 'same-origin',
        fetchMode: 'cors',
        fetchDest: 'empty',
        browserBrands: '"Chromium";v="150"',
        networkCategory: 'unknown',
      },
    });
    expect(JSON.stringify(stored)).not.toMatch(/private@example|sensitive|residential|forged/);
  });

  it('records unknowns for missing or malformed declarations rather than inferring a network class', async () => {
    const stored = await capture(
      {},
      {
        origin: 'null',
        referer: 'file:///private/file',
        'sec-fetch-site': 'arbitrary',
        'sec-ch-ua-mobile': '?2',
      },
    );
    expect(stored.serverEvidence).toMatchObject({
      originHost: null,
      referrerHost: null,
      fetchSite: null,
      browserMobile: null,
      networkCategory: 'unknown',
    });
    expect(JSON.stringify(stored)).not.toContain('10.0.0.2');
  });

  it('bounds header storage and never keeps high entropy hints or credentials', async () => {
    const stored = await capture(
      Object.fromEntries(Array.from({ length: 40 }, (_, index) => ['claim' + index, index])),
      {
        referer: 'https://user:password@example.com/private',
        'sec-ch-ua': 'x'.repeat(400),
        'sec-ch-ua-full-version-list': 'secret-version',
        'sec-ch-ua-platform-version': 'secret-platform',
        authorization: 'secret-token',
        cookie: 'secret-cookie',
      },
    );
    expect(Object.keys(stored)).toHaveLength(25);
    expect(stored.serverEvidence.browserBrands).toHaveLength(255);
    expect(stored.serverEvidence.referrerHost).toBeNull();
    expect(JSON.stringify(stored)).not.toMatch(/secret|password/);
  });
});
