'use client';

import type { ReactNode } from 'react';
import { trackLeadEvent } from '@/lib/api/lead-events';
import { siteSettings } from '@/mock/siteSettings';

export function PhoneContactLink({
  children,
  className,
  trackingContext,
}: {
  children: ReactNode;
  className?: string;
  trackingContext?: Parameters<typeof trackLeadEvent>[1];
}) {
  return (
    <a
      href={`tel:${siteSettings.salesPhone.replace(/[^+\d]/g, '')}`}
      className={className}
      onClick={() => trackLeadEvent('phone_click', trackingContext)}
    >
      {children}
    </a>
  );
}
