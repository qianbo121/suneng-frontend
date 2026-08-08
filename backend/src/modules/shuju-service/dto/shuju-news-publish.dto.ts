import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class ShujuNewsPublishDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sourceDraftId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sourceVersion!: number;

  @IsString()
  @MaxLength(160)
  @Matches(/^shuju-news:\d+:v\d+:publish$/)
  idempotencyKey!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleZh!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  summaryZh?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500000)
  contentZh!: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(500)
  coverImage?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitleZh?: string;

  @IsOptional()
  @IsString()
  seoDescriptionZh?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoKeywordsZh?: string;
}

export class ShujuNewsOfflineDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sourceDraftId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sourceVersion!: number;

  @IsString()
  @MaxLength(160)
  @Matches(/^shuju-news:\d+:v\d+:offline$/)
  idempotencyKey!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
