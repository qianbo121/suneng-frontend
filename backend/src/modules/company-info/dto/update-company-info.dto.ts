import { PartialType } from '@nestjs/swagger';

import { CreateCompanyInfoDto } from '@/modules/company-info/dto/create-company-info.dto';

export class UpdateCompanyInfoDto extends PartialType(CreateCompanyInfoDto) {}
