'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './PitFurnaceDetailPage.module.css';

export function FurnaceSectionNav({
  items,
  label,
}: {
  items: readonly (readonly [string, string])[];
  label: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.[0]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const sections = items.flatMap(([id]) => {
      const element = document.getElementById(id);
      return element ? [{ id, element }] : [];
    });
    let frame = 0;

    const update = () => {
      frame = 0;
      const navBottom = (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight;
      const pagePadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      let current = sections[0]?.id;
      for (const { id, element } of sections) {
        // Match anchor landing positions as well as manual scrolling.
        const threshold = Math.max(
          navBottom + 24,
          pagePadding + (parseFloat(getComputedStyle(element).scrollMarginTop) || 0),
        );
        if (element.getBoundingClientRect().top <= threshold + 1) current = id;
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = sections.at(-1)?.id ?? current;
      }
      setActiveId(current);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(nav);
    sections.forEach(({ element }) => observer.observe(element));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', scheduleUpdate);
    };
  }, [items]);

  useEffect(() => {
    const revealActiveLink = () => {
      const scroller = scrollRef.current;
      const link = scroller?.querySelector<HTMLElement>('[aria-current="location"]');
      if (!scroller || !link) return;
      const viewport = scroller.getBoundingClientRect();
      const target = link.getBoundingClientRect();
      const offset = target.left < viewport.left
        ? target.left - viewport.left
        : target.right > viewport.right
          ? target.right - viewport.right
          : 0;
      if (offset) scroller.scrollBy({ left: offset, behavior: 'instant' });
    };
    revealActiveLink();
    window.addEventListener('resize', revealActiveLink);
    return () => window.removeEventListener('resize', revealActiveLink);
  }, [activeId]);

  return (
    <nav ref={navRef} className={styles.anchorNav} aria-label={label}>
      <div className={styles.container}>
        <div ref={scrollRef} className={styles.anchorNavScroll}>
          {items.map(([id, title]) => (
            <a key={id} href={`#${id}`} aria-current={id === activeId ? 'location' : undefined}>
              {title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
