import { Module } from '@nestjs/common';

import { AboutAdminController } from '@/modules/about/controllers/about-admin.controller';
import { AboutPublicController } from '@/modules/about/controllers/about-public.controller';
import { AboutService } from '@/modules/about/about.service';

@Module({
  controllers: [AboutPublicController, AboutAdminController],
  providers: [AboutService],
})
export class AboutModule {}
