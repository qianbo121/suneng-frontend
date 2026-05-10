import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp = require('sharp');

import { UploadStorage } from '@/modules/upload/storage/upload-storage.interface';

const COMPRESSIBLE_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_WIDTH = 1200;
const WEBP_QUALITY = 80;

@Injectable()
export class LocalUploadStorageService implements UploadStorage {
  constructor(private readonly configService: ConfigService) {}

  async save(file: Express.Multer.File): Promise<string> {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadRoot = this.configService.get<string>('uploadRoot') ?? 'uploads';
    const dirPath = path.join(process.cwd(), uploadRoot, year, month);
    const processedFile = await this.processImage(file);
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

  private async processImage(file: Express.Multer.File): Promise<{ buffer: Buffer; extension: string }> {
    if (!COMPRESSIBLE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      const extension = path.extname(file.originalname).toLowerCase() || '';
      return {
        buffer: file.buffer,
        extension,
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
