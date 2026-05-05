import { ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateCategory } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { AdminListQueryDto } from '@/common/dto/admin-list-query.dto';

export class CertificateListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ enum: CertificateCategory })
  @IsOptional()
  @IsEnum(CertificateCategory)
  category?: CertificateCategory;
}
