import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ShujuNewsReadController } from '@/modules/shuju-service/shuju-news-read.controller';
import { ShujuNewsReadService } from '@/modules/shuju-service/shuju-news-read.service';
import { ShujuNewsPublishAuthGuard } from '@/modules/shuju-service/shuju-news-publish-auth.guard';
import { ShujuNewsPublishController } from '@/modules/shuju-service/shuju-news-publish.controller';
import { ShujuNewsPublishService } from '@/modules/shuju-service/shuju-news-publish.service';
import { ShujuServiceAuthGuard } from '@/modules/shuju-service/shuju-service-auth.guard';
import { ShujuInquiryReadAuthGuard } from '@/modules/shuju-service/shuju-inquiry-read-auth.guard';
import { ShujuInquiryReadController } from '@/modules/shuju-service/shuju-inquiry-read.controller';
import { ShujuInquiryReadService } from '@/modules/shuju-service/shuju-inquiry-read.service';
import { ShujuGrowthReadAuthGuard } from '@/modules/shuju-service/shuju-growth-read-auth.guard';
import { ShujuGrowthReadController } from '@/modules/shuju-service/shuju-growth-read.controller';
import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';
import { BaiduSubmitService } from '@/modules/news/baidu-submit.service';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [JwtModule.register({}), UploadModule],
  controllers: [
    ShujuNewsReadController,
    ShujuNewsPublishController,
    ShujuInquiryReadController,
    ShujuGrowthReadController,
  ],
  providers: [
    ShujuNewsReadService,
    ShujuServiceAuthGuard,
    ShujuNewsPublishAuthGuard,
    ShujuNewsPublishService,
    ShujuInquiryReadAuthGuard,
    ShujuInquiryReadService,
    ShujuGrowthReadAuthGuard,
    ShujuGrowthReadService,
    BaiduSubmitService,
  ],
})
export class ShujuServiceModule {}
