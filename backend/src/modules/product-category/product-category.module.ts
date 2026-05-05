import { Module } from '@nestjs/common';

import { ProductCategoryController } from '@/modules/product-category/product-category.controller';
import { ProductCategoryService } from '@/modules/product-category/product-category.service';

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
})
export class ProductCategoryModule {}
