import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DashboardService } from '@/modules/dashboard/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
