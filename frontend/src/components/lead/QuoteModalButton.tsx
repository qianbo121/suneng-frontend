'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineXMark } from 'react-icons/hi2';

import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { trackLeadEvent } from '@/lib/api/lead-events';
import { Locale } from '@/types/site';

type QuoteModalButtonProps = {
  locale?: Locale;
  label?: string;
  className?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

const quoteModalCopy = {
  zh: {
    label: '获取报价方案',
    title: '提交工业炉报价需求',
    description: '请尽量填写工件材质、尺寸、温度、热处理工艺、产能需求和现场条件。',
    submitLabel: '提交报价需求',
    closeLabel: '关闭报价需求弹窗',
  },
  en: {
    label: 'Get a Quote',
    title: 'Submit an Industrial Furnace Requirement',
    description: 'Share your workpiece material, dimensions, operating temperature, heat treatment process, throughput and site conditions.',
    submitLabel: 'Submit Requirement',
    closeLabel: 'Close quote request dialog',
  },
} satisfies Record<Locale, {
  label: string;
  title: string;
  description: string;
  submitLabel: string;
  closeLabel: string;
}>;

export function QuoteModalButton({
  locale = 'zh',
  label,
  className,
  title,
  description,
  submitLabel,
}: QuoteModalButtonProps) {
  const copy = quoteModalCopy[locale];
  const resolvedLabel = label ?? copy.label;
  const resolvedTitle = title ?? copy.title;
  const resolvedDescription = description ?? copy.description;
  const resolvedSubmitLabel = submitLabel ?? copy.submitLabel;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const openModal = () => {
    trackLeadEvent('quote_cta_click');
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const background = [document.querySelector('header.site-header'), document.getElementById('site-page-content')]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map((element) => ({ element, inert: element.hasAttribute('inert'), hidden: element.getAttribute('aria-hidden') }));
    closeRef.current?.focus();
    background.forEach(({ element }) => {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key !== 'Tab' || !panelRef.current) return;
      const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      )).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      background.forEach(({ element, inert, hidden }) => {
        if (!inert) element.removeAttribute('inert');
        if (hidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', hidden);
      });
      trigger?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={openModal}
        className={className}
      >
        {resolvedLabel}
      </button>

      {isOpen ? createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#101828]/72 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={resolvedTitle}
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={panelRef}
            className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[960px] flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_28px_80px_rgba(16,24,40,0.32)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 justify-end border-b border-[#eef0f3] px-4 py-2">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#dce3eb] bg-white text-[22px] leading-none text-[#364152] transition hover:border-[#c51624] hover:text-[#c51624]"
                aria-label={copy.closeLabel}
              >
                <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
              <ProductLeadForm
                locale={locale}
                anchorId="quote-modal-form"
                title={resolvedTitle}
                description={resolvedDescription}
                submitLabel={resolvedSubmitLabel}
              />
            </div>
          </div>
        </div>, document.body
      ) : null}
    </>
  );
}
