'use client';

import { useId, useState } from 'react';
import type { Partner } from './map-kit/PartnerMap';
import { PARTNER_INDUSTRY_GROUPS, partnerIndustryGroup } from '@/lib/partner-industry-groups';
import styles from './PartnerPage.module.css';

const PREVIEW_ROWS = 8;
const normalize = (value: string) =>
  value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase('zh-CN');

export function PartnerIndustryDirectory({ partners }: { partners: readonly Partner[] }) {
  const searchId = useId();
  const [group, setGroup] = useState('全部行业');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const needle = normalize(query);
  const matching = partners.filter(
    (partner) =>
      (group === '全部行业' || partnerIndustryGroup(partner.industry) === group) &&
      (!needle ||
        normalize(`${partner.fullName} ${partner.shortName} ${partner.industry ?? ''}`).includes(
          needle,
        )),
  );

  return (
    <section
      className={styles.directory}
      id="partner-industries"
      aria-labelledby="partner-industry-title"
      data-partner-directory
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="partner-industry-title">按行业查看合作客户</h2>
          <p>从您熟悉的行业，了解苏能的历年合作单位。</p>
        </div>
        <label className={styles.directorySearch} htmlFor={searchId}>
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <span className={styles.srOnly}>搜索行业名单</span>
          <input
            id={searchId}
            type="search"
            name="industry-directory-search"
            autoComplete="off"
            placeholder="输入公司或行业…"
            maxLength={120}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
          />
        </label>
      </div>
      <div className={styles.filters} role="group" aria-label="筛选合作客户行业">
        {['全部行业', ...PARTNER_INDUSTRY_GROUPS].map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={group === name}
            onClick={() => {
              setGroup(name);
              setExpanded(false);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <p className={styles.resultCount} role="status" aria-live="polite">
        {group} · {matching.length} 家合作单位
      </p>
      <div className={styles.directoryTable}>
        <table>
          <thead>
            <tr>
              <th scope="col">合作单位名称</th>
              <th scope="col">所属行业</th>
            </tr>
          </thead>
          <tbody>
            {matching.map((partner, index) => (
              <tr key={partner.id} hidden={!expanded && index >= PREVIEW_ROWS}>
                <th scope="row" colSpan={partner.industry ? 1 : 2}>
                  {partner.fullName}
                </th>
                {partner.industry && (
                  <td>
                    <span>{partner.industry}</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!matching.length && (
          <div className={styles.empty}>
            <p>没有找到匹配的合作单位。</p>
            <button
              type="button"
              onClick={() => {
                setGroup('全部行业');
                setQuery('');
                setExpanded(false);
              }}
            >
              清除筛选，查看全部客户
            </button>
          </div>
        )}
        {matching.length > PREVIEW_ROWS && (
          <button
            className={styles.expand}
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起名单' : `展开全部 ${matching.length} 家合作单位`}
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
              style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
            >
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </button>
        )}
      </div>
      <p className={styles.note}>展示部分历年合作单位，具体合作形式与供货范围以项目资料为准。</p>
    </section>
  );
}
