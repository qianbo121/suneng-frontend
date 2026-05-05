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
import { CreateDeliveryDto } from '@/modules/delivery/dto/create-delivery.dto';
import { DeliveryListQueryDto } from '@/modules/delivery/dto/delivery-list-query.dto';
import { UpdateDeliveryDto } from '@/modules/delivery/dto/update-delivery.dto';
import { DeliveryService } from '@/modules/delivery/delivery.service';

@ApiTags('Delivery')
@Controller()
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Get('v1/deliveries')
  @Public()
  @ApiOperation({ summary: 'Get published deliveries' })
  getPublicList(@Query() query: DeliveryListQueryDto) {
    return this.service.getPublicList(query);
  }

  @Get('admin/deliveries')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get delivery list for admin' })
  getAdminList(@Query() query: DeliveryListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/deliveries/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get delivery detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/deliveries')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create delivery' })
  create(@Body() dto: CreateDeliveryDto) {
    return this.service.create(dto);
  }

  @Patch('admin/deliveries/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update delivery' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDeliveryDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/deliveries/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update delivery status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/deliveries/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete delivery' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
