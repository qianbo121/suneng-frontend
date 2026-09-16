import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SUNENG_CONTACT } from '@/constants/contact';
import { AboutSubpageHeader } from './AboutSubpageHeader';
import { AboutSubpageJsonLd } from './AboutSubpageJsonLd';
import { ContactMessageForm, ContactPhoneButton, CopyContactButton } from './ContactActions';
import { OriginalImageLink } from './OriginalImageLink';
import styles from './AboutSubpages.module.css';

export function ContactZhContent() {
  const contact = SUNENG_CONTACT;
  return (
    <div className={styles.page} data-about-subpage="contact">
      <AboutSubpageJsonLd
        title="联系我们"
        description="设备咨询、项目沟通与来厂联系。"
        path="/zh/contact"
        type="ContactPage"
      />
      <AboutSubpageHeader plain title="联系我们" description="设备咨询、项目沟通与来厂联系。" />
      <div className={`${styles.container} ${styles.contactBody}`}>
        <section className={styles.contactPanel} aria-label="电话与微信咨询">
          <div className={styles.phone}>
            <h2>{contact.company}</h2>
            <p className={styles.contactLabel}>设备咨询</p>
            <a href={contact.phoneHref} className={styles.phoneNumber}>
              {contact.phone}
            </a>
            <div className={styles.actions}>
              <ContactPhoneButton href={contact.phoneHref} />
              <CopyContactButton label="复制号码" value={contact.phone} />
            </div>
          </div>
          <div className={styles.wechat}>
            <h2>微信咨询</h2>
            <OriginalImageLink src={contact.wechatQr} alt="苏能工业炉微信二维码" wechat>
              <Image
                src={contact.wechatQr}
                alt="苏能工业炉微信咨询二维码"
                width={200}
                height={200}
                priority
                sizes="200px"
              />
            </OriginalImageLink>
            <p>扫码后可发送工件照片与需求。</p>
          </div>
          <div className={styles.email}>
            <h2 className={styles.contactLabel}>业务邮箱</h2>
            <div className={styles.emailRow}>
              <a className={styles.emailLink} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <CopyContactButton label="复制邮箱" value={contact.email} />
            </div>
          </div>
        </section>
        <section className={styles.address} aria-labelledby="contact-address-heading">
          <h2 id="contact-address-heading">到厂地址</h2>
          <div>
            <p>{contact.address}</p>
            <small>来访前可先电话沟通。</small>
          </div>
          <div className={styles.actions}>
            <CopyContactButton label="复制地址" value={contact.address} />
            <Button
              className={styles.actionButton}
              href={contact.mapHref}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              打开地图导航 ↗
            </Button>
          </div>
        </section>
        <ContactMessageForm />
      </div>
    </div>
  );
}
