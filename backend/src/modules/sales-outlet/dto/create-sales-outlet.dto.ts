import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSalesOutletDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  regionZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  regionEn?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  cityZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cityEn?: string;

  @ApiProperty()
  @IsString()
  addressZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
