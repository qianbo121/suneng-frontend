'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import {
  matchesPartner,
  PENDING_PROVINCE,
  type ProvinceGroup,
} from '@/lib/partner-distribution-shared';
import { siteSettings } from '@/mock/siteSettings';
import styles from './PartnerDistribution.module.css';

type Region = {
  code: string;
  name: string;
  label: string;
  path: string;
  anchor: number[];
  position: number[];
};
type MapData = { regions: Region[]; southPath: string; boundaryPath: string };

function ProvincePanel({
  group,
  query,
  enhanced,
  selected,
  onClose,
  onToggle,
}: {
  group: ProvinceGroup;
  query: string;
  enhanced: boolean;
  selected: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const items = group.items.filter((item) => matchesPartner(item, query));
  useEffect(() => {
    const element = list.current;
    if (!element || !selected) return;
    element.scrollTop = 0;
    const measure = () =>
      setMore(element.scrollHeight > element.clientHeight + element.scrollTop + 2);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [selected, query]);
  return (
    <details
      className={styles.provinceDetails}
      data-province-details={group.code}
      open={enhanced ? selected : undefined}
    >
      <summary
        onClick={(event) => {
          if (enhanced) {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        {group.name}
        {group.items.length ? ` · ${group.items.length} 家合作伙伴` : ''}
      </summary>
      <section
        className={styles.panel}
        role={enhanced ? 'dialog' : undefined}
        aria-modal={enhanced ? 'false' : undefined}
        aria-labelledby={`province-title-${group.code}`}
        id={`province-panel-${group.code}`}
      >
        <div className={styles.panelHeading}>
          <div>
            <h2 id={`province-title-${group.code}`}>{group.name}</h2>
            <p>
              {query
                ? `共 ${group.items.length} 家合作伙伴 · 匹配 ${items.length} 家`
                : group.items.length
                  ? `${group.items.length} 家合作伙伴`
                  : '暂无已确认的合作单位资料'}
            </p>
          </div>
          {enhanced && (
            <button className={styles.close} onClick={onClose} aria-label="关闭省份信息">
              <HiXMark aria-hidden="true" />
            </button>
          )}
        </div>
        <div
          ref={list}
          className={styles.panelList}
          tabIndex={enhanced && items.length > 6 ? 0 : undefined}
          aria-label={`${group.name}合作伙伴`}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">公司简称</th>
                <th scope="col">所属行业</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} data-partner-id={item.id}>
                  <th scope="row" title={item.name} aria-label={item.name}>
                    {item.shortName}
                  </th>
                  <td>{item.industry || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <p className={styles.panelEmpty}>
              {query ? '该省份没有匹配的合作伙伴。' : '暂无已确认的合作单位资料。'}
            </p>
          )}
        </div>
        {more && <p className={styles.scrollHint}>向下滚动查看更多</p>}
      </section>
    </details>
  );
}

export function PartnerDistribution({ map, groups }: { map: MapData; groups: ProvinceGroup[] }) {
  const [enhanced, setEnhanced] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const groupByCode = new Map(groups.map((group) => [group.code, group]));
  const searching = Boolean(query.trim());
  const matchCount = groups.reduce(
    (sum, group) => sum + group.items.filter((item) => matchesPartner(item, query)).length,
    0,
  );
  const pending = groupByCode.get(PENDING_PROVINCE)!;
  const visibleGroups = groups.filter(
    (group) => group.code !== PENDING_PROVINCE || group.items.length > 0,
  );
  useEffect(() => {
    setEnhanced(true);
  }, []);
  const close = useCallback(() => {
    setSelected(null);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }, []);
  const open = (code: string, element: HTMLElement | SVGElement) => {
    trigger.current = element;
    setSelected(code);
    // The non-modal panel is next in the user's workflow, and Tab can freely leave it.
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLButtonElement>(`[data-province-details="${code}"] button`)
        ?.focus({ preventScroll: true }),
    );
  };
  useEffect(() => {
    if (!selected) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('[data-province-details], [data-province-trigger], [data-province-picker]')
      ) {
        if (target.closest('input, button, select, a')) setSelected(null);
        else close();
      }
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('pointerdown', outside);
    };
  }, [selected, close]);
  const choose = (code: string, element: HTMLSelectElement) => {
    if (!code) return close();
    const region = map.regions.find((region) => region.code === code);
    const view = viewport.current;
    if (region && view && view.scrollWidth > view.clientWidth) {
      view.scrollTo({
        left: (region.position[0] / 1280) * view.scrollWidth - view.clientWidth / 2,
        behavior: 'instant',
      });
    }
    open(code, element);
  };
  return (
    <div ref={root} className={styles.distribution} data-enhanced={enhanced}>
      <div className={styles.heading}>
        <div>
          <h1>合作伙伴分布</h1>
          <p>点击省份，查看合作伙伴及所属行业。</p>
        </div>
        <div className={styles.search} role="search">
          <HiMagnifyingGlass aria-hidden="true" />
          <input
            ref={search}
            type="search"
            aria-label="搜索公司或行业"
            placeholder="搜索公司或行业"
            value={query}
            maxLength={120}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              aria-label="清空搜索"
              onClick={() => {
                setQuery('');
                search.current?.focus();
              }}
            >
              <HiXMark aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <noscript>
        <style>{`
[data-about-subpage="partners"] [data-map-module] { height: auto; }
[data-about-subpage="partners"] [data-map-panels] { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; padding: 16px; }
[data-about-subpage="partners"] [data-province-details] > summary { display: list-item; }
[data-about-subpage="partners"] [data-map-note] { position: static; padding: 16px; }
[data-about-subpage="partners"] [data-map-note] button,
[data-about-subpage="partners"] [role="search"],
[data-about-subpage="partners"] [data-province-picker] { display: none; }
`}</style>
      </noscript>
      <div className={styles.mapModule} data-map-module>
        <div className={styles.mobilePicker} data-province-picker>
          <label htmlFor="partner-province">选择省份</label>
          <select
            id="partner-province"
            value={selected || ''}
            onChange={(event) => choose(event.target.value, event.currentTarget)}
          >
            <option value="">全国分布</option>
            {visibleGroups.map((group) => (
              <option key={group.code} value={group.code}>
                {group.name}
                {group.items.length
                  ? `（${group.items.length} 家${searching ? `，匹配 ${group.items.filter((item) => matchesPartner(item, query)).length} 家` : ''}）`
                  : ''}
              </option>
            ))}
          </select>
          <span>地图可左右滑动</span>
        </div>
        <div ref={viewport} className={styles.mapViewport}>
          <div className={styles.mapCanvas}>
            <svg
              className={styles.map}
              viewBox="0 0 1280 620"
              aria-label="中国省级合作伙伴分布地图"
            >
              <defs>
                <linearGradient id="province-glass" x1="0" y1="0" x2="0.7" y2="1">
                  <stop offset="0" stopColor="#f1f9ff" />
                  <stop offset="1" stopColor="#c9e2f7" />
                </linearGradient>
                <filter id="map-relief" x="-10%" y="-10%" width="120%" height="125%">
                  <feDropShadow
                    dx="0"
                    dy="5"
                    stdDeviation="5"
                    floodColor="#77acd2"
                    floodOpacity="0.24"
                  />
                </filter>
              </defs>
              <g filter="url(#map-relief)">
                {map.regions.map((region) => {
                  const group = groupByCode.get(region.code)!;
                  const matches =
                    searching && group.items.some((item) => matchesPartner(item, query));
                  return (
                    <path
                      key={region.code}
                      d={region.path}
                      className={styles.province}
                      data-province-trigger={region.code}
                      data-selected={selected === region.code}
                      data-match={matches}
                      fill="url(#province-glass)"
                      role={enhanced ? 'button' : undefined}
                      tabIndex={enhanced ? 0 : undefined}
                      aria-label={`${region.name}${group.items.length ? `，${group.items.length} 家合作伙伴` : '，暂无已确认资料'}`}
                      aria-pressed={selected === region.code}
                      aria-controls={`province-panel-${region.code}`}
                      onClick={(event) => open(region.code, event.currentTarget)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          open(region.code, event.currentTarget);
                        }
                      }}
                    />
                  );
                })}
                <path d={map.boundaryPath} className={styles.boundary} aria-hidden="true" />
              </g>
              <g aria-hidden="true">
                {map.regions
                  .filter(
                    (region) =>
                      Math.hypot(
                        region.position[0] - region.anchor[0],
                        region.position[1] - region.anchor[1],
                      ) > 12,
                  )
                  .map((region) => (
                    <path
                      key={region.code}
                      d={`M${region.anchor.join(',')}L${region.position.join(',')}`}
                      className={styles.leader}
                    />
                  ))}
              </g>
              <g aria-label="南海诸岛附图">
                <rect
                  x="1133"
                  y="508"
                  width="113"
                  height="92"
                  rx="5"
                  className={styles.insetFrame}
                />
                <path d={map.southPath} className={styles.insetLand} />
                <text x="1178" y="610" textAnchor="middle" className={styles.insetTitle}>
                  南海诸岛
                </text>
              </g>
            </svg>
            <div className={styles.labels}>
              {map.regions.map((region) => {
                const group = groupByCode.get(region.code)!;
                const matches =
                  searching && group.items.some((item) => matchesPartner(item, query));
                return (
                  <button
                    key={region.code}
                    data-province-trigger={region.code}
                    data-selected={selected === region.code}
                    data-match={matches}
                    data-has-partners={group.items.length > 0}
                    className={styles.provinceLabel}
                    style={{
                      left: `${region.position[0] / 12.8}%`,
                      top: `${region.position[1] / 6.2}%`,
                    }}
                    onClick={(event) => open(region.code, event.currentTarget)}
                    aria-label={`${region.name}${group.items.length ? `，${group.items.length} 家合作伙伴` : '，暂无已确认资料'}`}
                    aria-pressed={selected === region.code}
                    aria-controls={`province-panel-${region.code}`}
                    tabIndex={enhanced ? 0 : -1}
                  >
                    <span>{region.label}</span>
                    {group.items.length > 0 && <b>{group.items.length}</b>}
                    {matches && <span className={styles.matchDot} aria-label="搜索匹配" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.mapNote} data-map-note>
          <p>省份数字为合作伙伴数量</p>
          {pending.items.length > 0 && (
            <button
              data-province-trigger={PENDING_PROVINCE}
              onClick={(event) => open(PENDING_PROVINCE, event.currentTarget)}
              aria-controls={`province-panel-${PENDING_PROVINCE}`}
              aria-expanded={selected === PENDING_PROVINCE}
            >
              所在地待补充 {pending.items.length} 家
              {searching
                ? ` · 匹配 ${pending.items.filter((item) => matchesPartner(item, query)).length} 家`
                : ''}
            </button>
          )}
        </div>
        <div className={styles.searchStatus} role="status" aria-live="polite">
          {searching &&
            (matchCount ? (
              `找到 ${matchCount} 家匹配企业，请选择标有匹配圆点的省份或所在地待补充入口。`
            ) : (
              <span>
                未找到匹配的合作伙伴。
                <button
                  onClick={() => {
                    setQuery('');
                    search.current?.focus();
                  }}
                >
                  清空搜索
                </button>
              </span>
            ))}
        </div>
        <div
          className={styles.panels}
          data-map-panels
          style={{ '--panel-width': '340px' } as CSSProperties}
        >
          {visibleGroups.map((group) => (
            <ProvincePanel
              key={group.code}
              group={group}
              query={query.trim()}
              enhanced={enhanced}
              selected={selected === group.code}
              onClose={close}
              onToggle={() => setSelected(group.code)}
            />
          ))}
        </div>
      </div>
      <div className={styles.contactLine}>
        <span>江苏苏能工业炉有限公司</span>
        <a href={`tel:${siteSettings.salesPhone}`}>130-5298-6814</a>
      </div>
    </div>
  );
}
