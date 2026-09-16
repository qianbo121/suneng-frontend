import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  AdminRole,
  CustomRequirementStatus,
  InquiryNotificationAuditAction,
  InquiryNotificationStatus,
} from '@prisma/client';

import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { InquiryNotificationProcessor } from '@/modules/custom-requirement/inquiry-notification.processor';
import { PrismaService } from '@/prisma/prisma.service';
import { WorkpieceRouterService } from '@/modules/workpiece-router/workpiece-router.service';

describe('CustomRequirementService', () => {
  const createDto = (overrides: Partial<CreateCustomRequirementDto> = {}) => ({
    idempotencyKey: 'd44c8f4f-4e88-4a8c-b109-c7c75ac676b2',
    projectType: '台车式热处理炉',
    projectLocation: '江苏常州',
    name: '张经理',
    phone: '13000000000',
    company: '苏能客户公司',
    requirement: '需要处理大型焊接件',
    locale: 'zh' as const,
    pagePath: '/zh/contact',
    sourceType: 'organic_search',
    deviceType: 'PC' as const,
    ...overrides,
  });

  const replayRecord = (overrides: Record<string, unknown> = {}) => ({
    submissionId: '52d8d7ae-a6ce-47cf-a2dd-95d065d06f7e',
    projectType: '台车式热处理炉',
    projectLocation: '江苏常州',
    name: '张经理',
    phone: '13000000000',
    email: null,
    company: '苏能客户公司',
    industry: null,
    process: null,
    temperature: null,
    requirement: '需要处理大型焊接件',
    preferredContact: 'phone',
    locale: 'zh',
    pagePath: '/zh/contact',
    pageTitle: null,
    pageType: null,
    productTag: null,
    sourceType: 'organic_search',
    sourceDetail: null,
    landingPage: null,
    previousPage: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    discoverySource: null,
    sessionId: null,
    visitorId: null,
    ...overrides,
  });

  const setup = () => {
    const createInquiry = jest.fn().mockResolvedValue({ id: 1 });
    const createEvent = jest.fn().mockResolvedValue({ id: 8 });
    const findUnique = jest.fn().mockResolvedValue(null);
    const transactionClient = {
      customRequirement: { create: createInquiry },
      websiteLeadEvent: { create: createEvent },
    };
    const transaction = jest.fn((callback) => callback(transactionClient));
    const prisma = {
      customRequirement: { findUnique },
      $transaction: transaction,
    } as unknown as PrismaService;
    const processor = { kick: jest.fn() } as unknown as InquiryNotificationProcessor;
    const service = new CustomRequirementService(prisma, processor, new WorkpieceRouterService());

    return {
      service,
      processor,
      findUnique,
      transaction,
      createInquiry,
      createEvent,
    };
  };

  const setupManualNotification = (
    notificationStatus: InquiryNotificationStatus,
    updateCount = 1,
    notificationStateVersion = 4,
  ) => {
    const inquiry = {
      id: 41,
      submissionId: '52d8d7ae-a6ce-47cf-a2dd-95d065d06f7e',
      notificationStatus,
      notificationStateVersion,
      notificationAttemptCount: 3,
      notificationLastError: 'Feishu returned HTTP 500',
    };
    const findUnique = jest.fn().mockResolvedValue(inquiry);
    const updateMany = jest.fn().mockResolvedValue({ count: updateCount });
    const createAudit = jest.fn().mockResolvedValue({ id: 1 });
    const transactionClient = {
      customRequirement: { findUnique, updateMany },
      inquiryNotificationAudit: { create: createAudit },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(transactionClient)),
    } as unknown as PrismaService;
    const processor = { kick: jest.fn() } as unknown as InquiryNotificationProcessor;
    const service = new CustomRequirementService(prisma, processor, new WorkpieceRouterService());
    const operator = {
      id: 7,
      username: 'reviewer',
      role: AdminRole.editor,
      isActive: true,
    };
    return { service, processor, operator, findUnique, updateMany, createAudit };
  };

  afterEach(() => jest.restoreAllMocks());

  it('accepts the minimum legacy V1 payload and records form_submit on the server', async () => {
    const { service, processor, transaction, createInquiry, createEvent } = setup();

    const result = await service.createLegacyPublic(
      { phone: ' 13000000000 ' },
      'legacy-client',
      '114.252.10.20',
      'PC',
    );

    expect(createInquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        submissionId: expect.any(String),
        phone: '13000000000',
        notificationStatus: InquiryNotificationStatus.pending,
        notificationNextAttemptAt: expect.any(Date),
      }),
    });
    expect(result).toEqual({
      submissionId: createInquiry.mock.calls[0][0].data.submissionId,
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledWith({
      data: expect.objectContaining({
        submissionId: createInquiry.mock.calls[0][0].data.submissionId,
        eventType: 'form_submit',
        deviceType: 'PC',
        province: expect.stringContaining('北京'),
        regionSource: 'exact_ip',
      }),
    });
    expect(processor.kick).toHaveBeenCalledTimes(1);
  });

  it('creates the inquiry and form-submit event in one transaction, then only returns submissionId', async () => {
    const { service, processor, createInquiry, createEvent } = setup();

    const result = await service.createPublic(
      createDto({
        phone: ' 13000000000 ',
        sourceDetail: 'google',
        utmCampaign: 'summer-furnace',
      }),
      'client-1',
    );

    const inquiryData = createInquiry.mock.calls[0][0].data;
    const eventData = createEvent.mock.calls[0][0].data;
    expect(inquiryData.submissionId).toEqual(expect.any(String));
    expect(inquiryData.clientIdempotencyKey).toBe(createDto().idempotencyKey);
    expect(eventData.submissionId).toBe(inquiryData.submissionId);
    expect(eventData).toEqual(
      expect.objectContaining({
        eventType: 'form_submit',
        pagePath: '/zh/contact',
        sourceType: 'organic_search',
        sourceDetail: 'google',
        deviceType: 'PC',
        utmCampaign: 'summer-furnace',
      }),
    );
    expect(result).toEqual({ submissionId: inquiryData.submissionId });
    expect(Object.keys(result)).toEqual(['submissionId']);
    expect(processor.kick).toHaveBeenCalledTimes(1);
  });

  it('stores the four-field homepage form without inventing company or location values', async () => {
    const { service, createInquiry, createEvent } = setup();

    await service.createPublic(
      createDto({
        formVariant: 'homepage_minimal',
        projectType: '现有设备改造或维修',
        requirement: '炉温不均，想先判断改造还是换新',
        identity: '示例制造公司 / 王工',
        contact: 'buyer@example.com',
        projectLocation: undefined,
        name: undefined,
        company: undefined,
        phone: undefined,
        email: undefined,
        pagePath: '/zh',
      }),
      'homepage-client',
    );

    expect(createInquiry.mock.calls[0][0].data).toEqual(
      expect.objectContaining({
        projectType: '现有设备改造或维修',
        projectLocation: undefined,
        name: '示例制造公司 / 王工',
        company: undefined,
        phone: '',
        email: 'buyer@example.com',
        requirement: '炉温不均，想先判断改造还是换新',
      }),
    );
    expect(createEvent.mock.calls[0][0].data).toEqual(
      expect.objectContaining({ eventType: 'form_submit', pagePath: '/zh' }),
    );
  });

  it('stores an optional project location supplied by a minimal product inquiry', async () => {
    const { service, createInquiry } = setup();

    await service.createPublic(
      createDto({
        formVariant: 'homepage_minimal',
        projectType: '金属带材连续退火 / 固溶生产线',
        projectLocation: '江苏泰州 / 越南',
        requirement: '需要先做选型初判',
        identity: '王工',
        contact: 'wechat_name-2026',
        name: undefined,
        company: undefined,
        phone: undefined,
        email: undefined,
      }),
      'product-page-client',
    );

    expect(createInquiry.mock.calls[0][0].data).toEqual(
      expect.objectContaining({
        projectLocation: '江苏泰州 / 越南',
        name: '王工',
        phone: 'wechat_name-2026',
      }),
    );
  });

  it('recomputes and stores workpiece context with the inquiry in the same transaction', async () => {
    const { service, createInquiry, createEvent } = setup();

    await service.createPublic(
      createDto({
        formVariant: 'homepage_minimal',
        projectType: '单体工业炉新建',
        requirement: '大型焊接机架去应力处理',
        identity: '示例公司 / 王工',
        contact: 'buyer@example.com',
        projectLocation: undefined,
        name: undefined,
        company: undefined,
        phone: undefined,
        email: undefined,
        pagePath: '/zh',
        sessionId: 'session-workpiece-1',
        workpieceContext: {
          categoryId: 'welded-structures',
          workpieceId: 'large-welded-machine-frame',
          processPurposeId: 'stress-relief',
          rawConditions: {
            batchLoadWeightKg: 8000,
            loadCapacityCompatible: true,
            furnaceName: '客户端伪造炉型',
            phone: '13000000000',
          } as never,
        },
      }),
      'homepage-workpiece-client',
    );

    expect(createInquiry.mock.calls[0][0].data.workpieceSelection.create).toEqual(
      expect.objectContaining({
        sessionId: 'session-workpiece-1',
        categoryId: 'welded-structures',
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'stress-relief',
        rawConditionsJson: { batchLoadWeightKg: 8000 },
        displayState: expect.any(String),
        publicDirectionIdsJson: [],
        ruleVersion: 'workpiece-router-resolver-2.3.0',
      }),
    );
    expect(createEvent.mock.calls[0][0].data).not.toHaveProperty('properties');
  });

  it('stores the customer search term when no workpiece matches', async () => {
    const { service, createInquiry } = setup();

    await service.createPublic(
      createDto({
        formVariant: 'homepage_minimal',
        projectType: '单体工业炉新建',
        requirement: '需要工程师判断未收录工件',
        identity: '示例公司 / 李工',
        contact: 'buyer@example.com',
        projectLocation: undefined,
        name: undefined,
        company: undefined,
        phone: undefined,
        email: undefined,
        pagePath: '/zh',
        workpieceContext: {
          categoryId: 'welded-structures',
          searchTerm: '异形火星零件',
        },
      }),
      'homepage-no-match-client',
    );

    expect(createInquiry.mock.calls[0][0].data.workpieceSelection.create).toEqual(
      expect.objectContaining({
        categoryId: 'welded-structures',
        searchTerm: '异形火星零件',
        displayState: 'search_no_match',
        publicDirectionIdsJson: [],
      }),
    );
    expect(
      createInquiry.mock.calls[0][0].data.workpieceSelection.create.workpieceId,
    ).toBeUndefined();
  });

  it.each([
    [
      'unknown category',
      {
        categoryId: 'not-a-category',
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'stress-relief',
        rawConditions: {},
      },
    ],
    [
      'workpiece in the wrong category',
      {
        categoryId: 'gas-cylinders',
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'stress-relief',
        rawConditions: {},
      },
    ],
    [
      'invalid purpose pair',
      {
        categoryId: 'welded-structures',
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'not-a-purpose',
        rawConditions: {},
      },
    ],
  ])('rejects %s before opening a database transaction', async (_label, workpieceContext) => {
    const { service, transaction } = setup();

    await expect(
      service.createPublic(
        createDto({ workpieceContext: workpieceContext as never }),
        'invalid-workpiece-client',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('does not leave follow-up work after any step in the transaction fails', async () => {
    const createInquiry = jest.fn().mockResolvedValue({ id: 1 });
    const createEvent = jest.fn().mockRejectedValue(new Error('event insert failed'));
    const transactionClient = {
      customRequirement: { create: createInquiry },
      websiteLeadEvent: { create: createEvent },
    };
    const prisma = {
      customRequirement: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((callback) => callback(transactionClient)),
    } as unknown as PrismaService;
    const processor = { kick: jest.fn() } as unknown as InquiryNotificationProcessor;
    const service = new CustomRequirementService(prisma, processor, new WorkpieceRouterService());

    await expect(
      service.createPublic(
        createDto({
          workpieceContext: {
            categoryId: 'welded-structures',
            workpieceId: 'large-welded-machine-frame',
            processPurposeId: 'stress-relief',
            rawConditions: { batchLoadWeightKg: 'unknown' },
          },
        }),
        'transaction-failure-client',
      ),
    ).rejects.toThrow('event insert failed');
    expect(createInquiry).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('returns an existing submission before spam throttling and creates no duplicate work', async () => {
    const { service, processor, findUnique, transaction } = setup();
    findUnique.mockResolvedValue(replayRecord());

    const first = await service.createPublic(createDto(), 'same-client');
    const second = await service.createPublic(createDto(), 'same-client');

    expect(first).toEqual(second);
    expect(transaction).not.toHaveBeenCalled();
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('normalizes whitespace and email case before accepting an exact replay', async () => {
    const { service, findUnique, transaction } = setup();
    findUnique.mockResolvedValue(
      replayRecord({ phone: '', email: 'sales@example.com', preferredContact: 'email' }),
    );

    await expect(
      service.createPublic(
        createDto({
          projectType: '  台车式热处理炉  ',
          name: ' 张经理 ',
          phone: undefined,
          email: ' SALES@EXAMPLE.COM ',
        }),
        'same-client',
      ),
    ).resolves.toEqual({ submissionId: replayRecord().submissionId });
    expect(transaction).not.toHaveBeenCalled();
  });

  it.each([
    ['email', { email: 'new@example.com' }],
    ['requirement', { requirement: '改成需要一台井式炉' }],
    ['source snapshot', { sourceDetail: 'bing' }],
  ])('returns HTTP 409 when an existing key is reused with changed %s', async (_, change) => {
    const { service, processor, findUnique, transaction } = setup();
    findUnique.mockResolvedValue(replayRecord());

    const error = await service
      .createPublic(createDto(change), 'same-client')
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getStatus()).toBe(409);
    expect((error as Error).message).toBe(
      'Idempotency key was already used for a different inquiry payload',
    );
    expect(transaction).not.toHaveBeenCalled();
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('coalesces concurrent requests with one client idempotency key', async () => {
    const { service, processor, transaction, createInquiry, createEvent } = setup();

    const [first, second] = await Promise.all([
      service.createPublic(createDto(), 'concurrent-client'),
      service.createPublic(createDto(), 'concurrent-client'),
    ]);

    expect(first).toEqual(second);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(createInquiry).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(processor.kick).toHaveBeenCalledTimes(1);
  });

  it('rejects a changed payload while the same idempotency key is still in flight', async () => {
    const { service, transaction } = setup();
    let releaseTransaction!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseTransaction = resolve;
    });
    const originalTransaction = transaction.getMockImplementation();
    transaction.mockImplementation(async (callback) => {
      await gate;
      return originalTransaction?.(callback);
    });

    const first = service.createPublic(createDto(), 'concurrent-client');
    await new Promise<void>((resolve) => setImmediate(resolve));
    let conflict: unknown;
    try {
      conflict = await service
        .createPublic(createDto({ requirement: '并发时修改后的需求' }), 'concurrent-client')
        .catch((error: unknown) => error);
    } finally {
      releaseTransaction();
    }
    expect(conflict).toMatchObject({
      status: 409,
      message: 'Idempotency key was already used for a different inquiry payload',
    });
    await expect(first).resolves.toEqual({ submissionId: expect.any(String) });
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('returns without waiting for a slow background notification', async () => {
    const { service, processor } = setup();
    const slowNotification = jest.fn(() => new Promise<boolean>(() => undefined));
    jest.spyOn(processor, 'kick').mockImplementation(() => {
      void slowNotification();
    });

    await expect(service.createPublic(createDto(), 'slow-client')).resolves.toEqual({
      submissionId: expect.any(String),
    });
    expect(slowNotification).toHaveBeenCalledTimes(1);
  });

  it('returns the winning submission after a cross-instance unique-key race', async () => {
    const { service, processor, findUnique, transaction } = setup();
    findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        replayRecord({ submissionId: '25910a32-b8b7-4497-920d-10a69c552b66' }),
      );
    transaction.mockRejectedValueOnce({ code: 'P2002' });

    await expect(service.createPublic(createDto(), 'race-client')).resolves.toEqual({
      submissionId: '25910a32-b8b7-4497-920d-10a69c552b66',
    });
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('returns HTTP 409 when a database race reveals a different payload for the key', async () => {
    const { service, processor, findUnique, transaction } = setup();
    findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(replayRecord({ requirement: '另一份已提交需求' }));
    transaction.mockRejectedValueOnce({ code: 'P2002' });

    await expect(service.createPublic(createDto(), 'race-client')).rejects.toMatchObject({
      status: 409,
      message: 'Idempotency key was already used for a different inquiry payload',
    });
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('stores email-only V2 inquiries with a non-null phone sentinel readable by the old model', async () => {
    const { service, createInquiry } = setup();

    await service.createPublic(
      createDto({ phone: undefined, email: ' SALES@EXAMPLE.COM ' }),
      'client-4',
    );

    expect(createInquiry.mock.calls[0][0].data).toEqual(
      expect.objectContaining({
        email: 'sales@example.com',
        phone: '',
        preferredContact: 'email',
      }),
    );
  });

  it('safely truncates optional V2 source fields without rejecting the core inquiry', async () => {
    const { service, createInquiry, createEvent } = setup();

    await service.createPublic(
      createDto({
        pagePath: 'p'.repeat(600),
        utmCampaign: 'u'.repeat(400),
        sessionId: `legacy-storage-${'s'.repeat(300)}`,
        visitorId: `legacy-visitor-${'v'.repeat(300)}`,
      }),
      'source-overflow-client',
    );

    const inquiryData = createInquiry.mock.calls[0][0].data;
    const eventData = createEvent.mock.calls[0][0].data;
    expect(inquiryData.pagePath).toHaveLength(500);
    expect(inquiryData.utmCampaign).toHaveLength(255);
    expect(inquiryData.sessionId).toHaveLength(120);
    expect(inquiryData.visitorId).toHaveLength(120);
    expect(eventData.pagePath).toBe(inquiryData.pagePath);
    expect(eventData.utmCampaign).toBe(inquiryData.utmCampaign);
    expect(eventData.sessionId).toBe(inquiryData.sessionId);
    expect(eventData.visitorId).toBe(inquiryData.visitorId);
  });

  it('does not schedule notification when the transaction cannot store the form-submit event', async () => {
    const { service, processor, createEvent } = setup();
    createEvent.mockRejectedValueOnce(new Error('event insert failed'));

    await expect(service.createPublic(createDto(), 'client-5')).rejects.toThrow(
      'event insert failed',
    );
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('cleans up an in-flight key after a failed transaction without an unhandled finally promise', async () => {
    const { service, transaction } = setup();
    transaction.mockRejectedValueOnce(new Error('transaction failed'));

    await expect(service.createPublic(createDto(), 'failure-client')).rejects.toThrow(
      'transaction failed',
    );
    await expect(service.createPublic(createDto(), 'failure-client-retry')).resolves.toEqual({
      submissionId: expect.any(String),
    });
    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it('rejects a preferred contact method that has no matching value', async () => {
    const { service } = setup();

    await expect(
      service.createPublic(
        createDto({ phone: undefined, email: 'sales@example.com', preferredContact: 'phone' }),
        'client-6',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires an email for English inquiries even when a phone is present', async () => {
    const { service, processor } = setup();

    await expect(
      service.createPublic(createDto({ locale: 'en', email: undefined }), 'client-8'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('lets an authenticated operator requeue a failed notification with an audit record', async () => {
    const { service, processor, operator, updateMany, createAudit } = setupManualNotification(
      InquiryNotificationStatus.failed,
    );

    await expect(
      service.manageNotification(
        41,
        {
          action: InquiryNotificationAuditAction.requeue_failed,
          expectedStateVersion: 4,
          note: '  已核对群消息，可以重试  ',
        },
        operator,
      ),
    ).resolves.toEqual({
      id: 41,
      submissionId: '52d8d7ae-a6ce-47cf-a2dd-95d065d06f7e',
      notificationStatus: InquiryNotificationStatus.pending,
      notificationStateVersion: 5,
      action: InquiryNotificationAuditAction.requeue_failed,
    });
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 41,
          notificationStatus: InquiryNotificationStatus.failed,
          notificationStateVersion: 4,
        },
        data: expect.objectContaining({
          notificationStatus: InquiryNotificationStatus.pending,
          notificationStateVersion: { increment: 1 },
          notificationAttemptCount: 0,
          notificationNextAttemptAt: expect.any(Date),
        }),
      }),
    );
    expect(createAudit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        operatorAdminUserId: 7,
        operatorUsername: 'reviewer',
        operatorRole: AdminRole.editor,
        previousStatus: InquiryNotificationStatus.failed,
        nextStatus: InquiryNotificationStatus.pending,
        previousError: 'Feishu returned HTTP 500',
        attemptCount: 3,
        note: '已核对群消息，可以重试',
      }),
    });
    expect(processor.kick).toHaveBeenCalledTimes(1);
  });

  it('lets an operator confirm an unknown notification as delivered without requeueing', async () => {
    const { service, processor, operator, updateMany, createAudit } = setupManualNotification(
      InquiryNotificationStatus.unknown,
    );

    await service.manageNotification(
      41,
      {
        action: InquiryNotificationAuditAction.confirm_unknown_delivered,
        expectedStateVersion: 4,
        note: '已在飞书群核对到该提交编号',
      },
      operator,
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationStatus: InquiryNotificationStatus.sent,
          notificationNextAttemptAt: null,
        }),
      }),
    );
    expect(updateMany.mock.calls[0][0].data).not.toHaveProperty('notificationSentAt');
    expect(createAudit).toHaveBeenCalledTimes(1);
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('only requeues unknown after the operator explicitly confirms it was not delivered', async () => {
    const { service, processor, operator, updateMany, createAudit } = setupManualNotification(
      InquiryNotificationStatus.unknown,
    );

    await service.manageNotification(
      41,
      {
        action: InquiryNotificationAuditAction.confirm_unknown_not_delivered_and_requeue,
        expectedStateVersion: 4,
        note: '已按提交编号检索飞书群，确认未送达',
      },
      operator,
    );

    expect(createAudit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: InquiryNotificationAuditAction.confirm_unknown_not_delivered_and_requeue,
        previousStatus: InquiryNotificationStatus.unknown,
        nextStatus: InquiryNotificationStatus.pending,
      }),
    });
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationStatus: InquiryNotificationStatus.pending,
          notificationAttemptCount: 0,
          notificationNextAttemptAt: expect.any(Date),
        }),
      }),
    );
    expect(processor.kick).toHaveBeenCalledTimes(1);
  });

  it('rejects an action that is not allowed from the current notification status', async () => {
    const { service, processor, operator, updateMany, createAudit } = setupManualNotification(
      InquiryNotificationStatus.unknown,
    );

    await expect(
      service.manageNotification(
        41,
        {
          action: InquiryNotificationAuditAction.requeue_failed,
          expectedStateVersion: 4,
          note: '不应允许直接重试 unknown',
        },
        operator,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(updateMany).not.toHaveBeenCalled();
    expect(createAudit).not.toHaveBeenCalled();
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('rolls back audit creation when the notification status changes concurrently', async () => {
    const { service, processor, operator, createAudit } = setupManualNotification(
      InquiryNotificationStatus.failed,
      0,
    );

    await expect(
      service.manageNotification(
        41,
        {
          action: InquiryNotificationAuditAction.requeue_failed,
          expectedStateVersion: 4,
          note: '并发修改测试',
        },
        operator,
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(createAudit).not.toHaveBeenCalled();
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('rejects a stale manual action after the status returns to the same name', async () => {
    const { service, processor, operator, updateMany, createAudit } = setupManualNotification(
      InquiryNotificationStatus.failed,
      1,
      8,
    );

    await expect(
      service.manageNotification(
        41,
        {
          action: InquiryNotificationAuditAction.requeue_failed,
          expectedStateVersion: 4,
          note: '这是旧页面看到的失败状态',
        },
        operator,
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(updateMany).not.toHaveBeenCalled();
    expect(createAudit).not.toHaveBeenCalled();
    expect(processor.kick).not.toHaveBeenCalled();
  });

  it('projects only business fields needed by the admin inquiry list', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      customRequirement: { findMany, count },
      $transaction: jest.fn((operations: Array<Promise<unknown>>) => Promise.all(operations)),
    } as unknown as PrismaService;
    const service = new CustomRequirementService(
      prisma,
      { kick: jest.fn() } as unknown as InquiryNotificationProcessor,
      new WorkpieceRouterService(),
    );

    await service.getAdminList({ page: 1, pageSize: 10 });

    const select = findMany.mock.calls[0][0].select;
    expect(select).toMatchObject({
      id: true,
      submissionId: true,
      phone: true,
      email: true,
      requirement: true,
      notificationStatus: true,
      notificationStateVersion: true,
    });
    for (const internalField of [
      'clientIdempotencyKey',
      'sessionId',
      'visitorId',
      'notificationAttemptCount',
      'notificationLeaseUntil',
      'notificationNextAttemptAt',
    ]) {
      expect(select).not.toHaveProperty(internalField);
    }
    expect(select).not.toHaveProperty('workpieceSelection');
  });

  it('returns a read-only admin workpiece context without internal candidates', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 41,
      submissionId: '52d8d7ae-a6ce-47cf-a2dd-95d065d06f7e',
      status: CustomRequirementStatus.pending,
      workpieceSelection: {
        categoryId: 'welded-structures',
        workpieceId: 'large-welded-machine-frame',
        searchTerm: null,
        processPurposeId: 'stress-relief',
        rawConditionsJson: { batchLoadWeightKg: 8000, dimensionUnit: 'mm' },
        displayState: 'insufficient_conditions',
        missingInputsJson: ['dimensionLength'],
        publicDirectionIdsJson: [],
        ruleVersion: 'workpiece-router-resolver-2.3.0',
        baselineVersion: null,
        createdAt: new Date('2026-08-27T08:00:00.000Z'),
      },
    });
    const prisma = { customRequirement: { findUnique } } as unknown as PrismaService;
    const service = new CustomRequirementService(
      prisma,
      { kick: jest.fn() } as unknown as InquiryNotificationProcessor,
      new WorkpieceRouterService(),
    );

    const detail = await service.findOne(41);

    expect(detail.workpieceContext).toMatchObject({
      categoryName: '焊接结构件',
      workpieceName: '大型焊接机架',
      publicDirections: [],
      ruleVersion: 'workpiece-router-resolver-2.3.0',
    });
    expect(detail.workpieceContext?.rawConditions).toContainEqual({
      label: '批次装载总重',
      value: '8000kg',
    });
    expect(detail.workpieceContext).not.toHaveProperty('logicUnitId');
    expect(detail.workpieceContext).not.toHaveProperty('ruleId');
    expect(detail.workpieceContext).not.toHaveProperty('internalCandidates');
  });

  it('keeps old inquiry details readable when no workpiece context exists', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 42,
      submissionId: '62d8d7ae-a6ce-47cf-a2dd-95d065d06f7e',
      status: CustomRequirementStatus.pending,
      workpieceSelection: null,
    });
    const prisma = { customRequirement: { findUnique } } as unknown as PrismaService;
    const service = new CustomRequirementService(
      prisma,
      { kick: jest.fn() } as unknown as InquiryNotificationProcessor,
      new WorkpieceRouterService(),
    );

    await expect(service.findOne(42)).resolves.toMatchObject({
      id: 42,
      workpieceContext: null,
    });
  });

  it('uses the same privacy allowlist when marking an inquiry followed', async () => {
    const safeRecord = {
      id: 41,
      submissionId: '52d8d7ae-a6ce-47cf-a2dd-95d065d06f7e',
      status: CustomRequirementStatus.pending,
    };
    const findUnique = jest.fn().mockResolvedValue(safeRecord);
    const update = jest.fn().mockResolvedValue({
      ...safeRecord,
      status: CustomRequirementStatus.followed,
    });
    const prisma = {
      customRequirement: { findUnique, update },
    } as unknown as PrismaService;
    const service = new CustomRequirementService(
      prisma,
      { kick: jest.fn() } as unknown as InquiryNotificationProcessor,
      new WorkpieceRouterService(),
    );

    await service.markFollowed(41);

    expect(findUnique.mock.calls[0][0].select).toEqual({ id: true });
    for (const call of [update.mock.calls[0][0]]) {
      expect(call.select).toMatchObject({ id: true, phone: true, email: true, status: true });
      expect(call.select).not.toHaveProperty('sessionId');
      expect(call.select).not.toHaveProperty('visitorId');
      expect(call.select).not.toHaveProperty('clientIdempotencyKey');
      expect(call.select).not.toHaveProperty('notificationLeaseUntil');
    }
  });

  it('does not expose internal relationship identifiers in notification audit responses', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 41 });
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      customRequirement: { findUnique },
      inquiryNotificationAudit: { findMany },
    } as unknown as PrismaService;
    const service = new CustomRequirementService(
      prisma,
      { kick: jest.fn() } as unknown as InquiryNotificationProcessor,
      new WorkpieceRouterService(),
    );

    await service.getNotificationAudits(41);

    const select = findMany.mock.calls[0][0].select;
    expect(select).toMatchObject({
      id: true,
      operatorUsername: true,
      operatorRole: true,
      action: true,
      note: true,
      createdAt: true,
    });
    expect(select).not.toHaveProperty('customRequirementId');
    expect(select).not.toHaveProperty('submissionId');
    expect(select).not.toHaveProperty('operatorAdminUserId');
  });
});
