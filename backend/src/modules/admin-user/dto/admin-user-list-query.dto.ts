import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class AdminUserListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AdminRole })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  keyword?: string;
}
