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
import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';
import { NewsListQueryDto } from '@/modules/news/dto/news-list-query.dto';
import { UpdateNewsDto } from '@/modules/news/dto/update-news.dto';
import { NewsService } from '@/modules/news/news.service';

@ApiTags('News')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Get('v1/news/:id/prev-next')
  @Public()
  @ApiOperation({ summary: 'Get previous and next news items' })
  getPrevNext(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPrevNext(id);
  }

  @Get('v1/news')
  @Public()
  @ApiOperation({ summary: 'Get published news list' })
  getPublicList(@Query() query: NewsListQueryDto) {
    return this.service.getPublicList(query);
  }

  @Get('v1/news/:slug')
  @Public()
  @ApiOperation({ summary: 'Get published news detail and increment view count' })
  getPublicDetail(@Param('slug') slug: string) {
    return this.service.getPublicDetail(slug);
  }

  @Get('admin/news')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get news list for admin' })
  getAdminList(@Query() query: NewsListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/news/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get news detail for admin' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/news')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create news' })
  create(@Body() dto: CreateNewsDto) {
    return this.service.create(dto);
  }

  @Patch('admin/news/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update news' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNewsDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/news/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update news status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/news/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete news' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
