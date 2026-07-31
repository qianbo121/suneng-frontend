'use client';

import { type ReactNode, useId, useState } from 'react';

export type GeoFaqClientItem = {
  question: string;
  answer: ReactNode;
};

export function GeoFaqGridClient({
  items,
  openMode,
}: {
  items: GeoFaqClientItem[];
  openMode: 'all' | 'first';
}) {
  const idPrefix = useId();
  const [openItems, setOpenItems] = useState<Set<number>>(
    () =>
      new Set(openMode === 'all' ? items.map((_, index) => index) : items.length > 0 ? [0] : []),
  );

  const toggleItem = (index: number) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div
      className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {items.map((faq, index) => {
        const isOpen = openItems.has(index);
        const questionId = `${idPrefix}-question-${index}`;
        const answerId = `${idPrefix}-answer-${index}`;

        return (
          <article
            key={faq.question}
            className="rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,35,75,0.03)]"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <button
              id={questionId}
              type="button"
              className="flex min-h-11 w-full items-center justify-between gap-4 text-left text-[16px] font-semibold leading-[1.6] text-[#101828]"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => toggleItem(index)}
            >
              <span itemProp="name">{faq.question}</span>
              <span
                aria-hidden="true"
                className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dfe6f0]"
              >
                <span className="absolute h-[2px] w-3 rounded-full bg-[#c51624]" />
                {!isOpen ? (
                  <span className="absolute h-3 w-[2px] rounded-full bg-[#c51624]" />
                ) : null}
              </span>
            </button>
            <div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              hidden={!isOpen}
              className="mt-4 border-t border-[#edf1f6] pt-4"
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
                {faq.answer}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
