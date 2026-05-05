import { PartialType } from '@nestjs/swagger';

import { CreateProductDto } from '@/modules/product/dto/create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
