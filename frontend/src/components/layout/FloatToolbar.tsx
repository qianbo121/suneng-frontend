'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FaWeixin } from 'react-icons/fa';
import { HiChevronUp, HiOutlinePhone } from 'react-icons/hi2';

import { trackLeadEvent } from '@/lib/api/lead-events';
import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type FloatToolbarProps = {
  locale?: string;
};

const toolbarCopy = {
  zh: [
    { key: 'wechat', label: '微信联系', type: 'wechat' as const },
    {
      key: 'phone',
      label: '电话联系',
      href: 'tel:+8613052986814',
      icon: HiOutlinePhone,
      type: 'link' as const,
    },
    { key: 'top', label: '返回顶部', href: '#top', icon: HiChevronUp, type: 'top' as const },
  ],
  en: [
    { key: 'wechat', label: 'WeChat', type: 'wechat' as const },
    {
      key: 'phone',
      label: 'Call',
      href: 'tel:+8613052986814',
      icon: HiOutlinePhone,
      type: 'link' as const,
    },
    { key: 'top', label: 'Top', href: '#top', icon: HiChevronUp, type: 'top' as const },
  ],
} as const;

export function FloatToolbar({ locale = 'zh' }: FloatToolbarProps) {
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const items = toolbarCopy[currentLocale];
  const [wechatOpen, setWechatOpen] = useState(false);
  const wechatDialogRef = useRef<HTMLDivElement>(null);
  const wechatCloseButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const wechatDialogTitleId = `wechat-dialog-title-${currentLocale}`;
  const wechatQrAlt = joinImageAlt(currentLocale, [
    buildBrandImageAlt(currentLocale, 'short'),
    currentLocale === 'en' ? 'WeChat QR code' : '微信二维码',
  ]);

  const handleBackToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const openWechat = () => {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    trackLeadEvent('wechat_click');
    setWechatOpen(true);
  };

  useEffect(() => {
    if (!wechatOpen) return;

    trackLeadEvent('wechat_qr_view');
    const dialog = wechatDialogRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    wechatCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setWechatOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [wechatOpen]);

  return (
    <>
      <div className="fixed bottom-8 right-6 z-40 hidden flex-col transition-opacity duration-200 [body.mobile-nav-open_&]:hidden xl:flex">
        {items.map((item, index) => {
          const sharedClassName =
            item.type === 'top'
              ? 'group flex h-[92px] w-[72px] flex-col items-center justify-center gap-[10px] rounded-b-[10px] border border-[var(--color-action)] bg-[var(--color-action)] text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition-[filter] duration-200 hover:brightness-[1.06]'
              : 'group flex h-[92px] w-[72px] flex-col items-center justify-center gap-[10px] border border-white/10 bg-[#12171D] text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition-[filter] duration-200 hover:brightness-[1.06]';

          if (item.type === 'top') {
            const TopIcon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={handleBackToTop}
                aria-label={item.label}
                title={item.label}
                className={`${sharedClassName} ${index === 0 ? 'rounded-t-[10px]' : ''}`}
              >
                <TopIcon className="text-[24px]" aria-hidden="true" />
                <span className="text-[13px] leading-none">{item.label}</span>
              </button>
            );
          }

          if (item.type === 'wechat') {
            return (
              <button
                key={item.key}
                type="button"
                onClick={openWechat}
                aria-label={item.label}
                title={item.label}
                className={`${sharedClassName} ${index === 0 ? 'rounded-t-[10px]' : ''}`}
              >
                <FaWeixin className="text-[24px] text-white" aria-hidden="true" />
                <span className="text-[13px] leading-none">{item.label}</span>
              </button>
            );
          }

          const LinkIcon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              onClick={() => {
                if (item.key === 'phone') trackLeadEvent('phone_click');
              }}
              aria-label={item.label}
              title={item.label}
              className={`${sharedClassName} ${index === 0 ? 'rounded-t-[10px]' : ''}`}
            >
              <LinkIcon className="text-[24px]" aria-hidden="true" />
              <span className="text-[13px] leading-none">{item.label}</span>
            </a>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-black/10 bg-white/98 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-opacity duration-200 [body.mobile-nav-open_&]:hidden xl:hidden">
        {items.map((item) => {
          if (item.type === 'top') {
            const TopIcon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={handleBackToTop}
                className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] text-neutral-700"
              >
                <TopIcon className="text-lg text-[var(--color-action)]" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          }

          if (item.type === 'wechat') {
            return (
              <button
                key={item.key}
                type="button"
                onClick={openWechat}
                className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] text-neutral-700"
              >
                <FaWeixin className="text-lg text-[var(--color-action)]" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          }

          const LinkIcon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              onClick={() => {
                if (item.key === 'phone') trackLeadEvent('phone_click');
              }}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] text-neutral-700"
            >
              <LinkIcon className="text-lg text-[var(--color-action)]" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      {wechatOpen ? (
        <div
          ref={wechatDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={wechatDialogTitleId}
          tabIndex={-1}
          className="fixed inset-0 z-[10020] flex items-center justify-center overscroll-contain bg-black/45 px-4"
        >
          <div className="w-full max-w-[280px] rounded-[10px] bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
            <p id={wechatDialogTitleId} className="mb-4 text-[16px] font-medium text-[#1a1d23]">
              {currentLocale === 'en' ? 'Scan WeChat QR Code' : '微信联系'}
            </p>
            <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center rounded bg-white">
              <Image
                src="/images/footer/wechat-qr.png"
                alt={wechatQrAlt}
                width={180}
                height={180}
                className="h-full w-full object-contain"
              />
            </div>
            <button
              ref={wechatCloseButtonRef}
              type="button"
              onClick={() => setWechatOpen(false)}
              aria-label={currentLocale === 'en' ? 'Close QR code modal' : '关闭二维码弹窗'}
              className="mt-5 h-[38px] min-w-[120px] rounded-[4px] bg-[var(--color-action)] px-6 text-[14px] text-white transition-[filter] hover:brightness-[1.06]"
            >
              {currentLocale === 'en' ? 'Close' : '关闭'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
