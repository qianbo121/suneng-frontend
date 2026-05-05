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

import { Public } from '@/common/decorators/public.decorator';
import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { CreateServiceDto } from '@/modules/service/dto/create-service.dto';
import { ServiceListQueryDto } from '@/modules/service/dto/service-list-query.dto';
import { UpdateServiceDto } from '@/modules/service/dto/update-service.dto';
import { ServiceService } from '@/modules/service/service.service';

@ApiTags('Service Section')
@Controller()
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Get('v1/services')
  @Public()
  @ApiOperation({ summary: 'Get published service sections' })
  getPublicList() {
    return this.service.getPublicList();
  }

  @Get('admin/services')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get service section list for admin' })
  getAdminList(@Query() query: ServiceListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/services/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get service section detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/services')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create service section' })
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @Patch('admin/services/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update service section' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/services/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update service section status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/services/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete service section' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
