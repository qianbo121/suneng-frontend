'use client';

import { type FormEvent, useState } from 'react';

import { submitCustomRequirement } from '@/lib/api/custom-requirements';
import { Locale } from '@/types/site';

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
    defaultTitle: '提交您的非标需求',
    defaultDescription: '填写以下信息，我们的工程师将尽快与您联系，为您提供匹配炉型的解决方案。',
    defaultSubmitLabel: '提交需求',
    contactLabel: '联系苏能工业炉',
    onlineMessage: '在线留言',
    fields: {
      name: { label: '姓名', placeholder: '请输入您的姓名' },
      phone: { label: '联系电话', placeholder: '请输入手机号' },
      company: { label: '公司名称', placeholder: '请输入公司名称' },
      industry: { label: '所属行业', placeholder: '请输入所属行业' },
      process: { label: '设备工艺', placeholder: '请输入设备工艺，如退火、回火、正火等..' },
      temperature: { label: '使用温度', placeholder: '请输入温度，高温、低温℃' },
      requirement: { label: '设备需求', placeholder: '请输入工件材质、尺寸/单重、每小时产能..' },
    },
    privacy: '提交即表示同意《隐私政策》',
    submitting: '提交中...',
    requiredContact: '请输入联系方式！',
    submitFailed: '提交失败，请稍后再试',
    success: '已收到您的需求，我们会尽快与您联系',
    successButton: '我知道了',
    phoneLabel: '电话 / 微信',
    emailLabel: '邮箱',
  },
  en: {
    quoteButtonLabel: 'Get a Quote',
    defaultTitle: 'Submit Your Custom Requirement',
    defaultDescription: 'Share your workpiece, process, temperature and throughput requirements. Our engineers will help match the right industrial furnace solution.',
    defaultSubmitLabel: 'Submit Requirement',
    contactLabel: 'Contact Suneng Industrial Furnace',
    onlineMessage: 'Online Inquiry',
    fields: {
      name: { label: 'Name', placeholder: 'Enter your name' },
      phone: { label: 'Phone', placeholder: 'Enter your phone number' },
      company: { label: 'Company', placeholder: 'Enter your company name' },
      industry: { label: 'Industry', placeholder: 'Enter your industry' },
      process: { label: 'Heat-Treatment Process', placeholder: 'e.g. annealing, tempering, normalizing...' },
      temperature: { label: 'Operating Temperature', placeholder: 'Enter the required temperature range' },
      requirement: { label: 'Equipment Requirements', placeholder: 'Enter workpiece material, dimensions / unit weight, hourly throughput...' },
    },
    privacy: 'By submitting, you agree to the Privacy Policy.',
    submitting: 'Submitting...',
    requiredContact: 'Please enter your contact information.',
    submitFailed: 'Submission failed. Please try again later.',
    success: 'We have received your requirement and will contact you soon.',
    successButton: 'Got it',
    phoneLabel: 'Phone / WeChat',
    emailLabel: 'Email',
  },
} satisfies Record<Locale, {
  quoteButtonLabel: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultSubmitLabel: string;
  contactLabel: string;
  onlineMessage: string;
  fields: Record<'name' | 'phone' | 'company' | 'industry' | 'process' | 'temperature' | 'requirement', {
    label: string;
    placeholder: string;
  }>;
  privacy: string;
  submitting: string;
  requiredContact: string;
  submitFailed: string;
  success: string;
  successButton: string;
  phoneLabel: string;
  emailLabel: string;
}>;

function LeadTextInput({
  label,
  placeholder,
  name,
  required = false,
  invalid = false,
  onInput,
  className = '',
}: {
  label: string;
  placeholder: string;
  name: string;
  required?: boolean;
  invalid?: boolean;
  onInput?: () => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[13px] font-normal leading-none text-[#4a5160]">
        {label}
        {required ? (
          <span className="ml-1 text-[#c51624]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <input
        name={name}
        onInput={onInput}
        aria-invalid={invalid || undefined}
        className={`mt-2 h-[40px] w-full rounded-[4px] border bg-white px-3 text-[14px] font-normal text-[#1a1d23] outline-none transition placeholder:text-[#b0b5bd] focus:border-[#c51624] focus:shadow-[0_0_0_3px_rgba(197,22,36,0.08)] ${
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
  onInput,
  className = '',
}: {
  label: string;
  placeholder: string;
  name: string;
  required?: boolean;
  invalid?: boolean;
  onInput?: () => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[13px] font-normal leading-none text-[#4a5160]">
        {label}
        {required ? (
          <span className="ml-1 text-[#c51624]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <textarea
        name={name}
        onInput={onInput}
        aria-invalid={invalid || undefined}
        className={`mt-2 min-h-[96px] w-full resize-y rounded-[4px] border bg-white px-3 py-3 text-[14px] font-normal leading-[1.65] text-[#1a1d23] outline-none transition placeholder:text-[#b0b5bd] focus:border-[#c51624] focus:shadow-[0_0_0_3px_rgba(197,22,36,0.08)] ${
          invalid ? 'border-[#c51624] shadow-[0_0_0_3px_rgba(197,22,36,0.08)]' : 'border-[#e0e3e8]'
        }`}
        placeholder={placeholder}
      />
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
  className = 'flex h-11 w-full items-center justify-center rounded-[4px] bg-[#c51624] text-[15px] font-medium text-white transition hover:bg-[#a90f1b]',
  updateHash = false,
  variant = 'card',
  anchorId = 'product-lead-form',
}: ProductQuoteScrollButtonProps) {
  const copy = leadFormCopy[locale];
  const buttonLabel = label ?? copy.quoteButtonLabel;

  const handleClick = () => {
    const target = document.getElementById(anchorId);

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    if (target && updateHash) {
      window.history.replaceState(null, '', `#${anchorId}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-product-scroll-variant={variant}
      className={className}
    >
      {buttonLabel}
    </button>
  );
}

export function ProductLeadForm({
  locale = 'zh',
  leadBullets,
  anchorId = 'product-lead-form',
  title,
  description,
  submitLabel,
  contactHref,
  contactLabel,
  phone,
  email,
  className = '',
}: ProductLeadFormProps) {
  const copy = leadFormCopy[locale];
  const resolvedTitle = title ?? copy.defaultTitle;
  const resolvedDescription = description ?? copy.defaultDescription;
  const resolvedSubmitLabel = submitLabel ?? copy.defaultSubmitLabel;
  const resolvedContactLabel = contactLabel ?? copy.contactLabel;
  const [toast, setToast] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [invalidContact, setInvalidContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLeadSidebar = Boolean(leadBullets?.length);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const getFormValue = (formData: FormData, name: string) =>
    String(formData.get(name) || '').trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const contact = getFormValue(formData, 'phone');

    if (!contact) {
      setInvalidContact(true);
      showToast(copy.requiredContact);
      return;
    }

    setInvalidContact(false);

    try {
      setIsSubmitting(true);
      await submitCustomRequirement({
        name: getFormValue(formData, 'name') || undefined,
        phone: contact,
        company: getFormValue(formData, 'company') || undefined,
        industry: getFormValue(formData, 'industry') || undefined,
        process: getFormValue(formData, 'process') || undefined,
        temperature: getFormValue(formData, 'temperature') || undefined,
        requirement: getFormValue(formData, 'requirement') || undefined,
      });
      form.reset();
      setShowSuccess(true);
    } catch {
      showToast(copy.submitFailed);
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
                <li key={item} className="flex items-center gap-[10px] text-[13px] font-normal leading-[1.5] text-white/90">
                  <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border border-[#c51624] text-[#c51624]">
                    <svg className="h-[10px] w-[10px]" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5.2 4.1 7.1 8 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {phone || email || contactHref ? (
              <div className="mt-5 space-y-2 border-t border-white/15 pt-4 text-[13px] leading-[1.7] text-white/82">
                {phone ? <p>{copy.phoneLabel}: {phone}</p> : null}
                {email ? <p>{copy.emailLabel}: {email}</p> : null}
                {contactHref ? (
                  <a href={contactHref} className="inline-flex text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                    {resolvedContactLabel}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate className={`flex items-center p-[24px] lg:p-[28px] ${hasLeadSidebar ? '' : 'lg:p-[32px]'}`}>
          <div className="w-full">
            {!hasLeadSidebar ? (
              <div className="mb-6">
                <p className="mb-2 text-[14px] font-semibold tracking-[0.18em] text-[#c51624]">{copy.onlineMessage}</p>
                <h2 className="text-[28px] font-semibold leading-[1.28] text-[#101828] sm:text-[34px]">{resolvedTitle}</h2>
                <p className="mt-4 max-w-[860px] text-[15px] leading-[1.85] text-[#667085]">{resolvedDescription}</p>
              </div>
            ) : null}

            <div className="grid gap-x-[22px] gap-y-[18px] md:grid-cols-3">
              <LeadTextInput label={copy.fields.name.label} name="name" placeholder={copy.fields.name.placeholder} />
              <LeadTextInput
                label={copy.fields.phone.label}
                name="phone"
                placeholder={copy.fields.phone.placeholder}
                required
                invalid={invalidContact}
                onInput={() => {
                  if (invalidContact) setInvalidContact(false);
                }}
              />
              <LeadTextInput label={copy.fields.company.label} name="company" placeholder={copy.fields.company.placeholder} />
              <LeadTextInput label={copy.fields.industry.label} name="industry" placeholder={copy.fields.industry.placeholder} />
              <LeadTextInput label={copy.fields.process.label} name="process" placeholder={copy.fields.process.placeholder} />
              <LeadTextInput label={copy.fields.temperature.label} name="temperature" placeholder={copy.fields.temperature.placeholder} />
              <LeadTextarea className="md:col-span-3" label={copy.fields.requirement.label} name="requirement" placeholder={copy.fields.requirement.placeholder} />
              <div className="flex flex-col items-stretch gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between md:col-span-3">
                <p className="text-[13px] text-[#98a1ad]">{copy.privacy}</p>
                <button
                  className="h-[44px] w-full rounded-[4px] bg-[#c51624] text-[15px] font-medium text-white transition hover:bg-[#a90f1b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px] sm:shrink-0"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? copy.submitting : resolvedSubmitLabel}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {toast ? (
        <div className="fixed left-1/2 top-1/2 z-[120] -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-[#1f2937] px-6 py-3 text-[15px] text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          {toast}
        </div>
      ) : null}

      {showSuccess ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-[380px] rounded-[8px] bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <p className="text-[17px] leading-[1.7] text-[#1a1d23]">{copy.success}</p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-6 h-[40px] min-w-[120px] rounded-[4px] bg-[#c51624] px-6 text-[14px] font-medium text-white transition hover:bg-[#a90f1b]"
            >
              {copy.successButton}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
