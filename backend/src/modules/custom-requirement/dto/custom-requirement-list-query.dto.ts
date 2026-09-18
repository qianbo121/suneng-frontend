import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomRequirementStatus, InquiryNotificationStatus } from '@prisma/client';
import { IsBooleanString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class CustomRequirementListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;

  @ApiPropertyOptional({ enum: CustomRequirementStatus })
  @IsOptional()
  @IsEnum(CustomRequirementStatus)
  status?: CustomRequirementStatus;

  @ApiPropertyOptional({ enum: InquiryNotificationStatus })
  @IsOptional()
  @IsEnum(InquiryNotificationStatus)
  notificationStatus?: InquiryNotificationStatus;

  // Sales needs one question answered quickly: which leads never reached the
  // group chat? Filtering by each failure state separately is how they get missed.
  @ApiPropertyOptional({
    description: 'Only inquiries whose notification is not confirmed delivered',
  })
  @IsOptional()
  @IsBooleanString()
  undelivered?: string;
}
