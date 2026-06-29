import { Module } from '@nestjs/common';

import { CustomRequirementController } from '@/modules/custom-requirement/custom-requirement.controller';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomRequirementController],
  providers: [CustomRequirementService],
  exports: [CustomRequirementService],
})
export class CustomRequirementModule {}
