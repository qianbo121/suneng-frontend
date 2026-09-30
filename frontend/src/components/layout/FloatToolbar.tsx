'use client';

import { FaWeixin } from 'react-icons/fa';
import { HiChevronUp, HiOutlineEnvelope, HiOutlinePhone } from 'react-icons/hi2';

import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { trackLeadEvent } from '@/lib/api/lead-events';
import { siteSettings } from '@/mock/siteSettings';

const itemClass = 'flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] xl:h-[92px] xl:w-[72px] xl:gap-[10px] xl:border xl:border-white/10 xl:text-[13px] xl:text-white xl:transition-colors xl:duration-200';
const contactItemClass = `${itemClass} focus-visible:outline-[#3370ff] xl:bg-[#0b1f36] xl:hover:bg-[var(--color-interactive)]`;
const iconClass = 'h-5 w-5 xl:h-6 xl:w-6';
const trackingContext = { properties: { position: 'floating_toolbar' } };

export function FloatToolbar({ locale = 'zh' }: { locale?: string }) {
  const language = locale === 'en' ? 'en' : 'zh';
  const copy = language === 'en'
    ? { wechat: 'WeChat', phone: 'Call', email: 'Email', top: 'Top', navigation: 'Contact Suneng' }
    : { wechat: '微信联系', phone: '电话联系', email: '邮箱联系', top: '返回顶部', navigation: '快捷联系苏能' };

  return (
    <nav
      aria-label={copy.navigation}
      data-contact-toolbar
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] backdrop-blur [body.mobile-nav-open_&]:hidden xl:inset-x-auto xl:bottom-8 xl:right-6 xl:flex xl:flex-col xl:rounded-[10px] xl:border-0 xl:bg-transparent xl:pb-0 xl:shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
    >
      <WechatContactButton
        locale={language}
        label={copy.wechat}
        description={language === 'en' ? 'Scan to share your workpiece, process, capacity and site requirements.' : '扫码后发送工件、工艺、产能和现场条件，用于初步判断设备方向。'}
        icon={<FaWeixin aria-hidden="true" className={iconClass} />}
        className={`${contactItemClass} text-[var(--color-interactive)] xl:rounded-t-[10px]`}
        trackingContext={trackingContext}
      />
      <a
        href={`tel:${siteSettings.salesPhone.replace(/[^+\d]/g, '')}`}
        title={siteSettings.salesPhone}
        className={`${contactItemClass} text-[var(--color-action)]`}
        onClick={() => trackLeadEvent('phone_click', trackingContext)}
      >
        <HiOutlinePhone aria-hidden="true" className={iconClass} />
        <span>{copy.phone}</span>
      </a>
      <a
        href={`mailto:${siteSettings.email}`}
        title={siteSettings.email}
        className={`${contactItemClass} text-[var(--color-interactive)]`}
        onClick={() => trackLeadEvent('email_click', trackingContext)}
      >
        <HiOutlineEnvelope aria-hidden="true" className={iconClass} />
        <span>{copy.email}</span>
      </a>
      <button
        type="button"
        className={`${itemClass} bg-[var(--color-primary)] text-white hover:bg-[var(--color-interactive)] focus-visible:outline-white xl:rounded-b-[10px]`}
        onClick={() => window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        })}
      >
        <HiChevronUp aria-hidden="true" className={iconClass} />
        <span>{copy.top}</span>
      </button>
    </nav>
  );
}
