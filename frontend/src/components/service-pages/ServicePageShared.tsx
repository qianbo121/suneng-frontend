import type { CSSProperties, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineDocumentText, HiPhone } from 'react-icons/hi2';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { siteSettings } from '@/mock/siteSettings';
import { ServiceAnchorNav } from './ServiceAnchorNav';
import {
  serviceHeroAssets,
  servicePages,
  serviceRoutes,
  type FaqItem,
  type ServicePageKind,
  type TextItem,
} from './service-content';
import styles from './ServicePages.module.css';

export const serviceContact = {
  displayPhone: siteSettings.salesPhone.replace(/^\+86-?/, ''),
  phoneHref: `tel:${siteSettings.salesPhone.replace(/[^+\d]/g, '')}`,
};
export function ServiceContactButton({
  afterSales = false,
  label,
  light = false,
}: {
  afterSales?: boolean;
  label?: string;
  light?: boolean;
}) {
  return (
    <WechatContactButton
      label={label ?? (afterSales ? '联系售后' : '加微信，工况初判')}
      description={
        afterSales
          ? '请发送设备铭牌、故障现象、报警信息和现场照片，便于沟通维修、备件或现场服务安排。'
          : '请发送设备全景、铭牌和问题描述；图纸及历史记录可后续补充。'
      }
      className={`${styles.button} ${light ? styles.light : styles.primary}`}
    />
  );
}
export function ServiceHero({ kind }: { kind: ServicePageKind }) {
  const page = servicePages[kind];
  const asset = serviceHeroAssets[kind];
  return (
    <>
      <section
        className={styles.hero}
        aria-labelledby="service-title"
        style={
          {
            '--hero-focus': asset.desktopFocus,
            '--hero-mobile-focus': asset.mobileFocus,
          } as CSSProperties
        }
      >
        <div className={`${styles.heroMedia} ${kind === 'overview' ? styles.inspectionMedia : ''}`}>
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            priority
            sizes={kind === 'overview' ? '(max-width: 767px) 100vw, 65vw' : '100vw'}
            className={styles.heroImage}
          />
        </div>
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <h1 id="service-title">{page.title}</h1>
            <p>{page.description}</p>
            {page.note && <p className={styles.heroNote}>{page.note}</p>}
            <div className={styles.actions}>
              <ServiceContactButton afterSales={kind === 'installation'} />
              <Link href={page.secondary[1]} className={`${styles.button} ${styles.light}`}>
                {page.secondary[0]}
              </Link>
            </div>
            {kind === 'installation' && (
              <p className={styles.repairPrompt}>报修先发这四项，缺少的资料可在沟通中补充：</p>
            )}
            {page.tags.length > 0 && (
              <ul className={styles.tags}>
                {page.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <div className={styles.pathbar}>
        <div className={`${styles.container} ${styles.pathInner}`}>
          <nav className={styles.breadcrumb} aria-label="面包屑">
            <ol>
              <li>
                <Link href="/zh">首页</Link>
              </li>
              {kind !== 'overview' && (
                <li>
                  <Link href={serviceRoutes.overview}>改造与服务</Link>
                </li>
              )}
              <li aria-current="page">{page.breadcrumb}</li>
            </ol>
          </nav>
          {page.nav.length > 0 && <ServiceAnchorNav items={page.nav} />}
        </div>
      </div>
    </>
  );
}
export function ServiceSection({
  id,
  title,
  intro,
  soft = false,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  soft?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${styles.section} ${soft ? styles.soft : ''}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className={styles.container}>
        <header className={styles.heading}>
          <h2 id={`${id}-heading`}>{title}</h2>
          {intro && <p>{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
export function ServiceSteps({ items }: { items: readonly TextItem[] }) {
  return (
    <ol className={styles.steps}>
      {items.map((item, i) => (
        <li key={item.title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
export function ServiceInfoCards({
  items,
  icons = [],
  strip = false,
  two = false,
}: {
  items: readonly TextItem[];
  icons?: IconType[];
  strip?: boolean;
  two?: boolean;
}) {
  return (
    <div className={strip ? styles.infoStrip : two ? styles.warrantyGrid : styles.deliveryGrid}>
      {items.map((item, i) => {
        const Icon = icons[i] ?? HiOutlineDocumentText;
        return (
          <article className={strip ? styles.infoItem : styles.deliveryCard} key={item.title}>
            <Icon className={styles.icon} aria-hidden="true" />
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
export function ServiceTable({
  headers,
  rows,
  numbered = false,
  label,
}: {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
  numbered?: boolean;
  label: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} aria-label={label}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[0]}>
              {row.map((value, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {numbered && (
                      <span className={styles.tableNumber} aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                    {value}
                  </th>
                ) : (
                  <td key={j} data-label={headers[j]}>
                    {value}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ServiceFaq({
  title,
  items,
  soft = false,
}: {
  title: string;
  items: readonly FaqItem[];
  soft?: boolean;
}) {
  return (
    <ServiceSection id="questions" title={title} soft={soft}>
      <div className={styles.faqGrid}>
        {items.map((item) => (
          <article key={item.question} className={styles.faq} data-service-faq>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </ServiceSection>
  );
}
export function ServiceContact({ kind }: { kind: ServicePageKind }) {
  const page = servicePages[kind];
  return (
    <section
      id="service-contact"
      className={`${styles.contact} ${kind === 'relocation' ? styles.contactSoft : ''}`}
      aria-labelledby="service-contact-heading"
    >
      <div className={`${styles.container} ${styles.contactInner}`}>
        <div className={styles.contactCopy}>
          <h2 id="service-contact-heading">{page.contactTitle}</h2>
          <p>{page.contactText}</p>
          {page.contactNote && <p>{page.contactNote}</p>}
        </div>
        <div className={styles.contactAside}>
          <div className={styles.actions}>
            <ServiceContactButton afterSales={kind === 'installation'} />
            <a
              href={serviceContact.phoneHref}
              className={`${styles.button} ${kind === 'relocation' ? styles.outline : styles.light}`}
            >
              拨打电话
            </a>
          </div>
          <a href={serviceContact.phoneHref} className={styles.contactPhone}>
            <HiPhone aria-hidden="true" />
            {serviceContact.displayPhone}
          </a>
        </div>
      </div>
    </section>
  );
}
