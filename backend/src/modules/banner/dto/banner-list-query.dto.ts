import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { AdminListQueryDto } from '@/common/dto/admin-list-query.dto';

export class BannerListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ example: 'home-hero' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sectionKey?: string;
}
