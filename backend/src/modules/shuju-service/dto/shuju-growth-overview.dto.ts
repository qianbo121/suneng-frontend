import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  Equals,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { ShujuGrowthReadQueryDto } from './shuju-growth-read-query.dto';

export class InquiryReviewDto {
  @Equals(1)
  version!: 1;

  @IsArray()
  @ArrayMaxSize(8000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  validIds!: number[];

  @IsArray()
  @ArrayMaxSize(8000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  excludedIds!: number[];

  @IsArray()
  @ArrayMaxSize(8000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  pendingIds!: number[];
}

export class ShujuGrowthOverviewDto extends ShujuGrowthReadQueryDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => InquiryReviewDto)
  inquiryReview?: InquiryReviewDto;
}

/** Validate again at the service boundary; callers must never silently resolve conflicting lists. */
export function validateInquiryReview(review: InquiryReviewDto | undefined) {
  if (review === undefined) return;
  if (!review || review.version !== 1) {
    throw new BadRequestException('Invalid inquiry review version');
  }
  const lists = [review.validIds, review.excludedIds, review.pendingIds];
  if (lists.some((ids) => !Array.isArray(ids))) {
    throw new BadRequestException('Inquiry review requires three ID lists');
  }
  const ids = lists.flat();
  if (ids.length > 8000 || ids.some((id) => !Number.isInteger(id) || id < 1 || id > 2147483647)) {
    throw new BadRequestException('Inquiry review IDs exceed the supported limits');
  }
  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException('Inquiry review IDs must be unique and non-conflicting');
  }
}
