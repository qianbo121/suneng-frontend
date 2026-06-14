import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LocalUploadStorageService } from '@/modules/upload/storage/local-upload-storage.service';

jest.mock('node:fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

// A real 1x1 PNG (valid magic bytes + decodable by sharp).
const REAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
);

function makeService(): LocalUploadStorageService {
  const config = {
    get: (key: string) =>
      key === 'uploadRoot' ? 'uploads' : key === 'appUrl' ? 'http://localhost:3001' : undefined,
  } as unknown as ConfigService;
  return new LocalUploadStorageService(config);
}

function file(buffer: Buffer, mimetype: string, originalname = 'x'): Express.Multer.File {
  return { buffer, mimetype, originalname } as unknown as Express.Multer.File;
}

describe('LocalUploadStorageService content-type validation', () => {
  it('rejects an SVG forged as image/png (SVG has no magic bytes)', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
    await expect(makeService().save(file(svg, 'image/png', 'evil.svg'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects arbitrary script bytes forged as image/jpeg', async () => {
    const evil = Buffer.from('<script>steal()</script>');
    await expect(makeService().save(file(evil, 'image/jpeg', 'evil.jpg'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('accepts a real PNG whose magic bytes match an allowed type', async () => {
    const url = await makeService().save(file(REAL_PNG, 'image/png', 'real.png'));
    expect(url).toContain('/uploads/');
  });
});
