import { Controller, Get, Logger, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { ShujuInquiryReadQueryDto } from '@/modules/shuju-service/dto/shuju-inquiry-read-query.dto';
import {
  InquiryServiceRequest,
  ShujuInquiryReadAuthGuard,
} from '@/modules/shuju-service/shuju-inquiry-read-auth.guard';
import { ShujuInquiryReadService } from '@/modules/shuju-service/shuju-inquiry-read.service';

@ApiTags('Shuju inquiry service')
@ApiBearerAuth('shuju-inquiry-read')
@Public()
@UseGuards(ShujuInquiryReadAuthGuard)
@Controller('svc/inquiries')
export class ShujuInquiryReadController {
  private readonly logger = new Logger(ShujuInquiryReadController.name);

  constructor(private readonly service: ShujuInquiryReadService) {}

  @Get('head')
  @ApiOperation({ summary: 'Read the inquiry cutover cursor without returning inquiry content' })
  async head(@Req() request: InquiryServiceRequest) {
    const result = await this.service.head();
    this.audit(request, 'head', { maxId: result.maxId });
    return result;
  }

  @Get('read')
  @ApiOperation({ summary: 'Read new website inquiries after the protected cutover cursor' })
  @ApiHeader({
    name: 'X-Shuju-First-Record-Id',
    description: 'First source record id in this page, for isolating an oversized record',
    required: false,
  })
  async list(
    @Query() query: ShujuInquiryReadQueryDto,
    @Req() request: InquiryServiceRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.service.list(query);
    const firstRecordId = result.items[0]?.id;
    if (firstRecordId !== undefined) {
      // Headers arrive before consumers read or size-check the response body. Never include PII.
      response.setHeader('X-Shuju-First-Record-Id', String(firstRecordId));
    }
    this.audit(request, 'read', {
      afterId: query.afterId,
      returned: result.items.length,
      replayed: result.replayItems.length,
      nextAfterId: result.nextAfterId,
      hasMore: result.hasMore,
    });
    return result;
  }

  private audit(request: InquiryServiceRequest, action: string, detail: Record<string, unknown>) {
    this.logger.log(
      JSON.stringify({
        event: `shuju_inquiry_${action}`,
        subject: request.shujuInquiryService?.subject ?? 'unknown',
        scope: request.shujuInquiryService?.scope ?? 'unknown',
        requestId: request.shujuInquiryService?.jti ?? '',
        ...detail,
      }),
    );
  }
}
