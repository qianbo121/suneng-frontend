import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineArrowUpRight, HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhone } from 'react-icons/hi2';
import { RiWechatFill } from 'react-icons/ri';

import { SUNENG_CONTACT } from '@/constants/contact';
import { getContactFactoryMap } from '@/constants/contact-map';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ContactAction } from '@/components/lead/ContactAction';
import { AboutSubpageJsonLd } from './AboutSubpageJsonLd';
import { CopyContactButton } from './ContactActions';
import { ContactFactoryMap } from './ContactFactoryMap';
import styles from './ContactDesignA.module.css';

const factoryAddress = '江苏省泰州市姜堰区俞张线蔡官工业园区内';

export function ContactDesignA({ inquiryProduct, embedded = false }: { inquiryProduct?: string; embedded?: boolean }) {
  const contact = SUNENG_CONTACT;
  const factoryMap = getContactFactoryMap('zh');
  const Heading = embedded ? 'h2' : 'h1';
  return (
    <div lang="zh" className={styles.page} data-about-subpage="contact" data-contact-design="A">
      {!embedded && <AboutSubpageJsonLd locale="zh" title="联系我们" description="设备咨询、项目沟通与来厂联系。" path="/zh/contact" type="ContactPage" />}
      <header className={`${styles.container} ${styles.header}`}>
        {!embedded && <Breadcrumb locale="zh" items={[{ label: '关于苏能', href: '/zh/about' }, { label: '联系我们' }]} />}
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>CONTACT SUNENG</p>
            <Heading id="contact-title">联系我们</Heading>
            <p className={styles.description}>设备选型、生产线建设、维修改造及售后问题，欢迎联系苏能。</p>
          </div>
          <span className={styles.companyName}>{contact.company}</span>
        </div>
      </header>

      <div className={styles.container}>
        <section className={styles.contactStrip} aria-label="联系苏能">
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}><HiOutlinePhone aria-hidden="true" /></span>
            <div className={styles.contactDetails}>
              <h3>电话咨询</h3>
              <ContactAction kind="phone" locale="zh" className={styles.contactValue} trackingContext={{ pageType: '联系我们', properties: { position: 'contact_body_number', contact_purpose: 'sales' } }}>
                {contact.phone}
              </ContactAction>
              <CopyContactButton label="复制号码" value={contact.phone} contactKind="phone" />
            </div>
          </div>
          <div className={`${styles.contactItem} ${styles.wechatItem}`}>
            <span className={styles.contactIcon}><RiWechatFill aria-hidden="true" /></span>
            <div className={styles.contactDetails}>
              <h3>微信咨询</h3>
              <ContactAction kind="wechat" locale="zh" className={styles.contactValue} trackingContext={{ pageType: '联系我们', properties: { position: 'contact_body_wechat', contact_purpose: 'sales' } }}>
                {contact.wechatId}
              </ContactAction>
              <CopyContactButton label="复制微信号" value={contact.wechatId} contactKind="wechat" />
            </div>
            <a href={contact.wechatQr} target="_blank" rel="noopener noreferrer" className={styles.qrLink} aria-label="查看微信二维码原图">
              <Image src={contact.wechatQr} alt="苏能工业炉微信咨询二维码" width={96} height={96} sizes="96px" />
              <span>扫码添加微信</span>
            </a>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}><HiOutlineEnvelope aria-hidden="true" /></span>
            <div className={styles.contactDetails}>
              <h3>业务邮箱</h3>
              <ContactAction kind="email" locale="zh" className={`${styles.contactValue} ${styles.emailValue}`} trackingContext={{ pageType: '联系我们', properties: { position: 'contact_body_email', contact_purpose: 'sales' } }}>
                {contact.email}
              </ContactAction>
              <CopyContactButton label="复制邮箱" value={contact.email} contactKind="email" />
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.formPanel} aria-labelledby="contact-message-heading">
            <h3 id="contact-message-heading">留下您的需求</h3>
            <p className={styles.sectionIntro}>填写项目情况，方便我们与您沟通。</p>
            <HomepageLeadForm
              key={inquiryProduct ?? 'general'}
              locale="zh"
              inquiryProduct={inquiryProduct}
              layoutVariant="contact"
              privacyNoticeEnabled
              sectionId="contact-inquiry-form"
              pageType="联系我们"
              productTag="设备咨询与项目沟通"
              successProductTag="设备咨询与项目沟通"
              sourceModule="contact_message_form"
              inquiryHint=""
            />
          </section>

          <section className={styles.visitPanel} aria-labelledby="contact-address-heading">
            <div className={styles.visitHeading}>
              <div className={styles.visitTitle}>
                <h3 id="contact-address-heading">到厂交流</h3>
                <span className={styles.locationTag}>江苏 · 泰州</span>
              </div>
              <a className={styles.navigationButton} href={factoryMap.href} target="_blank" rel="noopener noreferrer" aria-label="立即导航到苏能厂区（百度地图，新窗口打开）">
                {'立即导航 >>'}
              </a>
            </div>
            <div className={styles.factoryCard}>
              <ContactFactoryMap locale="zh" showNavigationLink={false} />
              <div className={styles.addressCard}>
                <span className={styles.addressIcon}><HiOutlineMapPin aria-hidden="true" /></span>
                <address>
                  <span className={styles.addressRegion}>江苏省泰州市姜堰区</span>
                  <strong>俞张线 · 蔡官工业园区内</strong>
                </address>
                <div className={styles.addressActions}>
                  <CopyContactButton label="复制地址" value={factoryAddress} />
                </div>
              </div>
              <div className={styles.visitNote}>
                <span>来访前请先联系，确认接待安排</span>
                <ContactAction kind="phone" locale="zh" className={styles.visitPhone} trackingContext={{ pageType: '联系我们', properties: { position: 'contact_visit_phone', contact_purpose: 'sales' } }}>
                  <HiOutlinePhone aria-hidden="true" />{contact.phone}
                </ContactAction>
              </div>
            </div>
          </section>
        </div>
        <div className={styles.overseas}>
          <span>规划海外项目？</span>
          <Link href="/zh/service/installation-after-sales#overseas-delivery">查看交付核对清单 <HiOutlineArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  );
}
