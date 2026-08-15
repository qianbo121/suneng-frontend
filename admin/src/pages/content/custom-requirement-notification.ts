import type { InquiryNotificationAction, InquiryNotificationStatus } from '@/types/content';

type NotificationStatusDisplay = {
  label: '已发送' | '待发送' | '失败' | '结果未知' | '历史未知';
  color: 'green' | 'gold' | 'red' | 'orange' | 'default';
};

const displays: Record<InquiryNotificationStatus, NotificationStatusDisplay> = {
  sent: { label: '已发送', color: 'green' },
  pending: { label: '待发送', color: 'gold' },
  sending: { label: '待发送', color: 'gold' },
  failed: { label: '失败', color: 'red' },
  unknown: { label: '结果未知', color: 'orange' },
  legacy_unknown: { label: '历史未知', color: 'default' },
};

export function getNotificationStatusDisplay(
  status?: InquiryNotificationStatus | null,
): NotificationStatusDisplay {
  return status ? displays[status] : displays.legacy_unknown;
}

export function canShowNotificationError(status?: InquiryNotificationStatus | null) {
  return !status || ['failed', 'unknown', 'legacy_unknown'].includes(status);
}

export function shortNotificationError(error?: string | null) {
  return error?.replace(/\s+/g, ' ').trim().slice(0, 160) || '';
}

export type NotificationActionDisplay = {
  action: InquiryNotificationAction;
  buttonLabel: string;
  modalTitle: string;
  okText: string;
  successMessage: string;
  danger: boolean;
};

const actionDisplays: Record<InquiryNotificationAction, NotificationActionDisplay> = {
  requeue_failed: {
    action: 'requeue_failed',
    buttonLabel: '重新发送通知',
    modalTitle: '重新发送通知',
    okText: '确认重新发送',
    successMessage: '已加入通知发送队列',
    danger: true,
  },
  confirm_unknown_delivered: {
    action: 'confirm_unknown_delivered',
    buttonLabel: '确认已送达',
    modalTitle: '确认通知已送达',
    okText: '确认已送达',
    successMessage: '已记录为通知已送达',
    danger: false,
  },
  confirm_unknown_not_delivered_and_requeue: {
    action: 'confirm_unknown_not_delivered_and_requeue',
    buttonLabel: '确认未送达并重发',
    modalTitle: '确认未送达并重新发送',
    okText: '确认未送达并重发',
    successMessage: '已记录未送达并加入发送队列',
    danger: true,
  },
};

export function getNotificationActions(status?: InquiryNotificationStatus | null) {
  if (status === 'failed') return [actionDisplays.requeue_failed];
  if (status === 'unknown') {
    return [
      actionDisplays.confirm_unknown_delivered,
      actionDisplays.confirm_unknown_not_delivered_and_requeue,
    ];
  }
  return [];
}

export function getNotificationActionDisplay(action: InquiryNotificationAction) {
  return actionDisplays[action];
}
