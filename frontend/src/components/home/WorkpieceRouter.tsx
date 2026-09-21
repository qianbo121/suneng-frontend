'use client';

import Image from 'next/image';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { HiArrowRight, HiChevronRight } from 'react-icons/hi2';

import { trackLeadEvent } from '@/lib/api/lead-events';
import { getWorkpieceBoundarySummary } from '@/lib/workpiece-direction-summary';
import {
  getWorkpieceDirectionExamples,
  type WorkpieceDirectionExamplesResponse,
} from '@/lib/api/workpiece-router';
import { setActiveWorkpieceContext } from '@/lib/workpiece-selection-context';
import {
  clearActiveWorkpieceRouterDraft,
  setActiveWorkpieceRouterDraft,
} from '@/lib/workpiece-router-draft-context';
import {
  findPublicWorkpiece,
  resolvePublicWorkpieceSelection,
  type WorkpieceRouterPublicCatalog,
} from '@/lib/workpiece-router-public';

import styles from './WorkpieceRouter.module.css';

const TRACKING_CONTEXT = {
  pageType: '首页',
  productTag: '工件到炉型方向',
};

const CUSTOMER_PROMPTS = [
  ['希望解决什么问题', '当前问题、工艺或质量要求'],
  ['工件材质', '材料名称、已知牌号'],
  ['工件尺寸与重量', '最大尺寸、单件重量'],
  ['计划处理数量', '每批／每天的件数或吨数'],
];

const CUSTOMER_PROMPT_ICON_PATHS = [
  ['M8 7h8M8 11h5', 'M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z'],
  ['m12 3 9 5v8l-9 5-9-5V8l9-5Z', 'm3 8 9 5 9-5M12 13v8M7.5 5.5l9 5'],
  ['m3 16 13-13 5 5L8 21l-5-5Z', 'm13 6 2 2M10 9l3 3M7 12l2 2'],
  ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5M3 16l9 5 9-5'],
];

export function WorkpieceRouter({ catalog, locale = 'zh' }: { catalog: WorkpieceRouterPublicCatalog; locale?: 'zh' | 'en' }) {
  const english = locale === 'en';
  const t = (zh: string, en: string) => english ? en : zh;
  const moduleViewTrackedRef = useRef(false);
  const exampleRequestIdRef = useRef(0);
  const [activeCategoryId, setActiveCategoryId] = useState(catalog.defaultCategoryId);
  const [selectedWorkpieceId, setSelectedWorkpieceId] = useState(catalog.defaultWorkpieceId);
  const [routeHint, setRouteHint] = useState<string | null>(null);
  const [directionExamples, setDirectionExamples] =
    useState<WorkpieceDirectionExamplesResponse | null>(null);
  const [examplesLoading, setExamplesLoading] = useState(false);

  const category =
    catalog.categories.find((item) => item.id === activeCategoryId) ?? catalog.categories[0];
  const selectedWorkpiece = findPublicWorkpiece(catalog, selectedWorkpieceId);
  const resolution = useMemo(
    () =>
      resolvePublicWorkpieceSelection(catalog, {
        workpieceId: selectedWorkpieceId,
        routeHint,
      }),
    [catalog, routeHint, selectedWorkpieceId],
  );
  const standardDirections = catalog.standardDirectionsByWorkpiece[selectedWorkpieceId];
  const hasStandardDirections = Boolean(standardDirections?.examples.length);
  const visibleDirectionExamples = hasStandardDirections
    ? standardDirections.examples
    : catalog.publicDirectionExamplesEnabled
      ? (directionExamples?.examples ?? [])
      : [];
  const directionConditions = visibleDirectionExamples.map((example) => ({
    condition: example.condition,
    boundary:
      example.boundary ||
      directionExamples?.customerNote ||
      t(
        '需结合图纸、执行标准、装料与完整工艺链进行工程确认，不构成最终选型或供货承诺。',
        'Engineering review must confirm drawings, applicable standards, loading and the full process route. This is not a final equipment selection or supply commitment.',
      ),
  }));
  const commonProcesses = useMemo(
    () =>
      visibleDirectionExamples.length
        ? []
        : [...new Set(resolution.processOptions.map((option) => option.label))].slice(0, 3),
    [resolution.processOptions, visibleDirectionExamples.length],
  );
  useEffect(() => {
    if (moduleViewTrackedRef.current) return;
    moduleViewTrackedRef.current = true;
    trackLeadEvent('module_view', {
      ...TRACKING_CONTEXT,
      properties: { source_module: 'workpiece_router' },
    });
  }, []);

  useEffect(() => {
    setActiveWorkpieceContext({
      categoryId: resolution.categoryId,
      workpieceId: resolution.workpieceId,
      searchTerm: null,
      processPurposeId: null,
      logicUnitId: resolution.logicUnitId,
      routeId: resolution.routeId,
      displayState: 'engineering_review',
    });
  }, [resolution]);

  useEffect(() => {
    const requestId = ++exampleRequestIdRef.current;
    setDirectionExamples(null);
    if (hasStandardDirections || !catalog.publicDirectionExamplesEnabled) {
      setExamplesLoading(false);
      return;
    }
    setExamplesLoading(true);
    getWorkpieceDirectionExamples(selectedWorkpieceId)
      .then((response) => {
        if (requestId !== exampleRequestIdRef.current) return;
        setDirectionExamples(response);
      })
      .catch(() => {
        if (requestId !== exampleRequestIdRef.current) return;
        setDirectionExamples(null);
      })
      .finally(() => {
        if (requestId === exampleRequestIdRef.current) setExamplesLoading(false);
      });
  }, [catalog.publicDirectionExamplesEnabled, hasStandardDirections, selectedWorkpieceId]);

  const resetInquiryDraft = () => clearActiveWorkpieceRouterDraft();

  const selectWorkpiece = (workpieceId: string, nextRouteHint: string | null = null) => {
    const workpiece = findPublicWorkpiece(catalog, workpieceId);
    if (!workpiece) return;
    setActiveCategoryId(workpiece.categoryId);
    setSelectedWorkpieceId(workpiece.id);
    setRouteHint(nextRouteHint);
    resetInquiryDraft();
    trackLeadEvent('workpiece_select', {
      ...TRACKING_CONTEXT,
      properties: {
        source_module: 'workpiece_router',
        workpiece_id: workpiece.id,
        route_hint: nextRouteHint,
      },
    });
  };

  const chooseCategory = (categoryId: string) => {
    const nextCategory = catalog.categories.find((item) => item.id === categoryId);
    const firstWorkpiece = nextCategory?.cards[0];
    if (!nextCategory || !firstWorkpiece) return;
    setActiveCategoryId(nextCategory.id);
    setSelectedWorkpieceId(firstWorkpiece.id);
    setRouteHint(null);
    resetInquiryDraft();
    trackLeadEvent('category_select', {
      ...TRACKING_CONTEXT,
      properties: { source_module: 'workpiece_router', category_id: nextCategory.id },
    });
  };

  const handleCategoryKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    categoryIndex: number,
  ) => {
    const lastIndex = catalog.categories.length - 1;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = categoryIndex === lastIndex ? 0 : categoryIndex + 1;
    if (event.key === 'ArrowLeft') nextIndex = categoryIndex === 0 ? lastIndex : categoryIndex - 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextCategory = catalog.categories[nextIndex];
    chooseCategory(nextCategory.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`workpiece-category-${nextCategory.id}`)?.focus();
    });
  };

  const goToForm = () => {
    setActiveWorkpieceRouterDraft({
      categoryId: activeCategoryId,
      workpieceId: selectedWorkpieceId,
      searchTerm: null,
      processPurposeId: null,
      rawConditions: {},
      displayState: 'engineering_review',
      completedGroups: 0,
      totalGroups: 0,
      capturedAt: new Date().toISOString(),
    });
    trackLeadEvent('cta_click', {
      ...TRACKING_CONTEXT,
      properties: {
        source_module: 'workpiece_router',
        workpiece_id: selectedWorkpieceId,
        search_term: null,
        display_state: 'engineering_review',
      },
    });
    document.getElementById('homepage-lead-form')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section id="workpiece-router" className={styles.section} data-locale={locale} aria-labelledby="workpiece-title">
      <div className={styles.container}>
        <div className={styles.headingCopy}>
          <h2 id="workpiece-title">{t('您要处理什么工件？', 'What do you need to heat treat?')}</h2>
          <p>{t('工件图片仅用于类别识别，材质、制造方式及热处理要求以客户图纸和技术资料为准。', 'Images identify workpiece categories. Material, manufacturing route and treatment requirements must follow your drawings and specifications.')}</p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label={t('工件分类', 'Workpiece categories')}>
          {catalog.categories.map((item, categoryIndex) => (
            <button
              key={item.id}
              id={`workpiece-category-${item.id}`}
              type="button"
              role="tab"
              aria-selected={item.id === activeCategoryId}
              aria-controls="workpiece-category-panel"
              tabIndex={item.id === activeCategoryId ? 0 : -1}
              className={item.id === activeCategoryId ? styles.activeTab : undefined}
              onClick={() => chooseCategory(item.id)}
              onKeyDown={(event) => handleCategoryKeyDown(event, categoryIndex)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.workspace}>
          <div
            id="workpiece-category-panel"
            className={styles.workspaceMain}
            role="tabpanel"
            aria-labelledby={`workpiece-category-${category.id}`}
          >
            <div className={styles.directory}>
              <div className={styles.directoryHeading}>
                <strong>{category.label}</strong>
                <span>{category.cards.length} {t('类工件', 'workpiece types')}</span>
              </div>
              <div className={styles.directoryItems}>
                {category.cards.map((card) => {
                  const selected = card.id === selectedWorkpieceId;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      data-workpiece-id={card.id}
                      className={`${styles.directoryItem} ${selected ? styles.directorySelected : ''}`}
                      aria-pressed={selected}
                      aria-controls="workpiece-detail"
                      onClick={() => selectWorkpiece(card.id)}
                    >
                      <Image src={card.image} alt="" width={140} height={80} sizes="70px" />
                      <strong>{card.name}</strong>
                      {selected ? (
                        <span className={styles.selectionDot} aria-hidden="true" />
                      ) : (
                        <HiChevronRight aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div id="workpiece-detail" className={styles.spotlight}>
              <h3 aria-live="polite">
                {standardDirections?.displayWorkpieceName ??
                  directionExamples?.displayWorkpieceName ??
                  selectedWorkpiece?.name ??
                  resolution.workpieceName}
              </h3>
              {selectedWorkpiece ? (
                <>
                  <Image
                    key={selectedWorkpiece.image}
                    src={selectedWorkpiece.image}
                    alt={selectedWorkpiece.alt}
                    width={1672}
                    height={941}
                    sizes="(max-width: 600px) calc(100vw - 68px), (max-width: 900px) 65vw, (max-width: 1200px) 40vw, 680px"
                  />
                  <p>{selectedWorkpiece.judgement}</p>
                </>
              ) : null}
            </div>

            <aside className={styles.engineering} aria-live="polite">
              <section className={styles.pairedDirections}>
                <h4>{t('典型工况与设备方向', 'Typical processes & equipment')}</h4>
                {examplesLoading && visibleDirectionExamples.length === 0 ? (
                  <p className={styles.directionStatus}>{t('正在读取行业常见方向…', 'Loading typical equipment directions…')}</p>
                ) : visibleDirectionExamples.length ? (
                  <div className={styles.conditionPairs}>
                    {visibleDirectionExamples.map((example, index) => (
                      <article
                        key={`${example.condition}-${example.direction}`}
                        className={styles.conditionPair}
                      >
                        <h5>{example.condition}</h5>
                        <div className={styles.equipmentLine}>
                          <span>{t('设备方向', 'Equipment direction')}</span>
                          <strong>{example.direction}</strong>
                        </div>
                        <p className={styles.boundarySummary}>
                          {getWorkpieceBoundarySummary(directionConditions[index].boundary)}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noPublicDirection}>{t('设备方向需工程判断', 'An engineer needs to assess the equipment direction')}</p>
                )}
                {commonProcesses.length ? (
                  <p className={styles.commonProcesses}>
                    <span>{t('常见处理', 'Common treatments')}</span>
                    <strong>{commonProcesses.join('、')}</strong>
                  </p>
                ) : null}
                {visibleDirectionExamples.length ? (
                  <p className={styles.directionNote}>
                    {t(
                      '设备方向仅供初选，具体配置需结合材质、图纸和实际工况确认。',
                      'Equipment directions are for initial selection only. Confirm the configuration against the material, drawings and actual operating conditions.',
                    )}
                  </p>
                ) : null}
              </section>
              <section className={styles.engineeringNotes}>
                <h4>{t('这类工件通常难在哪', 'Key engineering considerations')}</h4>
                <ul>
                  {resolution.difficultyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          <section className={styles.contactStrip} aria-label={t('工程判断所需资料', 'Details for an engineering assessment')}>
            <div className={styles.contactGuidance}>
              <dl className={styles.customerPrompts}>
                {(english ? [['Your objective', 'Current issue or process and quality requirements'], ['Material', 'Material type and known grade'], ['Size and weight', 'Maximum dimensions and unit weight'], ['Throughput', 'Approximate pieces or tonnes per batch or day']] : CUSTOMER_PROMPTS).map(([label, hint], index) => (
                  <div key={label}>
                    <dt>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {CUSTOMER_PROMPT_ICON_PATHS[index].map((path) => <path key={path} d={path} />)}
                      </svg>
                      <span>{label}</span>
                    </dt>
                    <dd>{hint}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.contactAction}>
              <button type="button" className={styles.cta} onClick={goToForm}>
                {t('提交工况，获取工程判断', 'Request an assessment')}
                <HiArrowRight aria-hidden="true" />
              </button>
            </div>
          </section>

        </div>
      </div>
    </section>
  );
}
