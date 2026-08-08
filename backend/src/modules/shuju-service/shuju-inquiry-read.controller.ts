import { Controller, Get, Logger, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  async list(@Query() query: ShujuInquiryReadQueryDto, @Req() request: InquiryServiceRequest) {
    const result = await this.service.list(query);
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
