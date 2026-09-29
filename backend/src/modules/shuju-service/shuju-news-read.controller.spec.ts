import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import type { Request } from 'express';

import { ShujuNewsReadController } from './shuju-news-read.controller';
import { ShujuNewsReadService } from './shuju-news-read.service';
import { ShujuServiceAuthGuard } from './shuju-service-auth.guard';

describe('ShujuNewsReadController readership', () => {
  it('keeps the GET endpoint behind the existing news-read service guard', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ShujuNewsReadController)).toContain(
      ShujuServiceAuthGuard,
    );
    expect(Reflect.getMetadata(PATH_METADATA, ShujuNewsReadController)).toBe('svc/news');
    expect(Reflect.getMetadata(PATH_METADATA, ShujuNewsReadController.prototype.readership)).toBe(
      'readership',
    );
    expect(Reflect.getMetadata(METHOD_METADATA, ShujuNewsReadController.prototype.readership)).toBe(
      RequestMethod.GET,
    );
  });

  it('returns the read-only service result including zero and checked time unchanged', async () => {
    const result = {
      items: [{ id: 1, viewCount: 0 }],
      checkedAt: '2026-09-29T06:00:00.000Z',
    };
    const readership = jest.fn().mockResolvedValue(result);
    const controller = new ShujuNewsReadController({
      readership,
    } as unknown as ShujuNewsReadService);

    await expect(controller.readership({ ids: [1, 2] }, {} as Request)).resolves.toBe(result);
    expect(readership).toHaveBeenCalledWith({ ids: [1, 2] });
  });
});
