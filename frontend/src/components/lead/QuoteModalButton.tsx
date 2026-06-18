'use client';

import { useEffect, useState } from 'react';

import { ProductLeadForm } from '@/components/products/ProductLeadForm';

type QuoteModalButtonProps = {
  label?: string;
  className?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

const defaultDescription = '请尽量填写工件材质、尺寸、温度、热处理工艺、产能需求和现场条件。';

export function QuoteModalButton({
  label = '获取报价方案',
  className,
  title = '提交工业炉报价需求',
  description = defaultDescription,
  submitLabel = '提交报价需求',
}: QuoteModalButtonProps) {
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
        {label}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#101828]/72 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={title}
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
              aria-label="关闭报价需求弹窗"
            >
              ×
            </button>
            <div className="p-4 sm:p-5 lg:p-6">
              <ProductLeadForm
                anchorId="quote-modal-form"
                title={title}
                description={description}
                submitLabel={submitLabel}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
