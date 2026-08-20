import { AdminRole, InquiryNotificationAuditAction } from '@prisma/client';
import { Request } from 'express';
import { PATH_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { CustomRequirementController } from '@/modules/custom-requirement/custom-requirement.controller';
import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';

describe('CustomRequirementController notification operations', () => {
  it('routes legacy V1 and evidence-chain V2 submissions to separate service contracts', async () => {
    const createLegacyPublic = jest.fn().mockResolvedValue({ submissionId: 'legacy-id' });
    const createPublic = jest.fn().mockResolvedValue({ submissionId: 'v2-id' });
    const controller = new CustomRequirementController({
      createLegacyPublic,
      createPublic,
    } as unknown as CustomRequirementService);
    const request = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0 Android Mobile'),
    } as unknown as Request;

    await controller.createLegacyPublic({ phone: '13000000000' }, request);
    await controller.createPublic(
      {
        projectType: '台车炉',
        projectLocation: '常州',
        name: '张经理',
        company: '客户公司',
        requirement: '询价',
        phone: '13000000000',
        locale: 'zh',
      },
      request,
    );

    expect(createLegacyPublic).toHaveBeenCalledWith(
      { phone: '13000000000' },
      '127.0.0.1',
      '127.0.0.1',
      '移动端',
    );
    expect(createPublic).toHaveBeenCalledWith(
      expect.objectContaining({ projectType: '台车炉', locale: 'zh', deviceType: '移动端' }),
      '127.0.0.1',
      '127.0.0.1',
    );
    expect(
      Reflect.getMetadata(PATH_METADATA, CustomRequirementController.prototype.createLegacyPublic),
    ).toBe('v1/custom-requirements');
    expect(
      Reflect.getMetadata(PATH_METADATA, CustomRequirementController.prototype.createPublic),
    ).toBe('v2/custom-requirements');
  });

  it('keeps manual notification operations behind the existing admin roles', () => {
    expect(Reflect.getMetadata(ROLES_KEY, CustomRequirementController)).toEqual([
      AdminRole.super_admin,
      AdminRole.editor,
    ]);
  });

  it('accepts admin inquiry search terms only in a protected POST body', async () => {
    const getAdminList = jest.fn().mockResolvedValue({ items: [], total: 0 });
    const controller = new CustomRequirementController({
      getAdminList,
    } as unknown as CustomRequirementService);
    const query = {
      page: 1,
      pageSize: 10,
      keyword: '13800000000 customer@example.com',
    };

    await controller.getAdminList(query);

    expect(getAdminList).toHaveBeenCalledWith(query);
    expect(
      Reflect.getMetadata(PATH_METADATA, CustomRequirementController.prototype.getAdminList),
    ).toBe('admin/custom-requirements/search');
  });

  it('passes the authenticated operator identity into the protected manual action', async () => {
    const manageNotification = jest.fn().mockResolvedValue({ notificationStatus: 'pending' });
    const controller = new CustomRequirementController({
      manageNotification,
    } as unknown as CustomRequirementService);
    const operator = {
      id: 7,
      username: 'reviewer',
      role: AdminRole.editor,
      isActive: true,
    };
    const dto = {
      action: InquiryNotificationAuditAction.requeue_failed,
      expectedStateVersion: 4,
      note: '已核对，可以重试',
    };

    await controller.manageNotification(41, dto, operator);

    expect(manageNotification).toHaveBeenCalledWith(41, dto, operator);
  });

  it('exposes the append-only audit history through the protected admin controller', async () => {
    const getNotificationAudits = jest.fn().mockResolvedValue([{ id: 9 }]);
    const controller = new CustomRequirementController({
      getNotificationAudits,
    } as unknown as CustomRequirementService);

    await expect(controller.getNotificationAudits(41)).resolves.toEqual([{ id: 9 }]);
    expect(getNotificationAudits).toHaveBeenCalledWith(41);
  });
});
