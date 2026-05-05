import { PartialType } from '@nestjs/swagger';

import { CreateCertificateDto } from '@/modules/certificate/dto/create-certificate.dto';

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
