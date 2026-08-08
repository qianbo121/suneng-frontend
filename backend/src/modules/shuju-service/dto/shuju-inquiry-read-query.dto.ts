import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ShujuInquiryReadQueryDto {
  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @Transform(({ value }) => Number(value ?? 0))
  @IsInt()
  @Min(0)
  afterId = 0;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
