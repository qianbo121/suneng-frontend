import { ApiPropertyOptional } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class AdminListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '测试' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @ApiPropertyOptional({ enum: PublishStatus })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional({ example: 'sortOrder' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}
