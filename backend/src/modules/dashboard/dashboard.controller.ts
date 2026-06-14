import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';

import { DashboardService } from '@/modules/dashboard/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
