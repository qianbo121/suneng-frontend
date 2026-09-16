'use client';

import { useEffect, useState } from 'react';
import styles from './ServicePages.module.css';

export function ServiceAnchorNav({ items }: { items: readonly (readonly [string, string])[] }) {
  const [active, setActive] = useState(items[0]?.[0]);
  useEffect(() => {
    const update = () => {
      const current = items
        .filter(([id]) => {
          const element = document.getElementById(id);
          return element && element.getBoundingClientRect().top <= 210;
        })
        .at(-1);
      setActive(current?.[0] ?? items[0]?.[0]);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [items]);
  return (
    <nav className={styles.anchorNav} aria-label="页内导航">
      {items.map(([id, label]) => (
        <a href={`#${id}`} key={id} aria-current={id === active ? 'location' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}
