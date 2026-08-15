import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  unwrapResponse: vi.fn(),
}));

vi.mock('@/services/http', () => ({
  http: { get: mocks.get, post: mocks.post, patch: mocks.patch },
  unwrapResponse: mocks.unwrapResponse,
}));

import {
  getCustomRequirementList,
  getCustomRequirementNotificationAudits,
  manageCustomRequirementNotification,
} from '@/services/content';

describe('custom requirement notification service contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.unwrapResponse.mockImplementation((response) => response.data.data);
  });

  it('keeps customer search terms out of the request URL', async () => {
    const response = { data: { data: { items: [], total: 0, page: 1, pageSize: 10 } } };
    mocks.post.mockResolvedValue(response);

    await getCustomRequirementList({
      page: 2,
      pageSize: 10,
      keyword: '13800000000 customer@example.com',
      status: 'pending',
    });

    expect(mocks.post).toHaveBeenCalledWith('/admin/custom-requirements/search', {
      page: 2,
      pageSize: 10,
      keyword: '13800000000 customer@example.com',
      status: 'pending',
    });
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('sends the selected action and required operator note', async () => {
    const response = { data: { data: { notificationStatus: 'pending' } } };
    mocks.patch.mockResolvedValue(response);

    await expect(
      manageCustomRequirementNotification(42, {
        action: 'requeue_failed',
        expectedStateVersion: 4,
        note: '已核对飞书群，确认没有收到',
      }),
    ).resolves.toEqual({ notificationStatus: 'pending' });

    expect(mocks.patch).toHaveBeenCalledWith(
      '/admin/custom-requirements/42/notification',
      {
        action: 'requeue_failed',
        expectedStateVersion: 4,
        note: '已核对飞书群，确认没有收到',
      },
      { meta: { silentError: true } },
    );
  });

  it.each(['confirm_unknown_delivered', 'confirm_unknown_not_delivered_and_requeue'] as const)(
    'forwards the explicit unknown-outcome action %s',
    async (action) => {
      mocks.patch.mockResolvedValue({ data: { data: { action } } });

      await manageCustomRequirementNotification(7, {
        action,
        expectedStateVersion: 6,
        note: '人工核对结果',
      });

      expect(mocks.patch).toHaveBeenCalledWith(
        '/admin/custom-requirements/7/notification',
        { action, expectedStateVersion: 6, note: '人工核对结果' },
        { meta: { silentError: true } },
      );
    },
  );

  it('loads the append-only notification audit list', async () => {
    const audits = [{ operatorUsername: 'editor', action: 'confirm_unknown_delivered' }];
    mocks.get.mockResolvedValue({ data: { data: audits } });

    await expect(getCustomRequirementNotificationAudits(42)).resolves.toEqual(audits);
    expect(mocks.get).toHaveBeenCalledWith('/admin/custom-requirements/42/notification-audits', {
      meta: { silentError: true },
    });
  });
});
