import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  canShowNotificationError,
  getNotificationActions,
  getNotificationStatusDisplay,
  shortNotificationError,
} from '@/pages/content/custom-requirement-notification';

describe('custom requirement follow-up columns', () => {
  it('supports email-only inquiries and shows the minimum project identity fields', () => {
    const typeSource = readFileSync(new URL('../../types/content.ts', import.meta.url), 'utf8');
    const pageSource = readFileSync(
      new URL('./CustomRequirementPage.tsx', import.meta.url),
      'utf8',
    );

    expect(typeSource).toContain('phone?: string | null');
    expect(typeSource).toContain('email?: string | null');
    expect(pageSource).toContain("dataIndex: 'email'");
    expect(pageSource).toContain('href={`mailto:${value}`}');
    expect(pageSource).toContain("dataIndex: 'submissionId'");
    expect(pageSource).toContain("dataIndex: 'projectType'");
    expect(pageSource).toContain("dataIndex: 'projectLocation'");
  });

  it('maps every persisted notification state to an operator-friendly label', () => {
    expect(getNotificationStatusDisplay('sent')).toMatchObject({ label: '已发送', color: 'green' });
    expect(getNotificationStatusDisplay('pending').label).toBe('待发送');
    expect(getNotificationStatusDisplay('sending').label).toBe('待发送');
    expect(getNotificationStatusDisplay('failed').label).toBe('失败');
    expect(getNotificationStatusDisplay('unknown').label).toBe('结果未知');
    expect(getNotificationStatusDisplay('legacy_unknown').label).toBe('历史未知');
    expect(getNotificationStatusDisplay(null).label).toBe('历史未知');
  });

  it('shows a short reason only for failed or unknown outcomes', () => {
    expect(canShowNotificationError('failed')).toBe(true);
    expect(canShowNotificationError('unknown')).toBe(true);
    expect(canShowNotificationError('legacy_unknown')).toBe(true);
    expect(canShowNotificationError('sent')).toBe(false);
    expect(shortNotificationError(`  timeout\n${'x'.repeat(200)}  `)).toHaveLength(160);
  });

  it('renders notification status without exposing visitor identifiers', () => {
    const typeSource = readFileSync(new URL('../../types/content.ts', import.meta.url), 'utf8');
    const pageSource = readFileSync(
      new URL('./CustomRequirementPage.tsx', import.meta.url),
      'utf8',
    );

    expect(typeSource).toContain('notificationStatus?: InquiryNotificationStatus | null');
    expect(typeSource).toContain('notificationStateVersion: number');
    expect(typeSource).toContain('notificationLastError?: string | null');
    expect(pageSource).toContain("dataIndex: 'notificationStatus'");
    expect(pageSource).toContain('查看原因');
    expect(pageSource).not.toContain('visitorId');
  });

  it('offers only the notification actions allowed by the current status', () => {
    expect(getNotificationActions('failed').map((item) => item.action)).toEqual(['requeue_failed']);
    expect(getNotificationActions('unknown').map((item) => item.action)).toEqual([
      'confirm_unknown_delivered',
      'confirm_unknown_not_delivered_and_requeue',
    ]);
    for (const status of ['sent', 'pending', 'sending', 'legacy_unknown'] as const) {
      expect(getNotificationActions(status)).toEqual([]);
    }
  });

  it('requires an operator note, refreshes after action, and exposes audit errors', () => {
    const pageSource = readFileSync(
      new URL('./CustomRequirementPage.tsx', import.meta.url),
      'utf8',
    );

    expect(getNotificationActions('failed')[0]?.buttonLabel).toBe('重新发送通知');
    expect(pageSource).toContain('{display.buttonLabel}');
    expect(pageSource).toContain('notificationActionForm.validateFields()');
    expect(pageSource).toContain(
      'expectedStateVersion: notificationActionTarget.record.notificationStateVersion',
    );
    expect(pageSource).toContain("{ required: true, whitespace: true, message: '请填写处理备注' }");
    expect(pageSource).toContain('await mutate()');
    expect(pageSource).toContain('处理记录加载失败');
    expect(pageSource).toContain('dataSource={auditRows}');
  });

  it('guards audit state by the current target and invalidates requests on close', () => {
    const pageSource = readFileSync(
      new URL('./CustomRequirementPage.tsx', import.meta.url),
      'utf8',
    );

    expect(pageSource).toContain('runLatestTargetRequest({');
    expect(pageSource).toContain('targetId: record.id');
    expect(pageSource).toContain('auditRequestGuardRef.current.invalidate()');
    expect(pageSource).toContain('onCancel={closeAuditModal}');
  });
});
