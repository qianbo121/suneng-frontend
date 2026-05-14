import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { HiCheckCircle, HiEnvelope, HiMapPin, HiPhone } from 'react-icons/hi2';

import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type FooterProps = {
  locale: string;
};

const FOOTER_TOKENS = {
  colors: {
    background: '#07090b',
    text: '#C9CED6',
    muted: '#9AA1AA',
    red: 'var(--color-accent)',
    divider: 'rgba(156,163,175,0.42)',
  },
  fontClass: "font-['PingFang_SC','Microsoft_YaHei','SimHei',sans-serif]",
  desktop: {
    containerWidth: 1440,
    mainPaddingTop: 33,
    mainPaddingBottom: 28,
    gridColumns: '360px minmax(360px,1fr) 420px',
    gridGap: 48,
    logoWidth: 203,
    logoHeight: 114,
    qrSize: 104,
    qrGap: 28,
    titleFontSize: 20,
    titleUnderlineWidth: 52,
    titleUnderlineHeight: 3,
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
const POLICE_BEIAN_URL = 'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32120402001014';

const footerCopy = {
  zh: {
    contactUs: '联系我们',
    founded: '成立于2007年，厂房面积14700平方',
    brandIntro: '专注热处理工业炉研发制造，提供设计、制造、安装与售后服务。',
    address: '江苏省泰州市姜堰区张甸镇工业集中区',
    wechat: '微信二维码',
    douyin: '抖音二维码',
    email: 'sales@sunengfurnace.com',
    phone: '+86 139 1444 2520',
    copyright: 'Copyright © 2025 江苏苏能工业炉有限公司 版权所有',
    icp: '苏ICP备20020318号-1',
    policeBeian: '苏公网安备32120402001014号',
  },
  en: {
    contactUs: 'Contact Us',
    founded: 'Founded in 2007',
    brandIntro: 'Focused on industrial furnace R&D, manufacturing, installation and after-sales service.',
    address: 'Jiangduo Industrial Park, Jiangyan District, Taizhou, Jiangsu',
    wechat: 'WeChat QR',
    douyin: 'Douyin QR',
    email: 'sales@sunengfurnace.com',
    phone: '+86 139 1444 2520',
    copyright: 'Copyright © 2025 Jiangsu Suneng Industrial Furnace Co., Ltd. All rights reserved.',
    icp: '苏ICP备20020318号-1',
    policeBeian: '苏公网安备32120402001014号',
  },
} as const;

function SectionTitle({ children }: { children: ReactNode }) {
  const { colors, desktop } = FOOTER_TOKENS;

  return (
    <div className="flex flex-col items-center lg:items-start">
      <h3
        className={`${FOOTER_TOKENS.fontClass} whitespace-nowrap font-normal leading-none tracking-[0.04em] text-[var(--footer-text-color)]`}
        style={{ fontSize: desktop.titleFontSize }}
      >
        {children}
      </h3>
      <span
        aria-hidden="true"
        className="mt-[12px] rounded-[1px]"
        style={{
          width: desktop.titleUnderlineWidth,
          height: desktop.titleUnderlineHeight,
          backgroundColor: colors.red,
        }}
      />
    </div>
  );
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-[10px] lg:justify-start">
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[var(--footer-muted-color)]">
        {icon}
      </span>
      <span className={`${FOOTER_TOKENS.fontClass} whitespace-nowrap text-[14px] leading-[1.5] text-[var(--footer-muted-color)]`}>
        {children}
      </span>
    </div>
  );
}

function ContactIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--footer-red-color)] text-[var(--footer-red-color)]">
      {children}
    </span>
  );
}

function BrandBlock({ copy, locale }: { copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en']; locale: Locale }) {
  const { desktop } = FOOTER_TOKENS;

  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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

      <p className={`${FOOTER_TOKENS.fontClass} mt-[14px] max-w-[340px] text-[15px] leading-[1.75] text-[var(--footer-muted-color)]`}>
        {copy.brandIntro}
      </p>

      <div className="mt-[18px] flex flex-col gap-[10px]">
        <InfoRow icon={<HiCheckCircle className="h-[16px] w-[16px]" />}>{copy.founded}</InfoRow>
      </div>
    </div>
  );
}

function QrBlock({ copy, locale }: { copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en']; locale: Locale }) {
  const { desktop } = FOOTER_TOKENS;

  return (
    <div className="flex flex-col items-center lg:items-start">
      <SectionTitle>{copy.contactUs}</SectionTitle>

      <div className="mt-[28px] flex flex-wrap items-start justify-center lg:justify-start" style={{ gap: desktop.qrGap }}>
        {[
          { src: '/images/footer/wechat-qr.png', label: copy.wechat },
          { src: '/images/footer/douyin-qr.png', label: copy.douyin },
        ].map((qr) => (
          <div key={qr.label} className="group text-center">
            <div
              className="flex items-center justify-center rounded-[4px] bg-white transition-transform duration-200 group-hover:scale-[1.08]"
              style={{ width: desktop.qrSize, height: desktop.qrSize }}
            >
              <Image
                src={qr.src}
                alt={joinImageAlt(locale, [buildBrandImageAlt(locale, 'short'), qr.label])}
                width={desktop.qrSize}
                height={desktop.qrSize}
                className="h-full w-full object-contain"
              />
            </div>
            <p className={`${FOOTER_TOKENS.fontClass} mt-[10px] whitespace-nowrap text-[13px] leading-[1.5] text-[var(--footer-text-color)]`}>
              {qr.label}
            </p>
          </div>
        ))}
      </div>
      <p className={`${FOOTER_TOKENS.fontClass} mt-[20px] text-[14px] leading-[1.5] text-[var(--footer-muted-color)]`}>
        关注我们，了解更多产品与解决方案
      </p>
    </div>
  );
}

function ContactBlock({ copy }: { copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en'] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[28px] lg:items-start">
      <a
        href={`mailto:${copy.email}`}
        className={`${FOOTER_TOKENS.fontClass} flex items-center gap-[14px] whitespace-nowrap text-[16px] font-normal leading-[1.5] text-[var(--footer-text-color)] transition-colors hover:text-white`}
      >
        <ContactIcon>
          <HiEnvelope className="h-[20px] w-[20px]" />
        </ContactIcon>
        <span>{copy.email}</span>
      </a>

      <a
        href={`tel:${copy.phone.replace(/\s+/g, '')}`}
        className={`${FOOTER_TOKENS.fontClass} flex items-center gap-[14px] whitespace-nowrap text-[16px] font-normal leading-[1.5] text-[var(--footer-text-color)] transition-colors hover:text-white`}
      >
        <ContactIcon>
          <HiPhone className="h-[20px] w-[20px]" />
        </ContactIcon>
        <span>{copy.phone}</span>
      </a>

      <div className={`${FOOTER_TOKENS.fontClass} flex items-center gap-[14px] whitespace-nowrap text-[16px] font-normal leading-[1.5] text-[var(--footer-text-color)]`}>
        <ContactIcon>
          <HiMapPin className="h-[22px] w-[22px]" />
        </ContactIcon>
        <span>{copy.address}</span>
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
        '--footer-red-color': colors.red,
        '--footer-divider-color': colors.divider,
        '--footer-main-pt': px(desktop.mainPaddingTop),
        '--footer-main-pb': px(desktop.mainPaddingBottom),
        backgroundImage:
          'radial-gradient(circle at 92% 24%, rgba(230,0,18,0.16), transparent 18%), linear-gradient(135deg, rgba(255,255,255,0.05), transparent 34%), linear-gradient(180deg, #11161b 0%, #07090b 100%)',
      })}
    >
      {/* Footer 主体：品牌信息、二维码、联系方式三列，删除导航和产品列表。 */}
      <div
        className="mx-auto w-full px-6 pt-[var(--footer-main-pt)] lg:px-10"
        style={{ maxWidth: px(desktop.containerWidth) }}
      >
        <div
          className="grid items-center gap-9 pb-[var(--footer-main-pb)] md:grid-cols-1 lg:grid-cols-[var(--footer-grid-columns)] lg:gap-[var(--footer-grid-gap)]"
          style={varStyle({
            '--footer-grid-columns': desktop.gridColumns,
            '--footer-grid-gap': px(desktop.gridGap),
          })}
        >
          <BrandBlock copy={copy} locale={currentLocale} />
          <div className="relative py-8 lg:ml-[10px] lg:flex lg:self-stretch lg:px-[58px] lg:py-0">
            {/* 模块分割线：桌面端隔开公司介绍 / 联系我们 / 联系方式。 */}
            <span
              aria-hidden="true"
              className="hidden lg:block absolute left-0 top-0 h-full w-px scale-x-50"
              style={{ backgroundColor: colors.divider }}
            />
            <span
              aria-hidden="true"
              className="hidden lg:block absolute right-0 top-0 h-full w-px scale-x-50"
              style={{ backgroundColor: colors.divider }}
            />
            <div className="w-full lg:flex lg:translate-x-[20px] lg:items-center">
              <QrBlock copy={copy} locale={currentLocale} />
            </div>
          </div>
          <div className="lg:pl-[14px]">
            <ContactBlock copy={copy} />
          </div>
        </div>
      </div>

      {/* 底部备案条：版权与备案独立放置，桌面左右对齐，移动端居中堆叠。 */}
      <div className="relative before:absolute before:inset-x-0 before:top-0 before:h-px before:scale-y-50 before:bg-[var(--footer-divider-color)]">
        <div
          className={`${FOOTER_TOKENS.fontClass} mx-auto flex w-full flex-col items-center justify-center gap-2 px-6 text-[13px] leading-[1.5] text-[var(--footer-muted-color)] md:flex-row md:gap-[26px] lg:px-10`}
          style={{
            maxWidth: px(desktop.containerWidth),
            paddingTop: desktop.bottomPaddingY,
            paddingBottom: desktop.bottomPaddingY,
          }}
        >
          <span>{copy.copyright}</span>
          <span aria-hidden="true" className="hidden h-[14px] w-px scale-x-50 bg-[var(--footer-divider-color)] md:block" />
          <a
            href={MIIT_BEIAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            {copy.icp}
          </a>
          <span aria-hidden="true" className="hidden h-[14px] w-px scale-x-50 bg-[var(--footer-divider-color)] md:block" />
          <a
            href={POLICE_BEIAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
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
