import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomRequirementStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class CustomRequirementListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ enum: CustomRequirementStatus })
  @IsOptional()
  @IsEnum(CustomRequirementStatus)
  status?: CustomRequirementStatus;
}
