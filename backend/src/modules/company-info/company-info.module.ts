import { Module } from '@nestjs/common';

import { CompanyInfoController } from '@/modules/company-info/company-info.controller';
import { CompanyInfoService } from '@/modules/company-info/company-info.service';

@Module({
  controllers: [CompanyInfoController],
  providers: [CompanyInfoService],
})
export class CompanyInfoModule {}
