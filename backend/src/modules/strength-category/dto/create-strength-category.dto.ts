import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStrengthCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  nameZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nameEn?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  slug!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
