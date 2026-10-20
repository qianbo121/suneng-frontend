import { corePageText } from '@/lib/core-page-localization';
import type { Locale } from '@/types/site';
import Image from 'next/image';
import Link from 'next/link';
import { siteSettings } from '@/mock/siteSettings';
import { SUNENG_CONTACT } from '@/constants/contact';
import { TrackedContactLink } from '@/components/lead/TrackedContactLink';
import { AboutSubpageHeader } from './AboutSubpageHeader';
import { AboutSubpageJsonLd } from './AboutSubpageJsonLd';
import { ContactMessageForm, ContactPhoneButton, CopyContactButton } from './ContactActions';
import { ContactDesignA } from './ContactDesignA';
import { ContactFactoryMap } from './ContactFactoryMap';
import styles from './AboutSubpages.module.css';

export function ContactZhContent({ locale = 'zh', inquiryProduct, embedded = false }: { locale?: Locale; inquiryProduct?: string; embedded?: boolean }) {
  if (locale === 'zh') return <ContactDesignA embedded={embedded} inquiryProduct={inquiryProduct} />;
  const t = (text: string) => corePageText(text, locale);
  const contact = locale === 'en' ? { ...SUNENG_CONTACT, company: siteSettings.companyName.en, phone: siteSettings.salesPhone, address: siteSettings.address.en } : SUNENG_CONTACT;
  return (
    <div lang={locale} className={styles.page} data-about-subpage="contact">
      {!embedded && <AboutSubpageJsonLd locale={locale}
        title={t("联系我们")}
        description={t("设备咨询、项目沟通与来厂联系。")}
        path={t("/zh/contact")}
        type="ContactPage"
      />}
      <AboutSubpageHeader embedded={embedded} locale={locale} plain title={t("联系我们")} description={t("设备咨询、项目沟通与来厂联系。")} />
      <div className={`${styles.container} ${styles.contactBody}`}>
        <section className={styles.contactPanel} aria-label={t("电话与微信咨询")}>
          <div className={styles.phone}>
            <h2>{contact.company}</h2>
            <p className={styles.contactLabel}>{t("设备咨询")}</p>
            <TrackedContactLink kind="phone" position="contact_body_number" purpose="sales" href={contact.phoneHref} className={styles.phoneNumber}>
              {contact.phone}
            </TrackedContactLink>
            <div className={styles.actions}>
              <ContactPhoneButton locale={locale} href={contact.phoneHref} />
              <CopyContactButton locale={locale} label={t("复制号码")} value={contact.phone} contactKind="phone" />
            </div>
          </div>
          <div className={styles.wechat}>
            <h2>{t("微信咨询")}</h2>
              <Image
                src={contact.wechatQr}
                alt={t("苏能工业炉微信咨询二维码")}
                width={200}
                height={200}
                priority
                sizes="200px"
              />
            <p>{locale === 'en' ? 'Scan the code or press and hold to save it, then send workpiece photos and requirements.' : '扫码或长按保存二维码后，可发送工件照片与需求。'}</p>
          </div>
          <div className={styles.email}>
            <h2 className={styles.contactLabel}>{t("业务邮箱")}</h2>
            <div className={styles.emailRow}>
              <TrackedContactLink kind="email" position="contact_body_email" purpose="sales" className={styles.emailLink} href={`mailto:${contact.email}`}>
                {contact.email}
              </TrackedContactLink>
              <CopyContactButton locale={locale} label={t("复制邮箱")} value={contact.email} contactKind="email" />
            </div>
          </div>
        </section>
        <p>
          <Link className={`${styles.textLink} ${styles.deliveryLink}`} href={`/${locale}/service/installation-after-sales#overseas-delivery`}>
            {locale === 'en' ? 'Planning an overseas project? View the delivery checklist.' : '规划海外项目？查看交付核对清单。'}
          </Link>
        </p>
        <section className={styles.address} aria-labelledby="contact-address-heading">
          <h2 id="contact-address-heading">{t("到厂地址")}</h2>
          <div>
            <p>{contact.address}</p>
            <small>{t("来访前可先电话沟通。")}</small>
          </div>
          <div className={styles.actions}>
            <CopyContactButton locale={locale} label={t("复制地址")} value={contact.address} />
          </div>
        </section>
        <ContactFactoryMap locale={locale} />
        <ContactMessageForm key={inquiryProduct ?? 'general'} locale={locale} inquiryProduct={inquiryProduct} />
      </div>
    </div>
  );
}
