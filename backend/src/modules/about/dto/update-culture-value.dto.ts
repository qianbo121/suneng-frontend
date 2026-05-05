import { PartialType } from '@nestjs/swagger';

import { CreateCultureValueDto } from '@/modules/about/dto/create-culture-value.dto';

export class UpdateCultureValueDto extends PartialType(CreateCultureValueDto) {}
