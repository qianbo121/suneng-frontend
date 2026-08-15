import { ApiProperty } from '@nestjs/swagger';
import { InquiryNotificationAuditAction } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min } from 'class-validator';

export class ManageInquiryNotificationDto {
  @ApiProperty({ enum: InquiryNotificationAuditAction })
  @IsEnum(InquiryNotificationAuditAction)
  action!: InquiryNotificationAuditAction;

  @ApiProperty({ minimum: 0, description: 'Notification state version shown to the operator' })
  @IsInt()
  @Min(0)
  expectedStateVersion!: number;

  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(1000)
  note!: string;
}
