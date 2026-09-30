'use client';

import { useRef, useState } from 'react';

export function ManufacturerFaqs({ items }: { items: { question: string; answer: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [allOpen, setAllOpen] = useState(false);
  const syncOpen = () => {
    const details = Array.from(root.current?.querySelectorAll('details') ?? []);
    setAllOpen(details.length > 0 && details.every((detail) => detail.open));
  };
  const toggleAll = () => {
    const expand = !allOpen;
    root.current?.querySelectorAll('details').forEach((detail) => {
      detail.open = expand;
    });
    setAllOpen(expand);
  };

  return (
    <>
      <div className="faq-tools">
        <button type="button" className="faq-toggle" aria-expanded={allOpen} onClick={toggleAll}>
          {allOpen ? '收起全部回答' : '展开全部回答'}
        </button>
      </div>
      <div className="faq" ref={root}>
        {items.map((item) => (
          <details key={item.question} onToggle={syncOpen}>
            <summary>
              {item.question}
              <span className="plus" aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
