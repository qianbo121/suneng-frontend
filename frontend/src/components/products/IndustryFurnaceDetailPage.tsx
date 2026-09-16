import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { BuyerSelectionGuide } from './BuyerSelectionGuide';
import { productBuyerGuide } from '@/lib/buyer-selection-guides';
import { getCaseArticle } from '@/lib/cases/server';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductQuoteScrollButton } from '@/components/products/ProductLeadForm';
import { getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';

import { FurnaceCutawayDiagram } from './FurnaceCutawayDiagram';
import { PitFurnaceFaq, PitFurnaceGallery } from './PitFurnaceDetailClient';
import styles from './PitFurnaceDetailPage.module.css';
import {
  industryFurnacePageConfigs,
  relatedArticles,
  type IndustryFurnaceSlug,
} from './industry-furnace-detail-data';

const sectionNav = [
  ['overview', '产品概述'],
  ['workpieces', '适用工件'],
  ['selection', '方案维度'],
  ['boundaries', '能力边界'],
  ['structure', '关键结构'],
  ['faq', '常见问题'],
  ['related', '相关资料'],
  ['inquiry', '提交工况'],
] as const;

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className={styles.sectionHeader}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.panel} ${className}`}>{children}</div>;
}

export function IndustryFurnaceDetailPage({ slug }: { slug: IndustryFurnaceSlug }) {
  const config = industryFurnacePageConfigs[slug];
  const bearingWireCase = slug === 'trolley-furnace'
    ? getCaseArticle('bearing-wire-trolley-annealing-proposal')
    : undefined;
  const productEvidenceLinks: Array<readonly [string, string]> = slug === 'mesh-belt-furnace'
    ? [
        ['网带炉产量怎样核算', '/zh/news/shuju-news-23'],
        ['网带炉整线报价的九项边界', '/zh/news/shuju-news-22'],
        ['调质网带整线产量：历史方案参考', '/zh/case/belt-quench-wash-temper-line-throughput-balance-proposal'],
        ['网带退火带速与排料：历史方案参考', '/zh/case/roller-belt-speed-loading-throughput-proposal'],
      ]
    : [bearingWireCase
      ? [bearingWireCase.title, `/zh/case/${bearingWireCase.slug}`]
      : ['查看本设备相关方案与项目资料', '#related-case-evidence']];
  const evidenceLinks: Array<readonly [string, string]> = [
    ...productEvidenceLinks,
    ['企业资质与专利证书原件', '/zh/strength/honors'],
    ...relatedArticles,
  ];
  const sourceModule = `${slug.replaceAll('-', '_')}_detail_form`;

  return (
    <main className={styles.page} data-industry-furnace-page={slug} data-furnace-detail-page>
      <JsonLd
        id={`product-jsonld-${slug}-dedicated`}
        data={getProductDetailJsonLd(
          {
            slug,
            path: `/zh/products/detail/${slug}`,
            name: config.title,
            alternateName: [config.name, config.englishName],
            description: config.description,
            image: config.gallery.map((item) => item.src),
            keywords: [config.name, `${config.name}定制`, `${config.name}选型`, '工业热处理炉'],
            additionalProperties: config.productProperties,
          },
          'zh',
        )}
      />
      <JsonLd id={`product-faq-jsonld-${slug}-dedicated`} data={getFaqJsonLd(config.faqs)} />

      <div className={styles.breadcrumbBar}>
        <div className={styles.container}>
          <Breadcrumb
            locale="zh"
            tone="dark"
            className={styles.breadcrumb}
            items={[{ label: '产品中心', href: '/zh/products' }, { label: config.name }]}
          />
        </div>
      </div>

      <div className={styles.container}>
        <section id="overview" className={styles.heroSection}>
          <PitFurnaceGallery images={config.gallery} galleryLabel={`${config.name}图片选择`} />

          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>{config.englishName}</p>
            <h1>{config.title}</h1>
            {['box-furnace', 'rotary-hearth-furnace'].includes(slug) && (
              <div className={styles.mobileHeroAction}>
                <ProductQuoteScrollButton
                  locale="zh"
                  label="提交工况，获取选型建议"
                  className={styles.primaryButton}
                  updateHash
                  variant="hero"
                  anchorId="inquiry"
                />
              </div>
            )}
            <p className={styles.heroDescription}>{config.description}</p>

            <div className={styles.tagList} aria-label={`${config.name}方案标签`}>
              {config.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className={styles.heroInfoGrid}>
              {config.heroInfo.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.heroActions}>
              <ProductQuoteScrollButton
                locale="zh"
                label="提交工况，获取选型建议"
                className={styles.primaryButton}
                updateHash
                variant="hero"
                anchorId="inquiry"
              />
              <a href="#selection" className={styles.secondaryButton}>
                查看典型配置
              </a>
            </div>
            <p className={styles.heroNotice}>{config.heroNotice}</p>
          </div>
        </section>
      </div>

      <nav className={styles.anchorNav} aria-label={`${config.name}详情页章节导航`}>
        <div className={styles.container}>
          <div className={styles.anchorNavScroll}>
            {sectionNav.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className={styles.contentArea}>
        <div className={styles.container}>
          {productBuyerGuide[slug] && <BuyerSelectionGuide guideKey={productBuyerGuide[slug]} />}
          <section id="workpieces" className={styles.section}>
            <SectionHeader
              title="适用工件与需排除的工况"
              description={`先看工件形态、装料或输送方式，再判断是否适合进入${config.name}方案评估。`}
            />
            <div className={styles.workpieceCards}>
              {config.workpieces.map((item) => (
                <article key={item.title}>
                  <span
                    className={
                      item.tone === 'positive' ? styles.statusPositive : styles.statusCaution
                    }
                  >
                    {item.status}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <Panel className={styles.conditionPanel}>
              <div>
                <h3>通常可进入方案评估的条件</h3>
                <ul>
                  {config.suitableConditions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>报价前必须补齐的边界条件</h3>
                <ul>
                  {config.requiredConditions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Panel>
            <p className={styles.warningBar}>{config.workpieceWarning}</p>
          </section>

          <section id="selection" className={styles.section}>
            <SectionHeader
              title={`五个维度确定${config.name}方案`}
              description="以下选项是方案条件，不代表系统已经替你选定最终配置。"
            />

            <Panel className={styles.dimensionPanel}>
              {config.optionGroups.map((group) => (
                <div key={group.title} className={styles.dimensionRow}>
                  <h3>{group.title}</h3>
                  <div>
                    {group.options.map((option) => (
                      <span key={option}>{option}</span>
                    ))}
                  </div>
                </div>
              ))}
            </Panel>

            <div className={styles.solutionGrid}>
              {config.solutions.map((solution) => (
                <article
                  key={solution.title}
                  className={`${styles.solutionCard} ${solution.image ? '' : styles.solutionTextCard}`}
                >
                  {solution.image && (
                    <div className={styles.solutionImage}>
                      <Image
                        src={solution.image}
                        alt={solution.alt ?? solution.title}
                        fill
                        sizes="(min-width: 1100px) 300px, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <div className={styles.solutionCardBody}>
                    <p>{solution.eyebrow}</p>
                    <h3>{solution.title}</h3>
                    <span>{solution.text}</span>
                    {!solution.image && (
                      <dl className={styles.solutionCardChecks}>
                        <dt>适用条件</dt>
                        <dd>{solution.suitable}</dd>
                        <dt>核对重点</dt>
                        <dd>{solution.verify}</dd>
                        <dt>验收边界</dt>
                        <dd>{solution.noPromise}</dd>
                      </dl>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.comparisonTable}>
                <caption>方案比较与报价前核校</caption>
                <thead>
                  <tr>
                    <th scope="col">对应方案</th>
                    <th scope="col">更适合的工况</th>
                    <th scope="col">关键优势</th>
                    <th scope="col">必须核校</th>
                    <th scope="col">不应直接承诺</th>
                  </tr>
                </thead>
                <tbody>
                  {config.solutions.map((solution) => (
                    <tr key={solution.title}>
                      <td>{solution.title}</td>
                      <td>{solution.suitable}</td>
                      <td>{solution.advantage}</td>
                      <td>{solution.verify}</td>
                      <td>{solution.noPromise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="boundaries" className={styles.section}>
            <SectionHeader
              title="能力边界：有效区、装载与现场条件"
              description="把工作空间、装料或输送变量和设备结构变量分开，才能形成可核验的技术方案。"
            />

            <div className={styles.boundaryEquations}>
              {config.equations.map(([left, symbol, right]) => (
                <div key={`${left}-${right}`}>
                  <span>{left}</span>
                  <strong>{symbol}</strong>
                  <span>{right}</span>
                </div>
              ))}
            </div>

            <div className={styles.boundaryFeature}>
              <figure>
                <div className={styles.boundaryImageFrame}>
                  <Image
                    src={config.boundaryImage.src}
                    unoptimized={config.boundaryImage.unoptimized}
                    alt={config.boundaryImage.alt}
                    fill
                    sizes="(min-width: 1100px) 480px, 100vw"
                  />
                </div>
                <figcaption>{config.boundaryImage.caption}</figcaption>
              </figure>
              <div>
                <h3>边界变量必须分开表达</h3>
                <dl>
                  {config.boundaryFacts.map(([term, definition]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{definition}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <caption>形成有效方案前必须拿到的数据</caption>
                <thead>
                  <tr>
                    <th scope="col">数据分组</th>
                    <th scope="col">需要确认的内容</th>
                  </tr>
                </thead>
                <tbody>
                  {config.requiredData.map(([group, content]) => (
                    <tr key={group}>
                      <th scope="row">{group}</th>
                      <td>{content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.standardGrid}>
              {config.standards.map((standard) => (
                <article key={standard.group}>
                  <span>{standard.group}</span>
                  {standard.items.map((item) => (
                    <strong key={item}>{item}</strong>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <section id="structure" className={styles.section}>
            <SectionHeader
              title={`${config.name}关键结构与报价前确认项`}
              description="结构示例用于建立设备语言，最终布置仍以工件、工艺、载荷、节拍和现场条件为准。"
            />
            <div className={styles.structureFeature}>
              <FurnaceCutawayDiagram
                furnaceName={config.name}
                image={config.structureImage}
                callouts={config.structureCallouts}
                markerLabels={slug === 'trolley-furnace'}
              />

              <Panel className={styles.parameterPanel}>
                <h3>报价前先确认的 5 项结构参数</h3>
                <ol>
                  {config.structureParameters.map(([title, text], index) => (
                    <li key={title}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{title}</strong>
                        <p>{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>

            <div className={styles.systemGrid}>
              {config.structureSystems.map(([title, text], index) => (
                <article key={title}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="faq" className={styles.section}>
            <SectionHeader
              title="采购与技术最常问的五个问题"
              description="回答只说明选型边界，不代替最终技术方案和合同附件。"
            />
            <PitFurnaceFaq items={config.faqs} idPrefix={slug} />
          </section>

          <section id="related" className={`${styles.section} ${styles.relatedSection}`}>
            <SectionHeader
              title="相关设备与选型资料"
              description="先比较装料或输送方向，再带着完整工况进入技术沟通。"
            />
            <div className={styles.relatedLayout}>
              <div className={styles.relatedEquipment}>
                <h3>相关设备</h3>
                <div>
                  {config.related.map((item) => (
                    <article key={item.title}>
                      <Link href={item.href} aria-label={`查看${item.title}详情`}>
                        <div className={styles.relatedImage}>
                          <Image
                            src={item.image}
                            alt={item.alt}
                            fill
                            sizes="(min-width: 1024px) 210px, 100vw"
                          />
                        </div>
                      </Link>
                      <h4>{item.title}</h4>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className={styles.relatedArticles}>
                <h3>选型资料</h3>
                <div>
                  {evidenceLinks.filter(([, href]) => href !== '#related-case-evidence' && !isWithdrawnTechnicalPath(href)).map(([title, href], index) => (
                    <Link key={href} href={href}>
                      <span>{index + 1}</span>
                      <strong>{title}</strong>
                      <HiArrowRight aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <HomepageLeadForm
            sectionId="inquiry"
            pageType={`${config.name}详情页`}
            productTag={config.name}
            successProductTag={`${config.name}工况`}
            sourceModule={sourceModule}
          />
        </div>
      </div>
    </main>
  );
}
