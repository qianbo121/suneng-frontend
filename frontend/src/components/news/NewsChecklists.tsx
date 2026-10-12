import Link from 'next/link';
import { HiOutlineChevronRight, HiOutlineDocumentText } from 'react-icons/hi2';
import styles from './NewsChecklists.module.css';

type Props = {
  title: string;
  previewLabel: string;
  tools: Array<{ title: string; href: string }>;
  className?: string;
};

export function NewsChecklists({ title, previewLabel, tools, className = '' }: Props) {
  return (
    <section className={`${styles.module} ${className}`} aria-labelledby="news-tools-title">
      <h2 id="news-tools-title" className={styles.moduleTitle}>{title}</h2>
      <div className={styles.rows}>
        {tools.map((tool) => (
          <Link key={tool.title} className={styles.row} href={tool.href}>
            <span className={styles.icon}>
              <HiOutlineDocumentText aria-hidden="true" />
            </span>
            <div className={styles.copy}>
              <h3>{tool.title}</h3>
              <span className={styles.preview}>{previewLabel}</span>
            </div>
            <HiOutlineChevronRight className={styles.chevron} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
