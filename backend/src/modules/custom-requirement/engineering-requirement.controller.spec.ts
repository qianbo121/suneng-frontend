import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Request } from 'express';
import {
  EngineeringRequirementController,
  EngineeringRequirementDto,
  InquiryAttachmentReceipts,
} from './engineering-requirement.controller';
import { CustomRequirementService } from './custom-requirement.service';
import { UploadService } from '@/modules/upload/upload.service';

const key = 'inquiry-local-test-123';
const payload = {
  formVariant: 'homepage_minimal',
  idempotencyKey: key,
  projectType: '热处理生产线',
  requirement: '材质未知，请协助判断。',
  identity: '本地测试',
  contact: 'local_test_2026',
  locale: 'zh',
};
describe('engineering inquiry attachments', () => {
  const receipts = new InquiryAttachmentReceipts(
    new ConfigService({ jwtSecret: 'test-key-not-production' }),
  );
  it('rejects forged, expired and cross-inquiry receipts', () => {
    const token = receipts.issue(key, 'http://localhost/uploads/test.webp', '工件.png');
    expect(receipts.read(token, key).name).toBe('工件.png');
    expect(() => receipts.read(token + 'x', key)).toThrow();
    expect(() => receipts.read(token, 'different-key')).toThrow();
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 25 * 60 * 60 * 1000);
    expect(() => receipts.read(token, key)).toThrow();
    jest.restoreAllMocks();
  });
  it('requires reply contact and limits the attachment list', async () => {
    const missing = plainToInstance(EngineeringRequirementDto, { ...payload, contact: '' });
    expect((await validate(missing)).some((e) => e.property === 'contact')).toBe(true);
    const excessive = plainToInstance(EngineeringRequirementDto, {
      ...payload,
      attachments: ['a', 'b', 'c', 'd'],
    });
    expect((await validate(excessive)).some((e) => e.property === 'attachments')).toBe(true);
    expect(await validate(plainToInstance(EngineeringRequirementDto, payload))).toHaveLength(0);
  });
  it('passes signed attachment references through the existing persisted inquiry and retry key', () => {
    const createPublic = jest.fn().mockResolvedValue({ submissionId: 'confirmed' });
    const controller = new EngineeringRequirementController(
      { createPublic } as unknown as CustomRequirementService,
      {} as UploadService,
      receipts,
    );
    const token = receipts.issue(key, 'http://localhost/uploads/file.webp', '设备.png');
    const dto = plainToInstance(EngineeringRequirementDto, { ...payload, attachments: [token] });
    const request = { ip: '127.0.0.1', get: () => 'test' } as unknown as Request;
    controller.create(dto, request);
    controller.create(dto, request);
    expect(createPublic.mock.calls[0][0].requirement).toContain(
      '设备.png：http://localhost/uploads/file.webp',
    );
    expect(createPublic.mock.calls[0][0]).toEqual(createPublic.mock.calls[1][0]);
    expect(dto.requirement).toBe(payload.requirement);
  });
  it('does not save an inquiry when attachment verification fails', () => {
    const createPublic = jest.fn();
    const controller = new EngineeringRequirementController(
      { createPublic } as unknown as CustomRequirementService,
      {} as UploadService,
      receipts,
    );
    expect(() =>
      controller.create(
        plainToInstance(EngineeringRequirementDto, { ...payload, attachments: ['forged'] }),
        { ip: '127.0.0.1' } as Request,
      ),
    ).toThrow();
    expect(createPublic).not.toHaveBeenCalled();
  });
  it('rejects excess combined text with an actionable limit and accepts a shorter retry', () => {
    const createPublic = jest.fn().mockResolvedValue({ submissionId: 'confirmed' });
    const controller = new EngineeringRequirementController(
      { createPublic } as unknown as CustomRequirementService,
      {} as UploadService,
      receipts,
    );
    const url = 'http://localhost/uploads/file.webp';
    const token = receipts.issue(key, url, '设备.png');
    const appendix = `\n\n附件资料：\n设备.png：${url}`;
    const limit = 8000 - appendix.length;
    const dto = plainToInstance(EngineeringRequirementDto, {
      ...payload,
      requirement: '材'.repeat(limit + 1),
      attachments: [token],
    });
    const request = { ip: '127.0.0.1', get: () => 'test' } as unknown as Request;
    expect(() => controller.create(dto, request)).toThrow(`需求正文过长，请缩短至${limit}字以内`);
    expect(createPublic).not.toHaveBeenCalled();
    dto.requirement = '材'.repeat(limit);
    controller.create(dto, request);
    expect(createPublic.mock.calls[0][0].requirement).toHaveLength(8000);
    expect(createPublic.mock.calls[0][0].idempotencyKey).toBe(key);
  });
});
