import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Compatibility contract for already-opened V1 pages. New clients must use V2. */
export class CreateLegacyCustomRequirementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  process?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  temperature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirement?: string;
}
