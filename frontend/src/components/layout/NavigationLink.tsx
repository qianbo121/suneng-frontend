'use client';

import Link from 'next/link';
import { type ComponentProps, useState } from 'react';

// Hidden menus still intersect the viewport. Wait for a visitor to choose a
// link before letting its destination compete with the current page's assets.
export function NavigationLink({
  children, prefetch, onMouseEnter, onFocus, onTouchStart, ...props
}: ComponentProps<typeof Link>) {
  const [intentHref, setIntentHref] = useState<string | null>(null);
  const hrefKey = typeof props.href === 'string' ? props.href : JSON.stringify(props.href);
  const prepareDestination = () => setIntentHref(hrefKey);

  return (
    <Link
      {...props}
      prefetch={prefetch === undefined ? (intentHref === hrefKey ? null : false) : prefetch}
      onMouseEnter={(event) => { prepareDestination(); onMouseEnter?.(event); }}
      onFocus={(event) => { prepareDestination(); onFocus?.(event); }}
      onTouchStart={(event) => { prepareDestination(); onTouchStart?.(event); }}
    >
      {children}
    </Link>
  );
}
