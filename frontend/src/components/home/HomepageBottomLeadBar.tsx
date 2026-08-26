'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaWeixin } from 'react-icons/fa6';
import { HiChevronUp, HiEnvelope, HiPhone, HiWrenchScrewdriver, HiXMark } from 'react-icons/hi2';

import { trackLeadEvent } from '@/lib/api/lead-events';

import styles from './HomepageBottomLeadBar.module.css';
import {
  STICKY_ENGINEER_CONVERTED_EVENT,
  STICKY_ENGINEER_CONVERTED_KEY,
  STICKY_ENGINEER_SESSION_CLOSED_KEY,
  stickyEngineerSettings,
} from './sticky-engineer';

const ENTRY_TRIGGER_ROOT_MARGIN = '0px 0px -30% 0px';
const LOWER_HIDE_ROOT_MARGIN = '0px 0px 96px 0px';
const USER_SCROLL_THRESHOLD = 8;
const FALLBACK_SCROLL_MINIMUM = 420;
const CONTACT_PANEL_ID = 'sticky-engineer-contact-panel';
const WECHAT_PANEL_ID = 'sticky-engineer-wechat-panel';
const STICKY_TRACKING_CONTEXT = { discoverySource: 'sticky_engineer_dock' } as const;
type CopiedContact = 'phone' | 'email' | 'phone-error' | 'email-error' | null;

function readStorageFlag(storage: Storage, key: string) {
  try {
    return storage.getItem(key) === '1';
  } catch {
    return false;
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

export function HomepageBottomLeadBar() {
  const pathname = usePathname();
  const dockRef = useRef<HTMLElement>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [hasReachedContent, setHasReachedContent] = useState(false);
  const [isStopZoneNear, setIsStopZoneNear] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isWechatOpen, setIsWechatOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState<CopiedContact>(null);
  const [portraitFailed, setPortraitFailed] = useState(false);

  useEffect(() => {
    setIsDismissed(readStorageFlag(window.sessionStorage, STICKY_ENGINEER_SESSION_CLOSED_KEY));
    setIsConverted(readStorageFlag(window.localStorage, STICKY_ENGINEER_CONVERTED_KEY));
    setStorageReady(true);
  }, []);

  useEffect(() => {
    const handleConverted = () => {
      setIsConverted(true);
      setIsContactOpen(false);
      setIsWechatOpen(false);
    };

    window.addEventListener(STICKY_ENGINEER_CONVERTED_EVENT, handleConverted);
    return () => window.removeEventListener(STICKY_ENGINEER_CONVERTED_EVENT, handleConverted);
  }, []);

  useEffect(() => {
    const initialScrollY = window.scrollY;
    const startTarget = document.querySelector('[data-sticky-contact-start]');

    const handleScroll = () => {
      if (Math.abs(window.scrollY - initialScrollY) >= USER_SCROLL_THRESHOLD) {
        setHasUserScrolled(true);
      }
      if (!startTarget) {
        setHasReachedContent(
          window.scrollY >= Math.max(FALLBACK_SCROLL_MINIMUM, window.innerHeight * 0.5),
        );
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const startTarget = document.querySelector('[data-sticky-contact-start]');
    const stopTargets = Array.from(
      document.querySelectorAll('[data-sticky-contact-stop], [data-contact-form], footer'),
    );
    const visibleStopTargets = new Set<Element>();

    const entryObserver = new IntersectionObserver(
      ([entry]) => {
        const triggerLine = entry.rootBounds?.bottom ?? window.innerHeight * 0.7;
        setHasReachedContent(entry.boundingClientRect.top <= triggerLine);
      },
      { rootMargin: ENTRY_TRIGGER_ROOT_MARGIN, threshold: 0 },
    );

    const stopObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleStopTargets.add(entry.target);
          else visibleStopTargets.delete(entry.target);
        }
        setIsStopZoneNear(visibleStopTargets.size > 0);
      },
      { rootMargin: LOWER_HIDE_ROOT_MARGIN, threshold: 0 },
    );

    if (startTarget) entryObserver.observe(startTarget);
    stopTargets.forEach((target) => stopObserver.observe(target));

    return () => {
      entryObserver.disconnect();
      stopObserver.disconnect();
    };
  }, []);

  const isVisible =
    storageReady &&
    hasUserScrolled &&
    hasReachedContent &&
    !isStopZoneNear &&
    !isDismissed &&
    !isConverted;

  useEffect(() => {
    if (!isVisible) {
      setIsContactOpen(false);
      setIsWechatOpen(false);
      setCopiedContact(null);
    }
  }, [isVisible]);

  useEffect(() => {
    setIsContactOpen(false);
    setIsWechatOpen(false);
    setCopiedContact(null);
  }, [pathname]);

  useEffect(() => {
    if (!isContactOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) {
        setIsContactOpen(false);
        setIsWechatOpen(false);
        setCopiedContact(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsContactOpen(false);
      setIsWechatOpen(false);
      setCopiedContact(null);
      contactButtonRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContactOpen]);

  useEffect(() => {
    if (!copiedContact) return;
    const timer = window.setTimeout(() => setCopiedContact(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedContact]);

  const closeContactPanel = () => {
    setIsContactOpen(false);
    setIsWechatOpen(false);
    setCopiedContact(null);
  };

  const handleSubmitClick = () => {
    closeContactPanel();
    trackLeadEvent('quote_cta_click', STICKY_TRACKING_CONTEXT);
  };

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(STICKY_ENGINEER_SESSION_CLOSED_KEY, '1');
    } catch {
      // The in-memory state still dismisses the dock when browser storage is restricted.
    }
    closeContactPanel();
    setIsDismissed(true);
  };

  const handleWechatToggle = () => {
    const nextOpen = !isWechatOpen;
    setIsWechatOpen(nextOpen);
    setCopiedContact(null);
    if (nextOpen) {
      trackLeadEvent('wechat_click', STICKY_TRACKING_CONTEXT);
      trackLeadEvent('wechat_qr_view', STICKY_TRACKING_CONTEXT);
    }
  };

  const handlePhoneClick = async () => {
    trackLeadEvent('phone_click', STICKY_TRACKING_CONTEXT);
    setCopiedContact(null);

    if (window.matchMedia('(max-width: 767px)').matches) {
      window.location.href = `tel:${stickyEngineerSettings.phone.replace(/[^+\d]/g, '')}`;
      return;
    }

    try {
      await copyText(stickyEngineerSettings.phone);
      setCopiedContact('phone');
    } catch {
      setCopiedContact('phone-error');
    }
  };

  const formattedPhone = stickyEngineerSettings.phone.replace(/^\+86-?/, '');
  const mailHref = `mailto:${stickyEngineerSettings.email}?subject=${encodeURIComponent(
    '工业炉项目资料咨询',
  )}`;

  const handleEmailClick = async () => {
    trackLeadEvent('email_click', STICKY_TRACKING_CONTEXT);
    setCopiedContact(null);

    if (window.matchMedia('(max-width: 767px)').matches) {
      window.location.href = mailHref;
      return;
    }

    try {
      await copyText(stickyEngineerSettings.email);
      setCopiedContact('email');
    } catch {
      setCopiedContact('email-error');
    }
  };

  return (
    <>
      {isVisible && isContactOpen ? (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="关闭联系方式"
          onClick={closeContactPanel}
        />
      ) : null}

      <aside
        ref={dockRef}
        className={`${styles.dock} ${isVisible ? styles.dockVisible : ''}`}
        aria-label="真人工程师咨询"
        aria-hidden={!isVisible}
        data-sticky-engineer-dock
        data-visible={isVisible ? 'true' : 'false'}
      >
        <div className={styles.engineerVisual} aria-hidden="true">
          {portraitFailed ? (
            <HiWrenchScrewdriver className={styles.portraitFallback} />
          ) : (
            <Image
              src={stickyEngineerSettings.portraitSrc}
              alt=""
              width={560}
              height={588}
              sizes="(max-width: 767px) 52px, 140px"
              className={styles.engineerPortrait}
              loading="lazy"
              onError={() => setPortraitFailed(true)}
            />
          )}
          <span className={styles.engineerBadge}>技术工程师</span>
        </div>

        <div className={styles.dockCopy}>
          <strong>
            <span className={styles.desktopTitle}>还不确定该选哪种炉型？</span>
            <span className={styles.mobileTitle}>工程师协助选型</span>
          </strong>
          <span className={styles.dockDescription}>提交工件、工艺和产能，工程师协助判断</span>
        </div>

        <a className={styles.submitButton} href="#homepage-lead-form" onClick={handleSubmitClick}>
          提交工况
        </a>

        <button
          ref={contactButtonRef}
          type="button"
          className={`${styles.contactButton} ${isContactOpen ? styles.contactButtonOpen : ''}`}
          aria-expanded={isContactOpen}
          aria-controls={CONTACT_PANEL_ID}
          onClick={() => {
            const nextOpen = !isContactOpen;
            setIsContactOpen(nextOpen);
            setIsWechatOpen(nextOpen);
            setCopiedContact(null);
          }}
        >
          <span className={styles.desktopContactLabel}>联系工程师</span>
          <span className={styles.mobileContactLabel}>联系</span>
          <HiChevronUp
            aria-hidden="true"
            className={`${styles.contactChevron} ${isContactOpen ? styles.contactChevronOpen : ''}`}
          />
        </button>

        <button
          type="button"
          className={styles.closeButton}
          aria-label="关闭工程师咨询横条"
          onClick={handleDismiss}
        >
          <HiXMark aria-hidden="true" />
        </button>

        {isContactOpen ? (
          <section
            id={CONTACT_PANEL_ID}
            className={styles.contactPopover}
            aria-label="联系技术工程师"
          >
            <header className={styles.popoverHeader}>
              <div className={styles.popoverHeaderCopy}>
                <strong>联系技术工程师</strong>
                <span>选择适合您的资料沟通方式</span>
              </div>
              <button
                type="button"
                className={styles.popoverCloseButton}
                aria-label="关闭联系工程师弹层"
                onClick={closeContactPanel}
              >
                <HiXMark aria-hidden="true" />
              </button>
            </header>

            <div className={styles.wechatContact}>
              <button
                type="button"
                className={styles.contactRow}
                aria-expanded={isWechatOpen}
                aria-controls={WECHAT_PANEL_ID}
                onClick={handleWechatToggle}
              >
                <span className={styles.contactIcon} aria-hidden="true">
                  <FaWeixin />
                </span>
                <span className={styles.contactRowCopy}>
                  <strong>微信咨询</strong>
                  <small>扫码添加技术顾问</small>
                </span>
                <span className={styles.contactHint}>
                  {isWechatOpen ? '收起二维码' : '查看二维码'}
                  <HiChevronUp
                    aria-hidden="true"
                    className={`${styles.rowChevron} ${isWechatOpen ? '' : styles.rowChevronClosed}`}
                  />
                </span>
              </button>

              {isWechatOpen ? (
                <div id={WECHAT_PANEL_ID} className={styles.wechatPanel}>
                  <Image
                    src={stickyEngineerSettings.wechatQrSrc}
                    alt="江苏苏能工业炉微信二维码"
                    width={160}
                    height={160}
                    className={styles.wechatQr}
                  />
                  <span className={styles.desktopQrHint}>微信扫码添加技术顾问</span>
                  <span className={styles.mobileQrHint}>长按识别或保存二维码</span>
                </div>
              ) : null}
            </div>

            <button type="button" className={styles.contactRow} onClick={handlePhoneClick}>
              <span className={styles.contactIcon} aria-hidden="true">
                <HiPhone />
              </span>
              <span className={styles.contactRowCopy}>
                <strong>电话咨询</strong>
                <small>{formattedPhone}</small>
              </span>
              <span
                className={`${styles.contactHint} ${styles.desktopPhoneHint}`}
                role="status"
                aria-live="polite"
              >
                {copiedContact === 'phone'
                  ? '已复制'
                  : copiedContact === 'phone-error'
                    ? '复制失败'
                    : '复制号码'}
              </span>
              <span className={`${styles.contactHint} ${styles.mobilePhoneHint}`}>点击拨打</span>
            </button>

            <button type="button" className={styles.contactRow} onClick={handleEmailClick}>
              <span className={styles.contactIcon} aria-hidden="true">
                <HiEnvelope />
              </span>
              <span className={styles.contactRowCopy}>
                <strong>邮箱发资料</strong>
                <small>发送图纸、参数和技术协议</small>
              </span>
              <span
                className={`${styles.contactHint} ${styles.desktopEmailHint}`}
                role="status"
                aria-live="polite"
              >
                {copiedContact === 'email'
                  ? '已复制'
                  : copiedContact === 'email-error'
                    ? '复制失败'
                    : '复制邮箱'}
              </span>
              <span className={`${styles.contactHint} ${styles.mobileEmailHint}`}>发邮件</span>
            </button>
          </section>
        ) : null}
      </aside>
    </>
  );
}
