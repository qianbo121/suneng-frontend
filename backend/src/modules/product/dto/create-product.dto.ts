import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  nameZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summaryZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summaryEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  specsJson?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  featuresJson?: Record<string, unknown> | string[] | Record<string, unknown>[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  imagesJson?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitleZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescriptionZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoKeywordsZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoKeywordsEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
