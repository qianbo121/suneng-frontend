import styles from './page.module.css';

export function MeasuredText({ text }: { text: string }) {
  const parts = text.split(/([±≤]?\d+(?:\s*[～–]\s*\d+)?\s*(?:℃|公斤\/小时|kg\/h))/g);
  return <>{parts.map((part, index) => index % 2 ? <span className={styles.word} key={index}>{part}</span> : part)}</>;
}
