import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CustomRequirementStatus,
  InquiryNotificationAuditAction,
  InquiryNotificationStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { buildPagination } from '@/common/utils/pagination';
import { ensureNotSpam, SpamThrottleState } from '@/common/utils/spam-throttle';
import { CreateLegacyCustomRequirementDto } from '@/modules/custom-requirement/dto/create-legacy-custom-requirement.dto';
import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';
import { CustomRequirementListQueryDto } from '@/modules/custom-requirement/dto/custom-requirement-list-query.dto';
import { ManageInquiryNotificationDto } from '@/modules/custom-requirement/dto/manage-inquiry-notification.dto';
import { InquiryNotificationProcessor } from '@/modules/custom-requirement/inquiry-notification.processor';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { PrismaService } from '@/prisma/prisma.service';

function normalizeEmpty(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeOptionalSource(value: unknown, maxLength: number) {
  return typeof value === 'string' ? normalizeEmpty(value)?.slice(0, maxLength) : undefined;
}

function isUniqueConstraintError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'P2002');
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const idempotencyReplaySelect = {
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
  preferredContact: true,
  locale: true,
  pagePath: true,
  pageTitle: true,
  pageType: true,
  productTag: true,
  sourceType: true,
  sourceDetail: true,
  landingPage: true,
  previousPage: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  discoverySource: true,
  sessionId: true,
  visitorId: true,
} as const;

const adminRequirementSelect = {
  id: true,
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
  preferredContact: true,
  locale: true,
  notificationStatus: true,
  notificationStateVersion: true,
  notificationLastError: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.CustomRequirementSelect;

function normalizeInquiry(dto: CreateCustomRequirementDto) {
  const phone = normalizeEmpty(dto.phone);
  const email = normalizeEmpty(dto.email)?.toLowerCase();

  if (!phone && !email) {
    throw new BadRequestException('Phone or email is required');
  }
  if (dto.locale === 'en' && !email) {
    throw new BadRequestException('Email is required for English inquiries');
  }
  if (
    (dto.preferredContact === 'phone' && !phone) ||
    (dto.preferredContact === 'email' && !email)
  ) {
    throw new BadRequestException('Preferred contact method is unavailable');
  }

  return {
    projectType: normalizeEmpty(dto.projectType),
    projectLocation: normalizeEmpty(dto.projectLocation),
    name: normalizeEmpty(dto.name),
    phone,
    email,
    company: normalizeEmpty(dto.company),
    industry: normalizeEmpty(dto.industry),
    process: normalizeEmpty(dto.process),
    temperature: normalizeEmpty(dto.temperature),
    requirement: normalizeEmpty(dto.requirement),
    preferredContact:
      dto.preferredContact ?? (phone && !email ? 'phone' : email && !phone ? 'email' : undefined),
    locale: dto.locale,
    pagePath: normalizeOptionalSource(dto.pagePath, 500),
    pageTitle: normalizeOptionalSource(dto.pageTitle, 255),
    pageType: normalizeOptionalSource(dto.pageType, 80),
    productTag: normalizeOptionalSource(dto.productTag, 120),
    sourceType: normalizeOptionalSource(dto.sourceType, 120),
    sourceDetail: normalizeOptionalSource(dto.sourceDetail, 120),
    landingPage: normalizeOptionalSource(dto.landingPage, 500),
    previousPage: normalizeOptionalSource(dto.previousPage, 500),
    utmSource: normalizeOptionalSource(dto.utmSource, 120),
    utmMedium: normalizeOptionalSource(dto.utmMedium, 120),
    utmCampaign: normalizeOptionalSource(dto.utmCampaign, 255),
    discoverySource: normalizeOptionalSource(dto.discoverySource, 120),
    sessionId: normalizeOptionalSource(dto.sessionId, 120),
    visitorId: normalizeOptionalSource(dto.visitorId, 120),
  };
}

type NormalizedInquiry = ReturnType<typeof normalizeInquiry>;
type ReplayInquiry = Prisma.CustomRequirementGetPayload<{
  select: typeof idempotencyReplaySelect;
}>;

function inquiryFingerprint(inquiry: NormalizedInquiry) {
  return JSON.stringify(inquiry);
}

function isSameInquiry(existing: ReplayInquiry, normalized: NormalizedInquiry) {
  return (Object.keys(normalized) as Array<keyof NormalizedInquiry>).every((key) => {
    const existingValue = key === 'phone' && existing.phone === '' ? undefined : existing[key];
    return (existingValue ?? undefined) === normalized[key];
  });
}

function replayOrConflict(existing: ReplayInquiry, normalized: NormalizedInquiry) {
  if (!isSameInquiry(existing, normalized)) {
    throw new ConflictException('Idempotency key was already used for a different inquiry payload');
  }
  if (!existing.submissionId) {
    throw new ConflictException('Idempotent inquiry exists without a submission id');
  }
  return { submissionId: existing.submissionId };
}

function sourceSnapshot(normalized: NormalizedInquiry) {
  return {
    pagePath: normalized.pagePath,
    pageTitle: normalized.pageTitle,
    pageType: normalized.pageType,
    productTag: normalized.productTag,
    sourceType: normalized.sourceType,
    sourceDetail: normalized.sourceDetail,
    landingPage: normalized.landingPage,
    previousPage: normalized.previousPage,
    utmSource: normalized.utmSource,
    utmMedium: normalized.utmMedium,
    utmCampaign: normalized.utmCampaign,
    discoverySource: normalized.discoverySource,
    sessionId: normalized.sessionId,
    visitorId: normalized.visitorId,
  };
}

function manualNotificationTransition(
  current: InquiryNotificationStatus,
  action: InquiryNotificationAuditAction,
) {
  if (
    action === InquiryNotificationAuditAction.requeue_failed &&
    current === InquiryNotificationStatus.failed
  ) {
    return InquiryNotificationStatus.pending;
  }
  if (
    action === InquiryNotificationAuditAction.confirm_unknown_delivered &&
    current === InquiryNotificationStatus.unknown
  ) {
    return InquiryNotificationStatus.sent;
  }
  if (
    action === InquiryNotificationAuditAction.confirm_unknown_not_delivered_and_requeue &&
    current === InquiryNotificationStatus.unknown
  ) {
    return InquiryNotificationStatus.pending;
  }
  throw new ConflictException(
    `Notification action ${action} is not allowed from status ${current}`,
  );
}

@Injectable()
export class CustomRequirementService {
  private readonly spamMap = new Map<string, SpamThrottleState>();
  private readonly inFlightSubmissions = new Map<
    string,
    { fingerprint: string; submission: Promise<{ submissionId: string }> }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationProcessor: InquiryNotificationProcessor,
  ) {}

  async createLegacyPublic(dto: CreateLegacyCustomRequirementDto, clientKey: string) {
    ensureNotSpam(clientKey, this.spamMap);
    const submissionId = randomUUID();
    await this.prisma.customRequirement.create({
      data: {
        submissionId,
        name: normalizeEmpty(dto.name),
        phone: dto.phone.trim(),
        company: normalizeEmpty(dto.company),
        industry: normalizeEmpty(dto.industry),
        process: normalizeEmpty(dto.process),
        temperature: normalizeEmpty(dto.temperature),
        requirement: normalizeEmpty(dto.requirement),
        notificationStatus: InquiryNotificationStatus.pending,
        notificationNextAttemptAt: new Date(),
        status: CustomRequirementStatus.pending,
      },
    });
    // V1 pages already emit form_submit through /v1/lead-events after success.
    // Do not create another event here or cached clients will double-count the submission.
    this.notificationProcessor.kick();
    return { submissionId };
  }

  async createPublic(dto: CreateCustomRequirementDto, clientKey: string) {
    const idempotencyKey = normalizeEmpty(dto.idempotencyKey);
    const normalized = normalizeInquiry(dto);
    const fingerprint = inquiryFingerprint(normalized);

    if (idempotencyKey) {
      const existing = await this.prisma.customRequirement.findUnique({
        where: { clientIdempotencyKey: idempotencyKey },
        select: idempotencyReplaySelect,
      });
      if (existing) return replayOrConflict(existing, normalized);

      const inFlight = this.inFlightSubmissions.get(idempotencyKey);
      if (inFlight) {
        if (inFlight.fingerprint !== fingerprint) {
          throw new ConflictException(
            'Idempotency key was already used for a different inquiry payload',
          );
        }
        return inFlight.submission;
      }

      const submission = this.createPublicOnce(normalized, clientKey, idempotencyKey);
      this.inFlightSubmissions.set(idempotencyKey, { fingerprint, submission });
      const clearInFlight = () => {
        if (this.inFlightSubmissions.get(idempotencyKey)?.submission === submission) {
          this.inFlightSubmissions.delete(idempotencyKey);
        }
      };
      void submission.then(clearInFlight, clearInFlight);
      return submission;
    }

    return this.createPublicOnce(normalized, clientKey);
  }

  private async createPublicOnce(
    normalized: NormalizedInquiry,
    clientKey: string,
    idempotencyKey?: string,
  ) {
    ensureNotSpam(clientKey, this.spamMap);
    const submissionId = randomUUID();
    const snapshot = sourceSnapshot(normalized);

    try {
      await this.prisma.$transaction(async (transaction) => {
        await transaction.customRequirement.create({
          data: {
            submissionId,
            clientIdempotencyKey: idempotencyKey,
            ...normalized,
            // The legacy Prisma model requires a non-null string. An empty value represents
            // a deliberately absent phone for an email-only V2 submission.
            phone: normalized.phone ?? '',
            notificationStatus: InquiryNotificationStatus.pending,
            notificationNextAttemptAt: new Date(),
            status: CustomRequirementStatus.pending,
          },
        });

        await transaction.websiteLeadEvent.create({
          data: {
            submissionId,
            eventType: 'form_submit',
            ...snapshot,
          },
        });
      });
    } catch (error) {
      if (idempotencyKey && isUniqueConstraintError(error)) {
        const existing = await this.prisma.customRequirement.findUnique({
          where: { clientIdempotencyKey: idempotencyKey },
          select: idempotencyReplaySelect,
        });
        if (existing) return replayOrConflict(existing, normalized);
      }
      throw error;
    }

    this.notificationProcessor.kick();
    return { submissionId };
  }

  async getAdminList(query: CustomRequirementListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.CustomRequirementWhereInput = {
      status: query.status,
      ...(query.keyword
        ? {
            OR: [
              ...(isUuid(query.keyword) ? [{ submissionId: { equals: query.keyword } }] : []),
              { projectType: { contains: query.keyword, mode: 'insensitive' } },
              { projectLocation: { contains: query.keyword, mode: 'insensitive' } },
              { name: { contains: query.keyword, mode: 'insensitive' } },
              { phone: { contains: query.keyword, mode: 'insensitive' } },
              { email: { contains: query.keyword, mode: 'insensitive' } },
              { company: { contains: query.keyword, mode: 'insensitive' } },
              { industry: { contains: query.keyword, mode: 'insensitive' } },
              { process: { contains: query.keyword, mode: 'insensitive' } },
              { temperature: { contains: query.keyword, mode: 'insensitive' } },
              { requirement: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customRequirement.findMany({
        where,
        skip,
        take,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        select: adminRequirementSelect,
      }),
      this.prisma.customRequirement.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.customRequirement.findUnique({
      where: { id },
      select: adminRequirementSelect,
    });
    if (!record) throw new NotFoundException('Custom requirement not found');
    return record;
  }

  async markFollowed(id: number) {
    await this.findOne(id);
    return this.prisma.customRequirement.update({
      where: { id },
      data: { status: CustomRequirementStatus.followed },
      select: adminRequirementSelect,
    });
  }

  async manageNotification(
    id: number,
    dto: ManageInquiryNotificationDto,
    operator: AuthenticatedUser,
  ) {
    const note = dto.note.trim();
    if (!note) throw new BadRequestException('Operator note is required');
    const result = await this.prisma.$transaction(async (transaction) => {
      const inquiry = await transaction.customRequirement.findUnique({
        where: { id },
        select: {
          id: true,
          submissionId: true,
          notificationStatus: true,
          notificationStateVersion: true,
          notificationAttemptCount: true,
          notificationLastError: true,
        },
      });
      if (!inquiry) throw new NotFoundException('Custom requirement not found');
      if (!inquiry.submissionId) {
        throw new ConflictException('Inquiry has no submission id');
      }
      if (inquiry.notificationStateVersion !== dto.expectedStateVersion) {
        throw new ConflictException('Inquiry notification changed; refresh and retry');
      }

      const nextStatus = manualNotificationTransition(inquiry.notificationStatus, dto.action);
      const startsNewRetryCycle = nextStatus === InquiryNotificationStatus.pending;
      const now = new Date();
      const updated = await transaction.customRequirement.updateMany({
        where: {
          id,
          notificationStatus: inquiry.notificationStatus,
          notificationStateVersion: dto.expectedStateVersion,
        },
        data: {
          notificationStatus: nextStatus,
          notificationStateVersion: { increment: 1 },
          notificationAttemptCount: startsNewRetryCycle ? 0 : undefined,
          notificationLeaseUntil: null,
          notificationNextAttemptAt: startsNewRetryCycle ? now : null,
          notificationLastError: null,
        },
      });
      if (updated.count !== 1) {
        throw new ConflictException('Inquiry notification status changed; refresh and retry');
      }

      await transaction.inquiryNotificationAudit.create({
        data: {
          customRequirementId: inquiry.id,
          submissionId: inquiry.submissionId,
          operatorAdminUserId: operator.id,
          operatorUsername: operator.username,
          operatorRole: operator.role,
          action: dto.action,
          previousStatus: inquiry.notificationStatus,
          nextStatus,
          previousError: inquiry.notificationLastError,
          attemptCount: inquiry.notificationAttemptCount,
          note,
        },
      });

      return {
        id: inquiry.id,
        submissionId: inquiry.submissionId,
        notificationStatus: nextStatus,
        notificationStateVersion: dto.expectedStateVersion + 1,
        action: dto.action,
      };
    });
    if (result.notificationStatus === InquiryNotificationStatus.pending) {
      this.notificationProcessor.kick();
    }
    return result;
  }

  async getNotificationAudits(id: number) {
    await this.findOne(id);
    return this.prisma.inquiryNotificationAudit.findMany({
      where: { customRequirementId: id },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
      select: {
        id: true,
        operatorUsername: true,
        operatorRole: true,
        action: true,
        previousStatus: true,
        nextStatus: true,
        previousError: true,
        attemptCount: true,
        note: true,
        createdAt: true,
      },
    });
  }

  getPendingCount() {
    return this.prisma.customRequirement.count({
      where: { status: CustomRequirementStatus.pending },
    });
  }
}
