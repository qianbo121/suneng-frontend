import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';

import { Public } from '@/common/decorators/public.decorator';
import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { CreateSalesOutletDto } from '@/modules/sales-outlet/dto/create-sales-outlet.dto';
import { SalesOutletListQueryDto } from '@/modules/sales-outlet/dto/sales-outlet-list-query.dto';
import { UpdateSalesOutletDto } from '@/modules/sales-outlet/dto/update-sales-outlet.dto';
import { SalesOutletService } from '@/modules/sales-outlet/sales-outlet.service';

@ApiTags('Sales Outlet')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class SalesOutletController {
  constructor(private readonly service: SalesOutletService) {}

  @Get('v1/sales-outlets')
  @Public()
  @ApiOperation({ summary: 'Get published sales outlets' })
  getPublicList() {
    return this.service.getPublicList();
  }

  @Get('admin/sales-outlets')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get sales outlet list for admin' })
  getAdminList(@Query() query: SalesOutletListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/sales-outlets/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get sales outlet detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/sales-outlets')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create sales outlet' })
  create(@Body() dto: CreateSalesOutletDto) {
    return this.service.create(dto);
  }

  @Patch('admin/sales-outlets/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update sales outlet' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalesOutletDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/sales-outlets/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update sales outlet status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/sales-outlets/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete sales outlet' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
