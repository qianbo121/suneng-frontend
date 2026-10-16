import { ShujuGrowthReadService } from './shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('operating source output', () => {
  it('uses operating rows even when the legacy detail query has no matching row', async () => {
    const operatingSource = {
      sourceType: '自然搜索',
      sourceDetail: null,
      visits: 2,
      dwell20Visitors: 1,
      contactVisitors: 1,
      rawSubmissions: 1,
      validSubmissions: 0,
      excludedSubmissions: 0,
      pendingSubmissions: 0,
      unknownSubmissions: 1,
    };
    const queryRaw = jest.fn(async (sql: { strings: string[] }) => {
      if (!sql.strings.join('').includes('WITH review_items AS')) return [];
      return [
        {
          payload: {
            operating: {
              version: 1,
              contactVisitors: 1,
              inquiries: { raw: 1, valid: 0, excluded: 0, pending: 0, unknown: 1 },
            },
            operatingSources: [operatingSource],
            operatingSourceDetails: [operatingSource],
            pages: [],
            totalPages: 0,
            entryVisits: 0,
            submissions: 1,
            unlinkedSubmissions: 1,
            unidentifiedPageViews: 0,
            uncertainEntryVisits: 2,
            daily: [],
            sources: [],
          },
        },
      ];
    });
    const service = new ShujuGrowthReadService({
      $queryRaw: queryRaw,
      $transaction: async (action: (transaction: unknown) => Promise<unknown>) =>
        action({ $executeRaw: jest.fn().mockResolvedValue(0), $queryRaw: queryRaw }),
    } as unknown as PrismaService);
    const result = await service.overview({
      startDate: '2026-10-09',
      endDate: '2026-10-09',
      inquiryReview: { version: 1, validIds: [], excludedIds: [], pendingIds: [] },
    });
    expect(result.sources).toHaveLength(1);
    expect(result.sourceDetails).toHaveLength(1);
    expect(result.sources[0]).toMatchObject(operatingSource);
    expect(result.sourceDetails[0]).toMatchObject(operatingSource);
    expect(result.operating.inquiries.raw).toBe(1);
    expect(result.content.unlinkedSubmissions).toBe(1);
  });
});
