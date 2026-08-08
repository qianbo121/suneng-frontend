import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { Public } from '@/common/decorators/public.decorator';
import {
  ShujuNewsOfflineDto,
  ShujuNewsPublishDto,
} from '@/modules/shuju-service/dto/shuju-news-publish.dto';
import {
  ShujuNewsPublishAuthGuard,
  ShujuPublishRequest,
} from '@/modules/shuju-service/shuju-news-publish-auth.guard';
import { ShujuNewsPublishService } from '@/modules/shuju-service/shuju-news-publish.service';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

@ApiTags('Shuju news publishing')
@ApiBearerAuth('shuju-news-publish')
@Public()
@UseGuards(ShujuNewsPublishAuthGuard)
@Controller('svc/news')
export class ShujuNewsPublishController {
  private readonly logger = new Logger(ShujuNewsPublishController.name);

  constructor(private readonly service: ShujuNewsPublishService) {}

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES },
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
          callback(new BadRequestException('Unsupported image type') as unknown as Error, false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Transfer one Shuju news image into official-site storage' })
  async media(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: ShujuPublishRequest,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const result = await this.service.uploadMedia(file);
    this.audit('media', req, { sha256: result.sha256, replayed: result.replayed });
    return result;
  }

  @Post('publish')
  @ApiOperation({ summary: 'Idempotently publish or update a Shuju-owned news item' })
  async publish(@Body() dto: ShujuNewsPublishDto, @Req() req: ShujuPublishRequest) {
    const result = await this.service.publish(dto, req.shujuPublisher?.jti ?? '');
    this.audit('publish', req, {
      sourceDraftId: dto.sourceDraftId,
      sourceVersion: dto.sourceVersion,
      newsId: result.publication.newsId,
      replayed: result.replayed,
    });
    return result;
  }

  @Post('offline')
  @ApiOperation({
    summary: 'Idempotently take a Shuju-owned news item offline without deleting it',
  })
  async offline(@Body() dto: ShujuNewsOfflineDto, @Req() req: ShujuPublishRequest) {
    const result = await this.service.offline(dto, req.shujuPublisher?.jti ?? '');
    this.audit('offline', req, {
      sourceDraftId: dto.sourceDraftId,
      sourceVersion: dto.sourceVersion,
      newsId: result.publication.newsId,
      replayed: result.replayed,
    });
    return result;
  }

  private audit(action: string, request: ShujuPublishRequest, detail: Record<string, unknown>) {
    this.logger.log(
      JSON.stringify({
        event: 'shuju_news_publish_operation',
        action,
        subject: request.shujuPublisher?.subject ?? 'unknown',
        scope: request.shujuPublisher?.scope ?? 'unknown',
        requestId: request.shujuPublisher?.jti ?? '',
        ...detail,
      }),
    );
  }
}
