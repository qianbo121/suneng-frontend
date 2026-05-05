import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyInfoDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  key!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueZh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueEn?: string;
}
