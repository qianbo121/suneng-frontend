import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

import { AdminListQueryDto } from '@/common/dto/admin-list-query.dto';

export class StrengthItemListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
