import Image from 'next/image';
import Link from 'next/link';

import { trackLeadEvent } from '@/lib/api/lead-events';
import { siteSettings } from '@/mock/siteSettings';

import styles from './AboutFooter.module.css';

type AboutFooterProps = {
  navigation: readonly { label: string; href: string }[];
  copyright: string;
  policeBeian: string;
  policeBeianUrl: string;
  icpUrl: string;
};

export function AboutFooter({
  navigation,
  copyright,
  policeBeian,
  policeBeianUrl,
  icpUrl,
}: AboutFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/zh" aria-label="苏能工业炉首页">
              <Image
                src="/images/brand/sn-logo-white-transparent.png"
                alt="苏能工业炉"
                width={203}
                height={114}
                className={styles.logo}
              />
            </Link>
            <p>专业的工业炉设备制造商，提供设计、制造、安装调试与改造服务。</p>
            <p>成立于 2006 年 · 江苏泰州</p>
          </div>
          <nav aria-label="页脚导航">
            <h2>站内导航</h2>
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <h2>联系我们</h2>
            <div className={styles.qrGroup}>
              {[
                { src: siteSettings.wechatQrCode, label: '微信二维码' },
                { src: '/images/footer/douyin-qr.png', label: '抖音二维码' },
              ].map((item) => (
                <figure key={item.src}>
                  <Image src={item.src} alt={item.label} width={112} height={112} />
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className={styles.contact}>
            <h2>联系信息</h2>
            <a href={`mailto:${siteSettings.email}`} onClick={() => trackLeadEvent('email_click')}>
              {siteSettings.email}
            </a>
            <a
              href={`tel:${siteSettings.salesPhone}`}
              onClick={() => trackLeadEvent('phone_click')}
            >
              {siteSettings.salesPhone.replace(/^\+86-?/, '')}
            </a>
            <p>泰州姜堰区张甸蔡官工业区</p>
          </div>
        </div>
        <div className={styles.legal}>
          <span>{copyright}</span>
          <a href={icpUrl} target="_blank" rel="noopener noreferrer">
            {siteSettings.icp}
          </a>
          <a href={policeBeianUrl} target="_blank" rel="noopener noreferrer">
            {policeBeian}
          </a>
        </div>
      </div>
    </footer>
  );
}
