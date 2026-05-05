import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

import { UploadStorage } from '@/modules/upload/storage/upload-storage.interface';

@Injectable()
export class LocalUploadStorageService implements UploadStorage {
  constructor(private readonly configService: ConfigService) {}

  async save(file: Express.Multer.File): Promise<string> {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadRoot = this.configService.get<string>('uploadRoot') ?? 'uploads';
    const dirPath = path.join(process.cwd(), uploadRoot, year, month);
    const extension = path.extname(file.originalname) || '';
    const fileName = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
    const filePath = path.join(dirPath, fileName);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    const appUrl = this.configService.get<string>('appUrl') ?? 'http://localhost:3001';
    const relativePath = [uploadRoot, year, month, fileName].join('/').replace(/\\/g, '/');

    return `${appUrl}/${relativePath}`;
  }

  async saveMany(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.save(file)));
  }
}
