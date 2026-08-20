import { LeadEventService } from '@/modules/lead-event/lead-event.service';
import { PrismaService } from '@/prisma/prisma.service';

function requestFrom(ip: string) {
  return { ip, headers: { 'user-agent': 'Mozilla/5.0' } } as never;
}

function serviceWith(executeRaw: jest.Mock) {
  return new LeadEventService({ $executeRaw: executeRaw } as unknown as PrismaService);
}

describe('lead event region', () => {
  it('resolves from the exact request ip but stores only the masked ip', async () => {
    const executeRaw = jest.fn().mockResolvedValue(1);
    await serviceWith(executeRaw).createPublic(
      { eventType: 'page_view' } as never,
      requestFrom('114.252.10.20'),
    );
    const values: string[] = executeRaw.mock.calls[0].slice(1).map(String);
    // 完整 IP 只用于当次本地解析，不出现在入库参数中。
    expect(values).toContain('114.252.xxx.xxx');
    expect(values).not.toContain('114.252.10.20');
    expect(values.some((value: string) => value.includes('北京'))).toBe(true);
    expect(values).toContain('exact_ip');
  });

  it('still writes the event when the ip carries no usable region', async () => {
    const executeRaw = jest.fn().mockResolvedValue(1);
    await serviceWith(executeRaw).createPublic(
      { eventType: 'page_view' } as never,
      requestFrom('10.0.0.5'),
    );
    // 地区解析不出来不要紧，事件本身必须照常入库
    expect(executeRaw).toHaveBeenCalledTimes(1);
  });

  it('never stores an identifiable ipv6 fragment', async () => {
    const executeRaw = jest.fn().mockResolvedValue(1);
    await serviceWith(executeRaw).createPublic(
      { eventType: 'page_view' } as never,
      requestFrom('240e:3a1:53a0:1200:8c2d:31ff:fe42:7788'),
    );
    const values: string[] = executeRaw.mock.calls[0].slice(1).map(String);
    expect(values).toContain('ipv6');
    expect(values.join(' ')).not.toContain('240e:3a1');
  });

  it('rate limits obvious bulk event injection without blocking normal browsing', async () => {
    const executeRaw = jest.fn().mockResolvedValue(1);
    const service = serviceWith(executeRaw);
    const request = requestFrom('114.252.10.20');
    for (let index = 0; index < 240; index += 1) {
      await service.createPublic({ eventType: 'page_view' } as never, request);
    }
    await expect(
      service.createPublic({ eventType: 'page_view' } as never, request),
    ).rejects.toMatchObject({ status: 429 });
    expect(executeRaw).toHaveBeenCalledTimes(240);
  });
});
