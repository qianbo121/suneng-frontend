import { PublishStatus } from '@prisma/client';
import type { Request, Response } from 'express';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import type { PrismaService } from '@/prisma/prisma.service';

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: (value: string) => value },
}));

describe('existing persistent article view contract', () => {
  it('retains the server viewer/day receipt across detail visits', async () => {
    const service = { registerView: jest.fn().mockResolvedValue(undefined) };
    const controller = new NewsController(service as unknown as NewsService);
    const response = { cookie: jest.fn() };
    await expect(
      controller.registerView(77, { headers: {} } as Request, response as unknown as Response),
    ).resolves.toEqual({ counted: true });
    const [name, value, options] = response.cookie.mock.calls[0];
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax' });
    const request = { headers: { cookie: `${name}=${encodeURIComponent(value)}` } } as Request;
    await expect(
      controller.registerView(77, request, response as unknown as Response),
    ).resolves.toEqual({ counted: false });
    expect(service.registerView).toHaveBeenCalledTimes(1);
  });
  it('increments the persistent database field atomically for published articles only', async () => {
    const news = { updateMany: jest.fn().mockResolvedValue({ count: 1 }) };
    const service = new NewsService({ news } as unknown as PrismaService, {} as never, {} as never);
    await service.registerView(77);
    expect(news.updateMany).toHaveBeenCalledWith({
      where: { id: 77, status: PublishStatus.published, isPublished: true },
      data: { viewCount: { increment: 1 } },
    });
  });
  it('detail reads used by rendering/prefetching do not write counts', async () => {
    const record = { id: 77, slug: 'article-77', viewCount: 11 };
    const news = {
      findFirst: jest.fn().mockResolvedValue(record),
      updateMany: jest.fn(),
      update: jest.fn(),
    };
    const service = new NewsService({ news } as unknown as PrismaService, {} as never, {} as never);
    await service.getPublicDetail('77');
    expect(news.updateMany).not.toHaveBeenCalled();
    expect(news.update).not.toHaveBeenCalled();
  });
});
