import { Module } from '@nestjs/common';

import { BaiduSubmitService } from '@/modules/news/baidu-submit.service';
import { NewsController } from '@/modules/news/news.controller';
import { NewsService } from '@/modules/news/news.service';
import { NewsCategoryModule } from '@/modules/news-category/news-category.module';

@Module({
  imports: [NewsCategoryModule],
  controllers: [NewsController],
  providers: [NewsService, BaiduSubmitService],
})
export class NewsModule {}
