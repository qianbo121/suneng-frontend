import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { EngineeringInquiryForm } from './EngineeringInquiryForm';
import { inquiryCopy } from './engineering-content';
import styles from './EngineeringPage.module.css';

export function Section({
  id,
  title,
  intro,
  soft,
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
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.container}>
        <div className={styles.heading}>
          <h2 id={`${id}-title`}>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
export function AnchorNav({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <nav className={styles.nav} aria-label="页内导航">
      <div className={`${styles.container} ${styles.navInner}`}>
        {items.map(([id, label]) => (
          <a href={`#${id}`} key={id}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
export function Hero({
  eyebrow,
  title,
  text,
  note,
  image,
  alt,
  tags,
}: {
  eyebrow: string;
  title: string;
  text: string;
  note?: string;
  image: string;
  alt: string;
  tags?: string[];
}) {
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="page-title">
            <span>{title.startsWith('连续') ? '连续热处理生产线' : '工业炉维修、改造'}</span>
            <wbr />
            <span>{title.startsWith('连续') ? '解决方案' : '与大修服务'}</span>
          </h1>
          <p>{text}</p>
          {tags && (
            <>
              {note && <p className={styles.note}>{note}</p>}
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <span key={tag}>
                    <HiOutlineClipboardDocumentList aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
          <div className={styles.actions}>
            <WechatContactButton
              label="加微信，工况初判"
              className={styles.button}
              description="先发送照片和已知工况，技术人员再与您沟通需要补充的资料。"
            />
            <a className={styles.secondaryButton} href={title.startsWith('连续') ? '#fit' : '#scope'}>
              {title.startsWith('连续') ? '查看适用条件' : '查看服务范围'}
            </a>
          </div>
          {!tags && note && <p className={styles.note}>{note}</p>}
        </div>
        <div className={styles.heroMedia}>
          <Image src={image} alt={alt} fill priority sizes="(max-width: 767px) 100vw, 660px" />
        </div>
      </div>
    </section>
  );
}
export type InfoItem = { title: string; text?: string; items?: string[]; icon: IconType };
export function InfoColumns({ items }: { items: InfoItem[] }) {
  return (
    <div className={styles.columns}>
      {items.map(({ title, text, items: list, icon: Icon }) => (
        <article className={styles.column} key={title}>
          <Icon className={styles.icon} aria-hidden="true" />
          <div>
            <h3>{title}</h3>
            {text && <p>{text}</p>}
            {list && (
              <ul>
                {list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
export function InfoCards({ items, four = false }: { items: InfoItem[]; four?: boolean }) {
  return (
    <div className={`${styles.cards} ${four ? styles.fourCards : ''}`}>
      {items.map(({ title, text, icon: Icon }) => (
        <article className={styles.card} key={title}>
          <Icon className={styles.icon} aria-hidden="true" />
          <div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
export function FaqSection({
  title,
  faqs,
  defaultOpenIndex,
}: {
  title: string;
  faqs: { question: string; answer: string }[];
  defaultOpenIndex?: number;
}) {
  return (
    <Section id="faq" title={title}>
      <div className={styles.faqs} data-engineering-faq>
        {faqs.map((faq, index) => (
          defaultOpenIndex !== undefined ? (
            <details key={faq.question} className={`${styles.faq} ${styles.faqDisclosure}`} open={index === defaultOpenIndex}>
              <summary>
                <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span>{faq.question}</span>
                <svg className={styles.faqToggle} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M4 10h12" />
                  <path className={styles.faqToggleVertical} d="M10 4v12" />
                </svg>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ) : <article key={faq.question} className={styles.faq}>
            <span className={styles.number} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
export function Resources({
  title,
  items,
}: {
  title: string;
  items: { title: string; description: string; href: string; label: string }[];
}) {
  items = items.filter((item) => !isWithdrawnTechnicalPath(item.href));
  if (!items.length) return null;
  const icons = [HiOutlineBookOpen, HiOutlineDocumentText, HiOutlineClipboardDocumentList];
  return (
    <Section id="resources" title={title}>
      <div className={styles.cards}>
        {items.map((item, index) => {
          const Icon = icons[index % icons.length];
          return (
            <article className={styles.card} key={item.title}>
              <Icon className={styles.icon} aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link className={styles.textLink} href={item.href}>
                  {item.label}{' '}
                  <HiOutlineArrowRight
                    style={{ display: 'inline', width: 14 }}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
export function InquirySection({ kind }: { kind: 'line' | 'renovation' }) {
  const copy = inquiryCopy[kind];
  return (
    <section id="inquiry" className={styles.inquiry} aria-labelledby="inquiry-title">
      <div className={`${styles.container} ${styles.inquiryInner}`}>
        <div className={styles.inquiryCopy}>
          <h2 id="inquiry-title">{copy.title}</h2>
          <p>{copy.text}</p>
          <WechatContactButton
            label={copy.wechat}
            description={copy.text}
            className={styles.lightButton}
          />
        </div>
        <EngineeringInquiryForm kind={kind} />
      </div>
    </section>
  );
}
