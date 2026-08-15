import { ConfigService } from '@nestjs/config';

import { ShujuInquiryReadService } from '@/modules/shuju-service/shuju-inquiry-read.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ShujuInquiryReadService', () => {
  it('never returns rows at or below the protected production cutover id', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([
        { id: 5, phone: '13000000000', createdAt: new Date('2026-08-08T00:00:00Z') },
      ]);
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
    const findMany = jest.fn().mockResolvedValueOnce([
      { id: 8, phone: '1' },
      { id: 9, phone: '2' },
    ]);
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
    expect(findMany.mock.calls[0][0].select).toEqual(
      expect.objectContaining({
        submissionId: true,
        projectType: true,
        projectLocation: true,
        email: true,
        preferredContact: true,
        locale: true,
        pagePath: true,
        sourceType: true,
        utmCampaign: true,
        sessionId: true,
        visitorId: true,
        notificationStatus: true,
        notificationAttemptCount: true,
        notificationLastError: true,
        notificationSentAt: true,
        notificationNextAttemptAt: true,
        notificationLeaseUntil: true,
      }),
    );
    expect(result.items.map((item) => item.id)).toEqual([8]);
    expect(result.replayItems).toEqual([]);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(result.hasMore).toBe(true);
  });

  it('keeps replayItems as an empty compatibility field without querying full history', async () => {
    const findMany = jest.fn().mockResolvedValueOnce([]);
    const prisma = {
      customRequirement: { findMany, aggregate: jest.fn() },
    } as unknown as PrismaService;
    const service = new ShujuInquiryReadService(
      prisma,
      new ConfigService({ shujuInquiryReadMinId: 4 }),
    );

    const result = await service.list({ afterId: 10, limit: 50 });

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        where: { id: { gt: 10 } },
        orderBy: { id: 'asc' },
        take: 51,
      }),
    );
    expect(result.replayItems).toEqual([]);
    expect(result.nextAfterId).toBe(10);
  });

  it('projects the email-only storage sentinel as a missing phone value', async () => {
    const findMany = jest.fn().mockResolvedValueOnce([
      {
        id: 11,
        phone: '',
        email: 'sales@example.com',
        createdAt: new Date('2026-08-14T00:00:00Z'),
      },
    ]);
    const prisma = {
      customRequirement: { findMany, aggregate: jest.fn() },
    } as unknown as PrismaService;
    const service = new ShujuInquiryReadService(
      prisma,
      new ConfigService({ shujuInquiryReadMinId: 4 }),
    );

    const result = await service.list({ afterId: 10, limit: 50 });

    expect(result.items[0]).toEqual(
      expect.objectContaining({ phone: null, email: 'sales@example.com' }),
    );
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
