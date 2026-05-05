import { PartialType } from '@nestjs/swagger';

import { CreateStrengthItemDto } from '@/modules/strength-item/dto/create-strength-item.dto';

export class UpdateStrengthItemDto extends PartialType(CreateStrengthItemDto) {}
