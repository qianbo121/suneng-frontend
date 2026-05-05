import { PartialType } from '@nestjs/swagger';

import { CreateStrengthCategoryDto } from '@/modules/strength-category/dto/create-strength-category.dto';

export class UpdateStrengthCategoryDto extends PartialType(CreateStrengthCategoryDto) {}
