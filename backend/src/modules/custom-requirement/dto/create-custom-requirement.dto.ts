import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

function normalizeOptionalSource(maxLength: number) {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim();
    return normalized ? normalized.slice(0, maxLength) : undefined;
  });
}

export class CreateCustomRequirementDto {
  @ApiPropertyOptional({ description: 'Stable key reused when the client retries this submission' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/)
  @MaxLength(120)
  idempotencyKey?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(120)
  projectType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(180)
  projectLocation!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateCustomRequirementDto) => !dto.email || dto.phone !== undefined)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}\p{N}+][\p{L}\p{N}\s()+\-._/#*]{2,49}$/u)
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional()
  @ValidateIf(
    (dto: CreateCustomRequirementDto) =>
      dto.locale === 'en' || !dto.phone || dto.email !== undefined,
  )
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(180)
  company!: string;

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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(8_000)
  requirement!: string;

  @ApiPropertyOptional({ enum: ['phone', 'email'] })
  @IsOptional()
  @IsIn(['phone', 'email'])
  preferredContact?: 'phone' | 'email';

  @ApiProperty({ enum: ['zh', 'en'] })
  @IsIn(['zh', 'en'])
  locale!: 'zh' | 'en';

  @ApiPropertyOptional()
  @normalizeOptionalSource(500)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pagePath?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(255)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pageTitle?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(80)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  pageType?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productTag?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceType?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceDetail?: string;

  @ApiPropertyOptional({ enum: ['PC', '移动端'] })
  @normalizeOptionalSource(40)
  @IsOptional()
  @IsIn(['PC', '移动端'])
  deviceType?: 'PC' | '移动端';

  @ApiPropertyOptional()
  @normalizeOptionalSource(500)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  landingPage?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(500)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  previousPage?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmSource?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmMedium?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(255)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmCampaign?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  discoverySource?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sessionId?: string;

  @ApiPropertyOptional()
  @normalizeOptionalSource(120)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorId?: string;
}
