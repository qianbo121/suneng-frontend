'use client';

import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { HiArrowRight, HiXMark } from 'react-icons/hi2';

import type { LineForm, LineGalleryItem, LineImage } from '@/lib/production-line-types';
import { siteSettings } from '@/mock/siteSettings';
import {
  buildProductionLineInquiryPayload,
  hasConfirmedSubmission,
  type ProductionLineInquiryValues,
} from '@/lib/production-line-inquiry';
import {
  getFormIdempotencyKey,
  renewFormIdempotencyKey,
  renewIdempotencyKeyAfterConflict,
} from '@/lib/api/custom-requirements';
import { submitHomepageRequirement } from '@/lib/api/homepage-requirements';
import { buildLeadSourceSnapshot, trackLeadEvent } from '@/lib/api/lead-events';

import styles from './FastenerLineDetailPage.module.css';
import { ProductionLineImage } from './ProductionLineImage';

export function ProductionLineGallery({
  images,
  items,
  locale = 'zh',
}: {
  images: Record<string, LineImage>;
  items: LineGalleryItem[];
  locale?: 'zh' | 'en';
}) {
  const [selected, setSelected] = useState<number | null>(
    items[0]?.fullAssetId === 'hero-line' ? 0 : null,
  );
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const fullAssetId = selected === null ? null : items[selected]?.fullAssetId;
  const main = fullAssetId ? images[fullAssetId as keyof typeof images] : images['hero-line'];
  const preview =
    previewIndex === null
      ? null
      : previewIndex === -1
        ? {
            label: locale === 'en' ? 'Complete line' : '整线主图',
            alt: images['hero-line'].alt,
            fullAssetId: 'hero-line',
            thumbnailAssetId: 'hero-line',
          }
        : items[previewIndex];
  const previewImage = preview ? images[preview.fullAssetId ?? preview.thumbnailAssetId] : null;

  useEffect(() => {
    if (previewIndex === null) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [previewIndex]);

  return (
    <div className={styles.gallery}>
      <button
        type="button"
        className={styles.heroPreviewButton}
        aria-label={
          main.src === images['hero-line'].src
            ? (locale === 'en' ? 'View complete line image' : '查看整线图片')
            : (locale === 'en' ? `View ${items[selected!].label} image` : `查看${items[selected!].label}图片`)
        }
        aria-haspopup="dialog"
        onClick={(event) => {
          triggerRef.current = event.currentTarget;
          setPreviewIndex(selected ?? -1);
        }}
      >
        <ProductionLineImage
          photo={main}
          priority={main.src === images['hero-line'].src}
          className={styles.heroImage}
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 959px) calc(100vw - 80px), (max-width: 1199px) calc((100vw - 112px) / 2), (max-width: 1359px) calc(58vw - 65px), 724px"
        />
      </button>
      <div className={styles.thumbnails} aria-label={locale === 'en' ? 'Equipment images' : '设备图片'}>
        {items.map((item, index) => {
          const thumbnail = images[item.thumbnailAssetId as keyof typeof images];
          return (
            <button
              key={item.id}
              type="button"
              className={styles.thumbnail}
              aria-label={item.label}
              aria-pressed={selected === index && Boolean(item.fullAssetId)}
              aria-haspopup={item.fullAssetId ? undefined : 'dialog'}
              onClick={(event) => {
                if (item.fullAssetId) setSelected(index);
                else {
                  triggerRef.current = event.currentTarget;
                  setPreviewIndex(index);
                }
              }}
            >
              <ProductionLineImage
                photo={thumbnail}
                alt={item.alt}
                sizes="(max-width: 767px) 22vw, (max-width: 959px) 23vw, 180px"
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <dialog
        ref={dialogRef}
        className={styles.previewDialog}
        data-full-size={Boolean(preview?.fullAssetId)}
        aria-labelledby={titleId}
        onCancel={() => setPreviewIndex(null)}
        onClose={() => setPreviewIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPreviewIndex(null);
        }}
      >
        {preview && previewImage && (
          <div className={styles.previewContent}>
            <h2 id={titleId}>{preview.label}</h2>
            <button
              type="button"
              aria-label={locale === 'en' ? 'Close image preview' : '关闭图片预览'}
              className={styles.previewClose}
              onClick={() => setPreviewIndex(null)}
            >
              <HiXMark aria-hidden="true" />
            </button>
            <ProductionLineImage
              photo={previewImage}
              alt={preview.alt}
              original
              className={styles.nativePreview}
            />
            <p>{locale === 'en' ? (preview.fullAssetId ? 'Equipment reference image' : 'Detail reference image') : (preview.fullAssetId ? '设备参考图' : '细节参考图')}</p>
          </div>
        )}
      </dialog>
    </div>
  );
}

export function ProductionLineAnchorNav({ items, locale = 'zh' }: { items: { label: string; href: string }[]; locale?: 'zh' | 'en' }) {
  const [active, setActive] = useState(items[0].href);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const page = nav?.closest<HTMLElement>('[data-heat-treatment-line]');
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!nav || !page) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerHeight = header?.getBoundingClientRect().height ?? 80;
      const navHeight = nav.getBoundingClientRect().height;
      page.style.setProperty('--ft-header-height', `${headerHeight}px`);
      page.style.setProperty('--ft-nav-height', `${navHeight}px`);
      let current = items[0].href;
      for (const item of items) {
        const section = document.getElementById(item.href.slice(1));
        if (section && section.getBoundingClientRect().top <= headerHeight + navHeight + 48)
          current = item.href;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(nav);
    if (header) observer.observe(header);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [items]);
  return (
    <nav ref={navRef} className={styles.anchorNav} aria-label={locale === 'en' ? 'On this page' : '本页内容'}>
      <div className={styles.container}>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={active === item.href ? 'location' : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function ProductionLineInquiryForm({
  formCopy,
  pageId,
  title,
}: {
  formCopy: LineForm;
  pageId: string;
  title: string;
}) {
  const tracking = { pageType: '产品页', productTag: title } as const;
  const id = useId();
  const keyRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const startedRef = useRef(false);
  const contactRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null,
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(
      formCopy.fields.map((field) => [field.name, String(data.get(field.name) ?? '').trim()]),
    ) as ProductionLineInquiryValues;
    if (!values.contact_method) {
      setContactError('请填写可联系到您的电话、微信或邮箱。');
      setFeedback(null);
      contactRef.current?.focus();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setContactError('');
    setFeedback(null);
    try {
      const result = await submitHomepageRequirement(
        buildProductionLineInquiryPayload(
          { pageId, title, fields: formCopy.fields },
          values,
          buildLeadSourceSnapshot(tracking),
          getFormIdempotencyKey(keyRef),
        ),
      );
      if (!hasConfirmedSubmission(result)) throw new Error('Missing submission confirmation');
      renewFormIdempotencyKey(keyRef);
      trackLeadEvent('form_success', tracking);
      form.reset();
      startedRef.current = false;
      setFeedback({
        kind: 'success',
        text: `已收到您的选型需求。提交编号：${result.submissionId}`,
      });
    } catch (error) {
      const conflict = renewIdempotencyKeyAfterConflict(error, keyRef);
      setFeedback({
        kind: 'error',
        text: conflict
          ? '刚才的版本可能已提交，填写内容已保留。请再次提交以发送新版本，或通过电话、邮箱联系我们。'
          : '暂未提交成功，填写内容已保留。请稍后重试，或通过电话、邮箱联系我们。',
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form
      id={formCopy.id}
      noValidate
      onSubmit={submit}
      className={styles.inquiryForm}
      aria-busy={submitting}
      onChange={() => {
        if (!startedRef.current) {
          startedRef.current = true;
          trackLeadEvent('form_start', tracking);
        }
        setContactError('');
        setFeedback(null);
      }}
    >
      <fieldset disabled={submitting} className={styles.formFields}>
        <legend className={styles.srOnly}>选型需求</legend>
        {formCopy.fields.map((field) => {
          const contact = field.name === 'contact_method';
          return (
            <label key={field.name} htmlFor={`${id}-${field.name}`}>
              <span>
                {field.label}
                {field.required && <b aria-hidden="true"> *</b>}
              </span>
              <input
                ref={contact ? contactRef : undefined}
                id={`${id}-${field.name}`}
                name={field.name}
                type="text"
                required={field.required}
                maxLength={contact ? 254 : 500}
                placeholder={field.placeholder}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={contact && Boolean(contactError)}
                aria-describedby={contact && contactError ? `${id}-contact-error` : undefined}
              />
              {contact && contactError && (
                <span id={`${id}-contact-error`} className={styles.fieldError} role="alert">
                  {contactError}
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
      <button className={styles.primaryButton} type="submit" disabled={submitting}>
        {submitting ? '正在提交…' : formCopy.submitLabel}
        <HiArrowRight aria-hidden="true" />
      </button>
      <p className={styles.formHelp}>{formCopy.helperText}</p>
      {feedback && (
        <p
          className={feedback.kind === 'error' ? styles.formError : styles.formSuccess}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}
      <p className={styles.privacy}>
        您提交的信息仅用于本次需求沟通。如需更正或删除，请联系{' '}
        <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>。
      </p>
    </form>
  );
}
