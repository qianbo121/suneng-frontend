import { Module } from '@nestjs/common';

import { SeoController } from '@/modules/seo/seo.controller';
import { SeoService } from '@/modules/seo/seo.service';

@Module({
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
