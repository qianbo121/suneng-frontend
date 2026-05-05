import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStrengthItemDto {
  @ApiProperty()
  @IsInt()
  categoryId!: number;

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
  summaryZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summaryEn?: string;

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
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  imagesJson?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
