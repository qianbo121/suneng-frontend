import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { UploadResultDto } from '@/modules/upload/dto/upload-result.dto';
import { UploadService } from '@/modules/upload/upload.service';

// Multer limits are decorator metadata, so this is resolved at import time and
// cannot come from ConfigService. Parse it strictly all the same: a malformed
// value used to become NaN, and every size comparison against NaN is false,
// which silently removed the upload size limit instead of failing the boot.
function uploadLimitBytes(raw: string | undefined) {
  const normalized = (raw ?? '10').trim();
  if (!/^[1-9]\d*$/.test(normalized)) {
    throw new Error('UPLOAD_MAX_FILE_SIZE_MB must be a positive integer number of megabytes');
  }
  return Number(normalized) * 1024 * 1024;
}

const MAX_FILE_SIZE = uploadLimitBytes(process.env.UPLOAD_MAX_FILE_SIZE_MB);

// SVG is intentionally excluded: it carries no magic bytes (so server-side
// type detection cannot vouch for it) and can embed scripts. The client
// mimetype below is only a first filter; real content type is verified by
// magic bytes in LocalUploadStorageService.
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const fileFilter = (
  _request: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(new BadRequestException('Unsupported file type') as unknown as Error, false);
    return;
  }

  callback(null, true);
};

@ApiTags('Admin Upload')
@ApiBearerAuth()
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller('admin/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a single file' })
  uploadSingle(@UploadedFile() file?: Express.Multer.File): Promise<UploadResultDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.uploadService.uploadSingle(file);
  }

  @Post('batch')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['files'],
    },
  })
  @ApiOperation({ summary: 'Upload multiple files' })
  uploadBatch(@UploadedFiles() files?: Express.Multer.File[]): Promise<UploadResultDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    return this.uploadService.uploadBatch(files);
  }
}
