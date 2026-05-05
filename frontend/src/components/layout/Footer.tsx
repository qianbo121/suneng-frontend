import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiChevronRight, HiEnvelope, HiMapPin, HiPhone } from 'react-icons/hi2';

import { getLocalizedNavigation, getLocalizedText, productCenterNavigationItems } from '@/mock/navigation';
import { Locale } from '@/types/site';

type FooterProps = {
  locale: string;
};

type NavItem = {
  key: string;
  label: string;
  href: string;
};

const FOOTER_TOKENS = {
  colors: {
    background: '#000000',
    text: '#D8D8D8',
    red: 'var(--color-accent)',
    divider: 'rgba(255,255,255,0.28)',
    subtleDivider: 'rgba(255,255,255,0.22)',
  },
  fontClass: "font-['PingFang_SC','Microsoft_YaHei','SimHei',sans-serif]",
  desktop: {
    containerWidth: 1440,
    gridColumns: '360px 220px 220px 360px',
    gridGap: 56,
    mainPaddingTop: 48,
    mainPaddingBottom: 44,
    contentHeight: 290,
    dividerHeight: 350,
    logoColumnWidth: 360,
    logoColumnPaddingRight: 0,
    logoTopOffset: 0,
    logoWidth: 125,
    logoHeight: 125,
    logoTranslateY: -37,
    logoScale: 1.3,
    logoTextWidth: 360,
    logoTextMarginTop: -16,
    addressIconSize: 48,
    titleFontSize: 20,
    titleUnderlineWidth: 60,
    titleUnderlineHeight: 3,
    titleUnderlineTopGap: 12,
    titleBottomGap: 26,
    listLineHeight: 24,
    listGap: 8,
    listFontSize: 15,
    arrowSize: 18,
    navColumnWidth: 220,
    navColumnPaddingLeft: 60,
    contactColumnWidth: 360,
    contactColumnPaddingLeft: 40,
    qrSize: 88,
    qrGap: 24,
    contactRuleWidth: '100%',
    contactIconSize: 42,
    contactSvgSize: 18,
    contactIconGap: 16,
    contactGap: 18,
    contactDividerTop: 24,
    contactDividerBottom: 22,
    bottomHeight: 92,
    bottomPaddingY: 0,
    copyrightFontSize: 13,
  },
} as const;

function px(value: number) {
  return `${value}px`;
}

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

const footerCopy = {
  zh: {
    quickNav: '快速导航',
    productCategories: '产品中心',
    contactUs: '联系我们',
    founded: '成立于2007年',
    brandIntro: ['专注热处理工业炉研发制造方案', '提供设计、制造、安装与售后服务。'],
    address: '江苏省泰州市姜堰区张甸镇工业集中区',
    wechat: '微信二维码',
    douyin: '抖音二维码',
    email: 'sales@sunengfurnace.com',
    phone: '+86 0519-8888-8888',
    slogan: '高效 · 节能 · 可靠 · 智能',
    copyright: 'Copyright © 2025 江苏苏能工业炉有限公司 版权所有',
    icp: '苏ICP备18002201号-1',
  },
  en: {
    quickNav: 'Quick Navigation',
    productCategories: 'Product Center',
    contactUs: 'Contact Us',
    founded: 'Founded in 2007',
    brandIntro: [
      'Focused on industrial furnace R&D and manufacturing.',
      'Design, fabrication, installation and after-sales service.',
    ],
    address: 'Jiangduo Industrial Park, Jiangyan District, Taizhou, Jiangsu',
    wechat: 'WeChat QR',
    douyin: 'Douyin QR',
    email: 'sales@sunengfurnace.com',
    phone: '+86 0519-8888-8888',
    slogan: 'Efficient · Energy-saving · Reliable · Intelligent',
    copyright: 'Copyright © 2025 Jiangsu Suneng Industrial Furnace Co., Ltd. All rights reserved.',
    icp: '苏ICP备18002201号-1',
  },
} as const;

function buildLocaleHref(locale: string, href: string) {
  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  const { desktop, colors } = FOOTER_TOKENS;

  return (
    // 模块标题：白字、红线统一 60px，对齐设计稿节奏。
    <div style={{ marginBottom: desktop.titleBottomGap }}>
      <h3
        className={`${FOOTER_TOKENS.fontClass} whitespace-nowrap break-keep font-normal leading-none tracking-[0.02em] text-[var(--footer-text-color)]`}
        style={{ fontSize: desktop.titleFontSize }}
      >
        {children}
      </h3>
      <div
        className="rounded-[1px]"
        style={{
          marginTop: desktop.titleUnderlineTopGap,
          width: desktop.titleUnderlineWidth,
          height: desktop.titleUnderlineHeight,
          backgroundColor: colors.red,
        }}
      />
    </div>
  );
}

function DividerColumn({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { colors, desktop } = FOOTER_TOKENS;

  return (
    // 列布局：桌面分割线采用绝对高度，平板和手机取消竖向分割。
    <div className={`relative ${className}`} style={style}>
      <span
        aria-hidden="true"
        className="absolute left-0 top-[-10px] hidden w-px lg:block"
        style={{ height: desktop.dividerHeight, backgroundColor: colors.divider }}
      />
      {children}
    </div>
  );
}

function CircleIcon({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-dashed text-[20px] ${className}`}
      style={{ borderColor: FOOTER_TOKENS.colors.red, color: FOOTER_TOKENS.colors.red, ...style }}
    >
      {children}
    </span>
  );
}

function LinkList({
  items,
  locale,
}: {
  items: readonly string[] | NavItem[];
  locale: string;
}) {
  const { colors, desktop } = FOOTER_TOKENS;

  return (
    // 链接列表：白字、红色箭头，全部不折行。
    <nav className="flex flex-col" style={{ gap: desktop.listGap }}>
      {items.map((item) => {
        const key = typeof item === 'string' ? item : item.key;
        const label = typeof item === 'string' ? item : item.label;
        const href = typeof item === 'string' ? '/products' : item.href;

        return (
          <Link
            key={key}
            href={buildLocaleHref(locale, href)}
            className={`group flex items-center gap-[8px] ${FOOTER_TOKENS.fontClass} whitespace-nowrap break-keep font-normal text-[var(--footer-text-color)] transition-colors hover:text-white`}
            style={{ fontSize: desktop.listFontSize, lineHeight: px(desktop.listLineHeight) }}
          >
            <HiChevronRight
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              style={{ width: desktop.arrowSize, height: desktop.arrowSize, color: colors.red }}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function LogoBlock({ copy }: { copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en'] }) {
  const { desktop } = FOOTER_TOKENS;

  return (
    // Logo 与公司信息：Logo 参与 grid，视觉放大 1.3 倍并上移，不撑开父级高度。
    <div
      style={varStyle({
        '--footer-logo-column-width': px(desktop.logoColumnWidth),
        '--footer-logo-column-pr': px(desktop.logoColumnPaddingRight),
        paddingTop: desktop.logoTopOffset,
      })}
      className="lg:w-[var(--footer-logo-column-width)] lg:pr-[var(--footer-logo-column-pr)]"
    >
      <div
        className="footer-logo-container mx-auto"
        style={varStyle({
          width: px(desktop.logoWidth),
          height: px(desktop.logoHeight),
          '--footer-logo-translate-y': px(desktop.logoTranslateY),
          '--footer-logo-scale': desktop.logoScale,
          transform: 'translateY(var(--footer-logo-translate-y)) scale(var(--footer-logo-scale))',
        })}
      >
        <Image
          src="/images/brand/sn-logo-white.png"
          alt="苏能工业炉"
          width={desktop.logoWidth * 2}
          height={desktop.logoWidth * 2}
          priority={false}
          className="h-full w-full object-contain"
        />
      </div>

      <div
        className="text-center"
        style={{
          width: desktop.logoTextWidth,
          marginLeft: `calc((100% - ${px(desktop.logoTextWidth)}) / 2)`,
          marginTop: desktop.logoTextMarginTop,
        }}
      >
        <p className={`${FOOTER_TOKENS.fontClass} -translate-y-[8px] whitespace-nowrap break-keep text-[15px] font-normal leading-[1.45] tracking-[0.05em] text-[var(--footer-text-color)]`}>
          {copy.founded}
        </p>
        <div className={`mt-[7px] ${FOOTER_TOKENS.fontClass} whitespace-nowrap break-keep text-[13px] font-normal leading-[1.45] tracking-[0.02em] text-[var(--footer-text-color)]`}>
          {copy.brandIntro.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <div
        className="mt-[12px] flex items-center justify-center gap-[12px]"
        style={{
          width: desktop.logoTextWidth,
          marginLeft: `calc((100% - ${px(desktop.logoTextWidth)}) / 2)`,
        }}
      >
        <HiMapPin className="h-[13px] w-[13px] shrink-0 text-white" />
        <span className={`${FOOTER_TOKENS.fontClass} -translate-x-[5px] whitespace-nowrap break-keep text-[13px] font-normal leading-[1.45] tracking-[0.02em] text-[var(--footer-text-color)]`}>
          {copy.address}
        </span>
      </div>

      <div
        className={`${FOOTER_TOKENS.fontClass} mt-[10px] flex flex-col items-center gap-[2px] whitespace-nowrap break-keep text-center text-[var(--footer-text-color)]`}
        style={{
          width: desktop.logoTextWidth,
          marginLeft: `calc((100% - ${px(desktop.logoTextWidth)}) / 2)`,
          fontSize: desktop.copyrightFontSize,
          lineHeight: 1.5,
        }}
      >
        <span>{copy.copyright}</span>
        <span>{copy.icp}</span>
      </div>
    </div>
  );
}

function ContactBlock({ copy }: { copy: (typeof footerCopy)['zh'] | (typeof footerCopy)['en'] }) {
  const { colors, desktop } = FOOTER_TOKENS;

  return (
    // 联系我们：二维码 88px，分割线满宽，联系方式图标与文字垂直居中。
    <DividerColumn
      className="lg:w-[var(--footer-contact-width)] lg:pl-[var(--footer-contact-pl)]"
      style={varStyle({
        '--footer-contact-width': px(desktop.contactColumnWidth),
        '--footer-contact-pl': px(desktop.contactColumnPaddingLeft),
      })}
    >
      <div id="footer-contact">
        <SectionTitle>{copy.contactUs}</SectionTitle>

        <div className="flex items-start" style={{ gap: desktop.qrGap }}>
          {[
            { src: '/images/footer/wechat-qr.png', label: copy.wechat },
            { src: '/images/footer/douyin-qr.png', label: copy.douyin },
          ].map((qr) => (
            <div key={qr.label} className="group text-center">
              <div
                className="flex items-center justify-center rounded bg-white transition-transform duration-200 group-hover:scale-[1.12]"
                style={{ width: desktop.qrSize, height: desktop.qrSize }}
              >
                <Image
                  src={qr.src}
                  alt={qr.label}
                  width={desktop.qrSize}
                  height={desktop.qrSize}
                  className="object-contain"
                  style={{ width: desktop.qrSize, height: desktop.qrSize }}
                />
              </div>
              <p className={`mt-[8px] ${FOOTER_TOKENS.fontClass} whitespace-nowrap break-keep text-[13px] font-normal leading-[1.5] text-[var(--footer-text-color)]`}>
                {qr.label}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            width: desktop.contactRuleWidth,
            marginTop: desktop.contactDividerTop,
          }}
        >
          <div aria-hidden="true" className="h-px w-full" style={{ backgroundColor: colors.subtleDivider }} />
          <a
            href={`mailto:${copy.email}`}
            className={`${FOOTER_TOKENS.fontClass} flex items-center whitespace-nowrap break-keep text-[15px] font-medium leading-[1.5] text-[var(--footer-text-color)] transition-colors hover:text-white`}
            style={{ gap: desktop.contactIconGap, marginTop: desktop.contactDividerBottom }}
          >
            <CircleIcon className="text-[18px]" style={{ width: desktop.contactIconSize, height: desktop.contactIconSize }}>
              <HiEnvelope style={{ width: desktop.contactSvgSize, height: desktop.contactSvgSize }} />
            </CircleIcon>
            <span>{copy.email}</span>
          </a>
          <a
            href={`tel:${copy.phone.replace(/\s+/g, '')}`}
            className={`${FOOTER_TOKENS.fontClass} flex items-center whitespace-nowrap break-keep text-[15px] font-medium leading-[1.5] text-[var(--footer-text-color)] transition-colors hover:text-white`}
            style={{ gap: desktop.contactIconGap, marginTop: desktop.contactGap }}
          >
            <CircleIcon className="text-[18px]" style={{ width: desktop.contactIconSize, height: desktop.contactIconSize }}>
              <HiPhone style={{ width: desktop.contactSvgSize, height: desktop.contactSvgSize }} />
            </CircleIcon>
            <span>{copy.phone}</span>
          </a>
        </div>
      </div>
    </DividerColumn>
  );
}

export function Footer({ locale }: FooterProps) {
  const { colors, desktop } = FOOTER_TOKENS;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const copy = footerCopy[currentLocale];
  const navItems = getLocalizedNavigation(currentLocale).map((item) => ({
    key: item.key,
    label: item.labelText,
    href: item.href,
  }));
  const productItems = productCenterNavigationItems.map((item) => ({
    key: item.key,
    label: getLocalizedText(currentLocale, item.label),
    href: item.href,
  }));

  return (
    <footer
      className="site-footer relative overflow-hidden text-[var(--footer-text-color)]"
      style={varStyle({
        backgroundColor: colors.background,
        '--footer-text-color': colors.text,
        '--footer-main-pt': px(desktop.mainPaddingTop),
        '--footer-main-pb': px(desktop.mainPaddingBottom),
      })}
    >
      {/* Footer 主体：桌面四列固定网格，平板两列，手机单列。 */}
      <div
        className="mx-auto w-full px-6 pt-8 lg:px-10 lg:pt-[var(--footer-main-pt)]"
        style={varStyle({
          maxWidth: px(desktop.containerWidth),
        })}
      >
        <div
          className="grid gap-10 pb-8 md:grid-cols-2 lg:grid-cols-[var(--footer-grid-columns)] lg:gap-[var(--footer-grid-gap)] lg:pb-[var(--footer-main-pb)]"
          style={varStyle({
            '--footer-grid-columns': desktop.gridColumns,
            '--footer-grid-gap': px(desktop.gridGap),
            minHeight: px(desktop.contentHeight),
          })}
        >
          <LogoBlock copy={copy} />

          <DividerColumn
            className="lg:w-[var(--footer-nav-width)] lg:pl-[var(--footer-nav-pl)]"
            style={varStyle({
              '--footer-nav-width': px(desktop.navColumnWidth),
              '--footer-nav-pl': px(desktop.navColumnPaddingLeft),
            })}
          >
            <SectionTitle>{copy.quickNav}</SectionTitle>
            <LinkList items={navItems} locale={locale} />
          </DividerColumn>

          <DividerColumn
            className="lg:w-[var(--footer-nav-width)] lg:pl-[var(--footer-nav-pl)]"
            style={varStyle({
              '--footer-nav-width': px(desktop.navColumnWidth),
              '--footer-nav-pl': px(desktop.navColumnPaddingLeft),
            })}
          >
            <SectionTitle>{copy.productCategories}</SectionTitle>
            <LinkList items={productItems} locale={locale} />
          </DividerColumn>

          <ContactBlock copy={copy} />
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
              logo.style.setProperty('--footer-logo-translate-y', value || '-40px');
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
