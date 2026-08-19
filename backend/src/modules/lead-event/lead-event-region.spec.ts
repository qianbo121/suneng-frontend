import { LeadEventService } from '@/modules/lead-event/lead-event.service';
import { PrismaService } from '@/prisma/prisma.service';

function requestFrom(ip: string) {
  return { ip, headers: { 'user-agent': 'Mozilla/5.0' } } as never;
}

function serviceWith(executeRaw: jest.Mock) {
  return new LeadEventService({ $executeRaw: executeRaw } as unknown as PrismaService);
}

describe('lead event region', () => {
  it('stores the province and city derived from the masked ip', async () => {
    const executeRaw = jest.fn().mockResolvedValue(1);
    await serviceWith(executeRaw).createPublic(
      { eventType: 'page_view' } as never,
      requestFrom('114.252.10.20'),
    );
    const values: string[] = executeRaw.mock.calls[0].slice(1).map(String);
    // 存的 IP 必须仍是脱敏的，地区是从它推出来的，不是另外采集的
    expect(values).toContain('114.252.xxx.xxx');
    expect(values.some((value: string) => value.includes('北京'))).toBe(true);
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
});
