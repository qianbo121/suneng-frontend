import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { ShujuGrowthReadQueryDto } from '@/modules/shuju-service/dto/shuju-growth-read-query.dto';
import { ShujuGrowthOverviewDto } from '@/modules/shuju-service/dto/shuju-growth-overview.dto';
import {
  GrowthServiceRequest,
  ShujuGrowthReadAuthGuard,
} from '@/modules/shuju-service/shuju-growth-read-auth.guard';
import { ShujuGrowthReadService } from '@/modules/shuju-service/shuju-growth-read.service';

@ApiTags('Shuju growth service')
@ApiBearerAuth('shuju-growth-read')
@Public()
@UseGuards(ShujuGrowthReadAuthGuard)
@Controller('svc/growth')
export class ShujuGrowthReadController {
  private readonly logger = new Logger(ShujuGrowthReadController.name);

  constructor(private readonly service: ShujuGrowthReadService) {}

  @Post('overview')
  @HttpCode(200)
  @ApiOperation({ summary: 'Read privacy-safe growth aggregates with internal inquiry review' })
  async reviewedOverview(
    @Body() body: ShujuGrowthOverviewDto,
    @Req() request: GrowthServiceRequest,
  ) {
    // The class-level service guard also protects this read-only POST. No browser review input.
    return this.overview(body, request);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Read privacy-safe website growth aggregates' })
  async overview(@Query() query: ShujuGrowthReadQueryDto, @Req() request: GrowthServiceRequest) {
    const result = await this.service.overview(query);
    this.logger.log(
      JSON.stringify({
        event: 'shuju_growth_overview_read',
        subject: request.shujuGrowthService?.subject ?? 'unknown',
        requestId: request.shujuGrowthService?.jti ?? '',
        startDate: result.range.startDate,
        endDate: result.range.endDate,
        sourceRows: result.sources.length,
        pageRows: result.pages.length,
      }),
    );
    return result;
  }
}
