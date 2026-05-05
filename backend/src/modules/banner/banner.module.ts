import { Module } from '@nestjs/common';

import { BannerController } from '@/modules/banner/banner.controller';
import { BannerService } from '@/modules/banner/banner.service';

@Module({
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
