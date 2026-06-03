'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaWeixin } from 'react-icons/fa';
import { HiChevronUp, HiOutlinePhone } from 'react-icons/hi2';

import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type FloatToolbarProps = {
  locale?: string;
};

const toolbarCopy = {
  zh: [
    { key: 'wechat', label: '微信联系', type: 'wechat' as const },
    { key: 'phone', label: '电话联系', href: 'tel:13052986814', icon: HiOutlinePhone, type: 'link' as const },
    { key: 'top', label: '返回顶部', href: '#top', icon: HiChevronUp, type: 'top' as const },
  ],
  en: [
    { key: 'wechat', label: 'WeChat', type: 'wechat' as const },
    { key: 'phone', label: 'Call', href: 'tel:13052986814', icon: HiOutlinePhone, type: 'link' as const },
    { key: 'top', label: 'Top', href: '#top', icon: HiChevronUp, type: 'top' as const },
  ],
} as const;

export function FloatToolbar({ locale = 'zh' }: FloatToolbarProps) {
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const items = toolbarCopy[currentLocale];
  const [wechatOpen, setWechatOpen] = useState(false);
  const wechatQrAlt = joinImageAlt(currentLocale, [
    buildBrandImageAlt(currentLocale, 'short'),
    currentLocale === 'en' ? 'WeChat QR code' : '微信二维码',
  ]);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="fixed bottom-8 right-6 z-40 hidden flex-col xl:flex">
        {items.map((item, index) => {
          const sharedClassName =
            index === items.length - 1
              ? 'group flex h-[92px] w-[72px] flex-col items-center justify-center gap-[10px] rounded-b-[10px] border border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition-all duration-200 hover:brightness-[1.06]'
              : 'group flex h-[92px] w-[72px] flex-col items-center justify-center gap-[10px] border border-white/10 bg-[#12171D] text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition-all duration-200 hover:brightness-[1.06]';

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
                <TopIcon className="text-[24px]" />
                <span className="text-[13px] leading-none">{item.label}</span>
              </button>
            );
          }

          if (item.type === 'wechat') {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setWechatOpen(true)}
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
              aria-label={item.label}
              title={item.label}
              className={`${sharedClassName} ${index === 0 ? 'rounded-t-[10px]' : ''}`}
            >
              <LinkIcon className="text-[24px]" />
              <span className="text-[13px] leading-none">{item.label}</span>
            </a>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-black/10 bg-white/98 backdrop-blur xl:hidden">
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
                <TopIcon className="text-lg text-brand-accent" />
                <span>{item.label}</span>
              </button>
            );
          }

          if (item.type === 'wechat') {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setWechatOpen(true)}
                className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] text-neutral-700"
              >
                <FaWeixin className="text-lg text-brand-accent" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          }

          const LinkIcon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] text-neutral-700"
            >
              <LinkIcon className="text-lg text-brand-accent" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      {wechatOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[280px] rounded-[10px] bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
            <p className="mb-4 text-[16px] font-medium text-[#1a1d23]">
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
              type="button"
              onClick={() => setWechatOpen(false)}
              className="mt-5 h-[38px] min-w-[120px] rounded-[4px] bg-[var(--color-accent)] px-6 text-[14px] text-white"
            >
              {currentLocale === 'en' ? 'Close' : '关闭'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
