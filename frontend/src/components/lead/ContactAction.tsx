'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineDocumentDuplicate, HiOutlineEnvelope, HiOutlinePhone, HiXMark } from 'react-icons/hi2';

import { SUNENG_CONTACT } from '@/constants/contact';
import { trackLeadEvent } from '@/lib/api/lead-events';
import styles from './ContactAction.module.css';

type ContactKind = 'wechat' | 'phone' | 'email';
type ContactActionProps = {
  kind: ContactKind;
  children: ReactNode;
  locale?: 'zh' | 'en';
  description?: string;
  className?: string;
  trackingContext?: Parameters<typeof trackLeadEvent>[1];
};

// A narrow desktop window must not be mistaken for a phone.
function isPhoneDevice() {
  const browser = navigator as Navigator & { userAgentData?: { mobile: boolean } };
  return browser.userAgentData?.mobile === true || /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(browser.userAgent);
}

export function ContactAction({ kind, children, locale, description, className, trackingContext }: ContactActionProps) {
  const params = useParams();
  const english = (locale ?? params?.locale) === 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const qrTrackedRef = useRef(false);
  const copyAttemptRef = useRef(0);
  const titleId = useId();
  const descriptionId = useId();

  const phone = `${english ? '+86 ' : ''}${SUNENG_CONTACT.phone.replace(/-/g, ' ')}`;
  const content = {
    wechat: {
      title: english ? 'WeChat contact' : '微信联系',
      description: english ? 'Scan to add a Suneng adviser and share your workpiece, process and capacity requirements.' : '扫码添加苏能技术顾问，发送工件、工艺和产能要求。',
      label: english ? 'WeChat ID' : '微信号',
      value: SUNENG_CONTACT.wechatId,
      copy: english ? 'Copy WeChat ID' : '复制微信号',
      secondary: english ? 'View original QR code' : '查看二维码原图',
      href: SUNENG_CONTACT.wechatQr,
      note: english ? 'Copy the ID, then search for it in WeChat.' : '复制微信号后，在微信中搜索添加。',
    },
    phone: {
      title: english ? 'Phone contact' : '电话联系',
      description: english ? 'Call us to discuss equipment selection and process requirements.' : '设备选型、工艺需求，欢迎电话沟通。',
      label: english ? 'Contact number' : '咨询电话',
      value: phone,
      copy: english ? 'Copy phone number' : '复制电话号码',
      secondary: english ? 'Open calling app' : '打开拨号应用',
      href: SUNENG_CONTACT.phoneHref,
      note: english ? 'You can also dial this number on your phone.' : '也可直接用手机拨打上方号码。',
    },
    email: {
      title: english ? 'Email contact' : '邮箱联系',
      description: english ? 'Send workpiece drawings, technical requirements or project documents.' : '发送工件图纸、技术要求或项目资料。',
      label: english ? 'Email address' : '联系邮箱',
      value: SUNENG_CONTACT.email,
      copy: english ? 'Copy email address' : '复制邮箱地址',
      secondary: english ? 'Open email app' : '打开邮件应用',
      href: `mailto:${SUNENG_CONTACT.email}`,
      note: english ? 'If no email app opens, paste the address into your usual email service.' : '若未打开邮件应用，可复制地址到常用邮箱发送。',
    },
  }[kind];

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
      if (event.key !== 'Tab') return;
      const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      copyAttemptRef.current += 1;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  function activate(event: MouseEvent<HTMLElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    trackLeadEvent(`${kind}_click`, trackingContext);
    if (kind === 'phone' && isPhoneDevice()) return;
    event.preventDefault();
    qrTrackedRef.current = false;
    setCopyState('idle');
    setIsOpen(true);
  }

  async function copyValue() {
    const attempt = ++copyAttemptRef.current;
    setCopyState('copying');
    try {
      await navigator.clipboard.writeText(kind === 'phone' ? content.value.replace(/\s/g, '') : content.value);
      if (attempt === copyAttemptRef.current) setCopyState('copied');
    } catch {
      if (attempt !== copyAttemptRef.current) return;
      setCopyState('failed');
      if (valueRef.current) {
        const range = document.createRange();
        range.selectNodeContents(valueRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  return (
    <>
      {kind === 'wechat' ? (
        <button ref={(node) => { triggerRef.current = node; }} type="button" className={className} aria-haspopup="dialog" aria-expanded={isOpen} onClick={activate}>
          {children}
        </button>
      ) : (
        <a ref={(node) => { triggerRef.current = node; }} href={content.href} className={className} aria-haspopup={kind === 'email' ? 'dialog' : undefined} aria-expanded={isOpen} onClick={activate}>
          {children}
        </a>
      )}
      {isOpen && createPortal(
        <div className={styles.overlay} onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className={styles.dialog} data-contact-dialog={kind}>
            <div className={styles.header}>
              <h2 id={titleId} className={styles.title}>{content.title}</h2>
              <button ref={closeRef} type="button" aria-label={english ? 'Close contact dialog' : '关闭联系弹窗'} className={styles.close} onClick={() => setIsOpen(false)}><HiXMark aria-hidden="true" /></button>
            </div>
            <div className={styles.body}>
              <p id={descriptionId} className={styles.description}>{description ?? content.description}</p>
              {kind === 'wechat' && (
                <div className={styles.qrBox}>
                  <Image src={SUNENG_CONTACT.wechatQr} alt={english ? 'Suneng WeChat QR code' : '苏能技术顾问微信二维码'} width={176} height={176} priority className={styles.qr} onLoad={() => {
                    if (qrTrackedRef.current) return;
                    qrTrackedRef.current = true;
                    trackLeadEvent('wechat_qr_view', trackingContext);
                  }} />
                </div>
              )}
              <div className={styles.valueBox}>
                <div className={styles.valueLabel}>{content.label}</div>
                <div ref={valueRef} className={`${styles.value} ${kind === 'phone' ? styles.phoneValue : ''}`}>{content.value}</div>
              </div>
            </div>
            <div className={styles.footer}>
              <div className={styles.actions}>
                <button type="button" className={`${styles.action} ${styles.primary}`} onClick={copyValue} disabled={copyState === 'copying'}>
                  <HiOutlineDocumentDuplicate aria-hidden="true" />
                  {copyState === 'copied' ? (english ? 'Copied' : '已复制') : copyState === 'copying' ? (english ? 'Copying…' : '复制中…') : content.copy}
                </button>
                <a href={content.href} className={`${styles.action} ${styles.secondary}`} target={kind === 'wechat' ? '_blank' : undefined} rel={kind === 'wechat' ? 'noopener noreferrer' : undefined}>
                  {kind === 'phone' && <HiOutlinePhone aria-hidden="true" />}
                  {kind === 'email' && <HiOutlineEnvelope aria-hidden="true" />}
                  {content.secondary}
                </a>
              </div>
              <p className={styles.note}>{content.note}</p>
              <p className={`${styles.feedback} ${copyState === 'failed' ? styles.failed : ''}`} role="status" aria-live="polite">
                {copyState === 'copied' ? (english ? 'Copied. You can paste it now.' : '已复制，可以直接粘贴使用。') : copyState === 'failed' ? (english ? 'Copy was unavailable. Select the contact above and copy it manually.' : '未能自动复制，请选中上方联系方式手动复制。') : ''}
              </p>
            </div>
          </div>
        </div>, document.body,
      )}
    </>
  );
}
