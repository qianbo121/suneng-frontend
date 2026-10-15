import { siteSettings } from '@/mock/siteSettings';

export function InquiryPrivacyNotice({ locale }: { locale: 'zh' | 'en' }) {
  const english = locale === 'en';
  const linkClassName = 'text-[#1d4ed8] underline underline-offset-[3px] hover:text-[#143f83] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <p>
      {english
        ? 'The name, contact details, company information and project requirements you provide are used only to respond to your inquiry, evaluate a furnace solution and continue project communication. To request access, correction or deletion, contact '
        : '您提交的姓名、联系方式、公司与项目需求仅用于回复询盘、评估设备方案及后续沟通。如需查询、更正或删除已提交信息，请联系 '}
      <a className={linkClassName} href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
      {english
        ? '. Do not submit unrelated sensitive personal information.'
        : '。请勿提交与项目无关的敏感个人信息。'}
    </p>
  );
}
