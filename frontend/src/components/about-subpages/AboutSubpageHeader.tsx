import type { ReactNode } from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import styles from './AboutSubpages.module.css';

export function AboutSubpageHeader({
  title,
  description,
  action,
  plain = false,
  locale = 'zh',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  plain?: boolean;
  locale?: 'zh' | 'en';
}) {
  return (
    <header className={`${styles.pageHeader} ${plain ? styles.plainHeader : ''}`}>
      <div className={styles.container}>
        <div className={styles.breadcrumbRow}>
          <Breadcrumb
            locale={locale}
            currentLabel={title}
            tone="dark"
            items={[{ label: locale === 'en' ? 'About Suneng' : '关于苏能', href: `/${locale}/about` }, { label: title }]}
          />
        </div>
        <div className={styles.headingRow}>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {action}
        </div>
      </div>
    </header>
  );
}
