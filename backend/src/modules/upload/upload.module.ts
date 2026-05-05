import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UploadController } from '@/modules/upload/upload.controller';
import { UploadService } from '@/modules/upload/upload.service';
import { LocalUploadStorageService } from '@/modules/upload/storage/local-upload-storage.service';
import { UPLOAD_STORAGE } from '@/modules/upload/storage/upload-storage.interface';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalUploadStorageService,
    {
      provide: UPLOAD_STORAGE,
      useExisting: LocalUploadStorageService,
    },
  ],
  exports: [UploadService, UPLOAD_STORAGE],
})
export class UploadModule {}
