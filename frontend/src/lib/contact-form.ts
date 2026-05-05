import { ContactFormErrors, ContactFormValues } from '@/types/contact';
import { Locale } from '@/types/site';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CONTACT_FORM_INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
};

export function validateContactForm(locale: Locale, values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const isEnglish = locale === 'en';

  if (!values.name.trim()) {
    errors.name = isEnglish ? 'Please enter your name.' : '请输入姓名。';
  }

  if (!values.email.trim()) {
    errors.email = isEnglish ? 'Please enter your email.' : '请输入邮箱。';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = isEnglish ? 'Please enter a valid email address.' : '请输入正确的邮箱格式。';
  }

  if (!values.phone.trim()) {
    errors.phone = isEnglish ? 'Please enter your phone number.' : '请输入电话。';
  }

  if (!values.message.trim()) {
    errors.message = isEnglish ? 'Please enter your message.' : '请输入留言内容。';
  } else if (values.message.trim().length < 10) {
    errors.message = isEnglish ? 'Message must be at least 10 characters.' : '留言内容至少 10 个字。';
  }

  return errors;
}

