'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HiEnvelope, HiPhone, HiXMark } from 'react-icons/hi2';

import { trackLeadEvent } from '@/lib/api/lead-events';
import { siteSettings } from '@/mock/siteSettings';

type WechatContactButtonProps = {
  locale?: 'zh' | 'en';
  label?: string;
  description?: string;
  className?: string;
  icon?: ReactNode;
  trackingContext?: Parameters<typeof trackLeadEvent>[1];
};

export function WechatContactButton({
  locale = 'zh',
  label = '加企微，发工况初判',
  description = '扫码后发送工件、工艺、产能和现场条件，用于初步判断设备方向。',
  className,
  icon,
  trackingContext,
}: WechatContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const domesticPhone = siteSettings.salesPhone.replace(/^\+86-?/, '').replace(/\D/g, '');
  const contactNumber = locale === 'en' ? `+86${domesticPhone}` : domesticPhone;
  const qrTrackedRef = useRef(false);
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
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
        aria-expanded={isOpen}
        onClick={() => {
          qrTrackedRef.current = false;
          setCopyState('idle');
          trackLeadEvent('wechat_click', trackingContext);
          setIsOpen(true);
        }}
      >
        {icon}
        <span>{label}</span>
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
                    onLoad={() => {
                      if (qrTrackedRef.current) return;
                      qrTrackedRef.current = true;
                      trackLeadEvent('wechat_qr_view', trackingContext);
                    }}
                    className="h-[220px] w-[220px] object-contain"
                  />
                </div>

                <p className="mt-4 text-center text-[14px] leading-6 text-[#5a687b]">
                  {locale === 'en' ? 'Save the QR image, then open WeChat > Scan > Album to add us.' : '保存二维码后，打开微信「扫一扫」，从相册选择图片添加。'}
                </p>

                <a href={siteSettings.wechatQrCode} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center rounded-[10px] border border-[#cfd8e5] px-4 text-[14px] font-semibold text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]">{locale === 'en' ? 'Open the original QR code' : '查看二维码原图（可长按保存）'}</a>
                <div className="mt-4 rounded-[10px] border border-[#dbe2ec] bg-[#f6f8fb] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <label htmlFor={`${titleId}-phone`} className="block text-[12px] leading-5 text-[#5a687b]">{locale === 'en' ? 'Phone number' : '联系电话'}</label>
                      <input id={`${titleId}-phone`} readOnly value={contactNumber} onFocus={(event) => event.currentTarget.select()} className="w-full min-w-0 rounded bg-transparent text-[18px] font-semibold leading-7 tracking-wide text-[#10223d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004b97]" aria-label={locale === 'en' ? 'Phone number, select to copy' : '联系电话，可选中复制'} />
                    </div>
                    <button type="button" className="min-h-11 shrink-0 rounded-[8px] bg-[#004b97] px-3 text-[14px] font-semibold text-white hover:bg-[#003566] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]" onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(contactNumber);
                        setCopyState('copied');
                      } catch {
                        setCopyState('manual');
                        const field = document.getElementById(`${titleId}-phone`) as HTMLInputElement | null;
                        field?.focus();
                        field?.select();
                      }
                    }}>{copyState === 'copied' ? (locale === 'en' ? 'Copied' : '已复制') : (locale === 'en' ? 'Copy number' : '复制号码')}</button>
                  </div>
                  <p role="status" aria-live="polite" className="mt-1 min-h-5 text-[12px] leading-5 text-[#5a687b]">{copyState === 'manual' ? (locale === 'en' ? 'Copy unavailable. Press and hold the selected number to copy.' : '自动复制未成功，请长按已选中的号码复制。') : copyState === 'copied' ? (locale === 'en' ? 'Phone number copied.' : '电话号码已复制。') : (locale === 'en' ? 'Call us, or use the QR code above to add us on WeChat.' : '可直接拨号；添加微信请使用上方二维码。')}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`tel:${siteSettings.salesPhone.replace(/\s+/g, '')}`}
                    onClick={() => trackLeadEvent('phone_click', {
                      ...trackingContext,
                      properties: { ...trackingContext?.properties, contactSurface: 'wechat_dialog' },
                    })}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#cfd8e5] px-4 text-[14px] font-semibold transition-colors duration-200 hover:border-[#3370ff] hover:text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]"
                  >
                    <HiPhone aria-hidden="true" className="h-4 w-4" />
                    {locale === 'en' ? 'Call us' : '电话联系'}
                  </a>
                  <a
                    href={`mailto:${siteSettings.email}`}
                    onClick={() => trackLeadEvent('email_click', {
                      ...trackingContext,
                      properties: { ...trackingContext?.properties, contactSurface: 'wechat_dialog' },
                    })}
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
