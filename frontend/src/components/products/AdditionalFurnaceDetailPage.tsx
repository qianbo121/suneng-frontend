import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { getStaticProductBySlug } from '@/constants/static-products';
import type { additionalFurnaces } from '@/lib/additional-furnaces';
import { additionalFurnaceSelection } from '@/lib/additional-furnace-selection';
import { additionalFurnaceDetailContent } from '@/lib/additional-furnace-detail-content';
import { additionalFurnaceStructures } from '@/lib/additional-furnace-structure';
import type { Locale } from '@/types/site';
import { FurnaceCutawayDiagram } from './FurnaceCutawayDiagram';
import { PitFurnaceFaq, PitFurnaceGallery } from './PitFurnaceDetailClient';
import shared from './PitFurnaceDetailPage.module.css';
import styles from './AdditionalFurnaceDetailPage.module.css';

const calloutLineOrigins = {
  leftTop: { x1: 21, y1: 15 },
  leftMiddle: { x1: 21, y1: 31 },
  leftBottom: { x1: 21, y1: 43 },
  rightTop: { x1: 79, y1: 17 },
  rightMiddle: { x1: 79, y1: 41 },
  rightBottom: { x1: 79, y1: 53 },
};

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${shared.section} ${styles.section}`}>
      <header className={shared.sectionHeader}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function AdditionalFurnaceDetailPage({
  furnace,
  locale,
}: {
  furnace: (typeof additionalFurnaces)[number];
  locale: Locale;
}) {
  const en = locale === 'en';
  const name = en ? furnace.nameEn : furnace.name;
  const copy = additionalFurnaceDetailContent[furnace.id];
  const structure = additionalFurnaceStructures[furnace.id];
  const selection = additionalFurnaceSelection[furnace.id][locale];
  const inquiryHref = en
    ? `/en/contact?product=${furnace.id}#product-lead-form`
    : `/zh/inquiry?product=${furnace.id}#project-inquiry-form-fields`;
  const inquiryLabel = en ? 'Request selection advice' : '提交工况，获取选型建议';
  const structureImage = structure.image ?? `/images/products/${furnace.id}/detail-v2-20260910/02-cutaway.webp`;
  const structureCallouts = structure.parts.map((part) => ({
    target: part.target,
    label: part.title[locale],
    position: part.position,
    line: { ...calloutLineOrigins[part.position], x2: part.x, y2: part.y },
  }));
  const gallery = [
    {
      src: structure.sceneImage ?? `/images/products/${furnace.id}/detail-v2-20260910/01-scene.webp`,
      unoptimized: true,
      alt: en ? `${name} representative workshop arrangement` : `${name}设备及装卸空间场景示意`,
      caption: en ? 'Equipment scene · illustration' : '设备场景示意',
    },
    {
      src: structureImage,
      unoptimized: true,
      alt: structure.alt[locale],
      caption: en ? 'Internal cutaway · illustration' : '内部结构剖视示意',
    },
  ];
  const sectionNav = [
    ['overview', en ? 'Overview' : '产品概述'],
    ['workpieces', en ? 'Workpieces' : '适用工件'],
    ['selection', en ? 'Configuration' : '方案维度'],
    ['boundaries', en ? 'Operating limits' : '能力边界'],
    ['structure', en ? 'Key structures' : '关键结构'],
    ['faq', en ? 'Questions' : '常见问题'],
    ['related', en ? 'Related resources' : '相关资料'],
    ['inquiry', en ? 'Requirements' : '提交工况'],
  ];
  const related = copy.related.flatMap((slug) => {
    const product = getStaticProductBySlug(slug);
    return product ? [product] : [];
  });

  const PageContainer = en ? 'div' : 'main';
  return (
    <PageContainer
      className={`${shared.page} ${styles.page}`}
      data-locale={locale}
      data-furnace-detail-page
      data-additional-furnace-page={furnace.id}
    >
      <JsonLd data={[
        ...getProductDetailJsonLd({
          slug: furnace.id,
          name: copy.title[locale],
          description: copy.description[locale],
          path: `/${locale}/products/detail/${furnace.id}`,
          image: gallery.map((item) => item.src),
        }, locale),
        getFaqJsonLd(copy.faqs.map((item) => ({
          question: item.question[locale],
          answer: item.answer[locale],
        }))),
      ]} />
      <div className={shared.breadcrumbBar}>
        <div className={shared.container}>
          <Breadcrumb
            locale={locale}
            tone="dark"
            className={shared.breadcrumb}
            items={[
              { label: en ? 'Product centre' : '产品中心', href: `/${locale}/products` },
              { label: name },
            ]}
          />
        </div>
      </div>
      <div className={shared.container}>
        <section id="overview" className={`${shared.heroSection} ${styles.overview}`}>
          <PitFurnaceGallery
            images={gallery}
            galleryLabel={en ? `${name} image selection` : `${name}图片选择`}
            imageButtonPrefix={en ? 'View image' : '查看图片'}
          />
          <div className={shared.heroContent}>
            <p className={shared.heroEyebrow} lang="en">
              {furnace.englishName}
            </p>
            <h1>{copy.title[locale]}</h1>
            <div className={shared.mobileHeroAction}>
              <Button
                href={inquiryHref}
                className={`${shared.primaryButton} ${styles.primaryAction}`}
              >
                {inquiryLabel}
              </Button>
            </div>
            <p className={shared.heroDescription}>{copy.description[locale]}</p>
            <div className={shared.tagList}>
              {copy.tags.map((tag) => (
                <span className={styles.tag} key={tag.zh}>
                  {tag[locale]}
                </span>
              ))}
            </div>
            <div className={shared.heroInfoGrid}>
              {copy.heroInfo.map(([label, value]) => (
                <div key={label.zh}>
                  <span>{label[locale]}</span>
                  <strong>{value[locale]}</strong>
                </div>
              ))}
            </div>
            <div className={shared.heroActions}>
              <Button
                href={inquiryHref}
                className={`${shared.primaryButton} ${styles.primaryAction} ${styles.desktopInquiry}`}
              >
                {inquiryLabel}
              </Button>
              <Button
                href="#selection"
                variant="secondary"
                className={`${shared.secondaryButton} ${styles.secondaryAction}`}
              >
                {en ? 'View typical configuration' : '查看典型配置'}
              </Button>
            </div>
            <p className={shared.heroNotice}>
              {en
                ? 'Configuration and acceptance conditions are agreed for each project.'
                : '配置、性能与验收条件以确认的项目文件为准。'}
            </p>
          </div>
        </section>
      </div>
      <nav
        className={shared.anchorNav}
        aria-label={en ? `${name} page sections` : `${name}详情页章节导航`}
      >
        <div className={shared.container}>
          <div className={shared.anchorNavScroll}>
            {sectionNav.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <div className={shared.contentArea}>
        <div className={shared.container}>
          <Section
            id="workpieces"
            title={en ? 'Suitable workpieces and conditions to exclude' : '适用工件与需排除的工况'}
            description={
              en
                ? 'Match the workpiece, loading method and production rhythm before choosing the furnace arrangement.'
                : '先看工件形态、承托方式和生产节奏，再判断是否适合进入方案评估。'
            }
          >
            <div className={shared.workpieceCards}>
              {copy.workpieces.map((item) => (
                <article key={item.title.zh}>
                  <span className={item.caution ? shared.statusCaution : shared.statusPositive}>
                    {item.caution
                      ? en
                        ? 'Compare alternatives'
                        : '需要比较方案'
                      : en
                        ? 'Assess suitability'
                        : '可进入方案评估'}
                  </span>
                  <h3>{item.title[locale]}</h3>
                  <p>{item.text[locale]}</p>
                </article>
              ))}
            </div>
            <p className={shared.warningBar}>{selection.fit}</p>
          </Section>
          <Section
            id="selection"
            title={
              en
                ? `Four dimensions define the ${name.toLowerCase()} arrangement`
                : `四个维度确定${name}方案`
            }
            description={
              en
                ? 'These are design inputs. Select and verify the final arrangement against the actual process.'
                : '以下是方案条件，具体组合需结合工件、工艺和现场共同确认。'
            }
          >
            <div className={`${shared.panel} ${shared.dimensionPanel}`}>
              {copy.options.map((group) => (
                <div className={shared.dimensionRow} key={group.title.zh}>
                  <h3>{group.title[locale]}</h3>
                  <div>
                    {group.items.map((item) => (
                      <span key={item.zh}>{item[locale]}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div id="configuration" className={styles.anchorTarget}>
              <h3 className={styles.subheading}>
                {en ? 'Translate the duty into equipment configuration' : '把工况落实到设备配置'}
              </h3>
              <dl className={styles.configuration}>
                {selection.configuration.map((item) => (
                  <div key={item.title} className={shared.panel}>
                    <dt>{item.title}</dt>
                    <dd>{item.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Section>
          <Section
            id="boundaries"
            title={
              en
                ? 'Operating limits: load, process and site conditions'
                : '能力边界：装载、工艺与现场条件'
            }
          >
            <div className={styles.boundaryGrid}>
              {copy.boundaries.map(([term, definition]) => (
                <article className={shared.panel} key={term.zh}>
                  <h3>{term[locale]}</h3>
                  <p>{definition[locale]}</p>
                </article>
              ))}
            </div>
            <p>{en ? furnace.boundaryEn : furnace.boundary}</p>
            <div id="site" className={styles.anchorTarget}>
              <h3 className={styles.subheading}>
                {en ? 'Site conditions and supply scope' : '现场条件与供货范围'}
              </h3>
              <p>{selection.site}</p>
            </div>
            <div id="acceptance" className={styles.anchorTarget}>
              <h3 className={styles.subheading}>
                {en ? 'Agree how the equipment and parts will be accepted' : '交付前先约定怎么验收'}
              </h3>
              <ul className={styles.acceptance}>
                {selection.acceptance.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Section>
          <Section
            id="structure"
            title={
              en
                ? `${name} structures and checks before quotation`
                : `${name}关键结构与报价前确认项`
            }
            description={
              en
                ? 'Use the illustration to discuss equipment interfaces. Final details follow the agreed design.'
                : '结构示意用于沟通设备组成，实际位置、尺寸和配套范围按项目设计确认。'
            }
          >
            <div className={shared.structureFeature}>
              <FurnaceCutawayDiagram
                furnaceName={name}
                image={{
                  ...gallery[1],
                  caption: structure.caption?.[locale] ?? (en
                    ? 'Internal cutaway · Electric heating illustrated; the final arrangement follows the agreed duty.'
                    : '内部结构剖视示意 · 图示电加热配置，实际方案按工况确认。'),
                }}
                callouts={structureCallouts}
              />
              <div className={`${shared.panel} ${shared.parameterPanel}`}>
                <h3>
                  {en ? 'Five structural inputs to confirm before quotation' : '报价前先确认的 5 项结构参数'}
                </h3>
                <ol>
                  {structure.parameters.map(([title, text], i) => (
                    <li key={title.zh}>
                      <span>{i + 1}</span>
                      <div>
                        <strong>{title[locale]}</strong>
                        <p>{text[locale]}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className={shared.systemGrid}>
              {structure.parts.map((part, i) => (
                <article key={part.target}>
                  <span>{i + 1}</span>
                  <div>
                    <h3>{part.title[locale]}</h3>
                    <p>{part.description[locale]}</p>
                  </div>
                </article>
              ))}
            </div>
            <div id="principle" className={styles.anchorTarget}>
              <h3 className={styles.subheading}>
                {en ? 'How the equipment works' : '设备如何工作'}
              </h3>
              <p>{en ? furnace.principleEn : furnace.principle}</p>
              <ol className={styles.steps}>
                {(en ? furnace.stepsEn : furnace.steps).map((step, i) => (
                  <li key={step}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </Section>
          <Section
            id="faq"
            title={en ? 'Questions from purchasing and engineering teams' : '采购与技术常问的问题'}
          >
            <PitFurnaceFaq
              idPrefix={`additional-${furnace.id}-${locale}`}
              items={copy.faqs.map((item) => ({
                question: item.question[locale],
                answer: item.answer[locale],
              }))}
            />
          </Section>
          <Section
            id="related"
            title={en ? 'Related equipment and selection resources' : '相关设备与选型资料'}
          >
            <div className={styles.relatedEquipment}>
              {related.map((product) => (
                <Link href={`/${locale}/products/detail/${product.slug}`} key={product.slug}>
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    width={240}
                    height={180}
                    sizes="160px"
                  />
                  <div>
                    <h3>{product.name[locale]}</h3>
                    <p>
                      {en
                        ? 'Compare loading, process and installation conditions'
                        : '比较承托、装卸、工艺与现场条件'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {!en ? (
              <p className={styles.related}>
                <Link href="/zh/service/installation-after-sales">了解安装与售后配合</Link>
              </p>
            ) : (
              <p className={styles.related}>
                <Link href="/en/contact">Contact our engineering team</Link>
              </p>
            )}
          </Section>
          <Section
            id="inquiry"
            title={
              en ? 'Prepare these four inputs for a selection review' : '准备这四项，进入选型沟通'
            }
          >
            <ul className={styles.inputs}>
              {(en ? furnace.inputsEn : furnace.inputs).map((input) => (
                <li key={input}>{input}</li>
              ))}
            </ul>
            <Button
              href={inquiryHref}
              className={`${shared.primaryButton} ${styles.primaryAction}`}
            >
              {en ? 'Submit requirements' : '提交需求，确认适用方案'}
            </Button>
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
