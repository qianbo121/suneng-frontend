import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  nameZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconImage?: string;

  @ApiPropertyOptional({ description: 'Optional manual slug' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
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
