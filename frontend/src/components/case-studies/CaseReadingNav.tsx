'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

export function CaseReadingNav({
  items,
  resourcesId,
}: {
  items: { id: string; title: string }[];
  resourcesId: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>();

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) details.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      const details = detailsRef.current;
      if (event.key === 'Escape' && details?.open) {
        details.open = false;
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  return (
    <nav className="case-reading-nav" aria-label="文章导航">
      <details
        ref={detailsRef}
        className="case-reading-directory"
        onToggle={(event) => {
          if (!event.currentTarget.open) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const headerHeight =
            document.querySelector('header')?.getBoundingClientRect().height ?? 82;
          const footerHeight = window.innerWidth < 768 ? 84 : 12;
          const above = rect.top - headerHeight - 12;
          const below = window.innerHeight - rect.bottom - footerHeight;
          const opensUp = below < 360 && above > below;
          setPanelStyle({
            top: opensUp ? 'auto' : 'calc(100% + 6px)',
            bottom: opensUp ? 'calc(100% + 6px)' : 'auto',
            maxHeight: Math.max(100, Math.min(480, opensUp ? above : below)),
          });
        }}
      >
        <summary>
          本文目录 <span aria-hidden="true">⌄</span>
        </summary>
        <ol style={panelStyle}>
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => {
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {item.title.replace(/^[一二三四五六七八九十]+、/, '')}
              </a>
            </li>
          ))}
        </ol>
      </details>
      <a href="#case-article-content">案例正文</a>
      <a href="#case-product-connections">设备与配套</a>
      <a href={`#${resourcesId}`}>选型资料</a>
    </nav>
  );
}
