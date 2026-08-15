export type CustomRequirementStatus = 'pending' | 'followed';
export type InquiryNotificationStatus =
  | 'pending'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'unknown'
  | 'legacy_unknown';
export type InquiryNotificationAction =
  | 'requeue_failed'
  | 'confirm_unknown_delivered'
  | 'confirm_unknown_not_delivered_and_requeue';

export type CustomRequirementEntity = {
  id: number;
  submissionId?: string | null;
  projectType?: string | null;
  projectLocation?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  industry?: string | null;
  process?: string | null;
  temperature?: string | null;
  requirement?: string | null;
  preferredContact?: 'phone' | 'email' | null;
  locale?: 'zh' | 'en' | null;
  notificationStatus?: InquiryNotificationStatus | null;
  notificationStateVersion: number;
  notificationLastError?: string | null;
  status: CustomRequirementStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomRequirementListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: CustomRequirementStatus;
};

export type ManageInquiryNotificationPayload = {
  action: InquiryNotificationAction;
  expectedStateVersion: number;
  note: string;
};

export type ManageInquiryNotificationResult = {
  id: number;
  submissionId: string;
  notificationStatus: InquiryNotificationStatus;
  notificationStateVersion: number;
  action: InquiryNotificationAction;
};

export type InquiryNotificationAudit = {
  id?: number;
  operatorUsername: string;
  operatorRole: string;
  action: InquiryNotificationAction;
  previousStatus: InquiryNotificationStatus;
  nextStatus: InquiryNotificationStatus;
  previousError?: string | null;
  attemptCount: number;
  note: string;
  createdAt: string;
};
