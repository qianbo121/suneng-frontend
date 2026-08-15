import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { CreateLegacyCustomRequirementDto } from '@/modules/custom-requirement/dto/create-legacy-custom-requirement.dto';
import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';
import { CustomRequirementListQueryDto } from '@/modules/custom-requirement/dto/custom-requirement-list-query.dto';
import { ManageInquiryNotificationDto } from '@/modules/custom-requirement/dto/manage-inquiry-notification.dto';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

@ApiTags('Custom Requirement')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class CustomRequirementController {
  constructor(private readonly service: CustomRequirementService) {}

  @Post('v1/custom-requirements')
  @Public()
  @ApiOperation({ summary: 'Submit legacy custom furnace requirement' })
  createLegacyPublic(@Body() dto: CreateLegacyCustomRequirementDto, @Req() request: Request) {
    const clientKey = request.ip || dto.phone || dto.name || dto.company || 'anonymous';
    return this.service.createLegacyPublic(dto, clientKey);
  }

  @Post('v2/custom-requirements')
  @Public()
  @ApiOperation({ summary: 'Submit custom furnace requirement with evidence chain' })
  createPublic(@Body() dto: CreateCustomRequirementDto, @Req() request: Request) {
    const clientKey =
      request.ip || dto.phone || dto.email || dto.name || dto.company || 'anonymous';
    return this.service.createPublic(dto, clientKey);
  }

  @Post('admin/custom-requirements/search')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Search custom requirement list for admin without URL query PII' })
  getAdminList(@Body() query: CustomRequirementListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Patch('admin/custom-requirements/:id/follow')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Mark custom requirement as followed' })
  markFollowed(@Param('id', ParseIntPipe) id: number) {
    return this.service.markFollowed(id);
  }

  @Patch('admin/custom-requirements/:id/notification')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Manually resolve or requeue an inquiry notification' })
  manageNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ManageInquiryNotificationDto,
    @CurrentUser() operator: AuthenticatedUser,
  ) {
    return this.service.manageNotification(id, dto, operator);
  }

  @Get('admin/custom-requirements/:id/notification-audits')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Read append-only inquiry notification audit records' })
  getNotificationAudits(@Param('id', ParseIntPipe) id: number) {
    return this.service.getNotificationAudits(id);
  }
}
