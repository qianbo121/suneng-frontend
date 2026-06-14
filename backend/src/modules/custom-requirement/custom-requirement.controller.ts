import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';
import { CustomRequirementListQueryDto } from '@/modules/custom-requirement/dto/custom-requirement-list-query.dto';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';

@ApiTags('Custom Requirement')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class CustomRequirementController {
  constructor(private readonly service: CustomRequirementService) {}

  @Post('v1/custom-requirements')
  @Public()
  @ApiOperation({ summary: 'Submit custom furnace requirement' })
  createPublic(@Body() dto: CreateCustomRequirementDto, @Req() request: Request) {
    const clientKey = request.ip || dto.phone || dto.name || dto.company || 'anonymous';
    return this.service.createPublic(dto, clientKey);
  }

  @Get('admin/custom-requirements')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get custom requirement list for admin' })
  getAdminList(@Query() query: CustomRequirementListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Patch('admin/custom-requirements/:id/follow')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Mark custom requirement as followed' })
  markFollowed(@Param('id', ParseIntPipe) id: number) {
    return this.service.markFollowed(id);
  }
}
