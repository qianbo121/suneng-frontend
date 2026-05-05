import { PartialType } from '@nestjs/swagger';

import { CreateChairmanMessageDto } from '@/modules/about/dto/create-chairman-message.dto';

export class UpdateChairmanMessageDto extends PartialType(CreateChairmanMessageDto) {}
