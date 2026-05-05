import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class PublicCertificateQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '荣誉' })
  @IsOptional()
  @IsString()
  category?: string;
}
