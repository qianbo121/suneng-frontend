import { Module } from '@nestjs/common';

import { PartnerController } from '@/modules/partner/partner.controller';
import { PartnerService } from '@/modules/partner/partner.service';

@Module({
  controllers: [PartnerController],
  providers: [PartnerService],
})
export class PartnerModule {}
