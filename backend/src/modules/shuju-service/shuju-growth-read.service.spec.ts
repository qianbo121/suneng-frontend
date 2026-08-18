import { BadRequestException } from '@nestjs/common';

import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ShujuGrowthReadService', () => {
  it('returns aggregate website behavior without anonymous ids or inquiry content', async () => {
    const queryRaw = jest
      .fn()
      .mockResolvedValueOnce([{ trackingStartAt: new Date('2026-08-14T16:00:00Z') }])
      .mockResolvedValueOnce([
        { eventType: 'page_view', eventCount: 12n, visitorCount: 8n, sessionCount: 9n },
        { eventType: 'form_submit', eventCount: 2n, visitorCount: 2n, sessionCount: 2n },
      ])
      .mockResolvedValueOnce([
        { day: '2026-08-15', eventType: 'page_view', eventCount: 12n, visitorCount: 8n },
      ])
      .mockResolvedValueOnce([
        {
          sourceType: '外部链接',
          sourceDetail: null,
          visitors: 3n,
          pageViews: 5n,
          engagedVisitors: 2n,
          highIntentVisitors: 1n,
          formStarts: 1n,
          stepCompleted: 1n,
          submissions: 1n,
        },
      ])
      .mockResolvedValueOnce([
        {
          sourceType: '外部链接',
          sourceDetail: 'example.com',
          visitors: 3n,
          pageViews: 5n,
          engagedVisitors: 2n,
          highIntentVisitors: 1n,
          formStarts: 1n,
          stepCompleted: 1n,
          submissions: 1n,
        },
      ])
      .mockResolvedValueOnce([
        {
          landingPage: '/zh/products/detail/trolley-furnace',
          visitors: 6n,
          sessions: 7n,
          pageViews: 10n,
        },
      ])
      .mockResolvedValueOnce([
        {
          pagePath: '/zh/products/detail/trolley-furnace',
          pageTitle: '台车炉',
          pageType: '产品页',
          productTag: '台车炉',
          visitors: 6n,
          pageViews: 10n,
          engagedVisitors: 4n,
          highIntentVisitors: 2n,
          formStarts: 2n,
          stepCompleted: 1n,
          submissions: 1n,
        },
      ])
      .mockResolvedValueOnce([
        {
          day: '2026-08-15',
          eventType: 'page_view',
          pagePath: '/zh/products/detail/trolley-furnace',
          pageTitle: '台车炉',
          pageType: '产品页',
          productTag: '台车炉',
          sourceType: '外部链接',
          sourceDetail: 'example.com',
          deviceType: 'PC',
          events: 10n,
          visitors: 6n,
          sessions: 7n,
        },
      ])
      .mockResolvedValueOnce([
        {
          pageVisitors: 8n,
          pageViews: 12n,
          visitSessions: 9n,
          engagedSessions: 5n,
          highIntentVisitors: 2n,
          formStartVisitors: 2n,
          stepCompletedVisitors: 1n,
          submissionVisitors: 1n,
        },
      ])
      .mockResolvedValueOnce([{ visitors: 4n, events: 5n }])
      .mockResolvedValueOnce([
        {
          pagePath: '/zh/products/detail/trolley-furnace',
          pageVisitors: 100n,
          highIntentVisitors: 8n,
          formStartVisitors: 6n,
          stepCompletedVisitors: 4n,
          submissionVisitors: 2n,
        },
      ]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-15' });

    expect(result.eventCounts.page_view).toEqual({ events: 12, visitors: 8, sessions: 9 });
    expect(result.coverage).toEqual(
      expect.objectContaining({
        trackingStartAt: '2026-08-14T16:00:00.000Z',
        fullRange: true,
        reason: null,
      }),
    );
    expect(result.funnel).toEqual(
      expect.objectContaining({ pageVisitors: 8, engagedSessions: 5, highIntentVisitors: 2 }),
    );
    expect(result.sourceDetails[0]).toEqual(
      expect.objectContaining({ sourceDetail: 'example.com', submissions: 1 }),
    );
    expect(result.landings[0]).toEqual(
      expect.objectContaining({ pagePath: '/zh/products/detail/trolley-furnace', sessions: 7 }),
    );
    expect(result.pages[0]).toEqual(
      expect.objectContaining({ pagePath: '/zh/products/detail/trolley-furnace', pageViews: 10 }),
    );
    expect(result.segments[0]).toEqual(
      expect.objectContaining({ sourceDetail: 'example.com', deviceType: 'PC', events: 10 }),
    );
    expect(JSON.stringify(result)).not.toMatch(/visitorId|sessionId|phone|email|requirement/);
  });

  it('rejects inverted and oversized date ranges before querying data', async () => {
    const service = new ShujuGrowthReadService({
      $queryRaw: jest.fn(),
    } as unknown as PrismaService);
    await expect(
      service.overview({ startDate: '2026-08-16', endDate: '2026-08-15' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.overview({ startDate: '2025-01-01', endDate: '2026-08-15' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns an empty comparable window when page-view tracking has not started', async () => {
    const queryRaw = jest
      .fn()
      .mockResolvedValueOnce([{ trackingStartAt: null }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          pageVisitors: 0n,
          pageViews: 0n,
          visitSessions: 0n,
          engagedSessions: 0n,
          highIntentVisitors: 0n,
          formStartVisitors: 0n,
          stepCompletedVisitors: 0n,
          submissionVisitors: 0n,
        },
      ])
      .mockResolvedValueOnce([{ visitors: 4n, events: 5n }])
      .mockResolvedValueOnce([
        {
          pagePath: '/zh/products/detail/trolley-furnace',
          pageVisitors: 100n,
          highIntentVisitors: 8n,
          formStartVisitors: 6n,
          stepCompletedVisitors: 4n,
          submissionVisitors: 2n,
        },
      ]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-15' });

    expect(result.coverage).toEqual(
      expect.objectContaining({
        trackingStartAt: null,
        fullRange: false,
        reason: 'page_view_not_started',
      }),
    );
    expect(result.funnel).toEqual(
      expect.objectContaining({
        pageVisitors: 0,
        highIntentVisitors: 0,
        submissionVisitors: 0,
      }),
    );
  });

  it('excludes bot traffic from every metric and reports how much was excluded', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const statements = queryRaw.mock.calls.map(([sql]) => JSON.stringify(sql));
    // 每一条业务查询都必须带上排除条件，否则同一页上会出现两套访客口径
    const business = statements.filter((sql) => sql.includes('WebsiteLeadEvent'));
    expect(business.length).toBeGreaterThan(1);
    for (const sql of business) {
      expect(sql).toContain('userAgent');
    }
    // 服务端写的 form_submit 不带 userAgent，必须放行 NULL，否则询盘会被整批过滤掉
    expect(statements.some((sql) => sql.includes('IS NULL'))).toBe(true);
    // 过滤了多少要能看见，不能悄悄少掉
    expect(result.botFiltered).toEqual(expect.objectContaining({ visitors: 0, events: 0 }));
    expect(result.botFiltered.pattern).toContain('spider');
  });

  it('keeps the per-page funnel monotonic so the drill-down can show conversion', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    await service.overview({ startDate: '2026-08-15', endDate: '2026-08-17' });

    const pageFunnel = queryRaw.mock.calls
      .map(([sql]) => JSON.stringify(sql))
      .find((sql) => sql.includes('cohort'));
    expect(pageFunnel).toBeDefined();
    // 每一步都必须是后续步骤的超集，否则单页漏斗又会退回"不可比"
    expect(pageFunnel).toContain('form_start');
    expect(pageFunnel).toContain('form_step_complete');
    expect(pageFunnel).toContain('form_submit');
    // 必须限定在"看过这一页的人"里，否则第5步可能大于第1步
    expect(pageFunnel).toContain('page_view');
  });
});
