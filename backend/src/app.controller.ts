import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';

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
      timestamp: new Date().toISOString(),
    };
  }
}
