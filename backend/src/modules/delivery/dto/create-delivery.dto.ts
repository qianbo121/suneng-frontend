import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDeliveryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  productId?: number;

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
  descriptionZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  imagesJson?: string[];

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
