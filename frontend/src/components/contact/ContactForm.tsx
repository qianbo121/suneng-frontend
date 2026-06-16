'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { safeSubmitContactMessage } from '@/lib/api/contact';
import { CONTACT_FORM_INITIAL_VALUES, validateContactForm } from '@/lib/contact-form';
import { ContactFormErrors, ContactFormValues } from '@/types/contact';
import { Locale } from '@/types/site';
import { cn } from '@/lib/utils';

type ContactFormProps = {
  locale: Locale;
  requireEmail?: boolean;
};

export function ContactForm({ locale, requireEmail = true }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(CONTACT_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const copy = useMemo(
    () => ({
      eyebrow: locale === 'en' ? 'Online Message' : '在线留言',
      title: locale === 'en' ? 'Leave Your Message' : '提交您的需求',
      description:
        locale === 'en'
          ? 'Tell us about your project, service request or cooperation plan. Our team will contact you as soon as possible.'
          : '欢迎提交项目需求、售后问题或合作意向，我们会尽快安排专人与您联系。',
      submit: locale === 'en' ? 'Submit Message' : '提交留言',
      submitting: locale === 'en' ? 'Submitting...' : '提交中...',
      success:
        locale === 'en'
          ? 'Your message has been submitted successfully. We will contact you soon.'
          : '留言提交成功，我们会尽快与您联系。',
      failure:
        locale === 'en'
          ? 'Submission failed. Please try again later.'
          : '提交失败，请稍后重试。',
      fields: {
        name: locale === 'en' ? 'Name *' : '姓名 *',
        email: requireEmail ? (locale === 'en' ? 'Email *' : '邮箱 *') : locale === 'en' ? 'Email' : '邮箱',
        phone: locale === 'en' ? 'Phone *' : '电话 *',
        company: locale === 'en' ? 'Company' : '公司名称',
        message: locale === 'en' ? 'Message *' : '留言内容 *',
      },
      placeholders: {
        name: locale === 'en' ? 'Please enter your name' : '请输入姓名',
        email: locale === 'en' ? 'Please enter your email' : '请输入邮箱',
        phone: locale === 'en' ? 'Please enter your phone number' : '请输入联系电话',
        company: locale === 'en' ? 'Please enter your company name' : '请输入公司名称',
        message:
          locale === 'en'
            ? 'Please describe your needs, model preferences or project information.'
            : '请描述您的需求、意向机型或项目情况。',
      },
    }),
    [locale, requireEmail],
  );

  const handleChange =
    (field: keyof ContactFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValues = {
        ...values,
        [field]: event.target.value,
      };

      setValues(nextValues);
      if (successMessage) setSuccessMessage('');
      if (errorMessage) setErrorMessage('');

      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const nextErrors = validateContactForm(locale, values, { requireEmail });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const result = await safeSubmitContactMessage({
      name: values.name.trim(),
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      company: values.company.trim() || undefined,
      message: values.message.trim(),
    });

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error || copy.failure);
      return;
    }

    setSuccessMessage(copy.success);
    setValues(CONTACT_FORM_INITIAL_VALUES);
    setErrors({});
  };

  const renderFieldError = (field: keyof ContactFormValues) =>
    errors[field] ? <p className="mt-2 text-sm text-brand-accent">{errors[field]}</p> : null;

  return (
    <section className="border border-[#e5eaf1] bg-white px-6 py-7 shadow-soft lg:px-8 lg:py-8">
      <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">{copy.eyebrow}</p>
      <h2 className="mt-3 text-[30px] font-semibold text-[#1d1f23]">{copy.title}</h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-8 text-neutral-700">{copy.description}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-900">{copy.fields.name}</label>
            <input
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange('name')}
              className={cn(
                'mt-2 h-12 w-full border bg-white px-4 text-sm text-neutral-900 outline-none transition',
                errors.name ? 'border-brand-accent' : 'border-[#dce3eb] focus:border-brand-primary',
              )}
              placeholder={copy.placeholders.name}
            />
            {renderFieldError('name')}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900">{copy.fields.email}</label>
            <input
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange('email')}
              className={cn(
                'mt-2 h-12 w-full border bg-white px-4 text-sm text-neutral-900 outline-none transition',
                errors.email ? 'border-brand-accent' : 'border-[#dce3eb] focus:border-brand-primary',
              )}
              placeholder={copy.placeholders.email}
            />
            {renderFieldError('email')}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900">{copy.fields.phone}</label>
            <input
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={handleChange('phone')}
              className={cn(
                'mt-2 h-12 w-full border bg-white px-4 text-sm text-neutral-900 outline-none transition',
                errors.phone ? 'border-brand-accent' : 'border-[#dce3eb] focus:border-brand-primary',
              )}
              placeholder={copy.placeholders.phone}
            />
            {renderFieldError('phone')}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900">{copy.fields.company}</label>
            <input
              type="text"
              autoComplete="organization"
              value={values.company}
              onChange={handleChange('company')}
              className="mt-2 h-12 w-full border border-[#dce3eb] bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-brand-primary"
              placeholder={copy.placeholders.company}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900">{copy.fields.message}</label>
          <textarea
            value={values.message}
            onChange={handleChange('message')}
            rows={6}
            className={cn(
              'mt-2 w-full border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition',
              errors.message ? 'border-brand-accent' : 'border-[#dce3eb] focus:border-brand-primary',
            )}
            placeholder={copy.placeholders.message}
          />
          {renderFieldError('message')}
        </div>

        {successMessage ? (
          <div className="border border-[rgba(0,75,151,0.18)] bg-[rgba(0,75,151,0.04)] px-4 py-3 text-sm text-brand-primary">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="border border-[rgba(230,0,18,0.18)] bg-[rgba(230,0,18,0.04)] px-4 py-3 text-sm text-brand-accent">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" size="lg" className="min-w-[168px]" disabled={isSubmitting}>
          {isSubmitting ? copy.submitting : copy.submit}
        </Button>
      </form>
    </section>
  );
}
