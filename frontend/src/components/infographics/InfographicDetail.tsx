import type { Locale } from '@/types/site';
import Image from 'next/image';
import Link from 'next/link';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import {
  getInfographicImageSrcSet,
  getInfographicPages,
  getInfographicTopicLabel,
  type InfographicResource,
} from '@/lib/infographics';
import { ResourceDetailBreadcrumb } from '@/components/news/ResourceReturnLink';
import { InfographicToc } from './InfographicToc';
import styles from './InfographicDetail.module.css';

// Match the frame padding and the sidebar breakpoints in InfographicDetail.module.css.
const graphicSizes =
  '(max-width: 399px) calc(100vw - 50px), (max-width: 700px) calc(100vw - 58px), ' +
  '(max-width: 767px) calc(100vw - 302px), (max-width: 1045px) calc(100vw - 326px), 720px';

export function InfographicDetail({ resource, locale = 'zh' }: { resource: InfographicResource; locale?: Locale }) {
  const en = locale === 'en';
  const topicLabel = getInfographicTopicLabel(resource, locale);
  const pages = getInfographicPages(resource);
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <ResourceDetailBreadcrumb locale={locale} contentType="infographic" />
      </div>
      <div className={styles.layout}>
        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <InfographicToc locale={locale} />
          </div>
          <div className={`${styles.sideBlock} ${styles.related}`}>
            <p className={styles.sideLabel}>{en ? 'Related topics' : '相关主题'}</p>
            <Link
              href={`/${locale}/news?format=infographic&${resource.furnaces.length && resource.equipmentLabel !== '叉车炉' ? `furnace=${resource.furnaces[0]}` : `q=${encodeURIComponent(resource.equipmentLabel)}`}`}
            >
              {resource.equipmentLabel}
            </Link>
            <Link href={`/${locale}/news?format=infographic&topic=${resource.topic}`}>{topicLabel}</Link>
          </div>
          <div className={styles.help}>
            {en ? 'Have a load or process to discuss?' : '有具体工况需要核对？'}
            <WechatContactButton
              locale={locale}
              label={en ? 'Contact a Suneng engineer' : '联系苏能工程师'}
              trackingContext={{ properties: { position: 'infographic_sidebar', contact_purpose: 'sales' } }}
            />
          </div>
        </aside>
        <article className={styles.article}>
          <section id="intro" className={styles.articleHead}>
            <h1>{resource.title}</h1>
            <p className={styles.intro}>{resource.summary}</p>
          </section>
          <section id="graphic">
            <div className={styles.sectionHeading}>
              <h2>{en ? 'Illustrated guide' : '完整图解'}</h2>
            </div>
            {pages.map((page, index) => (
              <figure key={page.image}>
                <div className={styles.imageFrame}>
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={getInfographicImageSrcSet(page.image)}
                      sizes={graphicSizes}
                    />
                    <Image
                      src={page.image}
                      alt={page.imageAlt}
                      width={page.width}
                      height={page.height}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      unoptimized
                    />
                  </picture>
                </div>
              </figure>
            ))}
          </section>
          <section id="keypoints">
            <div className={styles.sectionHeading}>
              <h2>{en ? 'Equipment selection details' : '图中文字要点'}</h2>
            </div>
            <p className={styles.note}>
              {en ? 'The figures below apply to the loads and handling arrangements shown.' : '以下内容按图片及配套文案整理，保留原资料的项目范围和未注明事项。'}
            </p>
            <table>
              <caption className="sr-only">{en ? 'Equipment, handling options and application limits' : '图中设备参数、处理量及适用限定'}</caption>
              <thead>
                <tr>
                  <th scope="col">{en ? 'Requirement' : '信息项目'}</th>
                  <th scope="col">{en ? 'Equipment or action' : '图中内容'}</th>
                  <th scope="col">{en ? 'What to check' : '图中限定'}</th>
                </tr>
              </thead>
              <tbody>
                {resource.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.value}</td>
                    <td>{row.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resource.flows.length > 0 && (
              <dl className={styles.flowCopy}>
                {resource.flows.map((flow) => (
                  <div key={flow.title}>
                    <dt>{flow.title}</dt>
                    <dd>{flow.text}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className={styles.bodyCopy}>
              {resource.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {resource.sourceUrl && (
                <p>
                  <a href={resource.sourceUrl}>{resource.sourceNote}</a>
                </p>
              )}
              {resource.tags && <p>{resource.tags.map((tag) => `#${tag}`).join(' ')}</p>}
            </div>
          </section>
          <section id="conditions">
            <div className={styles.sectionHeading}>
              <h2>{en ? 'Application notes' : '适用说明'}</h2>
            </div>
            <ul className={styles.conditions}>
              {resource.conditions.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          <div className={styles.articleBottom}>
            <WechatContactButton
              locale={locale}
              label={en ? 'Discuss your project' : '咨询项目工况'}
              className={styles.inquiry}
              trackingContext={{ properties: { position: 'infographic_footer', contact_purpose: 'sales' } }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
