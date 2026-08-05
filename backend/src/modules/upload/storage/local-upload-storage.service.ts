import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

import { UploadStorage } from '@/modules/upload/storage/upload-storage.interface';

const COMPRESSIBLE_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// Real content types allowed on disk, verified by magic bytes (not the
// forgeable client mimetype). SVG is excluded by design.
const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]);
const EXTENSION_BY_CONTENT_TYPE = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
]);
const MAX_IMAGE_WIDTH = 1200;
const WEBP_QUALITY = 80;

type DetectedUploadType = {
  mime: string;
  extension: string;
};

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  return bytes.every((byte, index) => buffer[index] === byte);
}

function detectAllowedUploadType(buffer: Buffer): DetectedUploadType | undefined {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return { mime: 'image/jpeg', extension: '.jpg' };
  }
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: 'image/png', extension: '.png' };
  }
  const gifHeader = buffer.subarray(0, 6).toString('ascii');
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return { mime: 'image/gif', extension: '.gif' };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', extension: '.webp' };
  }
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { mime: 'application/pdf', extension: '.pdf' };
  }
  return undefined;
}

@Injectable()
export class LocalUploadStorageService implements UploadStorage {
  constructor(private readonly configService: ConfigService) {}

  async save(file: Express.Multer.File): Promise<string> {
    const detectedType = await this.assertAllowedContentType(file);
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadRoot = this.configService.get<string>('uploadRoot') ?? 'uploads';
    const dirPath = path.join(process.cwd(), uploadRoot, year, month);
    const processedFile = await this.processImage(file, detectedType);
    const fileName = `${Date.now()}-${randomUUID()}${processedFile.extension}`;
    const filePath = path.join(dirPath, fileName);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, processedFile.buffer);

    const appUrl = this.configService.get<string>('appUrl') ?? 'http://localhost:3001';
    const relativePath = [uploadRoot, year, month, fileName].join('/').replace(/\\/g, '/');

    return `${appUrl}/${relativePath}`;
  }

  async saveMany(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.save(file)));
  }

  // Verify the real content type from magic bytes; the client-supplied
  // mimetype is forgeable. Runs on the full in-memory buffer (memoryStorage),
  // so it is reliable here (unlike multer's fileFilter).
  private async assertAllowedContentType(file: Express.Multer.File): Promise<DetectedUploadType> {
    const detected = detectAllowedUploadType(file.buffer);
    if (!detected || !ALLOWED_CONTENT_TYPES.has(detected.mime)) {
      throw new BadRequestException('File content does not match an allowed type');
    }

    const extension = EXTENSION_BY_CONTENT_TYPE.get(detected.mime);
    if (!extension) {
      throw new BadRequestException('File content does not match an allowed type');
    }

    return {
      mime: detected.mime,
      extension,
    };
  }

  private async processImage(
    file: Express.Multer.File,
    detectedType: DetectedUploadType,
  ): Promise<{ buffer: Buffer; extension: string }> {
    if (!COMPRESSIBLE_IMAGE_MIME_TYPES.has(detectedType.mime)) {
      return {
        buffer: file.buffer,
        extension: detectedType.extension,
      };
    }

    try {
      const buffer = await sharp(file.buffer)
        .rotate()
        .resize({
          width: MAX_IMAGE_WIDTH,
          withoutEnlargement: true,
        })
        .webp({
          quality: WEBP_QUALITY,
        })
        .toBuffer();

      return {
        buffer,
        extension: '.webp',
      };
    } catch {
      throw new BadRequestException('Invalid image file');
    }
  }
}
