import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const LEAD_EVENT_TYPES = [
  'page_view',
  'engaged_session',
  'dwell_5s',
  'dwell_20s',
  'dwell_60s',
  'dwell_180s',
  'phone_click',
  'wechat_click',
  'wechat_qr_view',
  'quote_cta_click',
  'email_click',
  'form_start',
  'form_step_complete',
  'form_submit',
  'human_signal',
  'automation_signal',
] as const;

export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number];

export class CreateLeadEventDto {
  @IsIn(LEAD_EVENT_TYPES)
  eventType!: LeadEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pageTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pagePath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  pageType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  productTag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceDetail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  searchKeyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  deviceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  landingPage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  previousPage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmMedium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmCampaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  discoverySource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorId?: string;
}
