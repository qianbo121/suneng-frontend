import { Controller, Get, Logger, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { ShujuNewsReadQueryDto } from '@/modules/shuju-service/dto/shuju-news-read-query.dto';
import { ShujuNewsReadService } from '@/modules/shuju-service/shuju-news-read.service';
import { ShujuServiceAuthGuard } from '@/modules/shuju-service/shuju-service-auth.guard';

type ServiceRequest = Request & {
  shujuService?: { subject: string; scope: string; jti: string };
};

@ApiTags('Shuju service')
@ApiBearerAuth('shuju-service')
@Public()
@UseGuards(ShujuServiceAuthGuard)
@Controller('svc/news')
export class ShujuNewsReadController {
  private readonly logger = new Logger(ShujuNewsReadController.name);

  constructor(private readonly service: ShujuNewsReadService) {}

  @Get('read')
  @ApiOperation({ summary: 'Read the official news list for Shuju shadow comparison' })
  async list(@Query() query: ShujuNewsReadQueryDto, @Req() request: ServiceRequest) {
    const result = await this.service.list(query);
    this.logger.log(
      JSON.stringify({
        event: 'shuju_service_news_read',
        subject: request.shujuService?.subject ?? 'unknown',
        scope: request.shujuService?.scope ?? 'unknown',
        requestId: request.shujuService?.jti ?? '',
        status: query.status ?? null,
        categoryId: query.categoryId ?? null,
        keywordPresent: Boolean(query.keyword),
        page: result.page,
        pageSize: result.pageSize,
        returned: result.items.length,
        total: result.total,
      }),
    );
    return result;
  }

  @Get('categories')
  @ApiOperation({ summary: 'Read published official news categories for Shuju drafts' })
  async categories(@Req() request: ServiceRequest) {
    const items = await this.service.listCategories();
    this.logger.log(
      JSON.stringify({
        event: 'shuju_service_news_categories',
        subject: request.shujuService?.subject ?? 'unknown',
        scope: request.shujuService?.scope ?? 'unknown',
        requestId: request.shujuService?.jti ?? '',
        returned: items.length,
      }),
    );
    return { items };
  }
}
