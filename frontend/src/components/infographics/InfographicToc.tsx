'use client';

import type { Locale } from '@/types/site';
import { useEffect, useState } from 'react';
import styles from './InfographicDetail.module.css';

const sections = [
  ['intro', '图文导读', 'Overview'],
  ['graphic', '完整图解', 'Illustrated guide'],
  ['keypoints', '图中文字要点', 'Equipment selection details'],
  ['conditions', '适用说明', 'Application notes'],
] as const;

export function InfographicToc({ locale = 'zh' }: { locale?: Locale }) {
  const [active, setActive] = useState<string>('intro');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = window.innerWidth < 1280 ? 110 : 136;
      let current: string = 'intro';
      for (const [id] of sections) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold)
          current = id;
      }
      if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4)
        current = 'conditions';
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <nav className={styles.toc} aria-label={locale === 'en' ? 'On this page' : '本页目录'}>
      {sections.map(([id, zh, en]) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const target = document.getElementById(id);
            if (!target) return;
            event.preventDefault();
            history.replaceState(history.state, '', `#${id}`);
            target.scrollIntoView({
              behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
            });
          }}
          className={active === id ? styles.current : undefined}
          aria-current={active === id ? 'location' : undefined}
        >
          {locale === 'en' ? en : zh}
        </a>
      ))}
    </nav>
  );
}
