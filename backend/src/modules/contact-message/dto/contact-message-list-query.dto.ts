import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContactMessageStatus } from '@prisma/client';
import { IsBooleanString, IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class ContactMessageListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ enum: ContactMessageStatus })
  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isRead?: string;
}
