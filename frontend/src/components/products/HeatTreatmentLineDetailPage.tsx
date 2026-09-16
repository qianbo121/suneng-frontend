import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight, HiCheck, HiOutlineDocumentArrowDown } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductLeadForm, ProductQuoteScrollButton } from '@/components/products/ProductLeadForm';
import {
  getLineParameterSheet,
  heatTreatmentLines,
  heatTreatmentLineScope,
  type HeatTreatmentLine,
} from '@/lib/heat-treatment-lines';
import { getBreadcrumbJsonLd, getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';
import { siteSettings } from '@/mock/siteSettings';

import { AnnealingLineFaq } from './AnnealingLineFaq';
import base from './AnnealingSolutionLineDetailPage.module.css';
import styles from './HeatTreatmentLineDetailPage.module.css';

const sections = [
  ['fit', '适用判断'],
  ['routes', '工艺与设备'],
  ['selection', '选型与产能'],
  ['scope', '供货边界'],
  ['acceptance', '验收要求'],
  ['evaluation', '提交工况'],
] as const;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className={styles.bullets}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <header className={styles.heading}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}

export function HeatTreatmentLineDetailPage({ line }: { line: HeatTreatmentLine }) {
  const path = `/zh/products/detail/${line.slug}`;
  const faqs = line.faq.map(([question, answer]) => ({ question, answer }));
  const phone = siteSettings.salesPhone.replace(/^\+86-?/, '');

  return (
    <div className={`${base.page} ${styles.page}`} data-heat-treatment-line={line.slug}>
      <JsonLd
        id={`breadcrumb-${line.slug}`}
        data={getBreadcrumbJsonLd([
          { name: '首页', url: 'https://www.jssngyl.cn/zh' },
          { name: '产品中心', url: 'https://www.jssngyl.cn/zh/products' },
          { name: line.title, url: `https://www.jssngyl.cn${path}` },
        ])}
      />
      <JsonLd
        id={`product-${line.slug}`}
        data={getProductDetailJsonLd(
          {
            slug: line.slug,
            path,
            name: line.title,
            description: line.hero,
            ...(line.image ? { image: line.image } : {}),
            dateModified: '2026-09-05',
          },
          'zh',
        )}
      />
      <JsonLd id={`faq-${line.slug}`} data={getFaqJsonLd(faqs)} />

      <div className={base.breadcrumbBar}>
        <div className={base.container}>
          <Breadcrumb
            locale="zh"
            tone="dark"
            className={base.breadcrumb}
            items={[{ label: '产品中心', href: '/zh/products' }, { label: line.cardTitle }]}
          />
        </div>
      </div>

      <section className={`${base.container} ${styles.hero}`} aria-labelledby="line-title">
        <div>
          <p className={base.heroSeries}>{line.eyebrow}</p>
          <h1 id="line-title">{line.title}</h1>
          <p className={base.heroLead}>{line.hero}</p>
          <ul className={styles.tags} aria-label="方案特点">
            {line.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className={base.heroActions}>
            <ProductQuoteScrollButton
              anchorId="evaluation"
              label="提交工况，获取初步方案"
              updateHash
              className={base.primaryButton}
            />
            <a href={getLineParameterSheet(line.slug)} download className={base.secondaryButton}>
              <HiOutlineDocumentArrowDown aria-hidden="true" /> 询价参数清单
            </a>
          </div>
          <p className={base.heroNote}>
            配置与指标按代表工件和工艺核算，具体供货范围以技术协议为准。
          </p>
        </div>
        {line.image ? (
          <figure className={base.heroMedia}>
            <Image
              src={line.image}
              alt={`${line.title}设备示意`}
              width={1672}
              height={941}
              priority
              sizes="(max-width: 767px) 100vw, 48vw"
            />
            <figcaption>设备示意</figcaption>
          </figure>
        ) : (
          <aside className={styles.systemDiagram} aria-label="工艺关系示意">
            <span className={styles.diagramLabel}>{line.category} · 工艺示意</span>
            <h2>从来料到质量验证</h2>
            <ol>
              {line.routes[0].steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
            <p>按工艺关系展示，具体炉型、设备数量与现场布置由方案确定。</p>
          </aside>
        )}
      </section>

      <nav className={base.anchorNav} aria-label="本页导航">
        <div className={base.container}>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="fit" className={`${base.container} ${base.section}`}>
        <Heading title={line.direct_heading} description={line.direct} />
        <div className={styles.twoColumns}>
          <article className={styles.panel}>
            <h3>
              <HiCheck aria-hidden="true" />
              适合进入方案评估
            </h3>
            <BulletList items={line.fit} />
          </article>
          <article className={`${styles.panel} ${styles.warm}`}>
            <h3>这些条件需要先解决</h3>
            <BulletList items={line.not_fit} />
          </article>
        </div>
      </section>

      <section id="routes" className={`${base.section} ${base.softSection}`}>
        <div className={base.container}>
          <Heading
            title="工艺怎么衔接，需要哪些设备？"
            description="先确定材料与质量目标，再确认装载、加热、冷却和各段衔接；以下路线按项目选用。"
          />
          <div className={styles.routeStack}>
            {line.routes.map((route) => (
              <article key={route.title} className={styles.route}>
                <h3>{route.title}</h3>
                <ol className={styles.flow}>
                  {route.steps.map((step, index) => (
                    <li key={step}>
                      <span>{step}</span>
                      {index < route.steps.length - 1 && <HiArrowRight aria-hidden="true" />}
                    </li>
                  ))}
                </ol>
                <p>{route.note}</p>
              </article>
            ))}
          </div>
          <div className={styles.configuration}>
            {line.configuration.map((item, index) => {
              const [title, ...body] = item.split('：');
              return (
                <article key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body.join('：')}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className={styles.boundary}>
            <h3>方案中需要明确的条件</h3>
            <BulletList items={line.boundaries} />
          </aside>
        </div>
      </section>

      <section id="selection" className={`${base.container} ${base.section}`}>
        <Heading
          title="选型前要确认哪些参数？"
          description="可先提供已有资料，关键缺项在方案评估时补齐。"
        />
        <dl className={styles.inputs}>
          {line.decision.map(([title, detail]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
        <article className={styles.capacity}>
          <span>产能核算</span>
          <h3>产量由整条工艺链共同决定</h3>
          <p>{line.capacity}</p>
          <p className={styles.capacityNote}>
            温度、节拍、合格产出与能源消耗应绑定同一代表工况，分别约定测试方法。
          </p>
        </article>
      </section>

      <section id="scope" className={`${base.section} ${base.softSection}`}>
        <div className={base.container}>
          <Heading
            title="苏能提供什么，现场需要配套什么？"
            description="报价前逐项确认设备段、接口与责任；整线名称不代表包含所有上下游及公辅工程。"
          />
          <div className={styles.twoColumns}>
            <article className={styles.panel}>
              <h3>设备供方范围（按合同确认）</h3>
              <BulletList items={heatTreatmentLineScope.supplier} />
            </article>
            <article className={styles.panel}>
              <h3>业主或总包配合事项</h3>
              <BulletList items={heatTreatmentLineScope.owner} />
            </article>
          </div>
        </div>
      </section>

      <section id="acceptance" className={`${base.container} ${base.section}`}>
        <Heading
          title="怎么证明设备和工艺达到要求？"
          description="先约定代表材料、规格、装载、运行时间、检测方法和判定条件，再开展分阶段验证。"
        />
        <div className={styles.acceptance}>
          <article>
            <h3>共同验收项目</h3>
            <BulletList items={heatTreatmentLineScope.acceptance} />
          </article>
          <article className={styles.focusChecks}>
            <h3>本方案重点验证</h3>
            <BulletList items={line.acceptance_extra} />
          </article>
        </div>
      </section>

      <section id="faq" className={`${base.section} ${base.softSection}`}>
        <div className={base.container}>
          <Heading title="选型与使用常见问题" />
          <AnnealingLineFaq items={faqs} styles={base} />
          <nav className={styles.related} aria-label="其他生产线">
            <h3>继续比较相关方案</h3>
            {heatTreatmentLines
              .filter((item) => item.slug !== line.slug)
              .map((item) => (
                <Link key={item.slug} href={`/zh/products/detail/${item.slug}`}>
                  {item.cardTitle}
                  <HiArrowRight aria-hidden="true" />
                </Link>
              ))}
          </nav>
        </div>
      </section>

      <section id="evaluation" className={base.formSection}>
        <div className={base.container}>
          <ProductLeadForm
            locale="zh"
            anchorId="line-inquiry"
            title={`评估${line.cardTitle}`}
            description="请在项目需求中注明材料、规格、目标工艺、产能及现场条件；也可先下载上方参数清单整理。"
            leadBullets={line.decision.slice(0, 4).map(([title, detail]) => `${title}：${detail}`)}
            submitLabel="提交工况，获取初步方案"
            phone={phone}
            email={siteSettings.email}
          />
        </div>
      </section>
    </div>
  );
}
