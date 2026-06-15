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
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import type { Request, Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';
import { NewsListQueryDto } from '@/modules/news/dto/news-list-query.dto';
import { UpdateNewsDto } from '@/modules/news/dto/update-news.dto';
import { NewsService } from '@/modules/news/news.service';

const VIEWED_NEWS_COOKIE = 'nv';

// Parse the per-day "viewed news" cookie: "<YYYY-MM-DD>|<id>,<id>,...".
// A different day resets the set, so the cookie never grows unbounded.
function parseViewedNews(cookieHeader: string | undefined, today: string): Set<number> {
  const viewed = new Set<number>();
  if (!cookieHeader) return viewed;
  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VIEWED_NEWS_COOKIE}=`));
  if (!entry) return viewed;
  const [date, ids] = decodeURIComponent(entry.slice(VIEWED_NEWS_COOKIE.length + 1)).split('|');
  if (date !== today || !ids) return viewed;
  for (const id of ids.split(',')) {
    const value = Number(id);
    if (Number.isInteger(value)) viewed.add(value);
  }
  return viewed;
}

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
  @ApiOperation({ summary: 'Get published news detail' })
  getPublicDetail(@Param('slug') slug: string) {
    return this.service.getPublicDetail(slug);
  }

  @Post('v1/news/:id/view')
  @Public()
  @ApiOperation({ summary: 'Register a news view (idempotent per viewer per day)' })
  async registerView(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ counted: boolean }> {
    const today = new Date().toISOString().slice(0, 10);
    const viewed = parseViewedNews(request.headers.cookie, today);
    if (viewed.has(id)) {
      return { counted: false };
    }
    await this.service.registerView(id);
    viewed.add(id);
    response.cookie(VIEWED_NEWS_COOKIE, `${today}|${[...viewed].join(',')}`, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { counted: true };
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
