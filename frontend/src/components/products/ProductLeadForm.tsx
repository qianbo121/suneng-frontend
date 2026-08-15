'use client';

import { type FormEvent, type Ref, useEffect, useId, useRef, useState } from 'react';

import {
  buildCustomRequirementPayload,
  getFormIdempotencyKey,
  type LeadValidationIssue,
  type ProjectLeadValues,
  renewIdempotencyKeyAfterConflict,
  renewFormIdempotencyKey,
  submitCustomRequirement,
  validateLeadStepOne,
} from '@/lib/api/custom-requirements';
import { buildLeadSourceSnapshot, trackLeadEvent } from '@/lib/api/lead-events';
import { Locale } from '@/types/site';
import {
  handleSuccessDialogKeyDown,
  restoreSuccessDialogFocus,
} from '@/components/products/success-dialog-accessibility';

type ProductLeadFormProps = {
  locale?: Locale;
  leadBullets?: string[];
  anchorId?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  contactHref?: string;
  contactLabel?: string;
  phone?: string;
  email?: string;
  className?: string;
};

const leadFormCopy = {
  zh: {
    quoteButtonLabel: '获取报价方案',
    defaultTitle: '提交项目工况',
    defaultDescription: '先填写项目概况和联系方式，工程师会据此判断下一步需要补充哪些参数。',
    contactLabel: '联系苏能工业炉',
    onlineMessage: '工程需求',
    stepLabel: (step: number) => `第 ${step} 步，共 2 步`,
    stepOneTitle: '项目概况',
    stepTwoTitle: '补充信息（全部选填）',
    fields: {
      projectType: {
        label: '项目类型',
        placeholder: '请选择项目类型',
        options: [
          { value: 'new', label: '新建项目' },
          { value: 'renovation', label: '改造项目' },
          { value: 'after-sales', label: '售后服务' },
        ],
      },
      company: { label: '公司', placeholder: '请输入公司名称' },
      name: { label: '联系人', placeholder: '请输入联系人姓名' },
      projectLocation: { label: '项目地点 / 交付国家', placeholder: '例如：江苏泰州 / 越南' },
      phone: { label: '电话 / 微信', placeholder: '电话或微信（与邮箱至少填一项）' },
      email: { label: '邮箱', placeholder: '邮箱（与电话至少填一项）' },
      requirement: {
        label: '简要项目需求 / 补充说明',
        placeholder: '请简要说明要解决的问题。已有的工件尺寸、重量、产能、能源、气氛或验收要求，也可一并写在这里。',
      },
      industry: { label: '行业', placeholder: '例如：汽车零部件、铸造' },
      process: { label: '工艺', placeholder: '例如：退火、回火、正火' },
      temperature: { label: '最高温度', placeholder: '例如：950℃' },
      preferredContact: {
        label: '首选联系方式',
        options: [
          { value: 'phone', label: '电话' },
          { value: 'email', label: '邮箱' },
        ],
      },
      discoverySource: {
        label: '如何了解苏能',
        options: ['AI 助手', '搜索引擎', '微信公众号 / 短视频', '客户 / 朋友推荐', '展会 / 行业平台', '其他'],
      },
    },
    fileNote: '技术文件本批暂不上传，可在工程师联系后补充。',
    privacy: {
      summary: '开始填写后，我们会记录本次必要的页面与来源信息，仅用于处理项目需求和改进官网。查看《隐私说明》',
      notice:
        '您提交的姓名、联系方式、公司与项目需求仅用于回复询盘、评估设备方案及后续沟通。如需查询、更正或删除已提交信息，请联系 997518512@qq.com。请勿提交与项目无关的敏感个人信息。',
    },
    next: '下一步',
    back: '返回修改',
    submit: '提交项目工况',
    submitting: '提交中...',
    required: '请完整填写第一步的必填信息',
    requiredContact: '电话或邮箱至少填写一项',
    invalidEmail: '请输入正确的邮箱地址',
    idempotencyConflict: '之前版本可能已提交。当前内容已保留，请再次点击提交，作为新版本发送。',
    submitFailed: '提交失败，请稍后再试',
    success: '项目工况已提交，工程师会尽快与您联系。',
    submissionNumber: '提交编号',
    successButton: '我知道了',
    phoneLabel: '电话 / 微信',
    emailLabel: '邮箱',
  },
  en: {
    quoteButtonLabel: 'Request an Engineering Review',
    defaultTitle: 'Request an Engineering Review',
    defaultDescription: 'Share the project basics first. Our engineers will confirm which technical details are needed next.',
    contactLabel: 'Contact Suneng Industrial Furnace',
    onlineMessage: 'Project inquiry',
    stepLabel: (step: number) => `Step ${step} of 2`,
    stepOneTitle: 'Project basics',
    stepTwoTitle: 'Optional details',
    fields: {
      projectType: {
        label: 'Project Type',
        placeholder: 'Select a project type',
        options: [
          { value: 'new', label: 'New Project' },
          { value: 'renovation', label: 'Renovation' },
          { value: 'after-sales', label: 'After-sales Service' },
        ],
      },
      company: { label: 'Company', placeholder: 'Enter your company name' },
      name: { label: 'Contact Name', placeholder: 'Enter your name' },
      projectLocation: { label: 'Project Location / Delivery Country', placeholder: 'e.g. Vietnam' },
      phone: { label: 'Phone / WhatsApp (Optional)', placeholder: 'Enter a phone or WhatsApp number' },
      email: { label: 'Work Email', placeholder: 'Enter your email address' },
      requirement: {
        label: 'Brief Requirements / Additional Notes',
        placeholder: 'Briefly describe the problem to solve. You may also include dimensions, weight, throughput, energy, atmosphere or acceptance requirements here.',
      },
      industry: { label: 'Industry', placeholder: 'e.g. automotive parts, foundry' },
      process: { label: 'Process', placeholder: 'e.g. annealing, tempering' },
      temperature: { label: 'Maximum Temperature', placeholder: 'e.g. 950°C' },
      preferredContact: {
        label: 'Preferred Contact Method',
        options: [
          { value: 'phone', label: 'Phone' },
          { value: 'email', label: 'Email' },
        ],
      },
      discoverySource: {
        label: 'How did you hear about Suneng?',
        options: ['AI assistant', 'Search engine', 'WeChat / short video', 'Customer / friend referral', 'Exhibition / industry platform', 'Other'],
      },
    },
    fileNote: 'Technical files are not uploaded in this form. You can provide them after an engineer contacts you.',
    privacy: {
      summary: 'When you start this form, we record the necessary page and source information only to handle your request and improve the site. View the Privacy Notice.',
      notice:
        'The name, contact details, company information and project requirements you provide are used only to respond to your inquiry, evaluate a furnace solution and continue project communication. To request access, correction or deletion, contact 997518512@qq.com. Do not submit unrelated sensitive personal information.',
    },
    next: 'Continue',
    back: 'Back to Edit',
    submit: 'Request an Engineering Review',
    submitting: 'Submitting...',
    required: 'Complete all required fields in step one.',
    requiredContact: 'Enter your business email.',
    invalidEmail: 'Enter a valid email address.',
    idempotencyConflict: 'An earlier version may already have been submitted. Your current entries are still here. Click submit again to send them as a new version.',
    submitFailed: 'Submission failed. Please try again later.',
    success: 'Your project request has been received. Our engineers will contact you soon.',
    submissionNumber: 'Submission ID',
    successButton: 'Done',
    phoneLabel: 'Phone / WhatsApp',
    emailLabel: 'Email',
  },
} as const;

type SelectOption = { value: string; label: string };

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <span className="text-[13px] font-normal leading-[1.4] text-[#4a5160]">
      {label}
      {required ? <span className="ml-1" aria-hidden="true">*</span> : null}
    </span>
  );
}

function LeadTextInput({
  label,
  placeholder,
  name,
  required = false,
  invalid = false,
  inputRef,
  type = 'text',
  autoComplete,
  maxLength,
  className = '',
}: {
  label: string;
  placeholder: string;
  name: string;
  required?: boolean;
  invalid?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <FieldLabel label={label} required={required} />
      <input
        ref={inputRef}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        className={`mt-2 h-[44px] w-full rounded-[4px] border bg-white px-3 text-[14px] text-[#1a1d23] outline-none transition placeholder:text-[#b0b5bd] focus:border-[#c51624] focus:shadow-[0_0_0_3px_rgba(197,22,36,0.08)] ${
          invalid ? 'border-[#c51624] shadow-[0_0_0_3px_rgba(197,22,36,0.08)]' : 'border-[#e0e3e8]'
        }`}
        placeholder={placeholder}
      />
    </label>
  );
}

function LeadTextarea({
  label,
  placeholder,
  name,
  required = false,
  invalid = false,
  maxLength,
  className = '',
}: {
  label: string;
  placeholder: string;
  name: string;
  required?: boolean;
  invalid?: boolean;
  maxLength?: number;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <FieldLabel label={label} required={required} />
      <textarea
        name={name}
        required={required}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        className={`mt-2 min-h-[112px] w-full resize-y rounded-[4px] border bg-white px-3 py-3 text-[14px] leading-[1.65] text-[#1a1d23] outline-none transition placeholder:text-[#b0b5bd] focus:border-[#c51624] focus:shadow-[0_0_0_3px_rgba(197,22,36,0.08)] ${
          invalid ? 'border-[#c51624] shadow-[0_0_0_3px_rgba(197,22,36,0.08)]' : 'border-[#e0e3e8]'
        }`}
        placeholder={placeholder}
      />
    </label>
  );
}

function LeadSelect({
  label,
  placeholder,
  name,
  options,
  required = false,
  invalid = false,
  className = '',
}: {
  label: string;
  placeholder: string;
  name: string;
  options: readonly (string | SelectOption)[];
  required?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <FieldLabel label={label} required={required} />
      <select
        name={name}
        defaultValue=""
        required={required}
        aria-invalid={invalid || undefined}
        className={`mt-2 h-[44px] w-full rounded-[4px] border bg-white px-3 text-[14px] text-[#1a1d23] outline-none transition focus:border-[#c51624] focus:shadow-[0_0_0_3px_rgba(197,22,36,0.08)] ${
          invalid ? 'border-[#c51624] shadow-[0_0_0_3px_rgba(197,22,36,0.08)]' : 'border-[#e0e3e8]'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return <option key={value} value={value}>{optionLabel}</option>;
        })}
      </select>
    </label>
  );
}

type ProductQuoteScrollButtonProps = {
  locale?: Locale;
  label?: string;
  className?: string;
  updateHash?: boolean;
  variant?: 'hero' | 'card';
  anchorId?: string;
};

export function ProductQuoteScrollButton({
  locale = 'zh',
  label,
  className = 'flex h-11 w-full items-center justify-center rounded-[4px] cta-primary text-[15px] font-medium text-white transition',
  updateHash = false,
  variant = 'card',
  anchorId = 'product-lead-form',
}: ProductQuoteScrollButtonProps) {
  const buttonLabel = label ?? leadFormCopy[locale].quoteButtonLabel;

  const handleClick = () => {
    trackLeadEvent('quote_cta_click');
    const target = document.getElementById(anchorId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (target && updateHash) window.history.replaceState(null, '', `#${anchorId}`);
  };

  return (
    <button type="button" onClick={handleClick} data-product-scroll-variant={variant} className={className}>
      {buttonLabel}
    </button>
  );
}

function readLeadValues(form: HTMLFormElement): ProjectLeadValues {
  const formData = new FormData(form);
  const value = (name: keyof ProjectLeadValues) => String(formData.get(name) || '').trim();
  return {
    projectType: value('projectType'),
    projectLocation: value('projectLocation'),
    name: value('name'),
    company: value('company'),
    phone: value('phone'),
    email: value('email'),
    preferredContact: value('preferredContact'),
    industry: value('industry'),
    process: value('process'),
    temperature: value('temperature'),
    requirement: value('requirement'),
    discoverySource: value('discoverySource'),
  };
}

export function ProductLeadForm({
  locale = 'zh',
  leadBullets,
  anchorId = 'product-lead-form',
  title,
  description,
  contactHref,
  contactLabel,
  phone,
  email,
  className = '',
}: ProductLeadFormProps) {
  const copy = leadFormCopy[locale];
  const resolvedTitle = title ?? copy.defaultTitle;
  const resolvedDescription = description ?? copy.defaultDescription;
  const resolvedContactLabel = contactLabel ?? copy.contactLabel;
  const formIdPrefix = useId();
  const privacyNoticeId = `${formIdPrefix}-privacy-notice`;
  const successDialogTitleId = `${formIdPrefix}-success-title`;
  const formRef = useRef<HTMLFormElement>(null);
  const formStartedRef = useRef(false);
  const stepCompletedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const successReturnFocusRef = useRef<HTMLElement | null>(null);
  const successWasOpenRef = useRef(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [toast, setToast] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [invalidField, setInvalidField] = useState<keyof ProjectLeadValues | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLeadSidebar = Boolean(leadBullets?.length);

  useEffect(() => {
    if (submissionId) {
      successWasOpenRef.current = true;
      successButtonRef.current?.focus();
      const handleKeyDown = (event: KeyboardEvent) =>
        handleSuccessDialogKeyDown(event, () => setSubmissionId(''));
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }

    if (successWasOpenRef.current) {
      successWasOpenRef.current = false;
      const fallback = formRef.current?.elements.namedItem('projectType');
      restoreSuccessDialogFocus(
        successReturnFocusRef.current,
        fallback instanceof HTMLElement ? fallback : null,
      );
      successReturnFocusRef.current = null;
    }
  }, [submissionId]);

  const showToast = (message: string, duration = 2200) => {
    setToast(message);
    window.setTimeout(() => setToast(''), duration);
  };

  const issueMessage = (issue: LeadValidationIssue) => {
    if (issue.reason === 'contact') return copy.requiredContact;
    if (issue.reason === 'email') return copy.invalidEmail;
    return copy.required;
  };

  const focusIssue = (issue: LeadValidationIssue) => {
    setInvalidField(issue.field);
    showToast(issueMessage(issue));
    const field = formRef.current?.elements.namedItem(issue.field);
    if (field instanceof HTMLElement) field.focus();
  };

  const handleFormStart = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackLeadEvent('form_start');
  };

  const handleNext = () => {
    const form = formRef.current;
    if (!form) return;
    const issue = validateLeadStepOne(readLeadValues(form), locale);
    if (issue) {
      focusIssue(issue);
      return;
    }
    setInvalidField(null);
    if (!stepCompletedRef.current) {
      stepCompletedRef.current = true;
      trackLeadEvent('form_step_complete');
    }
    setStep(2);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readLeadValues(form);
    const issue = validateLeadStepOne(values, locale);
    if (issue) {
      setStep(1);
      window.setTimeout(() => focusIssue(issue), 0);
      return;
    }

    successReturnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    try {
      setIsSubmitting(true);
      const result = await submitCustomRequirement(
        buildCustomRequirementPayload(
          values,
          locale,
          buildLeadSourceSnapshot(),
          getFormIdempotencyKey(idempotencyKeyRef),
        ),
      );
      form.reset();
      renewFormIdempotencyKey(idempotencyKeyRef);
      formStartedRef.current = false;
      stepCompletedRef.current = false;
      setInvalidField(null);
      setStep(1);
      setSubmissionId(String(result.submissionId));
    } catch (error) {
      if (renewIdempotencyKeyAfterConflict(error, idempotencyKeyRef)) {
        showToast(copy.idempotencyConflict, 6000);
      } else {
        showToast(copy.submitFailed);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section
        id={anchorId}
        className={`grid scroll-mt-24 overflow-hidden rounded-[8px] border border-[#eef0f3] bg-white ${
          hasLeadSidebar ? 'mt-[48px] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]' : ''
        } ${className}`}
      >
        {hasLeadSidebar ? (
          <div className="flex flex-col bg-[#2c3445] px-[24px] py-[26px] text-white lg:px-[28px] lg:py-[30px]">
            <h2 className="mb-[10px] text-[20px] font-semibold leading-[1.35]">{resolvedTitle}</h2>
            <p className="mb-[18px] text-[13px] leading-[1.7] text-white/75">{resolvedDescription}</p>
            <ul className="space-y-[10px]">
              {leadBullets?.map((item) => (
                <li key={item} className="flex items-center gap-[10px] text-[13px] leading-[1.5] text-white/90">
                  <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full cta-secondary" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {phone || email || contactHref ? (
              <div className="mt-5 space-y-2 border-t border-white/15 pt-4 text-[13px] leading-[1.7] text-white/82">
                {phone ? <p>{copy.phoneLabel}: {phone}</p> : null}
                {email ? <p>{copy.emailLabel}: {email}</p> : null}
                {contactHref ? <a href={contactHref} className="inline-flex text-white underline decoration-white/40 underline-offset-4">{resolvedContactLabel}</a> : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onChangeCapture={() => {
            handleFormStart();
            if (invalidField) setInvalidField(null);
          }}
          noValidate
          className={`p-[20px] sm:p-[24px] lg:p-[28px] ${hasLeadSidebar ? '' : 'lg:p-[32px]'}`}
        >
          {!hasLeadSidebar ? (
            <div className="mb-6">
              <p className="mb-2 text-[14px] font-semibold tracking-[0.18em]">{copy.onlineMessage}</p>
              <h2 className="text-[28px] font-semibold leading-[1.28] text-[#101828] sm:text-[34px]">{resolvedTitle}</h2>
              <p className="mt-4 max-w-[860px] text-[15px] leading-[1.85] text-[#667085]">{resolvedDescription}</p>
            </div>
          ) : null}

          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#eef0f3] pb-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#c51624]">{copy.stepLabel(step)}</p>
              <h3 className="mt-1 text-[19px] font-semibold text-[#101828]">{step === 1 ? copy.stepOneTitle : copy.stepTwoTitle}</h3>
            </div>
            <div className="flex gap-2" aria-hidden="true">
              {[1, 2].map((item) => <span key={item} className={`h-1.5 w-10 rounded-full ${item <= step ? 'bg-[#c51624]' : 'bg-[#e5e7eb]'}`} />)}
            </div>
          </div>

          <div className="mb-[18px] text-[12px] leading-[1.7] text-[#667085]">
            <button
              type="button"
              aria-controls={privacyNoticeId}
              aria-expanded={showPrivacyNotice}
              className="text-left underline decoration-[#98a1ad] underline-offset-4 hover:text-[#c51624]"
              onClick={() => setShowPrivacyNotice((current) => !current)}
            >
              {copy.privacy.summary}
            </button>
            {showPrivacyNotice ? <p id={privacyNoticeId} className="mt-2 rounded-[4px] border border-[#e0e6ee] bg-[#f8fafc] p-3">{copy.privacy.notice}</p> : null}
          </div>

          <div
            className={`${step === 1 ? 'grid' : 'hidden'} gap-x-[18px] gap-y-[18px] md:grid-cols-2`}
          >
            <LeadSelect
              label={copy.fields.projectType.label}
              placeholder={copy.fields.projectType.placeholder}
              name="projectType"
              options={copy.fields.projectType.options}
              required
              invalid={invalidField === 'projectType'}
            />
            <LeadTextInput label={copy.fields.company.label} name="company" placeholder={copy.fields.company.placeholder} required invalid={invalidField === 'company'} autoComplete="organization" maxLength={180} />
            <LeadTextInput label={copy.fields.name.label} name="name" placeholder={copy.fields.name.placeholder} required invalid={invalidField === 'name'} autoComplete="name" maxLength={120} />
            <LeadTextInput label={copy.fields.projectLocation.label} name="projectLocation" placeholder={copy.fields.projectLocation.placeholder} required invalid={invalidField === 'projectLocation'} autoComplete="country-name" maxLength={180} />
            <LeadTextInput label={copy.fields.phone.label} name="phone" placeholder={copy.fields.phone.placeholder} type="tel" invalid={invalidField === 'phone'} autoComplete="tel" maxLength={50} />
            <LeadTextInput label={copy.fields.email.label} name="email" placeholder={copy.fields.email.placeholder} type="email" required={locale === 'en'} invalid={invalidField === 'email'} autoComplete="email" maxLength={254} />
            <LeadTextarea className="md:col-span-2" label={copy.fields.requirement.label} name="requirement" placeholder={copy.fields.requirement.placeholder} required invalid={invalidField === 'requirement'} maxLength={8000} />
            <div className="md:col-span-2 flex justify-end pt-1">
              <button type="button" onClick={handleNext} className="h-[46px] w-full rounded-[4px] cta-primary px-6 text-[15px] font-medium text-white sm:w-[220px]">
                {copy.next}
              </button>
            </div>
          </div>

          <div
            className={`${step === 2 ? 'grid' : 'hidden'} gap-x-[18px] gap-y-[18px] md:grid-cols-2`}
          >
            <LeadTextInput label={copy.fields.industry.label} name="industry" placeholder={copy.fields.industry.placeholder} maxLength={180} />
            <LeadTextInput label={copy.fields.process.label} name="process" placeholder={copy.fields.process.placeholder} maxLength={180} />
            <LeadTextInput label={copy.fields.temperature.label} name="temperature" placeholder={copy.fields.temperature.placeholder} maxLength={120} />
            <LeadSelect label={copy.fields.preferredContact.label} placeholder={locale === 'zh' ? '请选择' : 'Select an option'} name="preferredContact" options={copy.fields.preferredContact.options} />
            <LeadSelect className="md:col-span-2" label={copy.fields.discoverySource.label} placeholder={locale === 'zh' ? '请选择' : 'Select an option'} name="discoverySource" options={copy.fields.discoverySource.options} />

            <p className="rounded-[4px] border border-[#e0e6ee] bg-[#f8fafc] p-3 text-[13px] leading-[1.7] text-[#667085] md:col-span-2">{copy.fileNote}</p>

            <div className="grid gap-3 pt-1 sm:grid-cols-2 md:col-span-2">
              <button type="button" onClick={() => setStep(1)} className="h-[46px] rounded-[4px] border border-[#d8dde5] px-5 text-[14px] font-medium text-[#4a5160]">
                {copy.back}
              </button>
              <button type="submit" disabled={isSubmitting} className="h-[46px] rounded-[4px] cta-primary px-5 text-[14px] font-medium text-white disabled:opacity-60">
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
            </div>
          </div>
        </form>
      </section>

      {toast ? <div role="alert" className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-[#1f2937] px-6 py-3 text-center text-[15px] text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">{toast}</div> : null}

      {submissionId ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={successDialogTitleId}
        >
          <div className="w-full max-w-[420px] rounded-[8px] bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <p id={successDialogTitleId} className="text-[17px] leading-[1.7] text-[#1a1d23]">{copy.success}</p>
            <p className="mt-4 rounded-[4px] bg-[#f5f7fa] px-4 py-3 text-[14px] text-[#4a5160]">
              {copy.submissionNumber}: <strong className="font-semibold text-[#101828]">{submissionId}</strong>
            </p>
            <button ref={successButtonRef} type="button" onClick={() => setSubmissionId('')} className="mt-6 h-[42px] min-w-[128px] rounded-[4px] cta-primary px-6 text-[14px] font-medium text-white">
              {copy.successButton}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
