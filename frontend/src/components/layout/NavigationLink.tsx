'use client';

import Link from 'next/link';
import { type ComponentProps } from 'react';

export function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props}>{children}</Link>;
}
