import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTimelineEventDto {
  @ApiProperty()
  @IsInt()
  year!: number;

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

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
