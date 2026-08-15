import { ConfigService } from '@nestjs/config';

import { InquiryNotificationService } from '@/modules/custom-requirement/inquiry-notification.service';

describe('InquiryNotificationService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('sends a structured card with the valuable inquiry fields', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: 0, msg: 'success' }), { status: 200 }),
      );
    global.fetch = fetchMock;
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(
      service.notifyNewInquiry({
        submissionId: 'ca3e8dd2-604c-4b11-9647-04d33dd16963',
        projectType: '台车式热处理炉',
        projectLocation: '江苏常州',
        name: ' 张经理 ',
        phone: '13000000000',
        email: 'sales@example.com',
        company: '苏能客户公司',
        industry: '机械制造',
        process: '退火',
        temperature: '950℃',
        requirement: '需要一台\n台车炉',
        sourceType: 'organic_search',
        sourceDetail: 'google',
        createdAt: new Date('2026-07-31T03:05:00.000Z'),
      }),
    ).resolves.toBe(true);

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.com/feishu-webhook');
    const payload = JSON.parse(request.body as string);
    expect(payload.msg_type).toBe('interactive');
    expect(payload.card.header.title.content).toBe('官网新询盘');
    expect(
      payload.card.elements[0].fields.map(
        (item: { text: { content: string } }) => item.text.content,
      ),
    ).toEqual([
      '**提交编号**\nca3e8dd2-604c-4b11-9647-04d33dd16963',
      '**来源**\norganic\\_search / google',
      '**收到时间**\n2026-07-31 11:05',
      '**项目类型**\n台车式热处理炉',
      '**项目地点**\n江苏常州',
      '**联系人**\n张经理',
      '**公司**\n苏能客户公司',
      '**联系电话**\n13000000000',
      '**联系邮箱**\nsales@example.com',
      '**所属行业**\n机械制造',
      '**设备工艺**\n退火',
      '**使用温度**\n950℃',
    ]);
    expect(payload.card.elements[2].text.content).toBe('**设备需求**\n需要一台\n台车炉');
  });

  it('omits empty inquiry fields instead of showing placeholders', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: 0, msg: 'success' }), { status: 200 }),
      );
    global.fetch = fetchMock;
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await service.notifyNewInquiry({
      name: ' ',
      phone: '13000000000',
      company: null,
      requirement: '\n',
      createdAt: new Date('2026-07-31T03:05:00.000Z'),
    });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(request.body as string);
    expect(payload.card.elements).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('未填写');
  });

  it('skips delivery when the webhook is not configured', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;
    const configService = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(service.notifyNewInquiry({ phone: '13000000000' })).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a Feishu business error', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: 19001, msg: 'invalid webhook' }), { status: 200 }),
      );
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(service.notifyNewInquiry({ phone: '13000000000' })).rejects.toThrow(
      'Feishu inquiry notification returned error 19001',
    );
  });

  it('marks a non-empty unparseable 200 response as an unknown delivery outcome', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('not-json', { status: 200 }));
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(service.notifyNewInquiry({ phone: '13000000000' })).rejects.toMatchObject({
      kind: 'unknown',
    });
  });

  it('marks an empty HTTP 200 response as unknown instead of sent', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 200 }));
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(service.notifyNewInquiry({ phone: '13000000000' })).rejects.toMatchObject({
      kind: 'unknown',
      message: expect.stringContaining('empty response'),
    });
  });

  it('marks a valid JSON response without a Feishu result code as unknown', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(service.notifyNewInquiry({ phone: '13000000000' })).rejects.toMatchObject({
      kind: 'unknown',
    });
  });

  it.each([
    { body: { code: null }, label: 'null code' },
    { body: { code: '0' }, label: 'string code' },
    { body: { code: 0, StatusCode: null }, label: 'partially null dual codes' },
    { body: { code: 0, StatusCode: 19001 }, label: 'conflicting dual codes' },
    { body: { code: 19001, StatusCode: 19002 }, label: 'conflicting non-zero codes' },
  ])('marks $body as an unknown delivery outcome ($label)', async ({ body }) => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
    const configService = {
      get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
    } as unknown as ConfigService;
    const service = new InquiryNotificationService(configService);

    await expect(service.notifyNewInquiry({ phone: '13000000000' })).rejects.toMatchObject({
      kind: 'unknown',
      message: expect.stringContaining('outcome is unknown'),
    });
  });

  it.each([{ code: 0 }, { StatusCode: 0 }, { code: 0, StatusCode: 0 }])(
    'accepts only an explicit, internally consistent numeric success response: %o',
    async (body) => {
      global.fetch = jest
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
      const configService = {
        get: jest.fn().mockReturnValue('https://example.com/feishu-webhook'),
      } as unknown as ConfigService;
      const service = new InquiryNotificationService(configService);

      await expect(service.notifyNewInquiry({ phone: '13000000000' })).resolves.toBe(true);
    },
  );
});
