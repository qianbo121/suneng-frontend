import { Module } from '@nestjs/common';

import { LeadEventController } from '@/modules/lead-event/lead-event.controller';
import { LeadEventService } from '@/modules/lead-event/lead-event.service';

@Module({
  controllers: [LeadEventController],
  providers: [LeadEventService],
})
export class LeadEventModule {}
