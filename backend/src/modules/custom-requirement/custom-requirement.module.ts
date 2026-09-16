import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from '@/modules/upload/upload.module';
import {
  EngineeringRequirementController,
  InquiryAttachmentReceipts,
  InquiryUploadThrottle,
} from './engineering-requirement.controller';

import { CustomRequirementController } from '@/modules/custom-requirement/custom-requirement.controller';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { InquiryNotificationProcessor } from '@/modules/custom-requirement/inquiry-notification.processor';
import { InquiryNotificationService } from '@/modules/custom-requirement/inquiry-notification.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { WorkpieceRouterModule } from '@/modules/workpiece-router/workpiece-router.module';

@Module({
  imports: [PrismaModule, WorkpieceRouterModule, UploadModule, ConfigModule],
  controllers: [CustomRequirementController, EngineeringRequirementController],
  providers: [
    CustomRequirementService,
    InquiryNotificationService,
    InquiryNotificationProcessor,
    InquiryAttachmentReceipts,
    InquiryUploadThrottle,
  ],
  exports: [CustomRequirementService],
})
export class CustomRequirementModule {}
