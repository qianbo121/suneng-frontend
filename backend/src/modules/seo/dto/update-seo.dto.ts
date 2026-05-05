import { PartialType } from '@nestjs/swagger';

import { CreateSeoDto } from '@/modules/seo/dto/create-seo.dto';

export class UpdateSeoDto extends PartialType(CreateSeoDto) {}
