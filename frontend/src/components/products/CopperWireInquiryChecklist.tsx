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

export function CopperWireInquiryChecklist({ locale = 'zh', translations = {} }: { locale?: 'zh' | 'en'; translations?: Record<string, string> }) {
  const t = (text: string) => locale === 'en' ? (translations[text] ?? text).replace(/^\/zh(?=\/|$)/, '/en').replace(/^\/downloads\/heat-treatment-lines\//, '/downloads/heat-treatment-lines/en/') : text;
  const [prepared, setPrepared] = useState<string[]>([]);
  const total = copperWireChecklistGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <article lang={locale} className={styles.page} aria-labelledby="checklist-title">
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Breadcrumb
            locale={locale}
            tone="dark"
            currentLabel={t("询价资料准备清单")}
            items={[
              { label: t("产品中心"), href: t("/zh/products") },
              { label: t("铜丝连续退火生产线"), href: t(copperWireDetailPath) },
            ]}
          />
        </div>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{t("选型资料")}</p>
            <h1 id="checklist-title">
              {t("铜丝连续退火生产线")}<span>{t("询价资料准备清单")}</span>
            </h1>
            <p className={styles.intro}>{t(copperWireChecklistIntro)}</p>
          </div>
          <div className={styles.tools}>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => window.print()}
              >
                <HiOutlinePrinter aria-hidden="true" />
                {t("打印清单")}</button>
              <a
                className={styles.primaryButton}
                href={t(copperWireChecklistDownload)}
                download={t("铜丝连续退火生产线-询价资料准备清单.txt")}
              >
                <HiOutlineArrowDownTray aria-hidden="true" />
                {t("下载清单")}</a>
            </div>
            <p>{t("下载为空白文本清单；打印保留当前勾选。")}</p>
          </div>
        </div>

        <div className={styles.guidance}>
          <p>{t(copperWireChecklistNote)}</p>
        </div>
        <div className={styles.status}>
          <span>{t("勾选已准备的资料，缺少的内容可在沟通中补齐。")}</span>
          <span role="status" aria-live="polite">
            {t("已准备")}<strong>{prepared.length}</strong> / {total} {t("项")}</span>
        </div>

        <div className={styles.groups}>
          {copperWireChecklistGroups.map((group, groupIndex) => (
            <section
              key={t(group.title)}
              className={styles.group}
              aria-labelledby={`group-${groupIndex}`}
            >
              <div className={styles.groupHeading}>
                <span className={styles.groupNumber} aria-hidden="true">
                  0{groupIndex + 1}
                </span>
                <div>
                  <h2 id={`group-${groupIndex}`}>{t(group.title)}</h2>
                  <p>{t(group.description)}</p>
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
                        aria-label={locale === 'en' ? `${t(item.title)}: information prepared` : `${t(item.title)}：资料已准备`}
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
                      <span>{t(item.title)}</span>
                    </label>
                    <div id={`${item.id}-description`} className={styles.itemDescription}>
                      <p>{t(item.description)}</p>
                      {'note' in item && (
                        <p
                          className={item.id === 'atmosphere' ? styles.safetyNote : styles.itemNote}
                        >
                          {t(item.note)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className={styles.boundary} aria-label={t("使用边界")}>
          <h2>{t("使用边界")}</h2>
          <p>{t(copperWireChecklistBoundary)}</p>
        </aside>
        <div className={styles.contact}>
          <div>
            <h2>{t("资料不全，也可以先沟通")}</h2>
            <p>{t("先提供已有材料、规格与生产需求，其余资料在方案沟通中补齐。")}</p>
          </div>
          <div className={styles.contactActions}>
            <Link className={styles.primaryButton} href={`${t(copperWireDetailPath)}#inquiry`}>
              {t("返回产品页咨询")}</Link>
            <Link className={styles.textLink} href={t(copperWireDetailPath)}>
              {t("查看生产线详情")}</Link>
          </div>
        </div>
        <p className={styles.sessionNote}>{t("勾选仅用于本页整理，不会提交资料；刷新页面后重置。")}</p>
      </div>
    </article>
  );
}
