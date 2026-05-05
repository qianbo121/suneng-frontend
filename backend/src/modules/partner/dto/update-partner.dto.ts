import { PartialType } from '@nestjs/swagger';

import { CreatePartnerDto } from '@/modules/partner/dto/create-partner.dto';

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
