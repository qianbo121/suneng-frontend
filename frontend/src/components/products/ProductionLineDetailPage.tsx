import type { Locale } from '@/types/site';
import { getEnglishLineProcess } from '@/lib/production-line-content-en';
import { isWithdrawnTechnicalPath, TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import Link from 'next/link';
import { HiArrowRight, HiChevronDown } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { getStaticProductBySlug } from '@/constants/static-products';
import type { LineTable, ProductionLineContent } from '@/lib/production-line-types';
import { ProductionLineHeroDiagram } from './ProductionLineFlow';
import { ProductionLineProcess } from './ProductionLineProcess';
import { getLineProcessSteps, productionLineProcessMaps } from '@/lib/production-line-process-map';
import { ProductionLineImage } from './ProductionLineImage';
import { getHeatTreatmentLine } from '@/lib/heat-treatment-lines';
import { getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';

import { ProductionLineAnchorNav, ProductionLineGallery } from './ProductionLineInteractions';
import styles from './FastenerLineDetailPage.module.css';
import processStyles from './ProductionLineProcess.module.css';

function Photo({
  content,
  id,
  alt,
  className,
}: {
  content: ProductionLineContent;
  id: string | null;
  alt?: string;
  className?: string;
}) {
  const photo = id ? content.images[id] : undefined;
  if (!photo) return null;
  const sizes =
    className === styles.wholeLine
      ? content.pageId === 'aluminum-solution-aging-line'
        ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1039px) calc(100vw - 80px), 960px'
        : '(max-width: 767px) calc(100vw - 40px), (max-width: 1359px) calc(100vw - 80px), 1280px'
      : className === styles.workpieceImage
        ? content.sections.workpieces.cards.length === 2
          ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1359px) calc((100vw - 112px) / 2), 624px'
          : '(max-width: 767px) calc(100vw - 40px), (max-width: 1359px) calc((100vw - 144px) / 3), 410px'
        : className === styles.schemeImage
          ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1359px) calc((100vw - 112px) / 2), 624px'
          : '(max-width: 767px) calc(100vw - 40px), (max-width: 959px) calc(100vw - 80px), (max-width: 1359px) calc(55vw - 62px), 686px';
  return (
    <ProductionLineImage
      photo={photo}
      alt={alt ?? photo.alt}
      sizes={sizes}
      className={className ?? styles.photo}
    />
  );
}

function Heading({
  title,
  subtitle,
  splitTitle = false,
}: {
  title: string;
  subtitle?: string;
  splitTitle?: boolean;
}) {
  return (
    <div className={styles.heading}>
      <h2>
        {splitTitle
          ? title.split('，').map((part, index) => (
              <span className={styles.titleLine} key={part}>
                {part}
                {index === 0 ? '，' : ''}
              </span>
            ))
          : title}
      </h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function ComparisonTable({ data, id, locale = 'zh' }: { data: LineTable; id: string; locale?: Locale }) {
  return (
    <>
      <p id={`${id}-scroll-hint`} className={styles.scrollHint}>
        {locale === 'en' ? 'Scroll horizontally to view the complete comparison' : '左右滑动查看完整对照表'}
      </p>
      <div
        className={styles.tableScroll}
        role="region"
        aria-label={data.caption}
        aria-describedby={`${id}-scroll-hint`}
        tabIndex={0}
      >
        <table className={styles.comparisonTable}>
          <caption className={styles.srOnly}>{data.caption}</caption>
          <thead>
            <tr>
              {data.columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.item}>
                <th scope="row">{row.item}</th>
                {row.cells.map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function relatedHref(label: string, locale: Locale): string | undefined {
  const furnace =
    ['网带炉', 'Mesh Belt Furnace'].includes(label) ? 'mesh-belt-furnace' : ['箱式炉', 'Box Furnace'].includes(label) ? 'box-furnace' : undefined;
  if (furnace && getStaticProductBySlug(furnace)) return `/${locale}/products/detail/${furnace}`;
  if (['网带式渗碳淬火生产线', 'Mesh Belt Carburizing & Quenching Line'].includes(label) && getHeatTreatmentLine('mesh-belt-carbonitriding-line'))
    return `/${locale}/products/detail/mesh-belt-carbonitriding-line`;
  return undefined;
}

export function ProductionLineDetailPage({ content, locale = 'zh' }: { content: ProductionLineContent; locale?: Locale }) {
  const en = locale === 'en';
  const t = (zh: string, english: string) => en ? english : zh;
  const processData = en ? getEnglishLineProcess(content.pageId) : { model: productionLineProcessMaps[content.pageId], steps: getLineProcessSteps(content) };
  const s = content.sections;
  const inquiryConditions = s.inquiry.form.fields
    .filter((field) => field.name !== 'contact_method')
    .map((field) => field.label)
    .join(en ? ', ' : '、');
  const earlyInquiry = [
    'fastener-quench-temper-line',
    'aluminum-solution-aging-line',
    'roller-mesh-belt-line',
    'mesh-belt-carbonitriding-line',
    'copper-wire-annealing-line',
    'annealing-solution-line',
    'track-shoe-press-quench-line',
    'forging-waste-heat-qt-line',
    'multi-furnace-quench-cell',
    'aluminum-forging-heating-line',
    'cylinder-curing-line',
  ].includes(content.pageId);
  const heroFacts = (
    <dl className={styles.facts}>
      {s.overview.facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
  const heroActions = (
    <div className={styles.heroActions}>
      {s.overview.actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className={action.style === 'primary' ? styles.primaryButton : styles.secondaryButton}
        >
          {action.label}
          {action.style === 'primary' && <HiArrowRight aria-hidden="true" />}
        </a>
      ))}
    </div>
  );
  const path = `/${locale}/products/detail/${content.pageId}`;
  return (
    <>
    <div
      className={styles.page}
      lang={locale}
      data-fastener-page={content.pageId === 'fastener-quench-temper-line' ? '' : undefined}
      data-heat-treatment-line={content.pageId}
      data-line-variant={content.variant}
      data-early-inquiry={earlyInquiry ? '' : undefined}
    >
      <JsonLd
        id="fastener-product"
        data={getProductDetailJsonLd(
          {
            slug: content.pageId,
            path,
            name: s.overview.title,
            description: s.overview.description,
            ...(content.images['hero-line'] ? { image: content.images['hero-line'].src } : {}),
          },
          locale,
        )}
      />
      <JsonLd id="fastener-faq" data={getFaqJsonLd(s.faq.items)} />
      <div className={styles.breadcrumbBar}>
        <div className={styles.container}>
          <Breadcrumb
            locale={locale}
            tone="dark"
            currentLabel={s.overview.title}
            items={[{ label: t('产品中心', 'Product Center'), href: `/${locale}/products` }]}
          />
        </div>
      </div>

      <section id="overview" className={styles.overview} aria-labelledby="fastener-title">
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroIntro}>
            <h1 id="fastener-title">{s.overview.title}</h1>
            <p className={styles.subtitle}>{s.overview.subtitle}</p>
            <p className={styles.heroDescription}>{s.overview.description}</p>
          </div>
          {content.images['hero-line'] ? (
            <ProductionLineGallery
              key={content.pageId}
              images={content.images}
              items={s.overview.gallery}
              locale={locale}
            />
          ) : (
            <ProductionLineHeroDiagram content={content} />
          )}
          <div className={styles.heroDetails}>
            {earlyInquiry ? (
              <>
                {heroActions}
                {heroFacts}
              </>
            ) : (
              <>
                {heroFacts}
                {heroActions}
              </>
            )}
          </div>
        </div>
      </section>

      <ProductionLineAnchorNav locale={locale} items={content.sectionNavigation.filter((item) => TECHNICAL_CONTENT_PUBLISHED || item.href !== '#project')} />

      <section id="workpieces" className={`${styles.section} ${styles.soft}`}>
        <div className={styles.container}>
          <Heading title={s.workpieces.title} subtitle={s.workpieces.subtitle} />
          <div className={styles.workpieceGrid} data-count={s.workpieces.cards.length}>
            {s.workpieces.cards.map((card) => (
              <article key={card.id}>
                <Photo
                  content={content}
                  id={card.imageAssetId}
                  alt={card.imageAlt}
                  className={styles.workpieceImage}
                />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
          {s.workpieces.note && <p className={styles.note}>{s.workpieces.note}</p>}
        </div>
      </section>

      <section
        id="process"
        className={`${styles.section} ${processStyles.section}`}
        data-process-section
      >
        <div className={`${styles.container} ${processStyles.content}`}>
          <ProductionLineProcess
            key={content.pageId}
            pageId={content.pageId}
            process={s.process}
            image={s.process.imageAssetId ? content.images[s.process.imageAssetId] : undefined}
            model={processData.model}
            steps={processData.steps}
            locale={locale}
          />
        </div>
      </section>

      {s.comparison && (
        <section id="comparison" className={styles.section}>
          <div className={styles.container}>
            <Heading title={s.comparison.title} subtitle={s.comparison.subtitle} />
            <div className={styles.schemeGrid}>
              {s.comparison.schemes.map((scheme) => (
                <article key={scheme.id}>
                  <Photo
                    content={content}
                    id={scheme.imageAssetId}
                    alt={scheme.imageAlt}
                    className={styles.schemeImage}
                  />
                  <h3>{scheme.title}</h3>
                  <p>{scheme.description}</p>
                </article>
              ))}
            </div>
            <ComparisonTable locale={locale} data={s.comparison.table} id="scheme-table" />
          </div>
        </section>
      )}

      <section id="configuration" className={`${styles.section} ${styles.soft}`}>
        <div className={styles.container}>
          <Heading title={s.configuration.title} subtitle={s.configuration.subtitle} />
          <ComparisonTable locale={locale} data={s.configuration.table} id="configuration-table" />
          {s.configuration.inputs && (
            <div className={styles.configurationInputs}>
              <h3>{t('选型沟通要确认的工况', 'Operating conditions to confirm')}</h3>
              <dl className={styles.requirements}>
                {s.configuration.inputs.map((item) => (
                  <div key={item.title}>
                    <dt>{item.title}</dt>
                    <dd>{item.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div className={styles.configurationNotes}>
            <div>
              {s.configuration.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
            <a href={s.configuration.action.href} className={styles.primaryButton}>
              {s.configuration.action.label}
              <HiArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="site-conditions" className={styles.section}>
        <div className={styles.container}>
          <Heading title={s['site-conditions'].title} />
          {s['site-conditions'].capacity && (
            <p className={styles.capacityText}>{s['site-conditions'].capacity}</p>
          )}
          <div
            className={s['site-conditions'].imageAssetId ? styles.siteGrid : styles.siteTextGrid}
          >
            {s['site-conditions'].imageAssetId && (
              <figure>
                <Photo
                  content={content}
                  id={s['site-conditions'].imageAssetId}
                  alt={s['site-conditions'].imageAlt}
                />
                <figcaption>{s['site-conditions'].imageCaption}</figcaption>
              </figure>
            )}
            <dl className={styles.requirements}>
              {s['site-conditions'].requirements.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {TECHNICAL_CONTENT_PUBLISHED && content.projectReference && (
        <section id="project" className={styles.section}>
          <div className={styles.container}>
            <Heading
              title={content.projectReference.title}
              subtitle={content.projectReference.description}
            />
            <ComparisonTable locale={locale} data={content.projectReference.table} id="project-reference-table" />
            <p className={styles.note}>{content.projectReference.note}</p>
            <Link href={content.projectReference.href} className={styles.secondaryButton}>
              {t('查看河南项目公开记录', 'View the public Henan project record')} <HiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      <section id="delivery-scope" className={`${styles.section} ${styles.soft}`}>
        <div className={styles.container}>
          <Heading title={s['delivery-scope'].title} subtitle={s['delivery-scope'].subtitle} />
          <div
            className={
              s['delivery-scope'].imageAssetId ? styles.deliveryGrid : styles.deliveryTextGrid
            }
          >
            <Photo
              content={content}
              id={s['delivery-scope'].imageAssetId}
              alt={s['delivery-scope'].imageAlt}
            />
            <div>
              <h3>{s['delivery-scope'].contentTitle}</h3>
              <dl className={styles.scopeList}>
                {s['delivery-scope'].items.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.note}>{s['delivery-scope'].note}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="acceptance" className={styles.section}>
        <div className={styles.container}>
          <Heading title={s.acceptance.title} subtitle={s.acceptance.subtitle} />
          <div className={styles.acceptanceGrid}>
            {s.acceptance.columns.map((column) => (
              <article key={column.id}>
                <h3>{column.title}</h3>
                <p>{column.description}</p>
              </article>
            ))}
          </div>
          <p className={styles.note}>{s.acceptance.productNote}</p>
          <ol className={styles.timeline}>
            {s.acceptance.stages.map((stage) => (
              <li key={stage.id}>
                <span className={styles.stepNumber}>{stage.order}</span>
                <span>{stage.label}</span>
                <HiArrowRight aria-hidden="true" />
              </li>
            ))}
          </ol>
          <p className={styles.note}>{s.acceptance.note}</p>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.soft}`}>
        <div className={`${styles.container} ${styles.faqGrid}`}>
          <Heading title={s.faq.title} subtitle={s.faq.subtitle} />
          <div className={styles.faqList}>
            {s.faq.items.map((item) => (
              <details key={item.id} open={item.defaultOpen} className={styles.faqItem}>
                <summary>
                  <h3>{item.question}</h3>
                  <HiChevronDown aria-hidden="true" />
                </summary>
                <div className={styles.faqAnswer}>
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
          <aside className={styles.related} aria-label={t('相关内容', 'Related resources')}>
            {s.faq.relatedGroups.map((group) => ({ ...group, links: group.links.filter((item) => !isWithdrawnTechnicalPath(item.href ?? relatedHref(item.label, locale) ?? '')) })).filter((group) => group.links.length).map((group) => (
              <div key={group.id}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((item) => {
                    const href = item.href ?? relatedHref(item.label, locale);
                    return (
                      <li key={item.label}>
                        {href ? (
                          href.startsWith('/downloads/') ? <a href={href} download>
                            {item.label}
                            <HiArrowRight aria-hidden="true" />
                          </a> : <Link href={href}>
                            {item.label}
                            <HiArrowRight aria-hidden="true" />
                          </Link>
                        ) : (
                          <span>{item.label}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </section>

    </div>

    <EntryCaseEvidence entryPath={`/products/detail/${content.pageId}`} locale={locale} />

    <div className={styles.page}>
      <HomepageLeadForm
        key={content.pageId}
        sectionId="inquiry"
        locale={locale}
        eyebrow={`${s.overview.title} · ${t('方案咨询', 'Project consultation')}`}
        pageType="热处理生产线产品页"
        productTag={s.overview.title}
        successProductTag={s.overview.title}
        sourceModule="production_line_form"
        inquiryProduct={s.overview.title}
        inquiryDirection="新建热处理生产线"
        problemPlaceholder={en ? `For example: ${inquiryConditions}. Share what you know.` : `例如：${inquiryConditions}，已知信息先填`}
        inquiryHint={en ? `Start with ${inquiryConditions}. Further documents can follow.` : `可先说明${inquiryConditions}，详细资料可后续补充。`}
      />
    </div>
    </>
  );
}
