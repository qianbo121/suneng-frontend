import { Module } from '@nestjs/common';

import { NewsController } from '@/modules/news/news.controller';
import { NewsService } from '@/modules/news/news.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
