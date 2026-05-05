import { Module } from '@nestjs/common';

import { CertificateController } from '@/modules/certificate/certificate.controller';
import { CertificateService } from '@/modules/certificate/certificate.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule {}
