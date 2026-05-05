import { PartialType } from '@nestjs/swagger';

import { CreateBannerDto } from '@/modules/banner/dto/create-banner.dto';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
