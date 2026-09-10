'use client';

import './partner-map.css';
import Image from 'next/image';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';

export type Province = {
  code: string;
  name: string;
  shortName: string;
  /** Already projected into the shared 1280 × 620 design coordinate system. */
  path: string;
  anchor: readonly [number, number];
  label: readonly [number, number];
  leader: boolean;
};

export type Partner = {
  id: string;
  fullName: string;
  shortName: string;
  industry: string | null;
  /** Production data: only a verified location may populate this field. */
  provinceCode: string | null;
  inferredProvinceCode?: string | null;
  locationStatus?: string;
  provinceSource?: string | null;
  industrySource?: string | null;
  isDemo?: boolean;
};

export type PartnerMapProps = {
  partners: readonly Partner[];
  provinces: readonly Province[];
  /** Copy files inside the package's assets/ directory to public/partner-map/. */
  assetBasePath?: string;
  initialProvince?: string | null;
  /** When supplied, this prefix must be unique on the current page. */
  idPrefix?: string;
  headingLevel?: 1 | 2;
  title?: string;
};

const VIEWBOX_WIDTH = 1280;
const VIEWBOX_HEIGHT = 620;
const UNKNOWN = 'unassigned';

// Keep supplied geometry intact; position labels within regions and clear adjacent badges.
const LABEL_POSITION_OVERRIDES: Partial<Record<string, readonly [number, number]>> = {
  '150000': [600, 210],
  '620000': [454, 334],
  '430000': [559, 450],
  '520000': [478, 461],
};

function labelPosition(province: Province): readonly [number, number] {
  return LABEL_POSITION_OVERRIDES[province.code] ?? province.label;
}

function position([x, y]: readonly [number, number]): CSSProperties {
  return {
    left: `${(x / VIEWBOX_WIDTH) * 100}%`,
    top: `${(y / VIEWBOX_HEIGHT) * 100}%`,
  };
}

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
}

function restoreVisibleFocus(preferred: HTMLElement | null, fallback: HTMLElement | null) {
  requestAnimationFrame(() => {
    for (const element of [preferred, fallback]) {
      if (!element?.isConnected || !element.getClientRects().length) continue;
      const style = getComputedStyle(element);
      if (
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        style.display === 'none'
      )
        continue;
      element.focus({ preventScroll: true });
      break;
    }
  });
}

/**
 * The decorative SVGs, hit regions, label anchors and selection overlay use one
 * coordinate system. Do not independently resize, crop or reproject these layers.
 * This client component is still server-rendered by Next.js: every disclosure's
 * actual company text is included in the initial HTML.
 */
export default function PartnerMap({
  partners,
  provinces,
  assetBasePath = '/partner-map',
  initialProvince = null,
  idPrefix,
  headingLevel = 1,
  title = '部分合作客户展示',
}: PartnerMapProps) {
  const reactId = useId();
  const safePrefix = idPrefix?.replace(/[^a-zA-Z0-9_-]/g, '');
  const uid = `suneng-map-${safePrefix || reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const assets = assetBasePath.replace(/\/$/, '');
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const PopupHeading = headingLevel === 1 ? 'h2' : 'h3';
  const rootRef = useRef<HTMLElement>(null);
  const provinceSelectRef = useRef<HTMLSelectElement>(null);
  const summaryRefs = useRef(new Map<string, HTMLElement>());
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<string | null>(initialProvince);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [enhanced, setEnhanced] = useState(false);
  const [popupHeight, setPopupHeight] = useState(380);
  const [hasMoreRows, setHasMoreRows] = useState(false);
  const normalizedQuery = normalize(query);

  const provinceItems = useMemo(
    () => provinces.filter((province) => province.code && province.name),
    [provinces],
  );

  const uniquePartners = useMemo(() => {
    const records = new Map<string, Partner>();
    for (const partner of partners) {
      if (partner.isDemo || partner.fullName === '江苏苏能工业炉有限公司') continue;
      // Dedupe stable identities only; do not merge subsidiaries or similar names.
      if (!records.has(partner.id)) records.set(partner.id, partner);
    }
    return Array.from(records.values());
  }, [partners]);

  const groups = useMemo(() => {
    const result = new Map<string, Partner[]>();
    for (const province of provinceItems) result.set(province.code, []);
    result.set(UNKNOWN, []);
    for (const partner of uniquePartners) {
      // inferredProvinceCode intentionally never enters the production grouping.
      const code =
        partner.provinceCode && result.has(partner.provinceCode) ? partner.provinceCode : UNKNOWN;
      result.get(code)!.push(partner);
    }
    return result;
  }, [provinceItems, uniquePartners]);

  const matches = (partner: Partner) =>
    !normalizedQuery ||
    normalize(`${partner.fullName} ${partner.shortName} ${partner.industry ?? ''}`).includes(
      normalizedQuery,
    );

  const matchingCount = uniquePartners.filter(matches).length;
  const unknownPartners = groups.get(UNKNOWN) ?? [];
  const unknownMatchCount = unknownPartners.filter(matches).length;
  const locatedMatchCount = matchingCount - unknownMatchCount;
  const searchFeedback = !matchingCount
    ? '未找到匹配的合作伙伴'
    : !locatedMatchCount
      ? `匹配 ${unknownMatchCount} 家，请查看“所在地待补充”`
      : unknownMatchCount
        ? `匹配 ${matchingCount} 家；其中 ${unknownMatchCount} 家所在地待补充`
        : `找到 ${matchingCount} 家合作伙伴，点击高亮省份查看`;
  const selectedCount = selected ? (groups.get(selected)?.length ?? 0) : 0;

  useEffect(() => {
    setEnhanced(true);
  }, []);

  useEffect(() => {
    if (selected && !groups.get(selected)?.length) setSelected(null);
  }, [selected, groups]);

  useEffect(() => {
    if (!selected) return;
    const popup = rootRef.current?.querySelector<HTMLElement>('details[open] .suneng-map-popup');
    if (!popup) return;
    const measure = () => setPopupHeight(Math.ceil(popup.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(popup);
    return () => observer.disconnect();
  }, [selected]);

  useEffect(() => {
    const list = rootRef.current?.querySelector<HTMLElement>(
      'details[open] .suneng-map-table-scroll',
    );
    if (!list) {
      setHasMoreRows(false);
      return;
    }
    list.scrollTop = 0;
    const measure = () =>
      setHasMoreRows(list.scrollHeight > list.clientHeight + list.scrollTop + 2);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.addEventListener('scroll', measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      list.removeEventListener('scroll', measure);
    };
  }, [selected, query]);

  function closePanel(restoreFocus = true) {
    setSelected(null);
    if (restoreFocus) {
      restoreVisibleFocus(returnFocusRef.current, provinceSelectRef.current);
    }
  }

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelected(null);
        restoreVisibleFocus(returnFocusRef.current, provinceSelectRef.current);
      }
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const root = rootRef.current;
      const activeUi = target.closest('[data-suneng-map-trigger], .suneng-map-popup');
      if (root?.contains(target) && activeUi) return;
      // Outside clicks keep focus at the user's new destination.
      setSelected(null);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [selected]);

  function openProvince(code: string, trigger?: HTMLElement | null) {
    if (!groups.get(code)?.length) return;
    returnFocusRef.current = trigger ?? summaryRefs.current.get(code) ?? null;
    setSelected(code);
  }

  function onSummaryClick(event: ReactMouseEvent<HTMLElement>, code: string) {
    event.preventDefault();
    if (selected === code) closePanel();
    else openProvince(code, event.currentTarget);
  }

  function renderPopup(code: string, name: string) {
    const allRows = groups.get(code) ?? [];
    const rows = allRows.filter(matches);
    return (
      <section
        className="suneng-map-popup"
        id={`${uid}-panel-${code}`}
        aria-labelledby={`${uid}-heading-${code}`}
      >
        <div className="suneng-map-popup-heading">
          <div>
            <PopupHeading id={`${uid}-heading-${code}`}>{name}</PopupHeading>
            <p>
              共 <strong>{allRows.length}</strong> 家合作伙伴
              {normalizedQuery && (
                <span className="suneng-map-matched"> · 匹配 {rows.length} 家</span>
              )}
            </p>
          </div>
          <button
            className="suneng-map-close"
            type="button"
            onClick={() => closePanel()}
            aria-label={`关闭${name}合作伙伴`}
          >
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="suneng-map-table-scroll" tabIndex={0} aria-label={`${name}合作伙伴列表`}>
          <table className="suneng-map-table">
            <thead>
              <tr>
                <th scope="col">公司简称</th>
                <th scope="col">所属行业</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((partner) => (
                <tr key={partner.id} data-partner-id={partner.id}>
                  <th scope="row" title={partner.fullName} colSpan={partner.industry ? 1 : 2}>
                    <span aria-label={partner.fullName}>{partner.shortName}</span>
                  </th>
                  {partner.industry && <td>{partner.industry}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="suneng-map-empty">该地区没有匹配的合作伙伴。</p>}
        </div>
        {selected === code && hasMoreRows && (
          <p className="suneng-map-scroll-hint">向下滚动查看更多</p>
        )}
      </section>
    );
  }

  return (
    <section
      className="suneng-map"
      data-enhanced={enhanced ? 'true' : 'false'}
      data-searching={normalizedQuery ? 'true' : 'false'}
      data-has-selection={selected && selectedCount > 0 ? 'true' : 'false'}
      style={{ '--suneng-map-popup-height': `${popupHeight}px` } as CSSProperties}
      ref={rootRef}
      aria-labelledby={`${uid}-title`}
    >
      <header className="suneng-map-header">
        <div>
          <Heading className="suneng-map-title" id={`${uid}-title`}>
            {title}
          </Heading>
          <p className="suneng-map-description">以下展示部分历年合作客户，点击省份查看。</p>
        </div>
        <div className="suneng-map-search-wrap">
          <label className="suneng-map-search" htmlFor={`${uid}-search`}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 5 5" />
            </svg>
            <span className="suneng-map-sr-only">搜索公司或行业</span>
            <input
              id={`${uid}-search`}
              type="search"
              name="partner-search"
              maxLength={120}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索公司或行业"
              autoComplete="off"
            />
          </label>
          <div
            className="suneng-map-search-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {normalizedQuery && (
              <>
                {unknownMatchCount > 0 ? (
                  <button
                    type="button"
                    className="suneng-map-search-unassigned"
                    data-suneng-map-trigger="true"
                    onClick={(event) => openProvince(UNKNOWN, event.currentTarget)}
                  >
                    {searchFeedback}
                  </button>
                ) : (
                  searchFeedback
                )}
                <button type="button" onClick={() => setQuery('')}>
                  清空
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <label className="suneng-map-mobile-selector" htmlFor={`${uid}-province-select`}>
        <span>查看省份</span>
        <select
          id={`${uid}-province-select`}
          ref={provinceSelectRef}
          value={selected ?? ''}
          data-suneng-map-trigger="true"
          onChange={(event) => {
            if (event.target.value) openProvince(event.target.value, event.currentTarget);
            else closePanel(false);
          }}
        >
          <option value="">请选择省份</option>
          {provinceItems.map((province) => {
            const rows = groups.get(province.code) ?? [];
            return rows.length ? (
              <option
                key={province.code}
                value={province.code}
                data-muted={normalizedQuery && !rows.some(matches) ? 'true' : 'false'}
              >
                {province.name} · {rows.length} 家
                {normalizedQuery ? `（匹配 ${rows.filter(matches).length} 家）` : ''}
              </option>
            ) : null;
          })}
          {!!unknownPartners.length && (
            <option
              value={UNKNOWN}
              data-muted={normalizedQuery && !unknownMatchCount ? 'true' : 'false'}
            >
              所在地待补充 · {unknownPartners.length} 家
              {normalizedQuery ? `（匹配 ${unknownMatchCount} 家）` : ''}
            </option>
          )}
        </select>
      </label>

      <div className="suneng-map-stage">
        <Image
          unoptimized
          className="suneng-map-background"
          src={`${assets}/stage-background.svg?v=1.1`}
          alt=""
          width="1280"
          height="620"
          draggable="false"
        />
        <Image
          unoptimized
          className="suneng-map-base"
          src={`${assets}/china-glass-base.svg?v=1.1`}
          alt=""
          width="1280"
          height="620"
          draggable="false"
        />

        <svg
          className="suneng-map-overlay"
          viewBox="0 0 1280 620"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${uid}-selection`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#74bdff" stopOpacity="0.84" />
              <stop offset="1" stopColor="#3370ff" stopOpacity="0.86" />
            </linearGradient>
          </defs>
          {provinceItems.map((province) => {
            const allRows = groups.get(province.code) ?? [];
            const interactive = allRows.length > 0;
            const matching = !!normalizedQuery && allRows.some(matches);
            return (
              <path
                key={province.code}
                data-province-code={province.code}
                className="suneng-map-region"
                d={province.path}
                data-interactive={interactive ? 'true' : 'false'}
                data-selected={selected === province.code ? 'true' : 'false'}
                data-hovered={hovered === province.code ? 'true' : 'false'}
                data-match={matching ? 'true' : 'false'}
                data-suneng-map-trigger={interactive ? 'true' : undefined}
                style={selected === province.code ? { fill: `url(#${uid}-selection)` } : undefined}
                onPointerEnter={() => interactive && setHovered(province.code)}
                onPointerLeave={() => setHovered(null)}
                onClick={
                  interactive
                    ? () => {
                        const trigger = summaryRefs.current.get(province.code);
                        trigger?.focus({ preventScroll: true });
                        if (selected === province.code) closePanel();
                        else openProvince(province.code, trigger);
                      }
                    : undefined
                }
              />
            );
          })}
          {provinceItems
            .filter((province) => province.leader)
            .map((province) => (
              <path
                key={`leader-${province.code}`}
                className="suneng-map-label-leader"
                d={`M${province.anchor[0]} ${province.anchor[1]} L${labelPosition(province)[0]} ${labelPosition(province)[1]}`}
              />
            ))}
        </svg>

        <div className="suneng-map-idle-hint">
          <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
            <circle cx="17" cy="17" r="12" />
            <circle cx="17" cy="17" r="6" />
            <path d="m23 22 3 14 4-6 6-3Z" />
          </svg>
          <p className="suneng-map-idle-title">选择一个省份</p>
          <p>查看合作伙伴及所属行业</p>
        </div>

        {provinceItems.map((province) => {
          const rows = groups.get(province.code) ?? [];
          if (!rows.length)
            return (
              <span
                key={province.code}
                className="suneng-map-plain-label"
                style={position(labelPosition(province))}
              >
                {province.shortName}
              </span>
            );
          const isMuted = !!normalizedQuery && !rows.some(matches);
          return (
            <details
              className="suneng-map-disclosure"
              key={province.code}
              open={selected === province.code}
            >
              <summary
                className="suneng-map-marker"
                ref={(node) => {
                  if (node) summaryRefs.current.set(province.code, node);
                  else summaryRefs.current.delete(province.code);
                }}
                style={position(labelPosition(province))}
                data-province-code={province.code}
                data-selected={selected === province.code ? 'true' : 'false'}
                data-muted={isMuted ? 'true' : 'false'}
                data-suneng-map-trigger="true"
                aria-label={`${province.name}，${rows.length}家合作伙伴`}
                aria-controls={`${uid}-panel-${province.code}`}
                onClick={(event) => onSummaryClick(event, province.code)}
                onPointerEnter={() => setHovered(province.code)}
                onPointerLeave={() => setHovered(null)}
              >
                <span>{province.shortName}</span>
                <span className="suneng-map-count" aria-hidden="true">
                  {rows.length}
                </span>
              </summary>
              {renderPopup(province.code, province.name)}
            </details>
          );
        })}

        <span className="suneng-map-inset-label" style={position([1187, 607])}>
          南海诸岛
        </span>

        <p className="suneng-map-legend">省份数字为本页展示客户数量</p>
        {!!unknownPartners.length && (
          <details className="suneng-map-disclosure" open={selected === UNKNOWN}>
            <summary
              className="suneng-map-unassigned"
              data-suneng-map-trigger="true"
              data-muted={normalizedQuery && !unknownMatchCount ? 'true' : 'false'}
              ref={(node) => {
                if (node) summaryRefs.current.set(UNKNOWN, node);
                else summaryRefs.current.delete(UNKNOWN);
              }}
              onClick={(event) => onSummaryClick(event, UNKNOWN)}
              aria-controls={`${uid}-panel-${UNKNOWN}`}
            >
              所在地待补充 {unknownPartners.length} 家
              {normalizedQuery && ` · 匹配 ${unknownMatchCount} 家`}
            </summary>
            {renderPopup(UNKNOWN, '所在地待补充')}
          </details>
        )}
      </div>
    </section>
  );
}
