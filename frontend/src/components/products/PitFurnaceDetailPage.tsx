import { corePageText, localizeCoreValue } from '@/lib/core-page-localization';
import type { Locale } from '@/types/site';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductQuoteScrollButton } from '@/components/products/ProductLeadForm';
import { getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';

import { FurnaceCutawayDiagram } from './FurnaceCutawayDiagram';
import {
  PitFurnaceFaq,
  PitFurnaceGallery,
} from './PitFurnaceDetailClient';
import styles from './PitFurnaceDetailPage.module.css';

import {
  galleryImages as sourceGalleryImages,
  sectionNav as sourceSectionNav,
  selectionDimensions as sourceSelectionDimensions,
  solutionCards as sourceSolutionCards,
  comparisonRows as sourceComparisonRows,
  boundaryData as sourceBoundaryData,
  structureParameters as sourceStructureParameters,
  structureSystems as sourceStructureSystems,
  cutawayCallouts as sourceCutawayCallouts,
  faqItems as sourceFaqItems,
  relatedEquipment as sourceRelatedEquipment,
  relatedArticles as sourceRelatedArticles,
} from './pit-furnace-detail-data';


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

function PitCutawayDiagram({ locale }: { locale: Locale }) {
  const t = (text: string) => corePageText(text, locale);
  const cutawayCallouts = localizeCoreValue(sourceCutawayCallouts, locale);
  return (
    <FurnaceCutawayDiagram locale={locale}
      furnaceName={t("井式炉")}
      image={{
        src: '/images/products/pit-furnace/pit-furnace-cutaway.png',
        alt: t("井式电阻炉地坑安装剖切结构，包含炉盖、炉衬、电热元件、导流筒、吊具和垂直工件"),
        caption: t("空气气氛井式电阻炉结构示例 · 具体配置随温度、气氛与装载变化"),
      }}
      callouts={cutawayCallouts}
      pitCompatibility
    />
  );
}

export function PitFurnaceDetailPage({ locale = 'zh' }: { locale?: Locale }) {
  const t = (text: string) => corePageText(text, locale);
  const galleryImages = localizeCoreValue(sourceGalleryImages, locale);
  const sectionNav = localizeCoreValue(sourceSectionNav, locale);
  const selectionDimensions = localizeCoreValue(sourceSelectionDimensions, locale);
  const solutionCards = localizeCoreValue(sourceSolutionCards, locale);
  const comparisonRows = localizeCoreValue(sourceComparisonRows, locale);
  const boundaryData = localizeCoreValue(sourceBoundaryData, locale);
  const structureParameters = localizeCoreValue(sourceStructureParameters, locale);
  const structureSystems = localizeCoreValue(sourceStructureSystems, locale);
  const faqItems = localizeCoreValue(sourceFaqItems, locale);
  const relatedEquipment = localizeCoreValue(sourceRelatedEquipment, locale);
  const relatedArticles = localizeCoreValue(sourceRelatedArticles, locale);
  const productDescription =
    t("井式炉用于长轴、辊轴、拉杆、套筒及吊篮装料工件的立式热处理。方案需结合有效加热区、装炉包络、温度等级、热源、冷却路径、起吊总质量和厂房条件确认。");

  return (
    <main lang={locale} className={styles.page} data-pit-furnace-page>
      <JsonLd
        id="product-jsonld-pit-furnace-dedicated"
        data={getProductDetailJsonLd(
          {
            slug: 'pit-furnace',
            path: t("/zh/products/detail/pit-furnace"),
            name: t("井式炉｜长轴类工件立式热处理"),
            alternateName: [t("井式炉"), t("井式热处理炉"), t("井式电阻炉"), 'Pit Furnace'],
            description: productDescription,
            image: galleryImages.map((item) => item.src),
            keywords: [t("井式炉"), t("井式热处理炉"), t("井式电阻炉"), t("长轴热处理"), t("井式炉定制")],
            additionalProperties: [{ name: t("热源方式"), value: t("电阻 / 燃气，按工况选择") }],
          },
          locale,
        )}
      />
      <JsonLd id="product-faq-jsonld-pit-furnace-dedicated" data={getFaqJsonLd(faqItems)} />

      <div className={styles.breadcrumbBar}>
        <div className={styles.container}>
          <Breadcrumb
            locale={locale}
            tone="dark"
            className={styles.breadcrumb}
            items={[{ label: t("产品中心"), href: t("/zh/products") }, { label: t("井式炉") }]}
          />
        </div>
      </div>

      <div className={styles.container}>
        <section id="overview" className={styles.heroSection}>
          <PitFurnaceGallery images={galleryImages} galleryLabel={locale === 'en' ? 'Pit furnace gallery' : undefined} imageButtonPrefix={locale === 'en' ? 'View image' : undefined} />

          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>PIT TYPE HEAT TREATMENT FURNACE</p>
            <h1>{t("井式炉｜长轴类工件立式热处理")}</h1>
            <div className={styles.mobileHeroAction}>
              <ProductQuoteScrollButton
                locale={locale}
                label={t("提交工况，获取选型建议")}
                className={styles.primaryButton}
                updateHash
                variant="hero"
                anchorId="inquiry"
              />
            </div>
            <p className={styles.heroDescription}>
              {t("面向长轴、辊轴、拉杆、套筒及吊篮装料工件，先根据工件长径比、装炉包络、热处理工艺、起吊路径和厂房条件判断井式炉是否适用，再确定有效加热区与结构方案。")}</p>

            <div className={styles.tagList} aria-label={t("井式炉方案标签")}>
              {[t("长轴 / 杆件"), t("吊挂或料筐装料"), t("分区控温"), t("非标方案需工况校核")].map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className={styles.heroInfoGrid}>
              <div>
                <span>{t("装料直径")}</span>
                <strong>{t("核对工件、间距与料具包络")}</strong>
              </div>
              <div>
                <span>{t("装料高度")}</span>
                <strong>{t("核对工件与装炉方式")}</strong>
              </div>
              <div>
                <span>{t("工作温度")}</span>
                <strong>{t("按材料与工艺确定")}</strong>
              </div>
              <div>
                <span>{t("热源方式")}</span>
                <strong>{t("电阻 / 燃气，按工况选择")}</strong>
              </div>
            </div>

            <div className={styles.heroActions}>
              <ProductQuoteScrollButton
                locale={locale}
                label={t("提交工况，获取选型建议")}
                className={styles.primaryButton}
                updateHash
                variant="hero"
                anchorId="inquiry"
              />
              <a href="#selection" className={styles.secondaryButton}>
                {t("查看典型配置")}</a>
            </div>
            <p className={styles.heroNotice}>
              {t("工件、间距和料具共同形成装料包络；同时核对炉口、起吊路径和厂房净高。有效加热区按约定条件测定。")}</p>
          </div>
        </section>
      </div>

      <nav className={styles.anchorNav} aria-label={t("井式炉详情页章节导航")}>
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
          <section id="workpieces" className={styles.section}>
            <SectionHeader
              title={t("适用工件与需排除的工况")}
              description={t("先看工件形态与装炉方式，再判断是否适合进入井式炉方案评估。")}
            />
            <div className={styles.workpieceCards}>
              <article>
                <span className={styles.statusPositive}>{t("通常适合评估")}</span>
                <h3>{t("长轴、辊轴、拉杆类")}</h3>
                <p>{t("更适合竖直吊装，需结合长度、直径、长径比、重心和变形要求确认。")}</p>
              </article>
              <article>
                <span className={styles.statusPositive}>{t("按装炉方式评估")}</span>
                <h3>{t("套筒、齿圈、模具芯类")}</h3>
                <p>{t("可结合吊挂、料架或料筐装炉，校核装料包络、间距与热循环空间。")}</p>
              </article>
              <article>
                <span className={styles.statusCaution}>{t("需要比较炉型")}</span>
                <h3>{t("小件批量、连续节拍类")}</h3>
                <p>{t("若规格稳定且追求连续节拍，应同时比较网带炉、推杆炉或辊底炉方案。")}</p>
              </article>
            </div>

            <Panel className={styles.conditionPanel}>
              <div>
                <h3>{t("通常可进入井式炉方案评估的条件")}</h3>
                <ul>
                  <li>{t("工件适合垂直装炉，且吊装路径明确。")}</li>
                  <li>{t("工件、料具与炉内间距能够形成清晰装料包络。")}</li>
                  <li>{t("厂房行车、净高、地坑和安全操作空间具备校核条件。")}</li>
                </ul>
              </div>
              <div>
                <h3>{t("报价前必须补齐的边界条件")}</h3>
                <ul>
                  <li>{t("长期工作温度、最高温度、工艺曲线与保温时间。")}</li>
                  <li>{t("工件净装载、随炉料具质量与最大起吊总质量。")}</li>
                  <li>{t("冷却路径、公用条件、质量目标与验收口径。")}</li>
                </ul>
              </div>
            </Panel>
            <p className={styles.warningBar}>
              {t("变形不能仅靠“炉温均匀”保证，还与材料、初始状态、长径比、装夹、支承、升降温制度和冷却方式有关。")}</p>
          </section>

          <section id="selection" className={styles.section}>
            <SectionHeader
              title={t("五个维度确定井式炉方案")}
              description={t("以下选项是方案条件，不代表系统已经替你选定最终配置。")}
            />
            <Panel className={styles.dimensionPanel}>
              {selectionDimensions.map((item) => (
                <div key={item.title} className={styles.dimensionRow}>
                  <h3>{item.title}</h3>
                  <div>
                    {item.options.map((option) => (
                      <span key={option.label}>{option.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </Panel>

            <div className={styles.solutionGrid}>
              {solutionCards.map((card) => (
                <article
                  key={card.title}
                  className={styles.solutionCard}
                  data-pit-solution-card={card.title}
                >
                  <div className={styles.solutionImage}>
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                    />
                  </div>
                  <div className={styles.solutionCardBody}>
                    <p>{card.temperature}</p>
                    <h3>{card.title}</h3>
                    <span>{card.text}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.comparisonTable}>
                <caption>{t("井式炉方案比较")}</caption>
                <thead>
                  <tr>
                    {[t("方案方向"), t("更适合的工况"), t("关键优势"), t("必须核校"), t("不应直接承诺")].map(
                      (item) => (
                        <th key={item} scope="col">
                          {item}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={cell}>{index === 0 ? <strong>{cell}</strong> : cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.temperatureNote}>
              {t("工艺温度由材料、处理目的和工艺曲线确定；同时核对长期工作温度、最高使用温度及装载条件。")}</p>
          </section>

          <section id="boundaries" className={styles.section}>
            <SectionHeader
              title={t("能力边界：有效区、装载与厂房条件")}
              description={t("把热工边界、装料边界与起吊边界分开，才能形成可核查的方案。")}
            />
            <div className={styles.boundaryEquations}>
              <div>
                <span>{t("有效加热区")}</span>
                <strong>≠</strong>
                <span>{t("炉膛结构尺寸")}</span>
              </div>
              <div>
                <span>{t("工件净装载")}</span>
                <strong>≠</strong>
                <span>{t("最大起吊总质量")}</span>
              </div>
            </div>

            <div className={styles.boundaryFeature}>
              <figure>
                <div className={styles.boundaryImageFrame}>
                  <Image
                    src="/images/products/pit-furnace/pit-furnace-interior.png"
                    alt={t("井式炉圆形炉口、耐火炉衬与竖向电热元件制造检查场景")}
                    fill
                    sizes="(min-width: 1024px) 430px, 100vw"
                  />
                </div>
                <figcaption>
                  {t("炉膛内部制造检查场景。有效加热区、元件排布、炉衬厚度与炉口结构均需按温度等级、装载和测温要求计算。")}</figcaption>
              </figure>
              <div>
                <h3>{t("有效加热区统一写为 ΦDe × He（mm）")}</h3>
                <dl>
                  <div>
                    <dt>{t("热负荷核算")}</dt>
                    <dd>{t("工件净装载＋随炉料具质量。")}</dd>
                  </div>
                  <div>
                    <dt>{t("起吊载荷核算")}</dt>
                    <dd>{t("最大起吊总质量还包括参与起吊的吊梁、吊钩和索具。")}</dd>
                  </div>
                  <div>
                    <dt>{t("厂房与机构校核")}</dt>
                    <dd>{t("起吊机构和厂房行车均应按最大起吊总质量校核。")}</dd>
                  </div>
                  <div>
                    <dt>{t("公开边界")}</dt>
                    <dd>{t("不公开未经技术审核的最大尺寸、最大装载和温差承诺。")}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <caption>{t("形成有效方案前必须拿到的数据")}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t("数据分组")}</th>
                    <th scope="col">{t("需要确认的内容")}</th>
                  </tr>
                </thead>
                <tbody>
                  {boundaryData.map(([group, content]) => (
                    <tr key={group}>
                      <th scope="row">{group}</th>
                      <td>{content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.standardGrid}>
              <article>
                <span>{t("有效加热区")}</span>
                <strong>GB/T 9452-2023</strong>
              </article>
              <article>
                <span>{t("电阻炉与试验")}</span>
                <strong>GB/T 10067.1-2019</strong>
                <strong>GB/T 10067.4-2005</strong>
                <strong>GB/T 10066.4-2004</strong>
              </article>
              <article>
                <span>{t("安全与燃烧器参考")}</span>
                <strong>GB/T 5959.1-2019</strong>
                <strong>GB/T 5226.1-2019</strong>
                <strong>{t("GB/T 19839-2025（仅作燃烧器参考）")}</strong>
              </article>
            </div>
          </section>

          <section id="structure" className={styles.section}>
            <SectionHeader
              title={t("井式炉关键结构与报价前确认项")}
              description={t("剖切示意用于建立结构语言，最终布置仍以工件、工艺、载荷和现场条件为准。")}
            />
            <div className={styles.structureFeature}>
              <PitCutawayDiagram locale={locale} />
              <Panel className={styles.parameterPanel}>
                <h3>{t("报价前先确认的 5 项结构参数")}</h3>
                <ol>
                  {structureParameters.map(([title, text], index) => (
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
              {structureSystems.map(([title, text], index) => (
                <article key={title} data-pit-system-card={index + 1}>
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
              title={t("采购与技术最常问的五个问题")}
              description={t("回答只说明选型边界，不代替最终技术方案和合同附件。")}
            />
            <PitFurnaceFaq items={faqItems} />
          </section>

          <section id="related" className={`${styles.section} ${styles.relatedSection}`}>
            <SectionHeader
              title={t("相关设备与选型资料")}
              description={t("先比较方案方向，再带着完整工况进入技术沟通。")}
            />
            <div className={styles.relatedLayout}>
              <div className={styles.relatedEquipment}>
                <h3>{t("相关设备")}</h3>
                <div>
                  {relatedEquipment.map(([title, image, alt, text]) => (
                    <article key={title} data-pit-related-equipment={title}>
                      <div className={styles.relatedImage}>
                        <Image
                          src={image}
                          alt={alt}
                          fill
                          sizes="(min-width: 1024px) 210px, 100vw"
                        />
                      </div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className={styles.relatedArticles}>
                <h3>{t("选型资料")}</h3>
                <div>
                  {relatedArticles.filter(([, href]) => href !== '#related-case-evidence' && !isWithdrawnTechnicalPath(href)).map(([title, href], index) => (
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

          <HomepageLeadForm locale={locale}
            sectionId="inquiry"
            pageType={t("井式炉详情页")}
            productTag={t("井式炉")}
            successProductTag={t("井式炉工况")}
            sourceModule="pit_furnace_detail_form"
          />
        </div>
      </div>
    </main>
  );
}
