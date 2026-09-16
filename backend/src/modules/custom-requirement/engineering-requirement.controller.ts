import {
  BadRequestException,
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Injectable,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ensureNotSpam, type SpamThrottleState } from '@/common/utils/spam-throttle';
import { UploadService } from '@/modules/upload/upload.service';
import { CustomRequirementService } from './custom-requirement.service';
import { CreateCustomRequirementDto } from './dto/create-custom-requirement.dto';

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/;
const MAX_SIZE = 5 * 1024 * 1024;
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export class EngineeringRequirementDto extends CreateCustomRequirementDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @MaxLength(3000, { each: true })
  attachments?: string[];
}
type Receipt = {
  purpose: 'engineering-inquiry';
  key: string;
  url: string;
  name: string;
  expires: number;
};

@Injectable()
export class InquiryUploadThrottle implements CanActivate {
  private readonly clients = new Map<string, SpamThrottleState>();
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    // Runs before multipart buffers are accepted; does not trust a client-supplied contact.
    ensureNotSpam(request.ip || 'anonymous', this.clients, {
      minIntervalMs: 0,
      maxSubmissions: 18,
    });
    return true;
  }
}

@Injectable()
export class InquiryAttachmentReceipts {
  constructor(private readonly config: ConfigService) {}
  private signature(body: string) {
    const secret = this.config.get<string>('jwtSecret');
    if (!secret) throw new BadRequestException('Attachment service is not configured');
    return createHmac('sha256', secret).update(`engineering-inquiry:${body}`).digest('base64url');
  }
  issue(key: string, url: string, name: string) {
    const receipt: Receipt = {
      purpose: 'engineering-inquiry',
      key,
      url,
      name: name.replace(/[\r\n\u0000-\u001f]/g, ' ').slice(0, 120),
      expires: Date.now() + 24 * 60 * 60 * 1000,
    };
    const body = Buffer.from(JSON.stringify(receipt)).toString('base64url');
    return `${body}.${this.signature(body)}`;
  }
  read(token: string, key: string): Receipt {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) throw new Error();
      const [body, supplied] = parts;
      const expected = Buffer.from(this.signature(body));
      const actual = Buffer.from(supplied);
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
        throw new Error();
      const receipt = JSON.parse(Buffer.from(body, 'base64url').toString()) as Receipt;
      if (
        receipt.purpose !== 'engineering-inquiry' ||
        receipt.key !== key ||
        receipt.expires < Date.now()
      )
        throw new Error();
      return receipt;
    } catch {
      throw new BadRequestException('Attachment confirmation is invalid or expired; upload again');
    }
  }
}

@Public()
@Controller('v2/engineering-requirements')
export class EngineeringRequirementController {
  constructor(
    private readonly requirements: CustomRequirementService,
    private readonly uploads: UploadService,
    private readonly receipts: InquiryAttachmentReceipts,
  ) {}

  @Post('attachments')
  @UseGuards(InquiryUploadThrottle)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE, files: 1, fields: 1, fieldSize: 200, parts: 3 },
      fileFilter: (_req, file, cb) => {
        cb(
          MIME_TYPES.includes(file.mimetype)
            ? null
            : new BadRequestException('Only JPG, PNG, WebP and PDF are supported'),
          MIME_TYPES.includes(file.mimetype),
        );
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('inquiryKey') inquiryKey: unknown,
  ) {
    if (!file?.size || typeof inquiryKey !== 'string' || !KEY_PATTERN.test(inquiryKey))
      throw new BadRequestException('File and inquiry key are required');
    // Existing storage checks magic bytes, decodes images and assigns random filenames.
    const { urls } = await this.uploads.uploadSingle(file);
    return { receipt: this.receipts.issue(inquiryKey, urls[0], file.originalname) };
  }

  @Post()
  create(@Body() dto: EngineeringRequirementDto, @Req() request: Request) {
    const attachments = [...new Set(dto.attachments || [])].map((token) =>
      this.receipts.read(token, dto.idempotencyKey || ''),
    );
    const appendix = attachments.length
      ? `\n\n附件资料：\n${attachments.map((file) => `${file.name}：${file.url}`).join('\n')}`
      : '';
    // Keep attachment URLs in the existing persisted requirement and notification trail;
    // no new public gallery, admin upload permission, or database migration is introduced.
    if (dto.requirement.length + appendix.length > 8000)
      throw new BadRequestException(
        `需求正文过长，请缩短至${8000 - appendix.length}字以内，为附件资料留出空间。已保留填写内容和附件。`,
      );
    const inquiry = { ...dto };
    delete inquiry.attachments;
    return this.requirements.createPublic(
      {
        ...inquiry,
        requirement: dto.requirement + appendix,
        deviceType: /Android|iPhone|iPad|Mobile/i.test(request.get('user-agent') || '')
          ? '移动端'
          : 'PC',
      },
      request.ip || 'anonymous',
      request.ip,
    );
  }
}
