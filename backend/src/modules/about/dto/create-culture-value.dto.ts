import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CultureValueType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCultureValueDto {
  @ApiProperty({ enum: CultureValueType })
  @IsEnum(CultureValueType)
  type!: CultureValueType;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  titleZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
