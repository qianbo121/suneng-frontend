import { Inject, Injectable } from '@nestjs/common';

import { UPLOAD_STORAGE, UploadStorage } from '@/modules/upload/storage/upload-storage.interface';

@Injectable()
export class UploadService {
  constructor(@Inject(UPLOAD_STORAGE) private readonly uploadStorage: UploadStorage) {}

  async uploadSingle(file: Express.Multer.File) {
    return {
      urls: [await this.uploadStorage.save(file)],
    };
  }

  async uploadBatch(files: Express.Multer.File[]) {
    return {
      urls: await this.uploadStorage.saveMany(files),
    };
  }
}
