import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { BaiduSubmitService } from './baidu-submit.service';
import { NewsService } from './news.service';

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: (value: string) => value },
}));

describe('Published news Baidu success marker', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  function harness(mode: string) {
    const item = {
      id: 123,
      slug: 'test-article',
      status: PublishStatus.published,
      isPublished: true,
      baiduSubmittedAt: null,
    };
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      news: { findUnique: jest.fn().mockResolvedValue(item), updateMany },
    } as unknown as PrismaService;
    const submit = new BaiduSubmitService(
      new ConfigService({
        baiduSubmissionMode: mode,
        baiduSite: 'jssngyl.cn',
        baiduToken: 'test-token',
      }),
    );
    const service = new NewsService(prisma, {} as never, submit) as unknown as {
      submitPublishedNewsToBaidu(news: typeof item): Promise<void>;
    };
    return { item, updateMany, service };
  }

  it('does not request or mark a published article in manual mode', async () => {
    const { service, item, updateMany } = harness('manual');
    await service.submitPublishedNewsToBaidu(item);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
  it('does not mark a rejected receipt in automatic mode', async () => {
    const { service, item, updateMany } = harness('automatic');
    fetchMock.mockResolvedValue(new Response('{"success":0}'));
    await service.submitPublishedNewsToBaidu(item);
    expect(updateMany).not.toHaveBeenCalled();
  });
  it('marks a published article only after an explicit accepted receipt', async () => {
    const { service, item, updateMany } = harness('automatic');
    fetchMock.mockResolvedValue(new Response('{"success":1}'));
    await service.submitPublishedNewsToBaidu(item);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: item.id, baiduSubmittedAt: null },
      data: { baiduSubmittedAt: expect.any(Date) },
    });
  });
});
