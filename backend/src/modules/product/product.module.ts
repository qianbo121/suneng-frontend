import { Module } from '@nestjs/common';

import { ProductController } from '@/modules/product/product.controller';
import { ProductService } from '@/modules/product/product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
