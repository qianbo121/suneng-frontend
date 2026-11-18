import Image from 'next/image';
import Link from 'next/link';
import {
  getInfographicImageSrcSet,
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

export function InfographicDetail({ resource }: { resource: InfographicResource }) {
  const topicLabel = getInfographicTopicLabel(resource);
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <ResourceDetailBreadcrumb contentType="infographic" />
      </div>
      <div className={styles.layout}>
        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <InfographicToc />
          </div>
          <div className={`${styles.sideBlock} ${styles.related}`}>
            <p className={styles.sideLabel}>相关主题</p>
            <Link
              href={`/zh/news?format=infographic&${resource.furnaces.length ? `furnace=${resource.furnaces[0]}` : `q=${encodeURIComponent(resource.equipmentLabel)}`}`}
            >
              {resource.equipmentLabel}
            </Link>
            <Link href={`/zh/news?format=infographic&topic=${resource.topic}`}>{topicLabel}</Link>
          </div>
          <div className={styles.help}>
            有具体工况需要核对？<Link href="/zh/contact">联系苏能工程师</Link>
          </div>
        </aside>
        <article className={styles.article}>
          <section id="intro" className={styles.articleHead}>
            <h1>{resource.title}</h1>
            <p className={styles.intro}>{resource.summary}</p>
          </section>
          <section id="graphic">
            <div className={styles.sectionHeading}>
              <h2>完整图解</h2>
            </div>
            <figure>
              <div className={styles.imageFrame}>
                <picture>
                  <source
                    type="image/webp"
                    srcSet={getInfographicImageSrcSet(resource.image)}
                    sizes={graphicSizes}
                  />
                  <Image
                    src={resource.image}
                    alt={resource.imageAlt}
                    width={1086}
                    height={1448}
                    loading="eager"
                    fetchPriority="high"
                    unoptimized
                  />
                </picture>
              </div>
            </figure>
          </section>
          <section id="keypoints">
            <div className={styles.sectionHeading}>
              <h2>图中文字要点</h2>
            </div>
            <p className={styles.note}>
              以下内容按图片及配套文案整理，保留原资料的项目范围和未注明事项。
            </p>
            <table>
              <caption className="sr-only">图中设备参数、处理量及适用限定</caption>
              <thead>
                <tr>
                  <th scope="col">信息项目</th>
                  <th scope="col">图中内容</th>
                  <th scope="col">图中限定</th>
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
            </div>
          </section>
          <section id="conditions">
            <div className={styles.sectionHeading}>
              <h2>适用说明</h2>
            </div>
            <ul className={styles.conditions}>
              {resource.conditions.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          <div className={styles.articleBottom}>
            <Link className={styles.inquiry} href="/zh/contact">
              咨询项目工况
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
