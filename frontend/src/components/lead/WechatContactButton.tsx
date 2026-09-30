'use client';

import type { ReactNode } from 'react';

import { ContactAction } from '@/components/lead/ContactAction';
import type { trackLeadEvent } from '@/lib/api/lead-events';

type WechatContactButtonProps = {
  locale?: 'zh' | 'en';
  label?: string;
  description?: string;
  className?: string;
  icon?: ReactNode;
  trackingContext?: Parameters<typeof trackLeadEvent>[1];
};

export function WechatContactButton({
  locale = 'zh',
  label = '加企微，发工况初判',
  description,
  className,
  icon,
  trackingContext,
}: WechatContactButtonProps) {
  return (
    <ContactAction kind="wechat" locale={locale} description={description} className={className} trackingContext={trackingContext}>
      {icon}
      <span>{label}</span>
    </ContactAction>
  );
}
