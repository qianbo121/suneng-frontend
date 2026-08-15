import { InquiryNotificationAuditAction } from '@prisma/client';
import { validate } from 'class-validator';

import { ManageInquiryNotificationDto } from '@/modules/custom-requirement/dto/manage-inquiry-notification.dto';

describe('ManageInquiryNotificationDto', () => {
  it('requires an allowed action and a meaningful operator note', async () => {
    const valid = Object.assign(new ManageInquiryNotificationDto(), {
      action: InquiryNotificationAuditAction.requeue_failed,
      expectedStateVersion: 4,
      note: '已核对飞书群，未收到该询盘',
    });
    await expect(validate(valid)).resolves.toHaveLength(0);

    const blankNote = Object.assign(new ManageInquiryNotificationDto(), {
      action: InquiryNotificationAuditAction.confirm_unknown_delivered,
      expectedStateVersion: 4,
      note: '   ',
    });
    expect((await validate(blankNote)).some((error) => error.property === 'note')).toBe(true);

    const invalidAction = Object.assign(new ManageInquiryNotificationDto(), {
      action: 'retry_unknown',
      expectedStateVersion: 4,
      note: '不允许的操作',
    });
    expect((await validate(invalidAction)).some((error) => error.property === 'action')).toBe(true);
  });
});
