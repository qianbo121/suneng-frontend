import { Module } from '@nestjs/common';

import { ServiceController } from '@/modules/service/service.controller';
import { ServiceService } from '@/modules/service/service.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
