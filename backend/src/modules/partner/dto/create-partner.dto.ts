import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  logoUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
