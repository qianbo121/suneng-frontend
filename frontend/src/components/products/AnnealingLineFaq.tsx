'use client';

import { type KeyboardEvent, useId, useRef, useState } from 'react';

type FaqItem = {
  question: string;
  answer: string;
};

type AnnealingLineFaqProps = {
  items: readonly FaqItem[];
  styles: Record<string, string>;
};

export function AnnealingLineFaq({ items, styles }: AnnealingLineFaqProps) {
  const idPrefix = useId();
  const [openIndex, setOpenIndex] = useState(items.length ? 0 : -1);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!items.length) return;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`${styles.faqList ?? ''} divide-y divide-[#dfe5ee]`}>
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        const buttonId = `${idPrefix}-faq-button-${index}`;
        const panelId = `${idPrefix}-faq-panel-${index}`;
        return (
          <div key={item.question} className={`${styles.faqItem ?? ''} py-1`}>
            <h3>
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={`${styles.faqQuestion ?? ''} flex min-h-12 w-full items-center justify-between gap-5 py-5 text-left text-[15px] font-semibold leading-[1.55] text-[#101828] outline-none transition hover:text-[#2456cc] focus-visible:ring-2 focus-visible:ring-[#2f65e7] focus-visible:ring-offset-2`}
              >
                <span className="flex min-w-0 items-start gap-4">
                  <span className="shrink-0 text-[12px] font-semibold text-[#2f65e7]">
                    Q{String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item.question}</span>
                </span>
                <span className="shrink-0 text-[18px] font-normal text-[#667085]" aria-hidden="true">
                  {isOpen ? '−' : '＋'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`${styles.faqAnswer ?? ''} pb-5 pl-11 pr-10 text-[14px] leading-[1.8] text-[#596579]`}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
