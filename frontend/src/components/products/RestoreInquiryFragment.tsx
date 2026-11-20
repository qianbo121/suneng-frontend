'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RestoreInquiryFragment() {
  const router = useRouter();

  useEffect(() => {
    // A native click before hydration can reach the form before the router
    // restores its initial URL. The browser still identifies the clicked :target.
    if (!window.location.hash && document.querySelector('#inquiry:target')) {
      router.replace(window.location.pathname + window.location.search + '#inquiry', { scroll: false });
    }
  }, [router]);

  return null;
}
