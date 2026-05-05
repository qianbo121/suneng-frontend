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
import { CreateStrengthItemDto } from '@/modules/strength-item/dto/create-strength-item.dto';
import { StrengthItemListQueryDto } from '@/modules/strength-item/dto/strength-item-list-query.dto';
import { UpdateStrengthItemDto } from '@/modules/strength-item/dto/update-strength-item.dto';
import { StrengthItemService } from '@/modules/strength-item/strength-item.service';

@ApiTags('Strength Item')
@Controller()
export class StrengthItemController {
  constructor(private readonly service: StrengthItemService) {}

  @Get('v1/strength/items')
  @Public()
  @ApiOperation({ summary: 'Get published strength items' })
  getPublicList(@Query() query: StrengthItemListQueryDto) {
    return this.service.getPublicList(query);
  }

  @Get('admin/strength-items')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get strength item list for admin' })
  getAdminList(@Query() query: StrengthItemListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/strength-items/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get strength item detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/strength-items')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create strength item' })
  create(@Body() dto: CreateStrengthItemDto) {
    return this.service.create(dto);
  }

  @Patch('admin/strength-items/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update strength item' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStrengthItemDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/strength-items/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update strength item status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/strength-items/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete strength item' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
