import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ShujuGrowthReadService } from '../shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InquiryReviewDto,
  ShujuGrowthOverviewDto,
  validateInquiryReview,
} from './shuju-growth-overview.dto';

const review = (): InquiryReviewDto => ({
  version: 1,
  validIds: [10],
  excludedIds: [11],
  pendingIds: [12],
});

describe('internal growth overview review contract', () => {
  it('accepts bounded positive row IDs and optional review', async () => {
    expect(() => validateInquiryReview(undefined)).not.toThrow();
    expect(() => validateInquiryReview(review())).not.toThrow();
    const dto = plainToInstance(ShujuGrowthOverviewDto, {
      startDate: '2026-09-21',
      endDate: '2026-09-27',
      inquiryReview: review(),
    });
    expect(await validate(dto)).toEqual([]);
    const maximum = {
      ...review(),
      validIds: Array.from({ length: 7998 }, (_, i) => 2147483647 - i),
    };
    validateInquiryReview(maximum);
    // Include whitespace used by common JSON serializers; stay under Nest's default 100 KiB body limit.
    const body = JSON.stringify({
      startDate: '2026-09-21',
      endDate: '2026-09-27',
      inquiryReview: maximum,
    }).replace(/,/g, ', ');
    expect(Buffer.byteLength(body, 'utf8')).toBeLessThan(100 * 1024);
  });

  it.each([
    { ...review(), version: 2 },
    { ...review(), validIds: [0] },
    { ...review(), validIds: [-1] },
    { ...review(), validIds: [1.5] },
    { ...review(), validIds: ['10'] },
    { ...review(), validIds: [2147483648] },
    { ...review(), validIds: [10, 10] },
    { ...review(), excludedIds: [10] },
    { ...review(), pendingIds: [11] },
    { ...review(), pendingIds: null },
    { ...review(), validIds: Array.from({ length: 7999 }, (_, i) => i + 100) },
  ])('rejects invalid or conflicting review before any database read', async (invalid) => {
    const prisma = { $queryRaw: jest.fn() };
    const service = new ShujuGrowthReadService(prisma as unknown as PrismaService);
    await expect(
      service.overview({
        startDate: '2026-09-21',
        endDate: '2026-09-27',
        inquiryReview: invalid as InquiryReviewDto,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});
