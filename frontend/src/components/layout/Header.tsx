'use client';

import Image from 'next/image';
import { NavigationLink as Link } from '@/components/layout/NavigationLink';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  HiBars3BottomRight,
  HiChevronDown,
  HiOutlineXMark,
  HiPhone,
} from 'react-icons/hi2';

import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { buildBrandImageAlt } from '@/lib/seo';
import { getLocalizedNavigation } from '@/mock/navigation';
import { siteSettings } from '@/mock/siteSettings';
import { Locale } from '@/types/site';

import styles from './Header.module.css';
import { useEnglishNewsLink } from './useEnglishNewsLink';

type HeaderProps = {
  locale: string;
  localeSwitchReload?: boolean;
};

const HEADER_LOGO_SRC = '/images/brand/sn-logo-header-cropped.png';
const MOBILE_NAV_COPY = {
  zh: {
    open: '打开导航',
    close: '关闭导航',
    dialog: '移动导航',
  },
  en: {
    open: 'Open navigation',
    close: 'Close navigation',
    dialog: 'Mobile navigation',
  },
} satisfies Record<Locale, { open: string; close: string; dialog: string }>;

function buildLocaleHref(locale: string, href: string) {
  if (/^\/(zh|en)(?:\/|$)/.test(href)) return href;
  if (href.startsWith('/#')) return `/${locale}${href.slice(1)}`;
  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

function SubmenuLink({ href, ...props }: ComponentProps<'a'> & { href: string }) {
  // Native navigation also resolves fragment targets after the destination page loads.
  return href.includes('#') ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}

function buildLocaleSwitchPath(
  pathname: string,
  nextLocale: 'zh' | 'en',
  currentLocale: 'zh' | 'en',
) {
  // Switching to English from a Chinese-only page (no /en counterpart) lands on
  // the English home instead of a 404. The source of truth is ZH_ONLY_PATHS.
  if (currentLocale === 'zh' && nextLocale === 'en' && isZhOnlyPath(pathname)) {
    return '/en';
  }

  if (pathname === `/${currentLocale}` || pathname === `/${currentLocale}/`) {
    return `/${nextLocale}`;
  }

  if (!pathname.startsWith(`/${currentLocale}/`)) {
    return pathname === '/' ? `/${nextLocale}` : `/${nextLocale}${pathname}`;
  }

  const [, , ...parts] = pathname.split('/');
  const tail = parts.join('/');
  return `/${nextLocale}${tail ? `/${tail}` : ''}`;
}

function isActiveNavItem(pathname: string, href: string) {
  if (pathname === '/zh/solutions/continuous-heat-treatment-line') return href === '/zh/products';
  if (pathname === href) {
    return true;
  }

  if (href === '/zh' || href === '/en') {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

export function Header({ locale, localeSwitchReload = false }: HeaderProps) {
  const LocaleSwitchLink = localeSwitchReload ? 'a' : Link;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState<string | null>(null);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const desktopMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundHeaderRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const isEngineeringLanding = pathname === '/zh/solutions/continuous-heat-treatment-line' || pathname === '/zh/service/furnace-renovation-overhaul';
  const navItems = useMemo(() => getLocalizedNavigation(currentLocale).map(item =>
    isEngineeringLanding && item.href === '/products' ? { ...item, labelText: '设备与生产线' } : item
  ), [currentLocale, isEngineeringLanding]);
  const switchLocale = currentLocale === 'zh' ? 'en' : 'zh';
  const englishNewsLink = useEnglishNewsLink(pathname);
  const switchLocalePath = englishNewsLink ?? buildLocaleSwitchPath(pathname, switchLocale, currentLocale);
  const switchLocaleTitle = englishNewsLink === '/en/news'
    ? 'English resources — this article has no confirmed English version'
    : undefined;
  const localeLabel = { zh: '中文', en: 'EN' } as const;
  const logoAlt = buildBrandImageAlt(currentLocale, 'full');
  const mobileNavCopy = MOBILE_NAV_COPY[currentLocale];

  const updateDesktopMenu = (key: string | null, delay = 0) => {
    if (desktopMenuTimerRef.current) clearTimeout(desktopMenuTimerRef.current);
    desktopMenuTimerRef.current = null;
    if (delay) {
      desktopMenuTimerRef.current = setTimeout(() => {
        setOpenDesktopMenu(key);
        desktopMenuTimerRef.current = null;
      }, delay);
    } else {
      setOpenDesktopMenu(key);
    }
  };

  const dismissDesktopMenu = (menu: HTMLLIElement) => {
    menu.querySelector<HTMLAnchorElement>('.site-header__nav-link')?.focus({ preventScroll: true });
    updateDesktopMenu(null);
  };

  useEffect(() => {
    setMobileOpen(false);
    setMobileExpandedKey(null);
    setOpenDesktopMenu(null);
    if (desktopMenuTimerRef.current) clearTimeout(desktopMenuTimerRef.current);
    return () => {
      if (desktopMenuTimerRef.current) clearTimeout(desktopMenuTimerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const panel = mobilePanelRef.current;
    const backgroundElements = [
      backgroundHeaderRef.current,
      document.getElementById('site-page-content'),
    ].filter((element): element is HTMLElement => Boolean(element));
    const previousAttributes = backgroundElements.map((element) => ({
      element,
      hadInert: element.hasAttribute('inert'),
      ariaHidden: element.getAttribute('aria-hidden'),
    }));

    closeButtonRef.current?.focus();
    backgroundElements.forEach((element) => {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.add('mobile-nav-open', 'overflow-hidden');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true');

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !panel.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !panel.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('mobile-nav-open');
      document.body.classList.remove('overflow-hidden');
      previousAttributes.forEach(({ element, hadInert, ariaHidden }) => {
        if (!hadInert) element.removeAttribute('inert');
        if (ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', ariaHidden);
        }
      });
      if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={backgroundHeaderRef}
        className="site-header relative z-[9999] min-h-[78px] bg-transparent xl:min-h-header-h"
      >
        <div className="fixed inset-x-0 top-0 z-[9999] flex h-[78px] items-center justify-between bg-white px-3 xl:hidden">
          <Link
            href={`/${locale}`}
            className="ml-2 flex h-[72px] w-auto items-center"
            aria-label={logoAlt}
          >
            <Image
              src={HEADER_LOGO_SRC}
              alt={logoAlt}
              width={229}
              height={40}
              priority
              className="max-w-none object-contain object-left object-center"
              style={{ width: '229px', height: 'auto' }}
            />
          </Link>
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => {
              previouslyFocusedRef.current = openButtonRef.current;
              setMobileExpandedKey(null);
              setMobileOpen(true);
            }}
            className="flex h-[60px] w-[50px] items-center justify-center text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            aria-label={mobileNavCopy.open}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-dialog"
          >
            <HiBars3BottomRight className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>

        <div className="site-header__desktop-bar fixed inset-x-0 top-0 z-[9999] hidden h-header-h w-full items-center bg-white shadow-[0_8px_26px_rgba(15,23,42,0.06)] xl:flex">
          <div className={styles.desktopLayout} data-locale={currentLocale}>
            <div className="shrink-0 self-center">
              <div className="w-auto">
                <Link
                  href={`/${locale}`}
                  className="site-header__desktop-logo-link flex h-[78px] w-auto items-center justify-start"
                  aria-label={logoAlt}
                >
                  <Image
                    src={HEADER_LOGO_SRC}
                    alt={logoAlt}
                    width={275}
                    height={48}
                    priority
                    className="max-w-none object-contain object-left object-center"
                    style={{ width: '275px', height: 'auto' }}
                  />
                </Link>
              </div>
            </div>

            <div className={styles.primaryNav}>
              <div className="e_navigationA-24">
                <div className="p_navButton hidden" />
                <div className="p_navContent">
                  <ul className={`p_level1Box ${styles.primaryList}`}>
                    {navItems.map((item) => {
                      const href = buildLocaleHref(locale, item.href);
                      const childHrefs =
                        item.children?.map((child) => buildLocaleHref(locale, child.href)) ?? [];
                      const isActive =
                        isActiveNavItem(pathname, href) ||
                        childHrefs.some((childHref) => isActiveNavItem(pathname, childHref));
                      const isContactItem = item.key === 'contact';

                      return (
                        <li
                          key={item.key}
                          data-open={openDesktopMenu === item.key || undefined}
                          onMouseEnter={() => updateDesktopMenu(item.children?.length ? item.key : null, 130)}
                          onMouseLeave={(event) => {
                            if (!event.currentTarget.contains(document.activeElement)) {
                              updateDesktopMenu(null, 180);
                            }
                          }}
                          onFocusCapture={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                              updateDesktopMenu(item.children?.length ? item.key : null);
                            }
                          }}
                          onBlurCapture={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                              updateDesktopMenu(null);
                            }
                          }}
                          onClickCapture={(event) => {
                            if (event.target instanceof Element && event.target.closest('a[href]')) {
                              dismissDesktopMenu(event.currentTarget);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                              event.preventDefault();
                              dismissDesktopMenu(event.currentTarget);
                            }
                          }}
                          className="site-header__nav-item p_level1Item group relative h-header-h list-none border-none"
                        >
                          <p
                            className={`site-header__nav-height p_menu1Item relative h-header-h ${isActive ? '' : ''}`}
                          >
                            <Link
                              href={href}
                              className={`site-header__nav-link ${isContactItem ? 'site-header__contact-link' : ''} relative z-[2] flex items-center whitespace-nowrap text-center text-[15px] tracking-[0.01em] transition-colors duration-300 ${
                                isContactItem
                                  ? 'my-[18px] h-[46px] bg-[#c51624] px-[18px] font-semibold text-white hover:bg-[#a90f1b] focus-visible:bg-[#a90f1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c51624]'
                                  : `${styles.primaryLink} h-header-h px-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-primary`
                              }`}
                              aria-current={isActive ? 'page' : undefined}
                              aria-expanded={item.children?.length ? openDesktopMenu === item.key : undefined}
                              aria-controls={item.children?.length ? `desktop-subnav-${item.key}` : undefined}
                            >
                              <span className="inline-flex items-center leading-none">
                                {item.labelText}
                              </span>
                              {item.children?.length ? (
                                <HiChevronDown aria-hidden="true" className={styles.menuChevron} />
                              ) : null}
                            </Link>
                          </p>

                          {item.children?.length ? (
                            <ul
                              id={`desktop-subnav-${item.key}`}
                              className={`p_level2Box ${styles.submenu}`}
                            >
                              {item.children.map((child) => (
                                <li
                                  key={child.key}
                                  className="p_level2Item list-none"
                                >
                                  <p className="p_menu2Item">
                                    <SubmenuLink
                                      href={buildLocaleHref(locale, child.href)}
                                      className={styles.submenuLink}
                                      aria-current={pathname === buildLocaleHref(locale, child.href) ? 'page' : undefined}
                                    >
                                      {child.labelText}
                                    </SubmenuLink>
                                  </p>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}

                  </ul>
                </div>
              </div>
            </div>

            <ul className={styles.actions}>
              {(
                <li className="relative flex list-none items-center border-none">
                  <a
                    href={`tel:${siteSettings.salesPhone.replace(/\s+/g, '')}`}
                    className="flex min-h-[44px] items-center gap-2 whitespace-nowrap text-[14px] font-normal text-[#5b6678] transition-colors duration-200 hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <HiPhone aria-hidden="true" className="h-4 w-4" />
                    <span>{currentLocale === 'zh' ? siteSettings.salesPhone.replace(/^\+86-?/, '') : siteSettings.salesPhone}</span>
                  </a>
                </li>
              )}

              <li className="relative flex list-none items-center">
                <LocaleSwitchLink
                  href={switchLocalePath}
                  title={switchLocaleTitle}
                  className="relative z-[2] flex min-h-[44px] min-w-8 items-center justify-center whitespace-nowrap text-center text-[14px] font-normal tracking-[0.01em] text-[#697386] transition-colors duration-300 hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-primary"
                >
                  <span>{localeLabel[switchLocale]}</span>
                </LocaleSwitchLink>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          ref={mobilePanelRef}
          id="mobile-navigation-dialog"
          className="fixed inset-0 z-[10000] overflow-y-auto bg-white xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={mobileNavCopy.dialog}
          tabIndex={-1}
        >
          <div className="sticky top-0 z-20 flex h-[78px] items-center justify-between border-b border-black/5 bg-white px-4">
            <Link
              href={`/${locale}`}
              className="ml-2 flex h-[72px] w-auto items-center"
              aria-label={logoAlt}
            >
              <Image
                src={HEADER_LOGO_SRC}
                alt={logoAlt}
                width={229}
                height={40}
                priority
                className="max-w-none object-contain object-left object-center"
                style={{ width: '229px', height: 'auto' }}
              />
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-[60px] w-[50px] items-center justify-center text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              aria-label={mobileNavCopy.close}
            >
              <HiOutlineXMark className="h-8 w-8" aria-hidden="true" />
            </button>
          </div>

          {(
            <div className="sticky top-[78px] z-10 border-b border-[#e5e9f0] bg-white px-5 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
              <a
                href={`tel:${siteSettings.salesPhone.replace(/\s+/g, '')}`}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[4px] border border-[#cfd8e5] px-3 text-[14px] font-semibold text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <HiPhone aria-hidden="true" className="h-4 w-4" />
                {currentLocale === 'en' ? 'Call us' : '电话咨询'}
              </a>
            </div>
          )}

          <div className="px-5 pb-10 pt-4">
            <div className="p_navContent">
              <ul className="p_level1Box flex flex-col">
                {navItems
                  .filter((item) => currentLocale !== 'zh' || item.key !== 'contact')
                  .map((item) => {
                    const href = buildLocaleHref(locale, item.href);
                    const childHrefs =
                      item.children?.map((child) => buildLocaleHref(locale, child.href)) ?? [];
                    const isActive =
                      isActiveNavItem(pathname, href) ||
                      childHrefs.some((childHref) => isActiveNavItem(pathname, childHref));
                    const isContactItem = item.key === 'contact';
                    const isExpanded = mobileExpandedKey === item.key;
                    const submenuId = `mobile-subnav-${item.key}`;

                    return (
                      <li key={item.key} className="p_level1Item list-none border-b border-black/5">
                        <div className="p_menu1Item flex min-h-[58px] items-center">
                          <Link
                            href={href}
                            className={`my-1 flex min-h-[50px] min-w-0 flex-1 items-center px-3 py-1 text-[16px] leading-[1.5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary ${
                              isContactItem
                                ? 'bg-[#c51624] font-semibold text-white'
                                : styles.primaryLink
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <span>{item.labelText}</span>
                          </Link>
                          {item.children?.length ? (
                            <button
                              type="button"
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                              aria-label={`${currentLocale === 'en' ? (isExpanded ? 'Collapse ' : 'Expand ') : (isExpanded ? '收起' : '展开')}${item.labelText}`}
                              aria-expanded={isExpanded}
                              aria-controls={submenuId}
                              onClick={() =>
                                setMobileExpandedKey((current) =>
                                  current === item.key ? null : item.key,
                                )
                              }
                            >
                              <HiChevronDown
                                className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-brand-primary' : ''}`}
                                aria-hidden="true"
                              />
                            </button>
                          ) : null}
                        </div>

                        {item.children?.length && isExpanded ? (
                          <ul id={submenuId} className="p_level2Box pb-4 pl-5">
                            {item.children.map((child) => (
                              <li key={child.key} className="p_level2Item list-none">
                                <p className="p_menu2Item">
                                  <SubmenuLink
                                    href={buildLocaleHref(locale, child.href)}
                                    onClick={() => {
                                      setMobileOpen(false);
                                      setMobileExpandedKey(null);
                                    }}
                                    className="flex min-h-[48px] items-center py-3 pr-3 text-[16px] leading-[24px] text-[#5f697b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                                  >
                                    {child.labelText}
                                  </SubmenuLink>
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}

                <li className="p_level1Item list-none border-b border-black/5">
                  <LocaleSwitchLink
                    href={switchLocalePath}
                    title={switchLocaleTitle}
                    className="flex min-h-[50px] items-center justify-between py-1 text-[14px] font-semibold leading-[50px] text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                  >
                    <span>{localeLabel[switchLocale]}</span>
                  </LocaleSwitchLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
