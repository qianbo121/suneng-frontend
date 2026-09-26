'use client';

import { useEffect, useRef, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

import type { Locale } from '@/types/site';
import styles from './NewsArticleToc.module.css';

type Heading = { id: string; title: string };

export function NewsArticleToc({
  contentId,
  locale,
  mobile = false,
}: {
  contentId: string;
  locale: Locale;
  mobile?: boolean;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState('');
  const [docked, setDocked] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const label = locale === 'en' ? 'On this page' : '文章目录';

  useEffect(() => {
    const content = document.getElementById(contentId);
    if (!content) return;
    const elements = Array.from(content.querySelectorAll<HTMLElement>('h2'));
    if (!elements.length) elements.push(...content.querySelectorAll<HTMLElement>('h3'));
    const items = elements
      .filter((element) => element.textContent?.trim())
      .map((element, index) => {
        if (!element.id) {
          let id = `${contentId}-section-${index + 1}`;
          while (document.getElementById(id)) id += '-heading';
          element.id = id;
        }
        return { id: element.id, title: element.textContent!.trim() };
      });
    setHeadings(items);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = Number.parseFloat(getComputedStyle(content).scrollMarginTop) || 112;
        let current = items[0]?.id || '';
        for (const item of items) {
          if (
            (document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity) <=
            top + 24
          ) {
            current = item.id;
          }
        }
        setActive(current);
        // Let the lower cards leave naturally before docking the directory.
        // This keeps a long sticky directory from covering recommendations or contact controls.
        if (!mobile) {
          const cards = document.querySelector('[data-news-sidebar-cards]');
          setDocked(!cards || cards.getBoundingClientRect().bottom <= top - 16);
        }
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [contentId, mobile]);

  if (!headings.length) return null;

  const links = (
    <nav aria-label={label} className={styles.links}>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          aria-current={active === heading.id ? 'location' : undefined}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (mobile && detailsRef.current) detailsRef.current.open = false;
            const target = document.getElementById(heading.id);
            if (!target) return;
            event.preventDefault();
            history.replaceState(history.state, '', `#${heading.id}`);
            const offset = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 112;
            window.scrollTo({
              top: window.scrollY + target.getBoundingClientRect().top - offset,
              behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
            });
            target.tabIndex = -1;
            target.focus({ preventScroll: true });
            setActive(heading.id);
          }}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );

  if (mobile) {
    return (
      <details ref={detailsRef} className={styles.mobile}>
        <summary>
          {label}
          <HiChevronDown aria-hidden="true" />
        </summary>
        {links}
      </details>
    );
  }

  return (
    <section className={styles.desktop} data-docked={docked || undefined} aria-label={label}>
      <h2>{label}</h2>
      {links}
    </section>
  );
}
