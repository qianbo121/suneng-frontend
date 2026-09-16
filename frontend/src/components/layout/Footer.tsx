'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { HiEnvelope, HiMapPin, HiPhone } from 'react-icons/hi2';

import { trackLeadEvent } from '@/lib/api/lead-events';
import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';
import { siteSettings } from '@/mock/siteSettings';
import { Locale } from '@/types/site';

import { FooterDouyinCode } from './FooterDouyinCode';

type FooterProps = {
  locale: string;
};

const FOOTER_TOKENS = {
  colors: {
    background: '#061527',
    text: '#C9CED6',
    muted: '#9AA1AA',
    brand: 'var(--color-interactive-light)',
    divider: 'rgba(156,163,175,0.42)',
  },
  fontClass: "font-['PingFang_SC','Microsoft_YaHei','SimHei',sans-serif]",
  desktop: {
    containerWidth: 1440,
    mainPaddingTop: 24,
    mainPaddingBottom: 24,
    gridColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1.1fr)',
    gridGap: 32,
    logoWidth: 203,
    logoHeight: 114,
    qrSize: 120,
    qrGap: 24,
    bottomPaddingY: 18,
  },
} as const;

function px(value: number) {
  return `${value}px`;
}

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

const MIIT_BEIAN_URL = 'https://beian.miit.gov.cn/';
const POLICE_BEIAN_URL =
  'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32120402001014';

const footerCopy = {
  zh: {
    founded: '成立于 2006 年；公司自报生产基地占地约 14700 ㎡',
    brandIntro: '专注热处理工业炉研发制造，提供设计、制造、安装与售后服务。',
    address: '江苏省泰州市姜堰区张甸蔡官工业区',
    wechat: '微信二维码',
    douyin: '抖音二维码',
    followUs: '关注我们，了解更多产品与解决方案',
    email: siteSettings.email,
    phone: siteSettings.salesPhone,
    copyright: 'Copyright © 2026 江苏苏能工业炉有限公司 版权所有',
    icp: '苏ICP备20020318号-1',
    policeBeian: '苏公网安备32120402001014号',
  },
  en: {
    founded: 'Founded in 2006; company-reported approx. 14,700 ㎡ site',
    brandIntro:
      'Focused on industrial furnace R&D, manufacturing, installation and after-sales service.',
    address:
      'Caiguan Industrial Park, Zhangdian Town, Jiangyan District, Taizhou, Jiangsu Province, China',
    wechat: 'WeChat QR',
    douyin: 'Douyin QR',
    followUs: 'Follow us for more products and solutions.',
    email: siteSettings.email,
    phone: siteSettings.salesPhone,
    copyright: 'Copyright © 2026 Jiangsu Suneng Industrial Furnace Co., Ltd. All rights reserved.',
    icp: '苏ICP备20020318号-1',
    policeBeian: '苏公网安备32120402001014号',
  },
} as const;

function InfoRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-full items-center justify-center xl:justify-start">
      <span
        className={`${FOOTER_TOKENS.fontClass} min-w-0 text-center text-[var(--home-font-secondary-size,14px)] leading-[var(--home-font-secondary-line,21px)] text-[var(--footer-muted-color)] xl:text-left`}
      >
        {children}
      </span>
    </div>
  );
}

function ContactIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--footer-brand-color)] text-[var(--footer-brand-color)]">
      {children}
    </span>
  );
}

function BrandBlock({
  copy,
  locale,
}: {
  copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en'];
  locale: Locale;
}) {
  const { desktop } = FOOTER_TOKENS;

  return (
    <div className="site-footer__brand flex flex-col items-center text-center xl:items-start xl:text-left">
      <div
        className="footer-logo-container"
        style={varStyle({
          width: px(desktop.logoWidth),
          height: px(desktop.logoHeight),
          '--footer-logo-translate-y': '0px',
          transform: 'translateY(var(--footer-logo-translate-y))',
        })}
      >
        <Image
          src="/images/brand/sn-logo-white-transparent.png"
          alt={buildBrandImageAlt(locale, 'short')}
          width={desktop.logoWidth * 2}
          height={desktop.logoHeight * 2}
          priority={false}
          className="h-full w-full object-contain"
        />
      </div>

      <p
        className={`${FOOTER_TOKENS.fontClass} mt-[14px] max-w-[340px] text-[var(--home-font-secondary-size,15px)] leading-[var(--home-font-secondary-line,26px)] text-[var(--footer-muted-color)]`}
      >
        {copy.brandIntro}
      </p>

      <div className="mt-[18px] flex flex-col gap-[10px]">
        <InfoRow>{copy.founded}</InfoRow>
      </div>
    </div>
  );
}

function QrBlock({
  copy,
  locale,
}: {
  copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en'];
  locale: Locale;
}) {
  const { desktop } = FOOTER_TOKENS;

  return (
    <div className="site-footer__qr flex flex-col items-center xl:items-start">
      <div
        className="flex flex-wrap items-start justify-center xl:justify-start"
        style={{ gap: `var(--home-card-gap, ${px(desktop.qrGap)})` }}
      >
        {[
          { src: siteSettings.wechatQrCode, label: copy.wechat, isDouyin: false },
          { src: '/images/footer/douyin-code-original-20260907.png', label: copy.douyin, isDouyin: true },
        ].map((qr) => (
          <div key={qr.label} className="group text-center">
            <div
              className={`flex items-center justify-center rounded-[4px] ${qr.isDouyin ? '' : 'bg-white'} transition-transform duration-200 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none`}
              style={{
                width: `var(--home-footer-qr-size, ${px(desktop.qrSize)})`,
                height: `var(--home-footer-qr-size, ${px(desktop.qrSize)})`,
              }}
            >
              {qr.isDouyin ? (
                <FooterDouyinCode
                  label={joinImageAlt(locale, [buildBrandImageAlt(locale, 'short'), qr.label])}
                />
              ) : (
                <Image
                  src={qr.src}
                  alt={joinImageAlt(locale, [buildBrandImageAlt(locale, 'short'), qr.label])}
                  width={desktop.qrSize}
                  height={desktop.qrSize}
                  className="h-full w-full object-contain [image-rendering:pixelated]"
                />
              )}
            </div>
            <p
              className={`${FOOTER_TOKENS.fontClass} mt-[8px] whitespace-nowrap text-[var(--home-font-label-size,13px)] leading-[var(--home-font-label-line,20px)] text-[var(--footer-text-color)]`}
            >
              {qr.label}
            </p>
          </div>
        ))}
      </div>
      <p
        className={`${FOOTER_TOKENS.fontClass} mt-[12px] text-[var(--home-font-label-size,14px)] leading-[var(--home-font-label-line,21px)] text-[var(--footer-muted-color)]`}
      >
        {copy.followUs}
      </p>
    </div>
  );
}

function ContactBlock({ copy }: { copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en'] }) {
  return (
    <div className="site-footer__contact flex h-full flex-col items-center justify-center gap-[24px] xl:items-start">
      <a
        href={`mailto:${copy.email}`}
        onClick={() => trackLeadEvent('email_click')}
        className={`${FOOTER_TOKENS.fontClass} flex min-h-[44px] max-w-full items-center gap-[14px] text-center text-[var(--home-font-secondary-size,16px)] font-normal leading-[var(--home-font-secondary-line,24px)] text-[var(--footer-text-color)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--footer-brand-color)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#061527] xl:whitespace-nowrap xl:text-left`}
      >
        <ContactIcon>
          <HiEnvelope aria-hidden="true" className="h-[20px] w-[20px]" />
        </ContactIcon>
        <span>{copy.email}</span>
      </a>

      <a
        href={`tel:${copy.phone.replace(/\s+/g, '')}`}
        onClick={() => trackLeadEvent('phone_click')}
        className={`${FOOTER_TOKENS.fontClass} flex min-h-[44px] max-w-full items-center gap-[14px] text-center text-[var(--home-font-secondary-size,16px)] font-normal leading-[var(--home-font-secondary-line,24px)] text-[var(--footer-text-color)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--footer-brand-color)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#061527] xl:whitespace-nowrap xl:text-left`}
      >
        <ContactIcon>
          <HiPhone aria-hidden="true" className="h-[20px] w-[20px]" />
        </ContactIcon>
        <span>{copy.phone}</span>
      </a>

      <div
        className={`${FOOTER_TOKENS.fontClass} flex min-h-[44px] max-w-full min-w-0 items-center gap-[14px] text-left text-[var(--home-font-secondary-size,16px)] font-normal leading-[var(--home-font-secondary-line,24px)] text-[var(--footer-text-color)] xl:whitespace-nowrap`}
      >
        <ContactIcon>
          <HiMapPin aria-hidden="true" className="h-[22px] w-[22px]" />
        </ContactIcon>
        <span className="min-w-0">{copy.address}</span>
      </div>
    </div>
  );
}

export function Footer({ locale }: FooterProps) {
  const { colors, desktop } = FOOTER_TOKENS;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const copy = footerCopy[currentLocale];

  return (
    <footer
      className="site-footer relative overflow-hidden text-[var(--footer-text-color)]"
      style={varStyle({
        backgroundColor: colors.background,
        '--footer-text-color': colors.text,
        '--footer-muted-color': colors.muted,
        '--footer-brand-color': colors.brand,
        '--footer-divider-color': colors.divider,
        '--footer-main-pt': `var(--home-footer-main-pt, ${px(desktop.mainPaddingTop)})`,
        '--footer-main-pb': `var(--home-footer-main-pb, ${px(desktop.mainPaddingBottom)})`,
        backgroundImage:
          'radial-gradient(circle at 92% 24%, rgba(7,89,230,0.2), transparent 20%), linear-gradient(135deg, rgba(255,255,255,0.05), transparent 34%), linear-gradient(180deg, #0b223b 0%, #061527 100%)',
      })}
    >
      {/* Footer 主体：品牌信息、二维码和联系方式。 */}
      <div
        className="mx-auto w-full px-6 pt-[var(--footer-main-pt)] lg:px-10"
        style={{ maxWidth: px(desktop.containerWidth) }}
      >
        <div
          className="site-footer__home-grid grid items-center gap-9 pb-[var(--footer-main-pb)] md:grid-cols-1 xl:grid-cols-[var(--footer-grid-columns)] xl:gap-[var(--footer-grid-gap)]"
          style={varStyle({
            '--footer-grid-columns': `var(--home-footer-grid-columns, ${desktop.gridColumns})`,
            '--footer-grid-gap': `var(--home-footer-grid-gap, ${px(desktop.gridGap)})`,
          })}
        >
          <BrandBlock copy={copy} locale={currentLocale} />
          <div className="site-footer__qr-column relative py-8 xl:flex xl:self-stretch xl:px-8 xl:py-0">
            {/* 模块分割线：桌面端隔开品牌信息 / 二维码 / 联系方式。 */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 hidden h-full w-px scale-x-50 xl:block"
              style={{ backgroundColor: colors.divider }}
            />
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 hidden h-full w-px scale-x-50 xl:block"
              style={{ backgroundColor: colors.divider }}
            />
            <div className="w-full xl:flex xl:items-center xl:justify-center">
              <QrBlock copy={copy} locale={currentLocale} />
            </div>
          </div>
          <div className="xl:pl-[14px]">
            <ContactBlock copy={copy} />
          </div>
        </div>
      </div>

      {/* 底部备案条：版权与备案独立放置，桌面左右对齐，移动端居中堆叠。 */}
      <div className="site-footer__legal relative before:absolute before:inset-x-0 before:top-0 before:h-px before:scale-y-50 before:bg-[var(--footer-divider-color)]">
        <div
          className={`${FOOTER_TOKENS.fontClass} mx-auto flex w-full flex-col items-center justify-center gap-2 px-6 text-[var(--home-font-label-size,13px)] leading-[var(--home-font-label-line,20px)] text-[var(--footer-muted-color)] md:flex-row md:gap-[26px] lg:px-10`}
          style={{
            maxWidth: px(desktop.containerWidth),
            paddingTop: desktop.bottomPaddingY,
            paddingBottom: desktop.bottomPaddingY,
          }}
        >
          <span>{copy.copyright}</span>
          <span
            aria-hidden="true"
            className="hidden h-[14px] w-px scale-x-50 bg-[var(--footer-divider-color)] md:block"
          />
          <a
            href={MIIT_BEIAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--footer-brand-color)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#061527]"
          >
            {copy.icp}
          </a>
          <span
            aria-hidden="true"
            className="hidden h-[14px] w-px scale-x-50 bg-[var(--footer-divider-color)] md:block"
          />
          <a
            href={POLICE_BEIAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--footer-brand-color)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#061527]"
          >
            {copy.policeBeian}
          </a>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.adjustFooterLogo = function adjustFooterLogo(px) {
              var footer = document.querySelector('.site-footer');
              var logo = footer ? footer.querySelector('.footer-logo-container') : document.querySelector('.footer-logo-container');
              if (!logo) return false;
              var value = typeof px === 'number' ? px + 'px' : px;
              logo.style.setProperty('--footer-logo-translate-y', value || '0px');
              return true;
            };
            window.adjustFooterPadding = function adjustFooterPadding(topPx, bottomPx) {
              var footer = document.querySelector('.site-footer');
              if (!footer) return false;
              var top = typeof topPx === 'number' ? topPx + 'px' : topPx;
              var bottom = typeof bottomPx === 'number' ? bottomPx + 'px' : bottomPx;
              if (top != null) footer.style.setProperty('--footer-main-pt', top);
              if (bottom != null) footer.style.setProperty('--footer-main-pb', bottom);
              return true;
            };
          `,
        }}
      />
    </footer>
  );
}
