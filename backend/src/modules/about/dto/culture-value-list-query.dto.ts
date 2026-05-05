import { ApiPropertyOptional } from '@nestjs/swagger';
import { CultureValueType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { AdminListQueryDto } from '@/common/dto/admin-list-query.dto';

export class CultureValueListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ enum: CultureValueType })
  @IsOptional()
  @IsEnum(CultureValueType)
  type?: CultureValueType;
}
