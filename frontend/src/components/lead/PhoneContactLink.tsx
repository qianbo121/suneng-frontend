'use client';

import type { ReactNode } from 'react';

import { ContactAction } from '@/components/lead/ContactAction';
import type { trackLeadEvent } from '@/lib/api/lead-events';

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
    <ContactAction kind="phone" className={className} trackingContext={trackingContext}>
      {children}
    </ContactAction>
  );
}
