'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiEnvelope, HiPhone, HiXMark } from 'react-icons/hi2';

import { siteSettings } from '@/mock/siteSettings';

type WechatContactButtonProps = {
  locale?: 'zh' | 'en';
  label?: string;
  description?: string;
  className?: string;
};

export function WechatContactButton({
  locale = 'zh',
  label = '加企微，发工况初判',
  description = '扫码后发送工件、工艺、产能和现场条件，用于初步判断设备方向。',
  className,
}: WechatContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        {label}
      </button>

      {isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[12000] flex items-center justify-center bg-[#07162a]/80 px-4 py-6"
              role="presentation"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) setIsOpen(false);
              }}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="max-h-[calc(100vh-48px)] w-full max-w-[460px] overscroll-contain overflow-y-auto rounded-[12px] bg-white p-6 text-[#10223d] shadow-[0_24px_70px_rgba(5,18,36,0.28)] sm:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <h2
                      id={titleId}
                      className="text-pretty text-[24px] font-semibold leading-[1.35]"
                    >
                      {locale === 'en' ? 'Contact a Suneng technical adviser' : '添加苏能技术顾问'}
                    </h2>
                    <p id={descriptionId} className="mt-2 text-[15px] leading-7 text-[#5a687b]">
                      {description}
                    </p>
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label={locale === 'en' ? 'Close contact dialog' : '关闭企微联系弹窗'}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#dbe2ec] text-[#334155] transition-colors duration-200 hover:border-[#3370ff] hover:text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiXMark aria-hidden="true" className="h-6 w-6" />
                  </button>
                </div>

                <div className="mx-auto mt-6 w-fit rounded-[12px] border border-[#dbe2ec] bg-white p-3">
                  <Image
                    src={siteSettings.wechatQrCode}
                    alt={locale === 'en' ? 'Suneng WeChat QR code' : '江苏苏能工业炉微信二维码'}
                    width={220}
                    height={220}
                    priority
                    className="h-[220px] w-[220px] object-contain"
                  />
                </div>

                <p className="mt-4 text-center text-[14px] leading-6 text-[#5a687b]">
                  {locale === 'en' ? 'On your phone, open the original image to scan or save the QR code.' : '手机端可查看原图后，长按识别或保存二维码'}
                </p>

                <a href={siteSettings.wechatQrCode} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center rounded-[10px] border border-[#cfd8e5] px-4 text-[14px] font-semibold text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]">{locale === 'en' ? 'Open the original QR code' : '查看二维码原图（可长按保存）'}</a>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`tel:${siteSettings.salesPhone.replace(/\s+/g, '')}`}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#cfd8e5] px-4 text-[14px] font-semibold transition-colors duration-200 hover:border-[#3370ff] hover:text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]"
                  >
                    <HiPhone aria-hidden="true" className="h-4 w-4" />
                    {locale === 'en' ? 'Call us' : '电话联系'}
                  </a>
                  <a
                    href={`mailto:${siteSettings.email}`}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#cfd8e5] px-4 text-[14px] font-semibold transition-colors duration-200 hover:border-[#3370ff] hover:text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]"
                  >
                    <HiEnvelope aria-hidden="true" className="h-4 w-4" />
                    {locale === 'en' ? 'Email documents' : '邮箱发资料'}
                  </a>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
