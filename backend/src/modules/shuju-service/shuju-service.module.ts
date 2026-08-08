import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ShujuNewsReadController } from '@/modules/shuju-service/shuju-news-read.controller';
import { ShujuNewsReadService } from '@/modules/shuju-service/shuju-news-read.service';
import { ShujuNewsPublishAuthGuard } from '@/modules/shuju-service/shuju-news-publish-auth.guard';
import { ShujuNewsPublishController } from '@/modules/shuju-service/shuju-news-publish.controller';
import { ShujuNewsPublishService } from '@/modules/shuju-service/shuju-news-publish.service';
import { ShujuServiceAuthGuard } from '@/modules/shuju-service/shuju-service-auth.guard';
import { BaiduSubmitService } from '@/modules/news/baidu-submit.service';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [JwtModule.register({}), UploadModule],
  controllers: [ShujuNewsReadController, ShujuNewsPublishController],
  providers: [
    ShujuNewsReadService,
    ShujuServiceAuthGuard,
    ShujuNewsPublishAuthGuard,
    ShujuNewsPublishService,
    BaiduSubmitService,
  ],
})
export class ShujuServiceModule {}
