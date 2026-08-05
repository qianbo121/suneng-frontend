'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HiBars3BottomRight, HiChevronRight, HiOutlineXMark } from 'react-icons/hi2';

import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { buildBrandImageAlt } from '@/lib/seo';
import { getLocalizedNavigation } from '@/mock/navigation';
import { Locale } from '@/types/site';

type HeaderProps = {
  locale: string;
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
  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

function buildLocaleSwitchPath(pathname: string, nextLocale: 'zh' | 'en', currentLocale: 'zh' | 'en') {
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
  if (pathname === href) {
    return true;
  }

  if (href === '/zh' || href === '/en') {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

export function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const backgroundHeaderRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const navItems = useMemo(() => getLocalizedNavigation(currentLocale), [currentLocale]);
  const switchLocale = currentLocale === 'zh' ? 'en' : 'zh';
  const switchLocalePath = buildLocaleSwitchPath(pathname, switchLocale, currentLocale);
  const localeLabel = { zh: '中文', en: 'EN' } as const;
  const logoAlt = buildBrandImageAlt(currentLocale, 'full');
  const mobileNavCopy = MOBILE_NAV_COPY[currentLocale];

  useEffect(() => {
    setMobileOpen(false);
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
      } else if (!event.shiftKey && (activeElement === lastElement || !panel.contains(activeElement))) {
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
        className="relative z-[9999] min-h-[78px] bg-transparent bp-tablet-min:min-h-header-h"
      >
        <div className="fixed inset-x-0 top-0 z-[9999] flex h-[78px] items-center justify-between bg-white px-3 bp-tablet-min:hidden">
          <Link href={`/${locale}`} className="ml-2 flex h-[72px] w-auto items-center" aria-label={logoAlt}>
            <Image
              src={HEADER_LOGO_SRC}
              alt={logoAlt}
              width={229}
              height={40}
              priority
              className="max-w-none object-contain object-left object-center"
              style={{ width: 'auto', height: '40px' }}
            />
          </Link>
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => {
              previouslyFocusedRef.current = openButtonRef.current;
              setMobileOpen(true);
            }}
            className="flex h-[60px] w-[50px] items-center justify-center text-text-secondary"
            aria-label={mobileNavCopy.open}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-dialog"
          >
            <HiBars3BottomRight className="h-8 w-8" />
          </button>
        </div>

        <div className="fixed inset-x-0 top-0 z-[9999] hidden h-header-h w-full items-center border-b border-black/6 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.06)] bp-tablet-min:flex">
          <div className="flex w-full items-center justify-between pl-12 pr-10 bp-desktop-wide-max:pl-10 bp-desktop-wide-max:pr-8 bp-tablet-max:px-4">
            <div className="shrink-0 self-center">
              <div className="w-auto">
                <Link href={`/${locale}`} className="flex h-[78px] w-auto items-center justify-start" aria-label={logoAlt}>
                  <Image
                    src={HEADER_LOGO_SRC}
                    alt={logoAlt}
                    width={275}
                    height={48}
                    priority
                    className="max-w-none object-contain object-left object-center"
                    style={{ width: 'auto', height: '48px' }}
                  />
                </Link>
              </div>
            </div>

            <div className="ml-10 flex min-w-0 flex-1 self-center justify-end px-2 bp-desktop-wide-max:ml-7 bp-tablet-max:ml-3 bp-tablet-max:px-1">
              <div className="e_navigationA-24 flex min-w-0 flex-1 items-center justify-end">
                <div className="p_navButton hidden" />
                <div className="p_navContent flex items-center justify-end">
                  <ul className="p_level1Box flex items-center justify-end gap-0">
                    {navItems.map((item) => {
                      const href = buildLocaleHref(locale, item.href);
                      const childHrefs = item.children?.map((child) => buildLocaleHref(locale, child.href)) ?? [];
                      const isActive = isActiveNavItem(pathname, href) || childHrefs.some((childHref) => isActiveNavItem(pathname, childHref));
                      const isContactItem = item.key === 'contact';

                      return (
                        <li
                          key={item.key}
                          className={`p_level1Item group relative h-header-h list-none border-none ${
                            isContactItem ? '' : 'mr-[12px] bp-desktop-wide-max:mr-[8px] bp-tablet-max:mr-[4px]'
                          }`}
                        >
                          <p
                            className={`p_menu1Item relative h-header-h ${
                              isActive
                                ? ''
                                : ''
                            }`}
                          >
                            <Link
                              href={href}
                              className={`relative z-[2] flex h-header-h items-center whitespace-nowrap px-[16px] text-center text-[15px] tracking-[0.01em] text-text-secondary transition-colors duration-300 bp-desktop-wide-max:px-[14px] bp-tablet-max:px-[10px] bp-tablet-max:text-[14px] ${
                                isActive ? 'font-semibold text-[#202020]' : 'font-medium group-hover:text-[#202020]'
                              }`}
                            >
                              <span className={`relative inline-flex items-center leading-none after:absolute after:-bottom-[31px] after:left-[4px] after:right-[4px] after:h-[1.5px] after:rounded-full after:bg-red-600/70 after:transition-transform after:duration-300 after:content-[''] ${
                                isActive ? 'after:scale-x-100' : 'after:scale-x-0 group-hover:after:scale-x-100'
                              }`}>
                                {item.labelText}
                              </span>
                              {item.children?.length ? (
                                <HiChevronRight className="ml-[2px] inline-block h-[14px] w-[14px] align-middle text-current bp-tablet-min:hidden" />
                              ) : null}
                            </Link>
                          </p>

                          {item.children?.length ? (
                            <ul className="p_level2Box absolute left-0 top-full z-[99] hidden min-w-[220px] overflow-hidden border border-[#dddddd] bg-white py-0 shadow-[0_10px_24px_rgba(0,0,0,0.08)] group-hover:block">
                              {item.children.map((child) => (
                                <li key={child.key} className="p_level2Item list-none border-b border-[#d5d5d5] last:border-b-0">
                                  <p className="p_menu2Item">
                                    <Link
                                      href={buildLocaleHref(locale, child.href)}
                                      className="group/item flex items-center justify-between whitespace-nowrap px-5 py-3 text-left text-[15px] font-normal leading-[1.8] text-[#333333] transition-all duration-300 hover:bg-bg-language hover:text-text-inverse bp-tablet-max:text-[12px]"
                                    >
                                      <span>{child.labelText}</span>
                                      <span className="pc_ej ml-[10px] block h-5 w-[17px] text-transparent transition-colors group-hover/item:text-white/70">
                                        <HiChevronRight className="h-5 w-[17px]" />
                                      </span>
                                    </Link>
                                  </p>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}

                    <li className="p_level1Item group relative h-header-h list-none border-none">
                      <Link
                        href={switchLocalePath}
                        className="relative z-[2] flex h-header-h items-center whitespace-nowrap px-[16px] text-center text-[15px] font-medium tracking-[0.01em] text-text-secondary transition-colors duration-300 bp-desktop-wide-max:px-[14px] bp-tablet-max:px-[10px] bp-tablet-max:text-[14px] hover:text-[#202020]"
                      >
                        <span>{localeLabel[switchLocale]}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          ref={mobilePanelRef}
          id="mobile-navigation-dialog"
          className="fixed inset-0 z-[10000] overflow-y-auto bg-white bp-tablet-min:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={mobileNavCopy.dialog}
          tabIndex={-1}
        >
            <div className="flex h-[78px] items-center justify-between border-b border-black/5 px-4">
              <Link href={`/${locale}`} className="ml-2 flex h-[72px] w-auto items-center" aria-label={logoAlt}>
                <Image
                  src={HEADER_LOGO_SRC}
                  alt={logoAlt}
                  width={229}
                  height={40}
                  priority
                  className="max-w-none object-contain object-left object-center"
                  style={{ width: 'auto', height: '40px' }}
                />
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-[60px] w-[50px] items-center justify-center text-brand-primary"
                aria-label={mobileNavCopy.close}
              >
                <HiOutlineXMark className="h-8 w-8" />
              </button>
            </div>

            <div className="px-5 pb-10 pt-4">
              <div className="p_navContent">
                <ul className="p_level1Box flex flex-col">
                  {navItems.map((item) => {
                    const href = buildLocaleHref(locale, item.href);
                    const childHrefs = item.children?.map((child) => buildLocaleHref(locale, child.href)) ?? [];
                    const isActive = isActiveNavItem(pathname, href) || childHrefs.some((childHref) => isActiveNavItem(pathname, childHref));

                    return (
                      <li key={item.key} className="p_level1Item list-none border-b border-black/5">
                        <p className="p_menu1Item">
                          <Link
                            href={href}
                            className={`flex min-h-[50px] items-center justify-between py-1 text-[14px] font-semibold leading-[50px] ${
                              isActive ? 'text-brand-primary' : 'text-text-secondary'
                            }`}
                          >
                            <span>{item.labelText}</span>
                            {item.children?.length ? (
                              <HiChevronRight className={`h-4 w-4 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`} />
                            ) : null}
                          </Link>
                        </p>

                        {item.children?.length ? (
                          <ul className="p_level2Box pb-4 pl-5">
                            {item.children.map((child) => (
                              <li key={child.key} className="p_level2Item list-none">
                                <p className="p_menu2Item">
                                  <Link
                                    href={buildLocaleHref(locale, child.href)}
                                    className="block py-2 text-[14px] leading-[30px] text-[#666666]"
                                  >
                                    {child.labelText}
                                  </Link>
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}

                  <li className="p_level1Item list-none border-b border-black/5">
                    <Link
                      href={switchLocalePath}
                      className="flex min-h-[50px] items-center justify-between py-1 text-[14px] font-semibold leading-[50px] text-text-secondary"
                    >
                      <span>{localeLabel[switchLocale]}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-black/5 pt-6">
                <div className="inline-flex min-w-[120px] items-center justify-center">
                  <Link
                    href={switchLocalePath}
                    className="inline-flex min-w-[120px] items-center justify-center bg-bg-language px-4 py-3 text-button font-semibold text-text-inverse"
                  >
                    {localeLabel[switchLocale]}
                  </Link>
                </div>
              </div>
            </div>
        </div>
      ) : null}
    </>
  );
}
