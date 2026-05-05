import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAboutSectionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  sectionKey!: string;

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
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
