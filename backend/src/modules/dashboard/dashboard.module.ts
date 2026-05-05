import { Module } from '@nestjs/common';

import { ContactMessageModule } from '@/modules/contact-message/contact-message.module';
import { DashboardController } from '@/modules/dashboard/dashboard.controller';
import { DashboardService } from '@/modules/dashboard/dashboard.service';

@Module({
  imports: [ContactMessageModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
