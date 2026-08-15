import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { INQUIRY_CONTRACT_VERSION } from '@/modules/custom-requirement/inquiry-contract';

@ApiTags('system')
@Controller()
export class AppController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return {
      service: 'backend',
      status: 'ok',
      inquiryContractVersion: INQUIRY_CONTRACT_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}
