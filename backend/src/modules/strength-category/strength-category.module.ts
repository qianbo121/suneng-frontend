import { Module } from '@nestjs/common';

import { StrengthCategoryController } from '@/modules/strength-category/strength-category.controller';
import { StrengthCategoryService } from '@/modules/strength-category/strength-category.service';

@Module({
  controllers: [StrengthCategoryController],
  providers: [StrengthCategoryService],
  exports: [StrengthCategoryService],
})
export class StrengthCategoryModule {}
