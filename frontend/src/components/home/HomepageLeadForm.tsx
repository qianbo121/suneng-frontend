'use client';

import Image from 'next/image';
import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { HiCheck, HiChevronDown } from 'react-icons/hi2';

import {
  getFormIdempotencyKey,
  renewIdempotencyKeyAfterConflict,
  renewFormIdempotencyKey,
} from '@/lib/api/custom-requirements';
import {
  buildHomepageRequirementPayload,
  buildHomepageWorkpieceContext,
  type HomepageRequirementField,
  type HomepageRequirementValues,
  submitHomepageRequirement,
  validateHomepageRequirement,
} from '@/lib/api/homepage-requirements';
import { buildLeadSourceSnapshot, trackLeadEvent } from '@/lib/api/lead-events';
import { getActiveWorkpieceContext } from '@/lib/workpiece-selection-context';
import {
  clearActiveWorkpieceRouterDraft,
  getActiveWorkpieceRouterDraft,
} from '@/lib/workpiece-router-draft-context';
import { markStickyEngineerConverted } from '@/components/home/sticky-engineer';
import { hasConfirmedSubmission } from '@/lib/fastener-line-inquiry';

import styles from './HomepageV2.module.css';

const emptyValues: HomepageRequirementValues = {
  direction: '',
  problem: '',
  identity: '',
  contact: '',
};

const fieldLabels: Record<HomepageRequirementField, string> = {
  direction: '咨询方向',
  problem: '需求或问题',
  identity: '公司 / 联系人',
  contact: '联系方式',
};

const sourceInitialResults = [
  ['热处理生产线', '工艺路线与设备范围'],
  ['单台工业炉', '炉型方向与关键参数'],
  ['现有工业炉', '维修、改造或更换判断'],
] as const;

const sourceDirectionOptions = [
  { value: '', label: '请选择' },
  { value: '新建热处理生产线', label: '新建热处理生产线' },
  { value: '单体工业炉新建', label: '单台工业炉（选型或新建）' },
  {
    value: '现有工业炉维修、改造或换新判断',
    label: '现有台车炉或工业炉：维修、改造或换新',
  },
  { value: '售后、选型或其他', label: '售后或其他' },
  { value: '还不确定，需要协助判断', label: '还不确定，需要协助判断' },
] as const;

type HomepageLeadFormProps = {
  locale?: 'zh' | 'en';
  sectionId?: string;
  eyebrow?: string;
  pageType?: string;
  productTag?: string;
  successProductTag?: string;
  sourceModule?: string;
  inquiryProduct?: string;
  inquiryDirection?: string;
  problemPlaceholder?: string;
  inquiryHint?: string;
  layoutVariant?: 'default' | 'solution' | 'embedded' | 'productCenter';
};

export function HomepageLeadForm({
  locale = 'zh',
  sectionId = 'homepage-lead-form',
  eyebrow,
  pageType = '首页',
  productTag = '热处理生产线与工业炉',
  successProductTag = '工件到炉型方向',
  sourceModule = 'homepage_form',
  inquiryProduct,
  inquiryDirection = '单体工业炉新建',
  problemPlaceholder = '例如：工件、产量、工艺要求或现有设备问题',
  inquiryHint = '填写已有信息即可，详细资料可后续补充。',
  layoutVariant = 'default',
}: HomepageLeadFormProps = {}) {
  const english = locale === 'en';
  const t = (zh: string, en: string) => english ? en : zh;
  const optionLabels = ['Please select', 'New heat-treatment line', 'Individual furnace: selection or new build', 'Existing furnace: repair, retrofit or replacement', 'After-sales or other support', 'Not sure — please help me assess'];
  const directionOptions = sourceDirectionOptions.map((option, index) => ({ ...option, label: english ? optionLabels[index] : option.label }));
  const initialResults = english ? [['Heat-treatment line', 'Process route and equipment scope'], ['Individual furnace', 'Furnace direction and key parameters'], ['Existing furnace', 'Repair, retrofit or replacement assessment']] : sourceInitialResults;
  const isEmbedded = layoutVariant === 'embedded';
  const isProductCenter = layoutVariant === 'productCenter';
  const formRef = useRef<HTMLFormElement>(null);
  const directionTriggerRef = useRef<HTMLButtonElement>(null);
  const directionSelectRef = useRef<HTMLDivElement>(null);
  const directionOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const formStartedRef = useRef(false);
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const directionListboxId = useId();
  const [values, setValues] = useState<HomepageRequirementValues>(() =>
    inquiryProduct
      ? { ...emptyValues, direction: inquiryDirection, problem: english ? `Equipment: ${inquiryProduct}.\n` : `咨询设备：${inquiryProduct}。\n` }
      : emptyValues,
  );
  const [invalidField, setInvalidField] = useState<HomepageRequirementField | null>(null);
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirectionOpen, setIsDirectionOpen] = useState(false);
  const [activeDirectionIndex, setActiveDirectionIndex] = useState(0);

  useEffect(() => {
    if (!isDirectionOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!directionSelectRef.current?.contains(event.target as Node)) {
        setIsDirectionOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isDirectionOpen]);

  const updateValue = (field: HomepageRequirementField, value: string) => {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackLeadEvent('form_start', { pageType, productTag });
    }
    setValues((current) => ({ ...current, [field]: value }));
    if (invalidField === field) setInvalidField(null);
    if (message) setMessage('');
  };

  const focusField = (field: HomepageRequirementField) => {
    requestAnimationFrame(() => {
      if (field === 'direction') {
        directionTriggerRef.current?.focus();
        return;
      }
      const element = formRef.current?.elements.namedItem(field);
      if (element instanceof HTMLElement) element.focus();
    });
  };

  const focusDirectionOption = (index: number) => {
    setActiveDirectionIndex(index);
    requestAnimationFrame(() => directionOptionRefs.current[index]?.focus());
  };

  const openDirectionMenu = (index?: number) => {
    const selectedIndex = directionOptions.findIndex((option) => option.value === values.direction);
    const nextIndex = index ?? Math.max(selectedIndex, 0);
    setIsDirectionOpen(true);
    focusDirectionOption(nextIndex);
  };

  const closeDirectionMenu = (restoreFocus = false) => {
    setIsDirectionOpen(false);
    if (restoreFocus) requestAnimationFrame(() => directionTriggerRef.current?.focus());
  };

  const selectDirection = (value: string) => {
    updateValue('direction', value);
    closeDirectionMenu(true);
  };

  const handleDirectionTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const selectedIndex = directionOptions.findIndex(
        (option) => option.value === values.direction,
      );
      const fallbackIndex = event.key === 'ArrowDown' ? 0 : directionOptions.length - 1;
      openDirectionMenu(selectedIndex >= 0 ? selectedIndex : fallbackIndex);
    }
  };

  const handleDirectionMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDirectionMenu(true);
      return;
    }
    if (event.key === 'Tab') {
      closeDirectionMenu();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectDirection(directionOptions[activeDirectionIndex].value);
      return;
    }

    let nextIndex = activeDirectionIndex;
    if (event.key === 'ArrowDown') nextIndex = (activeDirectionIndex + 1) % directionOptions.length;
    else if (event.key === 'ArrowUp') {
      nextIndex = (activeDirectionIndex - 1 + directionOptions.length) % directionOptions.length;
    } else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = directionOptions.length - 1;
    else return;

    event.preventDefault();
    focusDirectionOption(nextIndex);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const issue = validateHomepageRequirement(values);
    if (issue) {
      setInvalidField(issue);
      setMessage('');
      focusField(issue);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setMessage('');
    try {
      const trackingWorkpieceContext = inquiryProduct ? null : getActiveWorkpieceContext();
      const workpieceContext = inquiryProduct
        ? undefined
        : buildHomepageWorkpieceContext(getActiveWorkpieceRouterDraft());
      const result = await submitHomepageRequirement(
        buildHomepageRequirementPayload(
          values,
          buildLeadSourceSnapshot({
            pageType,
            productTag,
          }),
          getFormIdempotencyKey(idempotencyKeyRef),
          workpieceContext,
          locale,
        ),
      );
      if (!hasConfirmedSubmission(result)) throw new Error('Missing submission confirmation');
      setSubmissionId(String(result.submissionId));
      markStickyEngineerConverted();
      trackLeadEvent('form_success', {
        pageType,
        productTag: successProductTag,
        properties: trackingWorkpieceContext
          ? {
              source_module: 'workpiece_router',
              workpiece_id: trackingWorkpieceContext.workpieceId,
              search_term: trackingWorkpieceContext.searchTerm,
              process_route_id: trackingWorkpieceContext.routeId,
              process_variant_id: trackingWorkpieceContext.processPurposeId,
              display_state: trackingWorkpieceContext.displayState,
            }
          : { source_module: sourceModule },
      });
      renewFormIdempotencyKey(idempotencyKeyRef);
    } catch (error) {
      if (renewIdempotencyKeyAfterConflict(error, idempotencyKeyRef)) {
        setMessage(t('刚才提交出了点小状况，您填的内容都在，请再点一次提交。', 'There was a submission issue. Your details are saved here; please submit again.'));
      } else {
        setMessage(t('暂时没有提交成功，已保留填写内容，请稍后重试。', 'Unable to submit. Your details are saved here; please try again later.'));
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    clearActiveWorkpieceRouterDraft();
    setSubmissionId('');
    setValues(
      inquiryProduct
        ? { ...emptyValues, direction: inquiryDirection, problem: english ? `Equipment: ${inquiryProduct}.\n` : `咨询设备：${inquiryProduct}。\n` }
        : emptyValues,
    );
    setInvalidField(null);
    setMessage('');
    formStartedRef.current = false;
    requestAnimationFrame(() => directionTriggerRef.current?.focus());
  };

  return (
    <section
      id={sectionId}
      className={[
        styles.page,
        styles.formSection,
        layoutVariant === 'solution' ? styles.solutionFormSection : '',
        isEmbedded ? styles.embeddedFormSection : '',
        isProductCenter ? styles.productCenterFormSection : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={isEmbedded ? t('提交需求', 'Send project details') : undefined}
      aria-labelledby={isEmbedded ? undefined : 'homepage-form-title'}
      data-contact-form
      lang={locale}
    >
      <div className={styles.formInner}>
        {!isEmbedded ? (
          isProductCenter ? (
            <div className={`${styles.formIntro} ${styles.productCenterFormIntro}`}>
              <h2 id="homepage-form-title">{t('把需求告诉我们', 'Tell us about your project')}</h2>
              <p>{t('工件、产量或设备问题，有多少资料都可以先沟通。', 'Start with your workpiece, throughput or equipment issue.')}</p>
            </div>
          ) : (
            <div className={styles.formIntro}>
              {eyebrow ? <p className={styles.formEyebrow}>{eyebrow}</p> : null}
              <h2 id="homepage-form-title">{t('资料不全，也能先判断方向', 'Start with what you know')}</h2>
              <p>{t('只需说明工件、产量或现有设备问题，图纸和详细参数可后续补充。', 'Tell us about the workpiece, throughput or existing equipment issue. Drawings and detailed parameters can follow.')}</p>
              <div className={styles.formPathList}>
                {initialResults.map(([title, result]) => (
                  <div key={title}>
                    <strong>{title}</strong>
                    <span>{result}</span>
                  </div>
                ))}
              </div>
              <div className={styles.formOutcome}>
                <div className={styles.formOutcomeMedia}>
                  <Image
                    src="/images/home/inquiry-engineer-furnace-sketch-20260831.webp"
                    alt={t('工程师持图纸审核工业炉', 'Engineer reviewing industrial furnace drawings')}
                    width={1536}
                    height={1024}
                    sizes="(max-width: 639px) 34vw, (max-width: 1023px) 38vw, 220px"
                  />
                </div>
                <div className={styles.formOutcomeContent}>
                  <p>{t('提交后将获得', 'What you will receive')}</p>
                  <div className={styles.formOutcomeResults}>
                    <strong>{t('初步设备方向', 'Initial equipment direction')}</strong>
                    <span aria-hidden="true" />
                    <strong>{t('预算参考范围', 'Indicative budget range')}</strong>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : null}

        {submissionId ? (
          <div className={styles.successPanel} role="status" aria-live="polite">
            <span className={styles.successIcon} aria-hidden="true">
              <HiCheck />
            </span>
            <div>
              <span className={styles.successEyebrow}>{t('提交成功', 'Submitted successfully')}</span>
              <h3>{t('项目情况已经收到', 'We have received your project details')}</h3>
              <p>
                {t('我们会先按项目方向核对已提交信息，并给出可继续沟通的初步判断。需要补资料或现场勘查时会明确说明。', 'We will review the information and provide an initial assessment. We will explain any need for further documents or a site survey.')}
              </p>
            </div>
            <dl className={styles.successDetails}>
              <div>
                <dt>{t('需求编号', 'Reference number')}</dt>
                <dd>{submissionId}</dd>
              </div>
              <div>
                <dt>{t('已记录', 'Information received')}</dt>
                <dd>{t('项目方向、当前问题、公司或联系人、联系方式', 'Project direction, current issue, company or contact, and contact details')}</dd>
              </div>
              <div>
                <dt>{t('下一步', 'Next step')}</dt>
                <dd>{t('核对项目方向与资料完整度，准备初步判断', 'Review project direction and available information for an initial assessment')}</dd>
              </div>
              <div>
                <dt>{t('可能需要补充', 'Possible follow-up information')}</dt>
                <dd>{t('照片、图纸、工艺曲线、能耗或现场条件，按判断需要逐步提出', 'Photos, drawings, process curves, energy use or site conditions, as needed for the assessment')}</dd>
              </div>
            </dl>
            <button type="button" className={styles.secondaryButton} onClick={resetForm}>
              {t('提交另一个项目', 'Send another project')}
            </button>
          </div>
        ) : (
          <form
            id={`${sectionId}-fields`}
            ref={formRef}
            className={`${styles.leadForm} ${isProductCenter ? styles.productCenterLeadForm : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            {!isProductCenter ? (
              <p className={styles.privacyNote}>{english ? 'Share the information available now; detailed documents can follow.' : inquiryHint}</p>
            ) : null}
            {message ? (
              <p className={styles.formMessage} role="alert">
                {message}
              </p>
            ) : null}

            <div
              className={`${styles.field} ${isProductCenter ? styles.productCenterDirectionField : ''}`}
            >
              <label id="homepage-direction-label" htmlFor="homepage-direction-trigger">
                {isProductCenter ? t('需求类型', 'Project type') : t('1. 您想咨询什么？', '1. What do you need?')}
              </label>
              <div ref={directionSelectRef} className={styles.directionSelect}>
                <input type="hidden" name="direction" value={values.direction} readOnly />
                <button
                  ref={directionTriggerRef}
                  id="homepage-direction-trigger"
                  type="button"
                  className={styles.directionSelectTrigger}
                  data-empty={!values.direction || undefined}
                  data-open={isDirectionOpen || undefined}
                  aria-haspopup="listbox"
                  aria-expanded={isDirectionOpen}
                  aria-controls={isDirectionOpen ? directionListboxId : undefined}
                  aria-describedby={invalidField === 'direction' ? 'direction-error' : undefined}
                  aria-invalid={invalidField === 'direction' || undefined}
                  onClick={() => (isDirectionOpen ? closeDirectionMenu() : openDirectionMenu())}
                  onKeyDown={handleDirectionTriggerKeyDown}
                >
                  <span>
                    {directionOptions.find((option) => option.value === values.direction)?.label ??
                      t('请选择', 'Please select')}
                  </span>
                  <HiChevronDown aria-hidden="true" />
                </button>
                {isDirectionOpen ? (
                  <div
                    id={directionListboxId}
                    className={styles.directionSelectMenu}
                    role="listbox"
                    aria-labelledby="homepage-direction-label"
                    onKeyDown={handleDirectionMenuKeyDown}
                  >
                    {directionOptions.map((option, index) => {
                      const isSelected = option.value === values.direction;
                      return (
                        <button
                          key={option.value || 'placeholder'}
                          ref={(element) => {
                            directionOptionRefs.current[index] = element;
                          }}
                          type="button"
                          className={styles.directionSelectOption}
                          role="option"
                          aria-selected={isSelected}
                          data-active={index === activeDirectionIndex || undefined}
                          data-selected={isSelected || undefined}
                          onFocus={() => setActiveDirectionIndex(index)}
                          onMouseEnter={() => setActiveDirectionIndex(index)}
                          onClick={() => selectDirection(option.value)}
                        >
                          <span>{option.label}</span>
                          {isSelected ? <HiCheck aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              {invalidField === 'direction' ? (
                <span id="direction-error" className={styles.fieldError} aria-live="polite">
                  {t('请选择咨询方向。', 'Please select a project direction.')}
                </span>
              ) : null}
            </div>

            <label
              className={`${styles.field} ${isProductCenter ? styles.productCenterProblemField : ''}`}
            >
              <span>{isProductCenter ? t('需求描述', 'Project description') : t('2. 简要描述需求或问题', '2. Describe your project or issue')}</span>
              <textarea
                name="problem"
                value={values.problem}
                onChange={(event) => updateValue('problem', event.target.value)}
                placeholder={english ? 'Workpiece, throughput, process requirements or current equipment issue' : problemPlaceholder}
                autoComplete="off"
                maxLength={8_000}
                aria-describedby={invalidField === 'problem' ? 'problem-error' : undefined}
                aria-invalid={invalidField === 'problem' || undefined}
              />
              {invalidField === 'problem' ? (
                <span id="problem-error" className={styles.fieldError} aria-live="polite">
                  {english ? 'Please describe your project requirements or issue.' : <>请填写有效的{fieldLabels.problem}。</>}
                </span>
              ) : null}
            </label>

            <div
              className={`${styles.contactFields} ${isProductCenter ? styles.productCenterContactFields : ''}`}
            >
              <label
                className={`${styles.field} ${isProductCenter ? styles.productCenterIdentityField : ''}`}
              >
                <span>{isProductCenter ? t('公司 / 联系人', 'Company / contact person') : t('3. 公司 / 联系人', '3. Company / contact person')}</span>
                <input
                  name="identity"
                  type="text"
                  value={values.identity}
                  onChange={(event) => updateValue('identity', event.target.value)}
                  placeholder={t('例如：江苏某公司 张工', 'Company / contact name')}
                  autoComplete="organization"
                  maxLength={180}
                  aria-describedby={invalidField === 'identity' ? 'identity-error' : undefined}
                  aria-invalid={invalidField === 'identity' || undefined}
                />
                {invalidField === 'identity' ? (
                  <span id="identity-error" className={styles.fieldError} aria-live="polite">
                    {english ? 'Please enter a valid company or contact name.' : <>请填写有效的{fieldLabels.identity}。</>}
                  </span>
                ) : null}
              </label>

              <label
                className={`${styles.field} ${isProductCenter ? styles.productCenterContactField : ''}`}
              >
                <span>{isProductCenter ? t('联系方式', 'Contact details') : t('4. 联系方式（任选一种）', '4. Contact details (choose one)')}</span>
                <input
                  name="contact"
                  type="text"
                  value={values.contact}
                  onChange={(event) => updateValue('contact', event.target.value)}
                  placeholder={t('手机号、微信号或邮箱', 'Phone, WeChat or email')}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={254}
                  aria-describedby={[english ? 'contact-hint' : '', invalidField === 'contact' ? 'contact-error' : ''].filter(Boolean).join(' ') || undefined}
                  aria-invalid={invalidField === 'contact' || undefined}
                />
                {english ? (
                  <small id="contact-hint" className={styles.fieldHint}>
                    For phone numbers, include the country code.
                  </small>
                ) : null}
                {invalidField === 'contact' ? (
                  <span id="contact-error" className={styles.fieldError} aria-live="polite">
                    {english ? 'Please enter a valid phone number, WeChat ID or email address.' : <>请填写有效的{fieldLabels.contact}。</>}
                  </span>
                ) : null}
              </label>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? t('正在提交…', 'Sending…') : t('提交需求', 'Send project details')}
            </button>
            <p className={styles.formFootnote}>{t('您提交的信息仅用于本次需求沟通。', 'Your information is used only to discuss this project.')}</p>
          </form>
        )}
      </div>
    </section>
  );
}
