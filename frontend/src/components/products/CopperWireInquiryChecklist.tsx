'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HiOutlineArrowDownTray, HiOutlinePrinter } from 'react-icons/hi2';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import {
  copperWireChecklistBoundary,
  copperWireChecklistDownload,
  copperWireChecklistGroups,
  copperWireChecklistIntro,
  copperWireChecklistNote,
  copperWireDetailPath,
} from '@/lib/copper-wire-inquiry-checklist';

import styles from './CopperWireInquiryChecklist.module.css';

export function CopperWireInquiryChecklist() {
  const [prepared, setPrepared] = useState<string[]>([]);
  const total = copperWireChecklistGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <article className={styles.page} aria-labelledby="checklist-title">
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Breadcrumb
            locale="zh"
            tone="dark"
            currentLabel="询价资料准备清单"
            items={[
              { label: '产品中心', href: '/zh/products' },
              { label: '铜丝连续退火生产线', href: copperWireDetailPath },
            ]}
          />
        </div>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>选型资料</p>
            <h1 id="checklist-title">
              铜丝连续退火生产线<span>询价资料准备清单</span>
            </h1>
            <p className={styles.intro}>{copperWireChecklistIntro}</p>
          </div>
          <div className={styles.tools}>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => window.print()}
              >
                <HiOutlinePrinter aria-hidden="true" />
                打印清单
              </button>
              <a
                className={styles.primaryButton}
                href={copperWireChecklistDownload}
                download="铜丝连续退火生产线-询价资料准备清单.txt"
              >
                <HiOutlineArrowDownTray aria-hidden="true" />
                下载清单
              </a>
            </div>
            <p>下载为空白文本清单；打印保留当前勾选。</p>
          </div>
        </div>

        <div className={styles.guidance}>
          <p>{copperWireChecklistNote}</p>
        </div>
        <div className={styles.status}>
          <span>勾选已准备的资料，缺少的内容可在沟通中补齐。</span>
          <span role="status" aria-live="polite">
            已准备 <strong>{prepared.length}</strong> / {total} 项
          </span>
        </div>

        <div className={styles.groups}>
          {copperWireChecklistGroups.map((group, groupIndex) => (
            <section
              key={group.title}
              className={styles.group}
              aria-labelledby={`group-${groupIndex}`}
            >
              <div className={styles.groupHeading}>
                <span className={styles.groupNumber} aria-hidden="true">
                  0{groupIndex + 1}
                </span>
                <div>
                  <h2 id={`group-${groupIndex}`}>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
              </div>
              <ol start={groupIndex * 3 + 1} className={styles.items}>
                {group.items.map((item, itemIndex) => (
                  <li key={item.id} className={styles.item}>
                    <label className={styles.itemLabel}>
                      <input
                        type="checkbox"
                        name={item.id}
                        checked={prepared.includes(item.id)}
                        aria-label={`${item.title}：资料已准备`}
                        aria-describedby={`${item.id}-description`}
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          setPrepared((previous) =>
                            checked
                              ? [...previous, item.id]
                              : previous.filter((id) => id !== item.id),
                          );
                        }}
                      />
                      <span className={styles.itemNumber}>{groupIndex * 3 + itemIndex + 1}.</span>
                      <span>{item.title}</span>
                    </label>
                    <div id={`${item.id}-description`} className={styles.itemDescription}>
                      <p>{item.description}</p>
                      {'note' in item && (
                        <p
                          className={item.id === 'atmosphere' ? styles.safetyNote : styles.itemNote}
                        >
                          {item.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className={styles.boundary} aria-label="使用边界">
          <h2>使用边界</h2>
          <p>{copperWireChecklistBoundary}</p>
        </aside>
        <div className={styles.contact}>
          <div>
            <h2>资料不全，也可以先沟通</h2>
            <p>先提供已有材料、规格与生产需求，其余资料在方案沟通中补齐。</p>
          </div>
          <div className={styles.contactActions}>
            <Link className={styles.primaryButton} href={`${copperWireDetailPath}#inquiry`}>
              返回产品页咨询
            </Link>
            <Link className={styles.textLink} href={copperWireDetailPath}>
              查看生产线详情
            </Link>
          </div>
        </div>
        <p className={styles.sessionNote}>勾选仅用于本页整理，不会提交资料；刷新页面后重置。</p>
      </div>
    </article>
  );
}
