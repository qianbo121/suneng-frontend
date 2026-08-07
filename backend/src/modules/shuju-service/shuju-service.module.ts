import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ShujuNewsReadController } from '@/modules/shuju-service/shuju-news-read.controller';
import { ShujuNewsReadService } from '@/modules/shuju-service/shuju-news-read.service';
import { ShujuServiceAuthGuard } from '@/modules/shuju-service/shuju-service-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ShujuNewsReadController],
  providers: [ShujuNewsReadService, ShujuServiceAuthGuard],
})
export class ShujuServiceModule {}
