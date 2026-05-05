import { PartialType } from '@nestjs/swagger';

import { CreateAboutSectionDto } from '@/modules/about/dto/create-about-section.dto';

export class UpdateAboutSectionDto extends PartialType(CreateAboutSectionDto) {}
