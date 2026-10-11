'use client';

import { FaWeixin } from 'react-icons/fa';
import { HiChevronUp, HiEnvelope, HiOutlineEnvelope, HiOutlinePhone, HiPhone } from 'react-icons/hi2';

import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { ContactAction } from '@/components/lead/ContactAction';

const itemClass = 'flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] xl:h-[92px] xl:w-[72px] xl:gap-[10px] xl:border xl:border-white/10 xl:text-[13px] xl:text-white xl:transition-colors xl:duration-200';
const contactItemClass = `${itemClass} focus-visible:outline-[#3370ff] xl:bg-[#0b1f36] xl:hover:bg-[var(--color-interactive)]`;
const iconClass = 'h-5 w-5 xl:h-6 xl:w-6';
const contactIconClass = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f4f8] text-[#526477] xl:h-auto xl:w-auto xl:rounded-none xl:bg-transparent xl:text-inherit';
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
      data-mobile-contact-bar
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] backdrop-blur [body.mobile-nav-open_&]:hidden xl:inset-x-auto xl:bottom-8 xl:right-6 xl:flex xl:flex-col xl:rounded-[10px] xl:border-0 xl:bg-transparent xl:pb-0 xl:shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
    >
      <WechatContactButton
        locale={language}
        label={copy.wechat}
        icon={(
          <span className={contactIconClass}>
            <FaWeixin aria-hidden="true" className={iconClass} />
          </span>
        )}
        className={`${contactItemClass} text-[#526477] xl:rounded-t-[10px]`}
        trackingContext={trackingContext}
      />
      <ContactAction
        kind="phone"
        locale={language}
        className={`${contactItemClass} text-[#526477]`}
        trackingContext={trackingContext}
      >
        <span className={contactIconClass}>
          <HiPhone aria-hidden="true" className="h-5 w-5 xl:hidden" />
          <HiOutlinePhone aria-hidden="true" className="hidden xl:block xl:h-6 xl:w-6" />
        </span>
        <span>{copy.phone}</span>
      </ContactAction>
      <ContactAction
        kind="email"
        locale={language}
        className={`${contactItemClass} text-[#526477]`}
        trackingContext={trackingContext}
      >
        <span className={contactIconClass}>
          <HiEnvelope aria-hidden="true" className="h-5 w-5 xl:hidden" />
          <HiOutlineEnvelope aria-hidden="true" className="hidden xl:block xl:h-6 xl:w-6" />
        </span>
        <span>{copy.email}</span>
      </ContactAction>
      <button
        type="button"
        className={`${itemClass} text-[#526477] hover:bg-[#f1f4f8] focus-visible:outline-[#3370ff] xl:rounded-b-[10px] xl:bg-[var(--color-primary)] xl:text-white xl:hover:bg-[var(--color-interactive)] xl:focus-visible:outline-white`}
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
