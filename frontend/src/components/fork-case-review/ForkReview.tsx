import { Fragment } from 'react';
import { getNewsDetailPageData } from '@/lib/news';
import { FiBarChart2, FiBox, FiShield, FiUsers } from 'react-icons/fi';
import { CaseContact, CaseHero, ProjectFeatures, ProjectFigures } from '@/components/agreement-cases/ProjectSections';
import { ProjectFlow } from '@/components/agreement-cases/ProjectFlow';
import { Faq } from '@/components/agreement-cases/Faq';
import styles from '@/components/agreement-cases/page.module.css';
import mesh from '@/components/case-studies/fastener-mesh-belt/page.module.css';
import { ReviewFigure } from './ReviewFigure';
import { getReviewSource, type ReviewCard } from './review-source';

function DetailCard({ card }: { card: ReviewCard }) {
  const { title, table } = card;
  const Icon = title.includes('验收') ? FiShield : title.includes('供货分工') ? FiUsers :
    title === '供货范围' ? FiBox : FiBarChart2;
  return <section>
    <h2><Icon aria-hidden />{title}</h2>
    {card.paragraphs.map(line => <p key={line}>{line}</p>)}
    {table && <table aria-label={title}>
      {table.head.length > 0 && <thead><tr>{table.head.map(head => <th key={head} scope="col">{head}</th>)}</tr></thead>}
      <tbody>{table.rows.map(([first, ...rest]) => <tr key={first}>
        {table.rowHeaders ? <th scope="row">{first}</th> : <td>{first}</td>}
        {rest.map((cell, i) => <td key={i}>{cell}</td>)}
      </tr>)}</tbody>
    </table>}
    {card.definitions.length > 0 && <dl>{card.definitions.map(([name, value]) => <Fragment key={name}>
      <dt>{name}</dt><dd>{value}</dd>
    </Fragment>)}</dl>}
  </section>;
}

export async function ForkReview({ slug, returnHref }: { slug: string; returnHref: string }) {
  const data = getReviewSource(slug);
  const related = await Promise.all(data.related.map(async ([name, href]) => {
    if (href.startsWith('/zh/news/')) {
      const { article } = await getNewsDetailPageData(href.slice('/zh/news/'.length));
      if (!article) return null;
    }
    return <a key={href} href={href}>{name}</a>;
  }));
  const hero = { ...data, locale: 'zh', heroAlt: data.imageAlt };
  const figures = { locale: 'zh', metrics: data.metrics, note: data.note, work: data.work.map(([k, v]) => k + '：' + v) };
  return <article data-project-case="" className={styles.page} data-agreement={slug}>
    <CaseHero data={hero} image={data.image} category={data.category} returnHref={returnHref} />
    <div className={'site-page-container ' + styles.content}>
      <ProjectFigures data={figures} compact={false} />
      <ProjectFeatures title={data.featuresTitle} features={data.features} />
      <section className={styles.section} id="process-flow">
        <h2>{data.flowTitle}</h2>
        <ProjectFlow tracked={data.tracked} steps={data.stages.map(step => step.title)} english={false} />
      </section>
      <div className={styles.cards}>{data.cards.map(card => <DetailCard key={card.title} card={card} />)}</div>
      <ReviewFigure figure={data.figure} />
      <nav className={mesh.related} aria-label="相关设备与资料">
        <strong>相关设备与资料</strong>
        {related}
      </nav>
      <Faq questions={data.faq} en={false} intro={data.faqIntro} />
      <p className={styles.source}>{data.source}</p>
      <CaseContact title={data.ctaTitle} />
    </div>
  </article>;
}
