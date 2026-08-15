import { Module } from '@nestjs/common';

import { CustomRequirementController } from '@/modules/custom-requirement/custom-requirement.controller';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { InquiryNotificationProcessor } from '@/modules/custom-requirement/inquiry-notification.processor';
import { InquiryNotificationService } from '@/modules/custom-requirement/inquiry-notification.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomRequirementController],
  providers: [CustomRequirementService, InquiryNotificationService, InquiryNotificationProcessor],
  exports: [CustomRequirementService],
})
export class CustomRequirementModule {}
