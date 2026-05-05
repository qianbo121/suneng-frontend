import { PartialType } from '@nestjs/swagger';

import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
