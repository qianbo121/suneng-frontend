import { Logger } from '@nestjs/common';

import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { InquiryNotificationService } from '@/modules/custom-requirement/inquiry-notification.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('CustomRequirementService', () => {
  const inquiry = { id: 1, phone: '13000000000', status: 'pending' };

  afterEach(() => jest.restoreAllMocks());

  it('notifies Feishu after an inquiry is stored', async () => {
    const prisma = {
      customRequirement: { create: jest.fn().mockResolvedValue(inquiry) },
    } as unknown as PrismaService;
    const notification = {
      notifyNewInquiry: jest.fn().mockResolvedValue(true),
    } as unknown as InquiryNotificationService;
    const service = new CustomRequirementService(prisma, notification);

    await expect(service.createPublic({ phone: ' 13000000000 ' }, 'client-1')).resolves.toBe(
      inquiry,
    );
    expect(notification.notifyNewInquiry).toHaveBeenCalledWith(inquiry);
  });

  it('keeps a stored inquiry successful when Feishu delivery fails', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const prisma = {
      customRequirement: { create: jest.fn().mockResolvedValue(inquiry) },
    } as unknown as PrismaService;
    const notification = {
      notifyNewInquiry: jest.fn().mockRejectedValue(new Error('Feishu unavailable')),
    } as unknown as InquiryNotificationService;
    const service = new CustomRequirementService(prisma, notification);

    await expect(service.createPublic({ phone: '13000000000' }, 'client-2')).resolves.toBe(inquiry);
  });
});
