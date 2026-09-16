'use client';

import Image from 'next/image';
import type { CaseMeta } from '@/lib/cases/types';
import { useEffect, useState } from 'react';
import { CaseContact } from './CaseContact';

export function CaseToc({
  items,
  caseId,
  showContact = true,
  locale = 'zh',
  cover,
  compact = false,
}: {
  items: { id: string; title: string }[];
  caseId: string;
  showContact?: boolean;
  locale?: 'zh' | 'en';
  cover?: CaseMeta['cover'];
  compact?: boolean;
}) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = items[0]?.id;
        for (const item of items)
          if ((document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity) <= 190)
            current = item.id;
        setActive(current);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
    };
  }, [items]);
  const links = (
    <ol>
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? 'location' : undefined}
            onClick={() => setActive(item.id)}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            {item.title.replace(/^[一二三四五六七八九十]+、/, '')}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <aside className="case-toc">
      <nav className="case-toc-desktop" aria-label={locale === 'en' ? 'On this page' : '本文目录'}>
        <h2>{locale === 'en' ? 'On this page' : '本文目录'}</h2>
        {links}
      </nav>
      <details className="case-toc-mobile">
        <summary>{locale === 'en' ? 'On this page' : '本文目录'}</summary>
        <nav aria-label={locale === 'en' ? 'On this page' : '本文目录'}>{links}</nav>
      </details>
      {cover && (
        <figure className="case-article-cover">
          <div className="case-article-image">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(max-width: 767px) 1px, 250px"
              style={{ objectFit: cover.fit || 'contain' }}
            />
          </div>
        </figure>
      )}
      {showContact && (
        <div className="case-toc-contact">
          {!compact && <h2>有相似工况？</h2>}
          {!compact && <p>发工件、温度或已有方案，先明确需要补齐哪些条件。</p>}
          <CaseContact
            position="article_sidebar"
            caseId={caseId}
            label={compact ? '联系苏能工程师' : undefined}
          />
          {!compact && <p className="case-toc-note">资料不齐也可以先沟通。</p>}
        </div>
      )}
    </aside>
  );
}
