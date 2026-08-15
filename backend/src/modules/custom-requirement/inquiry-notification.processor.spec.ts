import { Logger } from '@nestjs/common';
import { InquiryNotificationStatus } from '@prisma/client';

import { InquiryNotificationProcessor } from '@/modules/custom-requirement/inquiry-notification.processor';
import {
  InquiryNotificationDeliveryError,
  InquiryNotificationService,
} from '@/modules/custom-requirement/inquiry-notification.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('InquiryNotificationProcessor', () => {
  const submissionId = 'ca3e8dd2-604c-4b11-9647-04d33dd16963';
  const inquiry = {
    submissionId,
    projectType: '台车式热处理炉',
    projectLocation: '江苏常州',
    name: '张经理',
    phone: '13000000000',
    email: null,
    company: '苏能客户公司',
    industry: null,
    process: null,
    temperature: null,
    requirement: '询价',
    sourceType: 'organic_search',
    sourceDetail: 'google',
    createdAt: new Date('2026-08-14T10:00:00Z'),
    notificationAttemptCount: 1,
  };

  function setup(notify: jest.Mock, claimCount = 1, candidates = [{ submissionId }]) {
    const updateMany = jest.fn().mockImplementation(({ data }) => {
      if (data.notificationStatus === 'sending') return Promise.resolve({ count: claimCount });
      return Promise.resolve({ count: 1 });
    });
    const findMany = jest.fn().mockResolvedValue(candidates);
    const findUnique = jest.fn().mockResolvedValue(inquiry);
    const prisma = {
      customRequirement: { updateMany, findMany, findUnique },
    } as unknown as PrismaService;
    const notification = { notifyNewInquiry: notify } as unknown as InquiryNotificationService;
    const processor = new InquiryNotificationProcessor(prisma, notification);
    return { processor, updateMany, findMany, findUnique };
  }

  beforeEach(() => jest.spyOn(Logger.prototype, 'error').mockImplementation());
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('lets only one of two processor instances atomically claim a notification', async () => {
    let available = true;
    const notify = jest.fn().mockResolvedValue(true);
    const updateMany = jest.fn().mockImplementation(({ data }) => {
      if (data.notificationStatus === 'sending') {
        const count = available ? 1 : 0;
        available = false;
        return Promise.resolve({ count });
      }
      return Promise.resolve({ count: 1 });
    });
    const prisma = {
      customRequirement: {
        updateMany,
        findMany: jest.fn().mockResolvedValue([{ submissionId }]),
        findUnique: jest.fn().mockResolvedValue(inquiry),
      },
    } as unknown as PrismaService;
    const notification = { notifyNewInquiry: notify } as unknown as InquiryNotificationService;
    const first = new InquiryNotificationProcessor(prisma, notification);
    const second = new InquiryNotificationProcessor(prisma, notification);

    await Promise.all([first.processDue(), second.processDue()]);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(
      updateMany.mock.calls.filter(([input]) => input.data.notificationStatus === 'sending'),
    ).toHaveLength(2);
  });

  it('binds the sent update to the exact lease so a stale worker cannot overwrite a reclaimed attempt', async () => {
    const notify = jest.fn().mockResolvedValue(true);
    const { processor, updateMany } = setup(notify);

    await processor.processDue();

    const claim = updateMany.mock.calls.find(
      ([input]) => input.data.notificationStatus === InquiryNotificationStatus.sending,
    )?.[0];
    const sent = updateMany.mock.calls.find(
      ([input]) => input.data.notificationStatus === InquiryNotificationStatus.sent,
    )?.[0];
    expect(claim?.data.notificationLeaseUntil).toBeInstanceOf(Date);
    expect(claim?.data.notificationStateVersion).toEqual({ increment: 1 });
    expect(sent?.data.notificationStateVersion).toEqual({ increment: 1 });
    expect(sent?.where).toEqual(
      expect.objectContaining({
        submissionId,
        notificationStatus: InquiryNotificationStatus.sending,
        notificationLeaseUntil: claim?.data.notificationLeaseUntil,
      }),
    );
  });

  it('uses a fresh lease for each slow serial delivery so another instance does not mark a later item unknown', async () => {
    jest.useFakeTimers();
    const startedAt = new Date('2026-08-15T00:00:00.000Z');
    jest.setSystemTime(startedAt);
    const secondSubmissionId = 'b35ec264-3272-4599-86e0-af47b0ef74f8';
    const states = new Map<string, { status: InquiryNotificationStatus; leaseUntil: Date | null }>([
      [
        submissionId,
        { status: InquiryNotificationStatus.pending, leaseUntil: null as Date | null },
      ],
      [
        secondSubmissionId,
        { status: InquiryNotificationStatus.pending, leaseUntil: null as Date | null },
      ],
    ]);
    const reclaimed: string[] = [];
    const claims: Array<{ submissionId: string; leaseUntil: Date }> = [];
    const updateMany = jest.fn(async ({ where, data }) => {
      if (
        !where.submissionId &&
        where.notificationStatus === InquiryNotificationStatus.sending &&
        where.notificationLeaseUntil?.lte
      ) {
        let count = 0;
        const cutoff = where.notificationLeaseUntil.lte as Date;
        states.forEach((state, id) => {
          if (
            state.status === InquiryNotificationStatus.sending &&
            state.leaseUntil &&
            state.leaseUntil <= cutoff
          ) {
            state.status = InquiryNotificationStatus.unknown;
            state.leaseUntil = null;
            reclaimed.push(id);
            count += 1;
          }
        });
        return { count };
      }

      const id = where.submissionId as string;
      const state = states.get(id);
      if (!state) return { count: 0 };
      if (data.notificationStatus === InquiryNotificationStatus.sending) {
        if (state.status !== InquiryNotificationStatus.pending) return { count: 0 };
        state.status = InquiryNotificationStatus.sending;
        state.leaseUntil = data.notificationLeaseUntil as Date;
        claims.push({ submissionId: id, leaseUntil: state.leaseUntil });
        return { count: 1 };
      }
      if (data.notificationStatus === InquiryNotificationStatus.sent) {
        const hasLease =
          state.leaseUntil?.getTime() ===
          (where.notificationLeaseUntil as Date | undefined)?.getTime();
        if (state.status !== InquiryNotificationStatus.sending || !hasLease) return { count: 0 };
        state.status = InquiryNotificationStatus.sent;
        state.leaseUntil = null;
        return { count: 1 };
      }
      return { count: 1 };
    });
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([{ submissionId }, { submissionId: secondSubmissionId }])
      .mockResolvedValueOnce([]);
    const findUnique = jest.fn(({ where }) =>
      Promise.resolve({ ...inquiry, submissionId: where.submissionId }),
    );
    const prisma = {
      customRequirement: { updateMany, findMany, findUnique },
    } as unknown as PrismaService;
    const workers: { second?: InquiryNotificationProcessor } = {};
    let deliveryIndex = 0;
    const notify = jest.fn(async () => {
      deliveryIndex += 1;
      if (deliveryIndex === 1) {
        jest.setSystemTime(new Date(startedAt.getTime() + 10_000));
      } else {
        jest.setSystemTime(new Date(startedAt.getTime() + 16_000));
        if (!workers.second) throw new Error('Second notification worker is not ready');
        await workers.second.processDue();
      }
      return true;
    });
    const notification = { notifyNewInquiry: notify } as unknown as InquiryNotificationService;
    const first = new InquiryNotificationProcessor(prisma, notification);
    workers.second = new InquiryNotificationProcessor(prisma, notification);

    await first.processDue();

    expect(claims).toEqual([
      { submissionId, leaseUntil: new Date(startedAt.getTime() + 15_000) },
      {
        submissionId: secondSubmissionId,
        leaseUntil: new Date(startedAt.getTime() + 25_000),
      },
    ]);
    expect(reclaimed).toEqual([]);
    expect(states.get(secondSubmissionId)?.status).toBe(InquiryNotificationStatus.sent);
    expect(notify).toHaveBeenCalledTimes(2);
  });

  it('backs off and retries only an explicit retryable HTTP failure', async () => {
    const notify = jest
      .fn()
      .mockRejectedValue(
        new InquiryNotificationDeliveryError(
          'Feishu inquiry notification returned HTTP 500',
          'retryable_failure',
        ),
      );
    const { processor, updateMany } = setup(notify);

    await processor.processDue();

    const claim = updateMany.mock.calls.find(
      ([input]) => input.data.notificationStatus === InquiryNotificationStatus.sending,
    )?.[0];
    const failed = updateMany.mock.calls.find(
      ([input]) => input.data.notificationStatus === InquiryNotificationStatus.failed,
    )?.[0];
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationStatus: 'failed',
          notificationStateVersion: { increment: 1 },
          notificationNextAttemptAt: expect.any(Date),
        }),
      }),
    );
    expect(failed?.where.notificationLeaseUntil).toBe(claim?.data.notificationLeaseUntil);
  });

  it('stops scheduling retries after the finite attempt limit', async () => {
    const notify = jest
      .fn()
      .mockRejectedValue(
        new InquiryNotificationDeliveryError(
          'Feishu inquiry notification returned HTTP 500',
          'retryable_failure',
        ),
      );
    const { processor, updateMany, findUnique } = setup(notify);
    findUnique.mockResolvedValueOnce({ ...inquiry, notificationAttemptCount: 3 });

    await processor.processDue();

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationStatus: 'failed',
          notificationNextAttemptAt: null,
        }),
      }),
    );
  });

  it('marks a network timeout unknown and does not schedule an automatic resend', async () => {
    const notify = jest
      .fn()
      .mockRejectedValue(
        new InquiryNotificationDeliveryError(
          'Feishu inquiry notification outcome is unknown after a network error or timeout',
          'unknown',
        ),
      );
    const { processor, updateMany, findMany } = setup(notify);

    await processor.processDue();
    findMany.mockResolvedValueOnce([]);
    await processor.processDue();

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationStatus: 'unknown',
          notificationStateVersion: { increment: 1 },
          notificationNextAttemptAt: null,
        }),
      }),
    );
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('marks an expired sending lease unknown before looking for due work', async () => {
    const notify = jest.fn();
    const { processor, updateMany } = setup(notify, 0, []);

    await processor.processDue();

    expect(updateMany.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({ notificationStatus: 'sending' }),
        data: expect.objectContaining({
          notificationStatus: 'unknown',
          notificationStateVersion: { increment: 1 },
          notificationNextAttemptAt: null,
        }),
      }),
    );
    expect(notify).not.toHaveBeenCalled();
  });

  it('claims pending rows even when their due time is null', async () => {
    const notify = jest.fn().mockResolvedValue(true);
    const { processor, findMany } = setup(notify);

    await processor.processDue();

    expect(findMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({
        OR: expect.arrayContaining([
          expect.objectContaining({
            notificationStatus: 'pending',
            OR: expect.arrayContaining([{ notificationNextAttemptAt: null }]),
          }),
        ]),
      }),
    );
  });
});
