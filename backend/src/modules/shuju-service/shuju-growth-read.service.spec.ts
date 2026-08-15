import { BadRequestException } from '@nestjs/common';

import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ShujuGrowthReadService', () => {
  it('returns aggregate website behavior without anonymous ids or inquiry content', async () => {
    const queryRaw = jest
      .fn()
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
      ]);
    const service = new ShujuGrowthReadService({ $queryRaw: queryRaw } as unknown as PrismaService);

    const result = await service.overview({ startDate: '2026-08-15', endDate: '2026-08-15' });

    expect(result.eventCounts.page_view).toEqual({ events: 12, visitors: 8, sessions: 9 });
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
});
