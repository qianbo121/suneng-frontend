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
import { CreateNewsCategoryDto } from '@/modules/news-category/dto/create-news-category.dto';
import { NewsCategoryListQueryDto } from '@/modules/news-category/dto/news-category-list-query.dto';
import { UpdateNewsCategoryDto } from '@/modules/news-category/dto/update-news-category.dto';
import { NewsCategoryService } from '@/modules/news-category/news-category.service';

@ApiTags('News Category')
@Controller()
export class NewsCategoryController {
  constructor(private readonly service: NewsCategoryService) {}

  @Get('v1/news/categories')
  @Public()
  @ApiOperation({ summary: 'Get published news categories' })
  getPublicList() {
    return this.service.getPublicList();
  }

  @Get('admin/news-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get news category list for admin' })
  getAdminList(@Query() query: NewsCategoryListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/news-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get news category detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/news-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create news category' })
  create(@Body() dto: CreateNewsCategoryDto) {
    return this.service.create(dto);
  }

  @Patch('admin/news-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update news category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNewsCategoryDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/news-categories/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update news category status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/news-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete news category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
