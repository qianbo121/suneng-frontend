'use client';

import { useEffect, useState } from 'react';

import { ProductLeadForm } from '@/components/products/ProductLeadForm';
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {resolvedLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#101828]/72 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={resolvedTitle}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[calc(100vh-48px)] w-full max-w-[960px] overflow-y-auto rounded-[8px] bg-white shadow-[0_28px_80px_rgba(16,24,40,0.32)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#dce3eb] bg-white text-[22px] leading-none text-[#364152] transition hover:border-[#c51624] hover:text-[#c51624]"
              aria-label={copy.closeLabel}
            >
              ×
            </button>
            <div className="p-4 sm:p-5 lg:p-6">
              <ProductLeadForm
                locale={locale}
                anchorId="quote-modal-form"
                title={resolvedTitle}
                description={resolvedDescription}
                submitLabel={resolvedSubmitLabel}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
