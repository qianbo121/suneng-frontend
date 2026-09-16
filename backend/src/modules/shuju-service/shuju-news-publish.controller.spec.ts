import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { ShujuNewsPublishAuthGuard } from './shuju-news-publish-auth.guard';
import { ShujuNewsPublishController } from './shuju-news-publish.controller';
import { ShujuNewsPublishService } from './shuju-news-publish.service';

jest.mock('./shuju-news-publish.service', () => ({
  ShujuNewsPublishService: jest.fn(),
}));

describe('bilingual publication capability preflight', () => {
  it('uses the existing publisher guard and a read-only route without calling publication services', () => {
    const service = { publish: jest.fn(), uploadMedia: jest.fn(), offline: jest.fn() };
    const controller = new ShujuNewsPublishController(
      service as unknown as ShujuNewsPublishService,
    );
    expect(Reflect.getMetadata(GUARDS_METADATA, ShujuNewsPublishController)).toContain(
      ShujuNewsPublishAuthGuard,
    );
    expect(Reflect.getMetadata(PATH_METADATA, controller.capabilities)).toBe(
      'publish-capabilities',
    );
    expect(Reflect.getMetadata(METHOD_METADATA, controller.capabilities)).toBe(RequestMethod.GET);
    expect(controller.capabilities()).toEqual({ englishNews: true, version: 1 });
    for (const operation of Object.values(service)) expect(operation).not.toHaveBeenCalled();
  });
});
