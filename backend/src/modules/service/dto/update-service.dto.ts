import { PartialType } from '@nestjs/swagger';

import { CreateServiceDto } from '@/modules/service/dto/create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
