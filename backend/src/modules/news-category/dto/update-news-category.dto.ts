import { PartialType } from '@nestjs/swagger';

import { CreateNewsCategoryDto } from '@/modules/news-category/dto/create-news-category.dto';

export class UpdateNewsCategoryDto extends PartialType(CreateNewsCategoryDto) {}
