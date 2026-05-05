'use client';

import { useRef, useState } from 'react';

import { submitCustomRequirement } from '@/lib/api/custom-requirements';

type ProductLeadFormProps = {
  leadBullets: string[];
};

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
      {required ? <span className="text-[13px] leading-none text-[#e60012]">*</span> : null}
      <span className={required ? 'ml-1 text-[13px] font-normal leading-none text-[#4a5160]' : 'text-[13px] font-normal leading-none text-[#4a5160]'}>{label}</span>
      <input
        name={name}
        onInput={onInput}
        aria-invalid={invalid || undefined}
        className={`mt-2 h-[40px] w-full rounded-[4px] border bg-white px-3 text-[14px] font-normal text-[#1a1d23] outline-none transition placeholder:text-[#b0b5bd] focus:border-[#e60012] focus:shadow-[0_0_0_3px_rgba(230,0,18,0.08)] ${
          invalid ? 'border-[#e60012] shadow-[0_0_0_3px_rgba(230,0,18,0.08)]' : 'border-[#e0e3e8]'
        }`}
        placeholder={placeholder}
      />
    </label>
  );
}

export function ProductQuoteScrollButton() {
  const handleClick = () => {
    document.getElementById('product-lead-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-11 w-full items-center justify-center rounded-md bg-[#e60012] text-[15px] font-medium text-white transition hover:bg-[#c8000f]"
    >
      获取报价方案
    </button>
  );
}

export function ProductLeadForm({ leadBullets }: ProductLeadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [invalidContact, setInvalidContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const getFormValue = (formData: FormData, name: string) =>
    String(formData.get(name) || '').trim();

  const handleSubmit = async () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const contact = getFormValue(formData, 'phone');

    if (!contact) {
      setInvalidContact(true);
      showToast('请输入联系方式！');
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
      formRef.current.reset();
      setShowSuccess(true);
    } catch {
      showToast('提交失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="product-lead-form" className="mt-[56px] grid overflow-hidden rounded-[8px] border border-[#eef0f3] bg-white lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex flex-col bg-[#2c3445] px-[22px] py-[24px] text-white">
          <h2 className="mb-[10px] text-[20px] font-semibold leading-[1.35]">提交您的非标需求</h2>
          <p className="mb-[18px] text-[13px] leading-[1.7] text-white/75">填写以下信息，我们的工程师将尽快与您联系，为您提供匹配炉型的解决方案。</p>
          <ul className="space-y-[10px]">
            {leadBullets.map((item) => (
              <li key={item} className="flex items-center gap-[10px] text-[13px] font-normal leading-[1.5] text-white/90">
                <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border border-[#e60012] text-[#e60012]">
                  <svg className="h-[10px] w-[10px]" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5.2 4.1 7.1 8 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <form ref={formRef} className="p-[22px]">
          <div className="grid gap-x-[20px] gap-y-[14px] md:grid-cols-3">
            <LeadTextInput label="姓名" name="name" placeholder="请输入您的姓名" />
            <LeadTextInput
              label="联系电话"
              name="phone"
              placeholder="请输入手机号"
              required
              invalid={invalidContact}
              onInput={() => {
                if (invalidContact) setInvalidContact(false);
              }}
            />
            <LeadTextInput label="公司名称" name="company" placeholder="请输入公司名称" />
            <LeadTextInput label="所属行业" name="industry" placeholder="请输入所属行业" />
            <LeadTextInput label="设备工艺" name="process" placeholder="请输入设备工艺，如退火、回火、正火等.." />
            <LeadTextInput label="使用温度" name="temperature" placeholder="请输入温度，高温、低温℃" />
            <LeadTextInput className="md:col-span-3" label="设备需求" name="requirement" placeholder="请填写工艺、产能、材料、设备等详细需求..." />
            <div className="flex items-center justify-between md:col-span-3">
              <p className="text-[13px] text-[#98a1ad]">提交即表示同意《隐私政策》</p>
              <button
                className="h-[44px] w-[200px] rounded-[4px] bg-[#e60012] text-[15px] font-medium text-white transition hover:bg-[#c8000f] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? '提交中...' : '提交需求'}
              </button>
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
            <p className="text-[17px] leading-[1.7] text-[#1a1d23]">已收到您的非标需求，我们将在12小时内联系您</p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-6 h-[40px] min-w-[120px] rounded-[4px] bg-[#e60012] px-6 text-[14px] font-medium text-white transition hover:bg-[#c8000f]"
            >
              我知道了
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
