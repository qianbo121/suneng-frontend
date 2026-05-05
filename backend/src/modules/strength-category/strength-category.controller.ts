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
import { CreateStrengthCategoryDto } from '@/modules/strength-category/dto/create-strength-category.dto';
import { StrengthCategoryListQueryDto } from '@/modules/strength-category/dto/strength-category-list-query.dto';
import { UpdateStrengthCategoryDto } from '@/modules/strength-category/dto/update-strength-category.dto';
import { StrengthCategoryService } from '@/modules/strength-category/strength-category.service';

@ApiTags('Strength Category')
@Controller()
export class StrengthCategoryController {
  constructor(private readonly service: StrengthCategoryService) {}

  @Get('v1/strength/categories')
  @Public()
  @ApiOperation({ summary: 'Get published strength categories' })
  getPublicList() {
    return this.service.getPublicList();
  }

  @Get('admin/strength-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get strength category list for admin' })
  getAdminList(@Query() query: StrengthCategoryListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/strength-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get strength category detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/strength-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create strength category' })
  create(@Body() dto: CreateStrengthCategoryDto) {
    return this.service.create(dto);
  }

  @Patch('admin/strength-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update strength category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStrengthCategoryDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/strength-categories/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update strength category status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/strength-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete strength category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
