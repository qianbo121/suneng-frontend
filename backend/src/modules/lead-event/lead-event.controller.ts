import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateLeadEventDto } from '@/modules/lead-event/dto/create-lead-event.dto';
import { LeadEventListQueryDto } from '@/modules/lead-event/dto/lead-event-list-query.dto';
import { LeadEventService } from '@/modules/lead-event/lead-event.service';

@ApiTags('Lead Event')
@Controller()
export class LeadEventController {
  constructor(private readonly service: LeadEventService) {}

  @Post('v1/lead-events')
  @Public()
  @ApiOperation({ summary: 'Track public lead interaction event' })
  createPublic(@Body() dto: CreateLeadEventDto, @Req() request: Request) {
    return this.service.createPublic(dto, request);
  }

  @Get('admin/analytics/lead-events')
  @Roles(AdminRole.super_admin, AdminRole.editor)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get lead events for analytics bridge' })
  getAdminEvents(@Query() query: LeadEventListQueryDto) {
    return this.service.getAdminEvents(query);
  }
}
