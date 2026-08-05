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
        name: ' 张经理 ',
        phone: '13000000000',
        company: '苏能客户公司',
        industry: '机械制造',
        process: '退火',
        temperature: '950℃',
        requirement: '需要一台\n台车炉',
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
      '**来源**\n官网询盘',
      '**收到时间**\n2026-07-31 11:05',
      '**联系人**\n张经理',
      '**公司**\n苏能客户公司',
      '**联系电话**\n13000000000',
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
});
