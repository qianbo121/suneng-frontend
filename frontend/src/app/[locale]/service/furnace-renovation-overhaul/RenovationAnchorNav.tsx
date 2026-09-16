'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './FurnaceRenovationPage.module.css';
import { RenovationCta } from './RenovationContactActions';

const anchorLinks = [
  { id: 'overview', label: '概览' },
  { id: 'fit', label: '适不适合' },
  { id: 'project', label: '项目参考' },
  { id: 'scope', label: '怎么改' },
  { id: 'decision', label: '怎么判断' },
  { id: 'process', label: '怎么合作' },
  { id: 'acceptance', label: '验收与质保' },
  { id: 'faq', label: '常见问题' },
  { id: 'resources', label: '延伸阅读' },
] as const;

const ACTIVE_OFFSET = 160;

export function RenovationAnchorNav() {
  const linksRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<(typeof anchorLinks)[number]['id']>('overview');
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });

  const updateScrollEdges = useCallback(() => {
    const links = linksRef.current;
    if (!links) return;

    const nextEdges = {
      left: links.scrollLeft > 2,
      right: links.scrollLeft + links.clientWidth < links.scrollWidth - 2,
    };

    setScrollEdges((currentEdges) =>
      currentEdges.left === nextEdges.left && currentEdges.right === nextEdges.right
        ? currentEdges
        : nextEdges,
    );
  }, []);

  const updateActiveSection = useCallback(() => {
    let nextId: (typeof anchorLinks)[number]['id'] = 'overview';

    for (const item of anchorLinks) {
      const section = document.getElementById(item.id);
      if (!section || section.getBoundingClientRect().top > ACTIVE_OFFSET) break;
      nextId = item.id;
    }

    setActiveId((currentId) => (currentId === nextId ? currentId : nextId));
  }, []);

  useEffect(() => {
    const onViewportChange = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        updateActiveSection();
        updateScrollEdges();
      });
    };

    updateActiveSection();
    updateScrollEdges();
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [updateActiveSection, updateScrollEdges]);

  useEffect(() => {
    const links = linksRef.current;
    const activeLink = links?.querySelector<HTMLAnchorElement>(`a[href="#${activeId}"]`);
    if (!links || !activeLink) return;

    const nextLeft = activeLink.offsetLeft - (links.clientWidth - activeLink.offsetWidth) / 2;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    links.scrollTo({ left: Math.max(0, nextLeft), behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeId]);

  return (
    <nav className={styles.anchorNav} aria-label="本页内容">
      <div className={styles.container + ' ' + styles.anchorNavInner}>
        <div
          className={styles.anchorLinksShell}
          data-scroll-left={scrollEdges.left}
          data-scroll-right={scrollEdges.right}
        >
          <div ref={linksRef} className={styles.anchorLinks} onScroll={updateScrollEdges}>
            {anchorLinks.map((item) => {
              const isActive = activeId === item.id;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={styles.anchorLink + (isActive ? ` ${styles.anchorLinkActive}` : '')}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setActiveId(item.id)}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
        <RenovationCta
          href="#wechat-contact"
          eventName="service_reno_photo_upload"
          className={styles.anchorCta}
        >
          提交设备信息，获取初判 →
        </RenovationCta>
      </div>
    </nav>
  );
}
