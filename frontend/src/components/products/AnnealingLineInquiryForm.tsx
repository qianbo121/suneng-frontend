'use client';

import { type FormEvent, useEffect, useId, useRef, useState } from 'react';

import {
  getFormIdempotencyKey,
  renewFormIdempotencyKey,
  renewIdempotencyKeyAfterConflict,
} from '@/lib/api/custom-requirements';
import { submitHomepageRequirement } from '@/lib/api/homepage-requirements';
import { buildLeadSourceSnapshot, trackLeadEvent } from '@/lib/api/lead-events';
import {
  ANNEALING_LINE_PRODUCT_NAME,
  ANNEALING_LINE_STEP_ONE_FIELDS,
  ANNEALING_LINE_STEP_TWO_FIELDS,
  buildAnnealingLineInquiryPayload,
  emptyAnnealingLineInquiryValues,
  type AnnealingLineInquiryErrors,
  type AnnealingLineInquiryField,
  type AnnealingLineInquiryValues,
  validateAnnealingLineInquiry,
} from '@/lib/annealing-line-inquiry';

import {
  handleSuccessDialogKeyDown,
  restoreSuccessDialogFocus,
} from './success-dialog-accessibility';

type AnnealingLineInquiryFormProps = {
  styles: Record<string, string>;
  phone: string;
};

const TRACKING_CONTEXT = {
  pageType: '产品页',
  productTag: ANNEALING_LINE_PRODUCT_NAME,
} as const;

const allFields = [...ANNEALING_LINE_STEP_ONE_FIELDS, ...ANNEALING_LINE_STEP_TWO_FIELDS] as const;

function readInquiryValues(form: HTMLFormElement): AnnealingLineInquiryValues {
  const formData = new FormData(form);
  const values = emptyAnnealingLineInquiryValues();
  for (const field of allFields) {
    values[field.name] = String(formData.get(field.name) || '').trim();
  }
  return values;
}

function firstErrorField(errors: AnnealingLineInquiryErrors) {
  return allFields.find(({ name }) => errors[name])?.name;
}

export function AnnealingLineInquiryForm({ styles, phone }: AnnealingLineInquiryFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const successReturnFocusRef = useRef<HTMLElement | null>(null);
  const successWasOpenRef = useRef(false);
  const [errors, setErrors] = useState<AnnealingLineInquiryErrors>({});
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (submissionId) {
      successWasOpenRef.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      successButtonRef.current?.focus();
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          successButtonRef.current?.focus();
          return;
        }
        handleSuccessDialogKeyDown(event, () => setSubmissionId(''));
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    if (successWasOpenRef.current) {
      successWasOpenRef.current = false;
      const fallback = formRef.current?.elements.namedItem('materialStandardCondition');
      restoreSuccessDialogFocus(
        successReturnFocusRef.current,
        fallback instanceof HTMLElement ? fallback : null,
      );
      successReturnFocusRef.current = null;
    }
  }, [submissionId]);

  const clearFieldError = (fieldName: string) => {
    if (!Object.prototype.hasOwnProperty.call(errors, fieldName)) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldName as AnnealingLineInquiryField];
      if (fieldName === 'contactMethod' || fieldName === 'contactEmail') {
        delete next.contactMethod;
        delete next.contactEmail;
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readInquiryValues(form);
    const nextErrors = validateAnnealingLineInquiry(values);
    setErrors(nextErrors);
    const invalidField = firstErrorField(nextErrors);
    if (invalidField) {
      setMessage('请先完成标有 * 的项目，并填写一种有效联系方式。');
      const target = form.elements.namedItem(invalidField);
      if (target instanceof HTMLElement) target.focus();
      return;
    }

    successReturnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await submitHomepageRequirement(
        buildAnnealingLineInquiryPayload(
          values,
          buildLeadSourceSnapshot(TRACKING_CONTEXT),
          getFormIdempotencyKey(idempotencyKeyRef),
        ),
      );
      trackLeadEvent('form_success', TRACKING_CONTEXT);
      renewFormIdempotencyKey(idempotencyKeyRef);
      form.reset();
      startedRef.current = false;
      setErrors({});
      setSubmissionId(String(result.submissionId));
    } catch (error) {
      if (renewIdempotencyKeyAfterConflict(error, idempotencyKeyRef)) {
        setMessage('刚才的版本可能已提交，填写内容仍然保留。请再次点击提交，作为新版本发送。');
      } else {
        setMessage('暂时没有提交成功，填写内容已保留，请稍后重试。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formLayout}>
      <div className={styles.formIntro}>
        <p className={styles.formEyebrow}>PROJECT INPUT</p>
        <h2 className={styles.formIntroTitle}>提交带材参数，获取初步路线判断</h2>
        <p className={styles.formIntroText}>
          先判断是否适合连续式，再区分典型工艺路线，以及还需要补充哪些现场条件。结果仅用于初步沟通。
        </p>
        <ol className={styles.formChecklist}>
          <li>
            <b>01</b>
            <span>连续式适用性初判</span>
          </li>
          <li>
            <b>02</b>
            <span>典型工艺段组合方向</span>
          </li>
          <li>
            <b>03</b>
            <span>待补充参数与接口清单</span>
          </li>
        </ol>
        <div className={styles.formContact}>
          <p>电话 / 微信</p>
          <a href={'tel:' + phone.replace(/[^\d+]/g, '')}>{phone}</a>
          <p>邮箱</p>
          <a href="mailto:997518512@qq.com">997518512@qq.com</a>
          <p>地址</p>
          <span>江苏省泰州市姜堰区张甸蔡官工业区</span>
        </div>
      </div>

      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        onChangeCapture={(event) => {
          if (!startedRef.current) {
            startedRef.current = true;
            trackLeadEvent('form_start', TRACKING_CONTEXT);
          }
          const target = event.target;
          if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            clearFieldError(target.name);
          }
        }}
        className={[styles.formPanel, 'p-5 sm:p-8'].join(' ')}
      >
        <div className={styles.formContentHeader}>
          <h3 className={styles.formHeading}>基础工况</h3>
          <p className={styles.formHelp}>
            标有 <span aria-hidden="true">*</span> 的项目必填；电话 / 微信与邮箱至少填写一项。
          </p>
        </div>
        <div className={[styles.formGrid, 'mt-7 gap-x-5 gap-y-5'].join(' ')}>
          {allFields.map((field) => {
            const error = errors[field.name];
            const inputId = formId + '-' + field.name;
            const errorId = inputId + '-error';
            const isTextarea = field.kind === 'textarea';
            const wide =
              isTextarea ||
              field.name === 'materialStandardCondition' ||
              field.name === 'targetProcessQuality';
            const inputType =
              field.name === 'contactEmail'
                ? 'email'
                : field.name === 'contactMethod'
                  ? 'tel'
                  : 'text';
            const autoComplete =
              field.name === 'contactName'
                ? 'name'
                : field.name === 'companyName'
                  ? 'organization'
                  : field.name === 'contactEmail'
                    ? 'email'
                    : field.name === 'contactMethod'
                      ? 'tel'
                      : 'off';

            return (
              <label
                key={field.name}
                className={[styles.formField, wide ? styles.formFieldWide : ''].join(' ')}
                htmlFor={inputId}
              >
                <span className={styles.formLabel}>
                  {field.label}
                  {field.required ? (
                    <span className={styles.formRequired} aria-hidden="true">
                      *
                    </span>
                  ) : null}
                </span>
                {isTextarea ? (
                  <textarea
                    id={inputId}
                    name={field.name}
                    rows={field.name === 'siteConditionsAdditional' ? 3 : 2}
                    maxLength={500}
                    required={field.required}
                    autoComplete="off"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className={[styles.formControl, styles.formTextarea].join(' ')}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    id={inputId}
                    name={field.name}
                    type={inputType}
                    inputMode={field.name === 'contactMethod' ? 'tel' : undefined}
                    maxLength={
                      field.name === 'contactName'
                        ? 120
                        : field.name === 'contactEmail' || field.name === 'contactMethod'
                          ? 254
                          : 500
                    }
                    required={field.required}
                    autoComplete={autoComplete}
                    spellCheck={field.name === 'contactEmail' ? false : undefined}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className={styles.formControl}
                    placeholder={field.placeholder}
                  />
                )}
                {error ? (
                  <span id={errorId} className={styles.formError} role="alert">
                    {error}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>

        <p className={styles.formNote}>
          暂不设置公开文件上传入口。提交结果为初步判断，不是最终技术方案或正式报价。
        </p>
        <button type="submit" disabled={isSubmitting} className={styles.formSubmitButton}>
          {isSubmitting ? '提交中…' : '提交项目工况'}
        </button>
        <p
          className={[styles.formStatus, message ? styles.formStatusError : ''].join(' ')}
          role={message ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </p>
        <p className={styles.formPrivacy}>
          您提交的信息仅用于本次项目需求沟通与选型初判。如需查询、更正或删除已提交信息，请联系{' '}
          <a href="mailto:997518512@qq.com">997518512@qq.com</a>。
        </p>
      </form>

      {submissionId ? (
        <div
          className={styles.formSuccessOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={formId + '-success-title'}
        >
          <div className={styles.formSuccessDialog}>
            <h3 id={formId + '-success-title'}>已收到项目工况</h3>
            <p>工程师将据此进行适用性和路线初判，并确认下一轮需补充的参数。</p>
            <p className={styles.formSuccessId}>
              提交编号：<strong>{submissionId}</strong>
            </p>
            <button
              ref={successButtonRef}
              type="button"
              onClick={() => setSubmissionId('')}
              className={styles.formSubmitButton}
            >
              我知道了
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
