import { Logger } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import type { Response } from 'express';

import {
  InquiryServiceRequest,
  ShujuInquiryReadAuthGuard,
} from '@/modules/shuju-service/shuju-inquiry-read-auth.guard';
import { ShujuInquiryReadController } from '@/modules/shuju-service/shuju-inquiry-read.controller';
import { ShujuInquiryReadService } from '@/modules/shuju-service/shuju-inquiry-read.service';

describe('ShujuInquiryReadController', () => {
  beforeEach(() => jest.spyOn(Logger.prototype, 'log').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('keeps the record-id probe behind the existing inquiry read guard', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ShujuInquiryReadController)).toContain(
      ShujuInquiryReadAuthGuard,
    );
  });

  it('puts the first source id in a PII-free header even when the limit-one body is oversized', async () => {
    const oversizedRequirement = 'x'.repeat(1_100_000);
    const result = {
      items: [{ id: 71, requirement: oversizedRequirement }],
      replayItems: [],
      nextAfterId: 71,
      hasMore: true,
      minimumAfterId: 4,
    };
    const service = {
      list: jest.fn().mockResolvedValue(result),
    } as unknown as ShujuInquiryReadService;
    const controller = new ShujuInquiryReadController(service);
    const request = {
      shujuInquiryService: { subject: 'shuju-engine', scope: 'inquiries:read', jti: 'request-1' },
    } as InquiryServiceRequest;
    const setHeader = jest.fn();
    const response = { setHeader } as unknown as Response;

    await expect(controller.list({ afterId: 70, limit: 1 }, request, response)).resolves.toBe(
      result,
    );

    expect(setHeader).toHaveBeenCalledWith('X-Shuju-First-Record-Id', '71');
    expect(setHeader.mock.calls[0][1]).not.toContain(oversizedRequirement.slice(0, 10));
  });
});
