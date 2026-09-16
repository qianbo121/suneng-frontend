/* Native links intentionally retain document navigation for GET filters and history restoration. */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import Image from 'next/image';
import { useEffect, useRef, type MouseEvent } from 'react';
import { ListPagination } from '@/components/ui/ListPagination';
import { caseListHref } from '@/lib/cases/query';
import { type CaseCardData, type CasePageResult, type CaseQuery } from '@/lib/cases/types';
import { trackLeadEvent } from '@/lib/api/lead-events';

const scrollKey = (url: string) => `case-scroll:${url}`;
function saveScroll(url: string) {
  try {
    sessionStorage.setItem(scrollKey(url), String(window.scrollY));
  } catch {
    /* storage is optional */
  }
}

export function CaseList({ initial, query }: { initial: CasePageResult; query: CaseQuery }) {
  const result = initial;
  const listHref = caseListHref(query, { page: result.page, from: result.from });
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(scrollKey(listHref));
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
        sessionStorage.removeItem(scrollKey(listHref));
      }
    } catch {
      /* URL state still works without storage */
    }
    // Restore once on document navigation, including an explicit return from detail.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="case-results-top">
        <h2 id="case-results-heading">全部案例</h2>
        <nav className="case-c4-sort" aria-label="案例排序">
          <a
            href={caseListHref(query, { sort: 'relevance', page: 1, from: 1 })}
            aria-current={query.sort === 'relevance' ? 'page' : undefined}
          >
            推荐阅读
          </a>
          <a
            href={caseListHref(query, { sort: 'updated', page: 1, from: 1 })}
            aria-current={query.sort === 'updated' ? 'page' : undefined}
          >
            最近更新
          </a>
        </nav>
      </div>
      <div className="case-records">
        {result.items.map((item, index) => (
          <CaseCard key={item.id} item={item} returnTo={listHref} priority={index === 0} />
        ))}
        {!result.items.length && (
          <div className="case-empty">
            <h3>{result.total ? '这一页没有项目' : '暂时没有匹配的项目'}</h3>
            <p>试试减少筛选条件，或查看全部项目。</p>
            <a href="/zh/case" className="case-button case-button-outline">
              查看全部项目
            </a>
          </div>
        )}
      </div>
      <div className="case-pagination">
        <ListPagination
          page={result.page}
          pageCount={result.totalPages}
          href={(page) => caseListHref(query, { page, from: page })}
          ariaLabel="案例分页"
        />
      </div>
    </>
  );
}

function CaseCard({
  item,
  returnTo,
  priority,
}: {
  item: CaseCardData;
  returnTo: string;
  priority: boolean;
}) {
  const href = `/zh/case/${item.slug}?returnTo=${encodeURIComponent(returnTo)}`;
  const title = item.listTitle || item.title;
  const titleId = `case-title-${item.id}`;
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  function openCase(event: MouseEvent<HTMLAnchorElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    const selection = window.getSelection();
    // Dragging to copy text must not open the project when the pointer is released.
    if (
      event.detail > 0 &&
      start &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4 &&
      selection &&
      !selection.isCollapsed &&
      selection.rangeCount > 0 &&
      selection.getRangeAt(0).intersectsNode(event.currentTarget)
    ) {
      event.preventDefault();
      return;
    }
    saveScroll(returnTo);
    trackLeadEvent('cta_click', {
      pageType: 'case',
      properties: { caseId: item.id, position: 'list_record' },
    });
  }
  return (
    <article className="case-record" data-case-id={item.id} data-has-cover={Boolean(item.cover)}>
      <a
        className="case-record-content"
        href={href}
        onClick={openCase}
        onPointerDown={(event) => {
          pointerStart.current = { x: event.clientX, y: event.clientY };
        }}
        aria-labelledby={titleId}
        draggable={false}
      >
        {item.cover && (
          <figure className="case-record-cover">
            <div className="case-record-image">
              <Image
                src={item.cover.src}
                alt={item.cover.alt}
                width={480}
                height={280}
                priority={priority}
                draggable={false}
                sizes="(max-width: 767px) 88px, 180px"
                style={{ objectFit: item.cover.fit ?? 'contain' }}
              />
            </div>
          </figure>
        )}
        <div className="case-record-copy">
          <h3 id={titleId}>{title}</h3>
          {/* The server prepares list summaries; see getCaseResults. */}
          <p className="case-record-summary">{item.summary}</p>
        </div>
      </a>
    </article>
  );
}

export function CaseSelectSubmit() {
  useEffect(() => {
    const form = document.getElementById('case-search-form') as HTMLFormElement | null;
    const submit = (event: Event) => {
      if (event.target instanceof HTMLSelectElement && event.target.form === form)
        form?.requestSubmit();
    };
    document.addEventListener('change', submit);
    return () => document.removeEventListener('change', submit);
  }, []);
  return null;
}

export function CaseBackLink({ href }: { href: string }) {
  // The validated server URL is also a functional link with JavaScript disabled.
  return (
    <a className="case-back" href={href}>
      ← 返回项目案例
    </a>
  );
}
