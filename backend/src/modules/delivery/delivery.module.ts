import { Module } from '@nestjs/common';

import { DeliveryController } from '@/modules/delivery/delivery.controller';
import { DeliveryService } from '@/modules/delivery/delivery.service';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
