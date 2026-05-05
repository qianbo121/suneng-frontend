import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateCategory } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCertificateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  strengthCategoryId?: number;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  nameZh!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  imageUrl!: string;

  @ApiProperty({ enum: CertificateCategory })
  @IsEnum(CertificateCategory)
  category!: CertificateCategory;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
