'use client';
import { useState, type ReactNode } from 'react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { trackLeadEvent } from '@/lib/api/lead-events';

export function OriginalImageLink({
  src,
  alt,
  children,
  className,
  wechat = false,
  locale = 'zh',
}: {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
  wechat?: boolean;
  locale?: 'zh' | 'en';
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={locale === 'en' ? `View original: ${alt}` : `查看${alt}原件`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          setOpen(true);
          if (wechat)
            trackLeadEvent('wechat_qr_view', {
              pageType: '联系我们',
              properties: { source_module: 'contact_wechat' },
            });
        }}
      >
        {children}
      </a>
      <ImageLightbox
        documentMode
        locale={locale}
        isOpen={open}
        images={[src]}
        imageAlts={[alt]}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
