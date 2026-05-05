import { PartialType } from '@nestjs/swagger';

import { CreateDeliveryDto } from '@/modules/delivery/dto/create-delivery.dto';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {}
