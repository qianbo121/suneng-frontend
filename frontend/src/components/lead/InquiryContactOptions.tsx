'use client';

import { HiEnvelope, HiPhone } from 'react-icons/hi2';
import { PhoneContactLink } from './PhoneContactLink';
import { WechatContactButton } from './WechatContactButton';
import { trackLeadEvent } from '@/lib/api/lead-events';
import { siteSettings } from '@/mock/siteSettings';

export function InquiryContactOptions({
  locale = 'zh',
  showWechat = true,
  trackingPosition = 'product_form_contact',
}: {
  locale?: 'zh' | 'en';
  showWechat?: boolean;
  trackingPosition?: string;
}) {
  const en = locale === 'en';
  const trackingContext = { properties: { position: trackingPosition } };
  const contactClass = 'inline-flex min-h-11 items-center gap-2 rounded px-1 text-[14px] font-medium text-[#004b97] hover:text-[#003566] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]';
  return (
    <div data-inquiry-contact-options className="mb-4 border-b border-[#dbe2ec] pb-3">
      <p className="text-[14px] leading-6 text-[#5a687b]">{en ? 'Prefer to talk first? Contact us directly.' : '想先聊一聊？也可以直接联系。'}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-0">
        <PhoneContactLink className={contactClass} trackingContext={trackingContext}>
          <HiPhone aria-hidden="true" className="h-4 w-4 shrink-0" />{siteSettings.salesPhone}
        </PhoneContactLink>
        {showWechat ? (
          <WechatContactButton
            locale={locale}
            label={en ? 'WeChat' : '微信联系'}
            description={en ? 'Send your workpiece, process, output and site requirements for an initial equipment recommendation.' : '扫码后发送工件、工艺、产能和现场条件，用于初步判断设备方向。'}
            className={contactClass}
            trackingContext={trackingContext}
          />
        ) : null}
        <a href={`mailto:${siteSettings.email}`} className={contactClass} onClick={() => trackLeadEvent('email_click', trackingContext)}>
          <HiEnvelope aria-hidden="true" className="h-4 w-4 shrink-0" />{siteSettings.email}
        </a>
      </div>
    </div>
  );
}
