import { ConfigService } from '@nestjs/config';

import { ShujuInquiryReadService } from '@/modules/shuju-service/shuju-inquiry-read.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ShujuInquiryReadService', () => {
  it('never returns rows at or below the protected production cutover id', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([
        { id: 5, phone: '13000000000', createdAt: new Date('2026-08-08T00:00:00Z') },
      ])
      .mockResolvedValueOnce([]);
    const prisma = {
      customRequirement: { findMany, aggregate: jest.fn() },
    } as unknown as PrismaService;
    const service = new ShujuInquiryReadService(
      prisma,
      new ConfigService({ shujuInquiryReadMinId: 4 }),
    );

    const result = await service.list({ afterId: 0, limit: 50 });

    expect(findMany.mock.calls[0][0].where).toEqual({ id: { gt: 4 } });
    expect(result.nextAfterId).toBe(5);
    expect(result.items).toHaveLength(1);
  });

  it('uses limit plus one without logging or projecting unrelated admin data', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([
        { id: 8, phone: '1' },
        { id: 9, phone: '2' },
      ])
      .mockResolvedValueOnce([{ id: 6, phone: 'old' }]);
    const prisma = {
      customRequirement: { findMany, aggregate: jest.fn() },
    } as unknown as PrismaService;
    const service = new ShujuInquiryReadService(
      prisma,
      new ConfigService({ shujuInquiryReadMinId: 4 }),
    );

    const result = await service.list({ afterId: 7, limit: 1 });

    expect(findMany.mock.calls[0][0].take).toBe(2);
    expect(findMany.mock.calls[0][0].select.status).toBeUndefined();
    expect(result.items.map((item) => item.id)).toEqual([8]);
    expect(result.replayItems.map((item) => item.id)).toEqual([6]);
    expect(result.hasMore).toBe(true);
  });

  it('replays the last 100 committed ids to recover out-of-order sequence commits', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 9 }, { id: 8 }]);
    const prisma = {
      customRequirement: { findMany, aggregate: jest.fn() },
    } as unknown as PrismaService;
    const service = new ShujuInquiryReadService(
      prisma,
      new ConfigService({ shujuInquiryReadMinId: 4 }),
    );

    const result = await service.list({ afterId: 10, limit: 50 });

    expect(findMany.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        where: { id: { gt: 4, lte: 10 } },
        orderBy: { id: 'desc' },
        take: 100,
      }),
    );
    expect(result.replayItems.map((row) => row.id)).toEqual([8, 9]);
    expect(result.nextAfterId).toBe(10);
  });

  it('returns the current source head without inquiry content', async () => {
    const aggregate = jest.fn().mockResolvedValue({ _max: { id: 12 } });
    const prisma = {
      customRequirement: { findMany: jest.fn(), aggregate },
    } as unknown as PrismaService;
    const service = new ShujuInquiryReadService(
      prisma,
      new ConfigService({ shujuInquiryReadMinId: 4 }),
    );

    await expect(service.head()).resolves.toEqual(
      expect.objectContaining({ maxId: 12, minimumAfterId: 4 }),
    );
  });
});
