'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentProps } from 'react';

type InquiryLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { locale?: string };

function currentInquiryForm() {
  return document.querySelector<HTMLElement>('[data-contact-form]');
}

// A contact entry follows the current page's form when one is available.
// Otherwise it stays on the same local site and in the reader's language.
export function InquiryLink({ locale = 'zh', onClick, ...props }: InquiryLinkProps) {
  const pathname = usePathname();
  const fallback = locale === 'en' ? '/en/contact#contact-inquiry-form' : '/zh/inquiry#project-inquiry-form';
  const [href, setHref] = useState(fallback);

  useEffect(() => {
    const form = currentInquiryForm();
    setHref(form?.id ? `${pathname}#${form.id}` : fallback);
  }, [pathname, fallback]);

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const section = currentInquiryForm();
        const messageToggle = document.querySelector<HTMLButtonElement>('button[aria-controls="contact-message-panel"]');
        if (!section && !messageToggle) return;
        event.preventDefault();
        if (messageToggle?.getAttribute('aria-expanded') === 'false') messageToggle.click();
        section?.querySelectorAll<HTMLDetailsElement>('details').forEach((details) => { details.open = true; });
        for (let parent = section?.parentElement; parent; parent = parent.parentElement) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
        }
        requestAnimationFrame(() => {
          const form = currentInquiryForm();
          if (!form) return;
          const field = form.querySelector<HTMLElement>('form button[id], form input:not([type="hidden"]), form select, form textarea');
          const target = field?.closest<HTMLElement>('[class*="field"]') ?? field ?? form;
          const clearance = window.innerWidth < 1280 ? 98 : 120;
          window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - clearance), behavior: 'instant' });
          field?.focus({ preventScroll: true });
          if (form.id) window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${form.id}`);
        });
      }}
    />
  );
}
