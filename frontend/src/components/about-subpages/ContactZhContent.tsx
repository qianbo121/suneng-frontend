import { corePageText } from '@/lib/core-page-localization';
import type { Locale } from '@/types/site';
import Image from 'next/image';
import Link from 'next/link';
import { siteSettings } from '@/mock/siteSettings';
import { Button } from '@/components/ui/Button';
import { SUNENG_CONTACT } from '@/constants/contact';
import { AboutSubpageHeader } from './AboutSubpageHeader';
import { AboutSubpageJsonLd } from './AboutSubpageJsonLd';
import { ContactMessageForm, ContactPhoneButton, CopyContactButton } from './ContactActions';
import { OriginalImageLink } from './OriginalImageLink';
import styles from './AboutSubpages.module.css';

export function ContactZhContent({ locale = 'zh', inquiryProduct }: { locale?: Locale; inquiryProduct?: string }) {
  const t = (text: string) => corePageText(text, locale);
  const contact = locale === 'en' ? { ...SUNENG_CONTACT, company: siteSettings.companyName.en, phone: siteSettings.salesPhone, address: siteSettings.address.en } : SUNENG_CONTACT;
  return (
    <div lang={locale} className={styles.page} data-about-subpage="contact">
      <AboutSubpageJsonLd locale={locale}
        title={t("联系我们")}
        description={t("设备咨询、项目沟通与来厂联系。")}
        path={t("/zh/contact")}
        type="ContactPage"
      />
      <AboutSubpageHeader locale={locale} plain title={t("联系我们")} description={t("设备咨询、项目沟通与来厂联系。")} />
      <div className={`${styles.container} ${styles.contactBody}`}>
        <section className={styles.contactPanel} aria-label={t("电话与微信咨询")}>
          <div className={styles.phone}>
            <h2>{contact.company}</h2>
            <p className={styles.contactLabel}>{t("设备咨询")}</p>
            <a href={contact.phoneHref} className={styles.phoneNumber}>
              {contact.phone}
            </a>
            <div className={styles.actions}>
              <ContactPhoneButton locale={locale} href={contact.phoneHref} />
              <CopyContactButton locale={locale} label={t("复制号码")} value={contact.phone} />
            </div>
          </div>
          <div className={styles.wechat}>
            <h2>{t("微信咨询")}</h2>
            <OriginalImageLink locale={locale} src={contact.wechatQr} alt={t("苏能工业炉微信二维码")} wechat>
              <Image
                src={contact.wechatQr}
                alt={t("苏能工业炉微信咨询二维码")}
                width={200}
                height={200}
                priority
                sizes="200px"
              />
            </OriginalImageLink>
            <p>{t("扫码后可发送工件照片与需求。")}</p>
          </div>
          <div className={styles.email}>
            <h2 className={styles.contactLabel}>{t("业务邮箱")}</h2>
            <div className={styles.emailRow}>
              <a className={styles.emailLink} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <CopyContactButton locale={locale} label={t("复制邮箱")} value={contact.email} />
            </div>
          </div>
        </section>
        <p>
          <Link className={styles.emailLink} href={`/${locale}/service/installation-after-sales#overseas-delivery`}>
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
            <Button
              className={styles.actionButton}
              href={contact.mapHref}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("打开地图导航 ↗")}</Button>
          </div>
        </section>
        <ContactMessageForm key={inquiryProduct ?? 'general'} locale={locale} inquiryProduct={inquiryProduct} />
      </div>
    </div>
  );
}
