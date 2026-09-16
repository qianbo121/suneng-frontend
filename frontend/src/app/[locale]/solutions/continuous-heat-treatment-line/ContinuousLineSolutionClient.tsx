'use client';

import { useId, useState } from 'react';

import styles from './ContinuousLineSolution.module.css';

export type ContinuousLineFaqItem = {
  question: string;
  answer: string;
};

export function ContinuousLineFaq({ items }: { items: ContinuousLineFaqItem[] }) {
  const idPrefix = useId();
  const [openItems, setOpenItems] = useState<boolean[]>(() => items.map((_, index) => index === 2));

  return (
    <div className={styles.faqList} itemScope itemType="https://schema.org/FAQPage">
      {items.map((item, index) => {
        const isOpen = openItems[index] ?? false;
        const questionId = `${idPrefix}-question-${index}`;
        const answerId = `${idPrefix}-answer-${index}`;

        return (
          <article
            key={item.question}
            className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 className={styles.faqQuestionHeading}>
              <button
                id={questionId}
                type="button"
                className={styles.faqButton}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() =>
                  setOpenItems((current) =>
                    current.map((open, itemIndex) => (itemIndex === index ? !open : open)),
                  )
                }
              >
                <span className={styles.faqNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.faqQuestion} itemProp="name">
                  {item.question}
                </span>
                <svg
                  className={styles.faqArrow}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m7 9.5 5 5 5-5" />
                </svg>
              </button>
            </h3>
            <div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              hidden={!isOpen}
              className={styles.faqAnswer}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p itemProp="text">{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
