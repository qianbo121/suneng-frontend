type NewsArticleContentProps = {
  html: string;
};

export function NewsArticleContent({ html }: NewsArticleContentProps) {
  return (
    <div
      className={`${styles.content} news-article max-w-none text-[15px] leading-8 text-neutral-700`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
import styles from './NewsArticleContent.module.css';
