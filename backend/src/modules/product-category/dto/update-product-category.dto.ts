import { PartialType } from '@nestjs/swagger';

import { CreateProductCategoryDto } from '@/modules/product-category/dto/create-product-category.dto';

export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto) {}
