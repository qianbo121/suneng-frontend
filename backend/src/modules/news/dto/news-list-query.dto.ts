import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

import { AdminListQueryDto } from '@/common/dto/admin-list-query.dto';

export class NewsListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? undefined : Number(value),
  )
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : value === 'true' || value === true,
  )
  @IsBoolean()
  isPublished?: boolean;
}
