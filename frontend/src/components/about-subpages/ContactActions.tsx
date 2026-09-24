'use client';

import { aboutPageText } from '@/lib/about-page-localization';
import type { Locale } from '@/types/site';

import { useState } from 'react';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';
import { Button } from '@/components/ui/Button';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { trackLeadEvent } from '@/lib/api/lead-events';
import styles from './AboutSubpages.module.css';

export function CopyContactButton({ value, label, locale = 'zh' }: { value: string; label: string; locale?: Locale }) {
  const t = (text: string) => aboutPageText(text, locale);
  const [message, setMessage] = useState('');
  return (
    <div className={styles.copyControl}>
      <Button
        type="button"
        variant="secondary"
        className={styles.actionButton}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setMessage(t("已复制"));
          } catch {
            setMessage(t("复制失败，请长按或选中文字复制。"));
          }
        }}
      >
        <HiOutlineClipboardDocument aria-hidden="true" />
        {label}
      </Button>
      <span className={styles.copyFeedback} role="status">
        {message}
      </span>
    </div>
  );
}
export function ContactPhoneButton({ href, locale = 'zh' }: { href: string; locale?: Locale }) {
  const t = (text: string) => aboutPageText(text, locale);
  return (
    <Button
      href={href}
      className={styles.actionButton}
      onClick={() =>
        trackLeadEvent('phone_click', {
          pageType: t("联系我们"),
          properties: { source_module: 'contact_phone' },
        })
      }
    >
      {t("立即拨打")}</Button>
  );
}
export function ContactMessageForm({ locale = 'zh', inquiryProduct }: { locale?: Locale; inquiryProduct?: string }) {
  const t = (text: string) => aboutPageText(text, locale);
  const [open, setOpen] = useState(Boolean(inquiryProduct));
  const [hasOpened, setHasOpened] = useState(Boolean(inquiryProduct));
  return (
    <section className={styles.message} aria-labelledby="contact-message-heading">
      <h2 id="contact-message-heading">
        <button
          type="button"
          className={styles.messageToggle}
          aria-expanded={open}
          aria-controls="contact-message-panel"
          onClick={() => {
            if (!open)
              trackLeadEvent('cta_click', {
                pageType: t("联系我们"),
                properties: { source_module: 'contact_message_expand' },
              });
            setOpen(!open);
            setHasOpened(true);
          }}
        >
          <strong>{t("希望我们联系您？")}</strong>
          <span>{t("留下联系方式和需求，我们与您沟通。")}</span>
          <em>{open ? t("收起留言 −") : t("展开留言 +")}</em>
        </button>
      </h2>
      <div id="contact-message-panel" hidden={!open}>
        {hasOpened && (
          <HomepageLeadForm locale={locale} inquiryProduct={inquiryProduct}
            layoutVariant="embedded"
            sectionId="contact-inquiry-form"
            pageType={t("联系我们")}
            productTag={t("设备咨询与项目沟通")}
            successProductTag={t("设备咨询与项目沟通")}
            sourceModule="contact_message_form"
          />
        )}
      </div>
    </section>
  );
}
