'use client';

import type { ComponentPropsWithoutRef } from 'react';
import {
  trackContactEntry,
  type ContactKind,
  type ContactPurpose,
} from '@/lib/api/contact-events';

type TrackedContactLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'onClick'> & {
  kind: Extract<ContactKind, 'phone' | 'email'>;
  position: string;
  purpose?: ContactPurpose;
};

// Preserve the native tel/mailto action and exact existing markup/styles.
export function TrackedContactLink({
  kind,
  position,
  purpose = 'general',
  ...props
}: TrackedContactLinkProps) {
  return (
    <a
      {...props}
      onClick={() => trackContactEntry(kind, { properties: { position, contact_purpose: purpose } })}
    />
  );
}
