'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

type FurnaceTab = { id: string; label: string; content: ReactNode };

export function FurnaceGuideTabs({ items }: { items: FurnaceTab[] }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index + items.length - 1) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <>
      <div className="furnace-tabs" role="tablist" aria-label="按炉型查看参数">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            id={`${item.id}-tab`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={item.id}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          id={item.id}
          className="furnace-panel"
          role="tabpanel"
          aria-labelledby={`${item.id}-tab`}
          hidden={active !== index}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </>
  );
}
