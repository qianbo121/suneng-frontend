import { Module } from '@nestjs/common';

import { SalesOutletController } from '@/modules/sales-outlet/sales-outlet.controller';
import { SalesOutletService } from '@/modules/sales-outlet/sales-outlet.service';

@Module({
  controllers: [SalesOutletController],
  providers: [SalesOutletService],
})
export class SalesOutletModule {}
