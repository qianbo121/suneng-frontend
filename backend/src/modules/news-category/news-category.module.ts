import { Module } from '@nestjs/common';

import { NewsCategoryController } from '@/modules/news-category/news-category.controller';
import { NewsCategoryService } from '@/modules/news-category/news-category.service';

@Module({
  controllers: [NewsCategoryController],
  providers: [NewsCategoryService],
  exports: [NewsCategoryService],
})
export class NewsCategoryModule {}
