import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InquiryNotificationStatus, Prisma } from '@prisma/client';

import {
  InquiryNotificationDeliveryError,
  InquiryNotificationService,
} from '@/modules/custom-requirement/inquiry-notification.service';
import { PrismaService } from '@/prisma/prisma.service';

const POLL_INTERVAL_MS = 15_000;
const DELIVERY_LEASE_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = [30_000, 5 * 60_000] as const;
const BATCH_SIZE = 10;

function errorSummary(error: unknown) {
  const message = error instanceof Error ? error.message : 'Feishu inquiry notification failed';
  return message.replace(/\s+/g, ' ').trim().slice(0, 500);
}

@Injectable()
export class InquiryNotificationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InquiryNotificationProcessor.name);
  private timer?: ReturnType<typeof setInterval>;
  private immediate?: ReturnType<typeof setImmediate>;
  private activeRun?: Promise<void>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: InquiryNotificationService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => this.runScheduled(), POLL_INTERVAL_MS);
    this.timer.unref();
    this.kick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.immediate) clearImmediate(this.immediate);
  }

  kick() {
    if (this.immediate) return;
    this.immediate = setImmediate(() => {
      this.immediate = undefined;
      this.runScheduled();
    });
    this.immediate.unref();
  }

  processDue() {
    if (this.activeRun) return this.activeRun;
    this.activeRun = this.processBatch().finally(() => {
      this.activeRun = undefined;
    });
    return this.activeRun;
  }

  private runScheduled() {
    void this.processDue().catch((error) => {
      this.logger.error(`Inquiry notification processor failed: ${errorSummary(error)}`);
    });
  }

  private async processBatch() {
    const batchStartedAt = new Date();
    await this.prisma.customRequirement.updateMany({
      where: {
        notificationStatus: InquiryNotificationStatus.sending,
        notificationLeaseUntil: { lte: batchStartedAt },
      },
      data: {
        notificationStatus: InquiryNotificationStatus.unknown,
        notificationStateVersion: { increment: 1 },
        notificationLeaseUntil: null,
        notificationNextAttemptAt: null,
        notificationLastError:
          'Notification worker lease expired after delivery began; delivery outcome is unknown',
      },
    });

    const candidates = await this.prisma.customRequirement.findMany({
      where: this.dueWhere(batchStartedAt),
      orderBy: [{ notificationNextAttemptAt: 'asc' }, { createdAt: 'asc' }],
      take: BATCH_SIZE,
      select: { submissionId: true },
    });

    for (const candidate of candidates) {
      if (candidate.submissionId) await this.deliver(candidate.submissionId);
    }
  }

  private dueWhere(now: Date): Prisma.CustomRequirementWhereInput {
    return {
      OR: [
        {
          notificationStatus: InquiryNotificationStatus.pending,
          OR: [{ notificationNextAttemptAt: null }, { notificationNextAttemptAt: { lte: now } }],
        },
        {
          notificationStatus: InquiryNotificationStatus.failed,
          notificationAttemptCount: { lt: MAX_ATTEMPTS },
          notificationNextAttemptAt: { lte: now },
        },
      ],
    };
  }

  private async deliver(submissionId: string) {
    const claimedAt = new Date();
    const leaseUntil = new Date(claimedAt.getTime() + DELIVERY_LEASE_MS);
    const claimed = await this.prisma.customRequirement.updateMany({
      where: { submissionId, ...this.dueWhere(claimedAt) },
      data: {
        notificationStatus: InquiryNotificationStatus.sending,
        notificationStateVersion: { increment: 1 },
        notificationAttemptCount: { increment: 1 },
        notificationLeaseUntil: leaseUntil,
        notificationLastError: null,
      },
    });
    if (claimed.count !== 1) return;

    const inquiry = await this.prisma.customRequirement.findUnique({
      where: { submissionId },
      select: {
        submissionId: true,
        projectType: true,
        projectLocation: true,
        name: true,
        phone: true,
        email: true,
        company: true,
        industry: true,
        process: true,
        temperature: true,
        requirement: true,
        sourceType: true,
        sourceDetail: true,
        createdAt: true,
        notificationAttemptCount: true,
      },
    });
    if (!inquiry) return;

    try {
      const delivered = await this.notification.notifyNewInquiry(inquiry);
      if (!delivered) {
        throw new InquiryNotificationDeliveryError(
          'Feishu inquiry webhook is not configured',
          'permanent_failure',
        );
      }
      await this.prisma.customRequirement.updateMany({
        where: {
          submissionId,
          notificationStatus: InquiryNotificationStatus.sending,
          notificationLeaseUntil: leaseUntil,
        },
        data: {
          notificationStatus: InquiryNotificationStatus.sent,
          notificationStateVersion: { increment: 1 },
          notificationLeaseUntil: null,
          notificationNextAttemptAt: null,
          notificationLastError: null,
          notificationSentAt: new Date(),
        },
      });
    } catch (error) {
      await this.recordFailure(submissionId, inquiry.notificationAttemptCount, leaseUntil, error);
    }
  }

  private async recordFailure(
    submissionId: string,
    attemptCount: number,
    leaseUntil: Date,
    error: unknown,
  ) {
    const kind =
      error instanceof InquiryNotificationDeliveryError ? error.kind : ('unknown' as const);
    const retryDelay =
      kind === 'retryable_failure' && attemptCount < MAX_ATTEMPTS
        ? RETRY_BACKOFF_MS[Math.min(attemptCount - 1, RETRY_BACKOFF_MS.length - 1)]
        : undefined;
    const status =
      kind === 'unknown' ? InquiryNotificationStatus.unknown : InquiryNotificationStatus.failed;

    await this.prisma.customRequirement.updateMany({
      where: {
        submissionId,
        notificationStatus: InquiryNotificationStatus.sending,
        notificationLeaseUntil: leaseUntil,
      },
      data: {
        notificationStatus: status,
        notificationStateVersion: { increment: 1 },
        notificationLeaseUntil: null,
        notificationNextAttemptAt: retryDelay ? new Date(Date.now() + retryDelay) : null,
        notificationLastError: errorSummary(error),
      },
    });
    this.logger.error(`${submissionId}: ${errorSummary(error)}`);
  }
}
